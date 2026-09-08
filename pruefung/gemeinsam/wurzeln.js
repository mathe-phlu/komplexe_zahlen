/* ============================================================
   PIA - Die vier Kriterien der Wurzelschar

   Wer z^n = w loest, braucht drei unabhaengige Einsichten:

     I    der Betrag ist die n-te Wurzel aus |w| - EINE Zahl,
          dieselbe fuer alle Loesungen
     II   ein Wurzelwinkel ist arg(w)/n
     III  die weiteren liegen je 360/n weiter

   Frueher zaehlte die Bewertung nur getroffene Loesungen. Wer den
   Grundwinkel verrechnete, aber erkannt hatte, dass die Loesungen
   gleichmaessig auf einem Kreis liegen, bekam null. Genau das
   aendern diese vier Kriterien.

   WARUM DIESE DATEI EIGENS EXISTIERT: Sie wird von zwei Seiten
   gebraucht - von `pruefung.js` waehrend der Pruefung und von
   `nachwerten.js` nach einem Absturz. Zwei Fassungen desselben
   Vergleichs liefen mit der Zeit auseinander, und die Abweichung
   fiele niemandem auf. Deshalb steht er hier ein einziges Mal.
   (Dieselbe Regel steht im Kopf von nachwerten.js.)
   ============================================================ */
