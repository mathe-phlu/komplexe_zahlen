/* ============================================================
   Station 4 - Komplexe Potenzen

   Vier Aufgaben, 15 Punkte. Nach station4/VORSCHLAG.md.
   Potenzieren steht wieder mit vollem Gewicht drin: 0 → 4 Punkte.

   Diese Station hat den ganzen Umbau ausgelöst. Drei Dinge, die
   hier anders sind als im Altbestand (siehe FEHLER_ALTBESTAND.md):

   1  Der Lösungsschlüssel wird richtig gerechnet. Für a = k·i und
      b = n·i gilt a^(ni) = e^(−nφ) · cis(n · ln r). Der Altbestand
      setzte den Betrag auf n·φ - bei negativem a sogar negativ.
   2  Mehrwertigkeit wird geprüft, nicht ignoriert. Angenommen wird
      jeder Wert exp(b · (ln r + i(φ + 2πk))).
   3  Die Klammern hängen am Bedarf, nicht am Vorzeichen:
      (3i)^(1/2), nie 3i^(1/2).
   ============================================================ */
(function(){
'use strict';
const Z = window.Zahl, ZE = window.Zeichnen, P = window.PIA;
const w = P.wuerfel, mischen = P.mischen, zufall = P.zufall;

const cis = g => Z.K(Math.cos(g*Math.PI/180), Math.sin(g*Math.PI/180));

/* Punkte, die aufeinanderliegen, sind weder anklickbar noch lesbar -
   ihre Beschriftungen ueberdecken sich. Die als «fest» uebergebenen
   ersten Punkte bleiben, wo sie sind; die uebrigen weichen aus, bis
   alle mindestens den Mindestabstand voneinander haben. */
function freiRuecken(punkte, fest, mindestabstand){
  const p = punkte.slice();
  for (let runde = 0; runde < 80; runde++){
    let eng = false;
    for (let a = fest; a < p.length; a++){
      for (let c = 0; c < p.length; c++){
        if (a === c) continue;
        const dx = p[a].re - p[c].re, dy = p[a].im - p[c].im;
        const d = Math.hypot(dx, dy);
        if (d >= mindestabstand) continue;
        eng = true;
        const l = d || 0.001;
        p[a] = Z.K(p[a].re + dx/l * (mindestabstand - d) * 0.6,
                   p[a].im + dy/l * (mindestabstand - d) * 0.6);
      }
    }
    if (!eng) break;
  }
  return p;
}

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S4-A01', punkte: 4, titel: 'Die Exponentialfunktion',
  auftrag: 'Berechnen Sie e hoch z — einmal in Polarform, einmal in Normalform.',
  bauen(b){
    /* Wie im Altbestand: eine rein imaginäre und eine allgemeine
       Zahl, die Vielfachen von π ausgeschrieben. */
    const k1 = w([-5,-4,-3,-2,-1,1,2,3,4,5]);
    const alsPi = w([true, false]);
    const z1 = Z.K(0, alsPi ? k1 * Math.PI : k1);
    const z1text = (alsPi ? k1 + 'π' : String(k1)) + 'i';

    const k2 = w([-3,-2,-1,1,2,3]);
    const y2 = w([-4,-3,-2,-1,1,2,3,4]);
    const z2 = Z.K(k2, y2 * Math.PI / 2);
    const z2text = k2 + (y2 < 0 ? ' − ' : ' + ') +
                   (Math.abs(y2) === 1 ? '' : Math.abs(y2)) + 'π/2' + ' i';

    b.kasten('Zwei Werte');
    b.hinweis('Runden Sie auf zwei Nachkommastellen. Winkel im Gradmass, ' +
              'gegen den Uhrzeigersinn — also in [0°, 360°).');

    /* Nebeneinander statt untereinander: die Felder sind schmal, und
       gestapelt bliebe die halbe Seite leer. */
    function teilaufgabe(ziel, z, text, marke){
      const wert = Z.exp(z);
      ziel.formel('<b>' + marke + ')</b>&emsp;e<sup>' + text + '</sup>');
      ziel.polar({ name: 'S4A1.' + marke + '.polar', vor: '=',
                   sollR: Z.betrag(wert), sollG: Z.gradAusArg(wert), p: 1 });
      ziel.komplexZweiFelder({ name: 'S4A1.' + marke + '.normal', vor: '=',
                               soll: wert, p: 1 });
    }
    b.zweiSpalten(l => teilaufgabe(l, z1, z1text, 'a'),
                  r => teilaufgabe(r, z2, z2text, 'b'));
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S4-A02', punkte: 4, titel: 'Der Logarithmus',
  auftrag: 'Bestimmen Sie den Logarithmus — und sagen Sie, was mit den übrigen Werten ist.',
  bauen(b){
    const paare = mischen([
      { r: 1, phi: w([45, 90, 135, 180, 225, 270, 315]) },
      { r: w([2,3,4,5,6,8,10,12,15,20]), phi: w([30,60,120,150,210,240,300,330]) },
      { r: Math.round(zufall(0.1, 0.9)*20)/20, phi: w([20,40,50,70,80,100,110,130]) }
    ]).slice(0, 2);

    /* Gerechnetes links, Begriffliches rechts. So sieht man beides
       zugleich - und das Nebenblatt liegt gleich darunter statt hinter
       einer Bildschirmlänge Scrollen. */
    b.kasten('Der Logarithmus');
    b.zweiSpalten(
      l => {
        l.satz('Geben Sie <b>einen</b> Wert von log(z) an. Der Realteil ist eine ' +
               'Zahl, der Imaginärteil ein Winkel <b>im Bogenmass</b>.');
        l.hinweis('<b>π/4</b> gilt wie <b>0.79</b>. Und es gilt <b>jeder</b> Wert ' +
                  'des Logarithmus, nicht nur der Hauptwert.');
        paare.forEach((pp, k) => {
          const z = Z.mal(Z.K(pp.r, 0), cis(pp.phi));
          l.formel('<b>' + 'ab'[k] + ')</b>&emsp;z = ' + Z.zahlText(pp.r, 2) +
                   ' · cis(' + pp.phi + '°)');
          l.logwert({ name: 'S4A2.' + k, vor: 'log(z) =', von: z, p: 1 });
        });
      },
      r => {
        /* NEU (gemeinsam entschieden, 2026-08-21): Die Frage «Wie viele
           Werte hat log(z)?» ist entfallen. Rike: Sie macht keinen Sinn
           mehr, wenn darunter vom Hauptwert die Rede ist und gefragt
           wird, wo der naechste liegt - die Antwort steht dann schon da.

           Stattdessen: Der Hauptwert ist eingezeichnet, alle weiteren
           eingezeichneten Werte sollen markiert werden. Wichtig im
           Text, weil es sonst in die Irre fuehrt: Es sind NICHT alle
           Werte eingezeichnet - es gibt unendlich viele. Gesucht sind
           die, die im Bild stehen. */
        const zL = Z.mal(Z.K(paare[0].r, 0), cis(paare[0].phi));
        const h = Z.ln(zL);
        /* Nur die Zweige ±2π. Ein dritter bei +4π zoege die Achse auf
           ueber 20 hinauf, und alles Uebrige draengte sich dann in der
           Mitte zusammen - gemessen: drei von sechs Punkten lagen
           uebereinander. */
        const echte = [ Z.K(h.re, h.im + 2*Math.PI),
                        Z.K(h.re, h.im - 2*Math.PI) ];
        const ablenker = [
          Z.K(h.re + w([1.6, -1.8]), h.im + 2*Math.PI),
          Z.K(h.re, h.im + Math.PI),
          Z.K(h.im, h.re - 2*Math.PI)
        ];
        const gerueckt = freiRuecken(echte.concat(ablenker), echte.length, 1.7);
        const alle = mischen(gerueckt.map((x, k) => ({ z: x, echt: k < echte.length })));
        const fl = ZE.flaeche({
          max: ZE.achseFuer(alle.map(s => s.z).concat([h]), 3), breite: 380 });
        fl.gerade(Z.K(h.re, -99), Z.K(h.re, 99),
                  { farbe: 'var(--linie)', dicke: 1, gestrichelt: true });
        fl.punkt(h, { farbe: 'var(--tinte)', gr: 3.4, marke: 'Hauptwert' });
        const richtige = [];
        alle.forEach((x, k) => {
          const name = 'q' + (k+1);
          if (x.echt) richtige.push(name);
          fl.punkt(x.z, { ziel: name, marke: name, farbe: 'var(--akzent)', gr: 2.6 });
        });

        r.satz('<b>Der Hauptwert ist schwarz eingezeichnet.</b> Markieren Sie ' +
               'alle <b>weiteren eingezeichneten</b> Werte von log(z).');
        r.hinweis('Achtung: Es sind nicht alle Werte im Bild — davon gibt es ' +
                  'unendlich viele. Gesucht sind die, die hier stehen.');
        r.punktwahl({ name: 'S4A2.weitere', flaeche: fl, richtig: richtige, p: 2 });
      });
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S4-A03', punkte: 3, titel: 'Im Bild bestimmen',
  auftrag: 'Drei Bilder, drei verschiedene Fragen. Klicken Sie jeweils an, was gesucht ist.',
  bauen(b){
    /* NEU (gemeinsam entschieden, 2026-08-21): Aufgabe wieder auf drei
       Teile gebracht. Die erste Fassung hatte nur den Logarithmus.

       Rike: «Bei Aufgabe drei fehlt mir was. Ich hab da vier Bilder
       gehabt, und die haben alle unterschiedliche Dinge gemacht.»
       Beim Nachlesen im Altbestand (Bilder e hoch/cloze_letzterversuch2.py)
       stimmt das: dort stehen drei Erzeugerfunktionen nebeneinander -
       e hoch z vorwaerts, der Logarithmus vorwaerts, und die Umkehr.
       Die Umkehr fehlte hier ganz, und sie ist die interessanteste. */

    /* ---- (a) vorwaerts: welcher Pfeil ist e^z? ---- */
    (function(){
      /* Realteil klein halten, sonst sprengt e^z jede Achse und der
         Vergleich der Laengen wird zur Trivialitaet. */
      const x = zufall(-1, 1.2), y = zufall(-Math.PI + 0.3, Math.PI - 0.3);
      const z = Z.K(Math.round(x*10)/10, Math.round(y*10)/10);
      const richtig = Z.exp(z);
      /* Ablenker: gleicher Betrag, falscher Winkel - und der haeufige
         Fehler, Real- und Imaginaerteil zu vertauschen. */
      const falsch1 = Z.mal(richtig, cis(w([70, -70, 130, -130])));
      const falsch2 = Z.exp(Z.K(z.im, z.re));

      const kandidaten = mischen([{ z: richtig, echt: true },
                                  { z: falsch1 }, { z: falsch2 }]);
      const f = ZE.flaeche({ max: ZE.achseFuer([z].concat(kandidaten.map(k => k.z)), 2),
                             breite: 400 });
      f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z', dicke: 2 });
      let ziel = null;
      kandidaten.forEach((k, m) => {
        const name = 'w' + (m+1);
        if (k.echt) ziel = name;
        f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 1.9, ziel: name, marke: name });
      });

      b.kasten('(a) Die Exponentialfunktion');
      b.satz('Der schwarze Pfeil ist <b>z</b>. Welcher der drei farbigen Pfeile ' +
             'ist <b>e<sup>z</sup></b>?');
      b.bildwahl({ name: 'S4A3.exp', flaeche: f, richtig: ziel, p: 1 });
    })();

    /* ---- (b) welcher Pfeil ist eine Loesung von log z? ----

       FEHLERBEHOBEN (2026-08-21): Ich hatte die Aufgabe zweimal falsch
       gestellt. Erst waren echte und falsche Punkte gemischt und man
       sollte die echten heraussuchen; dann las ich Rikes «drei
       Loesungen und sie sollen den finden» als «finden Sie den
       Hauptwert unter den dreien».

       Beides war geraten. Das alte Pruefungsbild liegt vor
       (base64 in Bilder e hoch/moodle_cloze_ez_log_adjusted_table_v5.xml,
       herausgeloest und angesehen): ein schwarzer Pfeil z und drei
       farbige Kandidaten. Rike: «Man soll entscheiden, welcher dieser
       blauen Pfeile eine der Loesungen von Log z ist.» Genau die
       Umkehrung von Teil (a), wo drei Kandidaten fuer e^z stehen.

       Ursache: Ich habe die Generatoren gelesen, aber die Bilder nie
       angeschaut - obwohl sie im Fragenkatalog liegen. */
    (function(){
      const r   = w([2, 3, 5, 8]);
      const phi = w([30, 45, 60, 120, 135, 210, 300]);
      const z   = Z.mal(Z.K(r,0), cis(phi));
      const haupt = Z.ln(z);

      /* Der richtige Kandidat ist irgendein Zweig - nicht immer der
         Hauptwert, sonst lernt man die falsche Regel. */
      const zweig = w([-1, 0, 0, 1]);
      const richtig = Z.K(haupt.re, haupt.im + 2*Math.PI*zweig);

      /* Ablenker: Real- und Imaginaerteil vertauscht (ein haeufiger
         Fehler), und ln(r) durch r ersetzt (der andere). */
      const falsch1 = Z.K(richtig.im, richtig.re);
      const falsch2 = Z.K(r * w([0.4, 0.55]), haupt.im * w([1.8, -1.5]));

      /* Die Ablenker duerfen dem richtigen Pfeil nicht zu nahe kommen -
         zwei Pfeilspitzen dicht beieinander sind weder zu treffen noch
         zu unterscheiden. Der erste Eintrag ist der richtige und bleibt,
         wo er ist; die beiden anderen weichen aus. */
      const gerueckt = freiRuecken([richtig, falsch1, falsch2], 1, 1.3);
      const kandidaten = mischen(gerueckt.map((x, k) => ({ z: x, echt: k === 0 })));
      const f = ZE.flaeche({
        max: ZE.achseFuer(kandidaten.map(x => x.z).concat([z]), 3), breite: 400 });
      f.kreis(1);
      f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z', dicke: 2 });
      let ziel = null;
      kandidaten.forEach((x, k) => {
        const name = 'w' + (k+1);
        if (x.echt) ziel = name;
        f.pfeil(x.z, { farbe: 'var(--akzent)', dicke: 1.9, ziel: name, marke: name });
      });

      b.kasten('(b) Der Logarithmus');
      b.satz('Der schwarze Pfeil ist <b>z</b>. Welcher der drei farbigen Pfeile ' +
             'ist <b>eine Lösung von log(z)</b>?');
      b.hinweis('Es genügt <b>eine</b> — der Logarithmus hat unendlich viele Werte, ' +
                'und der Pfeil muss nicht der Hauptwert sein.');
      b.bildwahl({ name: 'S4A3.log', flaeche: f, richtig: ziel, p: 1 });
    })();

    /* ---- (c) rueckwaerts: zu welchem z gehoeren diese Werte? ---- */
    (function(){
      const r   = w([4, 5, 6, 8, 10]);
      const phi = w([25, 50, 110, 160, 200, 250, 310]);
      const z   = Z.mal(Z.K(r,0), cis(phi));
      const haupt = Z.ln(z);

      /* Die Kandidaten unterscheiden sich in Betrag UND Winkel - sonst
         liesse sich einer allein am Betrag ausschliessen.

         FEHLERBEHOBEN (2026-08-21): Der dritte Kandidat durfte mit
         Faktor 0,45 sehr kurz werden. Bei r = 4 endete er dann bei
         Betrag 1,8 - mitten in der Punktsaeule, die bei ln(r) ≈ 1,4
         steht. Gemessen: die Pfeilspitze lag genau auf einem der
         schwarzen Punkte, beides war nicht mehr auseinanderzuhalten.
         Untergrenze 3,5 haelt die Spitzen aus dem Punktbereich. */
      const langGenug = x => Math.max(3.5, Math.min(12, x));
      const kandidaten = mischen([
        { z: z, echt: true },
        { z: Z.mal(Z.K(r,0), cis(phi + w([80, -80, 140, -140]))) },
        { z: Z.mal(Z.K(langGenug(r * w([0.55, 2.1])), 0), cis(phi + w([35, -35]))) }
      ]);

      const punkte = [];
      for (let k = -1; k <= 1; k++) punkte.push(Z.K(haupt.re, haupt.im + 2*Math.PI*k));

      const f = ZE.flaeche({ max: ZE.achseFuer(kandidaten.map(k => k.z).concat(punkte), 3),
                             breite: 400 });
      /* Eine dünne Führungslinie durch die Säule: Sie macht sichtbar,
         dass die Punkte übereinanderliegen - der Kern der Sache. */
      f.gerade(Z.K(haupt.re, -99), Z.K(haupt.re, 99),
               { farbe: 'var(--linie)', dicke: 1, gestrichelt: true });
      punkte.forEach(p => f.punkt(p, { farbe: 'var(--tinte)', gr: 3 }));
      let ziel = null;
      kandidaten.forEach((k, m) => {
        const name = 'z' + (m+1);
        if (k.echt) ziel = name;
        f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 1.9, ziel: name, marke: name });
      });

      b.kasten('(c) Von den Werten zur Zahl');
      b.satz('Die <b>schwarzen Punkte</b> sind die Werte von log(z) — für eine der ' +
             'drei eingezeichneten Zahlen. <b>Für welche?</b> Klicken Sie den ' +
             'passenden Pfeil an.');
      b.bildwahl({ name: 'S4A3.umkehr', flaeche: f, richtig: ziel, p: 1 });
      b.hinweis('Die Punkte liegen übereinander im Abstand 2π — das ist bei allen ' +
                'drei so. Entscheidend ist, <b>wo</b> die Säule steht.');
    })();
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S4-A04', punkte: 4, titel: 'Potenzieren',
  auftrag: 'Berechnen Sie die Potenz — und sagen Sie, wie viele Werte sie hat.',
  bauen(b){
    /* Basis wie im Altbestand rein imaginär, Exponent in drei Formen. */
    const k = w([1,2,3,4,5]);
    const vorzeichen = w([1,-1]);
    const basis = Z.K(0, vorzeichen * k);
    const n = w([2,3,4,5]);
    const art = w(['n', '1/n', 'ni']);
    const exponent = art === 'n' ? Z.K(n, 0)
                   : art === '1/n' ? Z.K(1/n, 0)
                   : Z.K(0, n);
    const exponentText = art === 'n' ? String(n)
                       : art === '1/n' ? '1/' + n
                       : n + 'i';

    /* NEU (gemeinsam entschieden, 2026-08-21): Die Zahl steht nicht
       mehr in der Option. «endlich viele, naemlich 4» verraet die
       Antwort, sobald man sich fuer «endlich viele» entscheidet.
       Jetzt: erst die Art, und wer «endlich viele» waehlt, traegt die
       Anzahl selbst ein. */
    const anzahlOptionen = ['genau einen', 'endlich viele', 'unendlich viele'];
    const anzahlRichtig = art === 'n' ? 0 : art === '1/n' ? 1 : 2;
    /* NEU (gemeinsam entschieden, 2026-08-21): Die Lage der uebrigen
       Werte wird als Skizze gewaehlt statt als Satz gelesen. Vier
       kleine Bilder; die Skizze traegt die Aussage, nicht der Satz.

       FEHLERBEHOBEN (2026-08-21): Bei imaginaerem Exponenten stand als
       richtige Antwort «auf einer Spirale». Das ist falsch. Fuer
       a = k·i und b = n·i gilt

         a^(ni) = exp(-n(φ + 2πk)) · cis(n · ln r)

       Der WINKEL haengt gar nicht vom Zweig ab - nachgerechnet fuer
       a = 3i, b = 2i: alle Zweige haben Argument 125,8917°, nur der
       Betrag wechselt um den Faktor e^(-2πn). Die Werte liegen also
       auf einem STRAHL vom Nullpunkt, mit geometrisch wachsenden
       Abstaenden.

       Ursache des Fehlers: Ich habe von der Spirale her gedacht, die
       beim Potenzieren mit wachsendem Exponenten entsteht - eine
       andere Sache. Der Altbestand hatte hier recht («einer Geraden»);
       meine Fassung war schlechter als die, die ich ersetzt habe.
       Die Spirale steht jetzt als Ablenker dabei, weil sie der
       naheliegende Irrtum ist. */
    function skizze(sorte){
      const f = ZE.flaeche({ max: 1.9, breite: 200, gitter: false,
                             achsenzahlen: false });
      if (sorte === 'einer'){
        f.punkt(Z.K(1.0, 0.7), { farbe: 'var(--akzent)', gr: 4.5 });
      } else if (sorte === 'kreis'){
        f.kreis(1.25, { farbe: 'var(--linie)', gestrichelt: false });
        for (let k = 0; k < n; k++)
          f.punkt(Z.mal(Z.K(1.25,0), cis(30 + k*360/n)),
                  { farbe: 'var(--akzent)', gr: 3.6 });
      } else if (sorte === 'strahl'){
        const richtung = cis(35);
        f.gerade(Z.K(0,0), Z.mal(Z.K(1.8,0), richtung),
                 { farbe: 'var(--linie)', dicke: 1.1 });
        [0.13, 0.3, 0.7, 1.6].forEach(d =>
          f.punkt(Z.mal(Z.K(d,0), richtung), { farbe: 'var(--akzent)', gr: 3.6 }));
      } else {
        const bahn = [];
        for (let g = 0; g <= 700; g += 10)
          bahn.push(Z.mal(Z.K(0.16 * Math.exp(g/300), 0), cis(g)));
        f.zug(bahn, { farbe: 'var(--linie)', dicke: 1.1 });
        [60, 240, 420, 600].forEach(g =>
          f.punkt(Z.mal(Z.K(0.16 * Math.exp(g/300), 0), cis(g)),
                  { farbe: 'var(--akzent)', gr: 3.4 }));
      }
      return f;
    }
    const lageSorten = mischen(['einer', 'kreis', 'strahl', 'spirale']);
    const lageSoll = art === 'n' ? 'einer' : art === '1/n' ? 'kreis' : 'strahl';

    b.kasten('Eine Potenz');
    b.zweiSpalten(
      l => {
        /* Immer geklammert - der Fehler des Altbestands entstand daran,
           dass die Klammer am Vorzeichen hing statt am Bedarf. */
        l.formel('<b>' + Z.normalformGeklammert(basis, 0) + '<sup>' +
                 exponentText + '</sup></b>');
        l.satz('Geben Sie <b>einen</b> Wert dieser Potenz an. Jeder richtige Wert ' +
               'gilt — auch wenn es nicht der Hauptwert ist.');
        l.potenzwert({ name: 'S4A4.wert', vor: '=', basis: basis,
                       exponent: exponent, p: 2 });
        l.hinweis('Normalform oder Polarform, beides geht — <b>0.04·cis(126°)</b> ' +
                  'wird genauso gelesen wie <b>-0.02 + 0.03i</b>. ' +
                  'Zwei Nachkommastellen genügen; bei sehr kleinen Werten mehr.');
      },
      r => {
        /* Bei ganzzahligem Exponenten gibt es KEINE weiteren Werte.
           Im Altbestand fehlte diese Möglichkeit, und «eine» war als
           richtig markiert - siehe FEHLER_ALTBESTAND.md. */
        r.wahl({ name: 'S4A4.anzahl', mischen: false,
                 frage: '<b>Die Potenz hat insgesamt …</b>', optionen: anzahlOptionen,
                 richtig: anzahlRichtig, p: art === '1/n' ? 0.5 : 1 });
        /* Das Feld steht IMMER da, sonst verriete schon sein Fehlen,
           dass es nicht endlich viele sind. Bewertet wird es nur im
           Fall, in dem es eine Antwort gibt. */
        r.reell({ name: 'S4A4.wieviele', vor: 'Wenn endlich viele: wie viele?',
                  soll: n, p: art === '1/n' ? 0.5 : 0,
                  ohneWertung: art !== '1/n' });
        r.satz('<b>Welche Skizze zeigt, wie die Werte liegen?</b>');
        r.bilderwahl({ name: 'S4A4.lage',
                       flaechen: lageSorten.map(skizze),
                       richtig: lageSorten.indexOf(lageSoll), p: 1 });
      });
  }
}

];

