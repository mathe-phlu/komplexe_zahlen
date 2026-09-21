/* Gemeinsame Sortierflaeche fuer die Reflexionen von «Daten und Zufall».
   Herausgeloest am 2026-08-21 aus themen/kombinatorik/flaeche.py.

   Diese Datei kennt KEIN Kapitel. Sie liefert:
     - Karten: erzeugen, ziehen, einrasten, streuen
     - Geruest: Buehne, Auftragszeile, Leiste, Groessenregler, Bildsicherung
     - Rahmen: Startfeld, Mikrofonprobe, Navigation, Etappensteuerung

   Was ein Kapitel beisteuert:
     - D            die Daten, im HTML vor dieser Datei gesetzt
     - window.ETAPPEN   Array von Funktionen, eine je Etappe
     - D.start      Inhalt des Startfelds (Titel, Bild, Lage, Frage)
     - D.etappen    Beschriftung und Rolle je Etappe

   ENTSCHEIDUNG (2026-08-21): eigene .js- und .css-Datei statt einer
   Zeichenkette in Python. Der Code ist damit im Editor und im Browser
   lesbar und laesst sich an einer Haltestelle anhalten.
   Verworfene Alternative: alles in eine HTML-Datei einbetten - das ist
   der bisherige Zustand und genau der Grund, weshalb die Flaeche
   dreimal gebaut worden waere.
*/
const bild = id => `karten/${id}.svg`;
let stand = { aufnahme:null, weg:null, etappe:0, karten:{}, gruppen:[], e3gezeigt:null,
              e1gruppen:null, ablagepaare:null, e3:null,
              // sitzeigen: UEBERFLUESSIG seit 2026-08-21, der Umschalter
              // «Situationen einblenden» ist weg. Bleibt im Stand
              // stehen, damit aeltere gesicherte Staende weiter lesbar
              // sind; wird von nichts mehr gelesen.
              geprueft:false, sitzeigen:false, dupl:0,
              // Wie breit die Flaechen einer Etappe stehen, je
              // Etappentitel. Siehe _griffeSetzen().
              teilung:{},
              // Was auf den beschreibbaren Karten steht. Eigener Topf,
              // damit der Text einen Etappenwechsel ueberlebt.
              texte:{} };
let zmax = 10;

/* ───────── Karten: setzen, ziehen, Lupe ───────── */
function pos(el){
  const l = el._lupe || 1;
  el.style.transform = `translate3d(${el._x}px,${el._y}px,0)`
    + (el._rot ? ` rotate(${el._rot}deg)` : '') + (l!==1 ? ` scale(${l})` : '');
}
const LUPE = 1.5;
/* Eine Marke auf einer Karte - die kleine farbige Zahl oben links.

   Herausgeloest am 2026-08-21: Sie steckte fest in karte() und liess
   sich nur beim Erzeugen setzen. Kapitel 2 braucht sie NACHTRAEGLICH -
   dort erscheint erst nach dem Pruefen ein «?», hinter dem steht, woran
   eine kaputte Mengenkarte scheitert. Vorher waere das die Antwort vor
   der Frage gewesen.

     {text, art, titel}   art: 'sit' | 'skript' | undefined
                          titel: Inhalt der Sprechblase, HTML erlaubt */
function mkMarke(marke, el){
  const m = document.createElement('span');
  m.className = 'marke'
    + (marke.art==='skript' ? ' skript' : '')
    + (marke.art==='sit' || !marke.art ? ' sit' : '');
  m.textContent = marke.text;
  if (marke.titel){
    // NEU (2026-08-21, Rikes Rueckmeldung): Nur eine Marke, hinter der
    // etwas steht, sieht aus wie ein Knopf. In Etappe 1 tragen die
    // Situationskarten ihre Nummer OHNE Blase - dort versprach der
    // Hilfe-Zeiger («?» neben dem Pfeil) etwas, das es nicht gab.
    m.classList.add('lesbar');
    m._titel = marke.titel;
    m.addEventListener('pointerdown', e => e.stopPropagation());
    // Darueberfahren oeffnet, Weggehen schliesst - so war es vor dem
    // 21.08. und so war es besser (Rike). Ein KLICK haelt die Blase
    // fest; das ist der Weg auf dem Tablet, wo es kein Darueberfahren
    // gibt, und auf dem Schreibtisch der Weg, um sie stehen zu lassen.
    m.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch') return;
      blaseOeffnen(m, false);
    });
    m.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      if (m.dataset.fest) return;
      blasenSchliessen();
    });
    m.addEventListener('click', e => {
      e.stopPropagation();
      if (m.dataset.fest){ blasenSchliessen(); return; }
      blaseOeffnen(m, true);
    });
  }
  return m;
}

/* Eine Karte. `art` ist freiwillig:
     {schreibbar:true, platzhalter:'...'}  leere Karte mit Textfeld

   NEU (2026-08-21): Die beschreibbare Karte ist eine allgemeine
   Kartensorte, kein Sonderfall von Kapitel 2. ENTSCHEIDUNG: Sie wird in
   Kapitel 2 fuer den Weg «die Eisdiele verlassen» gebraucht, wo es
   bewusst keine vorgefertigten Mengenkarten gibt - und im
   Strategiebaukasten ohnehin wieder. Verworfene Alternative: sie in
   themen/ergebnismengen bauen und spaeter herausloesen; das waere
   derselbe Umbau ein zweites Mal. */
function karte(id, marke, art){
  art = art || {};
  const el = document.createElement('div');
  el.className = 'k' + (art.schreibbar ? ' schreibbar' : '');
  el.dataset.id = id; el._x = 0; el._y = 0; el._rot = 0;
  if (art.schreibbar){
    // Der Griff oben ist noetig, weil das Textfeld die ganze Karte
    // fuellt: Wer hineinklickt, will schreiben, nicht ziehen.
    //
    // PRUEFEN (2026-08-22): Zwei freiwillige Zutaten, beide allgemein
    // gehalten - laut dem Vermerk oben ist die beschreibbare Karte
    // keine Besonderheit von Kapitel 2.
    //   vorsatz  ein fester Anfang VOR dem Textfeld, in Kapitel 2 das
    //            «Ω =». Rikes Regel fuer die fertigen Mengenkarten
    //            lautet «jede Karte traegt ein Ω, auch die kaputten».
    //            Wo die Studierenden die Menge selbst schreiben, bietet
    //            die Karte dieselbe Form an, statt sie nur zu erwarten.
    //   grund    faerbt die Karte wie ihre gedruckten Geschwister. Der
    //            Ton kommt aus den Daten, nicht aus dem Stylesheet -
    //            EINE Quelle, sonst laufen HTML und Kartenbild
    //            auseinander wie bei «Faktorisieren 2».
    if (art.vorsatz) el.classList.add('mitvorsatz');
    if (art.grund) el.classList.add('getoent');
    el.innerHTML = '<span class="griff" title="Zum Verschieben hier anfassen">'
                 + '</span>'
                 + (art.vorsatz
                    ? `<span class="vorsatz">${art.vorsatz}</span>` : '')
                 + '<textarea spellcheck="false"></textarea>';
    if (art.grund) el.style.background = art.grund;
    const feld = el.querySelector('textarea');
    feld.placeholder = art.platzhalter || 'Hier schreiben';
    feld.value = stand.texte[id] || '';
    feld.addEventListener('pointerdown', e => e.stopPropagation());
    feld.addEventListener('click', e => e.stopPropagation());
    feld.addEventListener('input', () => { stand.texte[id] = feld.value; });
  } else {
    el.innerHTML = `<img src="${bild(id.split('#')[0])}" alt="" draggable="false">`;
  }
  el.ondragstart = () => false;
  if (marke) el.appendChild(mkMarke(marke, el));
  el.addEventListener('pointerenter', ()=>{
    // Nicht vergroessern, solange eine Blase offen ist - sie wuerde
    // mitwachsen und aus der Flaeche laufen. Und nie auf einer
    // beschreibbaren Karte: Dort springt sonst der Text beim Tippen.
    if (el._zieht || art.schreibbar || el.querySelector('.marke.offen')) return;
    el._lupe = LUPE; el._z0 = el.style.zIndex; el.style.zIndex = 99999; pos(el); });
  el.addEventListener('pointerleave', ()=>{ el._lupe = 1;
    el.style.zIndex = el._z0 || el.style.zIndex; pos(el); });
  ziehbar(el);
  return el;
}
function ziehbar(el){
  el.addEventListener('pointerdown', e=>{
    // Waehrend die Loesung offen ist, wird nicht gezogen - sonst
    // verschiebt ein Klick beim Anschauen die gerade gezeigte Loesung.
    if (document.body.classList.contains('loesungoffen')) return;
    if (e.target.classList.contains('dop')) return;
    if (e.target.closest('.marke')) return;      // die Marke ist ein Knopf
    e.preventDefault();
    const start = el.getBoundingClientRect();
    const dx = e.clientX - start.left, dy = e.clientY - start.top;
    // Wohin die Karte zurueckfaellt, wenn kein Platz mehr frei ist.
    // Muss VOR dem Ziehen gemerkt werden - waehrend des Ziehens werden
    // _x und _y auf null gesetzt.
    // Die Meldung gehoert zu der Geste, die sie ausgeloest hat. Wer die
    // naechste Karte anfasst, hat sie gelesen oder nicht - stehen bleiben
    // darf sie nicht, sonst steht sie neben einem Zug, der gelungen ist.
    hinweisWeg();
    el._heim = {x: el._x, y: el._y, rot: el._rot};
    el._lupe = 1; el._zieht = true; el.classList.add('zieht');
    // NEU (2026-09-10): Der Ziehgriff liegt als acht Punkte breiter
    // Streifen GENAU auf dem Weg zwischen Tisch und Feld - jede Karte
    // wandert darueber. Ohne diese Marke waere er eine neue tote Zone
    // und damit dieselbe Rueckmeldung («mehrfach ziehen») ein zweites
    // Mal, nur an anderer Stelle. Waehrend eine Karte in der Luft ist,
    // faengt der Griff nichts ab.
    document.body.classList.add('kartezieht');
    // Zeiger festhalten: sonst reisst die Geste ab, sobald der Zeiger
    // ueber ein anderes Element faehrt, das Ereignisse abfaengt.
    try { el.setPointerCapture(e.pointerId); } catch(_) {}
    el.style.zIndex = ++zmax; pos(el);
    const buehne = document.getElementById('buehne');
    const bb = buehne.getBoundingClientRect();
    // Waehrend des Ziehens haengt die Karte an der Buehne, damit sie ueber
    // beide Haelften wandern kann.
    const heim = el.parentElement;
    buehne.appendChild(el);
    el.style.position = 'fixed';
    const bewegen = ev => { el._x = 0; el._y = 0;
      el.style.left = (ev.clientX - dx) + 'px'; el.style.top = (ev.clientY - dy) + 'px';
      pos(el); zeigeZiel(ev.clientX, ev.clientY); };
    const los = ev => {
      window.removeEventListener('pointermove', bewegen);
      window.removeEventListener('pointerup', los);
      el._zieht = false; el.classList.remove('zieht');
      document.body.classList.remove('kartezieht');
      el.style.position = 'absolute'; el.style.left = ''; el.style.top = '';
      /* FEHLERBEHOBEN (2026-09-18, gemessen - zweite und eigentliche
         Ursache derselben Meldung «schwierig, Karten zurueckzulegen»):

         Beim Loslassen faellt die Karte von `fixed` auf `absolute`
         zurueck, und ihre _x/_y sind waehrend des Ziehens auf 0 gesetzt
         worden. Sie parkt damit fuer die Dauer der Auswertung am
         URSPRUNG DER BUEHNE - oben links, also genau ueber dem oberen
         Band der linken Haelfte.

         `ablegen()` sucht sein Ziel mit `elementFromPoint`, und das fand
         dort die gezogene Karte selbst. Eine Karte haengt waehrend des
         Ziehens an der Buehne, hat also weder ein `.blatt` noch eine
         `.haelfte` ueber sich - das Ziel war damit null und die Karte
         flog heim. Wer oben auf dem Tisch losliess, hatte also nicht
         danebengegriffen; er hatte auf die eigene Karte gegriffen.

         Waehrend der Auswertung ist die Karte deshalb fuer die
         Trefferpruefung durchsichtig. Synchron und eng gefasst: Nach
         `ablegen()` gilt wieder das Normale, auch wenn dabei neu
         gezeichnet wurde. */
      el.style.pointerEvents = 'none';
      try { ablegen(el, ev.clientX, ev.clientY, heim); }
      finally { el.style.pointerEvents = ''; }
    };
    window.addEventListener('pointermove', bewegen);
    window.addEventListener('pointerup', los);
  });
}
function unterCursor(x, y, wahl){
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(wahl) : null;
}
/* Das Feld, dessen Rechteck dem Punkt am naechsten liegt. Abstand null
   heisst: der Punkt liegt darin. Winke (.feld.neu) zaehlen nicht mit. */
function naechstesFeld(behaelter, x, y){
  let beste = null, kuerzeste = Infinity;
  behaelter.querySelectorAll('.feld:not(.neu)').forEach(d=>{
    const r = d.getBoundingClientRect();
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    const abstand = Math.hypot(dx, dy);
    if (abstand < kuerzeste){ kuerzeste = abstand; beste = d; }
  });
  return beste;
}

