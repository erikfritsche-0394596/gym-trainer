// ─── Ernährung: Heute, Wochenplan, Einkaufsliste, Rezepte, Lebensmittel ─────
import { ic } from '../icons.js';
import {
  S, save, getFood, getRecipe, recipeMacros, entryMacros, diaryMacros,
  nutritionDayForWeekday, ensureDiaryDay, weekShoppingList, recipeCookPlan,
} from '../state.js';
import { MEAL_SLOTS, DAYS, DAYS_LONG, todayISO, daysBetweenISO, fmtDate, fmtKg, esc, uid } from '../util.js';
import { openSheet, closeSheet, toast, confirmSheet } from '../components.js';
import { A } from '../actions.js';

let panel = 'heute'; // ephemer: 'heute' | 'woche' | 'einkaufen'

export function render() {
  const el = document.getElementById('v-nutrition');
  ensureDiaryDay(todayISO());
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
    const eaten = diaryMacros(today, { onlyEaten: true });
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

  const day = ensureDiaryDay(today);
  MEAL_SLOTS.forEach(slot => {
    const entries = day.slots[slot.key];
    html.push(`<div class="slot-lbl">${slot.label}</div>`);
    html.push(entries.length
      ? entries.map((e, i) => mealRowHTML(e, slot.key, i)).join('')
      : `<div class="row-sub" style="margin-bottom:8px">Nichts geplant</div>`);
  });
  if (day.extra.length) {
    html.push(`<div class="slot-lbl">Sonstiges</div>`);
    html.push(day.extra.map((e, i) => mealRowHTML(e, 'extra', i)).join(''));
  }
  html.push(`<button class="btn btn-ghost full" style="margin-top:8px" onclick="A.nutAddAdhoc()">${ic('plus')} Spontan hinzufügen</button>`);
  return html.join('');
}

function mealRowHTML(entry, slotKey, idx) {
  const ref = entry.type === 'recipe' ? getRecipe(entry.refId) : getFood(entry.refId);
  const m = entryMacros(entry);
  const nameHTML = ref ? esc(ref.name) : '<span class="chip chip-danger">Gelöscht</span>';
  return `
    <div class="meal-row${entry.eaten ? ' checked' : ''}" onclick="A.nutToggleEaten('${slotKey}',${idx})">
      <div class="meal-check">${ic('check')}</div>
      <div class="meal-main"><div class="meal-name">${nameHTML}</div><div class="meal-macro">${Math.round(m.protein)}P / ${Math.round(m.carbs)}C / ${Math.round(m.fat)}F</div></div>
      <div class="meal-kcal">${Math.round(m.kcal)}</div>
      <button class="iconbtn" style="width:28px;height:28px;background:none;border:none;flex-shrink:0" onclick="event.stopPropagation();A.nutRemoveEntry('${slotKey}',${idx})" aria-label="Entfernen">${ic('x')}</button>
    </div>`;
}

A.nutToggleEaten = (slotKey, idx) => {
  const day = ensureDiaryDay(todayISO());
  const arr = slotKey === 'extra' ? day.extra : day.slots[slotKey];
  arr[idx].eaten = !arr[idx].eaten;
  save();
  render();
};

A.nutRemoveEntry = (slotKey, idx) => {
  const day = ensureDiaryDay(todayISO());
  const arr = slotKey === 'extra' ? day.extra : day.slots[slotKey];
  arr.splice(idx, 1);
  save();
  render();
};

A.nutAddAdhoc = () => {
  openEntryPicker(entry => {
    const day = ensureDiaryDay(todayISO());
    day.extra.push({ ...entry, eaten: false });
    save();
    render();
    toast('Hinzugefügt');
  });
};

