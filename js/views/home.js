// ─── Heute: Heutiges Training, Schnellstart, Ziel, Schnell-Statistik ────────
import { ic } from '../icons.js';
import { S, save, activePlan, todaysDay, activeHomePlan, todaysHomeDay, getEx, calcStreak, totalWorkouts, suggestFor, logBodyWeight } from '../state.js';
import { DAYS_LONG, toISO, addDays, weekdayIdx, daysBetweenISO, todayISO, fmtDate, fmtKg, esc } from '../util.js';
import { openSheet, closeSheet, toast } from '../components.js';
import { A } from '../actions.js';
import * as player from './player.js';

let segment = 'gym'; // ephemer, nicht persistiert — analog zu `mode` in plans.js

export function render() {
  const el = document.getElementById('v-home');
  const html = [];

  // Erinnerung: Gewicht länger nicht erfasst
  const reminder = weightReminderHTML();
  if (reminder) html.push(reminder);

  const gymPlan = activePlan();
  const homePlan = activeHomePlan();
  if (segment === 'home' && !homePlan) segment = 'gym'; // kein Zuhause-Plan (mehr) vorhanden

  if (!S.session && (gymPlan || homePlan)) {
    html.push(segmentHTML());
  }

  const plan = segment === 'home' ? homePlan : gymPlan;
  const today = segment === 'home' ? todaysHomeDay() : todaysDay();

  // Laufendes Training fortsetzen
  if (S.session) {
    const done = S.session.entries.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);
    const total = S.session.entries.reduce((n, e) => n + e.sets.length, 0);
    html.push(`
      <div class="hero-card" style="border-color:var(--acc-text)">
        <div class="hero-eyebrow">Training läuft</div>
        <div class="hero-title">${esc(S.session.dayName)}</div>
        <div class="hero-meta">
          <span class="chip chip-acc">${ic('check')} ${done} / ${total} Sätze</span>
        </div>
        <button class="btn btn-acc full" onclick="A.resumeSession()">${ic('player_play')} Fortsetzen</button>
      </div>`);
  } else if (!plan) {
    html.push(segment === 'home' ? `
      <div class="empty">
        ${ic('home')}<br>
        Noch kein Zuhause-Plan.<br>Leg unter <b>Pläne</b> los – mit der Vorlage oder einem eigenen Plan.
        <div class="mt16"><button class="btn btn-acc" onclick="A.tab('plans')">Zu den Plänen</button></div>
      </div>` : `
      <div class="empty">
        ${ic('clipboard_list')}<br>
        Noch kein Trainingsplan aktiv.<br>Leg unter <b>Pläne</b> los – mit einer Vorlage oder einem eigenen Plan.
        <div class="mt16"><button class="btn btn-acc" onclick="A.tab('plans')">Zu den Plänen</button></div>
      </div>`);
  } else if (today) {
    html.push(heroCard(today, plan));
  } else if (segment === 'home') {
    html.push(`
      <div class="card rest-day">
        ${ic('home')}
        <p><b>Kein fester Zuhause-Tag heute.</b><br>Wähl unten direkt einen Tag zum Starten.</p>
      </div>`);
  } else {
    html.push(`
      <div class="card rest-day">
        ${ic('moon')}
        <p><b>Heute ist Ruhetag.</b><br>Erhol dich gut – Muskeln wachsen in der Pause.</p>
      </div>`);
  }

  // Andere Trainingstage des aktiven Plans (Schnellstart)
  // Häkchen = so oft wurde dieser Trainingstag diese Woche abgeschlossen –
  // egal an welchem Wochentag (Mittwoch-Training am Donnerstag zählt mit).
  if (plan && !S.session) {
    const monday = toISO(addDays(new Date(), -weekdayIdx()));
    const doneCount = d => S.logs.filter(l => l.dayId === d.id && l.date >= monday).length;
    const others = plan.days.filter(d => d !== today);
    if (others.length) {
      html.push(`<div class="slbl">Frei starten · ${esc(plan.name)}</div>`);
      html.push(others.map(d => {
        const n = doneCount(d);
        const checks = n > 0 ? `<span class="chip chip-acc" title="Diese Woche ${n}× absolviert">${'✓'.repeat(Math.min(n, 4))}</span>` : '';
        return `
        <button class="row" onclick="A.startDay('${plan.id}','${d.id}')">
          <div class="row-main">
            <div class="row-title">${esc(d.name)}</div>
            <div class="row-sub">${d.weekday != null ? DAYS_LONG[d.weekday] + ' · ' : ''}${d.entries.length} Übungen</div>
          </div>
          <div class="row-end">${checks}${ic('chevron_right')}</div>
        </button>`;
      }).join(''));
    }
  }

  // Ziel bis Halloween (oder frei gewähltes Datum)
  html.push(goalHTML());

  // Schnell-Statistik
  const streak = calcStreak();
  html.push(`
    <div class="slbl">Dein Stand</div>
    <div class="stat-grid">
      <div class="stat">
        <div class="stat-lbl">${ic('flame')} Streak</div>
        <div class="stat-val num">${streak}<small>Tage</small></div>
      </div>
      <div class="stat">
        <div class="stat-lbl">${ic('barbell')} Workouts</div>
        <div class="stat-val num">${totalWorkouts()}</div>
      </div>
    </div>`);

  el.innerHTML = html.join('');
}

