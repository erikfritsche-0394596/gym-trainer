// ─── "Mein Gym hat das nicht": Markieren, Alternativen vorschlagen, Tauschen ─
// Geteilt zwischen player.js (mitten im Training) und plans.js (Plan-Editor,
// keine laufende Session) — daher arbeitet alles über einen kleinen `ctx`:
//   {mode:'session', ei}                          — laufende Trainingssession
//   {mode:'plan', planId, dayId, entryId}          — Plan-Editor, im Voraus
import { ic } from '../icons.js';
import { S, save, getPlan, getEx, findAlternatives, suggestFor } from '../state.js';
import { esc } from '../util.js';
import { openSheet, closeSheet, toast } from '../components.js';
import { refresh as refreshPlayer } from './player.js';
import { A } from '../actions.js';

function ctxLiteral(ctx) {
  return ctx.mode === 'session'
    ? `{mode:'session',ei:${ctx.ei}}`
    : `{mode:'plan',planId:'${ctx.planId}',dayId:'${ctx.dayId}',entryId:'${ctx.entryId}'}`;
}

function ctxExId(ctx) {
  if (ctx.mode === 'session') {
    const en = S.session && S.session.entries[ctx.ei];
    return en ? en.exId : null;
  }
  const p = getPlan(ctx.planId);
  const d = p && p.days.find(x => x.id === ctx.dayId);
  const en = d && d.entries.find(x => x.id === ctx.entryId);
  return en ? en.exId : null;
}

// ── Badge + Aktion, überall wo eine markierte Übung auftaucht ──
export function unavailableBadgeHTML(exId, ctx) {
  if (!S.settings.unavailableExercises.includes(exId)) return '';
  return `
    <div class="banner banner-warn">
      ${ic('alert_triangle')}
      <div><b>Nicht in deinem Gym verfügbar</b><p>Als „nicht verfügbar“ markiert</p></div>
    </div>
    <button class="btn btn-acc full sm" onclick="A.showAlternatives(${ctxLiteral(ctx)})">${ic('arrows_exchange')} Alternative anzeigen</button>`;
}

// ── Kontextueller Markieren-Button (solange eine Übung noch nicht markiert ist) ──
export function markButtonHTML(exId, ctx) {
  if (S.settings.unavailableExercises.includes(exId)) return '';
  return `<button class="iconbtn" onclick="A.toggleUnavailable('${exId}',${ctxLiteral(ctx)})" aria-label="Als nicht verfügbar markieren" title="Mein Gym hat das nicht">${ic('ban')}</button>`;
}

// Reine Zustandsänderung, ohne Neuzeichnen — Aufrufer entscheiden, was neu
// gerendert werden muss (Tab, Player oder eine offene Sheet-Liste).
export function toggleUnavailableExercise(exId) {
  const list = S.settings.unavailableExercises;
  const i = list.indexOf(exId);
  const turningOn = i < 0;
  if (turningOn) list.push(exId); else list.splice(i, 1);
  save();
  return turningOn;
}

// ── Markieren/entmarkieren, kontextuell direkt an der Übung (Player/Plan-Editor) —
// führt beim Markieren sofort in die Alternativen-Auswahl ──
A.toggleUnavailable = (exId, ctx) => {
  const turningOn = toggleUnavailableExercise(exId);
  const ex = getEx(exId);
  if (turningOn && ctx) {
    if (ctx.mode === 'session') refreshPlayer(); else A.rerender();
    A.showAlternatives(ctx);
  } else {
    A.rerender();
    toast(turningOn ? `${ex ? ex.n : 'Übung'} als nicht verfügbar markiert` : `${ex ? ex.n : 'Übung'} wieder verfügbar`);
  }
};