function zeigeZiel(x, y){
  document.querySelectorAll('.ueber').forEach(d=>d.classList.remove('ueber'));
  let z = unterCursor(x, y, '.paar,.feld:not(.neu),.feld.neu[data-ort=neuegruppe]');
  // GEAENDERT (2026-09-10): Die Markierung muss dasselbe zeigen, was
  // ablegen() dann tut - sonst verspricht sie etwas anderes, als
  // passiert. Also auch hier das nahe Feld, wenn der Zeiger im
  // sortierten Blatt zwischen den Gruppen steht.
  if (!z){
    // GEAENDERT (2026-09-18): Dieselbe Haelften-Ruecknahme wie in
    // ablegen(). Ohne sie hielte die Markierung ihr Versprechen nicht
    // mehr: Wer ueber dem oberen Band der rechten Haelfte steht, bekommt
    // beim Loslassen die naechstgelegene Gruppe - vorher gezeigt wurde
    // ihm nichts.
    let blatt = unterCursor(x, y, '.blatt');
    if (!blatt){
      const halb = unterCursor(x, y, '.haelfte');
      if (halb) blatt = halb.querySelector(':scope > .blatt');
    }
    if (blatt && blatt.id === 'feld') z = naechstesFeld(blatt, x, y);
  }
  if (z) z.classList.add('ueber');
}
function ablegen(el, x, y, heim){
  document.querySelectorAll('.ueber').forEach(d=>d.classList.remove('ueber'));
  // Eine Karte auf einem WINK («… hierher ziehen») macht ein neues Feld
  // auf - deshalb vor der ueblichen Zielsuche fragen.
  //
  // FEHLERBEHOBEN (2026-08-21): Hier stand der Name aus Kapitel 1 fest
  // verdrahtet, `[data-ort=neuegruppe]`. Kapitel 3 nennt seinen Wink
  // `neuereihe`, und dort passierte deshalb gar nichts - die Fragekarte
  // fiel durch, ohne dass eine Reihe aufging. Die gemeinsame Flaeche
  // darf keine kapitelspezifischen Namen kennen: Sie reicht den Namen
  // des Winks an den Haken weiter, und das Kapitel entscheidet.
  // «+ weiteres Paar» und «+ weiterer Platz» sind ebenfalls .feld.neu,
  // tragen aber kein data-ort - sie werden dadurch nicht getroffen.
  const wink = unterCursor(x, y, '.feld.neu[data-ort]');
  if (wink && window._e1ablage){
    const winkOrt = wink.dataset.ort;
    const ort = window._e1ablage(el, winkOrt);
    if (ort !== winkOrt){
      stand.karten[el.dataset.id] = {ort, x:4, y:4, rot:0};
      window._neuzeichnen(); merken(); return;
    }
  }
  let paar = unterCursor(x, y, '.paar');
  const feld = unterCursor(x, y, '.feld:not(.neu)');
  /* NEU (2026-09-18, Rikes Freigabe zu Maurus' und der Studierenden
     Meldung «es ist manchmal schwierig, falsche Karten wieder
     zurueckzulegen»).

     DER BEFUND, gemessen bei 1024 x 768 in Kapitel 2, Etappe 2: Von den
     388 Punkten Hoehe der linken Haelfte sind 141 TOT - 34 oben, 107
     unten. Wer dort loslaesst, sieht die Karte wortlos dorthin
     zurueckfliegen, wo sie herkam.

     DIE URSACHE ist der Bauplan, nicht ein Rechenfehler: Das
     Ueberschriftenband («Ereignisse», «Tisch — ungeordnet») ist ein
     GESCHWISTER des Blattes, kein Kind davon - und unter dem Blatt geht
     die Haelfte weiter, das Blatt aber nicht. In beiden Streifen findet
     `closest('.blatt')` nichts, und ohne Blatt gibt es kein Ziel.

     Aus Sicht der Gruppe am Tisch ist der Streifen nicht «neben dem
     Tisch» - er ist der Tisch, es steht sogar sein Name darauf.

     NEU gilt deshalb: Wer INNERHALB einer Haelfte loslaesst, meint diese
     Haelfte. Gibt es unter dem Zeiger kein Blatt, nimmt die Karte das
     Blatt dieser Haelfte.

     Das ist dieselbe Entscheidung wie am 2026-09-10 («wer im sortierten
     Blatt loslaesst, will in eine Gruppe»), eine Ebene hoeher - und sie
     greift der bestehenden Logik NICHT vor: Ist das gefundene Blatt das
     sortierte Feld, laeuft unveraendert die Regel von damals und sucht
     die naechstgelegene Gruppe. Nur wer WIRKLICH daneben laesst - in der
     Luecke zwischen den Haelften, auf der Leiste, ausserhalb der Buehne
     - kommt weiterhin heim. Dort gibt es keine Haelfte, also auch keine
     Absicht, die man lesen koennte. */
  let blatt = unterCursor(x, y, '.blatt');
  if (!blatt){
    const halb = unterCursor(x, y, '.haelfte');
    if (halb) blatt = halb.querySelector(':scope > .blatt');
  }

  // FEHLERBEHOBEN (2026-08-24): Ein Platz kann sich mit `data-nur` auf
  // ein Karten-Praefix beschraenken - Kombinatoriks Situationskopf traegt
  // `data-nur="SS"`, damit dort keine Urne oder ein Term landet, nur weil
  // die Karte zufaellig nahe genug am Kopf losgelassen wurde. Passt die
  // Karte nicht, zaehlt der Platz hier als nicht getroffen; die Suche
  // faellt auf das umgebende Feld zurueck und findet dort den passenden
  // Paarplatz. Allgemein gehalten, nicht Kombinatorik-spezifisch - jedes
  // Kapitel kann `data-nur` auf einem Platz setzen.
  if (paar && paar.dataset.nur && !el.dataset.id.startsWith(paar.dataset.nur))
    paar = null;

  // FEHLERBEHOBEN (2026-08-21): Wer eine Karte DIREKT auf einen
  // Paarplatz zog, umging die Pruefung auf freien Platz - die gab es
  // nur im nachsichtigen Zweig weiter unten. Ein Platz nahm dadurch
  // eine dritte Karte an, und weil einrasten() nur auf die ERSTE
  // liegende Karte schaute, landete sie punktgenau auf der zweiten.
  // Gemessen: g0/p0 mit drei Karten, zwei davon auf x:162, y:4.
  // Die untere war unsichtbar und galt beim Pruefen trotzdem mit.
  if (paar && !hatLuft(paar, el)){
    const ersatz = naechsterPlatz(paar.closest('.feld') || feld, x, y, fasst(paar));
    if (ersatz) paar = ersatz;
    else { heimkehr(el, heim); return; }      // lieber zurueck als verdecken
  }

  // FEHLERBEHOBEN (2026-08-28, Rikes Auftrag «der Pruefknopf muss immer
  // den aktuellen Zustand lesen»): Hier stand `blatt || heim` - und das
  // war die Ursache dafuer, dass Karten verschwanden und die Pruefung
  // hinterher falsche Zahlen nannte. Zwei Faelle:
  //
  //   Losgelassen im LEEREN Teil des sortierten Feldes: `#feld` ist ein
  //   .blatt, also wurde die Karte dort einfach abgelegt - auf keinem
  //   Platz, in keiner Gruppe. Die Pruefung sieht nur Karten auf
  //   Plaetzen; die Karte fiel damit aus der Buchfuehrung heraus
  //   («12 von 12 richtig», obwohl eine Karte irgendwo herumlag). Und
  //   merken() schrieb ihr den Ort «tisch» zu, den es hier gar nicht
  //   gibt - beim naechsten Neuzeichnen landete eine Urnenkarte auf der
  //   Situationsflaeche und wurde dort von niemandem mehr angeordnet.
  //   Gemessen am 2026-08-28: U12b, Ort «tisch», Elternteil feldS.
  //
  //   Losgelassen auf NICHTS (Leiste, Rand): ziel wurde `heim`, aber der
  //   else-Zweig unten rechnete die Position aus den LOSLASS-Koordinaten
  //   gegen `heim` - die Karte sass danach knapp tausend Pixel unter
  //   ihrem Platz und galt beim Pruefen trotzdem als dort liegend.
  //
  // Neu: Ein .blatt ist nur dann ein Ablageort, wenn es nicht das
  // sortierte Feld ist. Trifft man gar nichts, geht die Karte sauber
  // heim - mit ihrer gemerkten Position, nicht mit der des Zeigers.
  const ablage = (blatt && blatt.id !== 'feld') ? blatt : null;

  /* NEU (2026-09-10, Rueckmeldung der Studierenden: «das Einrasten ist
     manchmal etwas mühsam, man muss mehrfach ziehen»).

     Getroffen wurde bisher nur, was GENAU unter dem Zeiger lag. Zwischen
     zwei Gruppen liegen zehn Punkte Luft, unter der letzten Zeile und
     neben der letzten Spalte oft ein halbes Feld - wer dort losliess,
     bekam nach der Korrektur vom 2026-08-28 kommentarlos `heimkehr()`.
     Gemessen am 2026-09-10 in Kapitel 1, Etappe 2: Karte in der
     Zehn-Punkte-Luecke zwischen zwei Gruppen losgelassen, Karte wieder
     auf dem Tisch. Aus Sicht der Studierenden ist das «nochmal ziehen».

     Dazu kommt, dass der ZEIGER geprueft wird und nicht die Karte: Wer
     eine Karte am oberen Rand anfasst, hat ihren Koerper laengst im
     Ziel, waehrend der Zeiger noch darueber steht.

     Neu gilt: Wer im sortierten Blatt loslaesst, will in eine Gruppe -
     also faellt die Karte in die NAECHSTGELEGENE. Der Rueckweg auf den
     Tisch bleibt unberuehrt, denn dort ist `blatt` der Tisch und nicht
     `#feld`. Ausgenommen sind `.feld.neu` (die Winke «Karte hierher
     ziehen - eröffnet eine neue Gruppe» und «+ noch eine Gruppe»): Sie
     sind gross und beschriftet und sollen getroffen werden, nicht
     zufaellig gewonnen werden. Findet sich gar keine Gruppe, geht die
     Karte weiterhin heim - dann gibt es nichts, wohin sie koennte. */
  const nah = (!paar && !feld && blatt && blatt.id === 'feld')
              ? naechstesFeld(blatt, x, y) : null;

  const ziel = paar || feld || nah || ablage;
  if (!ziel){ heimkehr(el, heim); return; }
  // Hier gelandet heisst: bewusst hierher gelegt. Eine geliehene Karte
  // gehoert damit ab jetzt DIESER Etappe (siehe merken()).
  delete el.dataset.fremdlage;
  ziel.appendChild(el);
  if (paar){
    einrasten(el, paar, x, y);
  } else if (feld && feld.querySelector('.paar')){
    // NEU (2026-08-21): Wer irgendwo IM Feld loslaesst, trifft. Vorher
    // musste man den Paarplatz genau treffen - besonders in der schmalen
    // Ablage war das kaum zu schaffen. Gesucht wird der naechste Platz,
    // der noch Luft hat.
    const frei = naechsterPlatz(feld, x, y, 2);
    if (frei){ ziel.removeChild(el); frei.appendChild(el); einrasten(el, frei, x, y); }
    else { const r = feld.getBoundingClientRect();
           el._x = Math.max(4, x - r.left - 30); el._y = Math.max(26, y - r.top - 26); }
  } else if (feld){
    // NEU (2026-08-21): In einem Gruppenfeld rasten die Karten in ein
    // Raster ein, statt dort liegenzubleiben, wo der Zeiger war. Vorher
    // sah es aus, als laege die Karte nur obenauf - und wer am Rand
    // losliess, hatte sie halb ausserhalb.
    el._rot = 0;
    gruppeOrdnen(feld);
  } else {
    const r = ziel.getBoundingClientRect();
    el._x = Math.max(0, x - r.left - 30); el._y = Math.max(0, y - r.top - 26);
  }
  pos(el); merken();
  if (window.Aufnahme && Aufnahme.laeuft)
    Aufnahme.merken('karte', {id: el.dataset.id,
      ziel: (el.parentElement.dataset.ort||'tisch'), etappe: stand.etappe+1});
  // Haken fuer die Etappe: etwas hat sich bewegt. Etappe 2 haengt hier
  // die Meldung ein, welche Situation ueber mehrere Gruppen streut.
  if (window._nachAblegen) window._nachAblegen();
}
/* Ordnet die Karten eines Feldes in ein Raster und macht das Feld hoeher,
   wenn es eng wird. So sieht man auf einen Blick, was in einer Gruppe
   liegt - und nichts haengt ueber den Rand. */
function gruppeOrdnen(feldEl){
  const kb = parseFloat(getComputedStyle(document.documentElement)
              .getPropertyValue('--kb'));
  const kh = kb * 0.845;
  const innen = feldEl.clientWidth - 14;
  const spalten = Math.max(1, Math.floor(innen / (kb + 6)));
  // FEHLERBEHOBEN (2026-08-21): Die 34 waren fuer eine EINZEILIGE
  // Kopfzeile gerechnet. Kapitel 2 setzt ganze Aufgabentexte in den
  // Kopf; darunter waeren die Karten in den Text hineingerutscht.
  // Jetzt wird die tatsaechliche Hoehe gemessen.
  const kopfEl = feldEl.querySelector(':scope > .gname, :scope > .kopf');
  const oben = kopfEl ? kopfEl.offsetHeight + 8 : 8;
  const karten = [...feldEl.querySelectorAll(':scope > .k')];
  karten.forEach((k, i)=>{
    k._rot = 0;
    k._x = 7 + (i % spalten) * (kb + 6);
    k._y = oben + Math.floor(i / spalten) * (kh + 6);
    pos(k);
  });
  let noetig = oben + Math.ceil(karten.length / spalten) * (kh + 6) + 10;
  /* FEHLERBEHOBEN (2026-09-18, Rikes Befund «die Karten fallen aus der
     Kiste raus»): Die Rechnung oben trifft nicht, wo die Karten
     TATSAECHLICH liegen. Gemessen in Kapitel 2, Etappe 3 bei --kb 132:
     `oben` ergibt 37, die erste Kartenzeile beginnt aber bei 67 und
     endet bei 179 - das Feld stand auf 158. Die erste Zeile hing also
     schon 21 Punkte unten heraus, und das Feld wuchs erst, wenn eine
     ZWEITE Zeile anfing.

     Statt die Abweichung zu suchen, wird jetzt nachgemessen: Das Feld
     muss so hoch sein, dass die unterste Karte hineinpasst - was immer
     ueber ihr steht. Das Rechnen bleibt als Untergrenze, damit ein
     leeres Feld seine Hoehe behaelt. */
  if (karten.length){
    const fr = feldEl.getBoundingClientRect();
    const tiefste = Math.max(...karten.map(k => k.getBoundingClientRect().bottom));
    noetig = Math.max(noetig, tiefste - fr.top + 10);
  }
  // GEAENDERT (2026-09-10, Rueckmeldung der Studierenden zu Etappe 2 in
  // Kapitel 1): Hier stand `if (noetig > offsetHeight)` - das Feld wuchs
  // also nur und schrumpfte nie wieder. Wer Karten wieder herausnahm,
  // behielt einen leeren hohen Kasten, der die Gruppe darunter weiter
  // wegdrueckte. Neu ist die beim Bauen gesetzte Hoehe die Untergrenze;
  // gemessen wird sie beim ERSTEN Ordnen, solange sie noch die gebaute
  // ist. Die Felder werden bei jedem Neuzeichnen frisch angelegt, also
  // ist die Marke nie veraltet.
  if (!feldEl.dataset.grundhoehe)
    feldEl.dataset.grundhoehe = String(feldEl.offsetHeight);
  const unten = Math.max(parseFloat(feldEl.dataset.grundhoehe) || 0, noetig);
  feldEl.style.height = unten + 'px';
}

/* Wie viele Karten fasst ein Platz? Zwei - ausser der Platz sagt selbst
   etwas anderes. Der Situationskopf eines Gruppenfeldes traegt
   data-fasst="1": dort gehoert genau eine Situationskarte hin, und zwei
   uebereinander waeren derselbe Fehler wie ein dritter Term im Paar. */
function fasst(platz){ return parseInt(platz.dataset.fasst || '2', 10); }

function hatLuft(platz, ausser){
  const drin = [...platz.querySelectorAll(':scope > .k')].filter(k=>k!==ausser);
  return drin.length < fasst(platz);
}

/* Zurueck an den Ort, an dem die Karte vor dem Ziehen lag. Wird gebraucht,
   wenn nirgends mehr Platz ist - dann soll die Karte liegenbleiben statt
   eine andere zu verdecken. */
function heimkehr(el, heim){
  heim.appendChild(el);
  const h = el._heim || {x:0, y:0, rot:0};
  el._x = h.x; el._y = h.y; el._rot = h.rot;
  pos(el); merken();
}

