/* ============================================================
   PIA - Aufzeichnung

   Nach der Bauart von KASPER/bauen/aufnahme.js (Kopie in
   fremd/kasper/2026-08-21/), aber eigenständig: aufgezeichnet
   werden Eingabefelder, Klicks im Bild, Zeichenstriche und
   Seitenwechsel statt Kartenbewegungen, dazu die Kamera.

   Drei Spuren:
     Ereignisstrom  ~1,5 MB je Stunde
     Ton  32 kbit/s ~14 MB je Stunde
     Bild 360p/15   ~67 MB je Stunde

   ANMERKUNG (geklaert): Ton und Bild laufen in EINEM Aufnehmer und
   damit in einer Datei. Ein zweiter Aufnehmer waere zwei Dateien,
   die beim Abspielen erst wieder synchronisiert werden muessten.

   ANMERKUNG (geklaert, 2026-08-21): Es wird NICHT hochgeladen.
   SWITCHdrive nimmt kein PUT aus dem Browser entgegen - Rike hat es
   bei Kasper schon durchgespielt. Stattdessen laedt die Pruefungsseite
   am Schluss ein ZIP herunter, und die Studierenden legen es selbst in
   einen Abgabeordner. Der Weg dorthin steht in ablauf.js und folgt
   Kaspers Muster: speichern, Abgabefenster oeffnen, bestaetigen.

   ANMERKUNG (geklaert): Die Brocken bleiben deshalb bis zum Schluss
   liegen - bei zwei Stunden rund 180 MB. Damit daraus kein
   Speicherberg wird, geht JEDER BROCKEN ALS EIGENE DATEI ins ZIP:
   Seine Pruefsumme wird berechnet, sobald er anfaellt (er ist dann
   ein paar hundert Kilobyte gross), und am Schluss werden nur noch
   Kopfsaetze und Blobs aneinandergereiht. Nichts muss dafuer als
   Ganzes in den Speicher.

   Brocken 2 bis n sind fuer sich NICHT abspielbar - erst die
   Aneinanderreihung in der richtigen Reihenfolge ergibt die Datei.
   Deshalb traegt jeder Brocken eine laufende Nummer im Namen, und die
   Wiedergabe reiht sie danach wieder zusammen.
   ============================================================ */
