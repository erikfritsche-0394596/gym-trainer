// ─── Lebensmittel-Starter-Liste ─────────────────────────────────────────────
// Typische Nährwerte je 100 g (bzw. je Stück bei unit:'stück') — Richtwerte,
// bei Bedarf im Ernährungs-Tab an die eigenen Produkte anpassen.

function F(id, name, unit, kcal100, protein100, carbs100, fat100) {
  return { id, name, unit, kcal100, protein100, carbs100, fat100, custom: false };
}

export const FOODS = [
  F('haferflocken', 'Haferflocken', 'g', 370, 13, 60, 7),
  F('whey-pulver', 'Whey-Protein-Pulver', 'g', 380, 75, 8, 6),
  F('tk-beeren', 'TK-Beeren', 'g', 50, 1, 11, 0.5),
  F('haehnchenbrust', 'Hähnchenbrust', 'g', 110, 23, 0, 2),
  F('reis-gekocht', 'Reis (gekocht)', 'g', 130, 2.7, 28, 0.3),
  F('brokkoli', 'Brokkoli', 'g', 34, 2.8, 7, 0.4),
  F('magerquark', 'Magerquark', 'g', 67, 12, 4, 0.2),
  F('mandeln', 'Mandeln', 'g', 580, 21, 20, 50),
  F('rinderhack', 'Rinderhack 10%', 'g', 200, 19, 0, 14),
  F('suesskartoffel', 'Süßkartoffel', 'g', 86, 1.6, 20, 0.1),
  F('eier', 'Eier', 'stück', 78, 6.5, 0.6, 5.5),
  F('vollkornbrot', 'Vollkornbrot', 'g', 220, 9, 38, 3),
  F('butter', 'Butter', 'g', 720, 0.7, 0.6, 80),
  F('olivenoel', 'Olivenöl', 'g', 880, 0, 0, 100),
  F('banane', 'Banane', 'stück', 95, 1.1, 22, 0.3),
  F('apfel', 'Apfel', 'stück', 52, 0.3, 14, 0.2),
  F('milch', 'Milch 1,5%', 'g', 47, 3.4, 4.8, 1.5),
  F('naturjoghurt', 'Naturjoghurt', 'g', 62, 4.5, 5, 1.5),
  F('nudeln-gekocht', 'Nudeln (gekocht)', 'g', 158, 5.8, 31, 0.9),
  F('kartoffeln-gekocht', 'Kartoffeln (gekocht)', 'g', 87, 1.9, 20, 0.1),
  F('lachs', 'Lachs', 'g', 208, 20, 0, 13),
  F('thunfisch', 'Thunfisch (Dose)', 'g', 116, 26, 0, 1),
  F('linsen-gekocht', 'Linsen (gekocht)', 'g', 116, 9, 20, 0.4),
  F('honig', 'Honig', 'g', 304, 0.3, 82, 0),
  F('erdnussbutter', 'Erdnussbutter', 'g', 588, 25, 20, 50),
  F('spinat', 'Spinat', 'g', 23, 2.9, 3.6, 0.4),
  F('paprika', 'Paprika', 'g', 31, 1, 6, 0.3),
  F('frischkaese', 'Frischkäse', 'g', 250, 6, 4, 24),
];
