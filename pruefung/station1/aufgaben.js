/* ============================================================
   Station 1 - Komplexe Zahlen

   Fuenf Aufgaben zu je drei Punkten, zusammen 15. Zuschnitt,
   Bewertung und Begruendungen in station1/VORSCHLAG.md,
   abgestimmt am 08.09.2026.

   Gleiches Gewicht je Aufgabe hat einen Grund: Die Aufgabe ist die
   Einheit, die man beim Wiedereintritt neu macht. Gleiches Gewicht
   heisst gleicher Brocken.

   Alle Werte werden bei jedem Durchgang neu gezogen. Beim
   Wiedereintritt bekommt dieselbe Aufgabe damit von selbst andere
   Zahlen - und ueber `erklaeren` auch eine andere Frage.
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

const polarText = z => Z.zahlText(Z.betrag(z), 2) + ' · cis(' +
                       Z.zahlText(Z.gradAusArg(z), 1) + '°)';
const grad = z => Z.gradAusArg(z);

/* Zyklischer Winkelabstand in Grad */
function winkelAbstand(a, b){
  let d = Math.abs((a - b) % 360);
  return d > 180 ? 360 - d : d;
}

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S1-A01', punkte: 3, titel: 'Rechnen mit komplexen Zahlen',
  auftrag: 'Rechnen Sie aus und tragen Sie das Ergebnis ein. Brüche dürfen Sie stehen lassen.',
  /* Der Term zwingt beide Operationsfamilien in EINE Rechnung - wer
     ihn geloest hat, hat gerade erlebt, dass das eine bequem und das
     andere muehsam ist. Genau danach fragen die Erklaerfragen. */
  erklaeren: [
    'Sie sollen zwei komplexe Zahlen <b>multiplizieren</b>. In welcher Darstellung ' +
    'geht das leichter — und warum?',
    'Sie sollen zwei Zahlen <b>addieren</b>, beide stehen in <b>Polarform</b> da. ' +
    'Was tun Sie zuerst, und warum?',
    'Gibt es Rechenarten, die <b>nur</b> in einer der beiden Darstellungen überhaupt ' +
    'eine Regel haben? Welche — und warum gibt die andere Darstellung dort nichts her?'
  ],
  bauen(b){
    b.kasten();
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
      /* getrennt: Ein Vorzeichenfehler im Imaginaerteil kostet 0,75
         statt 1,5. Das Feld bleibt eines, nur der Vergleich zerfaellt. */
      b.komplex({ name: 'S1A1' + (k===0?'a':'b'), vor: '=', soll: soll,
                  p: 1.5, getrennt: true });
    });
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S1-A02', punkte: 3, titel: 'Darstellungsformen wechseln',
  auftrag: 'Rechnen Sie die Zahl jeweils in die andere Darstellung um. Im letzten Teil wird nicht gerechnet, sondern zugeordnet.',
  erklaeren: [
    'Bei welchen Zahlen können Sie Betrag und Winkel <b>sofort</b> angeben, ohne zu ' +
    'rechnen? Woran erkennen Sie die, und warum geht es dort ohne Rechnung?'
  ],
  bauen(b){
    /* ---- 2a: Normalform -> Polarform, mit echtem Rechenweg ---- */
    const za = (function(){
      for(;;){
        const z = Z.K(Math.round(zufall(-9,9)*2)/2, Math.round(zufall(-9,9)*2)/2);
        /* Weg von Achsen und Winkelhalbierenden: hier soll gerechnet
           werden, nicht abgelesen. */
        if (z.re !== 0 && z.im !== 0 && Math.abs(Math.abs(z.re) - Math.abs(z.im)) > 0.9)
          return z;
      }
    })();
    b.kasten('a) Normalform → Polarform');
    b.satz('Geben Sie <b>Betrag und Winkel</b> dieser Zahl an.');
    b.formel('<b>z = ' + Z.normalform(za, 2) + '</b>');
    b.hinweis('Wurzeln dürfen stehen bleiben: <b>3√2</b> gilt genauso wie ' +
              '<b>4.24</b>. Wenn Sie ausrechnen, runden Sie nicht gröber als auf ' +
              '<b>zwei Stellen</b>.');
    b.polar({ name: 'S1A2a', vor: 'z =', sollR: Z.betrag(za), sollG: grad(za),
              p: 1, getrennt: true });

    /* ---- 2b: Polarform -> Normalform ----
       Die Richtung, die im Altbestand nie vorkam. Hinter cis(φ) stehen
       Kosinus und Sinus - wer das nie gebraucht hat, merkt es hier.
       Der Winkel ist bewusst KEIN Vielfaches von 45 Grad; sonst
       rutschte die Aufgabe in Teil c ab. */
    const rb = Math.round(zufall(2, 8) * 2) / 2;
    const gb = (function(){
      for(;;){
        const g = Math.round(zufall(0, 359));
        if (Math.abs((g % 45)) > 8 && Math.abs((g % 45)) < 37) return g;
      }
    })();
    const zb = Z.mal(Z.K(rb, 0), Z.K(Math.cos(gb*Math.PI/180), Math.sin(gb*Math.PI/180)));
    b.kasten('b) Polarform → Normalform');
    b.satz('Geben Sie <b>Real- und Imaginärteil</b> dieser Zahl an.');
    b.formel('<b>z = ' + Z.zahlText(rb, 2) + ' · cis(' + gb + '°)</b>');
    b.komplexZweiFelder({ name: 'S1A2b', vor: 'z =', soll: zb, p: 1, getrennt: true });

    /* ---- 2c: zuordnen, ohne zu rechnen ----

       Die vier Zahlen muessen sich QUALITATIV auseinanderhalten
       lassen - ueber den Quadranten oder ein deutlich anderes
       Steigungsverhaeltnis. Laegen zwei nahe beieinander, brauchte man
       den Arkustangens, und die Aufgabe verlangte genau das, was sie
       ausschliessen will. Deshalb: paarweise mindestens 40 Grad
       auseinander, dazu eine Zahl auf einer Achse und eine auf einer
       Winkelhalbierenden - die beiden, nach denen die Erklaerfrage
       fragt. */
    const halb = () => Math.round(zufall(-9, 9) * 2) / 2 || 3;
    function achse(){
      const v = halb();
      return w([true,false]) ? Z.K(v, 0) : Z.K(0, v);
    }
    function diagonal(){
      const v = halb();
      return w([true,false]) ? Z.K(v, v) : Z.K(v, -v);
    }
    const zahlen = (function(){
      for(;;){
        const k = [achse(), diagonal()];
        let versuche = 0;
        while (k.length < 4 && versuche++ < 200){
          const z = Z.K(halb(), halb());
          if (z.re === 0 || z.im === 0) continue;
          if (k.every(x => winkelAbstand(grad(z), grad(x)) >= 40)) k.push(z);
        }
        if (k.length === 4 &&
            winkelAbstand(grad(k[0]), grad(k[1])) >= 40) return mischen(k);
      }
    })();

    /* Zwei Ablenker, beide qualitativ erkennbar: einer mit dem Betrag
       der ersten Zahl, aber gegenueberliegendem Winkel - er trifft, wer
       ein Vorzeichen verwechselt. Der andere mit dem Winkel der dritten
       Zahl, aber deutlich anderem Betrag - er trifft, wer nur auf den
       Winkel schaut. */
    const ablenker = [
      polarText(Z.K(-zahlen[0].re, -zahlen[0].im)),
      polarText(Z.mal(zahlen[2], Z.K(1.6, 0)))
    ];
    const karten = mischen(zahlen.map(polarText).concat(ablenker));

    b.kasten('c) Ohne zu rechnen zuordnen');
    b.satz('Ordnen Sie jeder <b>Normalform</b> die passende <b>Polarform</b> zu, ' +
           '<b>ohne zu rechnen</b>. Erklären Sie jeweils, wie Sie zu Ihrer ' +
           'Einschätzung gekommen sind.');
    b.hinweis('Ziehen zum Zuordnen — und zum Zurücklegen in den Vorrat.');
    b.kartenZuordnung({ name: 'S1A2c', p: 0.25, quer: true,
      karten: karten.map((s, k) => ({ id: 'p' + k, text: s })),
      felder: zahlen.map((z, k) => ({ id: 'z' + k,
        kopf: '<b>' + Z.normalform(z, 2) + '</b>' })),
      richtig: zahlen.reduce((m, z, k) => {
        m['z' + k] = ['p' + karten.indexOf(polarText(z))];
        return m; }, {}),
      vorratMarke: 'Polarformen' });
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S1-A03', punkte: 3, titel: 'Wurzeln berechnen',
  auftrag: 'Geben Sie alle Lösungen in Polarform an. Die Reihenfolge spielt keine Rolle.',
  erklaeren: [
    'Warum hat eine Zahl <b>genau</b> n n-te Wurzeln — nicht mehr und nicht weniger?',
    'Wie liegen die drei Lösungen zueinander? Woran liegt das?',
    'Warum haben alle drei denselben Betrag?'
  ],
  bauen(b){
    /* n fest auf 3. Frueher gezogen aus {2,3} - und die Erklaerstelle
       fragte trotzdem immer nach DREI Wurzeln. Drei Loesungen sind
       ausserdem im Bild eine erkennbare Figur, zwei nur ein Strich. */
    const n = 3;
    const z = ganzzahl(10);
    const sollR = Math.pow(Z.betrag(z), 1/n);
    const sollG0 = ((Z.arg(z) * 180 / Math.PI) / n % 360 + 360) % 360;

    b.kasten();
    b.formel('Lösen Sie&emsp;<b>z<sup>' + n + '</sup> = ' + Z.normalform(z) + '</b>');
    /* Das Beispiel bewusst NICHT −120°/240°: Der Abstand der Loesungen
       ist genau die Einsicht, die geprueft wird - er hat in einem
       Formathinweis nichts verloren. */
    b.hinweis('Es gibt genau ' + n + ' Lösungen. Winkel im Gradmass; ' +
              'negative Winkel gelten auch — <b>−30°</b> ist dasselbe wie ' +
              '<b>330°</b>.');
    /* HIER STAND EIN SPOILER. Eine frueher Fassung zaehlte die vier
       Kriterien auf - «Punkte gibt es dafuer, dass die Loesungen
       gleichmaessig um 120 Grad versetzt stehen». Damit war die
       Einsicht verschenkt, die die Aufgabe pruefen soll: Wer das liest,
       setzt die Loesungen um 120 Grad versetzt, ohne zu wissen warum.
       Dass Teilpunkte zaehlen, steht allgemein auf der Einstiegsseite;
       WOFUER sie zaehlen, gehoert nicht in die Aufgabe. */
    b.wurzelschar({ name: 'S1A3', sollR: sollR, sollG0: sollG0, n: n, p: 3 });
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S1-A04', punkte: 3, titel: 'Bild zu Rechnung',
  auftrag: 'Drei Zeichnungen, jede für sich. Ergänzen Sie jeweils das Rechenzeichen in <b>z₁ ⬚ z₂ = z₃</b>.',
  erklaeren: [
    'Woran haben Sie den multiplikativen Fall erkannt — was macht der Ergebnispfeil ' +
    'dort, was er bei einer Addition nicht täte?',
    'Wie sähe eines der Bilder aus, wenn statt <b>×</b> geteilt worden wäre?',
    'Bei einer Multiplikation addieren sich die Winkel und die Beträge ' +
    'multiplizieren sich. Zeigen Sie das an einem der drei Bilder.'
  ],
  bauen(b){
    /* Kurze Moeglichkeiten, damit sie unter das Bild in eine Zeile
       passen. Das Rechenzeichen ist die ganze Frage - «z₁ + z₂ = z₃»
       dreimal nebeneinander waere nur Fuellung. */
    const OPT = ['+', '−', '×', '÷', 'kein Zusammenhang'];

    /* ---- Die Ziehung ----
       Eine multiplikative, eine additive, dazu eine der beiden noch
       nicht verwendeten Operationen - oder, in einem von vier Faellen,
       gar kein Zusammenhang. Dann traegt die fuenfte Antwort endlich;
       bisher war sie nie richtig und damit ueber mehrere Durchgaenge
       verschenkte Information.

       Die Abdeckung steht NICHT im Auftragstext: Wuesste man, dass
       genau je ein Fall vorkommt, waere aus drei Entscheidungen eine
       Zuordnungsaufgabe - wer zwei erkennt, bekaeme die dritte
       geschenkt. Wer sie ahnt, gewinnt wenig: Die Familie zu kennen
       sagt nichts darueber, ob × oder ÷, + oder −. */
    const mult = w(['×','÷']), add = w(['+','−']);
    const rest = ['×','÷','+','−'].filter(x => x !== mult && x !== add);
    const dritt = Math.random() < 0.25 ? null : w(rest);
    const ops = mischen([mult, add, dritt]);

    /* ---- Keine Grenzfaelle: ein Waechter statt einer Regelliste ----
       Der gezeichnete z₃ muss von den NICHT gemeinten Ergebnissen
       mindestens einen Rasterschritt entfernt liegen. Das erwischt alle
       Grenzfaelle auf einmal: |z₂| nahe 1 (dann liegen × und ÷ auf z₁),
       kurzes z₂ (dann liegen + und − beieinander), kleiner Drehwinkel
       (dann sieht die Multiplikation wie eine Streckung aus). Gemessen
       in Rasterschritten - der Einheit, in der die Studierenden das
       Bild lesen. */
    function ziehen(op){
      for (let versuch = 0; versuch < 400; versuch++){
        const z1 = betragIn(1.5, 4.5), z2 = betragIn(0.6, 1.8);
        const kand = { '+': Z.plus(z1,z2), '−': Z.minus(z1,z2),
                       '×': Z.mal(z1,z2),  '÷': Z.durch(z1,z2) };
        const z3 = op ? kand[op] : betragIn(1.0, 4.0);
        const max = ZE.achseFuer([z1, z2, z3], 2), schritt = max / 5;
        const andere = ['+','−','×','÷'].filter(x => x !== op).map(x => kand[x]);
        const weit = andere.every(k =>
          Math.hypot(z3.re - k.re, z3.im - k.im) >= schritt);
        if (weit) return { z1: z1, z2: z2, z3: z3, max: max };
      }
      return null;
    }

    /* Nebeneinander statt untereinander: Bild oben, Auswahl direkt
       darunter. Untereinander muesste man zwischen Zeichnung und
       Antwort scrollen, und das Nebenblatt laege ganz woanders.
       Die Flaeche wird auf 300 gezeichnet, nicht auf 380 - eine
       Zeichnung, die kleiner dargestellt wird als gezeichnet, schrumpft
       ihre Beschriftung mit. */
    b.nebeneinander(ops.map((op, k) => (sp) => {
      const g = ziehen(op);
      if (!g) return;                       // sollte nicht vorkommen
      const f = ZE.flaeche({ max: g.max, breite: 300 });
      f.pfeil(g.z1, { farbe: 'var(--tinte)',  marke: 'z₁' });
      f.pfeil(g.z2, { farbe: 'var(--matt)',   marke: 'z₂' });
      f.pfeil(g.z3, { farbe: 'var(--akzent)', dicke: 2.2, marke: 'z₃' });

      sp.kasten(['a','b','c'][k] + ')');
      sp.bild(f);
      /* Die Gleichung steht ueber der Auswahl, weil ihre FORM die
         Aufgabe eindeutig macht. Ohne sie waere bei z₁ × z₂ = z₃ auch
         «÷» vertretbar - z₃ ÷ z₂ ist ja z₁. Gefragt ist aber genau
         das Zeichen zwischen z₁ und z₂. */
      sp.formel('z₁ <b>⬚</b> z₂ = z₃');
      sp.wahl({ name: 'S1A4.' + ['a','b','c'][k], optionen: OPT, mischen: false,
                quer: true, richtig: op ? OPT.indexOf(op) : 4, p: 1 });
    }));
  }
},

/* ---------------------------------------------------------- 5 */
{ nr: 5, id: 'S1-A05', punkte: 3, titel: 'Rechnung zu Bild',
  auftrag: 'Drei Rechnungen. Klicken Sie in jeder Zeichnung den Pfeil an, der dazu passt.',
  erklaeren: [
    'Bei der Wurzel haben Sie einen von drei Pfeilen gewählt. <b>Wo lägen die beiden ' +
    'anderen Lösungen?</b>',
    'Beim Potenzieren: was passiert mit Betrag und Winkel? Warum liegt der ' +
    'Ergebnispfeil dort, wo Sie geklickt haben?',
    'Woran hätten Sie gemerkt, wenn keiner der drei Pfeile gepasst hätte?'
  ],
  bauen(b){
    /* Drei Zeichnungen nebeneinander, jede mit ihrer Rechnung darueber.
       Gezeichnet wird auf 300, damit die Beschriftung in der schmaleren
       Spalte nicht mitschrumpft. */

    /* ---- a) Eine der vier Grundoperationen ----
       Hier darf gezogen werden: + und − sind nicht geschenkt, weil die
       Ablenker die Ergebnisse der jeweils ANDEREN Operationen sind -
       man muss unterscheiden, nicht bloss erkennen. */
    const grundoperation = (sp) => {
      const op = w(['+', '−', '×', '÷']);
      const z1 = betragIn(1.5, 4.5), z2 = betragIn(0.6, 1.8);
      const rechne = x => x === '+' ? Z.plus(z1,z2) : x === '−' ? Z.minus(z1,z2)
                        : x === '×' ? Z.mal(z1,z2) : Z.durch(z1,z2);
      const andere = mischen(['+','−','×','÷'].filter(x => x !== op)).slice(0,2);
      const kandidaten = mischen([{ z: rechne(op), echt: true }]
        .concat(andere.map(o => ({ z: rechne(o) }))));

      const f = ZE.flaeche({ max: ZE.achseFuer([z1, z2].concat(
        kandidaten.map(k => k.z)), 2), breite: 300 });
      f.pfeil(z1, { farbe: 'var(--tinte)', marke: 'z₁' });
      f.pfeil(z2, { farbe: 'var(--matt)',  marke: 'z₂' });
      let ziel = null;
      kandidaten.forEach((k, j) => {
        const name = 'w' + (j+1);
        if (k.echt) ziel = name;
        f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 2, ziel: name, marke: name });
      });

      sp.kasten('a) Eine Grundrechenart');
      sp.formel('<b>z₁ ' + op + ' z₂</b>');
      sp.bildwahl({ name: 'S1A5.a', flaeche: f, richtig: ziel, p: 1 });
    };

    /* ---- b) die Potenz, c) die Wurzel ----
       Frueher wurde zwischen beiden gezogen - die Haelfte der
       Studierenden sah die Wurzel im Bild nie. Mit drei Zeichnungen ist
       Platz fuer beide.

       Betrag nahe bei 1, damit Potenz und Wurzel im Bild bleiben und
       der Winkel entscheidet, nicht die Laenge. */
    const hochOderWurzel = (marke, istWurzel) => (sp) => {
      const n = w([2, 3]);
      const r = zufall(1.2, 1.55), phi = zufall(0.5, 2.4) * w([1,-1]);
      const z = Z.K(r*Math.cos(phi), r*Math.sin(phi));

      const potenz = Z.hoch(z, Z.K(n));
      const wurzel = Z.hoch(z, Z.K(1/n));
      const richtig = istWurzel ? wurzel : potenz;
      const falsch1 = istWurzel ? potenz : wurzel;
      /* Zweiter Ablenker: richtiger Betrag, gespiegelter Winkel -
         trifft genau, wer das Vorzeichen des Winkels verwechselt. */
      const falsch2 = Z.K(richtig.re, -richtig.im);

      const kandidaten = mischen([
        { z: richtig, echt: true }, { z: falsch1 }, { z: falsch2 }]);
      const f = ZE.flaeche({ max: ZE.achseFuer(
        [z].concat(kandidaten.map(k => k.z)), 1.5), breite: 300 });
      f.kreis(1);
      f.pfeil(z, { farbe: 'var(--tinte)', marke: 'z' });
      let ziel = null;
      kandidaten.forEach((k, j) => {
        const name = 'w' + (j+1);
        if (k.echt) ziel = name;
        f.pfeil(k.z, { farbe: 'var(--akzent)', dicke: 2, ziel: name, marke: name });
      });

      /* «z hoch ein Drittel» schreibt niemand und liest sich wie eine
         Rechenvorschrift. Gefragt ist eine WURZEL - und dass es davon
         mehrere gibt, von denen hier nur eine im Bild steht, muss
         dastehen, sonst sucht man vergeblich nach den anderen. */
      const wort = n === 2 ? 'Quadratwurzel' : 'dritte Wurzel';
      const mehrzahl = n === 2 ? 'zwei Quadratwurzeln' : 'drei dritte Wurzeln';
      sp.kasten(marke + ') ' + (istWurzel ? 'Eine Wurzel' : 'Eine Potenz'));
      sp.formel(istWurzel ? 'eine <b>' + wort + '</b> aus z'
                          : '<b>z<sup>' + n + '</sup></b>');
      sp.bildwahl({ name: 'S1A5.' + marke, flaeche: f, richtig: ziel, p: 1 });
      sp.hinweis('Der gestrichelte Kreis ist der Einheitskreis.' + (istWurzel
        ? ' Es gibt ' + mehrzahl + ' aus z — hier steht nur eine davon unter den ' +
          'Pfeilen.' : ''));
    };

    b.nebeneinander([grundoperation,
                     hochOderWurzel('b', false),
                     hochOderWurzel('c', true)]);
  }
}
];

