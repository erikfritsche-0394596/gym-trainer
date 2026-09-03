// ─── Ernährung: Heute, Wochenplan (mehrwöchig), Einkaufsliste, Rezepte, Lebensmittel ─
import { ic } from '../icons.js';
import {
  S, save, getFood, getRecipe, recipeMacros, entryMacros,
  weekDayFor, ensureWeek, dayEntries, dayMacros, toggleEaten, removeEntry,
  weekShoppingList, recipeCookPlan, plannedWeeks,
} from '../state.js';
import {
  MEAL_SLOTS, DAYS, DAYS_LONG, todayISO, daysBetweenISO, weekStartISO,
  toISO, fromISO, addDays, fmtDate, fmtKg, esc, uid,
} from '../util.js';
import { openSheet, closeSheet, toast, confirmSheet } from '../components.js';
import { A } from '../actions.js';

let panel = 'heute'; // ephemer: 'heute' | 'woche' | 'einkaufen'
let currentWeekStart = weekStartISO(todayISO()); // ephemer, welche Woche im "Woche"-Panel angezeigt wird
let expandedWeeks = null; // ephemer, Set der aufgeklappten Wochen im "Einkaufen"-Akkordeon (lazy init)

export function render() {
  const el = document.getElementById('v-nutrition');
  const html = [`
    <div class="seg">
      <button class="${panel === 'heute' ? 'on' : ''}" onclick="A.nutPanel('heute')">${ic('barbell')} Heute</button>
      <button class="${panel === 'woche' ? 'on' : ''}" onclick="A.nutPanel('woche')">${ic('calendar')} Woche</button>
      <button class="${panel === 'einkaufen' ? 'on' : ''}" onclick="A.nutPanel('einkaufen')">${ic('clipboard_list')} Einkaufen</button>
    </div>`];
  if (panel === 'heute') html.push(heutePanelHTML());
  else if (panel === 'woche') html.push(wochePanelHTML());
  else html.push(einkaufenPanelHTML());
  el.innerHTML = html.join('');
}

A.nutPanel = p => { panel = p; render(); };

// ─── Makro-Ring ──────────────────────────────────────────────────────────────
function mringHTML(val, target, color, label, unit) {
  const pct = target ? Math.max(0, Math.min(1, val / target)) : 0;
  const C = 2 * Math.PI * 18;
  const off = (C * (1 - pct)).toFixed(1);
  return `
    <div class="mring">
      <svg viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--s2)" stroke-width="5"/>
        <circle cx="22" cy="22" r="18" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"
          style="transform:rotate(-90deg);transform-origin:50% 50%" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off}"/>
      </svg>
      <b>${Math.round(val)}${unit}</b><span>${label}</span>
    </div>`;
}

// ─── Heute ───────────────────────────────────────────────────────────────────
// Liest live aus der aktuellen Woche (kein Snapshot mehr) — Änderungen am
// Wochenplan erscheinen sofort, auch wenn "Heute" vorher schon angesehen wurde.
function heutePanelHTML() {
  const today = todayISO();
  const t = S.nutrition.targets;
  const html = [];

  if (!t.kcal) {
    html.push(`
      <button class="card" style="width:100%;text-align:left;display:flex;align-items:center;gap:12px" onclick="A.nutTargetsSheet()">
        ${ic('target')}
        <div class="grow"><div class="row-title">Ziel setzen</div><div class="row-sub">Kalorien- &amp; Makro-Ziel festlegen</div></div>
        ${ic('chevron_right')}
      </button>`);
  } else {
    const eaten = dayMacros(today, { onlyEaten: true });
    html.push(`
      <div class="card">
        <div class="mring-row">
          ${mringHTML(eaten.kcal, t.kcal, 'var(--acc)', 'kcal', '')}
          ${mringHTML(eaten.protein, t.protein, '#7a9cff', 'Protein', 'g')}
          ${mringHTML(eaten.carbs, t.carbs, '#f5b942', 'Carbs', 'g')}
          ${mringHTML(eaten.fat, t.fat, '#f27d70', 'Fett', 'g')}
        </div>
        <div class="flex" style="margin-top:6px">
          <div class="row-sub grow">Ziel: ${t.kcal} kcal · ${t.protein}P / ${t.carbs}C / ${t.fat}F</div>
          <button class="iconbtn" style="width:32px;height:32px;background:none;border:none" onclick="A.nutTargetsSheet()" aria-label="Ziel bearbeiten">${ic('pencil')}</button>
        </div>
      </div>`);
  }

  const entries = dayEntries(today);
  MEAL_SLOTS.forEach(slot => {
    const slotEntries = entries.filter(e => e.slotKey === slot.key);
    html.push(`<div class="slot-lbl">${slot.label}</div>`);
    html.push(slotEntries.length
      ? slotEntries.map(e => mealRowHTML(e)).join('')
      : `<div class="row-sub" style="margin-bottom:8px">Nichts geplant</div>`);
  });
  const extraEntries = entries.filter(e => e.slotKey === 'extra');
  if (extraEntries.length) {
    html.push(`<div class="slot-lbl">Sonstiges</div>`);
    html.push(extraEntries.map(e => mealRowHTML(e)).join(''));
  }
  html.push(`<button class="btn btn-ghost full" style="margin-top:8px" onclick="A.nutAddAdhoc()">${ic('plus')} Spontan hinzufügen</button>`);
  return html.join('');
}