/* Faecher untereinander neu stapeln.

   FEHLERBEHOBEN (2026-08-21): gruppeOrdnen() macht ein Feld hoeher, wenn
   es eng wird - aber die Felder DARUNTER stehen auf vorgerechneten
   Positionen und rueckten nicht nach. Die Karten liefen unten aus dem
   Feld heraus und ueber das naechste. Gefunden in Kapitel 4, betrifft
   jedes Kapitel, das Faecher untereinander legt.

   Erst ordnen, dann stapeln - in dieser Reihenfolge, sonst wird mit
   Hoehen gerechnet, die gleich veralten. */
function faecherSetzen(behaelter, y0, luecke){
  let y = (y0 === undefined ? 26 : y0);
  const abstand = (luecke === undefined ? 10 : luecke);
  behaelter.querySelectorAll(':scope > .feld').forEach(d=>{
    gruppeOrdnen(d);
    d.style.top = y + 'px';
    y += d.offsetHeight + abstand;
  });
  behaelter.style.minHeight = (y + 20) + 'px';
  return y;
}

/* Ein GITTER von Gruppen neu setzen - das Gegenstueck zu
   faecherSetzen() fuer Kapitel, die ihre Gruppen NEBENEINANDER legen
   und dabei in mehrere Zeilen umbrechen.

   NEU (2026-09-10, Rueckmeldung der Studierenden): Der Fehler, der bei
   faecherSetzen() oben beschrieben steht, war nur fuer Faecher
   UNTEREINANDER behoben. Kapitel 1, Etappe 2 legt seine Gruppen in ein
   Gitter - dort wuchs eine Gruppe mit der vierten Karte um rund 80
   Punkte und schob sich ueber die Zeile darunter. Gemessen am
   2026-09-10: vier Karten in g0, Gruppe 198 -> 282 Punkte hoch, die
   naechste Zeile stand unveraendert bei 234. 74 Punkte Ueberlappung.
   Genau das haben die Studierenden gemeldet: «die Gruppen haben sich
   überschnitten».

   Die Zeilen werden nicht gezaehlt, sondern an der linken Kante
   ABGELESEN: Ein Feld beginnt eine neue Zeile, sobald sein `left` nicht
   weiter rechts liegt als das des Vorgaengers. Damit muss diese
   Funktion nichts ueber die Spaltenzahl des Kapitels wissen - und wenn
   ein Kapitel seine Spalten anders rechnet (oder der Ziehgriff die
   Flaeche schmaler macht), stimmt sie weiter.

   Erst ordnen, dann stapeln - wie bei faecherSetzen, sonst wird mit
   Hoehen gerechnet, die gleich veralten. */
function gitterSetzen(behaelter, y0, luecke){
  const oben = (y0 === undefined ? 26 : y0);
  const abstand = (luecke === undefined ? 10 : luecke);
  const felder = [...behaelter.querySelectorAll(':scope > .feld')];
  if (!felder.length) return oben;
  felder.forEach(d => { if (!d.classList.contains('neu')) gruppeOrdnen(d); });
  let y = oben, zeilenhoehe = 0, letztesLinks = -Infinity;
  felder.forEach(d => {
    const links = parseFloat(d.style.left) || 0;
    if (links <= letztesLinks){ y += zeilenhoehe + abstand; zeilenhoehe = 0; }
    d.style.top = y + 'px';
    zeilenhoehe = Math.max(zeilenhoehe, d.offsetHeight);
    letztesLinks = links;
  });
  behaelter.style.minHeight = (y + zeilenhoehe + 20) + 'px';
  return y + zeilenhoehe;
}

/* ───────── Reihen ─────────
   Eine REIHE ist ein Feld mit einem festen Kopf links und den Karten
   rechts daneben. Kapitel 2 baut damit seine sechs Mengenreihen,
   Kapitel 3 seine zehn Fragereihen.

   Herausgeloest aus themen/ergebnismengen am 2026-08-21, bevor Kapitel 3
   dieselben dreissig Zeilen ein zweites Mal bekommen haette. Genau der
   Fall, um dessentwillen die Flaeche herausgeloest wurde.

   `kopfAnteil` ist die Breite des Kopfes als Vielfaches der
   Kartenbreite. */
function reiheOrdnen(d, kopfAnteil){
  const kb = parseFloat(getComputedStyle(document.documentElement)
              .getPropertyValue('--kb'));
  const links = kb * (kopfAnteil || 0.72) + 18;
  // NEU (2026-08-21): Eine Reihe kann ihren Kopf als KARTE tragen, nicht
  // nur als festes Bild. Kapitel 3 braucht das seit heute - dort wird
  // die Fragekarte selbst herübergezogen und ist dann der Kopf.
  // Sie liegt links, die uebrigen fliessen daneben.
  const alle = [...d.querySelectorAll(':scope > .k')];
  const kopf = alle.find(k => k.classList.contains('kopfkarte'));
  if (kopf){ kopf._rot = 0; kopf._x = 8; kopf._y = 8; pos(kopf); }

  /* FEHLERBEHOBEN (2026-09-14, Maurus' Rueckmeldung zu Kapitel 2,
     Etappe 2: «Die blauen Kaertchen werden nicht groesser beim
     Rollover»).

     Sie wurden groesser - nur zu wenig, um es zu bemerken. Der
     Reihenkopf liegt auf kopfAnteil der Kartenbreite (in Kapitel 2:
     0,72), und die Lupe im Stylesheet stand auf festen 1,5. Gemessen
     bei --kb 132: eine bewegliche Karte wuchs unter der Lupe von 132
     auf 198 Punkte, die Mengenkarte nur von 95 auf 143 - also KLEINER
     als eine ungelupte Karte daneben, obwohl sie die dichteste auf der
     Flaeche ist (Vorschrift und ausgeschriebenes Omega).

     Der feste Faktor war der Fehler: Er muss die Verkleinerung des
     Kopfes ausgleichen, sonst haengt die Lesbarkeit an einer Zahl, die
     das Kapitel gar nicht kennt. LUPE/kopfAnteil bringt den Kopf auf
     genau dieselbe Endgroesse wie jede andere gelupte Karte. */
  const kopfBild = d.querySelector(':scope > .reihenkopf');
  if (kopfBild) kopfBild.style.setProperty('--kopflupe',
                                           LUPE / (kopfAnteil || 0.72));
  const karten = alle.filter(k => k !== kopf);
  const platz = d.clientWidth - links - 10;

  /* GEAENDERT (2026-09-10, Maurus' Rueckmeldung «Im Vergleich zur
     vorherigen Aktivität ist die Lesbarkeit weniger gut, Schriftgrösse
     zu klein»): Hier stand eine feste Verkleinerung auf 60 Prozent.
     Ihre Begruendung steht im CSS und gilt seit heute nicht mehr - «die
     Spalte ist schmal, verbreitern ginge nur auf Kosten des Tisches».
     Genau das kann der Ziehgriff jetzt.

     Neu wird die Kartenbreite aus dem vorhandenen Platz GERECHNET: die
     groesste, bei der die Karten in hoechstens drei Zeilen passen,
     hoechstens die volle Kartengroesse, nie kleiner als die alten 60
     Prozent. Wer verbreitert, bekommt sofort groessere Karten; wer eine
     Reihe mit zehn Ereignissen fuellt, bekommt zwei Zeilen statt einer
     Zeile Kleinstschrift. Dass die Reihe dabei hoeher wird, traegt
     reihenSetzen() seit heute. */
  const LUFT = 6, ZEILEN = 3;
  const gross = kb, mindest = kb * 0.60;
  let breite = mindest, spalten = Math.max(1,
    Math.floor((platz + LUFT) / (mindest + LUFT)));
  for (let z = 1; z <= ZEILEN; z++){
    const sp = Math.max(1, Math.ceil(karten.length / z));
    const b = (platz + LUFT) / sp - LUFT;
    if (b >= mindest){ breite = Math.min(gross, b); spalten = sp; break; }
  }
  const kh = breite * 0.845;

  karten.forEach((k, i)=>{
    k._rot = 0;
    // Die Breite steht jetzt am Element, nicht mehr im Stylesheet -
    // sie haengt von der Reihe ab und nicht von der Kartensorte.
    k.style.width = breite + 'px';
    k._x = links + (i % spalten) * (breite + LUFT);
    k._y = 8 + Math.floor(i / spalten) * (kh + LUFT);
    pos(k);
  });
  const noetig = 16 + Math.max(1, Math.ceil(karten.length / spalten)) * (kh + LUFT);
  d.style.height = Math.max(kb * 1.05, noetig) + 'px';
}

/* Alle Reihen eines Behaelters neu setzen. Noetig, weil eine wachsende
   Reihe die Abstaende aller Reihen darunter verschiebt. */
function reihenSetzen(behaelter, kopfAnteil, y0){
  let y = (y0 === undefined ? 26 : y0);
  behaelter.querySelectorAll('.feld.reihe').forEach(d=>{
    reiheOrdnen(d, kopfAnteil);
    d.style.top = y + 'px';
    y += d.offsetHeight + 10;
  });
  behaelter.style.minHeight = (y + 20) + 'px';
  return y;
}

/* Seitenrichtig einrasten: links das Modell, rechts der Term. In der
   schmalen Ablage untereinander, weil nebeneinander kein Platz ist.

   FEHLERBEHOBEN (2026-08-21): Die alte Fassung schaute nur auf belegt[0]
   und schloss daraus auf die freie Seite. Lag dort schon eine Karte auf
   der gewuenschten Seite, legte sie die neue exakt darueber. Und wer
   links losliess, landete trotzdem rechts, weil die Wunschseite nur
   zaehlte, solange der Platz ganz leer war.

   Neu gilt: Die Seite, auf der losgelassen wurde, hat Vorrang. Ist sie
   besetzt, weicht die Karte auf die andere aus. Beides zusammen kann
   nicht mehr vorkommen - ablegen() laesst nur noch Karten herein, fuer
   die Platz ist. */
function einrasten(el, platz, x, y){
  el._rot = 0;
  const r = platz.getBoundingClientRect();
  // FEHLERBEHOBEN: Die Breite kam aus offsetWidth der Karte - und die
  // stimmte nicht, solange die Karte gerade erst in die Ablage gewandert
  // war, wo sie kleiner gesetzt wird. Jetzt wird die HAELFTE des Platzes
  // gerechnet; das stimmt unabhaengig von der Kartengroesse.
  const halb = r.width / 2;
  const schmal = r.height > r.width * 0.85;      // hohe, schmale Ablage
  const belegt = [...platz.querySelectorAll(':scope > .k')].filter(k=>k!==el);

  if (fasst(platz) < 2){                         // Kopfplatz: nur einer
    el._x = 4; el._y = 4; pos(el); return;
  }

  if (schmal){
    const mitte = r.height / 2;
    const untenBelegt = belegt.some(k => k._y >= mitte - 4);
    const obenBelegt  = belegt.some(k => k._y <  mitte - 4);
    const willUnten = y !== undefined && (y - r.top) > mitte;
    const unten = willUnten ? !untenBelegt : obenBelegt;
    el._x = 4;
    el._y = unten ? Math.round(mitte) + 2 : 4;
  } else {
    const rechtsBelegt = belegt.some(k => k._x >= halb - 4);
    const linksBelegt  = belegt.some(k => k._x <  halb - 4);
    const willRechts = (x - r.left) > halb;
    const rechts = willRechts ? !rechtsBelegt : linksBelegt;
    el._x = rechts ? Math.round(halb) + 2 : 4;
    el._y = 4;
  }
  pos(el);
}

/* Der naechste Platz mit Luft - erst der, auf dessen Hoehe man
   losgelassen hat, dann von oben der erste freie.

   FEHLERBEHOBEN (2026-08-21): Die alte Fassung rechnete fest mit «zwei
   Karten je Platz» und suchte unter ALLEN Plaetzen des Feldes. Eine vom
   vollen Paarplatz abgewiesene Karte landete deshalb auf dem
   Situationskopf und deckte die Situation zu - derselbe Schaden, nur
   eine Zeile weiter oben. Gemessen: g0/sit mit SS1 und UD5 auf x4 y4.

   Neu wird nur unter Plaetzen DERSELBEN Art gesucht: `gesucht` ist das
   Fassungsvermoegen des Platzes, von dem die Karte kommt. Ein voller
   Paarplatz weicht auf einen anderen Paarplatz aus, ein voller Kopf auf
   einen anderen Kopf - und wenn es keinen gibt, bleibt die Karte liegen,
   wo sie war. */
function naechsterPlatz(feldEl, x, y, gesucht){
  if (!feldEl) return null;
  const plaetze = [...feldEl.querySelectorAll('.paar')]
    .filter(p => gesucht === undefined || fasst(p) === gesucht);
  const nah = plaetze.find(p=>{ const r=p.getBoundingClientRect();
    return y >= r.top - 12 && y <= r.bottom + 12 && hatLuft(p); });
  return nah || plaetze.find(p=>hatLuft(p)) || null;
}

/* FEHLERBEHOBEN (2026-09-10, Rikes Bericht aus dem ersten Einsatz):
   «Zwei Studierende haben in Reflexion 1 alles sortiert und sind dann zu
   Etappe 2 gegangen. Da war irgendwie keine Urnenkarte zu sehen, und
   dann sind sie wieder zu Etappe 1 - und alle Sortierungen waren weg.»

   Hier stand `stand.karten = {}` und danach eine Schleife ueber alle
   Karten IM DOM. Etappe 2 zeigt aber nur die Modellkarten; Situations-
   und Termkarten sind dort gar nicht im DOM. Beim ERSTEN Ablegen in
   Etappe 2 fielen sie damit aus dem Stand - und mit ihnen die ganze
   Sortierung von Etappe 1. Gemessen am 2026-09-10: 17 Karten im Stand,
   drei davon in einer Gruppe; nach einem einzigen Ablegen in Etappe 2
   noch drei, die Gruppe weg.

   Der Fehler war unsichtbar, solange man nicht zurueckging. Und er
   traf ausgerechnet die, die gruendlich gearbeitet hatten.

   Neu wird gestrichen nur, was BEIDES erfuellt:

     1. Der Ort der Karte gibt es in DIESER Buehne ueberhaupt. Eine
        Termkarte auf «tischT» oder eine Situationskarte auf «g0/sit»
        kann in Etappe 2 gar nicht liegen - dort gibt es diese Orte
        nicht. Also gehoert sie einer anderen Etappe und wird nicht
        angefasst. Das ist die Hauptregel, und sie braucht KEINE
        Mitarbeit der Kapitel: Sie liest die Buehne, die ohnehin dasteht.

     2. Die Etappe erklaert sich, falls sie es tut, fuer die Karte
        zustaendig (`window._zustaendig`, gesetzt nach buehne()). Das
        ist die schaerfere Angabe fuer den einen Ort, den alle Etappen
        teilen - «tisch». Wo eine Etappe schweigt, genuegt Regel 1.

   Was weiterhin verschwindet: eine weggelegte Kopie. Sie lag an einem
   Ort dieser Buehne und ist nicht mehr im DOM - beide Regeln treffen zu. */