(function(){
'use strict';

const Z = window.Zahl;

/* Winkel auf [0, 360) */
function norm(g){ return ((g % 360) + 360) % 360; }

/* Zeilen, die wirklich ausgefuellt UND lesbar sind. Ein unlesbarer
   Eintrag ist nicht dasselbe wie eine leere Zeile - er faellt beim
   Lesen auf null und zaehlt hier nicht mit, genau wie leer. */
function ausgefuellt(zeilen){
  return (zeilen || []).filter(x =>
    x && x.r !== null && x.r !== undefined && isFinite(x.r) &&
         x.g !== null && x.g !== undefined && isFinite(x.g));
}

/* Alle n richtigen Wurzelwinkel aus einem von ihnen */
function sollWinkel(soll){
  const w = [];
  for (let k = 0; k < soll.n; k++) w.push(soll.sollG0 + k * 360 / soll.n);
  return w;
}

/* ------------------------------------------------------------
   Die vier Kriterien

   zeilen: [{r, g}] - was eingetragen wurde, r und g als Zahlen
                      oder null, wenn leer oder unlesbar
   soll:   {sollR, sollG0, n} - Betrag, EIN richtiger Wurzelwinkel,
                                Anzahl der Loesungen
   ------------------------------------------------------------ */
function kriterien(zeilen, soll){
  const n = soll.n, schritt = 360 / n;
  const da = ausgefuellt(zeilen);
  const winkelSoll = sollWinkel(soll);

  /* a - BETRAG. Jede ausgefuellte Zeile traegt denselben Betrag, und
     er stimmt. «Jede», nicht «eine»: Geprueft wird die Einsicht, dass
     alle Loesungen auf EINEM Kreis liegen. Wer eine Zeile daneben hat,
     hat sie nicht. */
  const betrag = da.length > 0 && da.every(x => Z.nahe(x.r, soll.sollR));

  /* b - GRUNDWINKEL. Mindestens eine Zeile traegt einen der n
     richtigen Winkel. Welchen, ist gleichgueltig - die Schar hat
     keinen ausgezeichneten Anfang. */
  const grundwinkel = da.some(x => winkelSoll.some(w => Z.winkelGleich(x.g, w)));

  /* c - VERTEILUNG. Die Folgefehlerregel: n Zeilen, deren Winkel
     gleichmaessig um 360/n auseinanderstehen - UNABHAENGIG davon, wo
     die Schar liegt. Wer den Grundwinkel verrechnet, aber weiss, dass
     die Loesungen im Kreis verteilt sind, bekommt das hier.

     Gemessen an den Luecken zwischen aufsteigend sortierten Winkeln,
     nicht an Resten: Die Luecken summieren sich von selbst auf 360,
     und zwei gleiche Winkel fallen dabei auf (eine Luecke 0, eine zu
     grosse) statt durchzurutschen.

     Schranke 2 Grad, nicht 1: Die Winkeltoleranz von TOLERANZEN.md ist
     1 Grad JE WINKEL, und eine Luecke ist eine Differenz zweier - im
     schlechtesten Fall also 2 Grad daneben, ohne dass ein einzelner
     Winkel die Toleranz verletzt haette. */
  let verteilung = false;
  if (da.length === n && n > 1){
    const g = da.map(x => norm(x.g)).sort((a, b) => a - b);
    verteilung = true;
    for (let i = 0; i < n; i++){
      const luecke = norm(g[(i + 1) % n] - g[i]);
      if (Math.abs(luecke - schritt) >= 2){ verteilung = false; break; }
    }
  }

  /* d - VOLLSTAENDIG. Alle n Loesungen richtig. Weil der Betrag ueber
     alle Zeilen stimmen muss und die Sollwinkel um 360/n auseinander
     liegen - weit mehr als die Toleranz -, genuegt: jeder Sollwinkel
     kommt vor. Eine Zuordnung braucht es dafuer nicht. */
  const vollstaendig = da.length === n && betrag &&
    winkelSoll.every(w => da.some(x => Z.winkelGleich(x.g, w)));

  return { betrag: betrag, grundwinkel: grundwinkel,
           verteilung: verteilung, vollstaendig: vollstaendig };
}

/* ------------------------------------------------------------
   Scharen zum Setzen - fuer den Pruefstand

   Der Pruefstand traegt jede Aufgabe zweimal ein: einmal richtig,
   einmal bewusst falsch. Bei gekoppelten Teilen genuegt es nicht,
   irgendetwas Falsches zu schreiben - es muss GENAU DAS EINE
   Kriterium verletzen, um das es geht. Sonst prueft der Pruefstand
   etwas anderes, als er zu pruefen glaubt.

   Deshalb steht das hier neben den Kriterien und nicht im
   Pruefstand: Wer ein Kriterium aendert, sieht seinen Falsifikator
   daneben liegen.
   ------------------------------------------------------------ */
function schar(soll){
  return sollWinkel(soll).map(g => ({ r: soll.sollR, g: norm(g) }));
}

function scharFalsch(soll, kriterium){
  const w = sollWinkel(soll), n = soll.n;
  switch (kriterium){

    /* Richtige Winkel, klar falscher Betrag. Mal drei plus eins trifft
       auch bei Betrag null noch daneben. */
    case 'betrag':
      return w.map(g => ({ r: soll.sollR * 3 + 1, g: norm(g) }));

    /* Ganze Schar um 37 Grad gedreht: kein Winkel stimmt mehr, die
       Verteilung aber schon - das ist der Sinn der Sache. 37 ist kein
       Vielfaches von 360/n fuer n bis 8 und liegt weit ausserhalb der
       Winkeltoleranz. */
    case 'grundwinkel':
      return w.map(g => ({ r: soll.sollR, g: norm(g + 37) }));

    /* Letzte Zeile aus dem Takt geschoben. Bei n = 1 gibt es keine
       Verteilung, die man verletzen koennte - das meldet der
       Pruefstand als Luecke, statt es zu verschweigen. */
    case 'verteilung':
      if (n < 2) return null;
      return w.map((g, k) => ({ r: soll.sollR,
                                g: norm(g + (k === n - 1 ? 30 : 0)) }));

    /* Nur die erste Zeile, und die richtig. Betrag und Grundwinkel
       stehen damit, vollstaendig ist es nicht. */
    case 'vollstaendig':
      if (n < 2) return null;
      return [{ r: soll.sollR, g: norm(w[0]) }];
  }
  return null;
}

window.PIA = window.PIA || {};
window.PIA.Wurzeln = { kriterien: kriterien, schar: schar,
                       scharFalsch: scharFalsch, sollWinkel: sollWinkel };
})();