function mealRowHTML(entry) {
  const ref = entry.type === 'recipe' ? getRecipe(entry.refId) : getFood(entry.refId);
  const m = entryMacros(entry);
  const nameHTML = ref ? esc(ref.name) : '<span class="chip chip-danger">Gelöscht</span>';
  return `
    <div class="meal-row${entry.eaten ? ' checked' : ''}" onclick="A.nutToggleEaten('${entry.id}')">
      <div class="meal-check">${ic('check')}</div>
      <div class="meal-main"><div class="meal-name">${nameHTML}</div><div class="meal-macro">${Math.round(m.protein)}P / ${Math.round(m.carbs)}C / ${Math.round(m.fat)}F</div></div>
      <div class="meal-kcal">${Math.round(m.kcal)}</div>
      <button class="iconbtn" style="width:28px;height:28px;background:none;border:none;flex-shrink:0" onclick="event.stopPropagation();A.nutRemoveEntry('${entry.slotKey}','${entry.id}')" aria-label="Entfernen">${ic('x')}</button>
    </div>`;
}

A.nutToggleEaten = entryId => {
  toggleEaten(todayISO(), entryId);
  save();
  render();
};

A.nutRemoveEntry = (slotKey, entryId) => {
  removeEntry(todayISO(), slotKey, entryId);
  save();
  render();
};

A.nutAddAdhoc = () => {
  openEntryPicker(entry => {
    const today = todayISO();
    const list = S.nutrition.extra[today] || (S.nutrition.extra[today] = []);
    list.push({ id: uid(), ...entry });
    save();
    render();
    toast('Hinzugefügt');
  });
};

// ─── Woche ───────────────────────────────────────────────────────────────────
function weekRangeLabel(ws) {
  return `${fmtDate(ws)} – ${fmtDate(toISO(addDays(fromISO(ws), 6)))}`;
}

function wochePanelHTML() {
  const ws = currentWeekStart;
  const isCurrentWeek = ws === weekStartISO(todayISO());
  const html = [];

  html.push(`
    <div class="flex" style="margin-bottom:10px">
      <button class="iconbtn" style="width:38px;height:38px" onclick="A.nutWeekNav(-1)" aria-label="Vorherige Woche">${ic('chevron_left')}</button>
      <div class="grow tc">
        <div class="row-title">${weekRangeLabel(ws)}</div>
        ${isCurrentWeek ? '<span class="chip chip-acc">Diese Woche</span>' : ''}
      </div>
      <button class="iconbtn" style="width:38px;height:38px" onclick="A.nutWeekNav(1)" aria-label="Nächste Woche">${ic('chevron_right')}</button>
    </div>`);
  if (!isCurrentWeek) {
    html.push(`<button class="btn btn-ghost full sm" style="margin-bottom:10px" onclick="A.nutWeekJumpToday()">${ic('calendar')} Zu dieser Woche</button>`);
  }

  html.push(`<div class="slbl">Geplant</div>`);
  html.push(`<div class="wk-grid">${DAYS.map((label, wd) => {
    const day = weekDayFor(ws, wd);
    const filled = MEAL_SLOTS.reduce((n, s) => n + (day.slots[s.key].length ? 1 : 0), 0);
    const dots = Array.from({ length: Math.max(filled, 1) }).map(() => '<span></span>').join('');
    return `<div class="wk-day${filled ? ' full' : ''}"><div class="wk-day-lbl">${label}</div><div class="wk-day-dots">${dots}</div></div>`;
  }).join('')}</div>`);
  html.push(`<button class="btn full" onclick="A.nutEditWeek('${ws}')">${ic('pencil')} Wochenplan bearbeiten</button>`);
  html.push(`<button class="btn btn-ghost full mt8" onclick="A.nutCopyWeekForward('${ws}')">${ic('copy')} In Folgewoche kopieren</button>`);

  const cookPlan = recipeCookPlan(ws);
  html.push(`<div class="slbl">Diese Woche kochen</div>`);
  if (!cookPlan.length) {
    html.push(`<div class="row-sub" style="margin-bottom:8px">Noch keine Rezepte im Wochenplan (oder alle als „täglich frisch" markiert).</div>`);
  } else {
    cookPlan.forEach(c => {
      const prepped = !!S.nutrition.prepped[c.recipeId];
      const rest = c.yieldServings > c.needed ? `, ${c.yieldServings - c.needed} übrig` : '';
      html.push(`
        <div class="cook-row">
          <div class="cook-head">
            <button class="cook-name" onclick="A.nutRecipeForm('${c.recipeId}')">${esc(c.name)}</button>
            <span class="chip chip-acc">${c.needed}× geplant</span>
          </div>
          <div class="cook-sub">→ ${c.batches}× kochen (ergibt ${c.yieldServings} Portionen${rest})</div>
          <button class="cook-prepped${prepped ? ' on' : ''}" onclick="A.nutTogglePrepped('${c.recipeId}')"><div class="box">${ic('check')}</div>Vorbereitet</button>
        </div>`);
    });
  }

  html.push(`<div class="slbl">Verwalten</div>`);
  html.push(`<button class="row" onclick="A.nutRecipesManage()"><div class="row-main"><div class="row-title">Rezepte verwalten</div><div class="row-sub">${S.nutrition.recipes.length} Rezepte</div></div>${ic('chevron_right')}</button>`);
  html.push(`<button class="row" onclick="A.nutFoodsManage()"><div class="row-main"><div class="row-title">Lebensmittel verwalten</div><div class="row-sub">${S.nutrition.foods.length} Lebensmittel</div></div>${ic('chevron_right')}</button>`);
  return html.join('');
}