function segmentHTML() {
  return `
    <div class="seg">
      <button class="${segment === 'gym' ? 'on' : ''}" onclick="A.homeSegment('gym')">${ic('barbell')} Gym</button>
      <button class="${segment === 'home' ? 'on' : ''}" onclick="A.homeSegment('home')">${ic('home')} Zuhause</button>
    </div>`;
}

A.homeSegment = seg => { segment = seg; render(); };

function heroCard(day, plan) {
  const list = day.entries.slice(0, 6).map(en => {
    const ex = getEx(en.exId);
    const sug = suggestFor(en.exId, en);
    const w = ex && ex.bw ? 'BW' : (sug.w > 0 ? fmtKg(sug.w) + ' kg' : '–');
    const warn = S.settings.unavailableExercises.includes(en.exId) ? ` ${ic('alert_triangle', 'sm')}` : '';
    return `<div class="hero-ex"><b>${esc(ex ? ex.n : en.exId)}</b>${warn}<span class="sets">${en.sets}×${en.rMin}${en.rMax !== en.rMin ? '–' + en.rMax : ''} · ${w}</span></div>`;
  }).join('');
  const more = day.entries.length > 6 ? `<div class="hero-ex t3">+ ${day.entries.length - 6} weitere</div>` : '';
  return `
    <div class="hero-card">
      <div class="hero-eyebrow">Heutiges Training · ${esc(plan.name)}</div>
      <div class="hero-title">${esc(day.name)}</div>
      <div class="hero-list">${list}${more}</div>
      <button class="btn btn-acc full" onclick="A.startDay('${plan.id}','${day.id}')">${ic('player_play')} Training starten</button>
    </div>`;
}

// ── Gewichts-Erinnerung ──
function weightReminderHTML() {
  const last = S.bodyLog[0];
  if (!last) {
    return `
      <div class="banner banner-warn">
        ${ic('alert_triangle')}
        <div><b>Noch kein Gewicht erfasst</b><p>Trag dein Startgewicht ein, um Fortschritt sichtbar zu machen.</p></div>
      </div>
      <button class="btn btn-acc full sm mt8" style="margin-bottom:12px" onclick="A.quickWeight()">${ic('weight')} Jetzt eintragen</button>`;
  }
  const days = daysBetweenISO(last.date, todayISO());
  if (days < 3) return '';
  return `
    <div class="banner banner-warn">
      ${ic('alert_triangle')}
      <div><b>Gewicht seit ${days} Tagen nicht erfasst</b><p>Letzter Eintrag: ${fmtDate(last.date)}</p></div>
    </div>
    <button class="btn btn-acc full sm mt8" style="margin-bottom:12px" onclick="A.quickWeight()">${ic('weight')} Jetzt eintragen</button>`;
}

A.quickWeight = () => {
  const last = S.bodyLog[0];
  openSheet({
    title: 'Gewicht eintragen',
    body: `
      <div class="field"><label>Heutiges Gewicht (kg)</label>
        <input class="inp" id="qw-val" type="number" inputmode="decimal" step="0.1" placeholder="75,0" value="${last ? last.weight : ''}"></div>
      <button class="btn btn-acc full" data-save>${ic('check')} Speichern</button>`,
    onOpen(sheet) {
      const inp = sheet.querySelector('#qw-val');
      inp.focus();
      sheet.querySelector('[data-save]').addEventListener('click', () => {
        const w = parseFloat(inp.value);
        if (!w) { toast('Bitte Gewicht eingeben', 'info_circle'); return; }
        logBodyWeight(w);
        closeSheet();
        render();
        toast('Gespeichert');
      });
    },
  });
};

