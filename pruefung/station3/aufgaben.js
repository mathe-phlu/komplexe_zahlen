/* ============================================================
   Station 3 - Komplexe Folgen

   Vier Aufgaben, 15 Punkte. Nach station3/VORSCHLAG.md.
   Punkteverteilung unverändert gegenüber der Moodle-Fassung.

   Aufgabe 3 ist die Stelle, an der der Umzug nach HTML am
   deutlichsten trägt: Statt «z3, z10, z20» zu tippen und dafür
   Hunderte von Permutationen als Lösungsschlüssel zu hinterlegen,
   werden die Punkte angeklickt und Mengen verglichen.
   ============================================================ */
(function(){
'use strict';
const Z = window.Zahl, ZE = window.Zeichnen, P = window.PIA;
const w = P.wuerfel, mischen = P.mischen, zufall = P.zufall;

const cis = g => Z.K(Math.cos(g*Math.PI/180), Math.sin(g*Math.PI/180));

/* Zahlen vom Betrag 1 in exakter Schreibweise. Übernommen aus
   Station 3/Zyklen/test.py - dort ein guter Zug: die exakte Form
   zwingt dazu, den Winkel zu sehen statt zu rechnen. */
function exakt(grad){
  const g = ((grad % 360) + 360) % 360;
  const tafel = {
    0: '1', 90: 'i', 180: '−1', 270: '−i',
    45: '0.5·√2·(1 + i)',   135: '0.5·√2·(−1 + i)',
    225: '0.5·√2·(−1 − i)', 315: '0.5·√2·(1 − i)',
    30: '0.5·(√3 + i)',   150: '0.5·(−√3 + i)',
    210: '0.5·(−√3 − i)', 330: '0.5·(√3 − i)',
    60: '0.5·(1 + √3·i)',  120: '0.5·(−1 + √3·i)',
    240: '0.5·(−1 − √3·i)',300: '0.5·(1 − √3·i)'
  };
  return tafel[g] || Z.normalform(cis(g), 2);
}
const zyklenlaenge = grad => {
  const g = ((Math.round(grad) % 360) + 360) % 360;
  const ggt = (a,b) => b ? ggt(b, a % b) : a;
  return g === 0 ? 1 : 360 / ggt(g, 360);
};

/* Möbius-Zählung: wie viele Lösungen von z^(2^y) = z gehören zu
   Zyklen GENAU der Länge y? Nachgerechnet gegen die Werte des
   Altbestands: 30, 54, 126, 240, 504 für y = 5 … 9. */
function genauPeriode(y){
  const teiler = [];
  for (let d = 1; d <= y; d++) if (y % d === 0) teiler.push(d);
  const mu = n => {
    let z = 1, m = n;
    for (let pz = 2; pz*pz <= m; pz++){
      if (m % pz) continue;
      m /= pz;
      if (m % pz === 0) return 0;
      z = -z;
    }
    if (m > 1) z = -z;
    return z;
  };
  return teiler.reduce((s,d) => s + mu(y/d) * (Math.pow(2,d) - 1), 0);
}

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S3-A01', punkte: 5, titel: 'Bahnen vorhersagen',
  auftrag: 'Drei Iteratoren. Ordnen Sie jedem zu, was er aus einem Startwert macht.',
  bauen(b){
    const a1 = w([Z.K(-1,0), Z.K(0,1), Z.K(0,-1)]);          // Betrag 1: zyklisch
    let a2;
    do { a2 = Z.K(Math.round(zufall(-5,5)), Math.round(zufall(-5,5))); }
    while (Z.betrag(a2) <= 1.2);                              // Betrag > 1: divergent
    let a3;
    do {
      const r = w([0.5, 0.25, 0.1]);
      a3 = Z.mal(Z.K(r,0), Z.K(Math.round(zufall(-3,3)), Math.round(zufall(-3,3))));
    } while (Z.betrag(a3) >= 1 || Z.betrag(a3) < 0.1);        // Betrag < 1: konvergent

    const terme = [
      { id: 'a', text: 'f(z) = ' + Z.normalformGeklammert(a1,2) + ' · z + ' +
                       Z.normalformGeklammert(a3,2), art: 'zyklisch' },
      { id: 'b', text: 'f(z) = ' + Z.normalformGeklammert(a2,2) + ' · z',
                 art: 'divergent' },
      { id: 'c', text: 'f(z) = ' + Z.normalformGeklammert(a3,2) + ' · z + ' +
                       Z.normalformGeklammert(a2,2), art: 'konvergent' }
    ];

    /* FEHLERBEHOBEN (2026-08-21): Die drei Terme standen zweimal auf
       der Seite - einmal als Formelzeile, einmal als Beschriftung der
       Zuordnungsliste. Rike: «Die Funktionen werden doppelt.»
       Jetzt stehen sie nur noch als Kartenaufschrift. */
    b.kasten('Drei Iteratoren');
    b.satz('Jeder dieser Iteratoren wird auf einen Startwert angewendet und dann ' +
           'immer wieder auf das Ergebnis. <b>Ziehen Sie jeden zu dem Verhalten, ' +
           'das er erzeugt.</b>');
    b.hinweis('Ziehen zum Zuordnen, Doppelklick legt eine Karte zurück.');
    b.kartenZuordnung({ name: 'S3A1.zu', p: 1,
      vorratMarke: 'Iteratoren',
      karten: mischen(terme).map(x => ({ id: x.id, text: x.text })),
      felder: [
        { id: 'div', kopf: '<b>erzeugt divergente Folgen</b>' },
        { id: 'kon', kopf: '<b>erzeugt konvergente Folgen</b>' },
        { id: 'zyk', kopf: '<b>erzeugt zyklische Folgen</b>' }
      ],
      richtig: {
        div: [terme.find(x => x.art === 'divergent').id],
        kon: [terme.find(x => x.art === 'konvergent').id],
        zyk: [terme.find(x => x.art === 'zyklisch').id]
      } });

    b.kasten('Zwei Zahlenwerte');
    b.satz('Der <b>divergente</b> Iterator hat genau einen Startwert, der nicht ' +
           'davonläuft — einen Fixpunkt. Welchen?');
    b.komplex({ name: 'S3A1.fix', vor: 'z =', soll: Z.K(0,0), p: 1,
                platzhalter: 'z. B. 0' });
    b.satz('Wie lang ist der Zyklus des <b>zyklischen</b> Iterators?');
    b.reell({ name: 'S3A1.laenge', vor: 'Zyklenlänge',
              soll: (Math.abs(a1.re + 1) < 1e-9 ? 2 : 4), p: 1 });
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S3-A02', punkte: 3, titel: 'Zyklenlänge bestimmen',
  auftrag: 'Alle drei Zahlen haben den Betrag 1. Wie lange dauert es, bis sich eine Bahn wiederholt?',
  bauen(b){
    /* NEU (gemeinsam entschieden, 2026-08-21): Der erste der drei
       Iteratoren wird angeklickt statt getippt. Rike: «Zeichnen Sie
       doch mal den Pfeil ein, um zu erkennen, was hier für ein Zyklus
       vorkommt … die Frage ist nur, ob sie in der Prüfung diese
       Hilfestellung wirklich brauchen.»

       Die Antwort hier: nicht als Hilfe, sondern als erste Teilaufgabe.
       Wer die Bahn einmal angeklickt hat, hat das Verfahren in der
       Hand - und beantwortet die beiden anderen mit dem Kopf. So
       lehrt der erste Teil, was die beiden anderen prüfen. Das
       Zeichenbrett unten bleibt für alle, die lieber selbst zeichnen. */
    const winkel = [ w([90, 180, 270]), w([45, 135, 225, 315]),
                     w([30, 60, 120, 150, 210, 240, 300, 330]) ];

    b.kasten('Erst einmal ausprobieren');
    b.satz('Beim ersten Iterator ist <b>f(z) = ' + exakt(winkel[0]) + ' · z</b>. ' +
           'Der Startwert ist <b>z₀ = 1</b> — der schwarze Punkt rechts.');
    b.satz('<b>Klicken Sie alle Punkte an, die die Bahn besucht</b>, den Startwert ' +
           'eingeschlossen. Dann sehen Sie die Zyklenlänge unmittelbar: Es ist die ' +
           'Anzahl der angeklickten Punkte.');

    /* Der Kreis ist in 24 Schritte zu 15° geteilt. Alle vorkommenden
       Winkel sind Vielfache davon, jede Bahn trifft also genau auf
       markierte Punkte. */
    const SCHRITTE = 24, SCHRITTWINKEL = 360 / SCHRITTE;
    const f = ZE.flaeche({ max: 1.35, breite: 400, gitter: false, achsenzahlen: false });
    f.kreis(1, { gestrichelt: false, farbe: 'var(--linie)' });
    const kreispunkte = [];
    for (let k = 1; k < SCHRITTE; k++){
      const g = k * SCHRITTWINKEL;
      kreispunkte.push({ name: 'g' + g, grad: g });
      f.punkt(cis(g), { ziel: 'g' + g, marke: g + '°', richtung: 'aussen',
                        abstand: k % 2 ? 19 : 11, farbe: 'var(--akzent)', gr: 2.3 });
    }
    kreispunkte.push({ name: 'g0', grad: 0 });
    f.punkt(cis(0), { ziel: 'g0', marke: 'z₀', richtung: 'aussen', abstand: 12,
                      farbe: 'var(--tinte)', gr: 3.2 });

    const bahn = [];
    for (let k = 0, g = 0; k < SCHRITTE; k++, g = (g + winkel[0]) % 360){
      const name = 'g' + g;
      if (bahn.indexOf(name) >= 0) break;
      bahn.push(name);
    }
    b.punktwahl({ name: 'S3A2.bahn', flaeche: f, richtig: bahn, p: 1 });

    b.kasten('Und jetzt im Kopf');
    b.satz('Bei diesen beiden geht es ohne Bild — bestimmen Sie die Zyklenlänge.');
    [1, 2].forEach(k => {
      b.formel('<b>(' + 'abc'[k] + ')</b>&emsp;f(z) = ' + exakt(winkel[k]) + ' · z');
      b.reell({ name: 'S3A2.' + k, vor: 'Zyklenlänge', soll: zyklenlaenge(winkel[k]), p: 1 });
    });
    b.hinweis('Die Zahlen stehen in exakter Form — der Winkel lässt sich ablesen, ' +
              'ohne zu rechnen.');
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S3-A03', punkte: 3, titel: 'Zyklen bei f(z) = z²',
  auftrag: 'Klicken Sie die gesuchten Punkte in der Zeichnung an.',
  bauen(b){
    /* Auf dem Einheitskreis wird aus z ↦ z² im Winkel t ↦ 2t.
       Die Punkte t = j/(2^L − 1) sind genau die mit Periode L.
       Mit L = 3 und L = 4 zusammen: Zyklen der Längen 2, 3 und 4,
       dazu der Fixpunkt z = 1. Der Nullpunkt kommt als zweiter
       Fixpunkt dazu — er liegt nicht auf dem Kreis. Zusammen 22
       Punkte, wie in der Moodle-Fassung.

       FEHLERBEHOBEN (2026-08-21): Die erste Fassung hielt t als
       gerundete Dezimalzahl und verdoppelte diese. 1/7 wird zu
       0,1429; das Doppelte davon ist 0,2858, im Punktesatz steht
       aber 0,2857. Die Bahn fand ihren Nachfolger nicht mehr und
       lief ins Leere - gemessen: eine «Bahn» der Länge 504 statt
       Zyklen der Längen 1 bis 4.

       Ursache: Rundung vor der Iteration. Jetzt wird ganzzahlig
       gerechnet. Gemeinsamer Nenner von 7 und 15 ist 105; jeder
       Punkt ist k/105, und Verdoppeln heisst k ↦ 2k mod 105. Das
       ist exakt und bleibt in der Menge. */
    const NENNER = 105;                      // kgV von 7 und 15
    const zaehler = Array.from(new Set(
      [].concat(
        Array.from({length: 7},  (x,j) => j * 15),   // j/7
        Array.from({length: 15}, (x,j) => j * 7)     // j/15
      ))).sort((a,c) => a - c);

    const punkte = zaehler.map((k, i) => ({
      name: 'z' + i, k: k, z: cis(k / NENNER * 360)
    }));
    const nullpunkt = { name: 'z' + punkte.length, k: null, z: Z.K(0,0) };
    punkte.push(nullpunkt);

    const nachName = {};
    punkte.forEach(p => { if (p.k !== null) nachName[p.k] = p.name; });
    const nachfolger = p => p.k === null ? p.name : nachName[(2 * p.k) % NENNER];

    const bahnen = [];
    const gesehen = new Set();
    punkte.forEach(p => {
      if (gesehen.has(p.name)) return;
      const bahn = [];
      let d = p;
      while (d && !gesehen.has(d.name)){
        gesehen.add(d.name);
        bahn.push(d.name);
        d = punkte.find(q => q.name === nachfolger(d));
      }
      bahnen.push(bahn);
    });
    const fixpunkte = bahnen.filter(x => x.length === 1).map(x => x[0]);
    const laengen = [2,3,4].filter(l => bahnen.some(x => x.length === l));
    const gefragt = w(laengen);

    /* NEU (gemeinsam entschieden, 2026-08-21): EIN Bild statt zwei,
       dafuer zwei Farbebenen - und daneben die LISTE der Punkte.

       Rike hat zweierlei angemerkt. Erstens: «Ob wir wirklich zweimal
       das gleiche Bild brauchen.» Nein - ein Umschalter genuegt.

       Zweitens, und das wiegt schwerer: «Wir gehen nur noch rein
       optisch an die Sache ran. Der eigentliche Clou war, dass man,
       wenn man die Zahlenwerte zu diesen z's hat, rechnerisch
       erkennt, wo der Zyklus der Laenge drei ist.»

       Sie hat recht, und der Altbestand zeigt es: Neben dem Bild lag
       dort eine Liste (Quadratfunktion/Liste.tex), die jeden Punkt
       als 1·cis(j/n · 360°) ausweist. In dieser Form ist das
       Verdoppeln eine Bruchrechnung - 2·(1/7) = 2/7, 4/7, 8/7 = 1/7,
       und der Dreierzyklus steht da. Ohne die Liste bleibt nur
       Hinsehen. Die Liste ist also nicht Beiwerk, sondern die
       Aufgabe. Sie ist wieder da. */
    function bruchText(k){
      const ggt = (x,y) => y ? ggt(y, x % y) : x;
      const g = ggt(k, NENNER) || 1;
      const z = k / g, n = NENNER / g;
      if (z === 0) return '0';
      return n === 1 ? String(z) : z + '/' + n;
    }
    const liste = P.el('div', 'punkteliste');
    const tab = document.createElement('table');
    punkte.forEach(pt => {
      const tr = document.createElement('tr');
      const grad = pt.k === null ? null : pt.k / NENNER * 360;
      tr.innerHTML = '<td class="nr">' + pt.name + '</td><td>=</td>' +
        (pt.k === null
          ? '<td colspan="2">0 (Nullpunkt)</td>'
          : '<td>1 · cis(<span class="bruch">' + bruchText(pt.k) + ' · 360°</span>)</td>' +
            '<td>= ' + Z.zahlText(grad, 1) + '°</td>');
      tab.appendChild(tr);
    });
    liste.appendChild(tab);

    const f = ZE.flaeche({ max: 1.35, breite: 420, gitter: false, achsenzahlen: false });
    f.kreis(1, { gestrichelt: false, farbe: 'var(--linie)' });
    const marke = (fl, pt, i) => fl.punkt(pt.z, { ziel: pt.name, marke: pt.name,
      richtung: 'aussen', abstand: i % 2 ? 18 : 10,
      farbe: 'var(--akzent)', gr: 2.4 });
    punkte.forEach((pt, i) => marke(f, pt, i));

    const passende = bahnen.filter(x => x.length === gefragt);

    b.kasten('Fixpunkte und Zyklen');
    b.satz('Unter dem Iterator <b>f(z) = z²</b> verdoppelt sich auf dem ' +
           'Einheitskreis der Winkel. Die ' + punkte.length + ' Punkte sind ' +
           'entweder Fixpunkte oder gehören zu Zyklen der Länge 2, 3 oder 4.');
    b.hinweis('Die Liste rechts gibt jeden Punkt als Bruchteil des Vollwinkels — ' +
              'damit lässt sich das Verdoppeln <b>rechnen</b> statt raten. ' +
              'Wählen Sie oben, welche Antwort Sie gerade eintragen; ein Klick ' +
              'wählt einen Punkt, ein zweiter nimmt ihn zurück.');

    b.punktEbenen({ name: 'S3A3', flaeche: f, neben: liste, ebenen: [
      { schluessel: 'fix', text: '(a) Fixpunkte', farbe: 'var(--richtig)',
        richtig: fixpunkte, p: 1 },
      { schluessel: 'zyk', text: '(b) ein Zyklus der Länge ' + gefragt,
        farbe: 'var(--falsch)', p: 1,
        pruefer: g => passende.some(bahn =>
          bahn.length === g.length && bahn.every(x => g.indexOf(x) >= 0)),
        sollText: passende.map(x => x.join('+')).join('  oder  ') }
    ]});

    /* (c) Die Zählkette */
    const y = w([5,6,7,8,9]);
    const genau = genauPeriode(y);
    b.kasten('Und wenn es mehr werden');
    b.satz('Um einen Zyklus der Länge <b>' + y + '</b> zu finden, muss man die ' +
           'Gleichung <b>z<sup>m</sup> = z</b> lösen.');
    b.reell({ name: 'S3A3.m',    vor: 'm =', soll: Math.pow(2,y), p: 0.25 });
    b.reell({ name: 'S3A3.n',    vor: 'Diese Gleichung hat … Lösungen',
              soll: Math.pow(2,y), p: 0.25 });
    b.reell({ name: 'S3A3.genau', vor: 'Davon gehören zu Zyklen genau der Länge ' + y,
              soll: genau, p: 0.25 });
    b.reell({ name: 'S3A3.zyklen', vor: 'Das sind … Zyklen', soll: genau / y, p: 0.25 });
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S3-A04', punkte: 4, titel: 'Begriffe einordnen',
  auftrag: 'Ziehen Sie jede Aussage zu dem Begriff, über den sie etwas Richtiges sagt.',
  bauen(b){
    /* NEU (gemeinsam entschieden, 2026-08-21): Kaertchenaufgabe statt
       Ankreuzen. Der Begriffskorpus traegt schon Gruppenmarken A/B/C -
       die Aufgabe war von Anfang an als Sortierung gedacht.

       Je Begriff zwei zutreffende Aussagen, dazu drei Aussagen, die zu
       keinem der vier Begriffe passen. Dass diese drei im Vorrat
       bleiben, ergibt sich von selbst, wenn alle Felder stimmen -
       geprueft wird je Feld. */
    const alle = window.BEGRIFFE || {};

    /* Hoechstens zwei Begriffe aus derselben Gruppe. Der Korpus traegt
       Gruppenmarken A/B/C; ohne sie zieht der Zufall gern Paare wie
       «Divergenzbereich» und «Divergente Folge» zusammen. Die sind zwar
       unterscheidbar, aber die Aufgabe wird dann zu einer Uebung im
       Wortklauben statt im Begriffsverstaendnis. */
    const nachGruppe = {};
    Object.keys(alle).forEach(n => {
      const g = alle[n].gruppe || '?';
      (nachGruppe[g] = nachGruppe[g] || []).push(n);
    });
    const namen = [];
    mischen(Object.keys(nachGruppe)).forEach(g => {
      mischen(nachGruppe[g]).slice(0, 2).forEach(n => namen.push(n));
    });
    while (namen.length > 4) namen.pop();
    const gewaehlt = mischen(namen).slice(0, 4);
    namen.length = 0;
    gewaehlt.forEach(n => namen.push(n));

    const karten = [], richtig = {}, felder = [];
    let lauf = 0;
    namen.forEach((name, k) => {
      const d = alle[name];
      const feldId = 'f' + k;
      felder.push({ id: feldId, kopf: '<b>' + name + '</b>' });
      richtig[feldId] = [];
      mischen(d.richtig).slice(0, 2).forEach(text => {
        const id = 'a' + (lauf++);
        karten.push({ id: id, text: text });
        richtig[feldId].push(id);
      });
    });

    /* Ablenker aus den FALSCHEN Aussagen derselben Begriffe: Sie
       klingen einschlaegig und lassen sich nur inhaltlich ausschliessen.
       Ablenker aus fremden Themen waeren am Wortlaut zu erkennen. */
    const falsche = mischen(namen.reduce((s, n) => s.concat(alle[n].falsch), []));
    falsche.slice(0, 3).forEach(text => {
      karten.push({ id: 'a' + (lauf++), text: text });
    });

    b.kasten('Vier Begriffe');
    b.satz('Zu jedem Begriff gehören <b>genau zwei</b> der Aussagen. ' +
           'Drei Aussagen bleiben übrig — sie sind falsch und gehören zu keinem ' +
           'der vier Begriffe.');
    b.hinweis('Ziehen zum Zuordnen, Doppelklick legt eine Karte zurück.');
    b.kartenZuordnung({ name: 'S3A4', p: 1, fasst: 2,
      vorratMarke: 'Aussagen',
      karten: mischen(karten), felder: felder, richtig: richtig });
  }
}

];

window.PIA.pruefung({
  station: 3,
  startseite:
    '<p>Vier Aufgaben. Es geht darum, was aus einem Startwert wird, wenn man ' +
    'dieselbe Funktion <b>immer wieder</b> auf das Ergebnis anwendet: Läuft er ' +
    'davon, nähert er sich einem Punkt, oder kehrt er zurück? Dazu die Begriffe, ' +
    'mit denen man darüber spricht.</p>' +
    '<p><b>Zwei Aufgaben zum Anklicken.</b> In Aufgabe 3 wählen Sie Punkte direkt ' +
    'in der Zeichnung aus — ein Klick wählt, ein zweiter nimmt zurück. Bei der ' +
    'Frage nach einem Zyklus gibt es <b>mehrere richtige Antworten</b>; eine genügt.</p>' +
    '<p><b>Reden Sie mit.</b> Bei den Zyklen ist der Weg wichtiger als das ' +
    'Ergebnis: Sagen Sie, wie Sie einen Punkt weiterverfolgen.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Was aus einem Startwert wird, wenn man dieselbe Funktion immer ' +
            'wieder anwendet: Bahnen, Fixpunkte, Zyklen — und die Begriffe dazu.',
  aufgaben: AUFGABEN,
  erklaerstellen: [
    { nach: 2, frage: 'Woran sehen Sie einer Zahl vom Betrag 1 die Zyklenlänge an?' },
    { nach: 3, frage: 'Warum gehören nicht alle Lösungen von z^(2^y) = z zu Zyklen genau der Länge y?' }
  ]
});
})();