A.nutWeekNav = delta => { currentWeekStart = toISO(addDays(fromISO(currentWeekStart), delta * 7)); render(); };
A.nutWeekJumpToday = () => { currentWeekStart = weekStartISO(todayISO()); render(); };

A.nutTogglePrepped = recipeId => {
  S.nutrition.prepped[recipeId] = !S.nutrition.prepped[recipeId];
  save();
  render();
};

function weekEntryCount(ws) {
  const week = S.nutrition.weeks[ws];
  if (!week) return 0;
  return week.days.reduce((n, d) => n + MEAL_SLOTS.reduce((m, s) => m + d.slots[s.key].length, 0), 0);
}

A.nutCopyWeekForward = async ws => {
  const targetWs = toISO(addDays(fromISO(ws), 7));
  if (weekEntryCount(targetWs) > 0) {
    if (!(await confirmSheet('Folgewoche hat bereits Einträge', 'Die kopierten Gerichte werden ergänzt, nicht überschrieben. Trotzdem fortfahren?', 'Kopieren'))) return;
  }
  const srcWeek = ensureWeek(ws);
  const targetWeek = ensureWeek(targetWs);
  srcWeek.days.forEach(srcDay => {
    const tgtDay = targetWeek.days.find(d => d.weekday === srcDay.weekday);
    MEAL_SLOTS.forEach(s => {
      srcDay.slots[s.key].forEach(e => tgtDay.slots[s.key].push({ ...e, id: uid() }));
    });
  });
  save();
  currentWeekStart = targetWs;
  render();
  toast('Woche kopiert');
};

// ── Wochenplan-Editor: Tage-Liste → Tag-Detail mit 5 Slots ──
A.nutEditWeek = ws => {
  openSheet({
    title: `Wochenplan · ${weekRangeLabel(ws)}`,
    body: DAYS_LONG.map((label, wd) => {
      const day = weekDayFor(ws, wd);
      const filled = MEAL_SLOTS.reduce((n, s) => n + day.slots[s.key].length, 0);
      return `<button class="row" onclick="A.nutOpenDay('${ws}',${wd})"><div class="row-main"><div class="row-title">${label}</div><div class="row-sub">${filled} Einträge</div></div>${ic('chevron_right')}</button>`;
    }).join(''),
  });
};

A.nutOpenDay = (ws, wd) => {
  const day = weekDayFor(ws, wd);
  openSheet({
    title: DAYS_LONG[wd],
    body: MEAL_SLOTS.map(slot => {
      const entries = day.slots[slot.key];
      const rows = entries.map(e => planEntryRowHTML(e, ws, wd, slot.key)).join('')
        || `<div class="row-sub" style="margin-bottom:6px">Nichts geplant</div>`;
      return `
        <div class="slbl">${slot.label}</div>
        ${rows}
        <button class="btn btn-ghost full sm" style="margin-bottom:8px" onclick="A.nutSlotAdd('${ws}',${wd},'${slot.key}')">${ic('plus')} Hinzufügen</button>`;
    }).join(''),
  });
};

