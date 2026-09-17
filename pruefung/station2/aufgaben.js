/* ============================================================
   Station 2 - Komplexe Funktionen

   Fuenf Aufgaben zu je drei Punkten, zusammen 15. Zuschnitt,
   Bewertung und Begruendungen in station2/VORSCHLAG.md, Abschnitt
   «Umbau · Vorschlag vom 08.09.2026».

   Die Station prueft zwei Richtungen, jede zweimal:

     algebraisch   Funktion -> Wirkung (1)   Wirkung -> Funktion (2, 3)
     geometrisch   welche Abbildung (4)      was ist von was das Bild (5)

   Gleiches Gewicht je Aufgabe hat denselben Grund wie in Station 1:
   Die Aufgabe ist die Einheit, die man beim Wiedereintritt neu macht.

   Alle Werte werden bei jedem Durchgang neu gezogen; ueber
   `erklaeren` bekommt dieselbe Aufgabe dann auch eine andere Frage.
   ============================================================ */
(function(){
'use strict';
const Z = window.Zahl, ZE = window.Zeichnen, P = window.PIA;
const w = P.wuerfel, mischen = P.mischen, zufall = P.zufall;

const konj = z => Z.K(z.re, -z.im);
const cis  = g => Z.K(Math.cos(g*Math.PI/180), Math.sin(g*Math.PI/180));

/* ---- Angenehme Zahlen fuer die Aufgaben 1 und 2 ----

   Beide Aufgaben werden RUECKWAERTS konstruiert: erst das Drehzentrum,
   dann der Summand. Vorher wurde der Summand gezogen und das Zentrum
   daraus gerechnet - dabei kamen Zentren wie (-0.23 + 0.71i) heraus,
   und eine Aufgabe, deren Antwort niemand hinschreiben mag, prueft das
   Rechnen mit Nachkommastellen statt die Sache.

   c ganzzahlig, a auf einer Achse oder Winkelhalbierenden, dann ist
   b = c · (1 - a) von selbst wieder glatt. */
function nettesA(nurRechtwinklig){
  /* GEAENDERT (2026-09-17, Rikes Durchgang). Vorher war v ein halber
     Schritt aus [-4, 4] und a entweder v, vi oder v ± vi. Gemessen
     ueber 40 000 Ziehungen: 51 % der Streckfaktoren trugen ein Wurzel
     2, 27 % waren halbe Schritte (2,5 · √2), 17 % groesser als 4, der
     groesste 4 · √2 = 5,66. Rike: «Es waere irgendwie kuenstlich, mit
     einem Streckfaktor von 3 mal Wurzel 2 zu rechnen.»

     DIE EINSCHRAENKUNG IST ARITHMETIK, KEINE GESCHMACKSFRAGE. Betrag
     und Normalform sind nur dann GLEICHZEITIG glatt, wenn der
     Drehwinkel ein Vielfaches von 90 Grad ist: |a| glatt und
     arg(a) = 45° erzwingt a = r/√2 · (1 + i). Man kann das Wurzel 2
     also verschieben, nicht abschaffen.

     Deshalb ziehen die beiden Aufgaben verschieden, und zwar nach
     dem, was bei ihnen die ANGABE ist:

       Aufgabe 1 zeigt die Normalform und fragt nach Betrag, Winkel
       und Zentrum. Sie bekommt nur rechte Winkel - dann ist die
       Angabe glatt UND alle drei Antworten sind es auch.

       Aufgabe 2 zeigt Betrag, Winkel und Zentrum und fragt nach der
       Normalform. Ihre Angabe ist damit ohnehin glatt, also darf der
       Winkel jedes Vielfache von 45 Grad sein. Die Antwort ist dann
       krumm - aber sie darf als Polarform geschrieben werden
       («2·cis(135°)»), was der Hinweis unter der Aufgabe erlaubt.

     Kurz: Wer eine Normalform LIEST, bekommt eine lesbare; wer eine
     SCHREIBT, darf sie in Polarform schreiben.

     Der Winkel 0 kommt nicht mehr vor - er waere gar keine Drehung,
     sondern eine blosse Streckung. */
  for(;;){
    const betrag = w([1, 2, 3]);
    const winkel = nurRechtwinklig ? w([90, 180, 270])
                                   : w([45, 90, 135, 180, 225, 270, 315]);
    const a = Z.mal(Z.K(betrag, 0), cis(winkel));
    /* a = 1 waere die Identitaet und haette gar kein Drehzentrum. */
    if (Math.abs(a.re - 1) < 1e-9 && Math.abs(a.im) < 1e-9) continue;
    return a;
  }
}

function ganzesZentrum(){
  for(;;){
    /* Bis zum 17.09.2026 bis +-4. Das Zentrum geht mit dem Faktor in
       den Summanden ein (b = c · (1 - a)), und bei |a| = 3 wurde b
       dann bis zu 21 gross - eine Angabe, die niemand mehr ueberblickt.
       Mit +-3 bleibt b unter 16, und der Waechter in `drehstreckung`
       haelt ihn unter 12. */
    const c = Z.K(Math.round(zufall(-3,3)), Math.round(zufall(-3,3)));
    if (c.re || c.im) return c;
  }
}

/* Faktor, Drehzentrum und Summand in einem Zug - beide Richtungen der
   Station bauen auf derselben Ziehung auf. Aufgabe 1 zeigt a und b und
   fragt nach Streckfaktor, Winkel und Zentrum; Aufgabe 2 zeigt
   Streckfaktor, Winkel und Zentrum und fragt nach a und b. */
function drehstreckung(nurRechtwinklig){
  for(;;){
    const a = nettesA(nurRechtwinklig);
    const zentrum = ganzesZentrum();
    const bb = Z.mal(zentrum, Z.minus(Z.K(1,0), a));
    /* Ein Summand mit einer Koordinate ueber 12 macht die Angabe
       unleserlich, ohne die Aufgabe zu aendern. */
    if (Math.abs(bb.re) > 12 || Math.abs(bb.im) > 12) continue;
    return { a: a, zentrum: zentrum, bb: bb };
  }
}

/* Der Streckfaktor ist seit dem 17.09.2026 immer ganz (siehe
   `nettesA`), also braucht es keine Sonderschreibweise mehr. Vorher
   stand hier «2.5 · √2», weil die Diagonale einen irrationalen Betrag
   hatte - als «3.54» geschrieben sah das nach Rechenarbeit aus, die es
   nicht gab. */
function faktorText(a){
  return Z.zahlText(Z.betrag(a), 2);
}

/* ---- Aufgabe 3: welche Funktion spiegelt an dieser Geraden? ----

   UMBAU (2026-09-17, zweiter Anlauf, auf Rikes Durchgang hin).

   Der erste Anlauf liess aus drei Abbildungsarten ziehen - Spiegelung,
   Punktspiegelung, Verschiebung - damit die Wahl zwischen z und z-quer
   wieder etwas entscheidet. Rike hat das verworfen: «Das Beispiel, was
   ich gesehen habe, war eine Verschiebung und keine Spiegelung.
   Eigentlich wollten wir bei Aufgabe 3 auf die Spiegelungen hinaus.»

   Jetzt wird IMMER gespiegelt, und die Aufgabe ist eine andere: nicht
   mehr aufstellen, sondern erkennen, welche von sechs Funktionen zur
   gezeichneten Geraden passt. Das ist mit BAUSTEINE.md vereinbar -
   «Auswahl bleibt nur dort, wo sie sachlich richtig ist: beim
   Wiedererkennen an Bildern.»

   DER CLOU IST DIE VERDOPPELUNG, und sie kommt zweimal vor:

     an einer Parallelen im Abstand k   ->  verschoben wird um 2k
     an einer Ursprungsgeraden unter f  ->  gedreht wird um 2f

   Der Altbestand hatte beides schon als Ablenker (nachgesehen in
   `quellen/.../funktionen aufstellen/cloze_spiegelung*.xml`): Bei
   y = -3 stand neben der richtigen Antwort z-quer - 6i auch
   z-quer + 3i, und bei der Ursprungsgeraden unter 30 Grad neben
   1/2(1 + V3 i)·z-quer = cis(60°) auch 1/2(V3 + i)·z-quer = cis(30°).
   Dieselbe Falle, einmal im Abstand und einmal im Winkel.

   DREI ZEICHNUNGEN IN FESTER ZUSAMMENSETZUNG - eine Parallele zur
   x-Achse, eine zur y-Achse, eine Ursprungsgerade. Damit ist der
   Schwierigkeitsgrad ueber alle Ziehungen gleich, und Rikes zweite
   Gefahr steht ausdruecklich nebeneinander: «Muss ich um 3i
   verschieben oder um 3?» - das ist Bild 1 gegen Bild 2.

   Die Ursprungsgeraden sind nur die beiden Winkelhalbierenden. Der
   Altbestand hatte 30, 60, 120, 150 Grad und damit Faktoren wie
   1/2(1 + V3 i); hier sind es i und -i, und der Winkel ist abzulesen
   statt auszurechnen. Rike: «Wir muessen ja nicht so ganz schwierige
   Ursprungsgeraden nehmen.»

   Der Abstand k bleibt bei 1 und 2. Bei 3 laege das Spiegelbild
   ausserhalb des Rasters, und ein groesseres Raster hat keine ganzen
   Schritte mehr (siehe `achseFuer`). */

/* Die Winkel der Ursprungsgeraden. Sechs statt zwei seit dem
   17.09.2026 - siehe `spiegelbild`. */
const URSPRUNGSWINKEL = [30, 45, 60, 120, 135, 150];

/* Eine Einheitszahl vor dem z-quer, in der Schreibweise des
   Altbestands: 1 wird gar nicht geschrieben, -1 nur als Minus. */
function vorZ(a, was){
  if (Math.abs(a.im) < 1e-9) return (a.re > 0 ? '' : '−') + was;
  if (Math.abs(a.re) < 1e-9) return (a.im > 0 ? 'i · ' : '−i · ') + was;
  /* Die nicht verdoppelten Winkel: cis(45°) und cis(135°). */
  return '½√2 · (' + (a.re > 0 ? '1' : '−1') + ' + i) · ' + was;
}
/* «+ 4i», «− 2», und nichts fuer null. */
function plusText(z){
  if (Math.abs(z.re) < 1e-9 && Math.abs(z.im) < 1e-9) return '';
  const imaginaer = Math.abs(z.im) > 1e-9;
  const wert = imaginaer ? z.im : z.re;
  const zahl = Math.abs(wert);
  return (wert > 0 ? ' + ' : ' − ') +
         (zahl === 1 && imaginaer ? '' : Z.zahlText(zahl, 0)) + (imaginaer ? 'i' : '');
}
function funktionText(a, b, konjugiert){
  return 'f(z) = ' + vorZ(a, konjugiert ? 'z̄' : 'z') + plusText(b);
}

/* Die exakte Normalform zu einem Winkel vom Betrag 1 - in der
   Schreibweise des Altbestands (`cloze_spiegelung.xml`).

   Sie wird gebraucht, weil die Ursprungsgeraden seit dem 17.09.2026
   nicht mehr nur die beiden Winkelhalbierenden sind. Rike: «Man
   koennte ueberlegen, ob man ihnen der Fairness halber einfach nur
   hinschreibt a · z-quer und sie a aussuchen duerfen, und man ihnen
   aber a in Polarform UND Normalform angibt, und sie dann anhand der
   Winkel entscheiden.»

   Genau das leistet diese Tabelle: Die Auswahl zeigt jede Moeglichkeit
   in beiden Formen, also kann man am Winkel entscheiden und muss nicht
   Wurzeln im Kopf vergleichen. */
const NORMALFORM = {
    0: '1',                 30: '½(√3 + i)',      45: '½√2 · (1 + i)',
   60: '½(1 + √3 i)',       90: 'i',             120: '½(−1 + √3 i)',
  135: '½√2 · (−1 + i)',   150: '½(−√3 + i)',    180: '−1',
  210: '½(−√3 − i)',       225: '½√2 · (−1 − i)', 240: '½(−1 − √3 i)',
  270: '−i',               300: '½(1 − √3 i)',   315: '½√2 · (1 − i)',
  330: '½(√3 − i)'
};
function faktorAuswahlText(grad){
  const g = ((grad % 360) + 360) % 360;
  /* Der Radius steht mit da, auch wenn er eins ist. Rike: «Die
     Studierenden sind es nicht gewohnt, dass vor dem cis nicht der
     Radius steht.» Und das «a =» davor, damit ohne Nachdenken klar
     ist, dass hier die Zahl a gewaehlt wird und nicht die ganze
     Zeile. */
  return 'a = ' + NORMALFORM[g] + '  =  1 · cis(' + g + '°)';
}

/* Ein kleines Dreieck mit ganzzahligen Ecken. Kleiner als die der
   uebrigen Aufgaben: Es muss samt Spiegelbild neben eine Gerade
   passen, die bis zu zwei Schritte vom Ursprung weg liegt. */
function kleinesDreieck(){
  for (let k = 0; k < 300; k++){
    const P = [0,1,2].map(() => Z.K(Math.round(zufall(-3,3)), Math.round(zufall(-3,3))));
    const d = [[0,1],[0,2],[1,2]].map(q => Z.betrag(Z.minus(P[q[0]], P[q[1]])));
    if (Math.min.apply(null, d) < 1.4 || Math.max.apply(null, d) > 3.2) continue;
    const fl2 = (P[1].re-P[0].re)*(P[2].im-P[0].im) - (P[1].im-P[0].im)*(P[2].re-P[0].re);
    if (Math.abs(fl2) < 3) continue;
    return P;
  }
  return [Z.K(0,0), Z.K(2,0), Z.K(1,2)];
}

/* Eine der drei Zeichnungen: Gerade, Dreieck, Spiegelbild - und die
   sechs Kandidaten dazu. */
function spiegelbild(art){
  let faktor, summand, gerade, text, winkel = null;

  if (art === 'waagrecht'){
    const k = w([-2,-1,1,2]);
    faktor = Z.K(1,0); summand = Z.K(0, 2*k);
    gerade = [Z.K(-9,k), Z.K(9,k)];
    text = 'parallel zur x-Achse bei <b>y = ' + k + '</b>';
  } else if (art === 'senkrecht'){
    const k = w([-2,-1,1,2]);
    faktor = Z.K(-1,0); summand = Z.K(2*k, 0);
    gerade = [Z.K(k,-9), Z.K(k,9)];
    text = 'parallel zur y-Achse bei <b>x = ' + k + '</b>';
  } else {
    /* UMBAU (2026-09-17). Vorher nur die beiden Winkelhalbierenden -
       Rike: «Bei dem ist es dann halt nicht so besonders spannend.»
       Mit sechs Winkeln wird aus zwei Moeglichkeiten eine Frage.

       Moeglich wird das dadurch, dass die Auswahl jeden Faktor in
       BEIDEN Formen zeigt (siehe `faktorAuswahlText`): Bei 30 Grad ist
       der richtige Faktor ½(1 + √3 i), und das liest sich schwer -
       als cis(60°) daneben liest es sich von selbst. */
    const phi = w(URSPRUNGSWINKEL);
    faktor = cis(2*phi);
    summand = Z.K(0,0);
    const r = cis(phi);
    gerade = [Z.K(-9*r.re,-9*r.im), Z.K(9*r.re,9*r.im)];
    text = 'durch den Ursprung unter <b>' + phi + '°</b>';
    winkel = phi;
  }

  const abbilden = z => Z.plus(Z.mal(faktor, konj(z)), summand);

  /* Das Dreieck wird ganzzahlig verschoben, bis es samt Spiegelbild
     ins Raster passt und weit genug von der Geraden weg liegt. */
  let ecken = null, bilder = null;
  for (let versuch = 0; versuch < 60 && !ecken; versuch++){
    const P = kleinesDreieck();
    for (let dx = -5; dx <= 5 && !ecken; dx++){
      for (let dy = -5; dy <= 5 && !ecken; dy++){
        const Q = P.map(z => Z.K(z.re + dx, z.im + dy));
        const B = Q.map(abbilden);
        if (Q.concat(B).some(z => Math.abs(z.re) > 4 || Math.abs(z.im) > 4)) continue;
        /* Zu nah an der Geraden faellt das Bild auf das Urbild. */
        if (Q.some((z, i) => Z.betrag(Z.minus(B[i], z)) < 1.4)) continue;
        if (B.some(q => Q.some(z => Z.betrag(Z.minus(q, z)) < 0.9))) continue;
        ecken = Q; bilder = B;
      }
    }
  }
  if (!ecken){                                   // sollte nicht vorkommen
    ecken = [Z.K(1,1), Z.K(3,1), Z.K(2,3)];
    bilder = ecken.map(abbilden);
  }

  /* DIE SECHS MOEGLICHKEITEN SIND AUSGEWOGEN, NICHT «EINMAL DANEBEN».

     FEHLERBEHOBEN (2026-09-17). Vorher war jede falsche Moeglichkeit
     die richtige Antwort mit GENAU EINEM veraenderten Merkmal. Das
     liest sich vernuenftig und ist trotzdem ein Loch: Damit traegt das
     richtige Merkmal auf JEDER Achse die Mehrheit - der doppelte
     Abstand stand in 5 von 6 Zeilen, das i in 5 von 6, das Vorzeichen
     in 5 von 6, das z-quer in 5 von 6. Wer nur zaehlt, welches Merkmal
     haeufiger dasteht, bekommt alle vier richtig, ohne die Aufgabe
     angesehen zu haben.

     Rike: «Ob man irgendwie sinnvoll durch Ausschlussprinzip erkennt -
     okay, wenn 2k haeufiger dasteht, dann wird es wohl 2k sein.» Ja,
     genau so war es.

     Der Altbestand hatte das nicht: Bei y = -3 standen Betrag 3 und
     Betrag 6 je viermal, reell und imaginaer je viermal, Plus und
     Minus je viermal. Die Ausgewogenheit ging bei meinem Umbau
     verloren.

     JETZT WIRD SIE ERZWUNGEN. Vier Merkmale, jedes zweiwertig:

       F  Faktor        richtiger oder entgegengesetzter
       M  Betrag        doppelter Abstand oder einfacher
       T  Teil          reell oder imaginaer
       S  Vorzeichen    richtiges oder entgegengesetztes

     Genommen werden die acht Kombinationen mit F·M·T·S = +1 - eine
     halbe Fraktion, in der jede Achse vier zu vier steht. Davon wird
     ein Paar gestrichen, das einander in ALLEN vier Merkmalen
     entgegengesetzt ist; das laesst jede Achse bei drei zu drei. Die
     richtige Antwort ist (+,+,+,+) und wird nie gestrichen.

     Der Preis: Manche Moeglichkeit traegt jetzt zwei Fehler auf einmal
     (etwa -z-quer - k). Das ist kein Mangel, sondern die Bedingung -
     der Altbestand hat es ebenso gehalten. Und die Wahl «z statt
     z-quer» faellt weg: Sie waere ein fuenftes Merkmal, das sich in
     sechs Zeilen nicht mehr ausgleichen laesst. Sie war ohnehin die
     schwaechste, weil in dieser Aufgabe immer gespiegelt wird. */
  const gegen = z => Z.K(-z.re, -z.im);
  let falsch = null;

  if (art === 'waagrecht' || art === 'senkrecht'){
    const betrag = Math.abs(summand.re) + Math.abs(summand.im);   // = 2·|k|
    const vorzRichtig = (summand.re + summand.im) > 0 ? 1 : -1;
    const imagRichtig = Math.abs(summand.im) > 1e-9;

    const bauen = (F, M, T, S) => {
      const fak = F > 0 ? faktor : gegen(faktor);
      const gr  = M > 0 ? betrag : betrag / 2;
      const vz  = S > 0 ? vorzRichtig : -vorzRichtig;
      const imag = T > 0 ? imagRichtig : !imagRichtig;
      return funktionText(fak, imag ? Z.K(0, vz*gr) : Z.K(vz*gr, 0), true);
    };

    const halbe = [];
    [1,-1].forEach(F => [1,-1].forEach(M => [1,-1].forEach(T => [1,-1].forEach(S => {
      if (F*M*T*S === 1) halbe.push([F,M,T,S]);
    }))));
    /* Die Paare, die einander in allen vier Merkmalen entgegengesetzt
       sind. Das Paar mit (+,+,+,+) bleibt immer stehen. */
    const paare = [];
    halbe.forEach(x => {
      if (paare.some(pr => pr[0].every((v,i) => v === -x[i]))) return;
      paare.push([x, halbe.find(y => y.every((v,i) => v === -x[i]))]);
    });
    const streichbar = paare.filter(pr => !pr.some(x => x.every(v => v === 1)));
    const weg = w(streichbar);
    const genommen = halbe.filter(x => !weg.some(y => y.every((v,i) => v === x[i])));
    falsch = genommen.filter(x => !x.every(v => v === 1))
                     .map(x => bauen(x[0], x[1], x[2], x[3]));
  }

  /* Der Ursprungsblock fragt nicht nach der ganzen Zeile, sondern nur
     nach dem FAKTOR: Ueber den Zeichnungen steht f(z) = a · z-quer,
     und gewaehlt wird a. Das ist Rikes Vorschlag, und er macht den
     Block fair - der Summand ist hier ohnehin immer null, es gaebe
     also nichts zu entscheiden ausser dem Winkel.

     Sechs Moeglichkeiten:
       1  cis(2φ)   richtig
       2  cis(φ)    der Winkel nicht verdoppelt - der eigentliche Irrtum
       3-6          die Faktoren der VIER anderen Geraden aus der Liste

     Alle sechs sind damit Faktoren, die zu irgendeiner der gezogenen
     Geraden gehoeren - keiner ist ein Fuellsel, und keiner laesst sich
     an der Gestalt ausschliessen. */
  if (!falsch){
    const genommen = [ (2*winkel) % 360, ((winkel % 360) + 360) % 360 ];
    URSPRUNGSWINKEL.forEach(psi => {
      const g = (2*psi) % 360;
      if (genommen.length < 6 && genommen.indexOf(g) < 0) genommen.push(g);
    });
    const texte = genommen.map(faktorAuswahlText);
    const optionen = mischen(texte);
    return { gerade: gerade, ecken: ecken, bilder: bilder, text: text,
             schablone: 'f(z) = <b>a</b> · z̄', optionen: optionen,
             richtig: optionen.indexOf(texte[0]) };
    /* Die Schablone sagt hier: gewaehlt wird NUR a. */
  }

  const richtigText = funktionText(faktor, summand, true);
  const optionen = mischen([richtigText].concat(falsch));

  /* Auch die parallelen Bloecke bekommen eine Schablone - aus zwei
     Gruenden. Erstens sagt sie, dass hier die GANZE Zeile gewaehlt
     wird und nicht nur eine Zahl. Zweitens steht die erste
     Auswahlzeile damit in allen drei Spalten auf derselben Hoehe;
     ohne sie saesse der Ursprungsblock eine Zeile tiefer. Rike:
     «Damit es nachher einheitlich aussieht, wuerde ich gerne das so
     haben, dass bei a, b und c die erste Auswahl immer auf der
     gleichen Hoehe erscheint.» */
  return { gerade: gerade, ecken: ecken, bilder: bilder, text: text,
           schablone: 'f(z) = <b>?</b>', optionen: optionen,
           richtig: optionen.indexOf(richtigText) };
}

/* Die krummlinigen Abbildungen der Station. Sie stehen hier oben,
   weil die Aufgaben 4 und 5 dieselben brauchen.

   NEU (2026-09-17): die Kubikfunktion. Rike wollte fuer Aufgabe 5 eine
   dritte Abbildung - «Wir machen einmal eine Kreisspiegelung, einmal
   eine quadratische. Und dann machen wir noch was Drittes. Ich weiss
   zwar noch nicht was.»

   z hoch 3 ist die naheliegende: Sie bringt keinen neuen Stoff mit -
   Potenzen stehen in Station 1 und 4 - und macht aus dem blossen
   Wiedererkennen eine Unterscheidung. Neben z² gestellt ist die Frage
   nicht mehr «ist es krummlinig», sondern «wird der Winkel verdoppelt
   oder verdreifacht». Genau das prueft, ob jemand die Abbildung
   wirklich verfolgt.

   Die dritte koennte auch eine lineare Funktion sein (i·z, (1+i)·z) -
   dann bliebe Aufgabe 5 bei den drei Familien der Aufgabe 4. Das waere
   der leichtere Block; z³ ist der lehrreichere. Eine Zeile Unterschied,
   Rikes Entscheid. */
const quadrat = z => Z.mal(z, z);
const kubik   = z => Z.mal(Z.mal(z, z), z);
const hochvier = z => Z.mal(kubik(z), z);
const hochfuenf = z => Z.mal(hochvier(z), z);

/* Drehwinkel fuer die Ablenker der Bloecke a und b - gross genug, dass
   sich das gedrehte Bild deutlich abhebt, und nie 0 oder 180 Grad. */
const ABLENKWINKEL = [45, 60, 75, 90, 105, 120, 135, -45, -60, -75, -90, -105, -120, -135];
const kreisspiegelung = z => {
  const n = z.re*z.re + z.im*z.im;
  return n < 1e-6 ? Z.K(0,0) : Z.K(z.re/n, z.im/n);
};

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

/* Ein Dreieck AM EINHEITSKREIS, teils innen, teils aussen.

   FEHLERBEHOBEN (2026-08-21): Vorher lag es weiter draussen (Betrag
   1,0 bis 2,6). Die Kreisspiegelung bildet das auf 0,38 bis 1,0 ab -
   das Bild war viermal kleiner als das Urbild und schrumpfte auf einer
   Achse, die fuer das groessere ausgelegt ist, zu einem Fleck neben
   dem Nullpunkt. Am Einheitskreis bleiben Urbild und Bild vergleichbar
   gross, und die Abbildung wird ueberhaupt erst lesbar: Was innen
   liegt, geht nach aussen und umgekehrt. */
function dreieckAmKreis(hoechstePotenz){
  /* Wie weit die Figur nach aussen reichen darf, haengt daran, wie
     stark die Abbildung zieht. Bei z² sprengt eine Ecke vom Betrag
     1,55 die Achse noch nicht; bei z³ waere 1,55³ = 3,7, und das
     Urbild schrumpfte im Bild zu einem Dreieckchen.

     ZWEIMAL DANEBENGEGRIFFEN (2026-09-17), deshalb hier ausfuehrlich:

     1  Erst stand fuer z³ einfach die Schranke 1,28 statt 1,55, und
        weiter wurde verworfen. Diese Dreiecksform hat aber bei JEDEM
        Versatz eine Ecke ueber 1,32 - die Schleife lief endlos und die
        Seite blieb stehen.
     2  Dann wurde die Figur auf die Zielgroesse SKALIERT, und zwar
        immer. Damit war die groesste Ecke nicht mehr hoechstens 1,55,
        sondern stets genau 1,55. Fuer z² und die Kreisspiegelung war
        das zu gross: Die Achse wuchs mit, und die Pruefung «liegen die
        drei Bildecken weit genug auseinander» (`weit` in `bildblock`)
        scheiterte in 2000 von 2000 Ziehungen - beide Bloecke bauten
        sich gar nicht mehr auf.

     Jetzt beides getrennt. Fuer z² und die Kreisspiegelung bleibt es
     beim VERWERFEN, genau wie vor dem 17.09. - das lief und wird nicht
     angefasst. Nur der Potenzblock bekommt die kleinere Figur, und
     dort wird auf eine gezogene Groesse skaliert statt auf eine feste,
     damit die Ziehung ihre Streuung behaelt.

     `hoechstePotenz` ist die groesste Potenz, die im Block VORKOMMT -
     im Kubikblock also 4, nicht 3, denn z⁴ ist dort einer der beiden
     Ablenker. Gemessen mit genau diesen Werten: 4000 von 4000
     Ziehungen brauchbar. */
  if ((hoechstePotenz || 2) < 3){
    for (let k = 0; k < 400; k++){
      const versatz = Z.K(zufall(0.45, 0.85), zufall(0.3, 0.65));
      const ecken = [Z.K(0,0), Z.K(0.8,0.15), Z.K(0.3,0.75)].map(z => Z.plus(z, versatz));
      const betraege = ecken.map(Z.betrag);
      if (Math.max.apply(null, betraege) <= 1.55 &&
          Math.min.apply(null, betraege) >= 0.55) return ecken;
    }
    return [Z.K(0.55,0.42), Z.K(1.20,0.52), Z.K(0.72,1.02)];
  }

  for (let k = 0; k < 400; k++){
    const versatz = Z.K(zufall(0.45, 0.85), zufall(0.3, 0.65));
    const ecken = [Z.K(0,0), Z.K(0.8,0.15), Z.K(0.3,0.75)].map(z => Z.plus(z, versatz));
    const betraege = ecken.map(Z.betrag);
    const ziel = zufall(0.95, 1.15);
    const sk = ziel / Math.max.apply(null, betraege);
    const skaliert = ecken.map(z => Z.K(z.re * sk, z.im * sk));
    /* Nach unten begrenzt, damit die Figur nicht ganz im
       Einheitskreis verschwindet - dann zoege z³ alles zusammen. */
    if (Math.min.apply(null, betraege) * sk >= 0.42) return skaliert;
  }
  return [Z.K(0.52,0.38), Z.K(1.02,0.46), Z.K(0.62,0.90)];
}

const AUFGABEN = [

/* ---------------------------------------------------------- 1 */
{ nr: 1, id: 'S2-A01', punkte: 3, titel: 'Drehstreckung deuten',
  auftrag: 'Bestimmen Sie Streckfaktor, Drehwinkel und Drehzentrum dieser Drehstreckung.',
  /* HIER STAND EIN SPOILER. Unter den Feldern stand: «Das Drehzentrum
     ist der Punkt, der auf sich selbst abgebildet wird.» Das ist die
     ganze Einsicht - wer sie liest, setzt f(c) = c an, ohne zu wissen
     warum. Dieselbe Sorte Verrat wie die vier Kriterien in Station 1,
     Aufgabe 3. Der Satz steht jetzt dort, wo er hingehoert: in der
     Erklaerfrage, also NACH dem Rechnen. */
  erklaeren: [
    'Das Drehzentrum ist ein besonderer Punkt. <b>Was</b> macht die Funktion mit ' +
    'genau diesem Punkt — und warum gibt es ihn überhaupt?',
    'Streckfaktor und Drehwinkel stecken beide in der einen Zahl a. Wo genau — ' +
    'und warum passt beides in eine Zahl?',
    'Was wäre, wenn a = 1 ist? Wo läge dann das Drehzentrum?'
  ],
  bauen(b){
    /* true: nur rechte Winkel - diese Aufgabe LIEST die Normalform. */
    const zug = drehstreckung(true);
    const a = zug.a, zentrum = zug.zentrum, bb = zug.bb;

    /* Der Auftragsstreifen sagt, was zu tun ist; der Kasten traegt nur
       die Formel. Vorher stand die Anweisung zweimal da. */
    b.kasten();
    b.formel('<b>f(z) = ' + Z.normalformGeklammert(a, 2) + ' · z + ' +
             Z.normalformGeklammert(bb, 2) + '</b>');
    b.reell({ name: 'S2A1.k',  vor: 'Streckfaktor', soll: Z.betrag(a), p: 0.75 });
    b.winkel({ name: 'S2A1.phi', vor: 'Drehwinkel', soll: Z.gradAusArg(a), p: 0.75 });
    /* getrennt: Das Drehzentrum war ein Teil zu zwei Punkten, ganz oder
       gar nicht - ein Vorzeichenfehler im Imaginaerteil kostete zwei
       von fuenfzehn Punkten der Station. */
    b.komplexZweiFelder({ name: 'S2A1.c', vor: 'Drehzentrum', soll: zentrum,
                          p: 1.5, getrennt: true });
    /* Der Hinweis auf Wurzeln ist weg: Seit dem 17.09.2026 zieht diese
       Aufgabe nur rechte Winkel, also sind Streckfaktor, Drehwinkel und
       Drehzentrum allesamt ganze Zahlen. Ein Beispiel wie «3√2» stand
       nur noch da und verwirrte. */
    b.hinweis('Der Drehwinkel zählt von der positiven x-Achse aus, gegen den ' +
              'Uhrzeigersinn.');
  }
},

/* ---------------------------------------------------------- 2 */
{ nr: 2, id: 'S2-A02', punkte: 3, titel: 'Drehstreckung aufstellen',
  auftrag: 'Stellen Sie die Funktion auf, die die beschriebene Drehstreckung leistet.',
  erklaeren: [
    'Sie haben b aus dem Zentrum bestimmt. Was wäre b, wenn das Zentrum der ' +
    '<b>Nullpunkt</b> wäre — und warum?',
    'Zwei Funktionen mit demselben a, aber verschiedenem b: Was unterscheidet sie ' +
    'im Bild, und was nicht?',
    'Warum genügt a allein, um Streckfaktor und Drehwinkel festzulegen, während es ' +
    'für das Zentrum beide Zahlen braucht?'
  ],
  bauen(b){
    /* Dieselbe Ziehung wie in Aufgabe 1, nur andersherum gelesen: Dort
       sind a und b gegeben, hier sind es Streckfaktor, Winkel und
       Zentrum. So sind beide Richtungen aus denselben handlichen
       Zahlen gebaut. */
    /* Alle Vielfachen von 45 Grad - diese Aufgabe SCHREIBT die
       Normalform und darf sie als Polarform schreiben. */
    const zug = drehstreckung(false);
    const a = zug.a, c = zug.zentrum, bb = zug.bb;

    b.kasten();
    b.satz('Gesucht ist eine Drehstreckung mit <b>Streckfaktor ' + faktorText(a) +
           '</b>, <b>Drehwinkel ' + Z.zahlText(Z.gradAusArg(a), 0) + '°</b> und ' +
           '<b>Drehzentrum ' + Z.normalform(c, 0) + '</b>.');
    /* Die Funktion als Ganzes, mit Feldern mittendrin - statt zweier
       beschrifteter Felder unter einer Formel, die dasselbe meint.

       Zwei Bewertungen, beide nach Einsichten:

       a  getrennt nach Betrag und Winkel. Wer den Winkel verrechnet,
          den Streckfaktor aber richtig hat, hat die halbe Einsicht.
          Getrennt wird nach Betrag und Winkel, nicht nach Real- und
          Imaginaerteil - das sind die Groessen, nach denen die Aufgabe
          fragt.

       b  passtZu: b = c · (1 - a), also A + B·a mit A = c und B = -c.
          Verglichen wird gegen das EINGETRAGENE a. Wer a verrechnet
          und b daraus sauber weiterrechnet, hat den Zusammenhang
          verstanden; ihm beides abzuziehen waere falsch. Das ist
          dieselbe Folgefehlerregel wie das Kriterium «Verteilung» bei
          den Wurzeln in Station 1. */
    b.formelZeile(['f(z) =',
                   { name: 'S2A2.a', soll: a, p: 1.5, platzhalter: 'a',
                     getrennt: 'polar' },
                   '· z +',
                   { name: 'S2A2.b', soll: bb, p: 1.5, platzhalter: 'b',
                     passtZu: { feld: 'S2A2.a', A: c, B: Z.K(-c.re, -c.im) } }]);
    /* Der Hinweis auf die Polarform ist hier nicht Beiwerk, sondern
       der Grund, warum diese Aufgabe auch 45-Grad-Winkel ziehen darf:
       Die Normalform ist dann krumm, die Polarform nicht. */
    b.hinweis('Sie dürfen die Polarform schreiben statt der Normalform — ' +
              '<b>2·cis(135°)</b> wird genauso gelesen wie <b>-1.41 + 1.41i</b>. ' +
              'Wenn Sie ausrechnen, runden Sie nicht gröber als auf ' +
              '<b>zwei Stellen</b>.');
  }
},

/* ---------------------------------------------------------- 3 */
{ nr: 3, id: 'S2-A03', punkte: 3, titel: 'Welche Spiegelung war es',
  auftrag: 'Drei Zeichnungen, jede für sich. Das graue Dreieck wird an der roten ' +
           'Geraden gespiegelt — welche Funktion leistet das?',
  erklaeren: [
    'Bei der Geraden neben der x-Achse: Der Abstand ist das eine, der Summand das ' +
    'andere. <b>Warum das Doppelte</b> — und woran sehen Sie das im Bild?',
    'Warum brauchen Sie für Spiegelungen das komplex Konjugierte?',
    'Ist f(z) = z̄ + 2 auch eine Spiegelung? Woran entscheiden Sie das?'
  ],
  bauen(b){
    /* Feste Zusammensetzung, damit jede Ziehung gleich schwer ist -
       Begruendung oben bei `spiegelbild`. Die Reihenfolge wird
       gemischt, damit nicht immer dieselbe Sorte links steht. */
    const arten = mischen(['waagrecht', 'senkrecht', 'ursprung']);

    b.nebeneinander(arten.map((art, k) => (sp) => {
      const o = spiegelbild(art);
      const f = ZE.flaeche({ max: ZE.achseFuer(o.ecken.concat(o.bilder), 4),
                             breite: 300 });
      f.gerade(o.gerade[0], o.gerade[1], { farbe: 'var(--falsch)', dicke: 1.6 });
      f.vieleck(o.ecken,  { farbe: 'var(--matt)',   dicke: 1.4 });
      f.vieleck(o.bilder, { farbe: 'var(--akzent)', dicke: 1.8 });
      ['A','B','C'].forEach((m, j) => {
        f.punkt(o.ecken[j],  { marke: m,       farbe: 'var(--matt)',   gr: 2.2 });
        f.punkt(o.bilder[j], { marke: m + '′', farbe: 'var(--akzent)', gr: 2.2 });
      });

      sp.kasten(['a','b','c'][k] + ')');
      sp.satz('Gespiegelt wird an der Geraden ' + o.text + '.');
      sp.bild(f);
      /* Die Schablone sagt, WAS gewaehlt wird: beim Ursprungsblock nur
         die Zahl a, sonst die ganze Zeile. Sie steht in jedem Block,
         damit die erste Auswahlzeile ueberall auf derselben Hoehe
         sitzt. */
      sp.formel(o.schablone);
      /* mischen: false - die Reihenfolge ist schon in `spiegelbild`
         verlost, und der Pruefstand braucht einen festen Index. */
      sp.wahl({ name: 'S2A3.' + ['a','b','c'][k], optionen: o.optionen,
                mischen: false, richtig: o.richtig, p: 1 });
    }));
  }
},

/* ---------------------------------------------------------- 4 */
{ nr: 4, id: 'S2-A04', punkte: 3, titel: 'Welche Abbildung war es',
  auftrag: 'Drei Zeichnungen, jede für sich. Das graue Dreieck wird auf die farbige Figur abgebildet — durch welche Abbildung?',
  erklaeren: [
    'Woran haben Sie die <b>Kreisspiegelung</b> erkannt — was passiert dort mit ' +
    'dem, was innerhalb des Einheitskreises liegt?',
    'Bei der linearen Abbildung: Woran sehen Sie, <b>ob</b> gestreckt wurde — und ' +
    'woran, um wie viel?',
    'Woran unterscheidet man eine lineare Abbildung von der Quadratfunktion, ohne ' +
    'zu rechnen?'
  ],
  bauen(b){
    /* NEU (gemeinsam entschieden, 2026-09-09): Drei unabhaengige
       Entscheidungen statt einer Kaertchenzuordnung.

       Das kehrt den Entscheid vom 21.08. um, und zwar auf Rikes
       Wunsch: «Könnten wir bei Aufgabe vier das Ganze ein bisschen
       entkoppeln. Sie kriegen einfach drei Bilder. Wir wiederum
       wissen, mindestens eine ist eine Quadratfunktion, mindestens
       eine ist eine Kreisspiegelung und mindestens eine ist eine
       lineare Funktion, sodass sie wirklich alle drei einmal erkennen
       müssen.»

       Die Kaertchen waren richtig, solange eine Beschreibung uebrig
       blieb - die uebrige trug Information. Sobald aber jede Familie
       genau einmal vorkommt, ist die Zuordnung keine mehr: Wer zwei
       erkennt, bekaeme die dritte geschenkt. Getrennte Auswahlen
       stellen die drei Entscheidungen wieder her.

       WARUM DER FAKTOR IN DER OPTION STEHT und nicht als eigene Frage
       daneben: «Welchen Faktor hat die lineare Abbildung?» wuerde
       verraten, dass genau eine der drei linear ist - ein Drittel der
       Aufgabe. In der Option gefragt, verraet sie nichts, und es ist
       dieselbe Frage: Ist es nur eine Drehung, oder wird auch
       gestreckt? */
    const LINEAR = [
      { a: Z.K(0,1),   text: 'f(z) = i · z' },
      { a: Z.K(0,2),   text: 'f(z) = 2i · z' },
      { a: Z.K(1,1),   text: 'f(z) = (1 + i) · z' }
    ];
    /* DREI lineare Moeglichkeiten, und die Liste steht unter JEDEM der
       drei Bilder - dieselbe Kopplung, die man sonst vermeidet, ist
       hier der Trick. Rike: «Wenn wir drei lineare Funktionen als
       Option angeben, dann koennte man theoretisch denken, alle drei
       Bilder koennten lineare Funktionen sein.» Damit ist nicht mehr
       abzulesen, dass genau eines linear ist - die Abdeckung bleibt im
       Generator.

       Die drei sind so gewaehlt, dass man BEIDES lesen muss: i und 2i
       drehen gleich und strecken verschieden, (1 + i) dreht anders und
       streckt um Wurzel 2. Wer nur die Drehung sieht, kommt nicht
       durch. Der Fall «reine Streckung» ist draussen - er waere der
       einzige ohne Drehung und damit auf einen Blick erledigt. */
    const OPT = ['die Quadratfunktion z → z²', 'die Kreisspiegelung z → 1/z̄']
                  .concat(LINEAR.map(x => x.text));

    const gewaehlteLineare = w(LINEAR);
    const familien = mischen([
      { f: quadrat,         index: 0 },
      { f: kreisspiegelung, index: 1 },
      { f: z => Z.mal(gewaehlteLineare.a, z),
        index: 2 + LINEAR.indexOf(gewaehlteLineare) }
    ]);

    /* Nebeneinander, auf 300 gezeichnet - wie in Station 1, Aufgabe 4.
       Eine Zeichnung, die kleiner dargestellt wird als gezeichnet,
       schrumpft ihre Beschriftung mit. */
    b.nebeneinander(familien.map((fam, k) => (sp) => {
      const ecken = dreieckAmKreis();
      const rand = randpunkte(ecken, 16);
      const bild = rand.map(fam.f);
      const fl = ZE.flaeche({ max: ZE.achseFuer(rand.concat(bild), 2), breite: 300 });
      fl.kreis(1);                       // der Einheitskreis als Bezug
      fl.zug(rand, { farbe: 'var(--matt)', dicke: 1.2 });
      fl.zug(bild, { farbe: 'var(--akzent)', dicke: 1.8 });

      sp.kasten(['a','b','c'][k] + ')');
      sp.bild(fl);
      sp.wahl({ name: 'S2A4.' + ['a','b','c'][k], optionen: OPT, mischen: false,
                richtig: fam.index, p: 1 });
    }));
    b.hinweis('Der gestrichelte Kreis ist der Einheitskreis.');
  }
},

/* ---------------------------------------------------------- 5 */
{ nr: 5, id: 'S2-A05', punkte: 3, titel: 'Was ist von was das Bild',
  auftrag: 'Drei Abbildungen, je drei Zeichnungen. Klicken Sie jedes Mal die ' +
           'Zeichnung an, die stimmt — und darin die Marke, auf die A abgebildet ' +
           'wird.',
  erklaeren: [
    'Die <b>Kubikfunktion</b> haben Sie noch nie gesehen. Wie sind Sie von z² ' +
    'darauf gekommen, wo das Bild liegen muss — und woran haben Sie z³ von z⁴ ' +
    'unterschieden?',
    'Bei der <b>Kreisspiegelung</b>: Wohin geht ein Punkt, der <b>genau auf</b> ' +
    'dem Einheitskreis liegt? Und was folgt daraus für das Bild des ganzen ' +
    'Dreiecks?',
    'Bei der Quadratfunktion: Warum liegt das Bild von A nicht dort, wo man es ' +
    'zuerst vermutet — was macht die Abbildung mit dem Winkel?'
  ],
  bauen(b){
    /* UMBAU (2026-09-17, Rikes Durchgang). Zwei Aenderungen:

       1  DREI Bloecke statt zwei. Rike: «Koennen wir es nicht so
          machen, damit es quasi ein bisschen aufgeteilter oder mehr
          Chancen sind.» Je Block ein halber Punkt fuer die Zeichnung
          und ein halber fuer den Punkt - 3 × (0,5 + 0,5) = 3.

       2  ZWEI GETRENNTE ENTSCHEIDUNGEN statt einer Geste. Vorher sagte
          ein Klick beides; wer nur die Zeichnung erkannte, musste den
          Punkt raten, um es zu zeigen. Rike: «Der Student sollte auch
          merken, dass er zwei Dinge tut.»

       Und der Folgefehler, den sie dabei genannt hat - «wenn jemand
       nicht das richtige Bild findet, kann er den zweiten Punkt gar
       nicht mehr bekommen» - ist aufgeloest: Der Klick wird relativ
       zu der Zeichnung gewertet, in die geklickt wurde. Wer die
       falsche fuer die richtige haelt, dort aber sauber verfolgt,
       wohin A geht, bekommt seinen halben Punkt. Die Begruendung
       steht bei `bildpunktwahl` in `gemeinsam/pruefung.js`. */
    /* DIE ABLENKER SIND BILDER DERSELBEN ABBILDUNG.

       Rike: «Bei der Inversion am Einheitskreis und bei z² machen wir
       es so, dass die Distraktoren auch einfach ein Bild eines
       Dreiecks bezueglich der Inversion bzw. bezueglich z² sind.
       Dadurch entstehen so die typischen Parabelformen bzw.
       Kreisboegen, wie man sie auch erwarten wuerde. Nur um zu
       erkennen, dass das das richtige Bild ist, muessen sie auch
       wirklich verstanden haben, wie die Abbildung funktioniert.»

       So war es im Altbestand gebaut - nachgesehen in
       `quellen/.../Bilder erkennen/kreisspiegelung-3bilder.py`: drei
       Quadrate an zufaelligen Stellen, alle durch dieselbe Inversion
       geschickt.

       Bis hierher war der zweite Ablenker das Bild der JEWEILS ANDEREN
       Abbildung der Station. Wer weiss, dass z² parabelartige Boegen
       macht und die Inversion Kreisboegen, schliesst ihn an der blossen
       Form aus - ohne etwas ueber DIESES Dreieck gesagt zu haben.

       Jetzt sind alle drei Zeichnungen Bilder unter derselben
       Abbildung, nur von verschiedenen Vorbildern:

         richtig   das gezeigte Dreieck
         falsch A  das an der reellen Achse gespiegelte Dreieck
         falsch B  das um einen zufaelligen Winkel gedrehte Dreieck

       Die Form ist damit in allen dreien dieselbe, und die Wahl faellt
       nur ueber die Sache. Bei der Inversion ist das besonders huebsch:
       Was auf dem Einheitskreis liegt, bleibt liegen - das richtige
       Bild beruehrt das graue Dreieck also genau dort, wo es den Kreis
       schneidet. Die gedrehten tun das nicht.

       Die Ecken bleiben einander zugeordnet: Alle drei Zeichnungen
       entstehen aus DENSELBEN drei Ecken, nur anders vorbehandelt.
       Damit hat auch in den falschen Zeichnungen «das Bild von A»
       einen Sinn - daran haengt die Aufloesung des Folgefehlers.

       Gemessen (4000 Ziehungen): brauchbare Ziehungen fuer z²
       durchweg, fuer die Inversion in 16 % - bei 300 Versuchen je
       Block ist das sicher. Das aehnlichste Bildpaar liegt bei z²
       mindestens 0,76 Achsenlaengen auseinander, bei der Inversion
       mindestens 0,21.

       ZWEI DREHUNGEN GINGEN NICHT: Bei z² wird aus einer Drehung um
       phi eine um 2·phi, und zwei Winkel, die sich um 180 Grad
       unterscheiden, liefern dasselbe Bild - gemessen ein Paar mit
       Abstand 0,000. Die Spiegelung hat dieses Problem nicht. */
    /* Die Bedienung steht OBEN, nicht als Fussnote. Rike: «Wir sollten
       die Erklaerung, wie sie es auswaehlen, jeweils oben stehen
       haben, damit sie wissen, wie sie damit umgehen oder was
       angeklickt werden muss.» */
    b.satz('<b>So antworten Sie:</b> Die <b>Zeichnung anklicken</b> legt einen ' +
           'Rahmen darum — das ist Ihre erste Antwort. Eine <b>Marke darin ' +
           'anklicken</b> sagt, wohin A abgebildet wird — das ist die zweite. ' +
           'Ein zweiter Klick auf eine Marke nimmt sie zurück.');
    b.hinweis('Beides zählt einzeln: Wer die Zeichnung trifft, bekommt den halben ' +
              'Punkt auch dann, wenn die Marke nicht stimmt — und umgekehrt. Der ' +
              'gestrichelte Kreis ist der Einheitskreis.');

    const drehungA = cis(w(ABLENKWINKEL));
    const drehungB = cis(w(ABLENKWINKEL));

    bildblock(b, { name: 'S2A5.a', kurz: 'a', titel: 'a) Die Kreisspiegelung z → 1/z̄',
      f: kreisspiegelung, potenz: 2,
      falschA: z => kreisspiegelung(konj(z)),
      falschB: z => kreisspiegelung(Z.mal(drehungA, z)) });

    bildblock(b, { name: 'S2A5.b', kurz: 'b', titel: 'b) Die Quadratfunktion z → z²',
      f: quadrat, potenz: 2,
      falschA: z => quadrat(konj(z)),
      falschB: z => quadrat(Z.mal(drehungB, z)) });

    /* DER DRITTE BLOCK IST EINE TRANSFERAUFGABE, und er steht mit
       Absicht unmittelbar hinter z².

       Rike: «Sie haben z³ noch nie gesehen, sie muessten aber quasi die
       Uebertragung schaffen: dass, wenn bei z² verdoppelt wird, bei z³
       der Winkel das Dreifache gedreht und hoch 3 gerechnet wird. Das
       heisst, dass wir mit etwas viel Groesserem rechnen und weiter
       Gedrehtem, muesste schon klar sein - und dann muss man nur noch
       abschaetzen, wie weit. Und da ist dann das z⁴ als Gegenkandidat
       tatsaechlich echt gut.»

       Deshalb hier KEINE gespiegelten oder gedrehten Vorbilder,
       sondern die Nachbarpotenzen: z² sagt «weiter als das», z⁴ sagt
       «aber nicht so weit». Wer beide Grenzen setzen kann, hat die
       Uebertragung geleistet.

       ZUERST STANDEN HIER IMMER z² UND z⁴, und das war ein
       Schlupfloch. Rike: «Wichtig waere, dass nicht immer das mittlere
       Bild oder so richtig ist.» Nachgemessen ueber 6000 Ziehungen:
       Der Schwerpunkt des z³-Bildes lag in 100,0 % der Faelle auf dem
       kuerzeren Bogen ZWISCHEN denen von z² und z⁴. «Nimm die
       mittlere Drehung» war damit eine Regel, die jedes Mal traegt -
       ohne dass man den Exponenten je bestimmt haette. Dieselbe Sorte
       Fehler wie «die Antwort ist immer p1».

       Jetzt wird das Paar gezogen:

         z² und z⁴   z³ liegt dazwischen  (Rikes Klammer nach unten
                     und oben: «weiter als das, aber nicht so weit»)
         z⁴ und z⁵   z³ liegt VOR beiden

       Gemessen liegt z³ im zweiten Fall in 0,0 % der Ziehungen in der
       Mitte. Ueber beide Paare zusammen traegt die Regel also nur noch
       die Haelfte der Zeit und ist damit keine mehr. Die Zeichnungen
       sind gleich gut unterscheidbar: aehnlichstes Bildpaar im Median
       0,46 Achsenlaengen bei beiden Paaren. */
    const nachbarn = w([[quadrat, hochvier], [hochvier, hochfuenf]]);
    bildblock(b, { name: 'S2A5.c', kurz: 'c',
      titel: 'c) <b>Transferaufgabe:</b> die Kubikfunktion z → z³ — ' +
             'diese Funktion kennen Sie noch nicht',
      f: kubik, potenz: 5,
      falschA: nachbarn[0], falschB: nachbarn[1] });

  }
}

];

/* Ein Block von Aufgabe 5: dasselbe graue Dreieck in drei
   Zeichnungen, dazu drei moegliche Bilder.

   Die beiden falschen sind keine Fuellsel. Das eine ist das an der
   reellen Achse gespiegelte Bild - dorthin geraet, wer das Vorzeichen
   des Winkels verwechselt. Das andere ist das Bild der jeweils anderen
   Abbildung der Station; beide sind krummlinig, damit sich keines an
   der blossen Form ausschliessen laesst. */
function bildblock(sp, o){
  let g = null;
  for (let versuch = 0; versuch < 300 && !g; versuch++){
    const ecken = dreieckAmKreis(o.potenz);
    const rand = randpunkte(ecken, 16);
    const arten = mischen([{ f: o.f, echt: true }, { f: o.falschA }, { f: o.falschB }]);
    const bilder = arten.map(x => ecken.map(x.f));
    const zuege = arten.map(x => rand.map(x.f));
    const max = ZE.achseFuer(rand.concat.apply(rand, zuege), 1.6);
    /* Ecken, die aufeinanderliegen, sind weder anklickbar noch
       auseinanderzuhalten. Geprueft wird das je Zeichnung. */
    const weit = bilder.every(drei => drei.every((p, i) => drei.every((q, j) =>
      i === j || Math.hypot(p.re - q.re, p.im - q.im) >= max / 5)));
    if (weit) g = { ecken: ecken, rand: rand, arten: arten,
                    bilder: bilder, zuege: zuege, max: max };
  }
  if (!g) return;                                   // sollte nicht vorkommen

  let richtigesBild = -1;
  const zieleA = [];
  const bilderListe = g.arten.map((x, k) => {
    /* Der Kurzname des Blocks steckt im Ziel, damit sich die Ziele der
       drei Bloecke auf derselben Seite nicht gleichen. */
    const praefix = o.kurz + (k+1);
    const fl = ZE.flaeche({ max: g.max, breite: 280 });
    fl.kreis(1);
    fl.zug(g.rand, { farbe: 'var(--matt)', dicke: 1.1 });
    fl.zug(g.zuege[k], { farbe: 'var(--akzent)', dicke: 1.8 });
    /* Nur A ist beschriftet - ueber B und C wird hier nicht geredet. */
    fl.punkt(g.ecken[0], { marke: 'A', farbe: 'var(--tinte)', gr: 3 });

    /* FEHLERBEHOBEN (2026-09-17): Die Marken p1 p2 p3 trugen die Ecken
       in der Reihenfolge A B C - und `bilder[k]` ist `ecken.map(f)`,
       also war p1 in JEDER Zeichnung das Bild von A. Die richtige
       Antwort hiess damit immer «p1», bei jeder Ziehung und in jedem
       Durchgang. Jetzt wird die Zuordnung je Zeichnung neu verlost;
       `wohin[j]` ist der Eckenindex, der die Marke p(j+1) bekommt. */
    const wohin = mischen([0, 1, 2]);
    wohin.forEach((eck, j) => fl.punkt(g.bilder[k][eck],
      { ziel: praefix + 'p' + (j+1),
        marke: 'p' + (j+1), richtung: 'aussen', abstand: j % 2 ? 16 : 10,
        farbe: 'var(--akzent)', gr: 2.6 }));

    /* Je Zeichnung das Ziel, das dort das Bild von A ist - auch in den
       beiden falschen. Daran haengt die Aufloesung des Folgefehlers. */
    zieleA.push(praefix + 'p' + (wohin.indexOf(0) + 1));
    if (x.echt) richtigesBild = k;
    return { flaeche: fl, praefix: praefix };
  });

  sp.kasten(o.titel);
  /* Zwei Entscheidungen, beide im Bild: die Zeichnung anklicken legt
     den Rahmen darum, eine Marke darin sagt, wohin A geht. Bewertet
     wird je zur Haelfte und einzeln - die Begruendung steht bei
     `bildpunktwahl` in `gemeinsam/pruefung.js`. */
  sp.bildpunktwahl({ name: o.name, p: 1, bilder: bilderListe,
                     zieleA: zieleA, richtigesBild: richtigesBild });
}

window.PIA.pruefung({
  station: 2,
  startseite:
    '<p>Fünf Aufgaben zu je drei Punkten. Es geht immer um dieselbe Sache in zwei ' +
    'Richtungen: Was <b>macht</b> eine Funktion mit der Ebene — und wie findet man ' +
    'umgekehrt zu einer beschriebenen Wirkung die <b>Funktion</b>? Erst mit Zahlen, ' +
    'dann an Bildern.</p>' +
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
    'warum — gerade bei den Bildaufgaben ist oft entscheidend, <i>woran</i> Sie ' +
    'etwas erkannt haben. Wer eine Aufgabe richtig hat, sie aber nicht erklären ' +
    'kann, hat sie nicht bestanden. Umgekehrt hilft eine gute Erklärung, auch wenn ' +
    'das Ergebnis daneben liegt. Zu jeder Aufgabe gibt es ausserdem eine ' +
    '<b>Zusatzfrage</b>. Sie erscheint, wenn Sie auf «Weiter» drücken — also dann, ' +
    'wenn Sie mit der Aufgabe fertig sind. Beantwortet wird sie <b>mündlich</b>; ' +
    'Punkte gibt es dafür keine, zur Prüfung gehört sie trotzdem. Wer sie ' +
    'überspringt, findet sie am Schluss noch einmal aufgelistet.</p>' +
    '<p><b>Notizen sind für Sie, nicht für uns.</b> Unter jeder Aufgabe liegt ein ' +
    '<b>Nebenblatt</b> — zum Rechnen und Skizzieren, mit Maus, Finger oder Stift. ' +
    'Sie müssen dort keine ganzen Sätze schreiben. Es hilft nur, wenn Sie zeigen ' +
    'möchten, wie Sie vorgegangen sind, oder wenn es Ihnen beim Erklären dient. ' +
    'Wer lieber auf Papier rechnet, hält das Blatt vor die Kamera.</p>',
  vorspann: 'Was eine komplexe Funktion mit der Ebene macht — und wie man ' +
            'umgekehrt zu einer beschriebenen Wirkung die Funktion findet.',
  aufgaben: AUFGABEN
});
})();