(function(){
'use strict';

const CFG = Object.assign({
  // Freigabelink des Abgabeordners auf SWITCHdrive - einer, der Dateien
  // nur ENTGEGENNIMMT und nichts herausgibt. Er wird in einem eigenen
  // Fenster geoeffnet; hochgeladen wird von Hand. null = kein
  // Abgabeort, dann heisst es «geben Sie die Datei Ihrer Dozentin».
  ablage: null,
  brockenSekunden: 5,
  /* 640x480, 12 Bilder je Sekunde, 180 kbit/s.

     Die Kamera dient zwei Zwecken zugleich, und die Zahl ist der
     Ausgleich zwischen ihnen. Zum Abfotografieren eines Blattes gilt:
     Ein A4-Blatt formatfuellend ergibt bei 640 Pixeln Breite rund 30
     Pixel je Zentimeter, eine Handschriftzeile von einem halben
     Zentimeter ist also 15 Pixel hoch - lesbar. Bei 480 waeren es 11
     und damit grenzwertig.

     Zur Menge: Ton und Bild zusammen rund 93 MB je Stunde, also etwa
     140 MB fuer neunzig Minuten. Das ist von Hand hochzuladen. Bei
     960x720 waeren es 153 MB - schaerfer, aber nicht noetig.

     Wird es doch zu viel: die Rate senken, nicht die Aufloesung.
     Ein blockiges Gesicht bleibt erkennbar, ein zu kleines Blatt
     nicht lesbar. */
  bild: { breite: 640, hoehe: 480, bilder: 12, rate: 180000 },
  ton:  { rate: 32000 }
}, window.PIA_ABGABE || {});

const S = {
  sitzung: null, person: '', station: null,
  t0: 0, laeuft: false,
  ereignisse: [], brocken: [], brockenNr: 0,
  offen: 0, gescheitert: 0,
  spur: null, aufnehmer: null, mitBild: false,
  blaetter: 0,                    // abfotografierte oder angehaengte Blaetter
  behalten: []                    // nur wenn nicht hochgeladen wird
};

const WERKSTATT = new URLSearchParams(location.search).has('werkstatt');
const jetzt = () => Math.round(performance.now() - S.t0);

/* ============================================================
   Was einen Absturz überlebt

   Der Ereignisstrom lag bisher im localStorage, die Aufnahmestücke
   nur im Arbeitsspeicher. Ein abgestürzter Browser haette also das
   Protokoll gerettet und den Ton verloren - also das Wertlose
   behalten und das Wertvolle weggeworfen.

   Jetzt geht beides in die Datenbank des Browsers (IndexedDB),
   Stück fuer Stück, sobald es anfaellt. Die uebersteht Absturz,
   Neustart und Stromausfall. Beim naechsten Oeffnen bietet die
   Titelseite an, das Angefangene zu einem Paket zu schnueren.

   localStorage waere hier der falsche Ort: Er fasst rund 5 MB und
   nimmt nur Text. Ein zweistuendiges Paket hat 180 MB.
   ============================================================ */
const Speicher = (function(){
  const NAME = 'pia', FASSUNG = 1;
  let dbP = null;

  function db(){
    if (dbP) return dbP;
    dbP = new Promise((gut, schlecht) => {
      const a = indexedDB.open(NAME, FASSUNG);
      a.onupgradeneeded = () => {
        const d = a.result;
        if (!d.objectStoreNames.contains('stuecke'))
          d.createObjectStore('stuecke', { keyPath: 'schluessel' })
           .createIndex('sitzung', 'sitzung', { unique: false });
        if (!d.objectStoreNames.contains('staende'))
          d.createObjectStore('staende', { keyPath: 'sitzung' });
      };
      a.onsuccess = () => gut(a.result);
      a.onerror = () => schlecht(a.error);
    });
    return dbP;
  }

  function tun(laden, art, arbeit){
    return db().then(d => new Promise((gut, schlecht) => {
      const g = d.transaction(laden, art);
      const s = g.objectStore(laden);
      const a = arbeit(s);
      g.oncomplete = () => gut(a && a.result !== undefined ? a.result : undefined);
      g.onerror = () => schlecht(g.error);
    }));
  }

  return {
    /* Ein Aufnahmestueck sofort wegschreiben. */
    stueck: (sitzung, nr, name, blob, crc, groesse) =>
      tun('stuecke', 'readwrite', s => s.put({
        schluessel: sitzung + '#' + String(nr).padStart(5,'0'),
        sitzung: sitzung, nr: nr, name: name, blob: blob,
        crc: crc, groesse: groesse })),

    /* Kopfdaten und Ereignisstrom - wird laufend ueberschrieben. */
    stand: (sitzung, kopf, ereignisse) =>
      tun('staende', 'readwrite', s => s.put({
        sitzung: sitzung, kopf: kopf, ereignisse: ereignisse,
        gesichert: new Date().toISOString() })),

    staende: () => tun('staende', 'readonly', s => s.getAll()),
    stuecke: sitzung => tun('stuecke', 'readonly', s => s.getAll())
      .then(a => a.filter(x => x.sitzung === sitzung).sort((x,y) => x.nr - y.nr)),

    loeschen: async sitzung => {
      const alle = await tun('stuecke', 'readonly', s => s.getAll());
      await tun('stuecke', 'readwrite', s => {
        alle.filter(x => x.sitzung === sitzung).forEach(x => s.delete(x.schluessel));
      });
      await tun('staende', 'readwrite', s => s.delete(sitzung));
    }
  };
})();

function zeitcode(){
  const d = new Date(), z = n => String(n).padStart(2,'0');
  return d.getFullYear() + z(d.getMonth()+1) + z(d.getDate()) + '-' +
         z(d.getHours()) + z(d.getMinutes());
}

function merken(was, mehr){
  const e = Object.assign({ t: jetzt(), was: was }, mehr || {});
  S.ereignisse.push(e);
  if (S.ereignisse.length % 30 === 0) zwischensichern();
  return e;
}

/* Kopf und Ereignisstrom wegschreiben. Laeuft nebenher; scheitert
   es, wird die Pruefung deswegen nicht angehalten - die Daten sind
   dann nur nicht gesichert, und das faellt am Schluss auf. */
function zwischensichern(){
  if (!S.sitzung) return;
  try {
    Speicher.stand(S.sitzung, kopfdaten(), S.ereignisse)
      .catch(() => { S.sicherungFehlt = true; });
  } catch(e){ S.sicherungFehlt = true; }
}

function kopfdaten(){
  return {
    sitzung: S.sitzung, person: S.person, station: S.station,
    durchgang: S.durchgang || 1,
    begonnen: S.begonnen, dauer: jetzt(),
    mitBild: S.mitBild,
    brocken: S.brockenNr, brockenGescheitert: S.gescheitert,
    blaetter: S.blaetter,
    fenster: [innerWidth, innerHeight],
    browser: navigator.userAgent,
    fassung: 1
  };
}

/* ============================================================
   Geräte prüfen, bevor es losgeht
   ============================================================ */

async function probe(anzeigenPegel, videoElement){
  const wunsch = { audio: true };
  if (videoElement) wunsch.video = {
    width: { ideal: CFG.bild.breite }, height: { ideal: CFG.bild.hoehe },
    frameRate: { ideal: CFG.bild.bilder }
  };
  const spur = await navigator.mediaDevices.getUserMedia(wunsch);

  if (videoElement){
    videoElement.srcObject = spur;
    videoElement.muted = true;
    await videoElement.play().catch(()=>{});
  }

  const ktx = new (window.AudioContext || window.webkitAudioContext)();
  const quelle = ktx.createMediaStreamSource(spur);
  const messer = ktx.createAnalyser();
  messer.fftSize = 512;
  quelle.connect(messer);
  const daten = new Uint8Array(messer.frequencyBinCount);
  let an = true, hoechster = 0;
  (function messen(){
    if (!an) return;
    messer.getByteTimeDomainData(daten);
    let s = 0;
    for (const v of daten) s += (v-128)*(v-128);
    const p = Math.min(1, Math.sqrt(s/daten.length)/40);
    hoechster = Math.max(hoechster, p);
    if (anzeigenPegel) anzeigenPegel(p, hoechster);
    requestAnimationFrame(messen);
  })();

  return {
    spur: spur,
    hatBild: spur.getVideoTracks().length > 0,
    hoechsterPegel: () => hoechster,
    stopp(){ an = false; try{ ktx.close(); }catch(e){} }
  };
}

function typWaehlen(mitBild){
  const kandidaten = mitBild
    ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const t of kandidaten){
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

/* ============================================================
   Aufnehmen
   ============================================================ */

async function starten(o){
  const s = o || {};
  S.person    = s.person || '';
  S.station   = s.station || null;
  S.durchgang = s.durchgang || 1;
  S.sitzung   = 'S' + S.station + '-' + (s.kuerzel || 'anon') + '-' +
                zeitcode() + '-D' + S.durchgang;
  S.begonnen  = new Date().toISOString();
  S.spur      = s.spur || await navigator.mediaDevices.getUserMedia({audio:true});
  S.mitBild   = S.spur.getVideoTracks().length > 0;

  const typ = typWaehlen(S.mitBild);
  const einstellungen = { audioBitsPerSecond: CFG.ton.rate };
  if (S.mitBild) einstellungen.videoBitsPerSecond = CFG.bild.rate;
  if (typ) einstellungen.mimeType = typ;

  S.aufnehmer = new MediaRecorder(S.spur, einstellungen);
  S.aufnehmer.ondataavailable = e => {
    if (!e.data || !e.data.size) return;
    S.brockenNr++;
    brockenAbgeben(e.data, S.brockenNr);
  };
  S.aufnehmer.start(CFG.brockenSekunden * 1000);

  S.t0 = performance.now();
  S.laeuft = true;
  S.medienTyp = typ;
  merken('start', { station: S.station, durchgang: S.durchgang, mitBild: S.mitBild });

  /* Wer die Prüfung verlässt, hinterlässt eine Spur. Nicht als
     Sperre gedacht - als Angabe für die Beurteilung. */
  document.addEventListener('visibilitychange',
    () => merken(document.hidden ? 'weggeklickt' : 'zurueck'));
  addEventListener('beforeunload', e => {
    if (!S.laeuft) return;
    merken('fenster-schliesst');
    zwischensichern();
    e.preventDefault();
    e.returnValue = '';
  });
  return S.sitzung;
}

function endung(){
  const t = S.medienTyp || '';
  return t.indexOf('mp4') >= 0 ? (S.mitBild ? 'mp4' : 'm4a') : 'webm';
}

/* Ein Brocken wird sofort geprueft und weggelegt. Die Pruefsumme
   jetzt zu rechnen kostet nichts - der Brocken ist ein paar hundert
   Kilobyte gross und ohnehin schon im Speicher. Am Schluss waere die
   Rechnung ein Berg von 180 MB. */
async function brockenAbgeben(blob, nr){
  const name = S.sitzung + '_' + String(nr).padStart(4,'0') + '.' + endung();
  try {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const stueck = { name: name, blob: blob, crc: crc32(bytes), groesse: bytes.length };
    S.behalten.push(stueck);
    /* Und sofort auf die Platte - ab hier ueberlebt das Stueck einen
       Absturz. Scheitert es, laeuft die Aufnahme weiter; das Stueck
       liegt dann nur im Arbeitsspeicher. */
    Speicher.stueck(S.sitzung, nr, name, blob, stueck.crc, stueck.groesse)
      .catch(() => { S.sicherungFehlt = true; });
  } catch(e){
    S.gescheitert++;
    merken('brocken-gescheitert', { nr: nr });
  }
}

/* ============================================================
   Blätter: abfotografiert oder angehängt

   Wer kein Tablet hat, rechnet auf Papier. Damit daraus kein
   Umweg über das Handy wird, nimmt die ohnehin laufende Kamera das
   Blatt auf. Der Dateianhang bleibt daneben stehen - manche
   fotografieren doch lieber mit dem Telefon.
   ============================================================ */

/* Ein Standbild aus der laufenden Kameraspur. */
function blattVonKamera(videoElement){
  return new Promise((fertig, scheitern) => {
    if (!videoElement || !videoElement.videoWidth)
      return scheitern(new Error('kein Kamerabild'));
    const c = document.createElement('canvas');
    c.width = videoElement.videoWidth;
    c.height = videoElement.videoHeight;
    c.getContext('2d').drawImage(videoElement, 0, 0, c.width, c.height);
    c.toBlob(b => b ? fertig(b) : scheitern(new Error('kein Bild')), 'image/jpeg', 0.86);
  });
}

/* Ein Blatt ins Paket geben - egal, woher es kommt. */
async function blattAbgeben(blob, aufgabeId, herkunft, dateiname){
  S.blaetter++;
  const nr = S.blaetter;
  const endung = (blob.type || '').indexOf('png') >= 0 ? 'png' : 'jpg';
  const name = S.sitzung + '_blatt' + String(nr).padStart(2,'0') + '_' +
               String(aufgabeId).replace(/[^A-Za-z0-9-]/g,'') + '.' + endung;
  merken('blatt', { nr: nr, aufgabe: aufgabeId, herkunft: herkunft,
                    datei: dateiname || null, gr: blob.size, name: name });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const pruef = crc32(bytes);
  S.behalten.push({ name: name, blob: blob, crc: pruef, groesse: bytes.length });
  Speicher.stueck(S.sitzung, 100000 + nr, name, blob, pruef, bytes.length)
    .catch(() => { S.sicherungFehlt = true; });
  return name;
}

/* ============================================================
   Was mitgeschrieben wird
   ============================================================ */

const M = {
  seite:      (nr, titel) => merken('seite', { nr: nr, titel: titel }),
  eingabe:    (feld, wert) => merken('eingabe', { feld: feld, wert: wert }),
  lesefehler: (feld, wert) => merken('lesefehler', { feld: feld, wert: wert }),
  auswahl:    (feld, wert) => merken('auswahl', { feld: feld, wert: wert }),
  bildklick:  (feld, ziel) => merken('bildklick', { feld: feld, ziel: ziel }),
  karte:      (id, x, y, feld) => merken('karte', { karte: id, x: x, y: y, feld: feld }),
  strich:     (feld, punkte) => merken('strich', { feld: feld, p: punkte }),
  radiert:    (feld) => merken('radiert', { feld: feld }),

  erklaerung: (nr, frage) => merken('erklaerstelle', { nr: nr, frage: frage }),
  aufgabeFertig: (id) => merken('aufgabe-fertig', { aufgabe: id }),
  auswertung: (stand) => merken('auswertung', stand)
};

/* ============================================================
   Schliessen
   ============================================================ */

async function beenden(auswertung){
  if (WERKSTATT) return { sitzung: 'werkstatt', werkstatt: true,
                          brocken: 0, gescheitert: 0, protokoll: null, paket: null };
  if (!S.laeuft) return null;
  merken('ende', auswertung || {});
  S.laeuft = false;

  await new Promise(fertig => {
    if (!S.aufnehmer || S.aufnehmer.state === 'inactive') return fertig();
    S.aufnehmer.onstop = fertig;
    S.aufnehmer.requestData();
    S.aufnehmer.stop();
  });
  if (S.spur) S.spur.getTracks().forEach(t => t.stop());

  /* Der letzte Brocken kommt asynchron; kurz warten, sonst fehlt er. */
  for (let i = 0; i < 40 && S.offen > 0; i++)
    await new Promise(f => setTimeout(f, 100));

  const kopf = kopfdaten();
  kopf.auswertung = auswertung || null;
  kopf.ende = new Date().toISOString();
  const protokoll = JSON.stringify({ kopf: kopf, ereignisse: S.ereignisse }, null, 1);

  const dateien = [{ name: 'protokoll.json', daten: textBytes(protokoll) }]
                  .concat(S.behalten);
  const paket = zip(dateien);

  return {
    sitzung: S.sitzung, brocken: S.brockenNr, gescheitert: S.gescheitert,
    sicherungFehlt: !!S.sicherungFehlt,
    protokoll: protokoll, paket: paket,
    name: S.sitzung + '.zip',
    mb: (paket.size / 1048576).toFixed(1)
  };
}

/* ============================================================
   Angefangenes wiederherstellen

   Bricht eine Pruefung ab - Absturz, Stromausfall, versehentlich
   geschlossenes Fenster -, liegt alles bis zum letzten Stueck in
   der Datenbank. Die Titelseite fragt beim Oeffnen nach und bietet
   an, daraus ein Paket zu schnueren.

   Geraeumt wird erst, wenn abgegeben BESTAETIGT wurde. Lieber
   einmal zuviel gefragt als eine Aufnahme verloren.
   ============================================================ */
async function angefangenes(){
  try {
    const staende = await Speicher.staende();
    const offen = [];
    for (const st of staende){
      const stuecke = await Speicher.stuecke(st.sitzung);
      offen.push({ sitzung: st.sitzung, kopf: st.kopf,
                   ereignisse: st.ereignisse || [],
                   stuecke: stuecke,
                   gesichert: st.gesichert,
                   mb: (stuecke.reduce((s,x) => s + x.groesse, 0) / 1048576).toFixed(1) });
    }
    return offen;
  } catch(e){ return []; }
}

/* Aus dem Angefangenen ein Paket schnueren - dieselbe Gestalt wie
   nach einer regulaeren Pruefung. */
function paketAus(angefangen){
  const protokoll = JSON.stringify(
    { kopf: Object.assign({}, angefangen.kopf, { unterbrochen: true }),
      ereignisse: angefangen.ereignisse }, null, 1);
  const dateien = [{ name: 'protokoll.json', daten: textBytes(protokoll) }]
    .concat(angefangen.stuecke.map(x => ({
      name: x.name, blob: x.blob, crc: x.crc, groesse: x.groesse })));
  const paket = zip(dateien);
  return { sitzung: angefangen.sitzung, paket: paket,
           name: angefangen.sitzung + '.zip',
           mb: (paket.size / 1048576).toFixed(1),
           brocken: angefangen.stuecke.length, gescheitert: 0,
           unterbrochen: true };
}

/* Wo der Browser heruntergeladene Dateien anzeigt. Uebernommen aus
   Kaspers aufnahme.js. Absichtlich knapp: lieber eine Beschreibung,
   die fast immer stimmt, als eine falsche. */
function fundort(){
  const u = navigator.userAgent;
  const chrome  = /Chrome|CriOS|Chromium/.test(u) && !/Edg|OPR/.test(u);
  const edge    = /Edg/.test(u);
  const firefox = /Firefox|FxiOS/.test(u);
  const safari  = /Safari/.test(u) && !chrome && !edge && !firefox;
  if (/iPad|iPhone/.test(u))
    return 'Tippen Sie oben rechts auf den Pfeil nach unten — dort steht Ihre Datei.';
  if (safari || chrome || edge || firefox)
    return 'Oben rechts erscheint ein Pfeil nach unten. Klicken Sie ihn an — ' +
           'dort steht Ihre Datei.';
  return 'Der Browser zeigt heruntergeladene Dateien meist oben rechts an.';
}

function herunterladen(blob, name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}

/* ============================================================
   ZIP ohne Komprimierung - Medien sind ohnehin komprimiert
   ============================================================ */
const CRCTABELLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++){
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(u8){
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = CRCTABELLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
const textBytes = s => new TextEncoder().encode(s);

/* Baut das ZIP aus Blobs. Wo eine Pruefsumme schon vorliegt (jeder
   Medienbrocken, jedes Blatt), wird sie uebernommen; nur die kleinen
   Textdateien werden hier noch gerechnet. Damit muss nichts Grosses
   als Ganzes in den Speicher - Blob() reiht die Teile aneinander,
   ohne sie zu lesen. */
function zip(dateien){
  const teile = [], verzeichnis = [];
  let versatz = 0;
  for (const d of dateien){
    const name = textBytes(d.name);
    const inhalt = d.daten !== undefined ? d.daten : d.blob;
    const laenge = d.daten !== undefined ? d.daten.length : d.groesse;
    const pruef  = d.crc !== undefined ? d.crc : crc32(d.daten);

    const kopf = new DataView(new ArrayBuffer(30));
    kopf.setUint32(0, 0x04034b50, true);
    kopf.setUint16(4, 20, true); kopf.setUint16(6, 0, true);
    kopf.setUint16(8, 0, true);
    kopf.setUint16(10, 0, true); kopf.setUint16(12, 0x2821, true);
    kopf.setUint32(14, pruef, true);
    kopf.setUint32(18, laenge, true); kopf.setUint32(22, laenge, true);
    kopf.setUint16(26, name.length, true); kopf.setUint16(28, 0, true);
    teile.push(new Uint8Array(kopf.buffer), name, inhalt);

    const eintrag = new DataView(new ArrayBuffer(46));
    eintrag.setUint32(0, 0x02014b50, true);
    eintrag.setUint16(4, 20, true); eintrag.setUint16(6, 20, true);
    eintrag.setUint16(8, 0, true); eintrag.setUint16(10, 0, true);
    eintrag.setUint16(12, 0, true); eintrag.setUint16(14, 0x2821, true);
    eintrag.setUint32(16, pruef, true);
    eintrag.setUint32(20, laenge, true); eintrag.setUint32(24, laenge, true);
    eintrag.setUint16(28, name.length, true);
    eintrag.setUint32(42, versatz, true);
    verzeichnis.push(new Uint8Array(eintrag.buffer), name);
    versatz += 30 + name.length + laenge;
  }
  const vLaenge = verzeichnis.reduce((s,x) => s + x.length, 0);
  const ende = new DataView(new ArrayBuffer(22));
  ende.setUint32(0, 0x06054b50, true);
  ende.setUint16(8, dateien.length, true); ende.setUint16(10, dateien.length, true);
  ende.setUint32(12, vLaenge, true); ende.setUint32(16, versatz, true);
  return new Blob(teile.concat(verzeichnis, [new Uint8Array(ende.buffer)]),
                  { type: 'application/zip' });
}

window.Aufnahme = {
  probe: probe, starten: starten, beenden: beenden,
  merken: merken, M: M,
  blattVonKamera: blattVonKamera, blattAbgeben: blattAbgeben,
  fundort: fundort, ablage: () => CFG.ablage,
  angefangenes: angefangenes, paketAus: paketAus,
  aufraeumen: s => Speicher.loeschen(s),
  /* nur fuer den Pruefstand: der ZIP-Schreiber und die Pruefsumme */
  _zip: zip, _crc32: crc32,
  spur: () => S.spur,
  hatKamera: () => S.mitBild,
  herunterladen: herunterladen,
  laeuft: () => S.laeuft,
  sitzung: () => S.sitzung,
  dauer: () => (S.laeuft ? jetzt() : 0),
  stand: () => ({ brocken: S.brockenNr, gescheitert: S.gescheitert,
                  offen: S.offen, ablage: !!CFG.ablage })
};
})();
