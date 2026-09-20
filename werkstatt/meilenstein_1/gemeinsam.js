/* ============================================================
   Gemeinsames Brett — mehrere Browser an derselben Sortierflaeche.

   Angelegt 2026-09-08 fuer die Meilensteine von «Komplexe Zahlen».
   Rikes Anlass: Bisher lief jede Gruppe auf einem Zoom-Whiteboard, auf
   dem alle gleichzeitig schieben konnten. Die HTML-Flaechen konnten das
   nicht - sie waren auf EINEN Rechner ausgelegt, vor dem die Gruppe
   gemeinsam sitzt.

   BAUART: dasselbe Muster wie `aufnahme.js`. Das Modul haengt sich von
   aussen an eine fertige Sortierflaeche, liest ueber `merken()` mit,
   was sich bewegt, und setzt umgekehrt, was von anderen hereinkommt.
   KEINE der bestehenden Flaechen wird dafuer veraendert.

   WAS UEBER DIE LEITUNG GEHT: je Bewegung zwei Meldungen - «ich hebe
   Karte 7 an» und «ich lege sie hier ab». Nicht der Weg dazwischen.
   Der empfangende Browser laesst die Karte selbst von A nach B
   gleiten, in rund 400 ms. Das sieht aus wie eine wandernde Karte und
   kostet ein Zehntel der Nachrichten - nachgerechnet in
   ANLEITUNG_supabase.md.

   ES GEHEN KEINE PERSONENDATEN UEBER DIE LEITUNG. Eine Zeile ist
   Raum, Kartennummer, Ort und drei Zahlen. Wer schiebt, wird nur
   waehrend des Schiebens als zufaellige Farbe und ein Kuerzel
   angezeigt, das der Browser bei jedem Laden neu wuerfelt.

   Erwartet `window.KASPER_GEMEINSAM = {url, schluessel, raum}`.
   Fehlt das, tut das Modul nichts - die Flaeche laeuft dann wie
   bisher allein.
   ============================================================ */
