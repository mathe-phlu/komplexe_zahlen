/* ───────── Das Notizblatt ─────────

   Rikes Auftrag vom 23.08.2026, an Kaspers Rückmeldeleiste angelehnt,
   mit drei Abweichungen, die sie selbst gesetzt hat: kein Name, kein
   vorgegebenes Schreibfeld, und unten zwei Knöpfe — dieses Blatt und
   später die Kärtchenfläche.

   DREI ANLÄUFE, UND WARUM DER DRITTE STEHT
   ────────────────────────────────────────
   Zuerst kam es von unten. Rike, nachdem sie es hatte: «Es ist halt
   wirklich tendenziell sehr schmal, wenn man's Video noch sehen will.»

   Dann von der Seite, über die Einblendungsspalte — ihr Vorschlag,
   und das Argument dafür war, dass diese Spalte meistens leer ist.
   Das stimmte. Aber «frei» ist nicht «genug»: 466 Pixel sind ein
   Viertel A4, sechs Zeilen Handschrift. Ihr Urteil: «hab ich's
   Gefühl, wir haben nicht viel gewonnen».

   Jetzt liegt es über allem — Rand zu Rand, über den Kopf hinweg.
   Nicht als Kompromiss, sondern weil es die einfachste Bauart ist:
   **ein einziger Fall.** Kein Umschalten zwischen Seite und unten,
   keine Ausrichtung an der Textspalte, kein Rand, der übrig bleibt,
   und auf dem Telefon dasselbe wie am grossen Bildschirm. Rike hatte
   ausdrücklich vor zu vielen Verzweigungen gewarnt; die Antwort
   darauf ist die Form, die am wenigsten Fälle kennt.

   Dass das Video dabei verschwindet, kostet einen Klick. Eine enge
   Fläche kostet jeden Strich.

   Der grüne Kopf verschwindet mit. Ersetzt wird er dort, wo die
   Angabe hingehört: **in der Leiste des Blattes steht, wo man ist** —
   dieselbe Zeile, die auch im gespeicherten Bild oben steht.

   DER BOGEN HÖRT NICHT AUF
   ────────────────────────
   Rike: «wenn wir Scrollen erlauben, also wenn man quasi so ein
   unendliches Notizblatt hat, das wär natürlich noch besser.» Der
   Bogen ist anfangs drei Bildschirme hoch und wächst um einen
   weiteren, sobald man sich dem Ende nähert. Damit erledigt sich der
   Streit um die Fläche: Man stösst nie an ein Ende, man schiebt
   weiter.

   Gezeichnet wird trotzdem nur das, was man sieht. Die Leinwand ist
   so gross wie das Fenster und wird beim Rollen neu gezeichnet — ein
   Bogen von zehn Bildschirmen als eine Leinwand wären hundert
   Megabyte Bildspeicher für nichts.

   WIE HAND UND TASTATUR AUF EINE FLÄCHE PASSEN
   ────────────────────────────────────────────
   Der Stift zeichnet immer. Der Browser sagt, womit jemand die Fläche
   berührt (`pointerType`); bei `pen` wird gezeichnet, ohne dass
   jemand umschalten muss.

   Für Maus und Finger gibt es «von Hand ⇄ tippen». Im Tippen-Modus
   setzt ein Klick die Schreibmarke AN DIE STELLE, wo geklickt wurde.
   Zwei getrennte Felder wären der naheliegende Griff und der falsche:
   Sie zwingen zu einer Entscheidung, bevor der Gedanke da ist.

   Der Modus entscheidet auch, was ein Finger tut — im Tippen-Modus
   rollt er den Bogen, im Schreiben-Modus zeichnet er. Das ist die
   einzige Fallunterscheidung im ganzen Stück, und sie folgt genau
   dem, was der Knopf ohnehin ankündigt.

   WAS GESPEICHERT WIRD, UND WIE LANGE
   ───────────────────────────────────
   Striche als Zahlenfolgen, Texte als Ort und Wort — nicht das
   fertige Bild. Ein Blatt sind ein paar Kilobyte statt ein paar
   hundert, und was als Zahlen liegt, lässt sich neu zeichnen, statt
   zu verpixeln.

   Rike fragte, was «später zurückkommen» heisst. Die ehrliche
   Antwort steht unter «So nutze ich das Notizblatt» und hier: Der
   Browserspeicher überlebt das Schliessen des Browsers und den
   Neustart des Rechners. Er hängt aber an DIESEM Browser auf DIESEM
   Gerät, und er ist weg, wenn jemand die Browserdaten löscht oder im
   privaten Fenster arbeitet; Safari räumt ihn zusätzlich nach etwa
   einer Woche ohne Besuch weg. Darum der Rat, den sie selbst gezogen
   hat: vor Feierabend herunterladen.
*/
(function () {
  'use strict';

  /* **Eine Mechanik, zwei Flaechen.** Bis zum 23.08. gab es nur den
     Streifen am Rand der Etappenseiten. Seither kommt auf dem
     Abschluss von MA01.03 die Sortierflaeche dazu — dieselbe karierte
     Flaeche, dieselben Striche, dieselben Textkaesten, derselbe
     Speicher, dasselbe Paket, nur mit Kaertchen darauf und im
     Seitenfluss statt am Rand.

     Darum laeuft die Einrichtung je Flaeche einmal, statt einmal fuer
     die Seite. Was fuer alle gilt — das Bild, der Dateiname, der
     Paketschreiber — steht ausserhalb und wird geteilt. */
  /* **Die Masse stehen ganz oben, vor allem anderen.** Sie werden
     beim Einrichten gebraucht, und `var` zieht nur die Erklaerung nach
     oben, nicht die Zuweisung. Standen sie weiter unten bei den
     Zeichenfunktionen, war `KARTE_H` beim Legen `undefined` —
     `undefined + 10` ergibt NaN, `NaN + 'px'` ist eine ungueltige
     Angabe, und der Browser verwirft sie stillschweigend. Die
     Kaertchen lagen dann ohne Ort da, ohne dass irgendwo ein Fehler
     stand. Zweimal in einer Nacht dieselbe Falle (24.08.). */
  var KARO = 24, RAND = 18, KOPF = 34;
  var KARTE_B = 124, KARTE_H = 62;   /* alle gleich gross */

  document.querySelectorAll('.notizleiste').forEach(einrichten);

  function einrichten(leiste) {

  var MODUL = leiste.dataset.modul || 'lars';
  var ORT = leiste.dataset.ort || document.title;
  var SCHLUESSEL = 'lars-notiz-' + MODUL + '-' + location.pathname;

  var schirm = leiste.querySelector('.notizschirm');
  var rolle = leiste.querySelector('.notizrolle');
  var bogen = leiste.querySelector('.notizblatt');
  var blatt = leiste.querySelector('canvas.notizstriche');
  var textlage = leiste.querySelector('.notiztexte');
  /* Nur die Sortierflaeche hat eine Kaertchenlage. **Hier oben**,
     nicht erst bei den Kaertchen: `var` zieht die Erklaerung nach
     oben, die Zuweisung aber nicht — stand sie weiter unten, war
     die Lage beim ersten Legen noch `undefined`, und die Kaertchen
     blieben alle uebereinander in der Ecke liegen. */
  var kartenlage = leiste.querySelector('.notizkartenlage');
  /* **Die Masse gehoeren der Flaeche, nicht dem Skript.** Die
     Uebersicht ueber ein ganzes Modul setzt kleiner als die Flaeche am
     Kapitelende — Rike, 25.08.2026: «Kaertchen muessten sehr klein
     sein, damit man alles ueberblickt.» Ohne Angabe gilt das alte Mass,
     damit gespeicherte Blaetter unveraendert wieder erscheinen. */
  var kb = KARTE_B, kh = KARTE_H;
  if (kartenlage && kartenlage.dataset.kartenmass) {
    var mm = kartenlage.dataset.kartenmass.split('x');
    kb = Number(mm[0]) || KARTE_B;
    kh = Number(mm[1]) || KARTE_H;
  }
  var stand = leiste.querySelector('.notizstand');
  var stift = blatt.getContext('2d');

  var zustand = { striche: [], texte: [], hoehe: 0 };
  var modus = 'schreiben';

  /* ---- merken und wiederfinden ------------------------------------ */
  var uhr = null;

  function einsammeln() {
    zustand.texte = [].slice.call(textlage.children).map(function (t) {
      return { x: parseFloat(t.dataset.x), y: parseFloat(t.dataset.y),
               text: t.textContent };
    }).filter(function (t) { return t.text.trim(); });
    zustand.ort = ORT;
    kartenmerken();     /* auf der Sortierflaeche; sonst tut es nichts */
  }

  function ablegen() {
    einsammeln();
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand)); return true; }
    catch (_) { return false; }
  }

  function merken() {
    clearTimeout(uhr);
    uhr = setTimeout(function () {
      ablegen();
      /* **Kein «wird gemerkt …» mehr.** Rike, 24.08.: «Immer wenn ich
         eine Bewegung mache, ploppt so ein weisser Balken auf.» Das
         war es. Gemerkt wird ohnehin bei jedem Strich und jedem
         gezogenen Kärtchen — davon jedes Mal zu berichten ist Lärm,
         nicht Auskunft. Was zählt, sagt der Knopf «merken», und der
         sagt es weiterhin. */
    }, 400);
  }

  function laden() {
    try {
      var d = JSON.parse(localStorage.getItem(SCHLUESSEL) || 'null');
      if (d && d.striche) zustand = d;
    } catch (_) {}
    (zustand.texte || []).forEach(function (t) { textkasten(t.x, t.y, t.text); });
  }

  /* ---- der Bogen und sein Wachstum -------------------------------- */
  function sicht() { return rolle.getBoundingClientRect(); }

  function bogenhoehe(neu) {
    zustand.hoehe = Math.max(zustand.hoehe || 0, neu || 0);
    bogen.style.height = zustand.hoehe + 'px';
  }

  function nachwachsen(bis) {
    /* **Vor dem Ende, nicht am Ende.** Wer bis zum Rand schreibt und
       dann erst Platz bekommt, hat schon abgesetzt. Fünfhundert Pixel
       Vorlauf sind etwa eine Handbreit. */
    var h = sicht().height || 600;
    if (bis > zustand.hoehe - 500) bogenhoehe(Math.ceil((bis + 500) / h) * h);
  }

  /* ---- zeichnen ---------------------------------------------------- */
  function neuzeichnen() {
    var b = sicht();
    var dpr = window.devicePixelRatio || 1;
    blatt.width = Math.max(1, Math.round(b.width * dpr));
    blatt.height = Math.max(1, Math.round(b.height * dpr));
    var oben = rolle.scrollTop;
    stift.setTransform(dpr, 0, 0, dpr, 0, 0);
    stift.clearRect(0, 0, b.width, b.height);
    stift.translate(0, -oben);
    stift.lineCap = 'round';
    stift.lineJoin = 'round';
    stift.lineWidth = 2;
    stift.strokeStyle = '#2d2924';
    var unten = oben + b.height;
    (zustand.striche || []).forEach(function (s) {
      if (s.length < 2) return;
      /* Was ganz oberhalb oder unterhalb des Fensters liegt, wird
         übersprungen — bei einem langen Bogen ist das der Unterschied
         zwischen flüssig und zäh. */
      var hoch = s[0][1], tief = s[0][1];
      for (var k = 1; k < s.length; k++) {
        if (s[k][1] < hoch) hoch = s[k][1];
        if (s[k][1] > tief) tief = s[k][1];
      }
      if (tief < oben - 4 || hoch > unten + 4) return;
      stift.beginPath();
      stift.moveTo(s[0][0], s[0][1]);
      for (var i = 1; i < s.length; i++) stift.lineTo(s[i][0], s[i][1]);
      stift.stroke();
    });
    kaesten_richten();
  }

  function punkt(e) {
    var r = sicht();
    return [Math.round((e.clientX - r.left) * 10) / 10,
            Math.round((e.clientY - r.top + rolle.scrollTop) * 10) / 10];
  }

  var malt = null;
  rolle.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.notiztext')) return;      /* schon am Tippen */
    var zeichnen = e.pointerType === 'pen' || modus === 'schreiben';
    if (zeichnen) {
      malt = [punkt(e)];
      zustand.striche.push(malt);
      rolle.setPointerCapture(e.pointerId);
      e.preventDefault();
    } else {
      var p = punkt(e);
      textkasten(p[0], p[1], '').focus();
      e.preventDefault();
    }
  });
  rolle.addEventListener('pointermove', function (e) {
    if (!malt) return;
    var p = punkt(e), v = malt[malt.length - 1];
    malt.push(p);
    var oben = rolle.scrollTop;
    stift.beginPath();
    stift.moveTo(v[0], v[1]);
    stift.lineTo(p[0], p[1]);
    stift.stroke();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
    rolle.addEventListener(t, function () {
      if (!malt) return;
      if (malt.length < 2) zustand.striche.pop();    /* ein Punkt ist kein Strich */
      else nachwachsen(Math.max.apply(null, malt.map(function (p) { return p[1]; })));
      malt = null;
      merken();
    });
  });
  rolle.addEventListener('scroll', function () {
    if (!malt) neuzeichnen();
  });

  /* ---- Text an Ort und Stelle ------------------------------------- */
  var MINDEST = 150, LUFT = 14;

  function passend(t, x) {
    var breit = sicht().width || 600;
    var links = Math.max(0, Math.min(x, breit - MINDEST - LUFT));
    t.dataset.x = links;
    t.style.left = links + 'px';
    t.style.maxWidth = Math.max(MINDEST, breit - links - LUFT) + 'px';
  }

  function kaesten_richten() {
    [].forEach.call(textlage.children, function (t) {
      passend(t, parseFloat(t.dataset.x));
    });
  }

  function textkasten(x, y, wort) {
    var t = document.createElement('div');
    t.className = 'notiztext';
    t.contentEditable = 'true';
    t.spellcheck = false;
    t.dataset.y = y;
    t.style.top = y + 'px';
    passend(t, x);
    t.textContent = wort || '';
    t.addEventListener('input', function () {
      nachwachsen(parseFloat(t.dataset.y) + t.getBoundingClientRect().height);
      merken();
    });
    /* Ein leer gebliebener Kasten verschwindet wieder — sonst sammeln
       sich unsichtbare Klickspuren auf dem Bogen. */
    t.addEventListener('blur', function () {
      if (!t.textContent.trim()) t.remove();
      merken();
    });
    textlage.appendChild(t);
    nachwachsen(y + 60);
    return t;
  }

  /* ---- an der Kante ziehen ------------------------------------------ */
  var ziehen = leiste.querySelector('.notizziehen');
  if (ziehen) {
    var start = null;
    ziehen.addEventListener('pointerdown', function (e) {
      start = [e.clientX, schirm.getBoundingClientRect().width];
      ziehen.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    ziehen.addEventListener('pointermove', function (e) {
      if (!start) return;
      /* Nach links ziehen holt es herein — das Blatt hängt rechts. */
      breite(start[1] + (start[0] - e.clientX));
      neuzeichnen();
    });
    ['pointerup', 'pointercancel'].forEach(function (x) {
      ziehen.addEventListener(x, function () {
        if (!start) return;
        start = null;
        /* **Unten rastet es ein.** Wer wegschiebt, will es weg haben
           und nicht auf hundertvierzig Pixel genau treffen müssen.
           Nach oben bleibt jede Breite frei.

           Ein Klick auf die Kante hatte ich zusätzlich gebaut. Rike hat
           ihn wieder gestrichen (23.08.): «Ich tendiere zu nein, weil
           es einfach mehr Code ist, und je weniger Code wir haben,
           umso besser.» Ziehen genügt, und was nicht dasteht, kann
           nicht kaputtgehen. */
        if (schirm.getBoundingClientRect().width < SCHWELLE) breite(SCHMAL);
        neuzeichnen();
      });
    });
  }

  /* ---- eingeschoben und herausgezogen ------------------------------

     Es gibt kein Auf und Zu mehr. Rike am 23.08., nach der zweiten
     Probe: «Eigentlich brauchen wir das Notizsymbol gar nicht ... Für
     den Fall brauch ich dann auch den Schliessknopf nicht, weil wenn's
     mich stört, schiebe ich's wieder zurück.»

     Der Ruhezustand ist SCHMAL, nicht weg: Gerade der Stift schaut
     heraus, dazu die Kante zum Ziehen. Das genügt, um zu wissen, dass
     da etwas ist — «da muss man nicht Notizblatt hinschreiben».

     **Jede Seite beginnt schmal**, auch wenn man auf der Seite davor
     breit gezogen hatte. Das ist ihr ausdrücklicher Wunsch: «der
     Normalzustand, mit dem jede Seite geöffnet ist». Eine gemerkte
     Breite würde sonst jede neue Etappe halb zugedeckt begrüssen. */
  var SCHMAL = 52, SCHWELLE = 140;

  /* **Nur der Streifen wird geschoben.** Die Sortierflaeche liegt im
     Seitenfluss und hat ihre Breite von der Seite; sie kennt kein
     Ein- und Ausfahren.

     Das musste ich auf Rikes Hinweis hin lernen: «Ich sehe schon die
     Kaertchen, aber ich kann sie nicht bewegen. Ich kann auch nichts
     schreiben.» Kein Anzeigefehler — `breite(SCHMAL)` lief beim
     Einrichten JEDER Flaeche und setzte auch dort die Klasse
     `schmal`. Die schaltet die Beruehrung ab, damit ein
     eingeschobener Streifen nicht jeden Wisch am Rand an sich zieht —
     auf der Sortierflaeche legte sie das ganze Blatt lahm. Sichtbar
     war nichts davon: Die Kaertchen lagen richtig, sie liessen sich
     nur nicht anfassen. */
  var streifen = leiste.dataset.lage !== "block";

  function breite(px) {
    if (!streifen) return px;
    var b = Math.min(window.innerWidth * 0.94, Math.max(SCHMAL, px));
    leiste.style.setProperty('--notiz-breite', Math.round(b) + 'px');
    /* Solange es eingeschoben ist, nimmt die Fläche keine Berührung
       an. Sonst zöge ein Streifen von vierzig Pixeln am rechten Rand
       jeden Wisch an sich, mit dem jemand die Seite rollen will — und
       hinterliesse einen Strich, den niemand gewollt hat. */
    leiste.classList.toggle('schmal', b < SCHWELLE);
    return b;
  }
  breite(SCHMAL);

  /* Die Escape-Taste schiebt es weg. Wer schreibt, will die Hand nicht
     zur Kante führen müssen, nur um wieder auf die Seite zu sehen. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !e.target.closest('.notiztext')) {
      breite(SCHMAL);
      neuzeichnen();
    }
  });

  /* ---- die eine Zeile ---------------------------------------------- */
  leiste.querySelectorAll('[data-modus]').forEach(function (k) {
    k.addEventListener('click', function () {
      modus = k.dataset.modus;
      leiste.querySelectorAll('[data-modus]').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === k));
      });
      /* **Was ein Finger tut, sagt der Modus.** Im Tippen-Modus rollt
         er den Bogen, im Schreiben-Modus zeichnet er. Ohne das
         schiebt der Browser beim Zeichnen die Seite weg. */
      rolle.dataset.modus = modus;
    });
  });

  var leeren = leiste.querySelector('.notizleeren');
  if (leeren) leeren.addEventListener('click', function () {
    if (!zustand.striche.length && !textlage.children.length) return;
    if (!window.confirm('Das ganze Blatt dieser Etappe leeren?')) return;
    zustand.striche = [];
    textlage.replaceChildren();
    zustand.hoehe = 0;
    bogenhoehe((sicht().height || 600) * 3);
    neuzeichnen();
    merken();
  });

  var merkknopf = leiste.querySelector('.notizmerken');
  if (merkknopf) merkknopf.addEventListener('click', function () {
    /* Gemerkt wird ohnehin dauernd, vierhundert Millisekunden nach dem
       letzten Strich — daran ändert der Knopf nichts, und das ist
       Absicht: Ein Blatt darf nicht verloren gehen, weil jemand
       vergessen hat zu drücken. Was der Knopf leistet, ist die
       BESTÄTIGUNG. Wer etwas Wichtiges hingeschrieben hat, will es
       nicht glauben müssen, sondern sehen. */
    clearTimeout(uhr);
    var gut = ablegen();
    stand.textContent = gut
      ? 'gemerkt ✓ — bleibt auf diesem Gerät, auch nach dem Schliessen'
      : 'konnte nicht gemerkt werden — der Speicher ist voll';
    stand.dataset.art = gut ? 'gut' : 'schlecht';
    setTimeout(function () {
      stand.textContent = '';
      delete stand.dataset.art;
    }, 4000);
  });

  var hilfeknopf = leiste.querySelector('.notizhilfe');
  var erklaerung = leiste.querySelector('.notizerklaerung');
  if (hilfeknopf && erklaerung) hilfeknopf.addEventListener('click', function () {
    var auf = erklaerung.hidden;
    erklaerung.hidden = !auf;
    hilfeknopf.setAttribute('aria-expanded', String(auf));
    /* **Die Erklaerung nimmt der Flaeche Platz weg.** Die Leinwand
       muss danach neu vermessen werden, sonst wird das Gezeichnete
       gestaucht mitgestreckt — ein Kreis kam als Ellipse zurueck. */
    requestAnimationFrame(neuzeichnen);
  });

  window.addEventListener('resize', function () {
    breite(schirm.getBoundingClientRect().width);
  });

  laden();
  /* Die Höhe des Bogens stand früher im Aufklappen; seit es kein
     Aufklappen mehr gibt, steht sie hier. Drei Bildschirme zu Beginn,
     oder so hoch, wie das Blatt beim letzten Mal gewachsen war. */
  bogenhoehe(zustand.hoehe || (sicht().height || 600) * 3);
  kartenlegen();

  /* **Der Browser sagt, wann die Fläche eine Grösse hat.** Vorher
     stand hier ein `requestAnimationFrame`, und das kam zu früh: Die
     Leinwand blieb bei ihren voreingestellten 300 × 150, und alles
     Gezeichnete war unsichtbar, bis irgendwann ein Fenster die Grösse
     änderte. Am Zeitpunkt zu basteln hilft da nicht — Schriften laden
     nach, Bilder auch, und die Sortierfläche steht weit unten auf der
     Seite. Ein Beobachter meldet sich, sobald es wirklich so weit ist,
     und danach bei jeder Änderung. */
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      kaesten_richten();
      neuzeichnen();
    }).observe(rolle);
  } else {
    requestAnimationFrame(neuzeichnen);
  }

  /* ---- die Kärtchen -------------------------------------------------

     Nur auf der Sortierfläche, nicht auf den Etappen. Rike am 23.08.:
     «Wir lassen das mit den Kärtchen auf jeder Etappe. Das wäre zu
     viel Code, und ich bin froh, wenn es so stabil läuft.»

     Der Auftrag lautet «machen Sie für sich Ordnung» — **keine
     strukturierte Fläche wie bei SORT**, kein Einrasten, kein
     Richtig. Die Kärtchen liegen anfangs als Haufen oben links und
     gehen dorthin, wo jemand sie hinlegt.

     Die Ziehmechanik ist Kaspers, ohne sein `einrasten()`: Zeiger
     fangen, den Griffpunkt merken, über `left/top` setzen, loslassen.
     Er verschiebt über `transform`, damit beim Ziehen nichts neu
     umbricht — hier liegen die Kärtchen ohnehin absolut, und ihre
     Zahlen sollen dieselben sein wie die der Striche, damit das Bild
     sie ohne Umrechnung mitzeichnen kann. */

  /* Ein Zufall, der immer derselbe ist. Der Haufen soll nach Haufen
     aussehen und nicht nach Tabelle — aber er darf nicht bei jedem
     Laden woanders liegen, solange noch nichts gezogen wurde. */
  function streuung(n, weite) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return ((x - Math.floor(x)) - 0.5) * weite;
  }

  function kartenlegen() {
    if (!kartenlage) return;
    /* **Der Haufen liegt links, und rechts bleibt Platz.**
       Rike, 24.08.: «Die Studierenden sollen hier eine Mindmap
       erzeugen. Wenn ich anfange zu sortieren, habe ich im Moment nur
       die Moeglichkeit, nach unten zu scrollen — und dann sehe ich die
       alten Kaertchen nicht.»
       Genau darum liegt der Vorrat jetzt auf der linken Haelfte und
       die rechte bleibt frei. Wer sortiert, sieht beides: was noch
       liegt und was schon geordnet ist. Nach unten geht es weiterhin
       endlos, wenn jemand mehr Platz braucht. */
    var breit = sicht().width || 700;
    var hoch = sicht().height || 560;
    var zahl = kartenlage.children.length;
    var haufen = Math.max(2 * (kb + 10), breit * 0.5);
    var spalten = Math.max(2, Math.floor((haufen - 16) / (kb + 10)));
    var reihen = Math.ceil(zahl / spalten);
    /* Passt der Haufen nicht auf einen Bildschirm, ruecken die Reihen
       enger zusammen — lieber leicht ueberlappend als unsichtbar. */
    var schritt = Math.min(kh + 10, (hoch - 28) / Math.max(1, reihen));

    /* **Vorsortiert statt aufgehaeuft.** Rike, 25.08.2026, zur
       Uebersicht ueber alle Lernziele eines Moduls: «mit allen
       Kaertchen einmal vorsortiert nach Kapitel und Farbe und Platz,
       um selbst Ordnung zu schaffen, wenn man moechte».

       Ein Haufen aus 158 Kaertchen ist keine Uebersicht. Hier steht
       jedes Kapitel in einer eigenen Spalte, darin nach Farbe
       gruppiert — das ist die Ordnung, die das Skript ohnehin hat, und
       wer eine andere will, schiebt sie sich selbst zurecht. */
    var spaltevon = null;
    if (kartenlage.dataset.vorsortiert) {
      spaltevon = {};
      var kapitel = [];
      [].forEach.call(kartenlage.children, function (k) {
        var kp = k.dataset.kapitel || '';
        if (!spaltevon[kp]) { spaltevon[kp] = []; kapitel.push(kp); }
        spaltevon[kp].push(k);
      });
      kapitel.sort(function (a, b) { return Number(a) - Number(b); });
      /* **Die Spalten tragen ihre Kapitelnummer.** Ohne sie sind es
         elf Stapel ohne Namen. Die Beschriftung liegt in einer eigenen
         Schicht UNTER den Kärtchen — sie darf nicht in `kartenlage`
         stehen, sonst zöge man sie mit der Maus mit und `kartenlegen`
         hielte sie für ein Kärtchen. Sie zeigt die Ordnung, mit der die
         Fläche beginnt; wer umsortiert, hat sie als Anhaltspunkt. */
      var koepfe = kartenlage.parentNode
                     .querySelector('.notizspaltenkoepfe');
      if (!koepfe) {
        koepfe = document.createElement('div');
        koepfe.className = 'notizspaltenkoepfe';
        kartenlage.parentNode.insertBefore(koepfe, kartenlage);
      }
      koepfe.textContent = '';
      /* **Was nicht nebeneinander passt, kommt darunter.** Elf Spalten
         zu 86 Pixeln brauchen mehr als tausend; auf einem Laptop ist
         die Spalte schmaler, und die letzten Kapitel lägen ausserhalb
         des Bildes — die Fläche rollt nicht seitwärts. Also bricht die
         Reihe um, und jedes Band ist so hoch wie sein längstes
         Kapitel. */
      var proBand = Math.max(1, Math.floor((breit - 24) / (kb + 12)));
      var bandhoehe = [], obenAb = [0];
      kapitel.forEach(function (kp, i) {
        var b = Math.floor(i / proBand);
        bandhoehe[b] = Math.max(bandhoehe[b] || 0, spaltevon[kp].length);
      });
      for (var b = 1; b < bandhoehe.length; b++) {
        obenAb[b] = obenAb[b - 1] + 34 + bandhoehe[b - 1] * (kh + 6) + 18;
      }
      kapitel.forEach(function (kp, i) {
        /* **Innerhalb eines Kapitels liegen sie durcheinander.** Rike,
           25.08.2026: «Kärtchen bei "Alle Kärtchen" durcheinander
           innerhalb eines Kapitels.» Nach Farbe vorgeordnet wäre die
           Arbeit schon getan — das Ordnen ist ja die Aufgabe. Die
           Spalte sagt, aus welchem Kapitel ein Kärtchen stammt; alles
           Weitere macht, wer sortiert.

           Gemischt wird aus der Nummer der Karte, nicht aus dem
           Zufall: Beim nächsten Öffnen liegt alles wieder so, wie man
           es verlassen hat — dieselbe Überlegung wie bei der
           Streuung des Haufens. */
        spaltevon[kp].sort(function (a, b2) {
          return streuung(Number(a.dataset.nr) + 7, 1000)
               - streuung(Number(b2.dataset.nr) + 7, 1000);
        });
        var band = Math.floor(i / proBand);
        var links = 16 + (i % proBand) * (kb + 12);
        var oben = obenAb[band] + 34;
        /* **Hingelegt, nicht eingereiht.** Rike, 25.08.2026: «Und
           durcheinander gelegt. Nicht so in Reih und Glied.» Dieselbe
           Überlegung wie beim Haufen am Kapitelende: Eine saubere
           Spalte sieht aus wie eine Tabelle, die man nicht anfassen
           soll. Die Streuung kommt aus der Nummer der Karte, nicht aus
           dem Zufall — beim nächsten Öffnen liegt alles wieder so, wie
           man es verlassen hat. Sie bleibt klein genug, dass die
           Kapitelspalten trotzdem als Spalten lesbar bleiben. */
        spaltevon[kp].forEach(function (k, j) {
          k._vx = links + streuung(Number(k.dataset.nr) + 3, 16);
          k._vy = oben + j * (kh + 5) + streuung(Number(k.dataset.nr) + 61, 9);
        });
        var kopf = document.createElement('span');
        kopf.className = 'notizspaltenkopf';
        kopf.textContent = 'Kap. ' + kp;
        kopf.style.left = links + 'px';
        kopf.style.top = (obenAb[band] + 8) + 'px';
        kopf.style.width = kb + 'px';
        koepfe.appendChild(kopf);
      });
    }

    [].forEach.call(kartenlage.children, function (k, n) {
      var wo = (zustand.karten || {})[k.dataset.nr];
      var x = wo && Number(wo.x), y = wo && Number(wo.y);
      /* **Nur wirkliche Zahlen zaehlen.** Ein halb geschriebener
         Eintrag — etwa aus einem Lauf, in dem das Skript noch fehlte —
         traegt `null`, und `null + 'px'` ergibt eine ungueltige Angabe:
         Die Kaertchen lagen dann alle uebereinander in der Ecke. */
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        /* **Ein Haufen, kein Raster.** Rike, 24.08.: «Die Kaertchen
           etwas durcheinanderer.» Vorher lagen sie in Reih und Glied
           mit ein paar Pixeln Versatz — das sah aus wie eine Tabelle,
           die man nicht anfassen soll. Jetzt streuen sie weiter und
           liegen leicht schief, wie hingelegt.
           Die Streuung kommt aus der Nummer der Karte, nicht aus dem
           Zufall: Beim naechsten Oeffnen liegt alles wieder so, wie man
           es verlassen hat. */
        if (spaltevon) {
          x = k._vx; y = k._vy;
        } else {
          x = 20 + (n % spalten) * (kb + 10) + streuung(n, 26);
          y = 20 + Math.floor(n / spalten) * schritt + streuung(n + 99, 20);
        }
        /* Kein Kaertchen haengt am Rand — die Streuung darf nach
           innen ziehen, aber nicht hinaus. */
        x = Math.max(6, x);
        y = Math.max(6, y);
      }
      if (!k.style.transform) {
        k.style.transform = 'rotate(' + streuung(n + 41, 7).toFixed(1) + 'deg)';
      }
      k.style.left = Math.round(x) + 'px';
      k.style.top = Math.round(y) + 'px';
      k._x = Math.round(x);
      k._y = Math.round(y);
    });
  }

  function kartenmerken() {
    if (!kartenlage) return;
    /* **Aufschrift und Farbe kommen mit, nicht nur der Ort.** Das
       Paket zeichnet auch Blätter, auf denen man gerade nicht steht;
       stünde dort nur eine Nummer, liesse sich kein Kärtchen mehr
       malen. Dieselbe Überlegung wie bei den Textkästen. */
    zustand.karten = {};
    /* **Das Mass gehoert zum Blatt.** Sonst zeichnete das Bild die
       kleinen Kaertchen der Modul-Uebersicht in der Groesse der
       grossen — und die Aufschriften laegen uebereinander. Fehlt die
       Angabe (alte Blaetter), gilt das alte Mass. */
    zustand.kartenmass = [kb, kh];
    [].forEach.call(kartenlage.children, function (k) {
      zustand.karten[k.dataset.nr] = {
        x: Math.round(k._x), y: Math.round(k._y),
        wort: k.textContent, farbe: k.dataset.farbe || "fach"
      };
    });
  }

  if (kartenlage) {
    var obenauf = 10;
    [].forEach.call(kartenlage.children, function (k) {
      var gx = 0, gy = 0;
      k.addEventListener('pointerdown', function (e) {
        k.setPointerCapture(e.pointerId);
        k.classList.add('gefasst');
        k.style.zIndex = ++obenauf;
        gx = e.clientX - k._x;
        gy = e.clientY - k._y;
        e.preventDefault();
        e.stopPropagation();          /* nicht zugleich zeichnen */
      });
      k.addEventListener('pointermove', function (e) {
        if (!k.classList.contains('gefasst')) return;
        k._x = e.clientX - gx;
        k._y = e.clientY - gy;
        k.style.left = k._x + 'px';
        k.style.top = k._y + 'px';
      });
      ['pointerup', 'pointercancel'].forEach(function (x) {
        k.addEventListener(x, function () {
          if (!k.classList.contains('gefasst')) return;
          k.classList.remove('gefasst');
          nachwachsen(k._y + 80);
          kartenmerken();
          merken();
        });
      });
    });
  }

  /* ---- das Bild dieser Flaeche und ihr Paket ------------------- */
  function dieses() {
    einsammeln();
    var m = ausmass(zustand, Math.round(sicht().width));
    return blattbild(zustand, ORT, m[0], m[1]);
  }

  /* ═══════════ Alle Notizen herunterladen ═══════════

     Rikes Wunsch vom 23.08.: ein Knopf, der alles mitgibt. Gesammelt
     werden die Blätter DIESES MODULS aus dem Browserspeicher — auch die
     der Etappen, auf denen man gerade nicht steht. Wer am Ende eines
     Kapitels drückt, bekommt das ganze Kapitel.

     Der Paketschreiber steht darunter selbst geschrieben. Kaspers
     `paket.js` kann dasselbe, aber `fremd/` ist gesperrt, und ein
     Speicher-ZIP ohne Verdichtung sind fünfzig Zeilen — die hier zu
     haben ist billiger, als an einer fremden Datei zu hängen. */

  /* ---- das Abgabefenster --------------------------------------------

     Rike, 23.08.: «Hier muss der Studierende aber freiwillig Name
     abgeben — verpflichtend, falls als Kompensation genutzt. Wir laden
     alles am Stück runter.»

     Der Name steht nicht auf dem Blatt und nicht im Browserspeicher.
     Er wird hier einmal gefragt und landet allein in der Datei
     `abgabe.txt` im Paket. Wer nichts einträgt, bekommt sein Paket
     trotzdem; erst das Kreuz bei «Kompensation» macht ihn zur
     Bedingung. */
  var fenster = leiste.querySelector('.notizabgabe');
  var namenslabel = fenster && fenster.querySelector('.notizname');
  var namensfeld = namenslabel && namenslabel.querySelector('input');
  var mangel = fenster && fenster.querySelector('.notizmangel');
  var danach = fenster && fenster.querySelector('.notizdanach');
  var holen = fenster && fenster.querySelector('.notizholen');
  var wege = fenster ? fenster.querySelectorAll('input[name="notizweg"]') : [];
  var neuzeile = fenster && fenster.querySelector('.notizneu');
  var wiederreihe = fenster
    && fenster.querySelectorAll('.notizabgabeknoepfe')[1];
  var wieder = fenster && fenster.querySelector('.notizwieder');
  var weiter = fenster && fenster.querySelector('.notizweiter');

  function zweiterSchritt(zeigen) {
    if (neuzeile) neuzeile.hidden = !zeigen;
    if (wiederreihe) wiederreihe.hidden = !zeigen;
  }

  var alleknopf = leiste.querySelector('.notizalle');
  if (alleknopf && fenster) alleknopf.addEventListener('click', function () {
    fenster.hidden = false;
    danach.hidden = true;
    mangel.hidden = true;
    if (namenslabel) namenslabel.hidden = true;
    if (weiter) weiter.hidden = true;
    zweiterSchritt(false);
    for (var i = 0; i < wege.length; i++) wege[i].checked = false;
    if (holen) holen.focus();
  });
  var zurueck = fenster && fenster.querySelector('.notizzurueck');
  if (zurueck) zurueck.addEventListener('click', function () {
    fenster.hidden = true;
  });

  /* **Der erste Knopf fragt nichts.** Rike, 25.08.2026: «Ich fände es
     am besten, wenn man einfach runterladen kann, ohne dass man nach
     Namen oder sonst was gefragt wird.» */
  if (holen) holen.addEventListener('click', function () {
    mangel.hidden = true;
    einpacken('', false);
  });

  /* Erst danach die Frage nach der Abgabe. «Freiwillig» braucht nichts
     weiter; «Kompensation» braucht den Namen — und weil der Name auch
     im Dateinamen steht, wird dafür noch einmal gepackt. */
  for (var i = 0; i < wege.length; i++) {
    wege[i].addEventListener('change', function () {
      var komp = this.value === 'komp';
      if (namenslabel) namenslabel.hidden = !komp;
      zweiterSchritt(komp);
      if (weiter) weiter.hidden = false;
      mangel.hidden = true;
      if (komp && namensfeld) namensfeld.focus();
    });
  }

  if (wieder) wieder.addEventListener('click', function () {
    var name = (namensfeld && namensfeld.value || '').trim();
    if (!name) {
      mangel.hidden = false;
      if (namensfeld) namensfeld.focus();
      return;
    }
    mangel.hidden = true;
    einpacken(name, true);
  });

  function einpacken(name, kompensation) {
    merken();
    var vorsatz = 'lars-notiz-' + MODUL + '-';
    var blaetter = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf(vorsatz) !== 0) continue;
      var d;
      try { d = JSON.parse(localStorage.getItem(k)); } catch (_) { continue; }
      if (!d) continue;
      if (!(d.striche || []).length && !(d.texte || []).length) continue;
      blaetter.push({ pfad: k.slice(vorsatz.length), daten: d });
    }
    if (!blaetter.length) {
      mangel.textContent = 'Es ist noch nichts notiert oder sortiert.';
      mangel.hidden = false;
      return;
    }
    blaetter.sort(function (a, b) { return a.pfad.localeCompare(b.pfad, 'de'); });

    var breite = Math.round(sicht().width) || 900;
    /* Ein Blatt ist kein Blätter. */
    var wieviele = blaetter.length === 1 ? 'ein Blatt'
                                         : blaetter.length + ' Blätter';
    holen.disabled = true;
    if (wieder) wieder.disabled = true;
    stand.textContent = 'packe ' + wieviele + ' …';

    Promise.all(blaetter.map(function (b, n) {
      /* Jedes Blatt wird so gross, wie das ist, was daraufsteht —
         das eigene wie die fremden. */
      var m = ausmass(b.daten, breite);
      var c = (b.pfad === location.pathname)
        ? dieses()
        : blattbild(b.daten, b.daten.ort || b.pfad, m[0], m[1]);
      return new Promise(function (fertig) {
        c.toBlob(function (bild) {
          bild.arrayBuffer().then(function (puffer) {
            fertig({
              name: String(n + 1).padStart(2, '0') + '_'
                    + dateiname(b.daten.ort || b.pfad) + '.png',
              daten: new Uint8Array(puffer)
            });
          });
        });
      });
    })).then(function (dateien) {
      /* **Eine Datei, wie Rike es wollte** — «wir laden alles am
         Stück runter». Der Name steht im Dateinamen und in einer
         kleinen Beilage, damit auch nach dem Auspacken klar bleibt,
         von wem das Paket ist und ob es eine Kompensation sein soll. */
      dateien.push({
        name: 'abgabe.txt',
        daten: new TextEncoder().encode(
          'Modul:        ' + MODUL + '\n'
          + 'Blätter:      ' + blaetter.length + '\n'
          + 'Name:         ' + (name || '— nicht angegeben —') + '\n'
          + 'Kompensation: ' + (kompensation ? 'ja' : 'nein') + '\n'
          + 'Erstellt:     ' + new Date().toLocaleString('de-CH') + '\n')
      });
      herunterladen(paket(dateien),
                    'Notizen-' + MODUL
                    + (name ? '-' + dateiname(name) : '') + '.zip');
      holen.disabled = false;
      if (wieder) wieder.disabled = false;
      danach.hidden = false;
    });
  }

  }   /* Ende von einrichten() — ab hier gilt alles fuer jede Flaeche */

  /* ═══════════ Das Blatt als Bild ═══════════

     Gezeichnet wird beim Speichern neu, nicht die Bildschirmfläche
     abfotografiert: Die Striche liegen als Zahlen, also darf das Bild
     doppelt so fein sein wie der Bildschirm, und die Karos kommen sauber
     statt als CSS-Verlauf mit. Die Kopfzeile trägt den Ort — ohne sie
     ist ein Blatt nach einer Woche nicht mehr zuzuordnen. Keinen Namen;
     das war Rikes ausdrücklicher Entscheid. */


  /* Die Farben der Kärtchen holt das Bild aus demselben Stylesheet,
     das sie am Bildschirm färbt — sonst gäbe es zwei Wahrheiten und
     das Gespeicherte sähe anders aus als das Gesehene. */
  function ausCss(name, ersatz) {
    var w = getComputedStyle(document.documentElement)
              .getPropertyValue(name).trim();
    return w || ersatz;
  }
  function kartenfarbe(f) { return ausCss('--kk-' + f, '#f2ede4'); }
  function kartenrand(f) { return ausCss('--' + f, '#8a8378'); }

  function rundeck(s, x, y, b, h, r) {
    s.beginPath();
    s.moveTo(x + r, y);
    s.arcTo(x + b, y, x + b, y + h, r);
    s.arcTo(x + b, y + h, x, y + h, r);
    s.arcTo(x, y + h, x, y, r);
    s.arcTo(x, y, x + b, y, r);
    s.closePath();
  }

  /* Auf dem Kärtchen steht der Text in der Mitte — waagrecht und
     senkrecht. Dafür müssen die Zeilen erst bekannt sein: Man kann
     einen Block nur mittig setzen, wenn man weiss, wie hoch er wird. */
  function mittig(s, text, mx, my, breit, zeilenhoehe) {
    var zeilen = [], zeile = '';
    text.split(/\s+/).forEach(function (w) {
      var neu = zeile ? zeile + ' ' + w : w;
      if (s.measureText(neu).width > breit && zeile) {
        zeilen.push(zeile);
        zeile = w;
      } else zeile = neu;
    });
    if (zeile) zeilen.push(zeile);
    var oben = my - (zeilen.length - 1) * zeilenhoehe / 2 + 5;
    var vorher = s.textAlign;
    s.textAlign = 'center';
    zeilen.forEach(function (z, i) { s.fillText(z, mx, oben + i * zeilenhoehe); });
    s.textAlign = vorher;
  }

  /* Ein Wort, das nicht passt, wird umgebrochen — nicht abgeschnitten.
     Die längste Aufschrift hat 59 Zeichen. */
  function umbrechen(s, text, x, y, breit, zeilenhoehe) {
    var zeile = '', hoch = y;
    text.split(/\s+/).forEach(function (w) {
      var neu = zeile ? zeile + ' ' + w : w;
      if (s.measureText(neu).width > breit && zeile) {
        s.fillText(zeile, x, hoch);
        hoch += zeilenhoehe;
        zeile = w;
      } else zeile = neu;
    });
    if (zeile) s.fillText(zeile, x, hoch);
  }

  function blattbild(daten, ort, breite, hoehe) {
    var f = 2;
    var c = document.createElement('canvas');
    c.width = breite * f;
    c.height = (hoehe + KOPF) * f;
    var s = c.getContext('2d');
    s.setTransform(f, 0, 0, f, 0, 0);

    s.fillStyle = '#fffdf7';
    s.fillRect(0, 0, breite, hoehe + KOPF);

    s.fillStyle = '#6b6355';
    s.font = '13px "Iowan Old Style", Georgia, serif';
    s.fillText(ort, RAND, 22);
    s.strokeStyle = '#e3dccb';
    s.lineWidth = 1;
    s.beginPath();
    s.moveTo(0, KOPF - 0.5); s.lineTo(breite, KOPF - 0.5);
    s.stroke();

    s.save();
    s.translate(0, KOPF);
    s.strokeStyle = '#e8e0cc';
    s.lineWidth = 1;
    s.beginPath();
    for (var x = KARO; x < breite; x += KARO) { s.moveTo(x + 0.5, 0); s.lineTo(x + 0.5, hoehe); }
    for (var y = KARO; y < hoehe; y += KARO) { s.moveTo(0, y + 0.5); s.lineTo(breite, y + 0.5); }
    s.stroke();

    s.strokeStyle = '#2d2924';
    s.lineWidth = 2;
    s.lineCap = 'round';
    s.lineJoin = 'round';
    (daten.striche || []).forEach(function (st) {
      if (st.length < 2) return;
      s.beginPath();
      s.moveTo(st[0][0], st[0][1]);
      for (var i = 1; i < st.length; i++) s.lineTo(st[i][0], st[i][1]);
      s.stroke();
    });

    /* **Die Kärtchen zuerst, der Text darüber.** Wer etwas auf ein
       Kärtchen geschrieben hat, will es lesen können. */
    var mb = (daten.kartenmass || [KARTE_B, KARTE_H])[0] || KARTE_B;
    var mh = (daten.kartenmass || [KARTE_B, KARTE_H])[1] || KARTE_H;
    var schrift = Math.max(8, Math.round(mh * 0.202 * 10) / 10);
    Object.keys(daten.karten || {}).forEach(function (n) {
      var k = daten.karten[n];
      s.fillStyle = kartenfarbe(k.farbe);
      s.strokeStyle = kartenrand(k.farbe);
      s.lineWidth = 1.2;
      rundeck(s, k.x, k.y, mb, mh, Math.min(9, mh / 7));
      s.fill();
      s.stroke();
      s.fillStyle = '#2d2924';
      s.font = schrift + 'px "Patrick Hand", "Bradley Hand", cursive';
      mittig(s, k.wort || '', k.x + mb / 2, k.y + mh / 2,
             mb - 10, schrift + .5);
    });

    s.fillStyle = '#2d2924';
    s.font = '15px "Iowan Old Style", Georgia, serif';
    (daten.texte || []).forEach(function (t) {
      /* Umbruch von Hand: Die Kästen auf dem Blatt brechen im Browser
         um, das Bild muss dieselbe Breite einhalten. */
      var rest = breite - t.x - RAND;
      var zeile = '', hoch = t.y + 14;
      t.text.split(/\s+/).forEach(function (w) {
        var neu = zeile ? zeile + ' ' + w : w;
        if (s.measureText(neu).width > rest && zeile) {
          s.fillText(zeile, t.x, hoch);
          hoch += 19;
          zeile = w;
        } else zeile = neu;
      });
      if (zeile) s.fillText(zeile, t.x, hoch);
    });
    s.restore();
    return c;
  }

  /* Wie weit nach rechts und wie weit nach unten dieses Blatt
     wirklich beschrieben ist.

     **Das Bild richtet sich nach dem Inhalt, nicht nach dem Fenster.**
     Wer die Spalte schmaler zieht, hat seine Striche noch — sie liegen
     nur ausserhalb der Sicht. Wuerde das Bild bei der Fensterbreite
     abschneiden, waeren sie im Heruntergeladenen weg, und das waere
     ein echter Verlust, den niemand bemerkt. */
  function ausmass(daten, mindestbreite) {
    var rechts = mindestbreite || 0, tief = 240;
    (daten.striche || []).forEach(function (s) {
      s.forEach(function (pkt) {
        if (pkt[0] > rechts) rechts = pkt[0];
        if (pkt[1] > tief) tief = pkt[1];
      });
    });
    (daten.texte || []).forEach(function (x) {
      if (x.x + 260 > rechts) rechts = x.x + 260;
      if (x.y + 60 > tief) tief = x.y + 60;
    });
    Object.keys(daten.karten || {}).forEach(function (n) {
      var k = daten.karten[n];
      var _b = (daten.kartenmass || [KARTE_B])[0] || KARTE_B;
      if (k.x + _b > rechts) rechts = k.x + _b;
      var _h = (daten.kartenmass || [0, KARTE_H])[1] || KARTE_H;
      if (k.y + _h > tief) tief = k.y + _h;
    });
    return [Math.ceil(rechts + RAND), Math.ceil(tief + RAND)];
  }


  /* Ein Dateiname, den ein Mensch wiedererkennt und jedes
     Betriebssystem annimmt: Umlaute ausgeschrieben, alles Übrige zu
     Bindestrichen. */
  function dateiname(ort) {
    return (ort || 'notiz')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'notiz';
  }

  function herunterladen(daten, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(daten);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  /* Ein ZIP ohne Verdichtung: je Datei ein lokaler Kopf, am Ende das
     Verzeichnis und dessen Ende. Bilder sind schon verdichtet — ein
     zweiter Durchgang brächte nichts und kostete eine Bibliothek. */
  var PRUEFTAFEL = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();

  function pruefsumme(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = PRUEFTAFEL[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function paket(dateien) {
    var teile = [], verzeichnis = [], versatz = 0;
    var schrift = new TextEncoder();

    dateien.forEach(function (d) {
      var name = schrift.encode(d.name);
      var summe = pruefsumme(d.daten);

      var kopf = new DataView(new ArrayBuffer(30));
      kopf.setUint32(0, 0x04034b50, true);
      kopf.setUint16(4, 20, true);
      kopf.setUint32(14, summe, true);
      kopf.setUint32(18, d.daten.length, true);
      kopf.setUint32(22, d.daten.length, true);
      kopf.setUint16(26, name.length, true);
      teile.push(new Uint8Array(kopf.buffer), name, d.daten);

      var eintrag = new DataView(new ArrayBuffer(46));
      eintrag.setUint32(0, 0x02014b50, true);
      eintrag.setUint16(4, 20, true);
      eintrag.setUint16(6, 20, true);
      eintrag.setUint32(16, summe, true);
      eintrag.setUint32(20, d.daten.length, true);
      eintrag.setUint32(24, d.daten.length, true);
      eintrag.setUint16(28, name.length, true);
      eintrag.setUint32(42, versatz, true);
      verzeichnis.push(new Uint8Array(eintrag.buffer), name);

      versatz += 30 + name.length + d.daten.length;
    });

    var laenge = verzeichnis.reduce(function (s, t) { return s + t.length; }, 0);
    var schluss = new DataView(new ArrayBuffer(22));
    schluss.setUint32(0, 0x06054b50, true);
    schluss.setUint16(8, dateien.length, true);
    schluss.setUint16(10, dateien.length, true);
    schluss.setUint32(12, laenge, true);
    schluss.setUint32(16, versatz, true);

    return new Blob(teile.concat(verzeichnis, [new Uint8Array(schluss.buffer)]),
                    { type: 'application/zip' });
  }
})();