function merken(){
  const zustaendig = window._zustaendig;
  const gesehen = new Set();
  document.querySelectorAll('.k').forEach(k=>{
    const p = k.parentElement;
    gesehen.add(k.dataset.id);
    /* Eine GELIEHENE Karte: Sie liegt in einer anderen Etappe an einem
       Platz, den es hier nicht gibt, und wird hier nur zum Aufnehmen
       hingelegt (siehe `fremdlage`, gesetzt beim Ortsrueckfall).
       Solange sie hier niemand anfasst, behaelt sie ihren Platz drueben -
       sonst zerlegte ein blosser BESUCH von Etappe 2 die Gruppen, die in
       Etappe 1 gebaut wurden. Wer sie hier bewegt, hat sie bewusst
       umsortiert; ablegen() streicht die Marke dann. */
    if (k.dataset.fremdlage){
      try { stand.karten[k.dataset.id] = JSON.parse(k.dataset.fremdlage); return; }
      catch(_) { delete k.dataset.fremdlage; }
    }
    stand.karten[k.dataset.id] = {
      ort: p.dataset.ort || 'tisch', x: k._x, y: k._y, rot: k._rot };
  });
  const hierDa = ort => ort === 'tisch'
    || !!document.querySelector(`.buehne [data-ort="${CSS.escape(ort)}"]`);
  Object.keys(stand.karten).forEach(id=>{
    if (gesehen.has(id)) return;
    if (!hierDa(stand.karten[id].ort)) return;
    if (zustaendig && !zustaendig(id)) return;
    delete stand.karten[id];
  });
  stand.geprueft = false;
  sichern();
  // NEU (2026-08-28, Rikes Auftrag): Sobald sich etwas bewegt, ist das
  // alte Urteil hinfaellig. Vorher blieben die gruenen und roten Rahmen
  // stehen, bis jemand erneut auf «Pruefen» drueckte - eine Karte, die
  // laengst zurueck auf dem Tisch lag, trug dort weiter ihr Rot. Genau
  // das sah aus, als pruefe der Knopf nicht mehr richtig: Er tat es,
  // aber daneben stand noch die Anzeige von vorhin.
  markenLoeschen();
}
/* Raeumt alles weg, was eine Pruefung hinterlaesst - die Rahmen an den
   Karten, die Urteile an den Plaetzen und den Befundsatz in der Leiste.
   Steht hier und nicht in der Etappe, weil merken() aus der gemeinsamen
   Flaeche heraus aufgerufen wird. */
function markenLoeschen(){
  document.querySelectorAll('.k.ok,.k.falsch,.k.fastok,.k.halb,.k.sitok,.k.sitfalsch')
    .forEach(k => k.classList.remove('ok','falsch','fastok','halb','sitok','sitfalsch'));
  document.querySelectorAll('.paar.sit-ok,.paar.sit-falsch,.paar.sit-offen,.paar.sit-warte')
    .forEach(p => p.classList.remove('sit-ok','sit-falsch','sit-offen','sit-warte'));
  document.querySelectorAll('.sitmarke').forEach(m => m.remove());
  const b = document.getElementById('befund');
  if (b) b.textContent = '';
}
/* Streuung wie in SORT: versetztes Raster mit Zufallsversatz und leichter
   Drehung - durcheinander, aber jede Karte bleibt lesbar und im Bild. */
/* Der ungeordnete Tisch, in BAENDERN statt als Haufen.

   NEU (2026-08-21): Stand bisher in themen/kombinatorik/etappen.js.
   Kapitel 3 braucht seit heute dasselbe - dort liegen Fragen und
   Rechenwege gemeinsam auf dem Tisch. Zweimal dieselben sechzig Zeilen
   waeren der Anfang des Auseinanderlaufens; deshalb hier.

   Die Begruendung von damals gilt unveraendert: Ein gemeinsamer Wust
   zwingt dazu, erst die Sorte zu erkennen, bevor man ueberhaupt
   vergleichen kann. Aufgefaechert bleibt die Unordnung INNERHALB der
   Sorte - und die ist gewollt.

   Ein Band: {art, name, ids()}  -  ids() liefert die Kartenkennungen.
   `geschuettet` darf fehlen; dann liegen alle Baender von Anfang an. */
function baenderOrdnen(tisch, baender, els, geschuettet){
  tisch.querySelectorAll('.bandmarke').forEach(d => d.remove());
  tisch.style.minHeight = '0px';
  let y = 22;
  baender.forEach(b => {
    if (geschuettet && !geschuettet[b.art]) return;
    const drauf = b.ids()
      .filter(id => (stand.karten[id] || {}).ort === 'tisch')
      .map(id => els[id]).filter(Boolean);
    const m = document.createElement('div');
    m.className = 'bandmarke';
    m.style.top = (y - 16) + 'px';
    m.textContent = b.name;
    tisch.appendChild(m);
    y = streuen(drauf, tisch, y) + 26;
  });
}

function streuen(els, blatt, y0){
  const kb = parseFloat(getComputedStyle(document.documentElement)
              .getPropertyValue('--kb'));
  const b = blatt.clientWidth || 460, spalte = kb * 0.70;
  const spalten = Math.max(1, Math.floor((b - 16) / spalte));
  const hoehe = kb * 0.62;
  const oben = y0 === undefined ? 24 : y0;
  els.slice().sort(()=>Math.random()-0.5).forEach((el, i)=>{
    const c = i % spalten, r = Math.floor(i / spalten);
    el._rot = (Math.random()*7 - 3.5).toFixed(1);
    el._x = 8 + c*spalte + (Math.random()-0.5)*spalte*0.34;
    el._y = oben + r*hoehe + (Math.random()-0.5)*hoehe*0.26;
    el.style.zIndex = ++zmax;
    blatt.appendChild(el); pos(el);
  });
  const unten = oben + Math.ceil(els.length/spalten)*hoehe + kb*0.30;
  blatt.style.minHeight = Math.max(parseFloat(blatt.style.minHeight)||0, unten+20) + 'px';
  return unten;
}

/* ───────── Gerüst ───────── */
/* Groessenregler, «Stand als Bild sichern», Aufnahme-Knopf - der Teil
   der Leiste, den JEDE Buehnenform braucht. Herausgeloest am 2026-08-24,
   als buehneOben() dazukam: vorher stand das nur in buehne() und waere
   ein zweites Mal abgeschrieben worden. */
function _leisteChrome(b){
  const g = document.createElement('span');
  g.className = 'groesse';
  g.innerHTML = `<button class="stufe" data-s="-1">−</button>`
    + `<input type="range" min="96" max="210" step="6" value="${
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kb'))}">`
    + `<button class="stufe" data-s="1">+</button>`;
  const regler = g.querySelector('input');
  const setzen2 = v => {
    v = Math.min(210, Math.max(96, v));
    regler.value = v;
    document.documentElement.style.setProperty('--kb', v+'px');
    if (window._neuzeichnen) window._neuzeichnen();
  };
  regler.oninput = e => setzen2(parseFloat(e.target.value));
  g.querySelectorAll('.stufe').forEach(k=>k.onclick=()=>
    setzen2(parseFloat(regler.value) + 12*parseInt(k.dataset.s)));
  b.querySelector('.leiste').appendChild(g);
  const bild = document.createElement('button');
  bild.className = 'knopf leer'; bild.textContent = 'Stand als Bild sichern';
  bild.onclick = alsBild;
  b.querySelector('.leiste').appendChild(bild);
  if (stand.aufnahme && window.Aufnahme){
    const auf = document.createElement('button');
    auf.className = 'knopf leer';
    auf.style.borderColor = '#C0392B'; auf.style.color = '#C0392B';
    auf.textContent = 'Aufnahme beenden und sichern';
    auf.onclick = ()=>{ Aufnahme.beenden();
      Aufnahme.sichern(`kapitel${D.kapitel}_aufnahme`);
      auf.remove(); };
    b.querySelector('.leiste').appendChild(auf);
  }
}

/* ───────── Der Ziehgriff zwischen den Flaechen ─────────
   NEU (2026-09-10, Rueckmeldung der Studierenden zum ersten Einsatz):
   «Manchmal waere es cool, wenn man den unsortierten und den sortierten
   Bereich etwas anpassen kann - das eine Feld kleiner und das andere
   groesser. Besonders aufgefallen ist das bei Etappe 2, wo irgendwann
   das unsortierte Feld deutlich leerer war.»

   Genau so ist es: Karten wandern nach rechts, links wird leer, rechts
   wird eng - und das Verhaeltnis stand bisher als feste Zahl im Markup
   (flex:1.15 gegen flex:1.25). Der Griff verstellt diese Zahlen; er
   sitzt in buehne() und buehneOben() und wirkt damit in JEDER Etappe
   JEDES Kapitels, ohne dass ein Kapitel etwas davon wissen muss.

   Rikes Entscheidung zur Haltbarkeit: NICHT ueber Etappen hinweg. «Der
   Etappenwechsel ist glaub irrelevant, weil wir ja bei einer neuen
   Etappe ggf. einen neuen Sortiertisch mit anderer Aufteilung haben.»
   Der Stand haengt deshalb am Etappen-TITEL - er unterscheidet auch die
   beiden Wege von Etappe 3, die sonst denselben Schluessel traegen.
   Innerhalb einer Etappe haelt die Einstellung dagegen alles aus:
   Neuzeichnen, Groessenregler, «weitere Karten zuschalten».

   Nach dem Verstellen wird neu gezeichnet - die Felder rechnen ihre
   Spalten aus der Breite, und die stimmt sonst nicht mehr. */
function _teilungSchluessel(auftrag){
  return String(auftrag && auftrag.titel || '');
}

function _griffeSetzen(b, schluessel){
  const flaeche = b.querySelector('.buehne');
  if (!flaeche) return;
  const stapel = flaeche.classList.contains('stapel');
  // Im gestapelten Brett wird OBEN gegen UNTEN verstellt (waagrechter
  // Griff), sonst die Haelften nebeneinander (senkrechte Griffe).
  const teile = stapel
    ? [...flaeche.children].filter(d => d.classList.contains('haelfte')
                                     || d.classList.contains('unten'))
    : [...flaeche.querySelectorAll(':scope > .haelfte')];
  if (teile.length < 2) return;

  const anteil = d => parseFloat(getComputedStyle(d).flexGrow) || 1;
  // Die Voreinstellung DIESER Etappe merken, bevor etwas ueberschrieben
  // wird - sonst gibt es keinen Weg zurueck.
  const voreinstellung = teile.map(anteil);

  const gemerkt = (stand.teilung || {})[schluessel];
  if (gemerkt && gemerkt.length === teile.length)
    teile.forEach((d, i) => { d.style.flex = gemerkt[i] + ' 1 0'; });

  teile.slice(0, -1).forEach((links, i)=>{
    const rechts = teile[i+1];
    const griff = document.createElement('div');
    griff.className = 'teiler' + (stapel ? ' quer' : '');
    griff.title = 'Ziehen: die beiden Flächen anders aufteilen';
    // Ein Doppelklick stellt die Voreinstellung dieser Etappe wieder
    // her - ohne ihn muesste man sich das Ausgangsverhaeltnis merken.
    griff.ondblclick = ()=>{
      if (stand.teilung) delete stand.teilung[schluessel];
      teile.forEach((d, j) => { d.style.flex = voreinstellung[j] + ' 1 0'; });
      if (window._neuzeichnen) window._neuzeichnen();
    };
    griff.addEventListener('pointerdown', e=>{
      e.preventDefault();
      const waagrecht = !stapel;
      const r0 = links.getBoundingClientRect(), r1 = rechts.getBoundingClientRect();
      const spanne = waagrecht ? (r0.width + r1.width) : (r0.height + r1.height);
      const summe = anteil(links) + anteil(rechts);
      const start = waagrecht ? e.clientX : e.clientY;
      const a0 = waagrecht ? r0.width : r0.height;
      griff.classList.add('zieht');
      try { griff.setPointerCapture(e.pointerId); } catch(_) {}
      const bewegen = ev=>{
        const jetzt = waagrecht ? ev.clientX : ev.clientY;
        // Mindestens 12 Prozent je Seite: Eine Flaeche, die man auf null
        // zieht, bekommt man ohne den Doppelklick nicht mehr zurueck -
        // und Karten, die darin liegen, waeren unerreichbar.
        const neu = Math.min(Math.max(a0 + (jetzt - start), spanne*0.12),
                             spanne*0.88);
        const wLinks = summe * neu / spanne;
        links.style.flex  = wLinks.toFixed(3) + ' 1 0';
        rechts.style.flex = (summe - wLinks).toFixed(3) + ' 1 0';
      };
      const los = ()=>{
        window.removeEventListener('pointermove', bewegen);
        window.removeEventListener('pointerup', los);
        griff.classList.remove('zieht');
        stand.teilung = stand.teilung || {};
        stand.teilung[schluessel] = teile.map(anteil);
        // Die Felder rechnen ihre Spalten aus der Breite - ohne
        // Neuzeichnen stehen sie nach dem Verstellen falsch.
        if (window._neuzeichnen) window._neuzeichnen();
      };
      window.addEventListener('pointermove', bewegen);
      window.addEventListener('pointerup', los);
    });
    (stapel ? flaeche : flaeche).insertBefore(griff, rechts);
  });
}

