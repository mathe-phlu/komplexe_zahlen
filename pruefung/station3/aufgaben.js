/* ============================================================
   Station 3 - Komplexe Folgen

   Fuenf Aufgaben zu je drei Punkten, 15 Punkte. Umgebaut am
   25.09.2026 nach Rikes Durchsicht; vorher vier Aufgaben mit der
   Punkteverteilung der Moodle-Fassung.

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

/* DIE REIHENFOLGE WURDE AM 26.09.2026 GEAENDERT, die IDs NICHT.

   Rike: «Aufgabe 1, 2 und 5 gehoeren fuer mich zusammen, wir muessten
   die nacheinander laufen lassen.» Stimmt - erst die Sorte am Term,
   dann die Sorte im Bild, dann die Zahl dahinter. Und die neue
   Aufgabe 2 fuehrt z² ein, mit dem Aufgabe 4 weiterarbeitet.

   nr  id       was
    1  S3-A01   Bahnen vorhersagen
    2  S3-A05   Welche Bahn gehoert zu welchem Iterator
    3  S3-A02   Zyklenlaenge bestimmen
    4  S3-A03   Zyklen bei f(z) = z²
    5  S3-A04   Begriffe einordnen

   nr und id laufen damit auseinander. Das ist Absicht: AGENTS.md sagt,
   die IDs duerfen sich NIE aendern. Gefahrlos ist die Umnummerierung
   nur, weil Station 3 nirgends verlinkt ist und niemand einen
   Wiedereintrittscode hat (Rike, 25.09.) - der Code traegt die offenen
   Aufgaben als Bitmaske ueber `nr`. Ist die Station einmal verlinkt,
   ist die Reihenfolge festgenagelt. */

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S3-A01', punkte: 3, titel: 'Bahnen vorhersagen',
  auftrag: 'Drei Iteratoren — einer divergent, einer konvergent, einer zyklisch. Welcher ist welcher?',
  /* Rike, 25.09.: «Sie sollen jeweils erklaeren, warum.» Das geschieht
     hier - muendlich an der Erklaerstelle, im Video festgehalten und im
     Gespraech beurteilt, nicht gerechnet. Drei Fragen, eine je Sorte:
     So kommt die Begruendung zu genau der Zuordnung, die sie stuetzt. */
  erklaeren: [
    'Sie haben einen Iterator als <b>divergent</b> eingestuft. Woran haben Sie ' +
    'das gesehen — ohne einen einzigen Schritt zu rechnen?',
    'Beim <b>konvergenten</b>: Auf welchen Punkt läuft die Bahn zu, und warum ' +
    'gerade auf diesen?',
    'Beim <b>zyklischen</b>: Wie kommt die Zyklenlänge zustande, die Sie ' +
    'eingetragen haben?'
  ],
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
       Jetzt stehen sie nur noch als Kartenaufschrift.

       UMGEBAUT (2026-09-25): Aus der Kaertchenzuordnung werden DREI
       GETRENNTE ENTSCHEIDUNGEN - genau der Umbau, den Station 2 an
       ihrer Aufgabe 4 am 09.09.2026 schon gemacht hat.

       Der Grund ist dort wortgleich aufgeschrieben: Solange eine
       Beschreibung uebrig blieb, war die Zuordnung eine; sobald jede
       Sorte genau einmal vorkommt, ist sie keine mehr. WER ZWEI
       ERKENNT, BEKOMMT DIE DRITTE GESCHENKT. Die Gewichtung hat das
       zugegeben, ohne es zu beheben.

       Das Papier vom 17.09. hatte hier eine VIERTE KARTE empfohlen.
       Das geht nicht: Jeder Iterator a·z + b ist divergent, konvergent
       oder zyklisch, je nachdem ob |a| groesser, kleiner oder gleich 1
       ist - eine vierte Karte faellt also zwingend in eines der drei
       Faecher und macht die Zuordnung mehrdeutig. Ein vierter Fall
       ("bleibt stehen", "dicht auf dem Kreis") waere entweder
       konstruiert oder zu fein. Die Empfehlung war acht Tage juenger
       als der Entscheid, der sie schon widerlegt hatte.

       UNTER JEDEM ITERATOR STEHT DIESELBE LISTE. Das ist dieselbe
       erwuenschte Kopplung wie in Station 2: Mit allen drei
       Moeglichkeiten unter jedem der drei ist der Aufgabe nicht mehr
       anzusehen, dass jede Sorte genau einmal vorkommt. Die Abdeckung
       bleibt im Generator, wo sie hingehoert. */
    /* UMGEBAUT ZUM ZWEITEN MAL (2026-09-25, nach Rikes Durchsicht):
       «Ob wir nicht von vornherein ihnen sagen, einer der drei ist
       divergent, einer ist konvergent, einer ist zyklisch.»

       Damit ist die Kopplung ANGESAGT statt verschwiegen - und das
       aendert, was die Aufgabe wert ist. Wer zwei zuordnet, hat die
       dritte; drei Zuordnungen sind zusammen zwei Entscheidungen.
       Deshalb sitzt der vierte Punkt auf der ZYKLENLAENGE, die nicht
       geschenkt ist: vier Felder zu je 0,75.

       Warum das trotzdem besser ist als die verschwiegene Kopplung von
       heute Morgen: Rike will die BEGRUENDUNG sehen, nicht das Raten
       ausschliessen. Die Begruendung steht in der Erklaerstelle und
       wird im Gespraech beurteilt, nicht hier gerechnet. Wer richtig
       zuordnet und nicht sagen kann warum, faellt dort auf.

       Nebeneinander statt untereinander - Rike: «alle untereinander
       und jeweils immer so ueber die gesamte Laenge». Drei schmale
       Spalten wie in Station 2, Aufgabe 4. */
    /* ZIEHEN STATT DREIMAL DIESELBE LISTE (2026-09-26). Rike hatte
       das schon am 25.09. gesagt - «einer der drei ist divergent,
       einer konvergent, einer zyklisch, und sie sollen entscheiden,
       welcher welcher ist» -, und ich hatte daraus drei identische
       Auswahllisten gemacht. Ihr Urteil beim Nachsehen: «Wenn jedes
       Mal die gleichen drei Sachen dastehen, wuerde ich eher dazu
       neigen, dass man einfach nur einmal zyklisch, einmal
       konvergent, einmal divergent stehen hat und das zu a, b oder c
       ziehen muss.»

       Mein Grund fuer die Listen war, die geschenkte dritte Zuordnung
       zu vermeiden. Der Grund traegt nicht: Rike hat die Kopplung
       BEWUSST angesagt, und das Gewicht liegt auf der Zyklenlaenge und
       auf der Begruendung im Gespraech. */
    const SORTEN = [
      { id: 'div', text: 'divergent',  art: 'divergent'  },
      { id: 'kon', text: 'konvergent', art: 'konvergent' },
      { id: 'zyk', text: 'zyklisch',   art: 'zyklisch'   }
    ];
    const gemischt = mischen(terme);

    b.kasten('Drei Iteratoren');
    b.satz('Jeder wird auf einen Startwert angewendet und dann immer wieder auf ' +
           'das Ergebnis. <b>Einer der drei erzeugt divergente Folgen, einer ' +
           'konvergente, einer zyklische.</b> Ziehen Sie jede Beschreibung zu ' +
           'ihrem Iterator.');
    /* ZWEI PUNKTE FUER DIE ZUORDNUNG, EINER FUER DIE ZYKLENLAENGE
       (2026-09-26). Rikes Rechnung, und sie ist richtig: «Wenn man
       zwei richtig hat bei a, b und c, dann hat man ja auch den
       dritten automatisch richtig. Das heisst, das gibt maximal zwei
       Punkte fuer die Zuordnung. Und die Zyklenlaenge gibt dann
       nochmal einen Punkt.»

       Die Zuordnung ist EINE Entscheidung - eine Permutation von
       dreien -, keine drei unabhaengigen. Drei Felder zu je 2/3
       bilden das ab, ohne dass ein einzelnes Feld mehr waere, als es
       ist. */
    b.kartenZuordnung({ name: 'S3A1', p: 2/3, quer: true,
      vorratMarke: 'Verhalten',
      karten: mischen(SORTEN).map(s => ({ id: s.id, text: s.text })),
      /* Kein &nbsp; in der Aufschrift: feldWort() wirft Auszeichnung
         weg, aber keine Entitaeten - «a)&nbsp; f(z) = …» landete so im
         Protokoll und in der Rueckmeldung. */
      felder: gemischt.map((x, k) => ({ id: 'f' + k,
        kopf: '<b>' + 'abc'[k] + ')</b> ' + x.text })),
      richtig: gemischt.reduce((s, x, k) => {
        s['f' + k] = [SORTEN.find(y => y.art === x.art).id];
        return s;
      }, {}) });

    b.kasten('Und beim zyklischen');
    b.satz('Wie viele Schritte braucht der <b>zyklische</b> Iterator, bis eine ' +
           'Bahn wieder am Anfang ist?');
    b.reell({ name: 'S3A1.laenge', vor: 'Zyklenlänge', p: 1,
              soll: (Math.abs(a1.re + 1) < 1e-9 ? 2 : 4) });
  }
},