(function(){
'use strict';

const CFG = window.KASPER_GEMEINSAM;
if (!CFG || !CFG.url || !CFG.schluessel) return;

/* ---------- Raum ----------
   Der Raum steht in der Adresse: ?raum=m1-g03. Die Etappe haengt das
   Modul selbst an, weil jede Etappe ein eigenes Brett ist.

   NEU (2026-09-09): Der Raum darf jetzt auch SPAETER kommen. Rikes
   Auftrag: ein Link fuer alle, und die Studierenden waehlen am
   Startfeld ihre Gruppennummer - dann steht der Raum beim Laden noch
   nicht fest.

   Bis heute stieg das Modul an dieser Stelle endgueltig aus
   (`if (!ROH) return;`). Jetzt wartet es: `KASPER_GEMEINSAM_START(name)`
   startet die Verbindung, sobald die Gruppe gewaehlt ist. Steht der
   Raum schon in der Adresse, laeuft alles wie bisher - Rikes fertige
   `?raum=`-Links und ein Neuladen mitten in der Sitzung eingeschlossen.

   Ohne beides bleibt die Flaeche allein. Das ist der Normalfall beim
   Entwickeln und bei einer Einzelperson. */
let ROH = new URLSearchParams(location.search).get('raum') || '';

const REST = CFG.url + '/rest/v1/brett';
const KOPF = {
  'apikey': CFG.schluessel,
  'Authorization': 'Bearer ' + CFG.schluessel,
  'Content-Type': 'application/json'
};

/* Wer bin ich? Nur fuer die Anzeige «diese Karte haelt gerade jemand».
   Bei jedem Laden neu gewuerfelt, nirgends gespeichert, kein Name. */
const ICH = Math.random().toString(36).slice(2, 8);
const FARBEN = ['#c2410c','#0369a1','#4d7c0f','#a21caf','#b45309','#0f766e'];
const MEINE_FARBE = FARBEN[Math.floor(Math.random() * FARBEN.length)];

let raum = ROH;
let letzter = {};        // Kartenlage, wie ich sie zuletzt gemeldet habe
let gehalten = {};       // karte -> {wer, farbe} - fremde Haende
let anzeige = null;
let kanal = null;
let pollen = null;
let zuletztGesehen = '1970-01-01T00:00:00Z';

/* ---------- Anzeige ----------
   Ein Punkt in der Leiste. Rikes alte Supabase-Seite hatte denselben,
   und er war dort das Nuetzlichste: Man sieht beim Oeffnen, ob die
   Verbindung steht, statt es zu merken, wenn nichts geht. */
let letzteMeldung = null;

function anzeigen(art, text){
  letzteMeldung = [art, text];
  const l = document.querySelector('.leiste');
  if (!l) return;                       // Startfeld - noch keine Leiste
  if (!anzeige || !anzeige.isConnected){
    anzeige = document.createElement('span');
    anzeige.className = 'gemeinsam';
    l.appendChild(anzeige);
  }
  anzeige.className = 'gemeinsam ' + art;
  anzeige.innerHTML = '<i></i>' + text;
}

/* FEHLERBEHOBEN (2026-09-08): Die Verbindung steht meist schon,
   waehrend noch das Startfeld sichtbar ist - dort gibt es keine
   Leiste, die Meldung fiel ins Leere, und danach kam keine mehr. Wer
   die Aufnahmefrage schnell wegklickte, sah nie eine Anzeige und
   musste glauben, es sei nichts verbunden.

   Jede Etappe baut die Leiste neu; deshalb wird die letzte Meldung
   danach erneut gesetzt. Der Beobachter kostet nichts - er reagiert
   nur, wenn die Buehne ausgetauscht wird. */
const buehne = document.getElementById('buehne');
if (buehne) new MutationObserver(()=>{
  if (letzteMeldung && (!anzeige || !anzeige.isConnected))
    anzeigen(letzteMeldung[0], letzteMeldung[1]);
}).observe(buehne, {childList: true, subtree: true});

/* ---------- Lesen ----------
   Nur, was sich seit dem letzten Blick geaendert hat. `wann` traegt
   dafuer einen Index. */
async function holen(alles){
  const frage = alles
    ? `?raum=eq.${encodeURIComponent(raum)}&select=*`
    : `?raum=eq.${encodeURIComponent(raum)}&wann=gt.${encodeURIComponent(zuletztGesehen)}&select=*`;
  try {
    const a = await fetch(REST + frage, {headers: KOPF});
    if (!a.ok) throw new Error('HTTP ' + a.status);
    const zeilen = await a.json();
    zeilen.forEach(z => {
      if (z.wann > zuletztGesehen) zuletztGesehen = z.wann;
      uebernehmen(z);
    });
    return true;
  } catch(e){
    anzeigen('fehler', 'Verbindung unterbrochen');
    return false;
  }
}

/* ---------- Was nicht Kaertchen ist ----------
   NEU (2026-09-08, Rikes Auftrag): «Es muessen alle sehen, was wie wo
   passiert.» Etappe 2 hat keine Kaertchen, sondern gesetzte Zeiger -
   und Rikes Beobachtung trifft den Punkt:

     «Die fangen aber immer bei null an und enden immer an einem
      bestimmten Ort. Als Uebertragung waere ja eigentlich auch wieder
      nur ein Ort notwendig, naemlich: Endpunkt des Pfeils liegt an
      Ort y.»

   Genau. Ein Zeiger ist eine Zahl und ein Ort - dieselbe Form wie eine
   Karte. Es braucht deshalb KEINE zweite Tabelle und keine zweite
   Leitung: Wer etwas anderes als Kaertchen mitschicken will, haengt
   sich hier ein.

     window.KASPER_GEMEINSAM_ZUSATZ = {
       stand()        liefert {id: {ort, x, y, rot}} wie stand.karten
       anwenden(z)    setzt eine hereinkommende Zeile, liefert true
     }

   Die Werte gehen als GANZE ZAHLEN ueber die Leitung: `schluessel()`
   unten rundet, um zu erkennen, was sich geaendert hat. Wer Bruchteile
   schickt, schickt sie einmal und nie wieder. Die Etappe rechnet
   deshalb selbst mal hundert und wieder zurueck. */
const zusatz = () => window.KASPER_GEMEINSAM_ZUSATZ || null;

/* ---------- Eine fremde Bewegung uebernehmen ---------- */
function uebernehmen(z){
  if (z.karte.startsWith('!')) { hand(z); return; }
  const zu = zusatz();
  if (zu && zu.anwenden && zu.anwenden(z)) return;
  const el = document.querySelector(`.k[data-id="${z.karte}"]`);
  if (!el) return;
  // Was ich selbst gerade halte, nimmt mir niemand aus der Hand.
  if (el.classList.contains('zieht')) return;

  const s = stand.karten[z.karte];
  if (s && s.ort === z.ort && Math.abs(s.x - z.x) < 0.5
        && Math.abs(s.y - z.y) < 0.5) return;   // steht schon so

  const ziel = document.querySelector(`[data-ort="${z.ort}"]`)
            || document.getElementById('tisch');
  if (!ziel) return;
  gleiten(el, ziel, z);
}

/* Die Karte wandern lassen, statt sie springen zu lassen.
   Der Weg wurde nie uebertragen - er wird hier erfunden, und das
   genuegt: Zu sehen ist, dass sich etwas bewegt und wohin. */
function gleiten(el, ziel, z){
  const vorher = el.getBoundingClientRect();
  ziel.appendChild(el);
  el._x = z.x; el._y = z.y; el._rot = z.rot;
  pos(el);
  const nachher = el.getBoundingClientRect();
  const dx = vorher.left - nachher.left, dy = vorher.top - nachher.top;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) { nachtragen(z); return; }
  el.style.transition = 'none';
  el.style.transform = `translate(${dx}px,${dy}px) rotate(${el._rot||0}deg)`;
  requestAnimationFrame(()=>{
    el.style.transition = 'transform .40s cubic-bezier(.22,.61,.36,1)';
    el.style.transform = `rotate(${el._rot||0}deg)`;
    setTimeout(()=>{ el.style.transition = ''; }, 440);
  });
  nachtragen(z);
}

/* Den eigenen Stand nachfuehren, OHNE ihn wieder zu melden - sonst
   schaukeln sich zwei Browser gegenseitig auf. */
function nachtragen(z){
  stand.karten[z.karte] = {ort: z.ort, x: z.x, y: z.y, rot: z.rot};
  letzter[z.karte] = schluessel(stand.karten[z.karte]);
  if (window._nachAblegen) window._nachAblegen();
}

/* ---------- Fremde Haende ----------
   Eine Zeile, deren Kartennummer mit «!» beginnt, ist keine Karte,
   sondern die Meldung «ich halte gerade». Sie steht in derselben
   Tabelle, damit es nicht zwei Wege braucht. */
function hand(z){
  const karte = z.karte.slice(1);
  const el = document.querySelector(`.k[data-id="${karte}"]`);
  if (!el) return;
  if (z.ort === '-' || z.ort === ICH){
    el.classList.remove('fremdehand');
    el.style.removeProperty('--hand');
    delete gehalten[karte];
  } else {
    el.classList.add('fremdehand');
    el.style.setProperty('--hand', 'hsl(' + (z.x|0) + ' 70% 45%)');
    gehalten[karte] = z.ort;
  }
}

/* ---------- Schreiben ---------- */
async function schreiben(zeilen){
  if (!zeilen.length) return;
  try {
    await fetch(REST, {
      method: 'POST',
      headers: Object.assign({}, KOPF,
        {'Prefer': 'resolution=merge-duplicates,return=minimal'}),
      body: JSON.stringify(zeilen.map(z => Object.assign({raum}, z)))
    });
  } catch(e){ anzeigen('fehler', 'Nicht gesendet'); }
}

const schluessel = s => `${s.ort}|${Math.round(s.x)}|${Math.round(s.y)}|${s.rot||0}`;

/* Was hat sich seit meiner letzten Meldung geaendert? */
function melden(){
  const neu = [];
  Object.entries(stand.karten).forEach(([id, s])=>{
    const k = schluessel(s);
    if (letzter[id] !== k){
      letzter[id] = k;
      neu.push({karte: id, ort: s.ort, x: s.x, y: s.y, rot: s.rot || 0});
    }
  });
  // Und was sonst noch auf dem Brett liegt - siehe `zusatz` oben.
  const zu = zusatz();
  if (zu && zu.stand){
    Object.entries(zu.stand()).forEach(([id, s])=>{
      const k = schluessel(s);
      if (letzter[id] !== k){
        letzter[id] = k;
        neu.push({karte: id, ort: s.ort, x: s.x, y: s.y, rot: s.rot || 0});
      }
    });
  }
  schreiben(neu);
}

/* Etappen ohne Kaertchen koennen `merken()` nicht rufen - es baut
   `stand.karten` aus dem DOM neu und wuerde die Karten der anderen
   Etappe loeschen. Sie melden deshalb hierueber. */
window.KASPER_GEMEINSAM_MELDEN = melden;

/* ---------- An die Flaeche haengen ----------
   `merken()` ist die eine Stelle, durch die JEDE Bewegung laeuft.
   Wir legen uns davor, statt die Flaeche zu aendern. */
const _merken = window.merken;
window.merken = function(){
  const r = _merken.apply(this, arguments);
  melden();
  return r;
};

/* Aufheben und Loslassen - nur dafuer, dass die anderen sehen, woran
   gerade jemand arbeitet. */
document.addEventListener('pointerdown', e=>{
  const k = e.target.closest && e.target.closest('.k');
  if (k) schreiben([{karte: '!' + k.dataset.id, ort: ICH,
                     x: parseInt(MEINE_FARBE.slice(1,3), 16) % 360, y: 0, rot: 0}]);
}, true);
document.addEventListener('pointerup', e=>{
  const k = e.target.closest && e.target.closest('.k');
  if (k) schreiben([{karte: '!' + k.dataset.id, ort: '-', x: 0, y: 0, rot: 0}]);
}, true);

/* Beim Etappenwechsel wechselt das Brett. */
const _los = window.los;
if (_los) window.los = function(){
  const r = _los.apply(this, arguments);
  raumSetzen();
  return r;
};
function raumSetzen(){
  if (!gestartet) return;          // Gruppe noch nicht gewaehlt
  const neu = ROH + '-e' + ((stand && stand.etappe || 0) + 1);
  if (neu === raum) return;
  raum = neu;
  letzter = {};
  zuletztGesehen = '1970-01-01T00:00:00Z';
  holen(true);
}

/* ---------- Verbindung ----------
   Zuerst der Versuch ueber Realtime: Supabase meldet sich dann von
   selbst, sobald jemand etwas schreibt. Kommt binnen fuenf Sekunden
   keine Bestaetigung, wird stattdessen im Sekundentakt nachgefragt.
   Beides funktioniert; der Unterschied ist die Verzoegerung. */
function realtime(){
  const ws = new WebSocket(
    CFG.url.replace(/^http/, 'ws') + '/realtime/v1/websocket'
    + '?apikey=' + encodeURIComponent(CFG.schluessel) + '&vsn=1.0.0');
  let bestaetigt = false;
  const frist = setTimeout(()=>{ if (!bestaetigt){ try{ws.close();}catch(e){} nachfragen(); } }, 5000);

  ws.onopen = ()=>{
    /* FEHLERBEHOBEN (2026-09-09): Hier stand ein Abonnement auf die
       GANZE Tabelle, ohne Filter - jeder Browser bekam jede Bewegung
       jeder Gruppe zugeschickt und sortierte erst hier im Skript aus,
       was nicht sein Raum war.

       Solange eine Gruppe nach der anderen arbeitet, ist das
       gleichgueltig. Bei Rike arbeiten mehrere Gruppen GLEICHZEITIG -
       und genau diese Annahme steckt unausgesprochen in der Rechnung
       in ANLEITUNG_supabase.md, die fuenf Empfaenger je Bewegung
       annimmt. Bei neun gleichzeitigen Gruppen sind es 45, bei
       fuenfzehn 75; dann traegt das Kartenschieben allein rund
       2,25 Millionen Nachrichten im Monat und reisst die Freigrenze.

       Mit Filter sind es 150 000, unabhaengig davon, wie viele
       gleichzeitig arbeiten. NACHGEMESSEN am 2026-09-09 in Rikes
       Projekt, mit drei Verbindungen gleichzeitig: ohne Filter kamen
       Aenderungen aus beiden Pruefraeumen an, mit `raum=eq.` und mit
       `raum=in.(…)` nur die des eigenen.

       `in.(…)` statt `eq.`, weil jede Etappe ihr eigenes Brett ist:
       So deckt EIN Abonnement alle Etappen der Gruppe ab und muss beim
       Etappenwechsel nicht neu aufgebaut werden. */
    const filter = 'raum=in.(' + raeume().join(',') + ')';
    ws.send(JSON.stringify({topic:'realtime:brett-' + ROH,
      event:'phx_join', ref:'1',
      payload:{config:{broadcast:{self:false}, presence:{key:''},
        postgres_changes:[{event:'*', schema:'public', table:'brett',
                           filter}]}}}));
    setInterval(()=>{ if (ws.readyState===1) ws.send(JSON.stringify(
      {topic:'phoenix', event:'heartbeat', payload:{}, ref:'h'})); }, 25000);
  };
  ws.onmessage = m=>{
    let n; try{ n = JSON.parse(m.data); } catch(e){ return; }
    if (n.event === 'phx_reply' && n.ref === '1'
        && n.payload && n.payload.status === 'ok'){
      bestaetigt = true; clearTimeout(frist);
      anzeigen('gut', 'Gemeinsam · sofort');
      holen(true);
    }
    if (n.event === 'postgres_changes'){
      const z = n.payload && n.payload.data && n.payload.data.record;
      if (z && z.raum === raum){
        if (z.wann > zuletztGesehen) zuletztGesehen = z.wann;
        uebernehmen(z);
      }
    }
  };
  ws.onclose = ()=>{ if (bestaetigt){ anzeigen('fehler','Verbindung verloren'); nachfragen(); } };
  ws.onerror = ()=>{};
  kanal = ws;
}

function nachfragen(){
  if (pollen) return;
  anzeigen('gut', 'Gemeinsam · im Sekundentakt');
  holen(true);
  pollen = setInterval(()=>holen(false), 1000);
}

/* ---------- Wie viele Etappen hat die Flaeche? ----------
   Fuer den Filter braucht das Abonnement die Namen ALLER Raeume dieser
   Gruppe, nicht nur des aktuellen. Die Zahl der Etappen sagt die
   Flaeche selbst (`ETAPPEN`), nicht dieses Modul - sonst stuende hier
   eine Drei, die niemand nachfuehrt, wenn eine Etappe dazukommt.

   Eins mehr als gefunden, als Reserve: Ein Filter, der einen Raum
   nicht nennt, laesst dessen Zeilen still verschwinden - und still ist
   der schlechteste Fehler. */
function raeume(){
  const n = (typeof ETAPPEN !== 'undefined' && ETAPPEN.length) || 3;
  const aus = [];
  for (let i = 1; i <= n + 1; i++) aus.push(ROH + '-e' + i);
  return aus;
}

/* ---------- Anfangen ----------
   Getrennt vom Laden, damit die Gruppennummer aus dem Startfeld kommen
   darf. Zweimal gerufen tut nichts - `gestartet` haelt das fest. */
let gestartet = false;

function starten(name){
  if (gestartet) return;
  if (name) ROH = name;
  if (!ROH) return;                 // keine Gruppe, keine Adresse: allein
  gestartet = true;
  raum = ROH + '-e' + ((typeof stand !== 'undefined' && stand.etappe || 0) + 1);
  anzeigen('warten', 'Gemeinsames Brett wird verbunden …');
  realtime();
}

/* Das Startfeld ruft das hier, sobald die Gruppe gewaehlt ist. */
window.KASPER_GEMEINSAM_START = starten;

/* Steht der Raum schon in der Adresse, wird nicht gewartet. Das ist der
   Weg fuer Rikes fertige Links und fuer jedes Neuladen mitten in der
   Sitzung - dort hat das Startfeld die Gruppe bereits in die Adresse
   geschrieben. */
if (ROH) starten();

window.GEMEINSAM = {raum: ()=>raum, ich: ICH, raeume,
  leeren: async ()=>{
    await fetch(REST + '?raum=eq.' + encodeURIComponent(raum),
                {method:'DELETE', headers: KOPF});
    letzter = {};
  }};

})();