function buehne(auftrag, links, rechts, leiste, extra, drittens){
  const b = document.getElementById('buehne');
  // Haken der vorigen Etappe loesen, sonst laeuft er in der naechsten
  // weiter und sucht Felder, die es dort nicht mehr gibt. Dasselbe gilt
  // fuer die Zustaendigkeit: Wer nichts sagt, bekommt das alte
  // Verhalten - richtig fuer Etappen, die ALLE Karten zeigen.
  window._nachAblegen = null;
  window._zustaendig = null;
  // Die Farbe steht am body und aendert sich innerhalb eines Kapitels
  // nicht mehr. auftrag.rolle traegt weiterhin die Phase des Skripts -
  // sie steht im Rang links, faerbt aber nichts.
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${auftrag.rang}</span>
      <span class="titel">${auftrag.titel}</span>
      <span class="text">${auftrag.text}</span></div>
    ${extra||''}
    <div class="buehne">
      <div class="haelfte" id="links" style="flex:1.15"><div class="marke">${links}</div>
        <div class="blatt" id="tisch" data-ort="tisch"></div></div>
      <div class="haelfte rechts" id="rechts" style="flex:1.25"><div class="marke">${rechts}</div>
        <div class="blatt" id="feld"></div></div>
      ${drittens ? `<div class="haelfte ablageflaeche" id="dritt" style="flex:.72">
        <div class="marke">${drittens}</div>
        <div class="blatt" id="ablage"></div></div>` : ''}
    </div>
    <div class="leiste">${leiste}</div>`;
  _griffeSetzen(b, _teilungSchluessel(auftrag));
  _leisteChrome(b);
}

/* NEU (2026-08-24, Rikes Auftrag): Gestapelte Buehne statt Spalten
   nebeneinander - siehe agent/06_sortierflaechen.md, «Breit und niedrig
   statt hoch und schmal». Oben EIN grosses sortiertes Feld ueber die
   ganze Breite, darunter eine Reihe von Quellflaechen (`unten`, je
   {id, name}). Anders als bei buehne() gibt es keine separate Ablage
   fuer «passt zu keiner Situation» - eine Gruppe ohne Situationskopf
   ist im gestapelten Modell keine zweite Kategorie, nur eine
   unvollstaendige (oder, bei Distraktoren, eine fertige) Gruppe.
   Erster Einsatz: Etappe 1 der Kombinatorik. */
function buehneOben(auftrag, obenName, unten, leiste, extra){
  const b = document.getElementById('buehne');
  window._nachAblegen = null;
  window._zustaendig = null;
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${auftrag.rang}</span>
      <span class="titel">${auftrag.titel}</span>
      <span class="text">${auftrag.text}</span></div>
    ${extra||''}
    <div class="buehne stapel">
      <div class="haelfte rechts oben" id="obenhaelfte"><div class="marke">${obenName}</div>
        <div class="blatt" id="feld"></div></div>
      <div class="unten">
        ${unten.map(z => `<div class="haelfte" id="hal${z.id}"><div class="marke">${z.name}</div>
          <div class="blatt" id="feld${z.id}" data-ort="tisch${z.id}"></div></div>`).join('')}
      </div>
    </div>
    <div class="leiste">${leiste}</div>`;
  _griffeSetzen(b, _teilungSchluessel(auftrag));
  _leisteChrome(b);
}
/* ───────── Loesung (nur Kontrollfassung) ─────────
   NEU (2026-08-24, Rikes Auftrag): Jede Sortierflaeche bekommt eine
   fertige Loesung - richtige Zuordnung, wo es sie gibt, sonst eine
   moegliche Loesung mit Hinweis auf die Vielfalt. Sie gehoert in
   dieselbe index.html, die Maurus fuer die Rueckmeldung anschaut - NIE
   in aufnahme.html, die Studierendenfassung. Der Unterschied ist schon
   da: `window.KASPER_RUECKMELDUNG` wird nur in index.html gesetzt
   (siehe kern/flaeche/__init__.py, RUECKMELDUNG_SKRIPT) - kein neues
   Flag noetig.

   Jede Etappe, die eine Loesung hat, ruft NACH buehne()/buehneOben()
   `loesungsKnopf(() => '...')` auf. Etappen ohne Loesung (offene
   Wahlbildschirme) rufen es einfach nicht auf - dann erscheint auch
   kein Knopf, statt eines toten. */
/* GEAENDERT (2026-08-24, Rikes Rueckmeldung): Eine Textliste mit
   Karten-IDs («U1, T1») ist fuer Maurus und Rike nicht lesbar - sie
   kennen die interne Nummerierung nicht. Statt einer Liste zeigt
   «Lösung anzeigen» jetzt das FELD SELBST, vollstaendig und richtig
   sortiert - dieselben Karten, dieselbe Fläche, nur an ihrem richtigen
   Platz statt an dem, den die pruefende Person gelegt hat.

   Zwei Funktionen, weil die Reihenfolge zaehlt: `loesungAnwenden` muss
   VOR dem Zeichnen laufen (sie tauscht stand.karten, bevor felder()/
   reihen() es liest), `loesungsKnopf` NACH dem Zeichnen (sie haengt nur
   den Knopf an die fertige Leiste). Beide stehen deshalb an
   verschiedenen Stellen jeder Etappe. */

/* Tauscht den eigenen Stand gegen die Loesung, wenn `stand.loesungOffen`
   gesetzt ist - und zurueck, wenn nicht. `baueLoesungStand()` liefert ein
   Objekt {karten:{...}, ...weitere Stand-Felder}; jedes genannte Feld
   wird gesichert und ersetzt. `_loesungAktiv` verhindert, dass ein
   Neuzeichnen WAEHREND die Loesung offen ist (Fenstergroesse, «weitere
   Karten zuschalten») die Sicherung ein zweites Mal ueberschreibt - dann
   waere die «Sicherung» schon die Loesung, und der eigene Stand waere weg. */
function loesungAnwenden(baueLoesungStand){
  if (!window.KASPER_RUECKMELDUNG) return;
  document.body.classList.toggle('loesungoffen', !!stand.loesungOffen);
  // FEHLERBEHOBEN (2026-08-24): Ein einzelnes «schon aktiv»-Flag reichte
  // nicht - beim Wechsel von Etappe 1 zu Etappe 2 blieb es gesetzt, und
  // Etappe 2s eigene Loesung wurde nie angewendet: ihr Feld blieb leer,
  // ihr eigener Stand (`stand.gruppen`) stand noch auf der Voreinstellung.
  // Jede Etappe legt eigene Stand-Felder frisch - `karten` gemeinsam,
  // `gruppen`/`e1gruppen` je Etappe. Richtig ist: Jeder Aufruf
  // UEBERSCHREIBT frisch mit dem Patch DIESER Etappe; gesichert wird ein
  // Feld nur beim ALLERERSTEN Ueberschreiben (`k in _loesungSicherung`
  // als Wache), egal, welche Etappe das ist - sonst wuerde eine spaetere
  // Etappe faelschlich die Loesung einer frueheren als "Original" sichern.
  if (!stand._loesungSicherung) stand._loesungSicherung = {};
  if (stand.loesungOffen){
    const patch = baueLoesungStand();
    Object.keys(patch).forEach(k => {
      if (!(k in stand._loesungSicherung)) stand._loesungSicherung[k] = stand[k];
      stand[k] = patch[k];
    });
    stand._loesungAktiv = true;
  } else {
    _loesungWiederherstellen();
  }
}

/* Stellt die gesicherten Felder wieder her, falls ueberhaupt etwas
   getauscht wurde. Eigene Funktion, weil `loesungsHinweis()` (Etappen
   ohne feste Loesung, z.B. Kombinatorik Etappe 3) beim Ausschalten
   dasselbe braucht - dort ruft aber niemand loesungAnwenden() auf, also
   muss das Aufraeumen von dort erreichbar sein.
   FEHLERBEHOBEN (2026-08-24): Ohne diesen gemeinsamen Aufruf blieb
   stand.karten/stand.texte nach «Lösung verbergen» auf EINER Etappe mit
   loesungsHinweis (keine eigene Loesung, nur Text) im Loesungszustand
   haengen, bis irgendeine ANDERE Etappe mit eigener Loesung erneut
   aufgerufen wurde - der Knopf sagte «aus», der Stand war es nicht. */
function _loesungWiederherstellen(){
  if (!stand._loesungAktiv) return;
  Object.keys(stand._loesungSicherung).forEach(k => { stand[k] = stand._loesungSicherung[k]; });
  stand._loesungSicherung = {};
  stand._loesungAktiv = false;
}

/* Der Knopf selbst. `neuZeichnen` baut die ganze Etappe neu auf - meist
   einfach die Etappenfunktion selbst noch einmal, z.B. `()=>etappe1()` -
   damit laeuft beim naechsten Aufruf loesungAnwenden() erneut und liest
   den (jetzt umgeschalteten) stand.loesungOffen. */
function loesungsKnopf(neuZeichnen){
  if (!window.KASPER_RUECKMELDUNG) return;
  const leiste = document.querySelector('.leiste');
  if (!leiste) return;
  const kn = document.createElement('button');
  kn.className = 'knopf leer loesungknopf';
  kn.textContent = stand.loesungOffen ? 'Lösung verbergen' : 'Lösung anzeigen';
  kn.onclick = () => { stand.loesungOffen = !stand.loesungOffen; neuZeichnen(); };
  leiste.appendChild(kn);
}

/* Fuer Etappen ohne eindeutige Loesung (die Zielgruppen sind selbst
   benannt, siehe Kombinatorik Etappe 3): ein kurzer Text statt eines
   Feldes. Kein Umschalten von stand.karten - nichts zum Sichern. */
/* `container` ist optional - noetig fuer Bildschirme ohne die normale
   buehne()-Leiste, z.B. die Wahlbildschirme vor Etappe 3 (Kombinatorik,
   A.2): dort gibt es weder `.leiste` noch `.buehne`, nur ein rohes
   `.start`-div. FEHLERBEHOBEN (2026-08-24, Rikes Rueckmeldung): Genau
   dort fehlte der Knopf bisher ganz - `loesungsHinweis()` gab still auf,
   weil `.leiste` nicht existierte. Wer die Wahl nie anklickte, sah nie
   eine Loesungsoption und hielt sie fuer Etappe 3 insgesamt fuer fehlend. */
function loesungsHinweis(html, container){
  if (!window.KASPER_RUECKMELDUNG) return;
  const leiste = container || document.querySelector('.leiste');
  if (!leiste) return;
  const kn = document.createElement('button');
  kn.className = 'knopf leer loesungknopf';
  const zeichnen = () => {
    let panel = document.getElementById('loesungpanel');
    if (stand.loesungOffen){
      if (!panel){
        panel = document.createElement('div');
        panel.id = 'loesungpanel'; panel.className = 'loesungpanel';
        if (container) container.appendChild(panel);
        else document.querySelector('.buehne').insertAdjacentElement('afterend', panel);
      }
      panel.innerHTML = html;
      kn.textContent = 'Lösung verbergen';
    } else {
      if (panel) panel.remove();
      kn.textContent = 'Lösung anzeigen';
      _loesungWiederherstellen();      // siehe Vermerk dort
    }
  };
  kn.onclick = () => { stand.loesungOffen = !stand.loesungOffen; zeichnen(); };
  leiste.appendChild(kn);
  zeichnen();
}

/* GETRENNT (2026-09-08): Bis heute baute alsBild() die Leinwand und lud
   sie in einem Zug herunter. Fuer die Bilder zum Mitnehmen wird die
   Leinwand aber gebraucht, OHNE dass etwas heruntergeladen wird - beim
   Verlassen einer Etappe, still im Hintergrund.

   Die Rechtecke werden alle SYNCHRON gelesen; nur das Nachzeichnen der
   Kartenbilder ist asynchron, und es haengt an einer eigenen Image()
   mit derselben Adresse, nicht am Element auf der Buehne. Deshalb darf
   die Buehne unmittelbar danach ausgetauscht werden - das Versprechen
   loest trotzdem richtig auf. Genau darauf beruht bildSammeln(). */
/* FEHLERBEHOBEN (2026-09-08, Rikes Fund): «Wir haben ein Problem beim
   Mitnehmen. Es wird nur das gespeichert, was direkt gesehen wird.
   Alle Sachen, die man erst durch Scrollen sieht, werden nicht mit
   aufgenommen.»

   Stimmt, und die Ursache ist getBoundingClientRect: Es misst gegen das
   FENSTER, nicht gegen den Inhalt. Was aus einer rollenden Haelfte
   herausgerollt ist, bekommt Koordinaten ausserhalb der Leinwand und
   faellt beim Zeichnen weg - lautlos. Wer scrollen musste, nahm ein
   halbes Bild mit und sah es nicht.

   Behoben, indem vor dem Messen alles aufgeklappt wird, was rollt:
   `overflow` sichtbar, feste Hoehen weg. Dann stimmen die Rechtecke,
   weil nichts mehr abgeschnitten ist. Aufgeklappt wird nur fuer die
   Dauer des Messens - das laeuft synchron in einem Zug, bevor der
   Browser neu zeichnet, und ist deshalb nicht zu sehen. */