window.PIA.pruefung({
  station: 4,
  startseite:
    '<p>Vier Aufgaben zu <b>e hoch z</b>, zum <b>Logarithmus</b> und zu ' +
    'allgemeinen <b>Potenzen</b>. Durch alle vier zieht sich dieselbe Frage: ' +
    'Wie viele Werte hat das eigentlich — und wo liegen sie?</p>' +
    '<p><b>Jeder richtige Wert gilt.</b> Der Logarithmus einer komplexen Zahl hat ' +
    'unendlich viele Werte, eine Potenz je nach Exponent einen, endlich viele oder ' +
    'unendlich viele. Sie müssen <b>nicht</b> den Hauptwert treffen — jeder Wert ' +
    'der Schar wird angenommen.</p>' +
    '<p><b>Und die Schreibweise ist frei.</b> <b>0.04·cis(126°)</b> wird genauso ' +
    'gelesen wie <b>-0.02 + 0.03i</b>, <b>π/4</b> genauso wie <b>0.79</b>.</p>' +
    '<p><b>Reden Sie mit.</b> Erzählen Sie, welchen Zweig Sie genommen haben und ' +
    'warum.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Exponentialfunktion, Logarithmus und allgemeine Potenzen — und ' +
            'die Frage, die sich dabei überall stellt: Wie viele Werte hat das ' +
            'eigentlich, und wo liegen sie?',
  aufgaben: AUFGABEN,
  erklaerstellen: [
    { nach: 2, frage: 'Warum hat der Logarithmus einer komplexen Zahl unendlich viele Werte, die Wurzel aber nur endlich viele?' },
    { nach: 4, frage: 'Was passiert anschaulich, wenn der Exponent selbst imaginär wird?' }
  ]
});
})();