// ─── Woche ───────────────────────────────────────────────────────────────────
function wochePanelHTML() {
  const html = [];
  html.push(`<div class="slbl">Diese Woche geplant</div>`);
  html.push(`<div class="wk-grid">${DAYS.map((label, wd) => {
    const day = nutritionDayForWeekday(wd);
    const filled = day ? MEAL_SLOTS.reduce((n, s) => n + (day.slots[s.key].length ? 1 : 0), 0) : 0;
    const dots = Array.from({ length: Math.max(filled, 1) }).map(() => '<span></span>').join('');
    return `<div class="wk-day${filled ? ' full' : ''}"><div class="wk-day-lbl">${label}</div><div class="wk-day-dots">${dots}</div></div>`;
  }).join('')}</div>`);
  html.push(`<button class="btn full" onclick="A.nutEditWeek()">${ic('pencil')} Wochenplan bearbeiten</button>`);

  const cookPlan = recipeCookPlan();
  html.push(`<div class="slbl">Diese Woche kochen</div>`);
  if (!cookPlan.length) {
    html.push(`<div class="row-sub" style="margin-bottom:8px">Noch keine Rezepte im Wochenplan.</div>`);
  } else {
    cookPlan.forEach(c => {
      const prepped = !!S.nutrition.prepped[c.recipeId];
      const rest = c.yieldServings > c.needed ? `, ${c.yieldServings - c.needed} übrig` : '';
      html.push(`
        <div class="cook-row">
          <div class="cook-head"><div class="cook-name">${esc(c.name)}</div><span class="chip chip-acc">${c.needed}× geplant</span></div>
          <div class="cook-sub">→ ${c.batches}× kochen (ergibt ${c.yieldServings} Portionen${rest})</div>
          <div class="cook-prepped${prepped ? ' on' : ''}" onclick="A.nutTogglePrepped('${c.recipeId}')"><div class="box">${ic('check')}</div>Vorbereitet</div>
        </div>`);
    });
  }

  html.push(`<div class="slbl">Verwalten</div>`);
  html.push(`<button class="row" onclick="A.nutRecipesManage()"><div class="row-main"><div class="row-title">Rezepte verwalten</div><div class="row-sub">${S.nutrition.recipes.length} Rezepte</div></div>${ic('chevron_right')}</button>`);
  html.push(`<button class="row" onclick="A.nutFoodsManage()"><div class="row-main"><div class="row-title">Lebensmittel verwalten</div><div class="row-sub">${S.nutrition.foods.length} Lebensmittel</div></div>${ic('chevron_right')}</button>`);
  return html.join('');
}

A.nutTogglePrepped = recipeId => {
  S.nutrition.prepped[recipeId] = !S.nutrition.prepped[recipeId];
  save();
  render();
};

// ── Wochenplan-Editor: Tage-Liste → Tag-Detail mit 5 Slots ──
A.nutEditWeek = () => {
  openSheet({
    title: 'Wochenplan',
    body: DAYS_LONG.map((label, wd) => {
      const day = nutritionDayForWeekday(wd);
      const filled = MEAL_SLOTS.reduce((n, s) => n + day.slots[s.key].length, 0);
      return `<button class="row" onclick="A.nutOpenDay('${day.id}')"><div class="row-main"><div class="row-title">${label}</div><div class="row-sub">${filled} Einträge</div></div>${ic('chevron_right')}</button>`;
    }).join(''),
  });
};

A.nutOpenDay = dayId => {
  const day = S.nutrition.plan.days.find(d => d.id === dayId);
  if (!day) return;
  openSheet({
    title: DAYS_LONG[day.weekday],
    body: MEAL_SLOTS.map(slot => {
      const entries = day.slots[slot.key];
      const rows = entries.map((e, i) => planEntryRowHTML(e, day.id, slot.key, i)).join('')
        || `<div class="row-sub" style="margin-bottom:6px">Nichts geplant</div>`;
      return `
        <div class="slbl">${slot.label}</div>
        ${rows}
        <button class="btn btn-ghost full sm" style="margin-bottom:8px" onclick="A.nutSlotAdd('${day.id}','${slot.key}')">${ic('plus')} Hinzufügen</button>`;
    }).join(''),
  });
};