function _aufklappen(wurzel){
  /* FEHLERBEHOBEN (2026-09-10, Rueckmeldung der Studierenden: «Wenn man
     die Etappe speichert, wird nur der Bildschirm aufgenommen - je
     nachdem sieht man dann nur einen Teil»).

     Die Auswahl unten nimmt nur, was SELBST rollt. Die Buehne rollt
     nicht - ihre Haelften tun es. Sie bekam deshalb kein `height:auto`,
     behielt ihre Hoehe aus dem Flex-Layout, und das Bild wurde genau so
     hoch wie der Bildschirm. Gemessen am 2026-09-10 in Kapitel 2,
     Etappe 2: Bild 1400x645, waehrend das sortierte Feld 940 Punkte
     Inhalt hatte - ein knappes Drittel der Mengenreihen fehlte, und
     zwar stumm.

     Die Wurzel wird jetzt mit aufgeklappt - sie ist das, was gemessen
     wird, und muss so gross werden wie ihr Inhalt. Sie braucht dabei
     auch `flex:none`: Mit `flex:1 1 auto` schrumpft sie sonst wieder auf
     die Fensterhoehe zurueck, und das Bild ist so kurz wie vorher
     (nachgemessen am 2026-09-10: 1024x356 statt 1024x994). */
  /* Zwei Sorten muessen mit, und die zweite ist der Grund, warum die
     erste Fassung dieses Fixes die Buehne auf 28x20 Punkte zusammenfallen
     liess (gemessen am 2026-09-10): Sobald die Wurzel `height:auto`
     bekommt, haben ihre Haelften mit `flex:1 1 0` keinen Raum mehr zu
     verteilen und fallen auf null. Sie muessen deshalb IMMER auf
     `flex:none; height:auto` gesetzt werden, ob sie selbst rollen oder
     nicht - nicht nur die, bei denen gerade etwas ueberhaengt. */
  const struktur = [...wurzel.querySelectorAll(
    ':scope > .haelfte, :scope > .unten, :scope > .unten > .haelfte, .blatt')];
  const rollende = [...wurzel.querySelectorAll('*')].filter(e =>
    e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
  const innen = [...new Set([...struktur, ...rollende])];
  const gerollt = [wurzel, ...innen];
  const sicherung = gerollt.map(e => ({
    e, overflow: e.style.overflow, height: e.style.height,
    maxHeight: e.style.maxHeight, width: e.style.width,
    maxWidth: e.style.maxWidth, flex: e.style.flex }));
  gerollt.forEach(e => {
    e.style.overflow = 'visible';
    e.style.height = 'auto'; e.style.maxHeight = 'none';
    e.style.width = 'auto';  e.style.maxWidth = 'none';
    e.style.flex = 'none';
  });
  return () => sicherung.forEach(k => {
    k.e.style.overflow = k.overflow; k.e.style.height = k.height;
    k.e.style.maxHeight = k.maxHeight; k.e.style.width = k.width;
    k.e.style.maxWidth = k.maxWidth; k.e.style.flex = k.flex;
  });
}

function standAlsLeinwand(){
  const flaeche = document.querySelector('.buehne');
  if (!flaeche) return Promise.resolve(null);
  // Erst aufklappen, dann messen. Zugeklappt wird ganz am Ende der
  // synchronen Messung, vor dem Warten auf die Bilder.
  const zuklappen = _aufklappen(flaeche);
  const r = flaeche.getBoundingClientRect(), s = 2;
  const c = document.createElement('canvas');
  c.width = r.width*s; c.height = r.height*s;
  const g = c.getContext('2d'); g.scale(s,s);
  g.fillStyle = getComputedStyle(document.documentElement)
                  .getPropertyValue('--papier').trim() || '#f8f4ec';
  g.fillRect(0,0,r.width,r.height);
  const warte = [];
  document.querySelectorAll('.feld:not(.neu),.paar').forEach(d=>{
    const q = d.getBoundingClientRect();
    g.save(); g.setLineDash([6,4]); g.strokeStyle='#d8cdb8';
    g.strokeRect(q.left-r.left, q.top-r.top, q.width, q.height); g.restore();
    const t = d.querySelector('.gname,.kopf');
    if (t){ g.fillStyle='#2d2924'; g.font='13px sans-serif';
      g.fillText((t.value||t.textContent||'').slice(0,44),
                 q.left-r.left+8, q.top-r.top+18); }
  });
  /* FEHLERBEHOBEN (2026-09-08): Bilder, die zur ZONE gehoeren und nicht
     zu einer Karte, fehlten im gesicherten Stand. Bei «Komplexe Zahlen»
     ist das der Zeiger, der jede Rechnung ueberhaupt erst kenntlich
     macht (`<img class="reihenkopf" src="karten/R1.svg">` als direktes
     Kind der Reihe). Ohne ihn zeigte das Bild leere Reihen mit Karten
     darin - und niemand konnte mehr sehen, zu welcher Rechnung sie
     gehoerten.

     Ursache: Die Schleife unten sucht nur `.k`. Alles, was kein
     Kaertchen ist, kam nie vor. Der Fehler war stumm - das Bild
     entstand, es fehlte nur etwas darin. */
  document.querySelectorAll('.buehne img').forEach(im=>{
    if (im.closest('.k')) return;          // Karten kommen unten dran
    const q = im.getBoundingClientRect();
    if (!q.width || !q.height) return;
    warte.push(new Promise(fertig=>{
      const b3 = new Image();
      b3.onload = ()=>{ g.drawImage(b3, q.left-r.left, q.top-r.top,
                                    q.width, q.height); fertig(); };
      b3.onerror = fertig; b3.src = im.src;
    }));
  });

  /* FEHLERBEHOBEN (2026-09-08, zweiter Fall derselben Sorte): Text,
     der zur FLAECHE gehoert und nicht auf einer Karte steht, fehlte im
     Bild. Bei Meilenstein 1 sind das die Rechenzeichen zwischen den
     Plaetzen - ohne sie liest sich die gesicherte Zeile als vier
     Kaestchen, und ob dort mal oder plus stand, ist nicht mehr zu
     sehen. Wer das Bild als Notiz mitnimmt, nimmt eine Notiz ohne
     Rechnung mit.

     Wer solchen Text mitgezeichnet haben will, markiert ihn mit
     `data-alsbild`. Ohne die Marke aendert sich nichts - keine
     bestehende Flaeche traegt sie. */
  document.querySelectorAll('.buehne [data-alsbild]').forEach(t=>{
    const q = t.getBoundingClientRect();
    if (!q.width || !q.height) return;
    const st = getComputedStyle(t);
    g.save();
    g.fillStyle = st.color;
    g.font = `${st.fontWeight} ${parseFloat(st.fontSize)}px ${st.fontFamily}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(t.textContent, q.left - r.left + q.width / 2,
                              q.top - r.top + q.height / 2);
    g.restore();
  });

  document.querySelectorAll('.k').forEach(k=>{
    const q = k.getBoundingClientRect();
    const im = k.querySelector('img');
    // FEHLERBEHOBEN (2026-08-21): Beschreibbare Karten haben kein <img>.
    // Die alte Fassung griff blind auf im.src zu - mit einer solchen
    // Karte auf dem Tisch brach die Bildsicherung ab, und zwar still.
    if (!im){
      const feld = k.querySelector('textarea');
      const x = q.left-r.left, y = q.top-r.top;
      g.save();
      g.fillStyle = '#fffefb'; g.strokeStyle = '#e4d9c7'; g.lineWidth = 1;
      g.beginPath(); g.roundRect(x, y, q.width, q.height, 8);
      g.fill(); g.stroke();
      g.fillStyle = '#2d2924'; g.font = '12px sans-serif';
      const worte = ((feld && feld.value) || '').split(/\s+/);
      let zeile = '', zy = y + 26;
      worte.forEach(w=>{
        const probe = zeile ? zeile + ' ' + w : w;
        if (g.measureText(probe).width > q.width - 16 && zeile){
          g.fillText(zeile, x + 8, zy); zy += 16; zeile = w;
        } else zeile = probe;
      });
      if (zeile) g.fillText(zeile, x + 8, zy);
      g.restore();
      return;
    }
    warte.push(new Promise(fertig=>{
      const bild2 = new Image();
      bild2.onload = ()=>{ g.drawImage(bild2, q.left-r.left, q.top-r.top,
                                       q.width, q.height); fertig(); };
      bild2.onerror = fertig; bild2.src = im.src;
    }));
  });
  zuklappen();
  return Promise.all(warte).then(()=> c);
}

function alsBild(){
  standAlsLeinwand().then(c=>{
    if (!c) return;
    const a = document.createElement('a');
    a.download = `kapitel${D.kapitel}_etappe${stand.etappe+1}.png`;
    a.href = c.toDataURL('image/png'); a.click();
  });
}


const ETAPPEN = [];        // fuellt die Kapiteldatei

/* ───────── Startfeld ─────────
   BERICHTIGT (2026-08-21, zweite Fassung): Die erste Fassung fragte, ob
   die Gruppe vor Ort ist, und machte die Aufnahme daraus zur Pflicht.
   Das stimmt nicht.

   Die Regel ist einfacher: Es braucht fuenf Nachweise im Semester. Ein
   Nachweis ist ENTWEDER eine Anwesenheit vor Ort ODER eine Aufnahme.
   Beides zaehlt gleich, gemischt geht auch, mehr als fuenf ist erlaubt.
   Die Aufnahme ist deshalb IMMER freiwillig - auch zu Hause. Wer zu
   Hause nicht aufnimmt, hat fuer diesen Termin nur eben keinen Nachweis.
   Das ist eine Folge, kein Zwang.

   BESTAETIGT (2026-08-22): Hier stand ein PRUEFEN - «Zahlen aus Rikes
   Ansage, nicht gegen ein Merkblatt geprueft». Rike hat sie an diesem
   Tag ausdruecklich bestaetigt: «Sie muessen insgesamt FUENF
   Sortieraktivitaeten bearbeiten. Entweder vor Ort oder daheim. Ich
   brauch einfach fuenfmal, dass sie sich mit fuenf mindestens
   auseinandergesetzt haben.»
   Ihre Formulierung deckt sich mit dem, was hier steht: fuenf, und der
   Ort ist frei.
*/
/* Die Nachweisregel steht nicht mehr fest im Startfeld.
   NEU (2026-09-08, Rikes Auftrag): «Komplexe Zahlen» hat eine ANDERE
   Regelung als «Daten und Zufall» - vier Meilensteine, drei davon mit
   ihr besucht. Ein Thema setzt `D.nachweis`; sagt es nichts, gilt die
   Regel von «Daten und Zufall» woertlich wie bisher weiter. */
const NACHWEIS_DZ = '<b>Fünf Nachweise im Semester.</b> Ein Nachweis ist entweder'
  + '\n    eine Anwesenheit vor Ort oder eine Aufnahme — beides zählt gleich, und Sie'
  + '\n    dürfen mischen. Mehr als fünf ist möglich, aufnehmen dürfen Sie immer:'
  + '\n    vor Ort ebenso wie zu Hause.';

/* Fragt das Startfeld nach der Aufnahme?

   NEU (2026-09-08, Rikes Entscheidung): Bei «Komplexe Zahlen» steckt
   die Wahl nicht mehr in einem Knopf, sondern in der Adresse - zwei
   Fassungen derselben Flaeche. Fassung A laeuft im Meilensteinblock in
   ihrem Beisein und nimmt NIE auf; Fassung B laeuft allein und nimmt
   IMMER auf. Begruendung im Entscheidungslog: Wo an der Aufnahme der
   Nachweis haengt, ist ein Knopf keine echte Wahl.

   «Daten und Zufall» bleibt bei der Frage - dort ist die Aufnahme
   tatsaechlich freiwillig, weil eine Anwesenheit vor Ort sie ersetzt.
   Deshalb entscheidet das THEMA, nicht diese Datei, und die Vorgabe ist
   das bisherige Verhalten: Sagt ein Thema nichts, wird gefragt. */
const AUFNAHMEWEISE = D.aufnahme || 'wahl';   // 'wahl' | 'nie' | 'immer'

function startfeld(){
  // Der Einstieg kommt aus den Kapiteldaten. Das Bild ist freiwillig -
  // Kapitel ohne eigenes Einstiegsbild lassen es einfach weg.
  const S = D.start || {};

  /* Der Einstieg ist in allen drei Weisen derselbe. Er faellt auch bei
     'nie' nicht weg: Titel, Lage, Frage und Nachsatz sind der Rahmen
     der Aufgabe, nicht Beiwerk der Aufnahmefrage. */
  const einstieg = `<h2>${S.titel || ''}</h2>
    <div class="einstieg">
      ${S.bild ? `<img src="${S.bild}" alt="">` : ''}
      <div><p class="lage">${S.lage || ''}</p>
      <p class="frage">${S.frage || ''}</p>
      ${S.nachsatz ? `<p class="lage" style="font-size:14px">${S.nachsatz}</p>` : ''}</div>
    </div>`;

  const mitte = {
    wahl: `<p style="color:var(--matt);margin-bottom:14px">Möchten Sie aufnehmen?</p>
    <div class="wahl" data-a="1"><b>Ja, mit Aufnahme</b>
      <span>Ihr Gespräch und Ihre Kartenzüge werden aufgezeichnet. Die Aufnahme
      zählt als Nachweis — und hilft uns, die Aufgaben weiterzuentwickeln.</span></div>
    <div class="wahl" data-a="0"><b>Nein, ohne Aufnahme</b>
      <span>Die Aufgabe läuft genau gleich. Es wird nichts aufgezeichnet.</span></div>`,

    nie: `<div class="wahl" data-a="0"><b>Los geht's</b>
      <span>Es wird nichts aufgezeichnet.</span></div>`,

    /* PRUEFEN: Der Satz zur Nachweisregel fehlt hier bewusst. Er kommt
       aus dem Thema ueber `D.nachweis` - und fuer Fassung B ist er noch
       nicht entschieden: «Vier Meilensteine, drei davon mit mir» geht
       nicht auf, wenn jemand drei allein nachholt. Siehe thema.md. */
    immer: `<div class="wahl" data-a="1"><b>Los geht's — mit Aufnahme</b>
      <span>Ihr Gespräch und Ihre Kartenzüge werden aufgezeichnet. Am Ende
      speichern Sie beides und geben es ab. So sehe ich, worüber Sie
      gesprochen haben, bevor wir uns treffen.</span></div>`
  }[AUFNAHMEWEISE] || '';

  document.getElementById('buehne').innerHTML=`<div class="start">
    ${einstieg}
    ${mitte}
    <p class="hinweis">${D.nachweis || NACHWEIS_DZ}</p></div>`;

  document.querySelectorAll('.wahl').forEach(w=>w.onclick=()=>{
    stand.aufnahme = w.dataset.a==='1'; stand.etappe=0;
    if (stand.aufnahme) mikrofonprobe(); else los(); });
}

/* Mikrofonprobe: erst zeigen, dass es geht - dann erst aufnehmen. Ohne
   diesen Schritt merkt eine Gruppe erst hinterher, dass nichts ankam. */
function mikrofonprobe(){
  document.getElementById('buehne').innerHTML = `<div class="start">
    <h2>Kurze Mikrofonprobe</h2>
    <p style="color:var(--matt)">Sprechen Sie bitte einen Satz. Wenn der
       Balken ausschlägt, hört das Gerät Sie.</p>
    <div style="height:16px;border:1px solid var(--linie);border-radius:9px;
                background:var(--karte);overflow:hidden;margin:16px 0">
      <div id="pegel" style="height:100%;width:0;background:var(--zugang);
           transition:width .08s"></div></div>
    <p id="pstatus" style="color:var(--matt);font-size:14px">Zugriff wird angefragt …</p>
    <p style="color:var(--matt);font-size:14px;margin-top:12px">Reden Sie
       miteinander — zu zweit oder zu dritt ist das leichter. Wenn Sie allein
       arbeiten, sprechen Sie bitte trotzdem aus, was Sie überlegen: Eine
       stumme Aufnahme zeigt nichts.</p>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="knopf" id="losgehts" disabled>Aufnahme starten und beginnen</button>
      <button class="knopf leer" id="ohnedoch">Doch ohne Aufnahme</button></div>
    <p class="hinweis">Es wird nichts hochgeladen. Am Ende speichern Sie Ton und
       Verlauf selbst — die Ablage richten wir später ein.</p></div>`;
  let probe = null;
  const balken = document.getElementById('pegel');
  const status = document.getElementById('pstatus');
  Aufnahme.probe(p => { balken.style.width = Math.round(p*100)+'%'; })
    .then(pr => { probe = pr;
      status.textContent = 'Das Mikrofon ist bereit.';
      document.getElementById('losgehts').disabled = false; })
    .catch(e => { status.textContent =
      'Kein Zugriff auf das Mikrofon. Sie können ohne Aufnahme weiterarbeiten.'; });
  document.getElementById('losgehts').onclick = async ()=>{
    const spur = probe ? probe.spur : null;
    if (probe) probe.stopp();
    await Aufnahme.starten(spur);
    Aufnahme.merken('etappe', {nr: 1});
    los();
  };
  const ohne = document.getElementById('ohnedoch');
  if (ohne) ohne.onclick = ()=>{
    if (probe) { probe.stopp(); probe.spur.getTracks().forEach(t=>t.stop()); }
    stand.aufnahme = false; los();
  };
}

/* ───────── Die Sprechblase ─────────

   FEHLERBEHOBEN (2026-08-21, Rikes Rueckmeldung «kann man nicht lesen,
   wenn die Karte falsch liegt»): Die Blase steckte IN der Karte und
   damit in der rollenden Haelfte. Wer eine Karte am linken Rand der
   rechten Haelfte liegen hatte, sah nur einen Streifen davon - das
   Zurechtruecken half nicht, weil der Rahmen selbst zu eng war.

   Ursache und Behebung: Die Blase haengt jetzt am <body> und steht
   position:fixed. Damit kann sie ueberhaupt nicht mehr beschnitten
   werden, und sie erbt auch den Massstab der Lupe nicht mehr - das war
   der Grund, aus dem das Darueberfahren im Juli abgeschaltet wurde.
   Beides faellt mit demselben Umbau weg. */
let _blase = null;

function blaseOeffnen(m, fest){
  if (m.classList.contains('offen')){
    if (fest) m.dataset.fest = '1';
    return;
  }
  blasenSchliessen();
  m.classList.add('offen');
  if (fest) m.dataset.fest = '1';
  const bl = document.createElement('div');
  bl.className = 'blase';
  bl.innerHTML = m._titel;
  // Die Kapitelfarbe steht auf dem <html>-Element; am <body> haengend
  // erbt die Blase sie weiterhin.
  document.body.appendChild(bl);
  _blase = bl;
  blasePlatzieren(bl, m);
}

/* Unter der Marke, und wenn dort kein Platz ist, darueber. Gerechnet
   wird gegen das FENSTER, nicht gegen die Haelfte - die Blase liegt
   nicht mehr darin. */
function blasePlatzieren(bl, m){
  const r = m.getBoundingClientRect(), rand = 8;
  bl.style.left = r.left + 'px';
  bl.style.top  = (r.bottom + 7) + 'px';
  const b = bl.getBoundingClientRect();
  if (b.right > window.innerWidth - rand)
    bl.style.left = Math.max(rand, window.innerWidth - rand - b.width) + 'px';
  if (b.left < rand) bl.style.left = rand + 'px';
  if (b.bottom > window.innerHeight - rand)
    bl.style.top = Math.max(rand, r.top - 7 - b.height) + 'px';
}

/* Blase zu, und die Karte faellt in ihre Ebene zurueck. */
function blasenSchliessen(){
  if (_blase){ _blase.remove(); _blase = null; }
  document.querySelectorAll('.marke.offen').forEach(o => {
    o.classList.remove('offen');
    delete o.dataset.fest;
    const k = o.closest('.k');
    if (k && k._zVorBlase !== undefined){
      k.style.zIndex = k._zVorBlase;
      delete k._zVorBlase;
    }
  });
}

/* Ein Klick irgendwo sonst schliesst die festgehaltene Blase. Ohne das
   bliebe sie stehen und verdeckte die Karten darunter. */
document.addEventListener('click', blasenSchliessen);
/* Beim Rollen und beim Groesseumstellen wandert die Marke unter der
   Blase weg. Dann ist Schliessen ehrlicher als Nachfuehren. */
window.addEventListener('resize', blasenSchliessen);
document.addEventListener('scroll', blasenSchliessen, true);

/* ───────── Die Bilder zum Mitnehmen ─────────

   NEU (2026-09-08, Rikes Auftrag): «Es waere schon wichtig, dass die
   Studierenden am Ende ein Bild von der fertigen Sortierflaeche fuer
   alle drei Etappen bekommen, damit sie ihre Ablage dieser Sortierung
   noch mal mitnehmen koennen als Erkenntnis.»

   Anlass ist Fassung A: Dort wird nicht aufgenommen, es entsteht also
   kein Paket, in dem die Bilder ohnehin laegen. «Stand als Bild
   sichern» gibt es zwar in der Leiste - aber als Knopf, an den jemand
   denken muss, und beim Wechsel in die naechste Etappe ist die vorige
   Buehne fort.

   Deshalb: beim Verlassen einer Etappe still sammeln, am Ende in einem
   Zug anbieten. Am gemeinsamen Brett nimmt so JEDE Person ihre eigene
   Kopie mit, ohne dass jemand sie herumschicken muss.

   Ein Thema bestellt es ueber `D.mitnehmen`. Sagt es nichts, wird nichts
   gesammelt und die Steuerleiste bleibt, wie sie war - «Daten und
   Zufall» merkt von alldem nichts. */
const MITNEHMEN = !!D.mitnehmen;
const mitbringsel = {};      // Etappennummer -> Versprechen auf eine Leinwand
let _gezeigt = null;         // welche Etappe steht gerade auf der Buehne

function bildSammeln(){
  if (!MITNEHMEN || _gezeigt === null) return;
  // Eine Buehne ohne Karten ist nichts wert - etwa wenn jemand eine
  // Etappe nur kurz aufschlaegt und gleich weiterklickt.
  if (!document.querySelector('.buehne .k')) return;
  mitbringsel[_gezeigt + 1] = standAlsLeinwand();
}

const _dateiname = (D.stueck || 'sortierung')
  .replace(/[^0-9A-Za-zÄÖÜäöü]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

function mitnehmen(){
  const nummern = Object.keys(mitbringsel).map(Number).sort((a,b)=>a-b);
  const b = document.getElementById('buehne');

  if (!nummern.length){
    b.innerHTML = `<div class="start">
      <h2>Noch nichts zum Mitnehmen</h2>
      <p class="lage">Sobald Sie eine Etappe bearbeitet haben, entsteht hier
         ein Bild Ihrer Sortierung. Gehen Sie oben auf eine Etappe zurück.</p></div>`;
    return;
  }

  /* GEAENDERT (2026-09-10, Rikes Auftrag): Hier stand nur eine Zeile mit
     den Etappennamen - «Etappe 1 · Etappe 2 · Etappe 3». Rike: «Es
     reicht keine Liste, denn sie haben das Bild in jeder Etappe im Kopf,
     und wir sollten dafuer sorgen, dass es einen Wiedererkennungswert
     gibt.» Also stehen die Bilder selbst hier, untereinander und in
     voller Breite - dasselbe Bild, das auch gespeichert wird. Man sieht
     vor dem Speichern, was man bekommt, und erkennt die eigene Arbeit
     wieder. */
  b.innerHTML = `<div class="start mitnehmen">
    <h2>Nehmen Sie Ihre Sortierung mit</h2>
    <p class="lage">Von ${nummern.length === 1 ? 'Ihrer Etappe' :
      'jeder der ' + nummern.length + ' Etappen'} ist ein Bild entstanden —
      so, wie Sie die Karten am Ende gelegt haben, vollständig und nicht
      nur der Bildschirmausschnitt. Für Ihre Notizen — ${nummern.length > 1
        ? 'als ein PDF mit einer Seite je Etappe' : 'als PDF'}.</p>
    <div style="display:flex;gap:10px;margin:18px 0 4px">
      <button class="knopf" id="holen">${nummern.length > 1
        ? 'Alles mitnehmen' : 'Bild speichern'}</button></div>
    <p class="hinweis">Die Bilder bleiben auf Ihrem Rechner. Es wird nichts
       hochgeladen und nichts an uns gesendet.</p>
    <div class="schau" id="schau">${nummern.map(n=>
      `<figure data-nr="${n}"><figcaption>Etappe ${n}</figcaption>
         <div class="platz">wird gezeichnet …</div></figure>`).join('')}</div>
  </div>`;

  /* Die Bilder nachtragen, sobald sie fertig sind. Sie entstehen als
     Zusagen beim Verlassen jeder Etappe (bildSammeln); hier wird nur
     gewartet und eingehaengt - der Text steht schon, damit die Seite
     nicht leer beginnt. */
  nummern.forEach(async n=>{
    const c = await mitbringsel[n];
    const platz = b.querySelector(`figure[data-nr="${n}"] .platz`);
    if (!platz) return;
    if (!c){ platz.textContent = 'Für diese Etappe ist kein Bild entstanden.'; return; }
    const im = new Image();
    im.src = c.toDataURL('image/png');
    im.alt = 'Ihre Sortierung in Etappe ' + n;
    platz.replaceWith(im);
  });

  const knopf = document.getElementById('holen');
  knopf.onclick = async ()=>{
    knopf.disabled = true; knopf.textContent = 'Wird vorbereitet …';
    const leinwaende = await Promise.all(nummern.map(n=>mitbringsel[n]));
    const bilder = [];
    for (let i = 0; i < nummern.length; i++){
      if (!leinwaende[i]) continue;
      bilder.push({nr: nummern[i], blob: await new Promise(f=>
        leinwaende[i].toBlob(f, 'image/png'))});
    }
    /* GEAENDERT (2026-09-10, Rikes Frage nach dem mehrseitigen PDF):
       Erst das PDF, dann die alten Wege. Die Reihenfolge ist die
       Rangfolge - eine Datei, die sich ueberall mit einem Tipp oeffnet,
       schlaegt eine ZIP, und die schlaegt drei Einzeldownloads.

       Der Rueckfall bleibt vollstaendig stehen: Wo der Browser kein
       CompressionStream hat, gibt es weiter das, was es gestern gab.
       Ein Knopf, der auf einem alten Geraet gar nichts tut, waere
       schlimmer als eine ZIP. */
    let fertig = false;
    try {
      const pdf = await _pdfBauen(
        nummern.map((n, i) => ({nr: n, leinwand: leinwaende[i]}))
               .filter(x => x.leinwand),
        document.title);
      if (pdf){ _herunterladen(pdf, _dateiname + '.pdf'); fertig = true; }
    } catch (e){
      // Nicht still scheitern: Wer das hier liest, soll sehen, warum
      // der alte Weg genommen wurde.
      console.warn('PDF nicht gebaut, es gilt der Rueckfall:', e);
    }

    // Ein Paket, wenn paket.js dabei ist - sonst die Bilder einzeln.
    // Drei Downloads hintereinander bremsen manche Browser aus; eine
    // ZIP ist die eine Datei, die die Gruppe wirklich behaelt.
    const P = window.SORT_PAKET;
    if (fertig){
      /* nichts weiter - das PDF ist unterwegs */
    } else if (P && bilder.length > 1){
      const dateien = [];
      for (const bi of bilder)
        dateien.push({name: 'etappe-' + bi.nr + '.png',
                      daten: await P.zuBytes(bi.blob)});
      _herunterladen(P.zip(dateien), _dateiname + '_bilder.zip');
    } else {
      for (const bi of bilder)
        _herunterladen(bi.blob, _dateiname + '_etappe-' + bi.nr + '.png');
    }
    knopf.disabled = false;
    knopf.textContent = 'Gespeichert ✓ — nochmals speichern';
  };
}

/* ───────── Die Kopier-Geste ─────────

   NEU (2026-09-10, Rikes Rueckmeldung): «Im Moment haben wir so ein +
   und koennen die Karten kuenstlich verdoppeln. Das ist muehsam.»

   Statt vorher zu verdoppeln, ist die GESTE die Kopie: Wer eine Karte
   nach rechts zieht, legt dort eine Kopie ab; die Vorratskarte bleibt
   liegen. Wer eine Kopie zurueck auf den Tisch zieht, legt sie weg.

   Es war nicht nur muehsam, es war die falsche Reihenfolge: Ob eine
   Karte auch in eine ZWEITE Gruppe gehoert, merkt man erst, wenn sie in
   der ersten liegt. Wer sich vorher entscheiden muss, entscheidet blind.

   Durchgesetzt wird EINE Regel:

     Karten OHNE «#» sind Vorratskarten und liegen immer auf dem Tisch.
     Karten MIT «#» sind Kopien und liegen immer in einem Zielfeld.

   Daraus folgt beides von selbst - auch der Rueckweg, den es vorher gar
   nicht gab (eine Kopie auf dem Tisch war ein Doppelgaenger, den niemand
   mehr von der Vorratskarte unterscheiden konnte).

   Zweimal in DASSELBE Feld geht nicht: Die Vorratskarte kehrt
   kommentarlos zurueck. Sonst laege dieselbe Karte doppelt in einer
   Gruppe - und «Pruefen» zaehlte sie beide als richtig und meldete mehr
   Treffer, als es Karten gibt.

   STEHT HIER UND NICHT IM KAPITEL, weil vier Kapitel sie brauchen. Die
   erste Fassung stand zweimal in ergebnismengen/etappen.js; ein drittes
   und viertes Abschreiben waere der Fehler von «Faktorisieren 2»
   gewesen. Was je Kapitel verschieden ist, kommt als Beipack:

     tisch, feld   die beiden Blaetter
     els           {id: Element} des Kapitels - wird mitgepflegt
     bauen(id)     baut eine Karte samt allem, was das Kapitel anhaengt
     ziele()       die Elemente, die als «sortiert» gelten
     mit(alt,neu)  optional: was beim Umtaufen mitwandern muss
                   (in Kapitel 2 der geschriebene Teilmengentext)

   Liefert true, wenn sich etwas geaendert hat - dann muss der Stand neu
   gemerkt werden. */
/* Eine kurze Meldung, die sich selbst wieder wegraeumt.

   NEU (2026-09-18). Gebraucht ueberall dort, wo die Flaeche eine Geste
   ABLEHNT: Eine abgelehnte Geste, die nichts sagt, ist von einem Fehler
   nicht zu unterscheiden.

   Sie haengt an `body` und liegt `fixed` - damit ist sie unabhaengig
   davon, ob das Feld darunter scrollt, und sie kann nicht an einer
   Kante abgeschnitten werden. Immer nur EINE gleichzeitig: Zwei
   Meldungen uebereinander waeren wieder Laerm.

   `zeigen` bekommt optional die Karte, um die es geht - sie blinkt kurz
   mit, damit man sieht, WELCHE schon da liegt. */
let _hinweisUhr = null;
function hinweisWeg(){
  const alt = document.getElementById('kurzhinweis');
  if (alt) alt.remove();
  if (_hinweisUhr){ clearTimeout(_hinweisUhr); _hinweisUhr = null; }
  document.querySelectorAll('.k.schondrin')
    .forEach(k => k.classList.remove('schondrin'));
}
function kurzerHinweis(text, bei, hervor){
  hinweisWeg();

  const d = document.createElement('div');
  d.id = 'kurzhinweis'; d.className = 'kurzhinweis'; d.textContent = text;
  document.body.appendChild(d);
  const r = (bei && bei.getBoundingClientRect) ? bei.getBoundingClientRect() : null;
  const b = d.getBoundingClientRect();
  if (r){
    d.style.left = Math.max(8, Math.min(r.left + r.width/2 - b.width/2,
                                        window.innerWidth - b.width - 8)) + 'px';
    d.style.top  = Math.max(8, r.top - b.height - 8) + 'px';
  }
  if (hervor) hervor.classList.add('schondrin');
  _hinweisUhr = setTimeout(hinweisWeg, 2200);
}

function kopierGeste({tisch, els, bauen, ziele, mit}){
  const grund = id => id.split('#')[0];
  let geaendert = false;

  // Eine Kopie auf dem Tisch heisst: weggelegt.
  [...tisch.querySelectorAll(':scope > .k')].forEach(el=>{
    const id = el.dataset.id;
    if (!id.includes('#')) return;
    if (mit) mit(id, null);
    delete els[id];
    el.remove();
    geaendert = true;
  });

  // Eine Vorratskarte in einem Zielfeld heisst: hier soll eine Kopie
  // liegen. Die gezogene Karte BLEIBT liegen und wird zur Kopie
  // umgetauft - so bleibt sie, wo die Hand sie hingelegt hat -, und der
  // Vorrat wird an ihrem alten Platz neu aufgelegt.
  ziele().forEach(kasten=>{
    if (!kasten) return;
    [...kasten.querySelectorAll(':scope > .k')].forEach(el=>{
      const id = el.dataset.id;
      if (id.includes('#')) return;
      // _heim merkt sich ziehbar() beim Anfassen: der Platz, von dem
      // die Karte kam.
      const h = el._heim || {x:0, y:0, rot:0};
      const doppelt = [...kasten.querySelectorAll(':scope > .k')]
        .some(k => k !== el && grund(k.dataset.id) === id);
      if (!doppelt){
        const kid = id + '#' + (++stand.dupl);
        el.dataset.id = kid;
        els[kid] = el; delete els[id];
        if (mit) mit(id, kid);
        const vorrat = bauen(id);
        els[id] = vorrat;
        tisch.appendChild(vorrat);
        vorrat._x = h.x; vorrat._y = h.y; vorrat._rot = h.rot; pos(vorrat);
      } else {
        /* NEU (2026-09-18, Rikes Entscheidung nach ihrem eigenen
           Schrecken an der veroeffentlichten Fassung): Bis hierher ist
           alles richtig - dieselbe Karte darf nicht zweimal in dasselbe
           Feld, eine Ergebnismenge liegt nicht zweimal in derselben
           Situation. Aber es GESCHAH WORTLOS: Die Karte sprang zurueck
           auf den Tisch, und das sieht aus wie «hakt, nimmt nichts mehr
           an». Rike hat genau daraus geschlossen, in ein Feld passten
           nur zwei Karten, und wir haben zwanzig Minuten an einem
           Fehler gesucht, den es nicht gab.

           Die Regel bleibt. Sie sagt jetzt nur, dass es sie gibt - und
           zeigt auf die Karte, die schon da liegt. */
        const schon = [...kasten.querySelectorAll(':scope > .k')]
          .find(k => k !== el && grund(k.dataset.id) === id);
        tisch.appendChild(el);
        el._x = h.x; el._y = h.y; el._rot = h.rot; pos(el);
        kurzerHinweis('Diese Karte liegt hier schon.', schon || kasten, schon);
      }
      geaendert = true;
    });
  });
  return geaendert;
}

/* ───────── Ein mehrseitiges PDF statt einer ZIP ─────────

   NEU (2026-09-10, Rikes Frage «mehrseitiges PDF ... was meinst du,
   besser als ZIP mit PNGs?»). Ja, aus drei Gruenden, und keiner davon
   ist Geschmack:

     Eine ZIP muss man ENTPACKEN. Auf iPad und Handy ist das eine echte
     Huerde, und darauf arbeiten viele.

     «Fuer Ihre Notizen» heisst ablegen, wiederfinden, ausdrucken, in
     OneNote ziehen. Das kann ein PDF, ein Ordner mit etappe-1.png
     nicht.

     In der STUDIERENDENFASSUNG gibt es die ZIP ohnehin nicht:
     `paket.js` wird nur in die Rueckmeldungsfassung eingebunden. Dort
     fielen bisher drei einzelne Downloads an - und der Vermerk unten
     sagt selbst, dass manche Browser das ausbremsen. Deshalb steht der
     PDF-Bau HIER und nicht in paket.js.

   Verlustfrei, nicht als JPEG: Die Bilddaten gehen als /FlateDecode
   hinein, also mit demselben Verfahren wie in einer PNG-Datei. Den
   Packer stellt der Browser (CompressionStream); eine Bibliothek waere
   dafuer nicht noetig und ist deshalb auch nicht dabei. Wo es ihn nicht
   gibt, faellt der Knopf auf den alten Weg zurueck - lieber eine ZIP als
   gar nichts.

   Kein eingebettetes Schriftbild: Die Kopfzeile nutzt Helvetica, eine
   der vierzehn Schriften, die jedes PDF-Programm mitbringt. Deshalb
   WinAnsi und Latin-1-Bytes - «Etappe» und Umlaute kommen damit aus,
   und das PDF bleibt bei wenigen hundert Kilobyte. */
async function _flate(bytes){
  const strom = new Blob([bytes]).stream()
    .pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(strom).arrayBuffer());
}

/* Die Leinwand auf WEISS legen, bevor die Bytes gelesen werden. Ohne
   das wuerde jede durchsichtige Stelle schwarz: Wir werfen den
   Alphakanal weg, und RGB(0,0,0) ist genau das, was unter einem
   unbemalten Pixel steht. */
function _rgbBytes(leinwand){
  const c = document.createElement('canvas');
  c.width = leinwand.width; c.height = leinwand.height;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(leinwand, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const rgb = new Uint8Array(c.width * c.height * 3);
  for (let i = 0, j = 0; i < d.length; i += 4){
    rgb[j++] = d[i]; rgb[j++] = d[i+1]; rgb[j++] = d[i+2];
  }
  return rgb;
}

async function _pdfBauen(bilder, titel){
  if (typeof CompressionStream === 'undefined') return null;

  const LANG = 841.89, KURZ = 595.28;     // A4 in Punkten
  const RAND = 30, KOPF = 18;
  const teile = [];
  const platz = [];                        // Byteposition je Objektnummer
  let laenge = 0;

  // Latin-1: ein Zeichen, ein Byte. Genau das erwartet WinAnsiEncoding.
  const roh = t => { const u = new Uint8Array(t.length);
                     for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i) & 0xFF;
                     return u; };
  const schreib = x => { const u = (typeof x === 'string') ? roh(x) : x;
                         teile.push(u); laenge += u.length; };
  const objekt = (nr, kopf, strom) => {
    platz[nr] = laenge;
    schreib(nr + ' 0 obj\n' + kopf + '\n');
    if (strom){ schreib('stream\n'); schreib(strom); schreib('\nendstream\n'); }
    schreib('endobj\n');
  };
  /* FEHLERBEHOBEN (2026-09-10, beim Nachmessen aufgefallen): Hier stand
     nur das Maskieren der Klammern. Der Seitentitel traegt aber einen
     GEDANKENSTRICH - «Reflexion — Kapitel 2» -, und `charCodeAt & 0xFF`
     machte daraus Byte 0x14, ein Steuerzeichen. Im PDF stand dann
     «Etappe 1 ? Reflexion ? Kapitel 2».
     Latin-1 und WinAnsi sind eben nur von 0xA0 aufwaerts gleich: Was
     Unicode oberhalb von 0xFF fuehrt, legt WinAnsi in die Luecke von
     0x80 bis 0x9F. Diese Tabelle bildet genau die Zeichen ab, die in
     unseren Titeln vorkommen koennen; alles Uebrige wird zum
     Bindestrich, statt als Steuerzeichen durchzurutschen. */
  const WINANSI = {
    '€':0x80, '‚':0x82, 'ƒ':0x83, '„':0x84, '…':0x85,
    '†':0x86, '‡':0x87, 'ˆ':0x88, '‰':0x89, 'Š':0x8A,
    '‹':0x8B, 'Œ':0x8C, 'Ž':0x8E, '‘':0x91, '’':0x92,
    '“':0x93, '”':0x94, '•':0x95, '–':0x96, '—':0x97,
    '˜':0x98, '™':0x99, 'š':0x9A, '›':0x9B, 'œ':0x9C,
    'ž':0x9E, 'Ÿ':0x9F};
  const klar = t => String(t).split('').map(z => {
    if (z.charCodeAt(0) > 0xFF)
      z = (z in WINANSI) ? String.fromCharCode(WINANSI[z]) : '-';
    return /[\\()]/.test(z) ? '\\' + z : z;
  }).join('');

  schreib('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Erst die Seiten vorbereiten - die Objektnummern stehen damit fest,
  // bevor das Seitenverzeichnis geschrieben wird.
  const vor = [];
  for (const bi of bilder){
    const rgb = _rgbBytes(bi.leinwand);
    vor.push({nr: bi.nr, b: bi.leinwand.width, h: bi.leinwand.height,
              daten: await _flate(rgb)});
  }
  const seiteNr = i => 4 + i * 3;
  const kinder = vor.map((_, i) => seiteNr(i) + ' 0 R').join(' ');

  objekt(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objekt(2, `<< /Type /Pages /Kids [${kinder}] /Count ${vor.length} >>`);
  objekt(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica'
          + ' /Encoding /WinAnsiEncoding >>');

  vor.forEach((v, i) => {
    const quer = v.b > v.h;
    const pb = quer ? LANG : KURZ, ph = quer ? KURZ : LANG;
    const skala = Math.min((pb - 2 * RAND) / v.b,
                           (ph - 2 * RAND - KOPF) / v.h);
    const bb = v.b * skala, bh = v.h * skala;
    const bx = (pb - bb) / 2, by = (ph - RAND - KOPF - bh + RAND) / 2;
    const kopfzeile = `Etappe ${v.nr}${titel ? ' — ' + titel : ''}`;
    const inhalt =
      `BT /F1 9 Tf 0.42 0.40 0.38 rg ${RAND} ${(ph - RAND).toFixed(2)} Td `
      + `(${klar(kopfzeile)}) Tj ET\n`
      + `q ${bb.toFixed(2)} 0 0 ${bh.toFixed(2)} ${bx.toFixed(2)} `
      + `${by.toFixed(2)} cm /Im0 Do Q\n`;
    const nr = seiteNr(i);
    objekt(nr,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pb.toFixed(2)} ${ph.toFixed(2)}]`
      + ` /Resources << /XObject << /Im0 ${nr + 2} 0 R >> /Font << /F1 3 0 R >> >>`
      + ` /Contents ${nr + 1} 0 R >>`);
    objekt(nr + 1, `<< /Length ${inhalt.length} >>`, inhalt);
    objekt(nr + 2,
      `<< /Type /XObject /Subtype /Image /Width ${v.b} /Height ${v.h}`
      + ` /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`
      + ` /Length ${v.daten.length} >>`, v.daten);
  });

  // Die Querverweistabelle. Jeder Eintrag ist auf das Byte genau
  // zwanzig Zeichen lang - deshalb wurde oben mitgezaehlt.
  const anzahl = 3 + vor.length * 3;
  const xref = laenge;
  let t = `xref\n0 ${anzahl + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= anzahl; n++)
    t += String(platz[n]).padStart(10, '0') + ' 00000 n \n';
  schreib(t);
  schreib(`trailer\n<< /Size ${anzahl + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  return new Blob(teile, {type: 'application/pdf'});
}

function _herunterladen(blob, name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 6000);
}


