/* ============================================================
   Station 1 - Komplexe Zahlen

   Sechs Aufgaben, 15 Punkte. Zuschnitt und Punkte nach
   station1/VORSCHLAG.md, abgestimmt am 21.08.2026.

   Alle Werte werden bei jedem Durchgang neu gezogen. Beim
   Wiedereintritt bekommt dieselbe Aufgabe damit von selbst
   andere Zahlen.
   ============================================================ */
(function(){
'use strict';
const Z = window.Zahl, ZE = window.Zeichnen, P = window.PIA;
const w = P.wuerfel, mischen = P.mischen, zufall = P.zufall;

/* Ganzzahlige komplexe Zahl, nicht null, nicht auf einer Achse */
function ganzzahl(spanne){
  const s = spanne || 5;
  for(;;){
    const re = Math.round(zufall(-s, s)), im = Math.round(zufall(-s, s));
    if (re !== 0 && im !== 0) return Z.K(re, im);
  }
}

/* Zahl mit vorgegebenem Betragsbereich, weg von den Achsen.
   Die Grenzen stammen aus TOLERANZEN.md: ohne sie wird z3 bei der
   Multiplikation zehnmal so lang wie die Operanden. */
function betragIn(min, max){
  for(;;){
    const r = zufall(min, max), phi = zufall(0, 2*Math.PI);
    const z = Z.K(r*Math.cos(phi), r*Math.sin(phi));
    if (Math.abs(z.re) >= 0.5 && Math.abs(z.im) >= 0.5)
      return Z.K(Math.round(z.re*10)/10, Math.round(z.im*10)/10);
  }
}

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S1-A01', punkte: 3, titel: 'Rechnen mit komplexen Zahlen',
  auftrag: 'Rechnen Sie aus und tragen Sie das Ergebnis ein. Brüche dürfen Sie stehen lassen.',
  bauen(b){
    b.kasten('Zwei Rechnungen');
    b.hinweis('Sie dürfen <b>7/13</b> schreiben oder <b>0.54</b> — beides gilt. ' +
              'Runden Sie nicht gröber als auf zwei Stellen.');

    [['×', 0], ['÷', 1]].forEach(([zeichen, k]) => {
      const z1 = ganzzahl(5), z2 = ganzzahl(5);
      let z3;
      do { z3 = ganzzahl(5); } while (z3.re === 0 && z3.im === 0);
      const op1 = w(['+', '−']);
      const innen = zeichen === '×' ? Z.mal(z2, z3) : Z.durch(z2, z3);
      const soll = op1 === '+' ? Z.plus(z1, innen) : Z.minus(z1, innen);

      b.formel('<b>' + (k === 0 ? 'a' : 'b') + ')</b>&emsp;(' +
        Z.normalform(z1) + ') ' + op1 + ' ((' + Z.normalform(z2) + ') ' +
        zeichen + ' (' + Z.normalform(z3) + '))');
      b.komplex({ name: 'S1A1' + (k===0?'a':'b'), vor: '=', soll: soll, p: 1.5 });
    });
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S1-A02', punkte: 2, titel: 'Darstellungsformen wechseln',
  auftrag: 'Ordnen Sie jeder Zahl in Normalform ihre Polarform zu. Es stehen mehr Polarformen zur Auswahl, als gebraucht werden.',
  bauen(b){
    /* Vier Fälle wie im Altbestand: auf einer Achse, auf der
       Winkelhalbierenden, zweimal beliebig. Die Konstruktion ist
       gut - sie zwingt dazu, die einfachen Fälle zu erkennen. */
    const halb = () => Math.round(zufall(-10, 10) * 2) / 2;
    function achse(){
      const v = halb() || 3;
      return w([true,false]) ? Z.K(v, 0) : Z.K(0, v);
    }
    function diagonal(){ const v = halb() || 2.5; return Z.K(v, v); }
    function beliebig(){
      for(;;){
        const re = halb(), im = halb();
        if (re !== 0 && im !== 0 && Math.abs(re) !== Math.abs(im)) return Z.K(re, im);
      }
    }
    const zahlen = mischen([achse(), diagonal(), beliebig(), beliebig()]);
    const polar = z => Z.zahlText(Z.betrag(z), 2) + ' · cis(' +
                       Z.zahlText(Z.gradAusArg(z), 1) + '°)';

    /* Zwei Ablenker: richtiger Betrag mit falschem Winkel und
       umgekehrt. Beliebig gezogene Ablenker wären zu leicht. */
    const ablenker = [
      polar(Z.mal(zahlen[0], Z.K(Math.cos(0.9), Math.sin(0.9)))),
      polar(Z.mal(zahlen[1], Z.K(1.45, 0)))
    ];
    const rechts = mischen(zahlen.map(polar).concat(ablenker));

    b.kasten('Normalform und Polarform');
    b.satz('Ziehen Sie zu jeder Zahl in <b>Normalform</b> die passende ' +
           '<b>Polarform</b>. Zwei Karten bleiben übrig — sie gehören zu keiner ' +
           'der vier Zahlen.');
    b.hinweis('Ziehen zum Zuordnen, Doppelklick legt eine Karte zurück.');
    b.kartenZuordnung({ name: 'S1A2', p: 0.5,
      karten: rechts.map((s, k) => ({ id: 'p' + k, text: s })),
      felder: zahlen.map((z, k) => ({ id: 'z' + k,
        kopf: '<b>' + Z.normalform(z, 2) + '</b>' })),
      richtig: zahlen.reduce((m, z, k) => {
        m['z' + k] = ['p' + rechts.indexOf(polar(z))];
        return m; }, {}),
      vorratMarke: 'Polarformen' });
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S1-A03', punkte: 3, titel: 'Wurzeln berechnen',
  auftrag: 'Geben Sie alle Lösungen in Polarform an. Die Reihenfolge spielt keine Rolle.',
  bauen(b){
    const n = w([2, 3]);
    const z = ganzzahl(10);
    const r = Math.pow(Z.betrag(z), 1/n);
    const phi0 = Z.arg(z);
    const soll = [];
    for (let k = 0; k < n; k++){
      const phi = (phi0 + 2*Math.PI*k) / n;
      soll.push({ r: r, g: ((phi*180/Math.PI) % 360 + 360) % 360 });
    }
    b.kasten('Alle Lösungen einer Gleichung');
    b.formel('Lösen Sie&emsp;<b>z<sup>' + n + '</sup> = ' + Z.normalform(z) + '</b>');
    b.hinweis('Es gibt genau ' + n + ' Lösungen. Winkel im Gradmass; ' +
              '−120° gilt wie 240°.');
    b.polarMenge({ name: 'S1A3', soll: soll, p: 3/n });
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S1-A04', punkte: 3, titel: 'Bild zu Operation',
  auftrag: 'Lesen Sie aus der Zeichnung, wie die drei Zahlen zusammenhängen.',
  bauen(b){
    const op = w(['+', '−', '×', '÷']);
    const z1 = betragIn(1.5, 4.5);
    const z2 = betragIn(0.6, 1.8);
    const z3 = op === '+' ? Z.plus(z1, z2)
             : op === '−' ? Z.minus(z1, z2)
             : op === '×' ? Z.mal(z1, z2)
             : Z.durch(z1, z2);

    const max = ZE.achseFuer([z1, z2, z3], 2);
    const f = ZE.flaeche({ max: max, breite: 440 });
    f.pfeil(z1, { farbe: 'var(--tinte)', marke: 'z₁' });
    f.pfeil(z2, { farbe: 'var(--matt)',  marke: 'z₂' });
    f.pfeil(z3, { farbe: 'var(--akzent)', dicke: 2.2, marke: 'z₃' });

    const optionen = ['z₁ + z₂ = z₃', 'z₁ − z₂ = z₃', 'z₁ × z₂ = z₃',
                      'z₁ ÷ z₂ = z₃', 'kein Zusammenhang'];

    b.kasten('Welcher Zusammenhang?');
    /* Zeichnung links, Fragen rechts: sonst muss man zwischen Bild und
       Antwort hin- und herscrollen. */
    b.zweiSpalten(
      l => { l.bild(f); },
      r => {
        r.wahl({ name: 'S1A4.op', optionen: optionen, mischen: false,
                 richtig: optionen.indexOf('z₁ ' + op + ' z₂ = z₃'), p: 2 });
        r.satz('Lesen Sie ausserdem <b>z₃</b> aus der Zeichnung ab — auf einen ' +
               'halben Rasterschritt genau, das sind hier ±' +
               Z.zahlText(f.rasterschritt/2, 2) + '.');
        r.komplexZweiFelder({ name: 'S1A4.z3', vor: 'z₃ ≈', soll: z3,
                              raster: f.rasterschritt, p: 1 });
      });
  }
},

/* ---------------------------------------------------------- 5 */
{ nr: 5, id: 'S1-A05', punkte: 2, titel: 'Operation zu Bild (+ − × ÷)',
  auftrag: 'Klicken Sie den Pfeil an, der das Ergebnis der angegebenen Rechnung ist.',
  bauen(b){
    const op = w(['+', '−', '×', '÷']);
    const z1 = betragIn(1.5, 4.5);
    const z2 = betragIn(0.6, 1.8);
    const richtig = op === '+' ? Z.plus(z1, z2)
                  : op === '−' ? Z.minus(z1, z2)
                  : op === '×' ? Z.mal(z1, z2)
                  : Z.durch(z1, z2);

    /* Die beiden Ablenker sind Ergebnisse ANDERER Operationen -
       ein zufälliger Pfeil wäre zu leicht auszuschliessen. */
    const andere = mischen(['+','−','×','÷'].filter(x => x !== op)).slice(0,2);
    const kandidaten = mischen([{ z: richtig, echt: true }].concat(
      andere.map(o => ({ z: o === '+' ? Z.plus(z1,z2) : o === '−' ? Z.minus(z1,z2)
                          : o === '×' ? Z.mal(z1,z2) : Z.durch(z1,z2), echt: false }))));

    const alle = [z1, z2].concat(kandidaten.map(k => k.z));
    const f = ZE.flaeche({ max: ZE.achseFuer(alle, 2), breite: 440 });
    f.pfeil(z1, { farbe: 'var(--tinte)', marke: 'z₁' });
    f.pfeil(z2, { farbe: 'var(--matt)',  marke: 'z₂' });
    let richtigesZiel = null;
    kandidaten.forEach((k, j) => {
      const name = 'w' + (j+1);
      if (k.echt) richtigesZiel = name;
      f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 2, ziel: name, marke: name });
    });

    b.kasten('Welcher Pfeil ist das Ergebnis?');
    b.formel('<b>z₁ ' + op + ' z₂</b>');
    b.hinweis('Klicken Sie in der Zeichnung auf den passenden Pfeil.');
    b.bildwahl({ name: 'S1A5', flaeche: f, richtig: richtigesZiel, p: 2 });
  }
},

/* ---------------------------------------------------------- 6 */
{ nr: 6, id: 'S1-A06', punkte: 2, titel: 'Operation zu Bild (Potenz und Wurzel)',
  auftrag: 'Klicken Sie den Pfeil an, der das Ergebnis der angegebenen Rechnung ist.',
  bauen(b){
    const n = w([2, 3]);
    const wurzel = w([true, false]);
    /* Betrag nahe bei 1, damit Potenz und Wurzel im Bild bleiben
       und der Winkel entscheidet - nicht die Länge. */
    const r = zufall(1.2, 1.55), phi = zufall(0.5, 2.4) * w([1,-1]);
    const z = Z.K(r*Math.cos(phi), r*Math.sin(phi));

    const potenz = Z.hoch(z, Z.K(n));
    const wurzelZ = Z.hoch(z, Z.K(1/n));
    const richtig = wurzel ? wurzelZ : potenz;
    const falsch1 = wurzel ? potenz : wurzelZ;
    /* Zweiter Ablenker: richtiger Betrag, gespiegelter Winkel -
       trifft genau, wer das Vorzeichen des Winkels verwechselt. */
    const falsch2 = Z.K(richtig.re, -richtig.im);

    const kandidaten = mischen([
      { z: richtig, echt: true }, { z: falsch1 }, { z: falsch2 }]);
    const alle = [z].concat(kandidaten.map(k => k.z));
    const f = ZE.flaeche({ max: ZE.achseFuer(alle, 1.5), breite: 440 });
    f.kreis(1);
    f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z' });
    let richtigesZiel = null;
    kandidaten.forEach((k, j) => {
      const name = 'w' + (j+1);
      if (k.echt) richtigesZiel = name;
      f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 2, ziel: name, marke: name });
    });

    b.kasten('Welcher Pfeil ist das Ergebnis?');
    b.formel('<b>' + (wurzel ? 'z<sup>1/' + n + '</sup>' : 'z<sup>' + n + '</sup>') + '</b>');
    b.hinweis('Der gestrichelte Kreis ist der Einheitskreis. ' +
              (wurzel ? 'Eine von ' + n + ' Wurzeln ist eingezeichnet.' : ''));
    b.bildwahl({ name: 'S1A6', flaeche: f, richtig: richtigesZiel, p: 2 });
  }
}

];

