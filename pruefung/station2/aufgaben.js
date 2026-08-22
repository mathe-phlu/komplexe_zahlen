/* ============================================================
   Station 2 - Komplexe Funktionen

   Sechs Aufgaben, 15 Punkte. Nach station2/VORSCHLAG.md.

   Die Station prüft eine Sache in beide Richtungen: Funktion →
   Wirkung (Aufgabe 1) und Wirkung → Funktion (2 und 3). Dazu das
   Wiedererkennen an Bildern (4, 5, 6).
   ============================================================ */
(function(){
'use strict';
const Z = window.Zahl, ZE = window.Zeichnen, P = window.PIA;
const w = P.wuerfel, mischen = P.mischen, zufall = P.zufall;

const halb = () => Math.round(zufall(-5, 5) * 2) / 2;
const konj = z => Z.K(z.re, -z.im);
const cis  = g => Z.K(Math.cos(g*Math.PI/180), Math.sin(g*Math.PI/180));

/* Punkte entlang eines geschlossenen Streckenzugs - genug davon,
   damit krumme Bilder auch krumm aussehen. */
function randpunkte(ecken, jeSeite){
  const n = jeSeite || 14, p = [];
  for (let k = 0; k < ecken.length; k++){
    const a = ecken[k], b = ecken[(k+1) % ecken.length];
    for (let j = 0; j < n; j++){
      const s = j / n;
      p.push(Z.K(a.re + (b.re-a.re)*s, a.im + (b.im-a.im)*s));
    }
  }
  p.push(ecken[0]);
  return p;
}

/* Die vier Abbildungen der Station */
const ABBILDUNG = {
  quadrat:      { name: 'die Quadratfunktion z → z²',      f: z => Z.mal(z, z) },
  kreis:        { name: 'die Kreisspiegelung z → 1/z̄',     f: z => {
                    const n = z.re*z.re + z.im*z.im;
                    return n < 1e-6 ? Z.K(0,0) : Z.K(z.re/n, z.im/n); } }
};

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S2-A01', punkte: 4, titel: 'Funktionen interpretieren',
  auftrag: 'Bestimmen Sie Streckfaktor, Drehwinkel und Drehzentrum der Drehstreckung.',
  bauen(b){
    /* a rein reell, rein imaginär oder auf der Winkelhalbierenden -
       so bleiben Betrag und Winkel handlich. a = 1 wäre keine
       Drehstreckung, sondern eine Verschiebung: ausgeschlossen. */
    let a;
    do {
      const art = w(['reell', 'imaginaer', 'diagonal']);
      const v = halb() || 2;
      a = art === 'reell' ? Z.K(v, 0)
        : art === 'imaginaer' ? Z.K(0, v)
        : Z.K(v, v);
    } while ((Math.abs(a.re-1) < 1e-9 && Math.abs(a.im) < 1e-9) ||
             Math.abs(Z.betrag(a) - 0) < 1e-9);

    let bb;
    do { bb = Z.K(halb(), halb()); }
    while (bb.re === 0 || bb.im === 0 || Math.abs(bb.re) === Math.abs(bb.im));

    const zentrum = Z.durch(bb, Z.minus(Z.K(1,0), a));

    b.kasten('Die Wirkung bestimmen');
    b.formel('<b>f(z) = ' + Z.normalformGeklammert(a, 2) + ' · z + ' +
             Z.normalformGeklammert(bb, 2) + '</b>');
    b.satz('Diese Funktion ist eine Drehstreckung. Bestimmen Sie:');
    b.reell({ name: 'S2A1.k',  vor: 'Streckfaktor', soll: Z.betrag(a), p: 1 });
    b.winkel({ name: 'S2A1.phi', vor: 'Drehwinkel', soll: Z.gradAusArg(a), p: 1 });
    b.komplexZweiFelder({ name: 'S2A1.c', vor: 'Drehzentrum', soll: zentrum, p: 2 });
    b.hinweis('Das Drehzentrum ist der Punkt, der auf sich selbst abgebildet wird.');
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S2-A02', punkte: 2, titel: 'Funktion aufstellen: Drehstreckung',
  auftrag: 'Stellen Sie die Funktion auf, die die beschriebene Drehstreckung leistet.',
  bauen(b){
    const k   = Math.round(zufall(0.5, 3) * 2) / 2 || 1.5;
    const phi = w([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315]);
    let c;
    do { c = Z.K(Math.round(zufall(-4,4)), Math.round(zufall(-4,4))); }
    while (c.re === 0 && c.im === 0);

    const a  = Z.mal(cis(phi), Z.K(k, 0));
    const bb = Z.mal(c, Z.minus(Z.K(1,0), a));

    b.kasten('Die Funktion aufstellen');
    b.satz('Gesucht ist eine Drehstreckung mit <b>Streckfaktor ' + Z.zahlText(k,2) +
           '</b>, <b>Drehwinkel ' + phi + '°</b> und <b>Drehzentrum ' +
           Z.normalform(c, 1) + '</b>.');
    /* Die Funktion als Ganzes, mit Feldern mittendrin - statt zweier
       beschrifteter Felder unter einer Formel, die dasselbe meint. */
    b.formelZeile(['f(z) =', { name: 'S2A2.a', soll: a, p: 1, platzhalter: 'a' },
                   '· z +',  { name: 'S2A2.b', soll: bb, p: 1, platzhalter: 'b' }]);
    b.hinweis('Zwei Nachkommastellen genügen. Sie dürfen auch ' +
              '<b>1.5·cis(60°)</b> schreiben statt der Normalform.');
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S2-A03', punkte: 2, titel: 'Funktion aufstellen: Spiegelung',
  auftrag: 'Stellen Sie die Funktion auf, die an der eingezeichneten Geraden spiegelt.',
  bauen(b){
    /* NEU (gemeinsam entschieden, 2026-08-21): Aufgabe neu gebaut.
       Rike: «Bei der Spiegelung verstehe ich den Aufbau noch nicht so
       richtig.» Drei Gruende dafuer, alle behoben:

       1  Die Schablone «Faktor · ? + Summand» stand ohne Beispiel da.
          Jetzt steht die Spiegelung an der x-Achse als Muster dabei -
          sie verraet nichts, zeigt aber, welche Gestalt gesucht ist.
       2  Die Entscheidung z gegen z̄ war ein eigener Block NEBEN der
          Formel. Jetzt steht sie mitten drin, wo sie hingehoert.
       3  Das Bild zeigte nur die Gerade. Jetzt zeigt es ein Dreieck
          und sein Spiegelbild - damit ist die Umkehr des Umlaufsinns
          zu sehen, und das ist der Grund, aus dem es z̄ braucht.
          Genau die Frage steht als Erklaerstelle dahinter. */
    const art = w(['waagrecht', 'senkrecht', 'ursprung']);
    let text, faktor, summand, spiegeln, gerade;

    if (art === 'waagrecht'){
      const k = Math.round(zufall(-3,3)) || 2;
      text = 'einer Geraden <b>parallel zur x-Achse bei y = ' + k + '</b>';
      faktor = Z.K(1,0); summand = Z.K(0, 2*k);
      spiegeln = z => Z.K(z.re, 2*k - z.im);
      gerade = [Z.K(-9,k), Z.K(9,k)];
    } else if (art === 'senkrecht'){
      const k = Math.round(zufall(-3,3)) || 2;
      text = 'einer Geraden <b>parallel zur y-Achse bei x = ' + k + '</b>';
      faktor = Z.K(-1,0); summand = Z.K(2*k, 0);
      spiegeln = z => Z.K(2*k - z.re, z.im);
      gerade = [Z.K(k,-9), Z.K(k,9)];
    } else {
      const phi = w([30, 45, 60, 120, 135, 150]);
      text = 'einer <b>Ursprungsgeraden</b>, die mit der x-Achse einen Winkel ' +
             'von <b>' + phi + '°</b> einschliesst';
      faktor = cis(2*phi); summand = Z.K(0,0);
      spiegeln = z => Z.mal(cis(2*phi), konj(z));
      const r = cis(phi);
      gerade = [Z.K(-9*r.re,-9*r.im), Z.K(9*r.re,9*r.im)];
    }

    /* Ein Dreieck, das nicht symmetrisch zur Geraden liegt - sonst
       faellt das Bild mit dem Urbild zusammen und man sieht nichts. */
    const ecken = [Z.K(0.6, 0.5), Z.K(2.2, 0.9), Z.K(1.1, 2.0)];
    const bilder = ecken.map(spiegeln);

    const f = ZE.flaeche({ max: ZE.achseFuer(ecken.concat(bilder, gerade.map(
        g => Z.K(Math.max(-5, Math.min(5, g.re)), Math.max(-5, Math.min(5, g.im))))), 4),
      breite: 380 });
    f.gerade(gerade[0], gerade[1], { farbe: 'var(--falsch)', dicke: 1.6 });
    f.vieleck(ecken,  { farbe: 'var(--matt)',   dicke: 1.4 });
    f.vieleck(bilder, { farbe: 'var(--akzent)', dicke: 1.8 });
    ['A','B','C'].forEach((m, k) => {
      f.punkt(ecken[k],  { marke: m,        farbe: 'var(--matt)',   gr: 2.2 });
      f.punkt(bilder[k], { marke: m + '′',  farbe: 'var(--akzent)', gr: 2.2 });
    });

    b.kasten('Die Spiegelung aufstellen');
    b.zweiSpalten(
      l => {
        l.satz('Gespiegelt wird an ' + text + ' — der <span style="color:var(--falsch)">' +
               'roten Geraden</span>.');
        l.bild(f);
        l.hinweis('Achten Sie darauf, in welcher Richtung A, B, C herumlaufen — ' +
                  'und in welcher A′, B′, C′.');
      },
      r => {
        r.satz('<b>Zum Vergleich:</b> Die Spiegelung an der <i>x-Achse</i> ist ' +
               'f(z) = 1 · z̄ + 0, kurz f(z) = z̄.');
        r.satz('Und Ihre?');
        r.formelZeile([
          'f(z) =',
          { name: 'S2A3.faktor', soll: faktor, p: 0.5, platzhalter: 'Faktor' },
          '·',
          { name: 'S2A3.konj', optionen: ['z', 'z̄'], richtig: 1, p: 1 },
          '+',
          { name: 'S2A3.summand', soll: summand, p: 0.5, platzhalter: 'Summand' }
        ]);
        r.hinweis('Ist kein Summand nötig, schreiben Sie <b>0</b>. Für den Faktor ' +
                  'dürfen Sie auch <b>cis(90°)</b> schreiben.');
      });
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S2-A04', punkte: 3, titel: 'Bilder erkennen',
  auftrag: 'Das graue Dreieck wird abgebildet. Bestimmen Sie zu jedem Bild die Abbildung.',
  bauen(b){
    /* Das Dreieck liegt AM EINHEITSKREIS, teils innen, teils aussen.

       FEHLERBEHOBEN (2026-08-21): Vorher lag es weiter draussen
       (Betrag 1,0 bis 2,6). Die Kreisspiegelung bildet das auf 0,38
       bis 1,0 ab - das Bild war dann viermal kleiner als das Urbild,
       und auf einer Achse, die fuer das groessere ausgelegt ist,
       schrumpfte es zu einem Fleck neben dem Nullpunkt. Gemessen im
       Bild: eine kaum erkennbare Marke bei (-0,3 | 0).

       Am Einheitskreis bleiben Urbild und Bild vergleichbar gross,
       weil die Kreisspiegelung dort Betraege um 1 wieder auf Betraege
       um 1 wirft. Nebenbei wird die Abbildung dadurch erst lesbar:
       Was innen liegt, geht nach aussen und umgekehrt. */
    const versatz = Z.K(zufall(0.45, 0.85), zufall(0.3, 0.65));
    const ecken = [Z.K(0,0), Z.K(0.8,0.15), Z.K(0.3,0.75)]
      .map(z => Z.plus(z, versatz));

    const a = w([Z.K(0,1), Z.K(-1,0), Z.K(0,-1), Z.K(1.6,0)]);
    const moeglich = [
      { name: 'die Quadratfunktion z → z²',   f: z => Z.mal(z,z) },
      { name: 'die Kreisspiegelung z → 1/z̄',  f: ABBILDUNG.kreis.f },
      { name: 'die lineare Funktion f(z) = ' + Z.normalformGeklammert(a,1) + ' · z',
        f: z => Z.mal(a, z) },
      { name: 'eine andere lineare Funktion',
        f: z => Z.plus(Z.mal(Z.K(0.8,0.6), z), Z.K(-0.7, 0.4)) }
    ];
    const gezeigt = mischen(moeglich).slice(0, 3);

    /* NEU (gemeinsam entschieden, 2026-08-21): Kaertchenzuordnung statt
       dreier getrennter Auswahllisten. Rike: «Eigentlich ist es eine
       Zuordnungsaufgabe. Wir haben vier Funktionen beschrieben und drei
       Bilder, und jedem Bild muss eine der vier Beschreibungen
       zugeordnet werden.»

       Sie hat recht: Mit dreimal derselben Viererliste ist es formal
       eine Auswahl, der Sache nach aber eine Zuordnung - und die eine
       Beschreibung, die uebrigbleibt, traegt Information, die in drei
       getrennten Listen verlorengeht. */
    b.kasten('Drei Bilder, vier Beschreibungen');
    b.satz('Das <span style="color:var(--matt)">graue</span> Dreieck wird jeweils ' +
           'auf die <span style="color:var(--akzent)"><b>farbige</b></span> Figur ' +
           'abgebildet. Ziehen Sie zu jedem Bild die passende Beschreibung — ' +
           '<b>eine bleibt übrig</b>.');
    b.hinweis('Ziehen zum Zuordnen, Doppelklick legt eine Karte zurück.');

    b.kartenZuordnung({ name: 'S2A4', p: 1,
      vorratMarke: 'Beschreibungen',
      karten: moeglich.map((m, k) => ({ id: 'b' + k, text: m.name })),
      felder: gezeigt.map((m, k) => {
        const rand = randpunkte(ecken, 16);
        const bildpunkte = rand.map(m.f);
        const max = ZE.achseFuer(rand.concat(bildpunkte), 2);
        const f = ZE.flaeche({ max: max, breite: 250 });
        f.kreis(1);                       // der Einheitskreis als Bezug
        f.zug(rand, { farbe: 'var(--matt)', dicke: 1.2 });
        f.zug(bildpunkte, { farbe: 'var(--akzent)', dicke: 1.8 });
        return { id: 'f' + k, kopf: 'Bild ' + (k+1), inhalt: ZE.rahmen(f) };
      }),
      richtig: gezeigt.reduce((m, x, k) => {
        m['f' + k] = ['b' + moeglich.indexOf(x)];
        return m; }, {}) });
  }
},

/* ---------------------------------------------------------- 5 */
{ nr: 5, id: 'S2-A05', punkte: 2, titel: 'Quadratfunktion',
  auftrag: 'Welches Bild zeigt die Wirkung der Quadratfunktion — und wohin geht der markierte Punkt?',
  bauen(b){
    bilderAufgabe(b, {
      name: 'S2A5', f: z => Z.mal(z, z),
      titel: 'Die Quadratfunktion z → z²',
      falschA: z => Z.mal(Z.K(1.3,0.9), z),
      falschB: z => Z.K(z.re*z.re - z.im*z.im, -2*z.re*z.im)   // konjugiert quadriert
    });
  }
},

/* ---------------------------------------------------------- 6 */
{ nr: 6, id: 'S2-A06', punkte: 2, titel: 'Kreisspiegelung',
  auftrag: 'Welches Bild zeigt die Kreisspiegelung — und wohin geht der markierte Punkt?',
  bauen(b){
    bilderAufgabe(b, {
      name: 'S2A6', f: ABBILDUNG.kreis.f, kreis: true,
      titel: 'Die Kreisspiegelung z → 1/z̄',
      falschA: z => { const n = z.re*z.re + z.im*z.im;
                      return n < 1e-6 ? Z.K(0,0) : Z.K(z.re/n, -z.im/n); }, // 1/z
      falschB: z => Z.mal(z, Z.K(0.55, 0))
    });
  }
}

];

/* Gemeinsamer Aufbau von Aufgabe 5 und 6: ein Quadrat, drei
   Kandidatenbilder, dazu die Frage nach dem Bild eines Punktes.

   Der zweite Teil hängt bewusst NICHT vom ersten ab. Wer das Bild
   falsch wählt, soll nicht automatisch auch den Punkt verlieren -
   und wer den Punkt rechnet, braucht das Bild nicht. */
function bilderAufgabe(b, o){
  const ecke = Z.K(zufall(0.45, 1.0), zufall(0.35, 0.9));
  const seite = zufall(0.55, 0.95);
  const quadrat = [ ecke, Z.plus(ecke, Z.K(seite,0)),
                    Z.plus(ecke, Z.K(seite,seite)), Z.plus(ecke, Z.K(0,seite)) ];
  const rand = randpunkte(quadrat, 16);
  const A = quadrat[1];

  const kandidaten = P.mischen([
    { f: o.f, echt: true }, { f: o.falschA }, { f: o.falschB }
  ]);
  const flaechen = kandidaten.map(k => {
    const bild = rand.map(k.f);
    const max = ZE.achseFuer(rand.concat(bild), 1.5);
    const f = ZE.flaeche({ max: max, breite: 280 });
    if (o.kreis) f.kreis(1);
    f.zug(rand, { farbe: 'var(--matt)', dicke: 1.1 });
    f.zug(bild, { farbe: 'var(--akzent)', dicke: 1.8 });
    return f;
  });

  b.kasten(o.titel);
  b.satz('Das <span style="color:var(--matt)">graue</span> Quadrat soll abgebildet ' +
         'werden. <b>Klicken Sie das Bild an, das stimmt.</b>' +
         (o.kreis ? ' Der gestrichelte Kreis ist der Einheitskreis.' : ''));
  b.bilderwahl({ name: o.name + '.bild', flaechen: flaechen,
                 richtig: kandidaten.findIndex(k => k.echt), p: 1 });

  b.satz('Der Punkt <b>A = ' + Z.normalform(A, 2) + '</b> ist eine Ecke des Quadrats. ' +
         'Wohin wird er abgebildet?');
  b.komplex({ name: o.name + '.A', vor: 'A ↦', soll: o.f(A), p: 1 });
}

window.PIA.pruefung({
  station: 2,
  startseite:
    '<p>Sechs Aufgaben, und es geht immer um dieselbe Sache in zwei Richtungen: ' +
    'Was <b>macht</b> eine Funktion mit der Ebene — und wie findet man umgekehrt ' +
    'zu einer beschriebenen Wirkung die <b>Funktion</b>? Dazu das Wiedererkennen ' +
    'an Bildern.</p>' +
    '<p><b>So arbeiten Sie.</b> Oben stehen die Aufgaben; Sie können frei ' +
    'wechseln und jederzeit zurück. Wo eine Zahl verlangt ist, sagt Ihnen die ' +
    'Seite sofort, ob sie Ihre Eingabe <i>lesen</i> kann — nicht, ob sie stimmt.</p>' +
    '<p><b>Reden Sie mit.</b> Gerade hier: Bei den Bildaufgaben ist oft ' +
    'entscheidend, <i>woran</i> Sie etwas erkannt haben. Sagen Sie es laut.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Was eine komplexe Funktion mit der Ebene macht — und wie man ' +
            'umgekehrt zu einer beschriebenen Wirkung die Funktion findet.',
  aufgaben: AUFGABEN,
  erklaerstellen: [
    { nach: 3, frage: 'Warum brauchen Sie für Spiegelungen das komplex Konjugierte?' },
    { nach: 5, frage: 'Warum entstehen bei der Quadratfunktion verzerrte Bilder?' }
  ]
});
})();