function planEntryRowHTML(entry, ws, wd, slotKey) {
  const ref = entry.type === 'recipe' ? getRecipe(entry.refId) : getFood(entry.refId);
  const nameHTML = ref ? esc(ref.name) : '<span class="chip chip-danger">Gelöscht</span>';
  const amountLbl = entry.type === 'recipe' ? `${entry.amount}× Portion` : `${entry.amount}${ref && ref.unit === 'stück' ? ' Stück' : 'g'}`;
  return `
    <div class="entry-row">
      <div class="entry-main"><div class="entry-name">${nameHTML}</div><div class="entry-sub">${amountLbl}</div></div>
      <div class="entry-actions"><button class="iconbtn" onclick="A.nutSlotRemove('${ws}',${wd},'${slotKey}','${entry.id}')" aria-label="Entfernen">${ic('trash')}</button></div>
    </div>`;
}

A.nutSlotAdd = (ws, wd, slotKey) => {
  openEntryPicker(entry => {
    const week = ensureWeek(ws);
    const day = week.days.find(d => d.weekday === wd);
    day.slots[slotKey].push({ id: uid(), ...entry });
    save();
    A.nutOpenDay(ws, wd);
    toast('Hinzugefügt');
  });
};

A.nutSlotRemove = (ws, wd, slotKey, entryId) => {
  const week = ensureWeek(ws);
  const day = week.days.find(d => d.weekday === wd);
  day.slots[slotKey] = day.slots[slotKey].filter(e => e.id !== entryId);
  save();
  A.nutOpenDay(ws, wd);
};

// ── Gemeinsamer Rezept-oder-Lebensmittel-Picker ──
let pickCallback = null;