window.PIA.pruefung({
  station: 1,
  startseite:
    '<p>Sechs Aufgaben. Es geht ums <b>Rechnen</b> mit komplexen Zahlen, um den ' +
    'Wechsel zwischen <b>Normal- und Polarform</b>, um <b>Wurzeln</b> — und ' +
    'darum, den Zusammenhang zwischen einer Rechnung und ihrem <b>Bild</b> in ' +
    'beide Richtungen zu sehen.</p>' +
    '<p><b>So arbeiten Sie.</b> Oben stehen die Aufgaben; Sie können frei ' +
    'zwischen ihnen wechseln und jederzeit zurück. Eingetragenes bleibt stehen. ' +
    'Wo eine Zahl verlangt ist, sagt Ihnen die Seite sofort, ob sie Ihre Eingabe ' +
    '<i>lesen</i> kann — aber nicht, ob sie stimmt. Das erfahren Sie erst am ' +
    'Schluss.</p>' +
    '<p><b>Reden Sie mit.</b> Die Aufnahme läuft. Erzählen Sie, was Sie tun und ' +
    'warum — auch wenn Sie nicht weiterkommen. Wer eine Aufgabe richtig hat, sie ' +
    'aber nicht erklären kann, hat sie nicht bestanden. Umgekehrt hilft eine gute ' +
    'Erklärung, auch wenn das Ergebnis daneben liegt.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Rechnen mit komplexen Zahlen, Wechsel zwischen Normal- und ' +
            'Polarform, Wurzeln, und der Zusammenhang zwischen Rechnung und Bild.',
  aufgaben: AUFGABEN,
  erklaerstellen: [
    { nach: 3, frage: 'Warum hat eine Zahl drei dritte Wurzeln, und wie liegen sie zueinander?' },
    { nach: 6, frage: 'Woran erkennen Sie eine Multiplikation im Bild?' }
  ]
});
})();