// ── Alternativen vorschlagen ──
A.showAlternatives = ctx => {
  const exId = ctxExId(ctx);
  if (!exId) return;
  if (ctx.mode === 'session') {
    const en = S.session.entries[ctx.ei];
    if (en.sets.some(s => s.done)) {
      toast('Erster Satz schon abgehakt — Wechsel nur vor dem ersten Satz möglich', 'info_circle');
      return;
    }
  }
  const ex = getEx(exId);
  const alts = findAlternatives(exId);
  openSheet({
    title: 'Alternative vorgeschlagen',
    body: alts.length
      ? `<p style="font-size:13px;color:var(--t2);margin-bottom:12px">Gleiche Zielmuskeln (${esc(ex.m[0])}), anderes Equipment:</p>` +
        alts.map(a => `
          <button class="row" onclick="A.pickAlternative(${ctxLiteral(ctx)},'${a.id}')">
            <div class="row-main"><div class="row-title">${esc(a.n)}</div><div class="row-sub">${esc(a.eq)}</div></div>
            ${ic('chevron_right')}
          </button>`).join('')
      : `<p style="font-size:13px;color:var(--t2)">Keine passende Alternative in der Bibliothek gefunden — wähle manuell eine andere Übung.</p>`,
  });
};

A.pickAlternative = (ctx, altExId) => {
  const alt = getEx(altExId);
  closeSheet();
  openSheet({
    title: alt.n,
    body: `
      <p style="font-size:13px;color:var(--t2);margin-bottom:16px">Wie soll getauscht werden?</p>
      <button class="btn full" onclick="A.applyAlternative(${ctxLiteral(ctx)},'${altExId}','once')">${ic('refresh')} Nur für dieses Mal</button>
      <div class="row-sub" style="margin:6px 2px 14px">Gerät ist gerade besetzt — nächstes Mal wieder die Original-Übung.</div>
      <button class="btn btn-acc full" onclick="A.applyAlternative(${ctxLiteral(ctx)},'${altExId}','permanent')">${ic('check')} Dauerhaft in diesem Plan ändern</button>
      <div class="row-sub" style="margin:6px 2px 0">Diese Übung/Maschine gibt es in deinem Gym gar nicht.</div>`,
  });
};

// ── Live-Session-Entry auf neue Übung umstellen (für 'once' und zusätzlich bei 'permanent') ──
function swapSessionEntry(ei, altExId) {
  const en = S.session.entries[ei];
  const alt = getEx(altExId);
  if (alt.t !== en.time) {
    en.rMin = alt.t ? 30 : 8;
    en.rMax = alt.t ? 30 : 12;
  }
  en.exId = altExId;
  en.name = alt.n;
  en.eq = alt.eq;
  en.bw = !!alt.bw;
  en.time = !!alt.t;
  const sug = suggestFor(altExId, { sets: en.sets.length, rMin: en.rMin, rMax: en.rMax });
  const startR = en.bw ? (sug.r || en.rMin) : en.rMin;
  en.sets = en.sets.map(() => ({ w: sug.w || 0, r: startR, done: false }));
}

A.applyAlternative = (ctx, altExId, scope) => {
  closeSheet();
  if (ctx.mode === 'session') {
    swapSessionEntry(ctx.ei, altExId);
    if (scope === 'permanent') {
      const p = getPlan(S.session.planId);
      const d = p && p.days.find(x => x.id === S.session.dayId);
      const en = d && d.entries.find(x => x.id === S.session.entries[ctx.ei].id);
      if (en) applyPermanent(en, altExId);
    }
    save();
    refreshPlayer();
    toast('Übung getauscht');
    return;
  }
  // ctx.mode === 'plan'
  if (scope === 'once') {
    S.tempSwaps[ctx.entryId] = altExId;
    save();
    toast('Für den nächsten Start dieses Tages vorgemerkt');
  } else {
    const p = getPlan(ctx.planId);
    const d = p.days.find(x => x.id === ctx.dayId);
    const en = d.entries.find(x => x.id === ctx.entryId);
    applyPermanent(en, altExId);
    save();
    toast('Plan dauerhaft geändert');
  }
  A.rerender();
};

function applyPermanent(entry, altExId) {
  const oldEx = getEx(entry.exId);
  const alt = getEx(altExId);
  if (!!(oldEx && oldEx.t) !== !!alt.t) {
    entry.rMin = alt.t ? 30 : 8;
    entry.rMax = alt.t ? 30 : 12;
  }
  entry.exId = altExId;
}