/* ───────── Steuerung ───────── */
function nav(){
  const n=document.getElementById('nav'); n.innerHTML='';
  // Die Zahl der Etappen sagt das Kapitel, nicht diese Datei.
  const namen = ['Start', ...ETAPPEN.map((_,i)=>'Etappe '+(i+1))];
  // Der Schlussbildschirm haengt hinten dran, nicht in der Flaeche
  // drin: Er ist kein Arbeitsschritt, sondern der Ausgang.
  if (MITNEHMEN) namen.push('Mitnehmen');
  namen.forEach((t,i)=>{
    const b=document.createElement('button'); b.textContent=t;
    b.setAttribute('aria-current', stand.aufnahme===null ? i===0 : i===stand.etappe+1);
    b.onclick=()=>{ if(i===0){ bildSammeln(); _gezeigt=null;
                              stand.aufnahme=null; startfeld(); }
                    else {stand.etappe=i-1;los();} nav(); };
    n.appendChild(b);
  });
}
/* ───────── Was ein Neuladen überlebt ─────────
   NEU (2026-09-10, Rikes Auftrag nach dem ersten Einsatz): «Etlichen
   ist passiert, dass sie die Seite refreshed haben und alles von vorher
   war weg.» Der Stand lag nur im Arbeitsspeicher; ein Neuladen, ein
   versehentlich geschlossener Tab, ein Absturz - und die Sortierung
   einer ganzen Doppelstunde war fort.

   PIA hat fuer dasselbe Problem `Speicher` in
   `pruefungen/gemeinsam/aufnahme.js`: IndexedDB, laufendes
   Zwischensichern, beim naechsten Oeffnen ein Angebot fortzufahren. Der
   AUFBAU ist von dort uebernommen, die Technik nicht - PIA begruendet
   IndexedDB in der Datei selbst mit der Groesse der Tonaufnahmen («ein
   zweistuendiges Paket hat 180 MB»). Kaspers Stand ist Text und wenige
   Kilobyte gross; localStorage genuegt, ist synchron und hat keinen
   Fehlerpfad, den man verwalten muss.

   Rikes Entscheidung zum Verhalten: STUMM weitermachen, kein Dialog.
   «Wenn jemand wirklich aufräumen will, haben wir ja den ↺-Knopf - aber
   dann mit Absicht.» Wer versehentlich neu geladen hat, soll vom Unfall
   gar nichts merken.

   Drei Dinge kommen bewusst NICHT zurueck:

     Die AUFNAHME, wenn sie lief. Der Ton ist mit dem Neuladen ohnehin
     abgebrochen; wuerde `stand.aufnahme = true` wiederhergestellt,
     liefe die Flaeche weiter, als werde aufgenommen, und niemand
     merkte, dass nichts mehr mitlaeuft - und am Nachweis haengt etwas.
     Deshalb wird in diesem einen Fall das Startfeld gezeigt: Die
     Sortierung ist da, ueber die Aufnahme wird neu entschieden. Wer
     ohne Aufnahme arbeitet, kommt vollstaendig stumm zurueck.

     Die LOESUNG. Sie gehoert der Kontrollfassung und ist ein
     Anzeigezustand, kein Arbeitsstand; zurueckzukommen und die Loesung
     offen vorzufinden, waere ein Schreck.

     Ein Stand, der aelter als zwoelf Stunden ist. Er deckt eine
     Sitzung ab. Am selben Rechner arbeitet naechste Woche eine andere
     Gruppe, und die soll nicht die Sortierung der vorigen erben. */