function openEntryPicker(onPick) {
  pickCallback = onPick;
  const recipes = S.nutrition.recipes;
  openSheet({
    title: 'Hinzufügen',
    body: `
      ${recipes.length ? `<div class="slbl">Rezepte</div>` + recipes.map(r => {
        const m = recipeMacros(r);
        return `<button class="row" onclick="A.nutPick('recipe','${r.id}')"><div class="row-main"><div class="row-title">${esc(r.name)}</div><div class="row-sub">${Math.round(m.kcal)} kcal / Portion</div></div>${ic('plus')}</button>`;
      }).join('') : ''}
      <div class="slbl">Lebensmittel</div>
      <div class="search-wrap">${ic('search')}<input class="inp" id="nut-pick-q" placeholder="Suchen …" autocomplete="off"></div>
      <div id="nut-pick-foods"></div>`,
    onOpen(sheet) {
      const renderFoods = () => {
        const q = (sheet.querySelector('#nut-pick-q').value || '').toLowerCase();
        const list = S.nutrition.foods.filter(f => f.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
        sheet.querySelector('#nut-pick-foods').innerHTML = list.map(f => `
          <button class="lib-item" onclick="A.nutPick('food','${f.id}')">
            <div class="grow"><div class="lib-name">${esc(f.name)}</div><div class="lib-sub">${f.kcal100} kcal / ${f.unit === 'stück' ? 'Stück' : '100g'}</div></div>
            ${ic('plus')}
          </button>`).join('');
      };
      sheet.querySelector('#nut-pick-q').addEventListener('input', renderFoods);
      renderFoods();
    },
  });
}

A.nutPick = (type, refId) => {
  const cb = pickCallback;
  pickCallback = null;
  closeSheet();
  if (!cb) return;
  const ref = type === 'recipe' ? getRecipe(refId) : getFood(refId);
  const amount = type === 'recipe' ? 1 : (ref && ref.unit === 'stück' ? 1 : 100);
  cb({ type, refId, amount });
};

// ─── Rezepte verwalten ───────────────────────────────────────────────────────
A.nutRecipesManage = () => {
  openSheet({
    title: 'Rezepte',
    body: `
      <button class="btn btn-acc full" style="margin-bottom:10px" onclick="A.nutRecipeForm(null)">${ic('plus')} Neues Rezept</button>
      ${S.nutrition.recipes.length ? S.nutrition.recipes.map(r => {
        const m = recipeMacros(r);
        return `<button class="row" onclick="A.nutRecipeForm('${r.id}')"><div class="row-main"><div class="row-title">${esc(r.name)}${r.freshDaily ? ' <span class="chip chip-line">Täglich frisch</span>' : ''}</div><div class="row-sub">${Math.round(m.kcal)} kcal / Portion · ${r.servings} Portionen</div></div>${ic('chevron_right')}</button>`;
      }).join('') : `<div class="row-sub">Noch keine Rezepte.</div>`}`,
  });
};

let recipeDraft = null;

A.nutRecipeForm = id => {
  const existing = id ? getRecipe(id) : null;
  recipeDraft = existing
    ? { name: existing.name, servings: existing.servings, ingredients: existing.ingredients.map(i => ({ ...i })), instructions: existing.instructions || '', freshDaily: !!existing.freshDaily }
    : { name: '', servings: 4, ingredients: [], instructions: '', freshDaily: false };
  openRecipeFormSheet(existing);
};

// Öffnet das Sheet mit dem AKTUELLEN recipeDraft (ohne ihn zurückzusetzen) —
// nötig, um nach der Inline-Schnellanlage eines Lebensmittels (eigenes Sheet,
// ersetzt das Rezept-Sheet im DOM) den bisherigen Bearbeitungsstand zu behalten.
function openRecipeFormSheet(existing) {
  openSheet({
    title: existing ? 'Rezept bearbeiten' : 'Neues Rezept',
    body: `
      <div class="field"><label>Name</label><input class="inp" id="rf-name" value="${esc(recipeDraft.name)}" placeholder="z. B. Hähnchen-Reis-Bowl"></div>
      <div class="mstp-row"><span class="mstp-lbl">Portionen</span>
        <div class="mstp"><button data-serv-dec>${ic('minus')}</button><b id="rf-servings">${recipeDraft.servings}</b><button data-serv-inc>${ic('plus')}</button></div>
      </div>
      <div class="mstp-row">
        <span class="mstp-lbl">Wird jeden Tag frisch gemacht</span>
        <button class="switch${recipeDraft.freshDaily ? ' on' : ''}" id="rf-fresh" role="switch" aria-checked="${recipeDraft.freshDaily}"></button>
      </div>
      <div class="row-sub" style="margin:-4px 0 12px">Erscheint dann nicht mehr unter „Diese Woche kochen" (Zutaten bleiben aber auf der Einkaufsliste).</div>
      <div class="card" style="text-align:center" id="rf-total"></div>
      <div class="slbl">Zutaten</div>
      <div id="rf-ing-list"></div>
      <button class="btn btn-ghost full" id="rf-add-ing">${ic('plus')} Zutat hinzufügen</button>
      <div id="rf-pick-list" style="max-height:0;overflow:hidden;transition:max-height .3s ease"></div>
      <div class="field" style="margin-top:14px"><label>Zubereitung (optional)</label>
        <textarea class="inp" id="rf-instructions" rows="4" style="min-height:90px;padding:12px" placeholder="Schritt für Schritt …">${esc(recipeDraft.instructions)}</textarea></div>
      <button class="btn btn-acc full" style="margin-top:6px" id="rf-save">${ic('check')} Speichern</button>
      ${existing ? `<button class="btn btn-danger full mt8" id="rf-delete">${ic('trash')} Rezept löschen</button>` : ''}`,
    onOpen(sheet) { wireRecipeForm(sheet, existing); },
  });
}

function renderRecipeDraft(sheet) {
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const rows = recipeDraft.ingredients.map((ing, i) => {
    const food = getFood(ing.foodId);
    if (!food) return '';
    const factor = food.unit === 'stück' ? ing.amount : ing.amount / 100;
    totals.kcal += food.kcal100 * factor;
    totals.protein += food.protein100 * factor;
    totals.carbs += food.carbs100 * factor;
    totals.fat += food.fat100 * factor;
    const step = food.unit === 'stück' ? 1 : 10;
    return `
      <div class="ing-row">
        <div class="ing-main"><div class="ing-name">${esc(food.name)}</div><div class="ing-macro">${Math.round(food.kcal100 * factor)} kcal</div></div>
        <div class="ing-stp">
          <button data-ding="${i}" data-delta="${-step}">${ic('minus')}</button>
          <b>${ing.amount}${food.unit === 'stück' ? '' : 'g'}</b>
          <button data-ding="${i}" data-delta="${step}">${ic('plus')}</button>
        </div>
        <button class="ing-rm" data-rming="${i}" aria-label="Entfernen">${ic('x')}</button>
      </div>`;
  }).join('');
  sheet.querySelector('#rf-ing-list').innerHTML = rows;

  const s = recipeDraft.servings || 1;
  sheet.querySelector('#rf-total').innerHTML = `
    <span class="num" style="font-size:24px">${Math.round(totals.kcal / s)}</span><div class="row-sub">kcal / Portion</div>
    <div class="flex" style="justify-content:center;gap:16px;margin-top:6px">
      <div><b>${Math.round(totals.protein / s)}g</b><div class="row-sub">Protein</div></div>
      <div><b>${Math.round(totals.carbs / s)}g</b><div class="row-sub">Carbs</div></div>
      <div><b>${Math.round(totals.fat / s)}g</b><div class="row-sub">Fett</div></div>
    </div>`;
  sheet.querySelector('#rf-servings').textContent = recipeDraft.servings;

  sheet.querySelectorAll('[data-ding]').forEach(btn => btn.addEventListener('click', () => {
    const i = +btn.dataset.ding, delta = +btn.dataset.delta;
    recipeDraft.ingredients[i].amount = Math.max(0, recipeDraft.ingredients[i].amount + delta);
    renderRecipeDraft(sheet);
  }));
  sheet.querySelectorAll('[data-rming]').forEach(btn => btn.addEventListener('click', () => {
    recipeDraft.ingredients.splice(+btn.dataset.rming, 1);
    renderRecipeDraft(sheet);
  }));
}

function wireRecipeForm(sheet, existing) {
  renderRecipeDraft(sheet);

  sheet.querySelector('#rf-name').addEventListener('input', e => { recipeDraft.name = e.target.value; });
  sheet.querySelector('#rf-instructions').addEventListener('input', e => { recipeDraft.instructions = e.target.value; });
  sheet.querySelector('#rf-fresh').addEventListener('click', () => {
    recipeDraft.freshDaily = !recipeDraft.freshDaily;
    const btn = sheet.querySelector('#rf-fresh');
    btn.classList.toggle('on', recipeDraft.freshDaily);
    btn.setAttribute('aria-checked', recipeDraft.freshDaily);
  });
  sheet.querySelector('[data-serv-inc]').addEventListener('click', () => { recipeDraft.servings++; renderRecipeDraft(sheet); });
  sheet.querySelector('[data-serv-dec]').addEventListener('click', () => { recipeDraft.servings = Math.max(1, recipeDraft.servings - 1); renderRecipeDraft(sheet); });

  sheet.querySelector('#rf-add-ing').addEventListener('click', () => {
    const pick = sheet.querySelector('#rf-pick-list');
    const isOpen = pick.classList.contains('show');
    pick.classList.toggle('show', !isOpen);
    pick.style.maxHeight = isOpen ? '0' : '400px';
    if (isOpen) return;
    pick.innerHTML = `
      <div class="search-wrap" style="margin-top:8px">${ic('search')}<input class="inp" id="rf-pick-q" placeholder="Lebensmittel suchen …"></div>
      <div id="rf-pick-items"></div>
      <button class="btn btn-ghost full sm" id="rf-pick-new">${ic('plus')} Neues Lebensmittel</button>`;
    const renderItems = () => {
      const q = (pick.querySelector('#rf-pick-q').value || '').toLowerCase();
      pick.querySelector('#rf-pick-items').innerHTML = S.nutrition.foods
        .filter(f => f.name.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(f => `<button class="lib-item" data-addfood="${f.id}"><div class="grow"><div class="lib-name">${esc(f.name)}</div><div class="lib-sub">${f.kcal100} kcal / ${f.unit === 'stück' ? 'Stück' : '100g'}</div></div>${ic('plus')}</button>`).join('');
      pick.querySelectorAll('[data-addfood]').forEach(btn => btn.addEventListener('click', () => {
        const food = getFood(btn.dataset.addfood);
        recipeDraft.ingredients.push({ foodId: food.id, amount: food.unit === 'stück' ? 1 : 100 });
        pick.classList.remove('show');
        pick.style.maxHeight = '0';
        renderRecipeDraft(sheet);
      }));
    };
    pick.querySelector('#rf-pick-q').addEventListener('input', renderItems);
    pick.querySelector('#rf-pick-new').addEventListener('click', () => {
      openFoodForm(null, food => {
        recipeDraft.ingredients.push({ foodId: food.id, amount: food.unit === 'stück' ? 1 : 100 });
        openRecipeFormSheet(existing);
      });
    });
    renderItems();
  });

  sheet.querySelector('#rf-save').addEventListener('click', () => {
    const name = sheet.querySelector('#rf-name').value.trim();
    if (!name) { toast('Bitte Namen eingeben', 'info_circle'); return; }
    if (!recipeDraft.ingredients.length) { toast('Bitte mindestens eine Zutat hinzufügen', 'info_circle'); return; }
    const data = { name, servings: recipeDraft.servings, ingredients: recipeDraft.ingredients, instructions: recipeDraft.instructions.trim(), freshDaily: recipeDraft.freshDaily };
    if (existing) Object.assign(existing, data);
    else S.nutrition.recipes.push({ id: uid(), ...data });
    save();
    closeSheet();
    A.nutRecipesManage();
    toast('Rezept gespeichert');
  });

  const delBtn = sheet.querySelector('#rf-delete');
  if (delBtn) delBtn.addEventListener('click', async () => {
    closeSheet();
    if (!(await confirmSheet('Rezept löschen?', `„${esc(existing.name)}" wird entfernt. Verweise im Wochenplan zeigen danach „Gelöscht" an.`, 'Löschen'))) { A.nutRecipeForm(existing.id); return; }
    S.nutrition.recipes = S.nutrition.recipes.filter(r => r.id !== existing.id);
    save();
    A.nutRecipesManage();
  });
}

// ─── Lebensmittel verwalten ──────────────────────────────────────────────────
A.nutFoodsManage = () => {
  openSheet({
    title: 'Lebensmittel',
    body: `
      <button class="btn btn-acc full" style="margin-bottom:10px" onclick="A.nutFoodForm(null)">${ic('plus')} Neues Lebensmittel</button>
      ${S.nutrition.foods.slice().sort((a, b) => a.name.localeCompare(b.name)).map(f => `
        <button class="row" onclick="A.nutFoodForm('${f.id}')"><div class="row-main"><div class="row-title">${esc(f.name)}</div><div class="row-sub">${f.kcal100} kcal / ${f.unit === 'stück' ? 'Stück' : '100g'}</div></div>${ic('chevron_right')}</button>`).join('')}`,
  });
};

A.nutFoodForm = id => openFoodForm(id ? getFood(id) : null, () => A.nutFoodsManage());

function openFoodForm(existing, onSave) {
  openSheet({
    title: existing ? 'Lebensmittel bearbeiten' : 'Neues Lebensmittel',
    body: `
      <div class="field"><label>Name</label><input class="inp" id="ff-name" value="${existing ? esc(existing.name) : ''}" placeholder="z. B. Quinoa"></div>
      <div class="field"><label>Einheit</label>
        <select class="inp" id="ff-unit">
          <option value="g" ${existing && existing.unit === 'g' ? 'selected' : ''}>Gramm (Werte je 100 g)</option>
          <option value="stück" ${existing && existing.unit === 'stück' ? 'selected' : ''}>Stück (Werte je 1 Stück)</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field"><label>Kalorien</label><input class="inp" id="ff-kcal" type="number" value="${existing ? existing.kcal100 : ''}"></div>
        <div class="field"><label>Protein (g)</label><input class="inp" id="ff-p" type="number" step="0.1" value="${existing ? existing.protein100 : ''}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Carbs (g)</label><input class="inp" id="ff-c" type="number" step="0.1" value="${existing ? existing.carbs100 : ''}"></div>
        <div class="field"><label>Fett (g)</label><input class="inp" id="ff-f" type="number" step="0.1" value="${existing ? existing.fat100 : ''}"></div>
      </div>
      <button class="btn btn-acc full" id="ff-save">${ic('check')} Speichern</button>
      ${existing ? `<button class="btn btn-danger full mt8" id="ff-delete">${ic('trash')} Lebensmittel löschen</button>` : ''}`,
    onOpen(sheet) {
      sheet.querySelector('#ff-save').addEventListener('click', () => {
        const name = sheet.querySelector('#ff-name').value.trim();
        if (!name) { toast('Bitte Namen eingeben', 'info_circle'); return; }
        const data = {
          name,
          unit: sheet.querySelector('#ff-unit').value,
          kcal100: parseFloat(sheet.querySelector('#ff-kcal').value) || 0,
          protein100: parseFloat(sheet.querySelector('#ff-p').value) || 0,
          carbs100: parseFloat(sheet.querySelector('#ff-c').value) || 0,
          fat100: parseFloat(sheet.querySelector('#ff-f').value) || 0,
        };
        let food;
        if (existing) { Object.assign(existing, data); food = existing; }
        else { food = { id: uid(), custom: true, ...data }; S.nutrition.foods.push(food); }
        save();
        closeSheet();
        toast('Gespeichert');
        if (onSave) onSave(food);
      });
      const delBtn = sheet.querySelector('#ff-delete');
      if (delBtn) delBtn.addEventListener('click', async () => {
        closeSheet();
        if (!(await confirmSheet('Lebensmittel löschen?', `„${esc(existing.name)}" wird entfernt. Rezepte, die es verwenden, zeigen danach „Gelöscht" an.`, 'Löschen'))) { A.nutFoodForm(existing.id); return; }
        S.nutrition.foods = S.nutrition.foods.filter(f => f.id !== existing.id);
        save();
        A.nutFoodsManage();
      });
    },
  });
}

// ─── Einkaufen (Akkordeon: eine Sektion pro geplanter Woche) ────────────────
function einkaufenPanelHTML() {
  const weeks = plannedWeeks();
  if (expandedWeeks === null) expandedWeeks = new Set(weeks.length ? [weeks[0]] : []);
  if (!weeks.length) {
    return `<div class="empty">${ic('clipboard_list')}<br>Noch nichts geplant.<br>Leg im Wochenplan Rezepte an — die Einkaufsliste füllt sich automatisch.</div>`;
  }
  const html = [];
  weeks.forEach(ws => {
    const isOpen = expandedWeeks.has(ws);
    const isCurrentWeek = ws === weekStartISO(todayISO());
    html.push(`
      <button class="row" onclick="A.nutToggleWeekAccordion('${ws}')">
        <div class="row-main"><div class="row-title">${isCurrentWeek ? 'Diese Woche' : weekRangeLabel(ws)}</div>${isCurrentWeek ? `<div class="row-sub">${weekRangeLabel(ws)}</div>` : ''}</div>
        ${ic(isOpen ? 'chevron_up' : 'chevron_down')}
      </button>`);
    if (isOpen) {
      weekShoppingList(ws).forEach(item => {
        const checked = !!(S.nutrition.shopChecked[ws] && S.nutrition.shopChecked[ws][item.foodId]);
        html.push(`
          <button class="shop-row${checked ? ' checked' : ''}" onclick="A.nutShopToggle('${ws}','${item.foodId}')">
            <div class="shop-check">${ic('check')}</div>
            <div class="shop-name">${esc(item.foodName)}</div>
            <div class="shop-amt">${item.totalAmount}${item.unit === 'stück' ? ' Stück' : ' g'}</div>
          </button>`);
      });
      html.push(`<button class="btn btn-ghost full sm" style="margin-bottom:14px" onclick="A.nutShopReset('${ws}')">${ic('refresh')} Diese Woche neu generieren</button>`);
    }
  });
  return html.join('');
}

A.nutToggleWeekAccordion = ws => {
  if (expandedWeeks.has(ws)) expandedWeeks.delete(ws); else expandedWeeks.add(ws);
  render();
};

A.nutShopToggle = (ws, foodId) => {
  const map = S.nutrition.shopChecked[ws] || (S.nutrition.shopChecked[ws] = {});
  if (map[foodId]) delete map[foodId]; else map[foodId] = true;
  save();
  render();
};

A.nutShopReset = ws => {
  S.nutrition.shopChecked[ws] = {};
  save();
  render();
  toast('Liste zurückgesetzt');
};

// ─── Ziel-Vorschlag ──────────────────────────────────────────────────────────
A.nutTargetsSheet = () => {
  const t = S.nutrition.targets;
  openSheet({
    title: 'Ernährungs-Ziel',
    body: `
      <div class="field-row">
        <div class="field"><label>Kalorien</label><input class="inp" id="nt-kcal" type="number" value="${t.kcal ?? ''}"></div>
        <div class="field"><label>Protein (g)</label><input class="inp" id="nt-p" type="number" value="${t.protein ?? ''}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Carbs (g)</label><input class="inp" id="nt-c" type="number" value="${t.carbs ?? ''}"></div>
        <div class="field"><label>Fett (g)</label><input class="inp" id="nt-f" type="number" value="${t.fat ?? ''}"></div>
      </div>
      <button class="btn full" id="nt-suggest">${ic('refresh')} Vorschlag berechnen</button>
      <div class="row-sub" id="nt-note" style="margin:8px 0 14px"></div>
      <button class="btn btn-acc full" id="nt-save">${ic('check')} Speichern</button>`,
    onOpen(sheet) {
      sheet.querySelector('#nt-suggest').addEventListener('click', () => {
        if (!S.goal) { toast('Bitte zuerst ein Ziel im Heute-Tab setzen', 'info_circle'); return; }
        const g = S.goal;
        const rawDays = daysBetweenISO(todayISO(), g.targetDate);
        const maintenance = g.startWeight * 30;
        let dailyAdj = 0;
        if (rawDays > 0) {
          dailyAdj = Math.max(-1000, Math.min(1000, (g.targetWeight - g.startWeight) * 7700 / rawDays));
        } else {
          toast('Zieldatum liegt in der Vergangenheit — nur Erhaltungskalorien', 'alert_triangle');
        }
        const kcal = Math.round(maintenance + dailyAdj);
        const protein = Math.round(g.startWeight * 2);
        const fat = Math.round(kcal * 0.25 / 9);
        const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
        sheet.querySelector('#nt-kcal').value = kcal;
        sheet.querySelector('#nt-p').value = protein;
        sheet.querySelector('#nt-c').value = carbs;
        sheet.querySelector('#nt-f').value = fat;
        sheet.querySelector('#nt-note').textContent = `Berechnet aus deinem Ziel: ${fmtKg(g.startWeight)} → ${fmtKg(g.targetWeight)} kg bis ${fmtDate(g.targetDate)}`;
      });
      sheet.querySelector('#nt-save').addEventListener('click', () => {
        S.nutrition.targets = {
          kcal: parseInt(sheet.querySelector('#nt-kcal').value) || null,
          protein: parseInt(sheet.querySelector('#nt-p').value) || null,
          carbs: parseInt(sheet.querySelector('#nt-c').value) || null,
          fat: parseInt(sheet.querySelector('#nt-f').value) || null,
        };
        save();
        closeSheet();
        render();
        toast('Ziel gespeichert');
      });
    },
  });
};