function planEntryRowHTML(entry, dayId, slotKey, idx) {
  const ref = entry.type === 'recipe' ? getRecipe(entry.refId) : getFood(entry.refId);
  const nameHTML = ref ? esc(ref.name) : '<span class="chip chip-danger">Gelöscht</span>';
  const amountLbl = entry.type === 'recipe' ? `${entry.amount}× Portion` : `${entry.amount}${ref && ref.unit === 'stück' ? ' Stück' : 'g'}`;
  return `
    <div class="entry-row">
      <div class="entry-main"><div class="entry-name">${nameHTML}</div><div class="entry-sub">${amountLbl}</div></div>
      <div class="entry-actions"><button class="iconbtn" onclick="A.nutSlotRemove('${dayId}','${slotKey}',${idx})" aria-label="Entfernen">${ic('trash')}</button></div>
    </div>`;
}

A.nutSlotAdd = (dayId, slotKey) => {
  openEntryPicker(entry => {
    const day = S.nutrition.plan.days.find(d => d.id === dayId);
    day.slots[slotKey].push(entry);
    save();
    A.nutOpenDay(dayId);
    toast('Hinzugefügt');
  });
};

A.nutSlotRemove = (dayId, slotKey, idx) => {
  const day = S.nutrition.plan.days.find(d => d.id === dayId);
  day.slots[slotKey].splice(idx, 1);
  save();
  A.nutOpenDay(dayId);
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
        return `<button class="row" onclick="A.nutRecipeForm('${r.id}')"><div class="row-main"><div class="row-title">${esc(r.name)}</div><div class="row-sub">${Math.round(m.kcal)} kcal / Portion · ${r.servings} Portionen</div></div>${ic('chevron_right')}</button>`;
      }).join('') : `<div class="row-sub">Noch keine Rezepte.</div>`}`,
  });
};

let recipeDraft = null;

A.nutRecipeForm = id => {
  const existing = id ? getRecipe(id) : null;
  recipeDraft = existing
    ? { name: existing.name, servings: existing.servings, ingredients: existing.ingredients.map(i => ({ ...i })) }
    : { name: '', servings: 4, ingredients: [] };
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
      <div class="card" style="text-align:center" id="rf-total"></div>
      <div class="slbl">Zutaten</div>
      <div id="rf-ing-list"></div>
      <button class="btn btn-ghost full" id="rf-add-ing">${ic('plus')} Zutat hinzufügen</button>
      <div id="rf-pick-list" style="max-height:0;overflow:hidden;transition:max-height .3s ease"></div>
      <button class="btn btn-acc full" style="margin-top:14px" id="rf-save">${ic('check')} Speichern</button>
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
    if (existing) {
      Object.assign(existing, { name, servings: recipeDraft.servings, ingredients: recipeDraft.ingredients });
    } else {
      S.nutrition.recipes.push({ id: uid(), name, servings: recipeDraft.servings, ingredients: recipeDraft.ingredients });
    }
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

// ─── Einkaufen ───────────────────────────────────────────────────────────────
function einkaufenPanelHTML() {
  const list = weekShoppingList();
  if (!list.length) {
    return `<div class="empty">${ic('clipboard_list')}<br>Noch nichts geplant.<br>Leg im Wochenplan Rezepte an — die Einkaufsliste füllt sich automatisch.</div>`;
  }
  const html = [`<div class="row-sub" style="margin-bottom:10px">Automatisch aus dem Wochenplan generiert.</div>`];
  list.forEach(item => {
    const checked = !!S.nutrition.shopChecked[item.foodId];
    html.push(`
      <div class="shop-row${checked ? ' checked' : ''}" onclick="A.nutShopToggle('${item.foodId}')">
        <div class="shop-check">${ic('check')}</div>
        <div class="shop-name">${esc(item.foodName)}</div>
        <div class="shop-amt">${item.totalAmount}${item.unit === 'stück' ? ' Stück' : ' g'}</div>
      </div>`);
  });
  html.push(`<button class="btn btn-ghost full" style="margin-top:8px" onclick="A.nutShopReset()">${ic('refresh')} Neu generieren</button>`);
  return html.join('');
}

A.nutShopToggle = foodId => {
  S.nutrition.shopChecked[foodId] = !S.nutrition.shopChecked[foodId];
  save();
  render();
};

A.nutShopReset = () => {
  S.nutrition.shopChecked = {};
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