const _SPEICHER = 'kasper:' + (D.stueck || D.kapitel || location.pathname);
const _HALTBAR = 12 * 3600 * 1000;

function sichern(){
  try {
    const kopie = Object.assign({}, stand);
    delete kopie.loesungOffen;
    delete kopie._loesungSicherung;
    delete kopie._loesungAktiv;
    localStorage.setItem(_SPEICHER,
      JSON.stringify({zeit: Date.now(), stand: kopie}));
  } catch(_) { /* privates Fenster, voller Speicher - dann eben nicht */ }
}

function _wiederaufnehmen(){
  let paket = null;
  try { paket = JSON.parse(localStorage.getItem(_SPEICHER) || 'null'); }
  catch(_) { paket = null; }
  if (!paket || !paket.stand || typeof paket.stand !== 'object') return;
  if (!paket.zeit || Date.now() - paket.zeit > _HALTBAR){
    try { localStorage.removeItem(_SPEICHER); } catch(_) {}
    return;
  }
  Object.assign(stand, paket.stand);
  stand.loesungOffen = false;
  stand._loesungSicherung = {};
  stand._loesungAktiv = false;
  // Lief eine Aufnahme, wird neu gefragt - siehe oben.
  if (stand.aufnahme === true) stand.aufnahme = null;
}

let _wiederaufgenommen = false;

/* Getipptes laeuft NICHT ueber merken(): Gruppennamen, Teilmengen und
   beschreibbare Karten schreiben direkt in den Stand. Deshalb sichert
   die Uhr zusaetzlich mit - und beim Verlassen der Seite ein letztes
   Mal. `pagehide` neben `beforeunload`, weil Mobilbrowser das eine
   auslassen und das andere nicht. */
setInterval(sichern, 4000);
window.addEventListener('beforeunload', sichern);
window.addEventListener('pagehide', sichern);

function los(){
  if (!_wiederaufgenommen){ _wiederaufgenommen = true; _wiederaufnehmen(); }
  // Kapitelfarbe einmal setzen. Faellt sie aus, bleibt der Grundwert
  // aus dem CSS stehen, statt dass die Flaeche farblos wird.
  document.body.dataset.farbe = D.farbe || 'aktion';
  // Das Bild der Etappe, die gerade verlassen wird - VOR dem Austausch
  // der Buehne, solange die Karten noch stehen.
  bildSammeln();
  const schluss = stand.etappe >= ETAPPEN.length;
  if (window.Aufnahme && Aufnahme.laeuft && stand.aufnahme!==null && !schluss)
    Aufnahme.merken('etappe', {nr: stand.etappe+1});
  if (stand.aufnahme===null){ _gezeigt = null; startfeld(); }
  else if (schluss){ _gezeigt = null; mitnehmen(); }
  else { _gezeigt = stand.etappe; ETAPPEN[stand.etappe](); }
  nav();
  sichern();
}
