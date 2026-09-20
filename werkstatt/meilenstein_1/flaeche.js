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
    el._heim = {x: el._x, y: el._y, rot: el._rot};
    el._lupe = 1; el._zieht = true; el.classList.add('zieht');
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
      el.style.position = 'absolute'; el.style.left = ''; el.style.top = '';
      ablegen(el, ev.clientX, ev.clientY, heim);
    };
    window.addEventListener('pointermove', bewegen);
    window.addEventListener('pointerup', los);
  });
}
function unterCursor(x, y, wahl){
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(wahl) : null;
}
function zeigeZiel(x, y){
  document.querySelectorAll('.ueber').forEach(d=>d.classList.remove('ueber'));
  const z = unterCursor(x, y, '.paar,.feld:not(.neu),.feld.neu[data-ort=neuegruppe]');
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
  const blatt = unterCursor(x, y, '.blatt');

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
  const ziel = paar || feld || ablage;
  if (!ziel){ heimkehr(el, heim); return; }
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
  const noetig = oben + Math.ceil(karten.length / spalten) * (kh + 6) + 10;
  if (noetig > feldEl.offsetHeight) feldEl.style.height = noetig + 'px';
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
  const klein = kb * 0.60, kh = klein * 0.845;
  const links = kb * (kopfAnteil || 0.72) + 18;
  // NEU (2026-08-21): Eine Reihe kann ihren Kopf als KARTE tragen, nicht
  // nur als festes Bild. Kapitel 3 braucht das seit heute - dort wird
  // die Fragekarte selbst herübergezogen und ist dann der Kopf.
  // Sie liegt links, die uebrigen fliessen daneben.
  const alle = [...d.querySelectorAll(':scope > .k')];
  const kopf = alle.find(k => k.classList.contains('kopfkarte'));
  if (kopf){ kopf._rot = 0; kopf._x = 8; kopf._y = 8; pos(kopf); }
  const karten = alle.filter(k => k !== kopf);
  const platz = d.clientWidth - links - 10;
  const spalten = Math.max(1, Math.floor(platz / (klein + 6)));
  karten.forEach((k, i)=>{
    k._rot = 0;
    k._x = links + (i % spalten) * (klein + 6);
    k._y = 8 + Math.floor(i / spalten) * (kh + 6);
    pos(k);
  });
  const noetig = 16 + Math.max(1, Math.ceil(karten.length / spalten)) * (kh + 6);
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

function merken(){
  stand.karten = {};
  document.querySelectorAll('.k').forEach(k=>{
    const p = k.parentElement;
    stand.karten[k.dataset.id] = {
      ort: p.dataset.ort || 'tisch', x: k._x, y: k._y, rot: k._rot };
  });
  stand.geprueft = false;
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

function buehne(auftrag, links, rechts, leiste, extra, drittens){
  const b = document.getElementById('buehne');
  // Haken der vorigen Etappe loesen, sonst laeuft er in der naechsten
  // weiter und sucht Felder, die es dort nicht mehr gibt.
  window._nachAblegen = null;
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
  const gerollt = [wurzel, ...wurzel.querySelectorAll('*')].filter(e =>
    e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
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

  b.innerHTML = `<div class="start">
    <h2>Nehmen Sie Ihre Sortierung mit</h2>
    <p class="lage">Von ${nummern.length === 1 ? 'Ihrer Etappe' :
      'jeder der ' + nummern.length + ' Etappen'} ist ein Bild entstanden —
      so, wie Sie die Karten am Ende gelegt haben. Für Ihre Notizen.</p>
    <p class="frage">${nummern.map(n=>'Etappe '+n).join(' · ')}</p>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="knopf" id="holen">Bilder speichern</button></div>
    <p class="hinweis">Die Bilder bleiben auf Ihrem Rechner. Es wird nichts
       hochgeladen und nichts an uns gesendet.</p></div>`;

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
    // Ein Paket, wenn paket.js dabei ist - sonst die Bilder einzeln.
    // Drei Downloads hintereinander bremsen manche Browser aus; eine
    // ZIP ist die eine Datei, die die Gruppe wirklich behaelt.
    const P = window.SORT_PAKET;
    if (P && bilder.length > 1){
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
function los(){
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
}