// ── Ziel bis Halloween ──
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function goalHTML() {
  if (!S.goal) {
    return `
      <button class="card" style="width:100%;text-align:left;display:flex;align-items:center;gap:12px" onclick="A.goalSet()">
        ${ic('target')}
        <div class="grow"><div class="row-title">Ziel setzen</div><div class="row-sub">Zielgewicht + Datum, z. B. bis Halloween</div></div>
        ${ic('chevron_right')}
      </button>`;
  }
  const g = S.goal;
  const current = S.bodyLog[0] ? S.bodyLog[0].weight : g.startWeight;
  const span = g.startWeight - g.targetWeight;
  const pct = span !== 0 ? clamp01((g.startWeight - current) / span) : (current === g.targetWeight ? 1 : 0);
  const daysLeft = daysBetweenISO(todayISO(), g.targetDate);
  const C = 2 * Math.PI * 42;
  return `
    <div class="card">
      <div class="flex" style="margin-bottom:10px">
        <div class="hero-eyebrow" style="margin-bottom:0">Ziel</div>
        <div class="grow"></div>
        <button class="iconbtn" style="width:34px;height:34px;background:none;border:none" onclick="A.goalEdit()" aria-label="Ziel bearbeiten">${ic('pencil')}</button>
      </div>
      <div class="goal-ring-wrap">
        <div class="goal-ring">
          <svg viewBox="0 0 100 100" width="96" height="96">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--s2)" stroke-width="9"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--acc)" stroke-width="9" stroke-linecap="round"
              stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/>
          </svg>
          <div class="goal-ring-val"><b>${Math.round(pct * 100)}%</b><span>geschafft</span></div>
        </div>
        <div class="goal-stats grow">
          <div class="goal-stat-row"><span>Start</span><span>${fmtKg(g.startWeight)} kg</span></div>
          <div class="goal-stat-row"><span>Aktuell</span><span>${fmtKg(current)} kg</span></div>
          <div class="goal-stat-row"><span>Ziel</span><span>${fmtKg(g.targetWeight)} kg</span></div>
        </div>
      </div>
      <div class="row-sub" style="margin-top:10px">
        ${daysLeft > 0 ? `Noch <b style="color:var(--t1)">${daysLeft} Tage</b> bis zum ${fmtDate(g.targetDate)}` : 'Zieldatum erreicht'}
      </div>
    </div>`;
}

A.goalSet = () => goalSheet();
A.goalEdit = () => goalSheet(S.goal);

function suggestedTargetDate() {
  const y = new Date().getFullYear();
  const halloween = `${y}-10-31`;
  return halloween >= todayISO() ? halloween : '';
}

function goalSheet(existing) {
  const last = S.bodyLog[0];
  openSheet({
    title: existing ? 'Ziel bearbeiten' : 'Ziel setzen',
    body: `
      <div class="field"><label>Aktuelles Gewicht (kg)</label>
        <input class="inp" id="g-cur" type="number" inputmode="decimal" step="0.1" value="${existing ? existing.startWeight : (last ? last.weight : '')}"></div>
      <div class="field"><label>Zielgewicht (kg)</label>
        <input class="inp" id="g-target" type="number" inputmode="decimal" step="0.1" value="${existing ? existing.targetWeight : ''}"></div>
      <div class="field"><label>Zieldatum</label>
        <input class="inp" id="g-date" type="date" value="${existing ? existing.targetDate : suggestedTargetDate()}"></div>
      <button class="btn btn-acc full" data-save>${ic('check')} Speichern</button>
      ${existing ? `<button class="btn btn-danger full mt8" data-del>${ic('trash')} Ziel löschen</button>` : ''}`,
    onOpen(sheet) {
      sheet.querySelector('[data-save]').addEventListener('click', () => {
        const cur = parseFloat(sheet.querySelector('#g-cur').value);
        const target = parseFloat(sheet.querySelector('#g-target').value);
        const date = sheet.querySelector('#g-date').value;
        if (!cur || !target || !date) { toast('Bitte alle Felder ausfüllen', 'info_circle'); return; }
        logBodyWeight(cur);
        S.goal = { startWeight: cur, startDate: todayISO(), targetWeight: target, targetDate: date };
        save();
        closeSheet();
        render();
        toast('Ziel gespeichert');
      });
      const delBtn = sheet.querySelector('[data-del]');
      if (delBtn) delBtn.addEventListener('click', () => {
        S.goal = null;
        save();
        closeSheet();
        render();
        toast('Ziel gelöscht');
      });
    },
  });
}

// ── Aktionen ──
A.startDay = (planId, dayId) => player.start(planId, dayId);
A.resumeSession = () => player.resume();
