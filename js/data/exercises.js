// ─── Übungsbibliothek ───────────────────────────────────────────────────────
// Namen sind identisch zur alten App (wichtig für die Daten-Migration).
// m = Muskelgruppen, eq = Equipment, bw = Körpergewicht, t = zeitbasiert (Sek.),
// lk = Anleitungs-Slug auf strongermobileapp.com (primäre Anleitung, online),
// instr = [Ausgangsposition, Ausführung, Häufiger Fehler] — Offline-Fallback,
// wird nur gezeigt, wenn der externe Link nicht erreichbar ist (siehe player.js).

function X(id, n, m, eq, opt = {}) {
  return { id, n, m, eq, ...opt };
}

export const LIBRARY = [
  // ── Brust ──
  X('barbell-bench-press', 'Barbell Bench Press', ['Brust', 'Trizeps'], 'Langhantel', { lk: 'barbell-bench-press', instr: [
    'Rückenlage auf der Bank, Füße fest am Boden, Schulterblätter zusammengezogen, Griff etwas breiter als schulterbreit.',
    'Stange kontrolliert zur unteren Brust senken, dann explosiv nach oben drücken, Ellbogen nicht komplett durchstrecken.',
    'Häufiger Fehler: Hintern hebt von der Bank ab — Spannung über Beine und Rücken halten.',
  ] }),
  X('incline-bench-press', 'Incline Bench Press', ['Brust', 'Schultern'], 'Langhantel', { lk: 'incline-bench-press', instr: [
    'Schrägbank ca. 30–45°, Griff schulterbreit bis leicht breiter.',
    'Stange zur oberen Brust senken, dann gerade nach oben drücken.',
    'Häufiger Fehler: Zu steiler Bankwinkel verlagert die Last auf die Schulter statt die obere Brust.',
  ] }),
  X('close-grip-bench-press', 'Close Grip Bench Press', ['Trizeps', 'Brust'], 'Langhantel', { lk: 'close-grip-bench-press', instr: [
    'Enger Griff, etwa schulterbreit oder knapp darunter.',
    'Stange kontrolliert zur unteren Brust senken, Ellbogen eng am Körper führen, dann hochdrücken.',
    'Häufiger Fehler: Ellbogen zu weit ausstellen — nimmt Spannung vom Trizeps.',
  ] }),
  X('dumbbell-press', 'Dumbbell Press', ['Brust'], 'Kurzhantel', { lk: 'dumbbell-press', instr: [
    'Rückenlage, Kurzhanteln auf Brusthöhe, Handflächen nach vorn.',
    'Hanteln nach oben drücken bis Arme fast gestreckt sind, kontrolliert wieder absenken.',
    'Häufiger Fehler: Hanteln zu tief absenken und die Schulter überstrecken.',
  ] }),
  X('incline-dumbbell-press', 'Incline Dumbbell Press', ['Brust', 'Schultern'], 'Kurzhantel', { lk: 'incline-dumbbell-press', instr: [
    'Schrägbank, Kurzhanteln auf Höhe der oberen Brust.',
    'Nach oben drücken, oben kurz zusammenführen, kontrolliert absenken.',
    'Häufiger Fehler: Zu schwere Gewichte führen zu unvollständiger Bewegungsamplitude.',
  ] }),
  X('seated-chest-press-machine', 'Seated Chest Press Machine', ['Brust'], 'Maschine', { lk: 'seated-chest-press-machine', instr: [
    'Sitzhöhe so einstellen, dass die Griffe auf Brusthöhe sind, Rücken an der Lehne.',
    'Griffe nach vorn drücken, Arme fast strecken, kontrolliert zurückführen.',
    'Häufiger Fehler: Schultern heben sich von der Lehne ab statt die Brust arbeiten zu lassen.',
  ] }),
  X('pec-deck-machine', 'Pec Deck Machine', ['Brust'], 'Maschine', { lk: 'pec-deck-machine', instr: [
    'Rücken an der Lehne, Arme auf den Polstern, leichte Ellbogenbeugung.',
    'Arme vor der Brust zusammenführen, kontrolliert wieder öffnen.',
    'Häufiger Fehler: Schwung holen statt die Brust die Bewegung kontrollieren zu lassen.',
  ] }),
  X('cable-crossover', 'Cable Crossover', ['Brust'], 'Kabel', { lk: 'cable-crossover', instr: [
    'Kabelzüge auf Kopfhöhe, ein Schritt nach vorn, leichte Vorlage.',
    'Griffe in einer großen Kreisbewegung vor dem Körper zusammenführen.',
    'Häufiger Fehler: Ellbogen komplett durchstrecken statt leicht gebeugt zu halten.',
  ] }),
  X('cable-fly-high-to-low', 'Cable Fly High to Low', ['Brust'], 'Kabel', { lk: 'cable-fly-high-to-low', instr: [
    'Kabelzüge oben, Griffe über Kopf greifen.',
    'Griffe diagonal nach unten vor den Oberschenkeln zusammenführen.',
    'Häufiger Fehler: Aus den Schultern statt aus der Brust ziehen.',
  ] }),
  X('dips', 'Dips', ['Brust', 'Trizeps'], 'Körpergewicht', { bw: true, lk: 'dips', instr: [
    'Arme gestreckt an den Barren, Körper leicht nach vorn geneigt für mehr Brustbeteiligung.',
    'Kontrolliert absenken bis die Oberarme parallel zum Boden sind, dann hochdrücken.',
    'Häufiger Fehler: Zu tief absenken belastet die Schultern übermäßig.',
  ] }),
  X('weighted-dips', 'Weighted Dips', ['Brust', 'Trizeps'], 'Sonstiges', { lk: 'weighted-dips', instr: [
    'Zusatzgewicht am Dip-Gürtel befestigt, gleiche Ausgangsposition wie bei Dips.',
    'Kontrolliert absenken bis die Oberarme parallel zum Boden sind, dann hochdrücken.',
    'Häufiger Fehler: Gewicht zu schnell steigern, bevor die Technik ohne Zusatzgewicht sicher sitzt.',
  ] }),
  X('push-up', 'Push-Up', ['Brust', 'Trizeps'], 'Körpergewicht', { bw: true, lk: 'push-up', instr: [
    'Plank-Position, Hände etwas breiter als schulterbreit, Körper eine gerade Linie.',
    'Brust kontrolliert Richtung Boden senken, dann hochdrücken.',
    'Häufiger Fehler: Hüfte sackt durch — Bauch und Gesäß anspannen.',
  ] }),

  // ── Schultern ──
  X('military-press', 'Military Press', ['Schultern', 'Trizeps'], 'Langhantel', { lk: 'military-press', instr: [
    'Stehend, Stange auf Schulterhöhe, enger Stand.',
    'Stange gerade nach oben drücken, Kopf leicht aus der Bahn nehmen, oben strecken.',
    'Häufiger Fehler: Übermäßiges Hohlkreuz — Bauch und Gesäß anspannen.',
  ] }),
  X('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', ['Schultern'], 'Kurzhantel', { lk: 'dumbbell-shoulder-press', instr: [
    'Sitzend oder stehend, Kurzhanteln auf Schulterhöhe.',
    'Hanteln nach oben drücken bis die Arme fast gestreckt sind.',
    'Häufiger Fehler: Hanteln zu weit vor dem Körper drücken statt gerade nach oben.',
  ] }),
  X('arnold-press', 'Arnold Press', ['Schultern'], 'Kurzhantel', { lk: 'arnold-press', instr: [
    'Kurzhanteln vor der Brust, Handflächen zum Körper.',
    'Beim Hochdrücken die Handflächen nach außen rotieren, oben nach vorn zeigend.',
    'Häufiger Fehler: Rotation zu hastig statt fließend über die ganze Bewegung.',
  ] }),
  X('shoulder-press-machine', 'Shoulder Press Machine', ['Schultern'], 'Maschine', { lk: 'shoulder-press-machine', instr: [
    'Sitzhöhe so einstellen, dass die Griffe auf Schulterhöhe sind.',
    'Griffe nach oben drücken, kontrolliert zurückführen.',
    'Häufiger Fehler: Rücken von der Lehne abheben.',
  ] }),
  X('dumbbell-lateral-raise', 'Dumbbell Lateral Raise', ['Schultern'], 'Kurzhantel', { lk: 'dumbbell-lateral-raise', instr: [
    'Stehend, Kurzhanteln seitlich am Körper, leichte Ellbogenbeugung.',
    'Arme seitlich bis Schulterhöhe heben, kontrolliert absenken.',
    'Häufiger Fehler: Schwung aus den Hüften statt reiner Schulterarbeit.',
  ] }),
  X('cable-lateral-raise', 'Cable Lateral Raise', ['Schultern'], 'Kabel', { lk: 'cable-lateral-raise', instr: [
    'Seitlich zum Kabelzug stehen, Griff in der äußeren Hand.',
    'Arm seitlich bis Schulterhöhe heben, kontrolliert zurückführen.',
    'Häufiger Fehler: Oberkörper zur Gegenseite neigen, um Schwung zu holen.',
  ] }),
  X('lateral-raise-machine', 'Lateral Raise Machine', ['Schultern'], 'Maschine', { lk: 'lateral-raise-machine', instr: [
    'Sitzend, Oberarme an den Polstern, Ellbogen leicht gebeugt.',
    'Arme seitlich nach oben drücken, kontrolliert absenken.',
    'Häufiger Fehler: Zu viel Gewicht führt zu verkürzter Bewegungsamplitude.',
  ] }),
  X('face-pull', 'Face Pull', ['Schultern', 'Rücken'], 'Kabel', { lk: 'face-pull', instr: [
    'Seil auf Kopf-/Augenhöhe am Kabelzug, Arme gestreckt.',
    'Seil zum Gesicht ziehen, Ellbogen hoch und außen, Schulterblätter zusammenziehen.',
    'Häufiger Fehler: Ellbogen fallen lassen statt hoch zu halten.',
  ] }),
  X('cable-rear-delt-fly', 'Cable Rear Delt Fly', ['Schultern'], 'Kabel', { lk: 'cable-rear-delt-fly', instr: [
    'Vor dem Kabelzug stehend, Griffe über Kreuz greifen.',
    'Arme seitlich nach hinten ziehen, Schulterblätter zusammenziehen.',
    'Häufiger Fehler: Aus dem Rücken statt aus der hinteren Schulter ziehen.',
  ] }),
  X('reverse-fly-machine', 'Reverse Fly Machine', ['Schultern'], 'Maschine', { instr: [
    'Brust an der Polsterung, Griffe vor dem Körper.',
    'Arme seitlich nach hinten öffnen, Schulterblätter zusammenziehen.',
    'Häufiger Fehler: Rücken rundet sich statt gerade zu bleiben.',
  ] }),

  // ── Rücken / Lats ──
  X('deadlift', 'Deadlift', ['Rücken', 'Beinbeuger', 'Gesäß'], 'Langhantel', { lk: 'deadlift', instr: [
    'Stange über der Mitte der Füße, Schienbeine nah dran, gerader Rücken, Griff schulterbreit.',
    'Stange nah am Körper nach oben ziehen, Hüfte und Knie gleichzeitig strecken.',
    'Häufiger Fehler: Rücken rundet sich beim Abheben vom Boden.',
  ] }),
  X('sumo-deadlift', 'Sumo Deadlift', ['Gesäß', 'Beinbeuger', 'Rücken'], 'Langhantel', { instr: [
    'Breiter Stand, Zehen leicht ausgedreht, Griff innerhalb der Beine.',
    'Hüfte nach vorn drücken und gleichzeitig hochziehen, Rücken gerade halten.',
    'Häufiger Fehler: Knie fallen beim Hochziehen nach innen.',
  ] }),
  X('barbell-row', 'Barbell Row', ['Rücken', 'Lats'], 'Langhantel', { lk: 'barbell-row', instr: [
    'Oberkörper ca. 45° vorgebeugt, Stange schulterbreit gegriffen.',
    'Stange zum unteren Bauch ziehen, Schulterblätter zusammenziehen, kontrolliert absenken.',
    'Häufiger Fehler: Aus dem unteren Rücken schwingen statt aus dem Latissimus ziehen.',
  ] }),
  X('t-bar-row', 'T-Bar Row', ['Rücken', 'Lats'], 'Maschine', { lk: 't-bar-row', instr: [
    'Vorgebeugt über der T-Bar-Stange, Griff am V-Handle.',
    'Gewicht zum Bauch ziehen, Schulterblätter zusammenziehen, kontrolliert absenken.',
    'Häufiger Fehler: Rücken rundet sich unter Last.',
  ] }),
  X('dumbbell-row', 'Dumbbell Row', ['Rücken', 'Lats'], 'Kurzhantel', { lk: 'dumbbell-row', instr: [
    'Ein Knie und eine Hand auf der Bank abgestützt, Rücken parallel zum Boden.',
    'Kurzhantel zur Hüfte ziehen, Ellbogen nah am Körper, kontrolliert absenken.',
    'Häufiger Fehler: Oberkörper rotiert statt stabil zu bleiben.',
  ] }),
  X('chest-supported-row', 'Chest Supported Row', ['Rücken'], 'Kurzhantel', { instr: [
    'Brust auf einer Schrägbank abgestützt, Kurzhanteln hängen locker.',
    'Hanteln zur Hüfte ziehen, Schulterblätter zusammenziehen.',
    'Häufiger Fehler: Kopf hochreißen statt neutral zu halten.',
  ] }),
  X('cable-row', 'Cable Row', ['Rücken', 'Lats'], 'Kabel', { lk: 'cable-row', instr: [
    'Sitzend, Füße an der Fußstütze, Griff mit gestreckten Armen.',
    'Griff zum Bauch ziehen, Oberkörper aufrecht halten, kontrolliert zurückführen.',
    'Häufiger Fehler: Mit dem Oberkörper nach hinten schaukeln statt aus dem Rücken zu ziehen.',
  ] }),
  X('seated-row-machine', 'Seated Row Machine', ['Rücken'], 'Maschine', { lk: 'seated-row-machine', instr: [
    'Brust an der Polsterung oder aufrecht sitzend, Griffe greifen.',
    'Griffe zum Körper ziehen, Schulterblätter zusammenziehen, kontrolliert zurückführen.',
    'Häufiger Fehler: Schultern hochziehen statt sie unten zu halten.',
  ] }),
  X('iso-lateral-high-row', 'Iso Lateral High Row', ['Rücken', 'Lats'], 'Maschine', { lk: 'iso-lateral-high-row', instr: [
    'Brust an der Polsterung, Griffe über Kopfhöhe greifen.',
    'Griffe einzeln oder gleichzeitig zum Körper ziehen, Ellbogen nach unten führen.',
    'Häufiger Fehler: Zu einseitig ausführen ohne die zweite Seite gleich zu belasten.',
  ] }),
  X('pulldown', 'Pulldown', ['Lats'], 'Kabel', { lk: 'pulldown', instr: [
    'Sitzend, Oberschenkel fixiert, Stange breit greifen.',
    'Stange zur oberen Brust ziehen, Schulterblätter zusammenziehen, kontrolliert zurückführen.',
    'Häufiger Fehler: Mit dem Oberkörper nach hinten lehnen und Schwung holen.',
  ] }),
  X('straight-arm-pulldown', 'Straight Arm Pulldown', ['Lats'], 'Kabel', { instr: [
    'Vor dem Kabelzug stehend, Stange mit gestreckten Armen über Kopf.',
    'Stange mit gestreckten Armen bis zu den Oberschenkeln ziehen.',
    'Häufiger Fehler: Ellbogen beugen und damit den Trizeps statt den Lat übernehmen lassen.',
  ] }),
  X('pull-up', 'Pull-Up', ['Lats', 'Bizeps'], 'Körpergewicht', { bw: true, lk: 'pull-up', instr: [
    'Breiter Obergriff an der Stange, Arme gestreckt.',
    'Körper hochziehen bis das Kinn über der Stange ist, kontrolliert absenken.',
    'Häufiger Fehler: Nur mit den Armen ziehen statt den Latissimus zu aktivieren.',
  ] }),
  X('chin-up', 'Chin Up', ['Lats', 'Bizeps'], 'Körpergewicht', { bw: true, lk: 'chin-up', instr: [
    'Schulterbreiter Untergriff an der Stange, Arme gestreckt.',
    'Körper hochziehen bis das Kinn über der Stange ist, kontrolliert absenken.',
    'Häufiger Fehler: Schwung aus den Beinen holen statt sauber zu ziehen.',
  ] }),
  X('wide-grip-pull-up', 'Wide Grip Pull Up', ['Lats'], 'Körpergewicht', { bw: true, lk: 'wide-grip-pull-up', instr: [
    'Sehr breiter Obergriff an der Stange.',
    'Körper hochziehen, Ellbogen nach außen und unten führen.',
    'Häufiger Fehler: Unvollständige Bewegungsamplitude durch zu breiten Griff.',
  ] }),
  X('weighted-pull-up', 'Weighted Pull Up', ['Lats', 'Bizeps'], 'Sonstiges', { lk: 'weighted-pull-up', instr: [
    'Zusatzgewicht am Dip-Gürtel, Griff wie beim Pull-Up.',
    'Wie Pull-Up, kontrolliert hoch- und wieder herunterführen.',
    'Häufiger Fehler: Zusatzgewicht zu früh steigern, bevor saubere Wiederholungen ohne Zusatzgewicht sitzen.',
  ] }),
  X('hyperextension', 'Hyperextension', ['Rücken', 'Gesäß'], 'Körpergewicht', { bw: true, lk: 'hyperextension', instr: [
    'Hüfte auf dem Polster, Oberkörper hängt locker nach vorn.',
    'Oberkörper anheben bis der Rücken gerade ist, kontrolliert absenken.',
    'Häufiger Fehler: Überstrecken ins Hohlkreuz statt bei der geraden Linie zu stoppen.',
  ] }),
  X('good-morning', 'Good Morning', ['Beinbeuger', 'Rücken'], 'Langhantel', { instr: [
    'Stange im Nacken wie beim Squat, Beine leicht gebeugt.',
    'Oberkörper mit geradem Rücken nach vorn beugen, Hüfte nach hinten schieben.',
    'Häufiger Fehler: Rücken rundet sich — Gewicht reduzieren und Spannung halten.',
  ] }),
  X('barbell-shrug', 'Barbell Shrug', ['Rücken'], 'Langhantel', { instr: [
    'Stehend, Stange mit beiden Händen vor dem Körper.',
    'Schultern gerade nach oben ziehen, kurz halten, kontrolliert absenken.',
    'Häufiger Fehler: Schultern nach vorn oder hinten rollen statt gerade hochzuziehen.',
  ] }),

  // ── Bizeps / Unterarme ──
  X('barbell-bicep-curl', 'Barbell Bicep Curl', ['Bizeps'], 'Langhantel', { lk: 'barbell-bicep-curl', instr: [
    'Stehend, Stange schulterbreit gegriffen, Ellbogen am Körper.',
    'Stange zur Schulter curlen, kontrolliert absenken.',
    'Häufiger Fehler: Mit dem Rücken schwingen, um Schwung zu holen.',
  ] }),
  X('ez-bar-curl', 'EZ Bar Curl', ['Bizeps'], 'EZ-Stange', { lk: 'ez-bar-curl', instr: [
    'EZ-Stange in den Griffwinkeln greifen, Ellbogen am Körper.',
    'Stange zur Schulter curlen, kontrolliert absenken.',
    'Häufiger Fehler: Ellbogen nach vorn wandern lassen statt sie fixiert zu halten.',
  ] }),
  X('dumbbell-bicep-curl', 'Dumbbell Bicep Curl', ['Bizeps'], 'Kurzhantel', { lk: 'dumbbell-bicep-curl', instr: [
    'Stehend, Kurzhanteln seitlich, Handflächen nach vorn.',
    'Hanteln zur Schulter curlen, kontrolliert absenken.',
    'Häufiger Fehler: Ellbogen nach vorn schieben statt sie am Körper zu lassen.',
  ] }),
  X('incline-dumbbell-curl', 'Incline Dumbbell Curl', ['Bizeps'], 'Kurzhantel', { lk: 'incline-dumbbell-curl', instr: [
    'Rückenlage auf Schrägbank, Arme hängen gestreckt nach unten.',
    'Hanteln curlen, Oberarm bleibt fixiert, kontrolliert absenken.',
    'Häufiger Fehler: Schultern nach vorn ziehen, um mehr Schwung zu holen.',
  ] }),
  X('hammer-curl', 'Hammer Curl', ['Bizeps', 'Unterarme'], 'Kurzhantel', { lk: 'hammer-curl', instr: [
    'Stehend, Kurzhanteln seitlich im neutralen Griff (Handflächen zueinander).',
    'Hanteln curlen bei neutralem Griff, kontrolliert absenken.',
    'Häufiger Fehler: Handgelenk dreht während der Bewegung statt neutral zu bleiben.',
  ] }),
  X('concentration-curl', 'Concentration Curl', ['Bizeps'], 'Kurzhantel', { instr: [
    'Sitzend, Ellbogen am Innenoberschenkel abgestützt.',
    'Hantel isoliert zur Schulter curlen, kontrolliert absenken.',
    'Häufiger Fehler: Oberkörper mitschwingen statt den Arm isoliert arbeiten zu lassen.',
  ] }),
  X('preacher-curl-machine', 'Preacher Curl Machine', ['Bizeps'], 'Maschine', { lk: 'preacher-curl-machine', instr: [
    'Oberarme auf der Schrägpolsterung, Griffe greifen.',
    'Griffe curlen, kontrolliert absenken bis die Arme fast gestreckt sind.',
    'Häufiger Fehler: Am Ende der Bewegung ruckartig ganz durchstrecken statt kontrolliert.',
  ] }),
  X('reverse-curl', 'Reverse Curl', ['Unterarme', 'Bizeps'], 'EZ-Stange', { instr: [
    'EZ-Stange im Obergriff (Handflächen nach unten), Ellbogen am Körper.',
    'Stange curlen, Handgelenke fixiert im Obergriff.',
    'Häufiger Fehler: Handgelenke abknicken statt sie stabil zu halten.',
  ] }),
  X('wrist-curl', 'Wrist Curl', ['Unterarme'], 'Kurzhantel', { instr: [
    'Unterarme auf den Oberschenkeln oder einer Bank abgestützt, Handflächen nach oben.',
    'Nur im Handgelenk die Hantel nach oben curlen, kontrolliert absenken.',
    'Häufiger Fehler: Ganzen Unterarm anheben statt nur im Handgelenk zu arbeiten.',
  ] }),
  X('dead-hang', 'Dead Hang', ['Unterarme', 'Lats'], 'Körpergewicht', { bw: true, t: true, lk: 'dead-hang', instr: [
    'An der Stange hängen, Arme gestreckt, Schultern leicht aktiv.',
    'Position über die Zeit halten, gleichmäßig atmen.',
    'Häufiger Fehler: Komplett passiv in den Schultern hängen statt sie leicht aktiv zu halten.',
  ] }),
  X('farmers-walk', "Farmer's Walk", ['Unterarme', 'Core'], 'Kurzhantel', { t: true, instr: [
    'Schwere Kurzhanteln in beiden Händen, aufrechter Stand.',
    'Kontrolliert eine festgelegte Strecke bzw. Zeit gehen, Rumpf stabil halten.',
    'Häufiger Fehler: In den Schultern hochziehen statt sie unten und hinten zu halten.',
  ] }),

  // ── Trizeps ──
  X('rope-pushdown', 'Rope Pushdown', ['Trizeps'], 'Kabel', { lk: 'rope-pushdown', instr: [
    'Vor dem Kabelzug stehend, Seil greifen, Ellbogen am Körper.',
    'Seil nach unten drücken, am Ende die Enden leicht auseinanderziehen, kontrolliert zurückführen.',
    'Häufiger Fehler: Ellbogen wandern vom Körper weg.',
  ] }),
  X('bar-pushdown', 'Bar Pushdown', ['Trizeps'], 'Kabel', { lk: 'bar-pushdown', instr: [
    'Vor dem Kabelzug stehend, Stange im Obergriff, Ellbogen am Körper.',
    'Stange nach unten drücken bis die Arme fast gestreckt sind, kontrolliert zurückführen.',
    'Häufiger Fehler: Mit dem Oberkörper nach vorn drücken statt isoliert im Trizeps zu arbeiten.',
  ] }),
  X('rope-overhead-extension', 'Rope Overhead Extension', ['Trizeps'], 'Kabel', { lk: 'rope-overhead-extension', instr: [
    'Rücken zum Kabelzug, Seil mit beiden Händen hinter dem Kopf.',
    'Arme nach vorn oben strecken, kontrolliert zurückführen.',
    'Häufiger Fehler: Ellbogen weit auseinander statt eng nach vorn zeigend.',
  ] }),
  X('ez-bar-skullcrusher', 'EZ Bar Skullcrusher', ['Trizeps'], 'EZ-Stange', { lk: 'ez-bar-skullcrusher', instr: [
    'Rückenlage, EZ-Stange über der Stirn, Oberarme senkrecht.',
    'Stange zur Stirn absenken, dann durch Strecken der Unterarme hochdrücken.',
    'Häufiger Fehler: Oberarme wandern nach hinten statt senkrecht zu bleiben.',
  ] }),
  X('machine-tricep-extension', 'Machine Tricep Extension', ['Trizeps'], 'Maschine', { lk: 'machine-tricep-extension', instr: [
    'Sitzend, Oberarme an der Polsterung fixiert, Griffe greifen.',
    'Griffe nach unten drücken bis die Arme fast gestreckt sind, kontrolliert zurückführen.',
    'Häufiger Fehler: Oberarme von der Polsterung abheben.',
  ] }),

  // ── Beine / Gesäß ──
  X('barbell-back-squat', 'Barbell Back Squat', ['Quadrizeps', 'Gesäß'], 'Langhantel', { lk: 'barbell-back-squat', instr: [
    'Stange auf dem oberen Trapez, Füße schulterbreit, Zehen leicht ausgedreht.',
    'Hüfte nach hinten schieben, absenken bis die Oberschenkel parallel zum Boden sind, dann hochdrücken.',
    'Häufiger Fehler: Knie fallen beim Hochdrücken nach innen.',
  ] }),
  X('front-squat', 'Front Squat', ['Quadrizeps', 'Core'], 'Langhantel', { instr: [
    'Stange vorn auf den Schultern, Ellbogen hoch, aufrechter Oberkörper.',
    'Absenken bei aufrechtem Oberkörper, dann hochdrücken.',
    'Häufiger Fehler: Ellbogen sinken ab, Stange rutscht nach vorn.',
  ] }),
  X('goblet-squat', 'Goblet Squat', ['Quadrizeps', 'Gesäß'], 'Kurzhantel', { instr: [
    'Kurzhantel senkrecht vor der Brust halten, Füße schulterbreit.',
    'Absenken bis die Oberschenkel mindestens parallel zum Boden sind, hochdrücken.',
    'Häufiger Fehler: Oberkörper fällt nach vorn statt aufrecht zu bleiben.',
  ] }),
  X('hack-squat', 'Hack Squat', ['Quadrizeps'], 'Maschine', { instr: [
    'Rücken und Schultern an der Polsterung der Maschine, Füße schulterbreit auf der Plattform.',
    'Absenken bis die Knie ca. 90° gebeugt sind, dann hochdrücken.',
    'Häufiger Fehler: Fersen heben von der Plattform ab.',
  ] }),
  X('leg-press', 'Leg Press', ['Quadrizeps', 'Gesäß'], 'Maschine', { lk: 'leg-press', instr: [
    'Rücken an der Lehne, Füße schulterbreit auf der Plattform.',
    'Plattform durch Strecken der Beine wegdrücken, kontrolliert wieder absenken.',
    'Häufiger Fehler: Knie am unteren Punkt komplett durchdrücken/blockieren.',
  ] }),
  X('bulgarian-split-squat', 'Bulgarian Split Squat', ['Quadrizeps', 'Gesäß'], 'Kurzhantel', { lk: 'bulgarian-split-squat', instr: [
    'Hinterer Fuß erhöht auf einer Bank, vorderes Bein trägt das Gewicht.',
    'Absenken bis das hintere Knie sich fast dem Boden nähert, dann hochdrücken.',
    'Häufiger Fehler: Vorderes Knie zu weit über die Fußspitze schieben.',
  ] }),
  X('walking-lunge', 'Walking Lunge', ['Quadrizeps', 'Gesäß'], 'Kurzhantel', { instr: [
    'Aufrechter Stand, Kurzhanteln seitlich.',
    'Großen Schritt nach vorn, Knie bis knapp über den Boden absenken, dann in den nächsten Schritt drücken.',
    'Häufiger Fehler: Vorderes Knie knickt nach innen ein.',
  ] }),
  X('leg-extension', 'Leg Extension', ['Quadrizeps'], 'Maschine', { lk: 'leg-extension', instr: [
    'Sitzend, Schienbeine hinter dem Polster, Rücken an der Lehne.',
    'Beine strecken bis fast gerade, kontrolliert absenken.',
    'Häufiger Fehler: Schwung holen statt kontrolliert zu strecken.',
  ] }),
  X('leg-curl', 'Leg Curl', ['Beinbeuger'], 'Maschine', { lk: 'leg-curl', instr: [
    'Liegend oder sitzend, Polster an den Fersen/Waden.',
    'Beine zum Gesäß beugen, kontrolliert wieder strecken.',
    'Häufiger Fehler: Hüfte hebt von der Bank ab.',
  ] }),
  X('barbell-rdl', 'Barbell RDL', ['Beinbeuger', 'Gesäß'], 'Langhantel', { lk: 'barbell-rdl', instr: [
    'Stange vor den Oberschenkeln, leichte Kniebeugung.',
    'Hüfte nach hinten schieben, Stange nah am Bein absenken, dann durch Hüftstreckung hochkommen.',
    'Häufiger Fehler: Rücken rundet sich statt gerade zu bleiben.',
  ] }),
  X('dumbbell-rdl', 'Dumbbell RDL', ['Beinbeuger', 'Gesäß'], 'Kurzhantel', { lk: 'dumbbell-rdl', instr: [
    'Kurzhanteln vor den Oberschenkeln, leichte Kniebeugung.',
    'Hüfte nach hinten schieben, Hanteln nah an den Beinen absenken, hochkommen.',
    'Häufiger Fehler: Zu tief absenken und den Rücken runden.',
  ] }),
  X('hip-thrust', 'Hip Thrust', ['Gesäß', 'Beinbeuger'], 'Langhantel', { lk: 'hip-thrust', instr: [
    'Oberer Rücken an einer Bank abgestützt, Stange über der Hüfte, Füße hüftbreit.',
    'Hüfte nach oben drücken bis der Körper eine gerade Linie bildet, kontrolliert absenken.',
    'Häufiger Fehler: Überstrecken ins Hohlkreuz am oberen Punkt.',
  ] }),
  X('hip-abductor', 'Hip Abductor', ['Gesäß'], 'Maschine', { lk: 'hip-abductor', instr: [
    'Sitzend, Außenseite der Knie an den Polstern.',
    'Beine gegen den Widerstand nach außen drücken, kontrolliert zurückführen.',
    'Häufiger Fehler: Oberkörper nach vorn beugen, um Schwung zu holen.',
  ] }),
  X('calf-raises', 'Calf Raises', ['Waden'], 'Maschine', { lk: 'calf-raises', instr: [
    'Fußballen auf der Plattform, Fersen frei nach unten hängend.',
    'Auf die Zehenspitzen drücken, oben kurz halten, kontrolliert absenken bis zur Dehnung.',
    'Häufiger Fehler: Zu schnelles, kleines Wippen statt vollem Bewegungsumfang.',
  ] }),
  X('standing-dumbbell-calf-raise', 'Standing Dumbbell Calf Raise', ['Waden'], 'Kurzhantel', { lk: 'standing-dumbbell-calf-raise', instr: [
    'Stehend, Kurzhanteln in den Händen, Fußballen auf einer Erhöhung.',
    'Auf die Zehenspitzen drücken, kontrolliert absenken bis zur Dehnung.',
    'Häufiger Fehler: Knie beugen, um den Schwung zu unterstützen.',
  ] }),
  X('seated-calf-raise', 'Seated Calf Raise', ['Waden'], 'Maschine', { instr: [
    'Sitzend, Polster auf den Knien, Fußballen auf der Plattform.',
    'Auf die Zehenspitzen drücken, kontrolliert absenken bis zur Dehnung.',
    'Häufiger Fehler: Zu kurzer Bewegungsumfang statt volle Dehnung und Kontraktion.',
  ] }),

  // ── Core ──
  X('plank', 'Plank', ['Core'], 'Körpergewicht', { bw: true, t: true, lk: 'plank', instr: [
    'Unterarmstütz, Ellbogen unter den Schultern, Körper eine gerade Linie.',
    'Position über die Zeit halten, Bauch und Gesäß aktiv anspannen.',
    'Häufiger Fehler: Hüfte sackt durch oder wird zu hoch gehalten.',
  ] }),
  X('side-plank', 'Side Plank', ['Core'], 'Körpergewicht', { bw: true, t: true, instr: [
    'Seitlicher Unterarmstütz, Körper eine gerade Linie von Kopf bis Fuß.',
    'Position über die Zeit halten, Hüfte nicht absinken lassen.',
    'Häufiger Fehler: Hüfte dreht sich nach vorn oder hinten weg.',
  ] }),
  X('crunch', 'Crunch', ['Core'], 'Körpergewicht', { bw: true, lk: 'crunch', instr: [
    'Rückenlage, Knie gebeugt, Hände leicht an den Schläfen.',
    'Oberkörper einrollen, Schulterblätter vom Boden lösen, kontrolliert zurück.',
    'Häufiger Fehler: Am Kopf ziehen statt aus dem Bauch zu arbeiten.',
  ] }),
  X('cable-crunch', 'Cable Crunch', ['Core'], 'Kabel', { instr: [
    'Kniend vor dem Kabelzug, Seil hinter dem Kopf greifen.',
    'Oberkörper einrollen Richtung Oberschenkel, kontrolliert zurückführen.',
    'Häufiger Fehler: Aus der Hüfte statt aus der Wirbelsäule einrollen.',
  ] }),
  X('hanging-knee-raise', 'Hanging Knee Raise', ['Core'], 'Körpergewicht', { bw: true, lk: 'hanging-knee-raise', instr: [
    'An der Stange hängend, Beine gestreckt.',
    'Knie kontrolliert Richtung Brust anheben, kontrolliert absenken.',
    'Häufiger Fehler: Schwung aus dem ganzen Körper holen statt kontrolliert zu heben.',
  ] }),
  X('leg-raise', 'Leg Raise', ['Core'], 'Körpergewicht', { bw: true, lk: 'leg-raise', instr: [
    'An der Stange hängend oder Rückenlage, Beine gestreckt.',
    'Beine gestreckt anheben bis mindestens waagerecht, kontrolliert absenken.',
    'Häufiger Fehler: Unteren Rücken hohl machen, um die Beine höher zu bekommen.',
  ] }),
  X('russian-twist', 'Russian Twist', ['Core'], 'Körpergewicht', { bw: true, lk: 'russian-twist', instr: [
    'Sitzend, Oberkörper leicht zurückgelehnt, Füße angehoben oder am Boden.',
    'Oberkörper kontrolliert von Seite zu Seite rotieren.',
    'Häufiger Fehler: Nur mit den Armen schwingen statt aus dem Rumpf zu rotieren.',
  ] }),
];

export const EQUIPMENT = ['Langhantel', 'Kurzhantel', 'Maschine', 'Kabel', 'Körpergewicht', 'EZ-Stange', 'Sonstiges'];

export function exerciseLink(ex) {
  return ex.lk ? `https://www.strongermobileapp.com/exercises/${ex.lk}` : null;
}
