/* ============================================================
   Station 4 - Komplexe Potenzen

   Vier Aufgaben, 15 Punkte (4/4/3/4). Umgebaut am 27.09.2026 nach
   Rikes Durchsicht. Potenzieren steht seit dem Umzug aus Moodle ueberhaupt
   wieder mit Gewicht drin: dort war es 0 Punkte.

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

/* WARUM VIER AUFGABEN UND TROTZDEM 15 PUNKTE.

   Mit vier Aufgaben zu je drei waeren es 12 - und bei 12 kostet EINE
   ganz verhauene Aufgabe die Station: 9 von 12 sind 75 %, die Schwelle
   liegt bei 80 %. Bei 15 sind 12 von 15 genau 80 % und damit bestanden.
   Station 4 waere sonst stillschweigend haerter als die anderen drei.

   Gerechnet am 26.09., als dieselbe Frage fuer Station 3 anstand. */

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
      /* getrennt: Betrag und Winkel sind zwei Einsichten, Real- und
         Imaginaerteil auch. Ohne das reisst ein Winkelfehler den
         richtigen Betrag mit - und kostet einen von fuenfzehn Punkten
         der Station fuer eine Einsicht, die dastand. Station 1 hat das
         am 08.09.2026 abgeraeumt («Teilpunkte nach Einsichten»); hier
         stand es noch so. Die Punktzahl je Teil bleibt 1, sie zerfaellt
         nur in zwei halbe. */
      ziel.polar({ name: 'S4A1.' + marke + '.polar', vor: '=',
                   sollR: Z.betrag(wert), sollG: Z.gradAusArg(wert),
                   p: 1, getrennt: true });
      ziel.komplexZweiFelder({ name: 'S4A1.' + marke + '.normal', vor: '=',
                               soll: wert, p: 1, getrennt: true });
    }
    b.zweiSpalten(l => teilaufgabe(l, z1, z1text, 'a'),
                  r => teilaufgabe(r, z2, z2text, 'b'));
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S4-A02', punkte: 4, titel: 'Der Logarithmus',
  erklaeren: ['Warum hat der Logarithmus einer komplexen Zahl unendlich viele Werte, die Wurzel aber nur endlich viele?'],
  auftrag: 'Bestimmen Sie den Logarithmus — und sagen Sie, was mit den übrigen Werten ist.',
  bauen(b){
    /* DREI ZAHLEN, NICHT ZWEI (29.09.2026). Rike: «Ich wuerde sagen,
       wir machen a, b, c: a, b sind Rechnungen und c ist
       Bildinterpretation. Dort wird ein beliebiges z genommen, weder
       aus a noch aus b - ein neues z.»

       Vorher gehoerte das Bild zu a), und nirgends stand das. Wer es
       auf b) bezog, markierte zwangslaeufig falsch, ohne einen
       Denkfehler gemacht zu haben - die schlimmste Sorte
       Aufgabenfehler, weil sie Aufmerksamkeit bestraft statt Unwissen.

       Eine eigene Zahl fuer das Bild nimmt die Mehrdeutigkeit weg,
       statt sie zu beschriften. Die drei Sorten - Betrag 1, Betrag
       gross, Betrag klein - kommen jetzt alle drei vor, jede genau
       einmal, in zufaelliger Reihenfolge. */
    const paare = mischen([
      { r: 1, phi: w([45, 90, 135, 180, 225, 270, 315]) },
      { r: w([2,3,4,5,6,8,10,12,15,20]), phi: w([30,60,120,150,210,240,300,330]) },
      { r: Math.round(zufall(0.1, 0.9)*20)/20, phi: w([20,40,50,70,80,100,110,130]) }
    ]);
    const rechnen = paare.slice(0, 2);     // a) und b)
    const imBild  = paare[2];              // c) - eine eigene Zahl

    /* Gerechnetes links, Begriffliches rechts. So sieht man beides
       zugleich - und das Nebenblatt liegt gleich darunter statt hinter
       einer Bildschirmlänge Scrollen. */
    b.kasten('Der Logarithmus');
    b.zweiSpalten(
      l => {
        /* DER VERRATENDE SATZ IST WEG (27.09.2026). Er lautete: «Der
           Realteil ist eine Zahl, der Imaginaerteil ein Winkel im
           Bogenmass.» Das IST die Struktur des Logarithmus - genau
           das, was die Aufgabe pruefen soll. Rike: «In der Aufgabe
           wird zu viel verraten.»

           Was bleibt, ist die reine LESEREGEL: «π/4 gilt wie 0.79»
           verhindert, dass jemand an der Schreibweise scheitert statt
           an der Sache, ohne zu sagen, wovon dort die Rede ist. */
        l.satz('Geben Sie <b>einen</b> Wert von log(z) an.');
        l.hinweis('<b>π/4</b> gilt wie <b>0.79</b>. Und es gilt <b>jeder</b> Wert ' +
                  'des Logarithmus, nicht nur der Hauptwert.');
        rechnen.forEach((pp, k) => {
          const z = Z.mal(Z.K(pp.r, 0), cis(pp.phi));
          l.formel('<b>' + 'ab'[k] + ')</b>&emsp;z = ' + Z.zahlText(pp.r, 2) +
                   ' · cis(' + pp.phi + '°)');
          /* getrennt: ein Winkelfehler reisst den richtigen Betrag
             nicht mit. Notiert am 17.09.2026 als «nicht mitrepariert»,
             weil es damals gemeinsam/ geaendert haette - jetzt geht
             ohnehin eine Uebernahme an Lars. */
          l.logwert({ name: 'S4A2.' + k, vor: 'log(z) =', von: z, p: 1,
                      getrennt: true });
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
        const zL = Z.mal(Z.K(imBild.r, 0), cis(imBild.phi));
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

        /* DIE ROLLE DES BILDES STAND NIRGENDS. Rike, 27.09.: «Die Rolle
           des Bildes ist mir nicht klar.» Es zeigt die Werte von
           log(z) in der Ebene - das muss dastehen, sonst sucht man
           nach etwas anderem. Die gestrichelte Senkrechte bleibt
           unkommentiert: Sie IST die Antwort auf die Frage, warum
           manche Punkte nicht in Frage kommen. */
        /* ZU WELCHEM z DAS BILD GEHOERT, STAND NIRGENDS. Rike, 29.09.:
           «Bei Aufgabe 2 wird glaub nicht deutlich, dass das Bild
           nicht zur Rechnung nebendran gehoert.»

           Es gehoert zu a) - `paare[0]` -, und links stehen ZWEI
           Zahlen. Wer es auf b) bezieht, markiert zwangslaeufig
           falsch, ohne einen Denkfehler gemacht zu haben. Die Zahl
           steht deshalb jetzt ueber dem Bild, nicht nur drueben in
           der Aufgabe. */
        r.formel('<b>c)</b>&emsp;z = ' + Z.zahlText(imBild.r, 2) + ' · cis(' +
                 imBild.phi + '°)');
        r.satz('<b>Eine neue Zahl</b> — nicht die aus a) oder b). Die Punkte im ' +
               'Bild sind <b>Kandidaten für Werte von log(z)</b>. Der Hauptwert ' +
               'ist <b>schwarz</b> eingezeichnet. Markieren Sie alle ' +
               '<b>weiteren</b>, die wirklich Werte von log(z) sind.');
        r.hinweis('Achtung: Es sind nicht alle Werte im Bild — davon gibt es ' +
                  'unendlich viele. Und nicht jeder eingezeichnete Punkt ist einer.');
        r.punktwahl({ name: 'S4A2.weitere', flaeche: fl, richtig: richtige, p: 2 });
      });
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S4-A03', punkte: 3, titel: 'Im Bild bestimmen',
  auftrag: 'Drei Bilder, drei verschiedene Fragen. Klicken Sie jeweils an, was gesucht ist.',
  bauen(b){
    /* DIE BILDER STEHEN AUF GLEICHER HOEHE. Rike, 27.09.: «Auch wenn
       unterschiedlich viel vor dem Bild steht, bitte immer die Bilder
       auf gleicher Hoehe.»

       Das Bild steckt in `bildwahl` und steht deshalb dort, wohin der
       Text davor es schiebt - drei verschieden lange Fragen, drei
       verschiedene Hoehen. Also bekommt die Frage eine feste Hoehe,
       und alles Erklaerende wandert unter das Bild. Vier Zeilen
       reichen fuer die laengste der drei in einer schmalen Spalte. */
    const frage = html =>
      '<span style="display:block;min-height:5.4em">' + html + '</span>';

    /* NEU (gemeinsam entschieden, 2026-08-21): Aufgabe wieder auf drei
       Teile gebracht. Die erste Fassung hatte nur den Logarithmus.

       Rike: «Bei Aufgabe drei fehlt mir was. Ich hab da vier Bilder
       gehabt, und die haben alle unterschiedliche Dinge gemacht.»
       Beim Nachlesen im Altbestand (Bilder e hoch/cloze_letzterversuch2.py)
       stimmt das: dort stehen drei Erzeugerfunktionen nebeneinander -
       e hoch z vorwaerts, der Logarithmus vorwaerts, und die Umkehr.
       Die Umkehr fehlte hier ganz, und sie ist die interessanteste. */

    /* NEBENEINANDER STATT UNTEREINANDER (27.09.2026). Rike: «Bei 3
       ggf. die Bilder nebeneinander? So wie wir das auch bei Station 2
       haben?» - dort steht jede Teilaufgabe fuer sich, Bild oben,
       Auswahl direkt darunter. Drei Bilder untereinander heisst: oben
       schauen, unten ankreuzen, scrollen.

       Die drei Teile waren als eigenstaendige Bloecke gebaut; sie sind
       jetzt Spalten, sonst unveraendert. Die Zeichnungen werden
       schmaler (265 statt 400), damit drei nebeneinander passen. */
    b.nebeneinander([
    /* ---- (a) vorwaerts: welcher Pfeil ist e^z? ---- */
    (sp => {
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
                             breite: 285 });
      f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z', dicke: 2 });
      let ziel = null;
      kandidaten.forEach((k, m) => {
        const name = 'w' + (m+1);
        if (k.echt) ziel = name;
        f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 1.9, ziel: name, marke: name });
      });

      sp.kasten('(a) Die Exponentialfunktion');
      sp.satz(frage('Der schwarze Pfeil ist <b>z</b>. Welcher der drei farbigen ' +
                    'Pfeile ist <b>e<sup>z</sup></b>?'));
      sp.bildwahl({ name: 'S4A3.exp', flaeche: f, richtig: ziel, p: 1 });
    }),

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
    (sp => {
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
        max: ZE.achseFuer(kandidaten.map(x => x.z).concat([z]), 3), breite: 285 });
      f.kreis(1);
      f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z', dicke: 2 });
      let ziel = null;
      kandidaten.forEach((x, k) => {
        const name = 'w' + (k+1);
        if (x.echt) ziel = name;
        f.pfeil(x.z, { farbe: 'var(--akzent)', dicke: 1.9, ziel: name, marke: name });
      });

      sp.kasten('(b) Der Logarithmus');
      sp.satz(frage('Der schwarze Pfeil ist <b>z</b>. Welcher der drei farbigen ' +
                    'Pfeile ist <b>eine Lösung von log(z)</b>?'));
      sp.bildwahl({ name: 'S4A3.log', flaeche: f, richtig: ziel, p: 1 });
      sp.hinweis('Es genügt <b>eine</b> — der Logarithmus hat unendlich viele Werte, ' +
                'und der Pfeil muss nicht der Hauptwert sein.');
    }),

    /* ---- (c) rueckwaerts: zu welchem z gehoeren diese Werte? ---- */
    (sp => {
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
                             breite: 285 });
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

      sp.kasten('(c) Von den Werten zur Zahl');
      sp.satz(frage('Die <b>schwarzen Punkte</b> sind die Werte von log(z) — für ' +
                    'eine der drei eingezeichneten Zahlen. <b>Für welche?</b>'));
      sp.bildwahl({ name: 'S4A3.umkehr', flaeche: f, richtig: ziel, p: 1 });
      sp.hinweis('Die Punkte liegen übereinander im Abstand 2π — das ist bei allen ' +
                'drei so. Entscheidend ist, <b>wo</b> die Säule steht.');
    })
    ]);
  }
},