window.PIA.pruefung({
  station: 1,
  startseite:
    '<p>Fünf Aufgaben zu je drei Punkten. Es geht ums <b>Rechnen</b> mit komplexen ' +
    'Zahlen, um den Wechsel zwischen <b>Normal- und Polarform</b>, um <b>Wurzeln</b> ' +
    '— und darum, den Zusammenhang zwischen einer Rechnung und ihrem <b>Bild</b> in ' +
    'beide Richtungen zu sehen.</p>' +
    '<p><b>So arbeiten Sie.</b> Oben stehen die Aufgaben; Sie können frei ' +
    'zwischen ihnen wechseln und jederzeit zurück. Eingetragenes bleibt stehen. ' +
    'Wo eine Zahl verlangt ist, sagt Ihnen die Seite sofort, ob sie Ihre Eingabe ' +
    '<i>lesen</i> kann — aber nicht, ob sie stimmt. Das erfahren Sie erst am ' +
    'Schluss.</p>' +
    '<p><b>Teilpunkte zählen.</b> Fast jede Aufgabe zerfällt in mehrere Teile, und ' +
    'jeder zählt für sich. Es lohnt sich also, auch das hinzuschreiben, was Sie ' +
    'sicher wissen — auch wenn am Ende nicht alles stimmt. Leer lassen bringt ' +
    'nichts.</p>' +
    '<p><b>Reden Sie mit.</b> Die Aufnahme läuft. Erzählen Sie, was Sie tun und ' +
    'warum — auch wenn Sie nicht weiterkommen. Wer eine Aufgabe richtig hat, sie ' +
    'aber nicht erklären kann, hat sie nicht bestanden. Umgekehrt hilft eine gute ' +
    'Erklärung, auch wenn das Ergebnis daneben liegt. Zu jeder Aufgabe gibt es ' +
    'ausserdem eine <b>Zusatzfrage</b>: Oben rechts steht ein Knopf ' +
    '«Zusätzlich erklären». Drücken Sie ihn, <b>wenn Sie mit der Aufgabe fertig ' +
    'sind</b> — dann erscheint die Frage daneben und die Stelle wird in der ' +
    'Aufnahme markiert. Punkte gibt es dafür keine; zur Prüfung gehört sie ' +
    'trotzdem.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Rechnen mit komplexen Zahlen, Wechsel zwischen Normal- und ' +
            'Polarform, Wurzeln, und der Zusammenhang zwischen Rechnung und Bild.',
  aufgaben: AUFGABEN
});
})();