/* ---------------------------------------------------------- 2 */
/* NEU (2026-09-25, Weg A) - und in der ersten Fassung falsch gebaut.

   ERSTE FASSUNG: Drei Bahnen gezeichnet, den Fixpunkt anklicken. Rike:
   «Die Aufgabe verstehe ich nicht. Man klickt einfach nur an, rein
   optisch, wo das herlaeuft. Das hat nichts mit der Funktion zu tun.»

   Sie hat recht, und zwar vollstaendig: a und b kamen in der Aufgabe
   gar nicht vor. Die Bahn zeigte den Punkt, man klickte ihn an. Ich
   hatte behauptet, es sei «dieselbe Rechnung wie das Drehzentrum in
   Station 2» - es fand aber ueberhaupt keine Rechnung statt. Eine
   Aufgabe, deren Antwort im Angebot schon sichtbar ist, prueft nichts.

   ZWEITE FASSUNG: Richtung umgedreht. Die Bahn ist gegeben, der
   ITERATOR ist gesucht. Damit ist die Funktion unvermeidlich.

   UND DANN RIKES EINWAND ZUR ZWEITEN: «Sie ist relativ analog zu der
   Aufgabe, wo sie nur die Iteratoren haben.» Auch das stimmt - es
   waere Aufgabe 1 rueckwaerts, derselbe Begriff nur umgedreht.

   IHR VORSCHLAG LOEST ES: «Wir koennten theoretisch auch den
   z-Quadrat-Iterator mit reinnehmen.» Damit entsteht eine
   Unterscheidung, die es sonst nirgends gibt:

     f(z) = cis(120°)·z   drei Punkte auf dem Einheitskreis,
                          GLEICHMAESSIG verteilt - konstanter Schritt
     f(z) = z²            drei Punkte auf dem Einheitskreis,
                          UNGLEICH - der Winkel verdoppelt sich

   Beide sind ein Dreieck auf dem Einheitskreis um den Nullpunkt. Nur
   die Abstaende trennen sie, und die versteht nur, wer beide
   Mechanismen kennt. Das kann Aufgabe 1 nicht fragen, und es haengt
   an Aufgabe 3, wo die Verdopplung eingefuehrt wird.

   Die beiden Kreisfaelle sind IMMER dabei; der dritte Platz wechselt
   zwischen der zulaufenden und der weglaufenden Spirale, der vierte
   Iterator bleibt uebrig. Ein Uebriggebliebener ist hier richtig -
   anders als in Aufgabe 1, wo jede Sorte genau einmal vorkam: Er
   traegt Information, weil man ihn ausschliessen muss. */
{ nr: 2, id: 'S3-A05', punkte: 3, titel: 'Welche Bahn gehört zu welchem Iterator',
  auftrag: 'Drei Bahnen, vier Iteratoren. Ziehen Sie jeden zu seiner Bahn — einer bleibt übrig.',
  erklaeren: [
    'Zwei der Bahnen liegen auf dem Einheitskreis. Woran haben Sie sie ' +
    'auseinandergehalten?',
    'Der übriggebliebene Iterator: Wie sähe <b>seine</b> Bahn aus?'
  ],
  bauen(b){
    const GRENZE = 2.2;

    /* ALLE ITERATOREN IN POLARFORM (2026-09-26). Rike: «Es sind recht
       anspruchsvolle Iteratoren. Ist das bewusst so gewaehlt?»

       Nein - es war ein Nebenprodukt, und ein schlechtes. Ich hatte a
       als r·cis(g) gewuerfelt, damit die SPIRALE im Bild gut aussieht,
       und das Ergebnis dann in Normalform hingeschrieben: «(1.1 +
       0.83i)». Wer daran |a| erkennen will, muss eine Wurzel ziehen.
       Das ist Rechenarbeit ohne Einsicht - das Gegenteil dessen, was
       die Aufgabe pruefen soll.

       In Polarform steht der Betrag da, und die Arbeit ist wieder
       begrifflich: Was macht |a| < 1, was |a| = 1, was |a| > 1. */
    const stern = w([Z.K(1,1), Z.K(-1,1), Z.K(1,-1), Z.K(-1,-1)]);

    function spirale(r, g, abstand, schritte){
      const a = Z.mal(Z.K(r,0), cis(g));
      let z = Z.plus(stern, Z.mal(Z.K(abstand,0), cis(w([25,115,205,295]))));
      const bahn = [z];
      for (let j = 0; j < schritte; j++){
        z = Z.plus(stern, Z.mal(a, Z.minus(z, stern)));
        if (Z.betrag(z) > GRENZE + 1) break;
        bahn.push(z);
      }
      return { bahn: bahn, zu: false,
               text: 'f(z) = ' + r + '·cis(' + g + '°) · z + ' +
                     Z.normalformGeklammert(Z.mal(Z.minus(Z.K(1,0), a), stern), 1) };
    }

    /* Der gleichmaessige Fall: drei Punkte im Abstand 120°. */
    const start = w([0, 40, 80, 160]);
    const dreh = { bahn: [0,1,2].map(j => cis(start + j*120)), zu: true,
                   text: 'f(z) = 1·cis(120°) · z' };

    /* Der verdoppelnde Fall: 1/7, 2/7, 4/7 des Vollwinkels - oder
       3/7, 6/7, 5/7. Beide sind Dreierzyklen unter t -> 2t. */
    const k0 = w([1, 3]);
    const quadrat = { bahn: [0,1,2].map(j => cis((k0 * Math.pow(2,j) % 7) / 7 * 360)),
                      zu: true, text: 'f(z) = z²' };

    const hinein = spirale(0.6, 50, 1.25, 6);
    const hinaus = spirale(1.4, 40, 0.55, 7);

    /* Beide Kreisfaelle immer dabei, eine Spirale gezogen, die andere
       bleibt uebrig. */
    const gezeigt = mischen([dreh, quadrat, w([hinein, hinaus])]);
    const alle = mischen([dreh, quadrat, hinein, hinaus]);

    /* `inhalt` nimmt ein ELEMENT, `kopf` nur Text - so steht die
       Beschriftung ueber dem Bild statt darunter, und die Aufschrift
       im Protokoll bleibt lesbar («a)» statt einer leeren
       Zeichenkette, weil feldWort() die Auszeichnung wegwirft). */
    function bildFuer(fall){
      const f = ZE.flaeche({ max: GRENZE, breite: 230, gitter: true,
                             achsenzahlen: false });
      f.kreis(1, { gestrichelt: true, farbe: 'var(--linie)' });
      f.zug(fall.bahn.concat(fall.zu ? [fall.bahn[0]] : []),
            { farbe: 'var(--linie)', dicke: 1.1 });
      /* DER STARTWERT MUSS ZU SEHEN SEIN. Rike, 26.09.: «Du sagst
         immer, der Startwert waere schwarz, das sieht man im Moment
         so nicht.» Sie hat die Aufgabe trotzdem geloest - aber nur,
         weil sie wusste, welcher Punkt gemeint war. Ihre ganze
         Ueberlegung haengt daran: «der ist ausserhalb der 1, dann
         muss es ja eine divergierende Folge sein.» Ohne erkennbaren
         Startwert ist dieser Weg zu.

         Also nicht nur dunkler und groesser, sondern beschriftet. */
      fall.bahn.forEach((pt, j) => f.punkt(pt, {
        farbe: j === 0 ? 'var(--tinte)' : 'var(--matt)',
        gr: j === 0 ? 4.6 : 2.6,
        marke: j === 0 ? 'z₀' : undefined,
        richtung: 'aussen', abstand: 13 }));
      return f.svg;
    }

    b.kasten('Drei Bahnen');
    b.satz('Jede Zeichnung zeigt eine Bahn: den Startwert (schwarz), sein Bild, ' +
           'dessen Bild. <b>Ziehen Sie jeden Iterator zu der Bahn, die er ' +
           'erzeugt.</b> Einer bleibt übrig.');
    b.kartenZuordnung({ name: 'S3A5', p: 1, quer: true,
      vorratMarke: 'Iteratoren',
      karten: alle.map((x, k) => ({ id: 'i' + alle.indexOf(x), text: x.text })),
      felder: gezeigt.map((fall, k) => ({ id: 'b' + k,
        kopf: 'abc'[k] + ')', inhalt: bildFuer(fall) })),
      richtig: gezeigt.reduce((s, fall, k) => {
        s['b' + k] = ['i' + alle.indexOf(fall)];
        return s;
      }, {}) });

    b.hinweis('Der gestrichelte Kreis ist der Einheitskreis, das Gitter sind die ' +
              'ganzen Zahlen. <b>cis(φ)</b> ist die Zahl vom Betrag 1 mit dem ' +
              'Winkel φ — der Faktor davor ist also der Betrag.');
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S3-A02', punkte: 3, titel: 'Zyklenlänge bestimmen',
  erklaeren: ['Wie kommt die Zyklenlänge zustande? Rechnen Sie es an <b>einem</b> ' +
              'Ihrer drei Beispiele vor.'],
  auftrag: 'Alle drei Zahlen haben den Betrag 1. Lesen Sie den Winkel ab — und sagen Sie, wie lange es dauert, bis sich die Bahn wiederholt.',
  bauen(b){
    /* ZWEIMAL UMGEBAUT AM 25.09.2026, und der erste Umbau war falsch.

       Er ersetzte die alte Fassung («Erst einmal ausprobieren» plus
       zwei Zahlen ohne Bild) durch drei gleiche Einheitskreise mit 24
       anklickbaren Marken. Rike hat ihn beim Durchsehen zerlegt:

         «Durch das Einzeichnen wird die Aufgabe eklatant einfacher.
          Dadurch, dass so viele Punkte eingezeichnet sind und die
          vorgegeben sind, ist es durch Ausschlussverfahren sofort klar
          und dann zaehlt man nur noch ab. Es wird gar nicht mehr
          geprueft, dass sie verstehen, dass sie in die Polarform
          umrechnen muessen.»

       Sie hat recht, und der Fehler ist benennbar: DIE 24 MARKEN SIND
       DIE MENGE ALLER MOEGLICHEN WINKEL. Das Setzen des Punktes ist
       damit eine Auswahl aus 24, und die trifft man nach Augenmass -
       oben rechts, etwas ueber der Diagonalen. Wer den Punkt gesetzt
       hat, kann die Zyklenlaenge anschliessend im Bild ABZAEHLEN; auch
       der zweite Teil braucht das ggT-Argument nicht mehr.

       Verteidigt hatte ich den Kreis als «kariertes Papier, verraet
       nichts». Kariertes Papier hat keine 24 Felder, von denen eines
       die Antwort ist.

       JETZT: kein Bild. Der Winkel wird EINGETRAGEN - das ist die
       Umrechnung in die Polarform, und sie ist nicht zu raten. Die
       geometrische Groesse ist der Winkel selbst; er wird verlangt
       statt angeboten. Drei gleich gebaute Teile, kein Uebungsstueck
       vorneweg. */
    const winkel = [ w([90, 180, 270]), w([45, 135, 225, 315]),
                     w([30, 60, 120, 150, 210, 240, 300, 330]) ];

    b.kasten('Drei Zahlen vom Betrag 1');
    b.satz('Jede erzeugt einen Iterator <b>f(z) = a · z</b> mit Startwert ' +
           '<b>z₀ = 1</b>. Tragen Sie erst den <b>Winkel</b> von a ein, dann die ' +
           '<b>Zyklenlänge</b>.');

    b.nebeneinander(winkel.map((grad, k) => (sp) => {
      sp.kasten('abc'[k] + ')');
      sp.formel('a = ' + exakt(grad));
      sp.reell({ name: 'S3A2.winkel' + k, vor: 'φ =', nach: '°', p: 0.5,
                 zeigt: 'Winkel von a', soll: grad });
      sp.reell({ name: 'S3A2.laenge' + k, vor: 'Zyklenlänge', p: 0.5,
                 soll: zyklenlaenge(grad) });
    }));

    b.hinweis('Die Zahlen stehen in exakter Form — der Winkel lässt sich ablesen, ' +
              'ohne zu rechnen. Er zählt von der positiven reellen Achse aus, ' +
              'gegen den Uhrzeigersinn, zwischen 0° und 360°.');
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S3-A03', punkte: 3, titel: 'Zyklen bei f(z) = z²',
  erklaeren: [
    'Warum gehören nicht alle Lösungen von z<sup>2^y</sup> = z zu Zyklen genau ' +
    'der Länge y?',
    'Warum hat <b>z<sup>m</sup> = z</b> genau <b>m</b> Lösungen — und welche ' +
    'davon ist die langweiligste?'
  ],
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
    /* DIE LISTE IN ZWEI SPALTEN, UND OHNE DIE GRADSPALTE.

       Das war Rikes einziger Einwand an dieser Aufgabe, vom 17.09. und
       nochmal am 26.09.: «Ich fand einfach die Liste alles untereinander
       nebendran sehr lang und unuebersichtlich dargestellt.»

       Ich habe daraufhin fuenf Runden lang an den NENNERN gedreht und
       jedes Mal die Substanz weggenommen - mit einem Nenner kommt nur
       eine Zyklenlaenge vor, und «finden Sie einen Dreierzyklus» ist
       keine Aufgabe mehr, wenn alles Dreierzyklen sind. Rike, 26.09.:
       «Wenn wir bereits die 4er oder 2er Zyklen aussortieren, dann ist
       doch gar nichts Spannendes mehr dabei.»

       Der Inhalt war nie kaputt. Zweiundzwanzig Punkte mit den Laengen
       2, 3 und 4 sind genau richtig; nur die Liste war eine Saeule aus
       22 Zeilen neben einem quadratischen Bild.

       Zwei Spalten halbieren die Hoehe. Die Gradspalte faellt weg: Zum
       Verdoppeln braucht man den BRUCH - 2·(1/7) = 2/7 -, die Gradzahl
       ist nur Beiwerk und hat die Zeile doppelt so breit gemacht. */
    const liste = P.el('div', 'punkteliste');
    liste.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;' +
                          'gap:0 18px;align-content:start';
    const haelfte = Math.ceil(punkte.length / 2);
    [0, haelfte].forEach(von => {
      const tab = document.createElement('table');
      punkte.slice(von, von + haelfte).forEach(pt => {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td class="nr">' + pt.name + '</td><td>=</td>' +
          (pt.k === null
            ? '<td>0 (Nullpunkt)</td>'
            : '<td><span class="bruch">' + bruchText(pt.k) + '</span> · 360°</td>');
        tab.appendChild(tr);
      });
      liste.appendChild(tab);
    });

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
    /* Der Halbsatz «damit laesst sich das Verdoppeln rechnen statt
       raten» ist weg, Rikes Zustimmung vom 17.09.: Er sagt nichts, was
       nicht schon im Auftrag steht - «verdoppelt sich der Winkel» -,
       nennt aber die Arbeitsweise. Der erste Halbsatz bleibt, sonst
       uebersieht jemand die Liste. */
    b.hinweis('Die Liste rechts gibt jeden Punkt als Bruchteil des Vollwinkels. ' +
              'Wählen Sie oben, welche Antwort Sie gerade eintragen; ein Klick ' +
              'wählt einen Punkt, ein zweiter nimmt ihn zurück.');

    b.punktEbenen({ name: 'S3A3', flaeche: f, neben: liste, ebenen: [
      { schluessel: 'fix', text: '(a) Fixpunkte', wort: 'Fixpunkte',
        farbe: 'var(--richtig)',
        richtig: fixpunkte, p: 1 },
      { schluessel: 'zyk', text: '(b) ein Zyklus der Länge ' + gefragt,
        wort: 'ein Zyklus der Länge ' + gefragt,
        farbe: 'var(--falsch)', p: 1,
        pruefer: g => passende.some(bahn =>
          bahn.length === g.length && bahn.every(x => g.indexOf(x) >= 0)),
        sollText: passende.map(x => x.join('+')).join('  oder  '),
        /* Hier gibt es mehrere richtige Antworten, deshalb ein Prüfer
           statt einer festen Menge. Der Prüfstand `richtigkeit.html`
           muss aber EINE richtige Antwort eintragen können, um zu
           sehen, ob sie die volle Punktzahl gibt - dafür dieses
           Beispiel. Für die Prüfung selbst hat es keine Wirkung. */
        beispiel: passende[0],
        /* Alle gültigen Antworten - damit auch eine abgestürzte
           Prüfung nachgewertet werden kann, ohne den Prüfer zu
           haben (der ist eine Funktion und übersteht kein JSON). */
        mengen: passende }
    ]});

    /* (c) Die Zählkette */
    const y = w([5,6,7,8,9]);
    const genau = genauPeriode(y);
    b.kasten('Und wenn es mehr werden');
    b.satz('Um einen Zyklus der Länge <b>' + y + '</b> zu finden, muss man die ' +
           'Gleichung <b>z<sup>m</sup> = z</b> lösen.');
    /* EIN FELD WENIGER. «m =» und «Diese Gleichung hat … Loesungen»
       hatten dieselbe Antwort, 2^y - sachlich richtig, denn z^m = z hat
       genau m Loesungen, aber zwei Felder mit derselben Zahl lesen sich
       wie ein Versehen. Rike hat es beim Durchklicken selbst bemerkt.
       Die Gleichheit ist jetzt Erklaerfrage. */
    /* ALS LUECKENTEXT, NICHT ALS DREI ZEILEN MIT ETIKETT (2026-09-27).
       Rike am Bildschirmfoto: «Beim Bild unten sind die Platzhalter
       immer hinten. Waere es nicht besser, das als Lueckentext zu
       gestalten? Oder so, dass alle Kaesten untereinander stehen und
       deutlich wird, dass drei Dinge entschieden werden muessen.»

       Sie hat recht: `reell` setzt das Etikett links und das Feld
       dahinter, und weil die drei Etiketten verschieden lang sind,
       standen die Kaesten treppenfoermig. Man sah drei Zeilen, aber
       nicht, dass sie EINE Kette bilden.

       `formelZeile` nimmt Text und Felder gemischt - der Satz laeuft
       durch, die Luecken sitzen darin. Das zeigt die Kette als Kette.
       Und es kommt ohne Aenderung an gemeinsam/ aus, die sonst eine
       weitere Uebernahme durch Lars ausgeloest haette. */
    b.formelZeile([
      'Es gibt',
      { name: 'S3A3.m', art: 'reell', p: 1/3, soll: Math.pow(2,y), schmal: true,
        zeigt: 'Anzahl der Lösungen' },
      'Lösungen. Davon gehören',
      { name: 'S3A3.genau', art: 'reell', p: 1/3, soll: genau, schmal: true,
        zeigt: 'davon in Zyklen genau der Länge ' + y },
      'zu Zyklen genau der Länge ' + y + ' — das sind',
      { name: 'S3A3.zyklen', art: 'reell', p: 1/3, soll: genau / y, schmal: true,
        zeigt: 'Anzahl dieser Zyklen' },
      'Zyklen.'
    ]);
  }
},

/* ---------------------------------------------------------- 4 */,

/* ---------------------------------------------------------- 5 */
{ nr: 5, id: 'S3-A04', punkte: 3, titel: 'Begriffe einordnen',
  auftrag: 'Vier Begriffe, je vier Möglichkeiten. Welche Aussage trifft zu?',
  erklaeren: [
    'Nehmen Sie eine der Aussagen, die Sie <b>nicht</b> gewählt haben. Warum ist ' +
    'sie falsch?'
  ],
  bauen(b){
    /* ZURUECK ZUR ENTSCHEIDUNG (2026-09-26), und zwar zur
       urspruenglichen.

       Der Altbestand stellte je Begriff EINE Frage: drei Aussagen,
       dazu «Keine der Aussagen trifft zu», eine ankreuzen. Siehe
       quellen/.../Station 3/Begriffe/moodle_cloze_dropdown_questions.xml.
       Beim Umbau auf Kaertchen am 21.08.2026 ist das verlorengegangen.

       Rike, 26.09.: «Wichtig waere, dass es dann eben nicht ein: ich
       schiebe das rein in die Sachen, sondern ich entscheide. Aehnlich
       wie wir es im Urspruenglichen hier hatten.»

       UND DAMIT LOEST SICH DER MANGEL GANZ AUF, den sie am selben Tag
       gefunden hatte: «Wenn da steht, die Julia-Menge wird durch
       iterierte Funktionen der Form z²+c erzeugt, dann ist es trivial
       zu ueberlegen, zu welchem der vier Begriffe das gehoert.»

       Gemessen: 32 von 33 richtigen Aussagen nennen ihren eigenen
       Begriff, 55 von 59 falschen ebenso. Beim Ziehen fuehrt das
       Stichwort also direkt ins richtige Fach. Stehen aber alle vier
       Moeglichkeiten UNTER demselben Begriff, hilft das Stichwort
       nicht mehr - die Frage ist nur noch, ob die Aussage WAHR ist.
       Genau das soll sie sein.

       Der Wortlaut bleibt unangetastet; begriffe.js sagt, Aenderungen
       daran gehoeren besprochen. Geaendert ist nur, wie gefragt wird. */
    const alle = window.BEGRIFFE || {};

    /* Hoechstens zwei Begriffe aus derselben Gruppe - sonst zieht der
       Zufall gern Paare wie «Divergenzbereich» und «Divergente Folge»
       zusammen, und die Aufgabe wird eine Uebung im Wortklauben. */
    const nachGruppe = {};
    Object.keys(alle).forEach(n => {
      const g = alle[n].gruppe || '?';
      (nachGruppe[g] = nachGruppe[g] || []).push(n);
    });
    const namen = [];
    mischen(Object.keys(nachGruppe)).forEach(g => {
      mischen(nachGruppe[g]).slice(0, 2).forEach(n => namen.push(n));
    });
    const gewaehlt = mischen(namen).slice(0, 4);

    b.kasten('Vier Begriffe');
    b.satz('Zu jedem Begriff stehen vier Möglichkeiten. <b>Genau eine</b> ist ' +
           'richtig.');

    gewaehlt.forEach((name, k) => {
      const d = alle[name];
      const wahr = w(d.richtig);
      const falsch = mischen(d.falsch).slice(0, 2);
      const optionen = mischen([wahr].concat(falsch));
      /* «Keine der Aussagen trifft zu» steht immer zuletzt - eine
         Auffangmoeglichkeit, die man nicht sucht, sondern findet.
         Genauso im Altbestand. */
      optionen.push('Keine der Aussagen trifft zu');

      b.kasten(name);
      b.wahl({ name: 'S3A4.' + k, optionen: optionen, mischen: false,
               richtig: optionen.indexOf(wahr), p: 0.75 });
    });
  }
}

];

window.PIA.pruefung({
  station: 3,
  startseite:
    '<p>Fünf Aufgaben. Es geht darum, was aus einem Startwert wird, wenn man ' +
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
  aufgaben: AUFGABEN
});
})();