/* ---------------------------------------------------------- 4 */
/* VIERMAL UMGEBAUT AM 27.09.2026, und erst der vierte trifft.

   Der Reihe nach, weil jeder Schritt etwas gelehrt hat:

   1 Exponent auf 1/n festgenagelt. Rike: «Aufgabe 4 hast du nicht
     umgebaut» - stimmte, man sah nichts davon, und die Bruecke zu
     Station 1 stand als Erklaerfrage und damit nirgends.
   2 Fehlersuche als eigene Aufgabe 5. Rike: «Nicht der Kern der
     Station.»
   3 Fehlersuche IN die Potenzaufgabe. Rike: «Sie sollten schon einmal
     alles selbst rechnen ... vielleicht ist der Fehler doch keine gute
     Idee.» Fallengelassen.
   4 Diese Fassung, aus zwei Saetzen von Rike:

     «Wie binden wir die Frage nach wie viele Loesungen ein? Koennen
      wir das unabhaengig vom konkreten Beispiel machen? Sie sollen
      zuordnen: mehrere Potenzen, und sie sollen sagen, wie viele
      Loesungen es jeweils waeren und wo sie liegen.»

     «Wir sorgen dafuer, dass es echte Beispiele sind, also sie nicht
      den einfachen trivialen Weg waehlen koennen.»

   DARAUS FOLGT ALLES ANDERE.

   Teil a) rechnet a^i. Warum nicht a^(1/n): Da kommt man mit de Moivre
   durch, ohne je einen Logarithmus zu sehen - der triviale Weg, den
   Rike ausschliessen will. Bei imaginaerem Exponenten gibt es ihn
   nicht; log, mal, e hoch ist der einzige Weg.

   Und damit traegt Rikes Entscheid vom 25.09. - «Exponent immer i» -
   endlich. Sein einziger Nachteil war, dass Anzahl und Lage konstant
   werden. Die sind jetzt in Teil b), wo sie an mehreren Potenzen
   zugleich haengen statt an einer gezogenen.

   DIE BASIS TRAEGT DIE STREUUNG, nachgerechnet am 17.09.2026: Fuer
   a^i ist der Betrag des Ergebnisses e^(-φ) und der Winkel ln r - der
   Betrag der Basis geht ALLEIN in den Winkel, ihr Winkel allein in den
   Betrag. Mit Betrag aus {1, √2, 2, 2√2} und Winkel als Vielfachem von
   45° bleiben 28 von 32 Ziehungen im brauchbaren Bereich; unbrauchbar
   ist nur 180°, deshalb faellt der weg.

   Teil b) stellt drei Potenzen NEBENEINANDER statt eine gezogene. Der
   Unterschied zwischen «endlich viele auf einem Kreis» und «unendlich
   viele auf einem Strahl» wird dadurch zur Aufgabe, statt Zufall der
   Ziehung zu sein - derselbe Gedanke wie bei Station 3, Aufgabe 4, wo
   erst zwei Faelle nebeneinander das Muster sichtbar machten. */
{ nr: 4, id: 'S4-A04', punkte: 4, titel: 'Potenzieren',
  erklaeren: [
    'Bei <b>z<sup>1/3</sup></b> hätten Sie auch <b>anders</b> rechnen können, ' +
    'ohne Logarithmus. Wie — und warum geht das bei <b>z<sup>i</sup></b> nicht?',
    'Warum hat <b>z<sup>i</sup></b> unendlich viele Werte, <b>z<sup>1/4</sup></b> ' +
    'aber genau vier?',
    'Sie haben <b>einen</b> Wert angegeben. Wie kämen Sie an die übrigen?'
  ],
  auftrag: 'Erst eine Potenz ausrechnen, dann drei Potenzen einordnen.',
  bauen(b){
    /* ---------- a) rechnen ---------- */
    const rWahl = w([1, Math.SQRT2, 2, 2*Math.SQRT2]);
    const rText = ['1', '√2', '2', '2√2'][[1, Math.SQRT2, 2, 2*Math.SQRT2].indexOf(rWahl)];
    const gWahl = w([-135, -90, -45, 0, 45, 90, 135]);   // 180° faellt weg
    const basis = Z.mal(Z.K(rWahl, 0), cis(gWahl));

    b.kasten('Eine Potenz ausrechnen');
    /* Beide Formen. Rike, 27.09.: «Ich glaube, wir sollten z noch in
       Normalform angeben.» Die Polarform braucht man zum Rechnen, die
       Normalform sagt, WO die Zahl liegt - und wer nur eine von beiden
       liest, verrechnet sich am Winkel. */
    b.formel('<b>z = ' + rText + ' · cis(' + gWahl + '°) = ' +
             Z.normalform(basis, 2) + '</b>, gesucht ist <b>z<sup>i</sup></b>');
    b.satz('Geben Sie <b>einen</b> Wert an. Jeder richtige Wert gilt — auch wenn ' +
           'es nicht der Hauptwert ist.');
    b.potenzwert({ name: 'S4A4.wert', vor: '=', basis: basis,
                   exponent: Z.K(0, 1), p: 2 });
    b.hinweis('Mit den Mitteln dieser Station: <b>Logarithmus</b>, mal <b>i</b>, ' +
              '<b>e hoch</b>. Schreiben Sie den Weg aufs Nebenblatt — er zählt mit, ' +
              'wenn Sie ihn erklären. Normalform oder Polarform, beides geht; zwei ' +
              'Nachkommastellen genügen.');

    /* ---------- b) zuordnen ---------- */
    /* Die vier Skizzen sind unveraendert aus der alten Fassung -
       einer, Kreis, Strahl, Spirale. Die Spirale ist der Ablenker: Sie
       ist der naheliegende Irrtum beim imaginaeren Exponenten, wo die
       Werte in Wahrheit auf einem STRAHL liegen (nachgerechnet am
       21.08.2026: der Winkel haengt gar nicht vom Zweig ab, nur der
       Betrag waechst um e^(-2πn)). */
    /* DAS BILD TRAEGT DIE ANZAHL SCHON. Rike, 27.09.: «Brauchen wir
       die Entscheidung und das Bild? Wuerde nicht das Bild reichen?
       Wir koennten ja mehrere, auch falsche, noch dabei haben.»

       Sie hat recht: Ein Punkt heisst einer, vier auf einem Kreis
       heissen vier, Punkte auf einem Strahl heissen unendlich viele.
       Die Anzahl-Auswahl daneben fragte dasselbe zweimal.

       UND MIT MEHR BILDERN WIRD ES SCHAERFER statt nur kuerzer. Unter
       den sechs liegen auch DREI auf einem Kreis und ZWEI - wer z^(1/4)
       zuordnen will, muss die Punkte zaehlen, nicht die Form erkennen.
       Vorher genuegte «irgendwas auf einem Kreis». */
    const POTENZEN = [
      { text: 'z<sup>3</sup>',   lage: 'einer'  },
      { text: 'z<sup>1/4</sup>', lage: 'kreis4' },
      { text: 'z<sup>i</sup>',   lage: 'strahl' }
    ];

    function skizze(sorte, n){
      const f = ZE.flaeche({ max: 1.9, breite: 150, gitter: false,
                             achsenzahlen: false });
      if (sorte === 'einer'){
        f.punkt(Z.K(1.0, 0.7), { farbe: 'var(--akzent)', gr: 4.5 });
      } else if (sorte === 'strahl'){
        const richtung = cis(35);
        f.gerade(Z.K(0,0), Z.mal(Z.K(1.8,0), richtung),
                 { farbe: 'var(--linie)', dicke: 1.1 });
        [0.13, 0.3, 0.7, 1.6].forEach(d =>
          f.punkt(Z.mal(Z.K(d,0), richtung), { farbe: 'var(--akzent)', gr: 3.6 }));
      } else if (sorte === 'spirale'){
        const bahn = [];
        for (let g = 0; g <= 700; g += 10)
          bahn.push(Z.mal(Z.K(0.16 * Math.exp(g/300), 0), cis(g)));
        f.zug(bahn, { farbe: 'var(--linie)', dicke: 1.1 });
        [60, 240, 420, 600].forEach(g =>
          f.punkt(Z.mal(Z.K(0.16 * Math.exp(g/300), 0), cis(g)),
                  { farbe: 'var(--akzent)', gr: 3.4 }));
      } else {
        f.kreis(1.25, { farbe: 'var(--linie)', gestrichelt: false });
        for (let j = 0; j < n; j++)
          f.punkt(Z.mal(Z.K(1.25,0), cis(30 + j*360/n)),
                  { farbe: 'var(--akzent)', gr: 3.6 });
      }
      return f;
    }

    /* Sechs Bilder, drei davon richtig. Die drei Ablenker sind keine
       Fantasie: zwei und drei auf einem Kreis sind die Werte von
       z^(1/2) und z^(1/3), die Spirale ist der naheliegende Irrtum
       beim imaginaeren Exponenten - dort liegen die Werte auf einem
       STRAHL (nachgerechnet am 21.08.2026: der Winkel haengt gar nicht
       vom Zweig ab, nur der Betrag waechst um e^(-2πn)). */
    const BILDER = mischen([
      { s: 'einer',   n: 1 },
      { s: 'kreis2',  n: 2 },
      { s: 'kreis3',  n: 3 },
      { s: 'kreis4',  n: 4 },
      { s: 'strahl',  n: 0 },
      { s: 'spirale', n: 0 }
    ]);

    b.kasten('Drei Potenzen einordnen');
    b.satz('<b>Dieselbe Zahl z, drei verschiedene Exponenten.</b> Ziehen Sie zu ' +
           'jeder Potenz das Bild, das ihre Werte zeigt — <b>ohne zu rechnen</b>. ' +
           'Drei Bilder bleiben übrig.');
    b.kartenZuordnung({ name: 'S4A4.lage', p: 2/3, quer: true,
      vorratMarke: 'Bilder',
      /* Das SVG braucht im Kaertchen eine eigene Breite: `.kk` ist auf
         Text gebaut und drueckt es sonst zu einem Schlitz zusammen. */
      karten: BILDER.map(x => {
        const s = skizze(x.s, x.n).svg;
        s.style.width = '120px';
        s.style.height = 'auto';
        s.style.display = 'block';
        return { id: x.s, text: s.outerHTML };
      }),
      felder: POTENZEN.map(pt => ({ id: pt.lage, kopf: pt.text })),
      richtig: POTENZEN.reduce((s, pt) => { s[pt.lage] = [pt.lage]; return s; }, {}) });
  }
}

];

window.PIA.pruefung({
  station: 4,
  startseite:
    '<p>Vier Aufgaben zu <b>e hoch z</b>, zum <b>Logarithmus</b> und zu ' +
    'allgemeinen <b>Potenzen</b>. Durch sie zieht sich dieselbe Frage: ' +
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
  aufgaben: AUFGABEN
});
})();
