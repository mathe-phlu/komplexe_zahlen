/* ZUSAMMENGELEGT beim Bauen - nicht von Hand aendern.
   1. themen/meilenstein_2/etappen_quartette.js (Helfer)
   2. themen/meilenstein_2/anbauten.js
   3. themen/meilenstein_2/etappen_runden.js
   4. themen/meilenstein_2/labor.js */

/* ───────── Meilenstein 2 · Etappe 1 — Quartette ─────────

   Rikes Durchfuehrung vom 25.10.24: 24 Karten, sechs farbige Felder auf
   dem Zoom-Whiteboard, je vier Karten gehoeren zusammen - ein Term,
   eine Wirkung, zwei Bilder.

   Links der Vorrat, rechts die sechs Felder in Rikes Whiteboardfarben,
   drei nebeneinander, zwei Reihen. Jedes Feld hat vier Plaetze, zwei
   mal zwei, OHNE Beschriftung: Welche Sorten in ein Quartett gehoeren,
   sagt der Auftrag. «Term / Wirkung / Dreieck / Quadrat» an die Plaetze
   zu schreiben naehme das Ordnen ab (thema.md, Abschnitt 3).

   Jedes Feld laesst sich aufklappen: Dann liegen seine Karten gross da,
   und Streckfaktor, Drehwinkel, Drehzentrum und das Bild des Ursprungs
   lassen sich auf allen Karten zugleich einblenden (ansicht.js).
*/

const E1 = D.e1;
const FELDER = [1, 2, 3, 4, 5, 6];
const RAND = 6;
const KARTE_MIN = 70, KARTE_MAX = 170;

function sobaldBreit(el, fn, versuch){
  if (el && el.clientWidth > 0) { fn(); return; }
  if ((versuch || 0) > 30) { fn(); return; }
  requestAnimationFrame(() => sobaldBreit(el, fn, (versuch || 0) + 1));
}

/* Alles haengt unter `.buehne.m2q` - ausserhalb dieser Etappe greift
   keine der Regeln. Die Regeln fuer Startfeld, Pate und Gruppenwahl
   sind wortgleich aus Meilenstein 1 uebernommen. */
const STIL = `
.buehne.m2q{align-items:stretch}
.buehne.m2q > .haelfte{flex:1 1 0;display:flex;flex-direction:column;
  overflow:hidden}
.buehne.m2q > .haelfte > .marke{position:static;flex:0 0 auto}
.buehne.m2q > .haelfte > .blatt{flex:1 1 auto;min-height:0;min-width:0;
  overflow:auto}
/* GEAENDERT (Rikes Befund, 2026-10-10: «Ich sehe gar nicht mehr alle
   Kaestchen»): rechts 1.9 statt 2.3 - der Vorrat bekommt eine Spalte mehr. */
.buehne.m2q > .haelfte.rechts{flex:1.9 1 0}
/* Im Vorrat so gross wie in den Feldern, hoechstens so gross wie der
   Regler erlaubt. Karten wechseln beim Ablegen nicht die Groesse. */
.buehne.m2q #feldk > .k{width:min(var(--kb), var(--m2vorrat, var(--kb)))}
.buehne.m2q #feld{position:static;display:flex;flex-direction:column;gap:8px;
  box-sizing:border-box;padding:2px 6px 8px}
.buehne.m2q .quartette{display:grid;gap:8px;grid-template-columns:repeat(3,auto);
  justify-content:center}
.buehne.m2q .feld.quartett{position:static;display:grid;
  grid-template-columns:repeat(2,auto);gap:4px;padding:6px;height:auto;
  border-radius:12px;border:1px solid rgba(0,0,0,.06)}
.buehne.m2q .paar{position:relative;left:auto;top:auto;background:rgba(255,255,255,.45)}
.buehne.m2q .paar > .k{width:var(--m2karte)}
.buehne.m2q .feldkopf{grid-column:1 / -1;display:flex;align-items:center;
  justify-content:space-between;font-size:12px;color:var(--matt);height:20px;
  padding:0 2px}
.buehne.m2q .feldkopf .auf{font:inherit;font-size:12px;border:1px solid rgba(0,0,0,.12);
  background:rgba(255,255,255,.7);border-radius:10px;padding:1px 9px;cursor:pointer;
  color:var(--tinte)}
.buehne.m2q .feldkopf .auf:hover{border-color:var(--akzent);color:var(--akzent)}
.auftrag{flex-wrap:wrap}

.start .pate{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.start .pate img{width:78px;height:78px;object-fit:cover;border-radius:50%;
  border:1px solid var(--linie);background:var(--karte)}
.start .pate b{display:block;font-family:var(--hand);font-size:19px;
  color:var(--akzent);font-weight:400}
.start .pate span{font-size:13px;color:var(--matt)}
.start .gruppengitter{display:grid;grid-template-columns:repeat(5,1fr);
  gap:8px;max-width:340px;margin:16px 0 6px}
.start .gruppengitter button{font:inherit;font-size:16px;padding:10px 0;
  border:1px solid var(--linie);background:var(--karte);border-radius:10px;
  cursor:pointer;color:var(--tinte)}
.start .gruppengitter button:hover{border-color:var(--akzent);
  color:var(--akzent)}
.start .andere{font:inherit;font-size:13.5px;background:none;border:none;
  color:var(--matt);text-decoration:underline;cursor:pointer;padding:0}
.start .anderefeld{display:flex;gap:8px;align-items:center;margin-top:10px}
.start .anderefeld[hidden]{display:none}
.start .anderefeld input{font:inherit;font-size:15px;width:5.5em;padding:7px 9px;
  border:1px solid var(--linie);border-radius:8px;background:var(--karte)}
.auftrag .knopf.weiter{font-size:12.5px;padding:3px 12px;
  white-space:nowrap;flex:0 0 auto}
`;

function stilSetzen(){
  if (document.getElementById('m2stil')) return;
  const t = document.createElement('style');
  t.id = 'm2stil'; t.textContent = STIL;
  document.head.appendChild(t);
}

/* Buehne mit zwei Haelften nebeneinander - wie `buehneNeben` in
   Meilenstein 1, mit ziehbarer Trennlinie. */
function buehneNeben(auftrag, vorrat, rechtsName, leiste){
  const b = document.getElementById('buehne');
  window._nachAblegen = null;
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${auftrag.rang}</span>
      <span class="titel">${auftrag.titel}</span>
      <span class="text">${auftrag.text}</span></div>
    <div class="buehne m2q">
      <div class="haelfte" id="hal${vorrat.id}">
        <div class="marke">${vorrat.name}</div>
        <div class="blatt" id="feld${vorrat.id}" data-ort="tisch${vorrat.id}"></div>
      </div>
      <div class="haelfte rechts">
        <div class="marke">${rechtsName}</div>
        <div class="blatt" id="feld"></div>
      </div>
    </div>
    <div class="leiste">${leiste}</div>`;
  _griffeSetzen(b, _teilungSchluessel(auftrag));
  _leisteChrome(b);
}

function platz(feld, i, breite, hoehe){
  const p = document.createElement('div');
  p.className = 'paar';
  p.dataset.ort = feld + '/' + i;
  p.dataset.fasst = '1';
  p.style.width = breite + 'px';
  p.style.height = hoehe + 'px';
  return p;
}

function etappe1(){
  stilSetzen();
  window.KASPER_GEMEINSAM_ZUSATZ = null;
  const a = D.etappen[0];
  const vorrat = D.vorrat[0];
  buehneNeben(
    {rang: a.rang, titel: 'Etappe 1 · Quartette', text: D.auftrag},
    vorrat,
    'Die sechs Quartette',
    `<button class="knopf leer" id="zurueck" title="Alle Karten zurück">↺</button>
     <button class="knopf" id="pruefen">Prüfen</button>
     <span class="befund" id="befund"></span>`);

  const feld = document.getElementById('feld');
  const els = {};
  E1.karten.forEach(id => {
    els[id] = karte(id);
    /* NEU (Rike, 2026-09-25): Doppelklick legt die Karte gross hin -
       liegt sie in einem Feld, das ganze Quartett (fuer alle am Brett),
       sonst die Karte allein (nur fuer mich). Siehe ansicht.js. */
    els[id].addEventListener('dblclick', ev => {
      ev.stopPropagation();
      const ort = (stand.karten[id] || {}).ort || '';
      const m = ort.match(/^q(\d)\//);
      if (m) M2Ansicht.quartett(Number(m[1]));
      else M2Ansicht.einzeln(id);
    });
  });

  /* ENTFERNT (Rike, 2026-09-25): die zwei Schreibfelder «vor dem z /
     hinter dem z» unter den Feldern. «Die gehoeren, glaube ich, nicht in
     die Notizen. Sondern meine Idee waere gewesen, dass wir das irgendwie
     sichtbar machen in den Kaertchen.» An ihre Stelle tritt die grosse
     Ansicht (ansicht.js). Damit faellt auch der zweite Beobachter weg,
     der ihretwegen da war. */
  const gitter = document.createElement('div');
  gitter.className = 'quartette';
  feld.appendChild(gitter);

  /* Wie gross darf eine Karte sein? Sechs Karten nebeneinander (drei
     Felder zu zwei Plaetzen) und vier untereinander (zwei Felder zu
     zwei Plaetzen). Die kleinere Zahl gewinnt. */
  function kartenbreite(){
    const innen = 6 + 2 * 1;                  // Feldpolster und -rand
    const ausBreite = (feld.clientWidth - 12 - 2 * 8 - 3 * (2 * innen + 4))
                      / 6 - RAND;
    // 10 Polster des Feldes, 2 x 26 die Kopfzeilen der Felder, 12
    // Reserve fuer die Rundung der vier Kartenhoehen.
    const frei = feld.clientHeight - 10 - 2 * 26 - 12;
    const ausHoehe = ((frei - 8 - 2 * (2 * innen + 4)) / 4 - RAND) / 0.845;
    return Math.max(KARTE_MIN,
             Math.min(KARTE_MAX, Math.floor(Math.min(ausBreite, ausHoehe))));
  }

  /* Die Rechnung oben ist eine Schaetzung - Raender, Luecken und
     Rundungen der vier Kartenreihen summieren sich, und der erste Bau
     rollte um 30 bis 40 Pixel. Statt weiter nachzurechnen, wird
     NACHGEMESSEN: Rollt das Feld, wird die Karte kleiner, bis es passt
     oder die Mindestgroesse erreicht ist. */
  function felder(){
    let kw = kartenbreite();
    zeichneFelder(kw);
    while (feld.scrollHeight > feld.clientHeight + 1 && kw > KARTE_MIN){
      kw = Math.max(KARTE_MIN, kw - 4);
      zeichneFelder(kw);
    }
  }

  function zeichneFelder(kw){
    gitter.innerHTML = '';
    const kh = Math.round(kw * 0.845);
    feld.style.setProperty('--m2karte', kw + 'px');
    // Der Vorrat zieht mit - bei jedem Zeichnen, nicht nur beim ersten
    // Auslegen: Wird die Etappe neu aufgebaut, ist der Tisch ein neuer.
    const tisch = document.getElementById('feld' + vorrat.id);
    // Vier Karten nebeneinander - zwei Baender zu zwei Spalten, siehe
    // baender(). Nie groesser als im Feld.
    if (tisch) tisch.style.setProperty('--m2vorrat',
      Math.max(60, Math.min(kw, Math.floor((tisch.clientWidth - 16 - 14 - 2 * 6) / 4))) + 'px');
    FELDER.forEach((n, i) => {
      const d = document.createElement('div');
      d.className = 'feld quartett';
      d.dataset.ort = 'q' + n;
      d.style.background = E1.farben[i];
      /* Die Kopfzeile mit dem Knopf zum Aufklappen. Sie gehoert zum
         Feld, damit klar ist, WELCHES Quartett gross wird. */
      const kopf = document.createElement('div');
      kopf.className = 'feldkopf';
      kopf.innerHTML = `<span>Quartett ${n}</span>
        <button class="auf" title="Gross ansehen und markieren">⤢ aufklappen</button>`;
      kopf.querySelector('.auf').onclick = ev => {
        ev.stopPropagation(); M2Ansicht.quartett(n);
      };
      d.appendChild(kopf);
      for (let p = 0; p < 4; p++) d.appendChild(platz('q' + n, p, kw + RAND, kh + RAND));
      gitter.appendChild(d);
    });
    Object.entries(stand.karten).forEach(([id, s]) => {
      const el = els[id]; if (!el) return;
      const ziel = document.querySelector(`[data-ort="${s.ort}"]`)
                || document.getElementById('feld' + vorrat.id);
      ziel.appendChild(el); el._x = s.x; el._y = s.y; el._rot = s.rot; pos(el);
    });
  }

  /* NEU (Rike, 2026-09-25): Der Vorrat liegt NACH SORTEN. «Weil es ja
     klar ist, dass aus jedem Typ eins nachher in dem Quartett landen
     soll. Das heisst, da koennen wir die Vorsortierung direkt auch schon
     machen.» Ein Band je Sorte, jedes mit seinem Namen.

     GEAENDERT (Rikes Befund, 2026-10-10): «Bei den Quartetten sehe ich
     gar nicht mehr alle Kaestchen.» Der Kern streut ueberlappend (eine
     Spalte = 70 % Kartenbreite) - bei Bildkarten verdeckt das genau den
     Inhalt, und bei 1024 x 768 lagen 24 Karten auf 1074 Pixeln in einem
     Vorrat von 489. Jetzt ein Raster OHNE Ueberlappen, innerhalb des
     Bandes gemischt, die Karten etwas kleiner als in den Feldern. */
  /* Die vier Baender zwei mal zwei: Terme neben Wirkungen, Dreiecke
     neben Quadraten, jedes zwei Spalten breit und drei Reihen hoch.
     Untereinander braucht es acht Kartenreihen, so nur sechs - erst damit
     passt der Vorrat bei 1440 x 900 ohne Rollen (nachgemessen). */
  function bandLage(tisch){
    const luft = 6, fuge = 14, b = tisch.clientWidth - 16;
    const bandB = (b - fuge) / 2;
    const w = parseFloat(tisch.style.getPropertyValue('--m2vorrat')) || 100;
    // Nicht unter das Seitenverhaeltnis der Karten: Ein Bild, das noch
    // laedt, meldet sonst eine zu kleine Hoehe.
    const h = Math.max(w * 0.845, ...[...tisch.querySelectorAll(':scope > .k')].map(el => el.offsetHeight || 0));
    const spalten = Math.max(1, Math.floor((bandB + luft) / (w + luft)));
    const reihen = Math.max(1, ...(D.e1.baender || []).map(band =>
      Math.ceil(E1.karten.filter(id => id[0] === band.sorte).length / spalten)));
    const zeileH = reihen * (h + luft) + 26;
    const ecke = bi => [8 + (bi % 2) * (bandB + fuge), 24 + Math.floor(bi / 2) * zeileH];
    return {luft, w, h, spalten, zeileH, ecke};
  }

  /* FEHLERBEHOBEN (2026-10-10): Die Bandnamen standen nur nach dem
     ersten Auslegen da. Ursache: baender() lief nur fuer NEUE Karten;
     wurde die Etappe neu aufgebaut (Start, Gruppenwahl, Neuladen), lagen
     die Karten schon im Stand, und die Namen fehlten. Jetzt bei jedem
     Aufbau. */
  function bandNamen(tisch){
    tisch.querySelectorAll('.bandmarke').forEach(d => d.remove());
    const L = bandLage(tisch);
    (D.e1.baender || []).forEach((band, bi) => {
      const [x0, y0] = L.ecke(bi);
      const m = document.createElement('div');
      m.className = 'bandmarke';
      m.style.top = (y0 - 18) + 'px';
      m.style.left = (x0 + 2) + 'px';
      m.textContent = band.name;
      tisch.appendChild(m);
    });
    tisch.style.minHeight = (24 + 2 * L.zeileH) + 'px';
  }

  function baender(tisch, neu){
    neu.forEach(el => tisch.appendChild(el));
    const L = bandLage(tisch);
    (D.e1.baender || []).forEach((band, bi) => {
      const [x0, y0] = L.ecke(bi);
      neu.filter(el => el.dataset.id[0] === band.sorte)
        .sort(() => Math.random() - 0.5).forEach((el, i) => {
          el._rot = 0;
          el._x = x0 + (i % L.spalten) * (L.w + L.luft);
          el._y = y0 + Math.floor(i / L.spalten) * (L.h + L.luft);
          el.style.zIndex = ++zmax;
          pos(el);
        });
    });
    bandNamen(tisch);
  }

  window._neuzeichnen = felder;
  sobaldBreit(feld, () => {
    felder();
    const tisch = document.getElementById('feld' + vorrat.id);
    const neu = E1.karten.filter(id => !(id in stand.karten)).map(id => els[id]);
    if (neu.length) sobaldBreit(tisch, () => { baender(tisch, neu); merken(); });
    else sobaldBreit(tisch, () => bandNamen(tisch));
    merken();
  });
  /* FEHLERBEHOBEN (2026-09-25, gemessen): Der erste Bau lief, bevor
     das Feld seine endgueltige Hoehe hatte - Auftragskopf und Leiste
     setzen sich erst danach. Die Karten waren fuer 674 Pixel gerechnet,
     das Feld hatte 630, und es rollte. Ein Beobachter auf dem Feld
     selbst faengt das und jede spaetere Groessenaenderung (Fenster,
     Trennlinie) ab. Das Neuzeichnen aendert den Inhalt, nicht die
     Groesse des Feldes - es loest sich also nicht selbst wieder aus.

     ACHTUNG beim Nachmessen: In einem VERDECKTEN Browsertab laufen
     Beobachter nicht an. Gemessen wird nur, was gezeichnet ist. */
  let hoeheVorher = 0, breiteVorher = 0;
  if (window._m2beobachter) window._m2beobachter.disconnect();
  window._m2beobachter = new ResizeObserver(() => {
    if (!document.body.contains(feld)) return;
    if (feld.clientHeight === hoeheVorher && feld.clientWidth === breiteVorher) return;
    hoeheVorher = feld.clientHeight; breiteVorher = feld.clientWidth;
    felder();
  });
  window._m2beobachter.observe(feld);
  M2Ansicht.leitung();

  document.getElementById('zurueck').onclick = () => {
    stand.karten = {};
    document.getElementById('befund').textContent = '';
    etappe1();
  };
  document.getElementById('pruefen').onclick = pruefen;
}

/* ───────── Pruefen ─────────

   Rikes Regel aus Meilenstein 1: Pruefen hebt hervor, was nicht
   stimmt, und verraet keine Loesung.

   Je Feld: Welche Funktion haben die meisten Karten darin? Karten, die
   nicht dazu gehoeren, werden rot. Liegen vier Karten derselben
   Funktion da, wird das Feld gruen. Gibt es keine Mehrheit (etwa zwei
   zu zwei), laesst sich nicht sagen, welche Karte die falsche ist -
   dann werden alle gelb markiert, statt zu raten. */
function pruefen(){
  document.querySelectorAll('.k').forEach(k =>
    k.classList.remove('ok', 'falsch', 'fastok'));
  let richtig = 0, fehl = 0, unklar = 0, offen = 0;

  FELDER.forEach(n => {
    const ids = Object.entries(stand.karten)
      .filter(([, s]) => s.ort && s.ort.startsWith('q' + n + '/'))
      .map(([id]) => id);
    if (!ids.length) { offen++; return; }
    const zahl = {};
    ids.forEach(id => { const f = E1.gehoert[id]; zahl[f] = (zahl[f] || 0) + 1; });
    const reihe = Object.entries(zahl).sort((x, y) => y[1] - x[1]);
    const markiere = (id, m) => {
      const el = document.querySelector(`.k[data-id="${id}"]`);
      if (el) el.classList.add(m);
    };
    const eindeutig = reihe.length === 1 || reihe[0][1] > reihe[1][1];
    if (!eindeutig){
      ids.forEach(id => markiere(id, 'fastok')); unklar++; return;
    }
    const f = Number(reihe[0][0]);
    ids.forEach(id => {
      if (E1.gehoert[id] !== f){ markiere(id, 'falsch'); fehl++; }
      else if (ids.length === 4 && reihe.length === 1) markiere(id, 'ok');
    });
    if (ids.length === 4 && reihe.length === 1) richtig++;
    else if (ids.length < 4) offen++;
  });

  stand.geprueft = true;
  const eins = n => n === 1;
  const teile = [];
  if (richtig) teile.push(`<b>${richtig}</b> von 6 ${eins(richtig) ? 'Quartett stimmt' : 'Quartetten stimmen'}`);
  if (fehl)    teile.push(`<b>${fehl}</b> ${eins(fehl) ? 'Karte passt' : 'Karten passen'} nicht zu ${eins(fehl) ? 'ihrem' : 'ihren'} Feld${eins(fehl) ? '' : 'ern'}`);
  if (unklar)  teile.push(`${unklar} ${eins(unklar) ? 'Feld ist' : 'Felder sind'} unentschieden — welche Karten gehören zusammen?`);
  if (offen && richtig < 6) teile.push(`${offen} noch unvollständig`);
  document.getElementById('befund').innerHTML =
    teile.join(' · ') || 'Es liegt noch nichts in den Feldern.';
}

ETAPPEN.push(etappe1);

/* UEBERNOMMEN aus meilenstein_1/etappen.js am 2026-09-25 (Anbauten 1-4,
   Schlussbildschirm aus 5) - kopiert, nicht verlinkt: Meilenstein 1 ist
   draussen, und eine gemeinsame Datei haette ihn beim naechsten Bau
   mitveraendert. Geaendert ist nur Abschnitt 5 (eine Etappe, dazu die
   Schreibfelder). PRUEFEN: Zieht ein dritter Meilenstein dasselbe
   Geruest nach, gehoert es in eine gemeinsame Datei. */

/* ══════════════════════════════════════════════════════════════════
   ANBAUTEN — sie haengen sich VON AUSSEN an den Kern

   Alles hier unten aendert Verhalten des gemeinsamen Geruests, ohne
   `kern/flaechen/flaeche/flaeche.js` anzufassen. Das ist derselbe Griff,
   den `bauen/gemeinsam.js` benutzt: eine Funktion des Kerns wird
   umgehaengt, der alte Aufruf bleibt darin stehen.

   WARUM SO UND NICHT IM KERN: Der Kern traegt auch die vier Flaechen von
   «Daten und Zufall». Jede Zeile dort veraendert deren Ausgabe, und Rike
   hat ausdruecklich gesagt: «Ruehr Daten und Zufall nicht an.» Ein Anbau
   von aussen laesst sie byte-identisch - das ist nach dem Bauen mit
   Pruefsummen nachweisbar, eine Absicht nicht.

   `flaeche.js` ist ein gewoehnliches Skript, kein Modul: Seine
   `function`-Deklarationen liegen als beschreibbare Eigenschaften am
   `window`, und seine eigenen Aufrufe finden die neue Fassung.
   ══════════════════════════════════════════════════════════════════ */

/* ───────── 1 · Kein Zwischensichern ─────────

   Rike, 2026-09-09: «Wir muessen auch nicht zwischendrin sichern
   lassen, sondern das wird am Ende alles gesichert.» Der Knopf «Stand
   als Bild sichern» steht in der gemeinsamen Leiste des Kerns, also in
   JEDER Flaeche. Statt ihn dort zu entfernen - was ihn auch bei «Daten
   und Zufall» wegnaehme, wo er gebraucht wird - wird er hier nach dem
   Bauen der Leiste wieder herausgenommen. */
(function(){
  const _chrome = window._leisteChrome;
  window._leisteChrome = function(b){
    const r = _chrome.apply(this, arguments);
    b.querySelectorAll('.leiste .knopf').forEach(k => {
      if (k.textContent === 'Stand als Bild sichern') k.remove();
    });
    return r;
  };
})();


/* ───────── 2 · Das Startfeld: Pate, zwei Wege, Gruppenwahl ─────────

   Rike, 2026-09-09, zwei Entscheidungen in einem Satz:

     «Ich haette gerne, dass wir auf der Einstiegsseite noch mal
      jeweils den Paten fuer die Station sehen.»
     «Und dann waere eben wichtig beim Start, dass sie quasi eingeben,
      entweder los geht's in der Gruppe oder ein Klick auf: wir
      machen's alleine.»

   Dazu, dass die Aufgabe selbst dort NICHT mehr steht: «Wir brauchen da
   gar keine Einstiegsfrage. Das ist anders als bei Daten und Zufall.»

   ── Warum «alleine» die SEITE WECHSELT und keinen Schalter umlegt ──

   Fassung B nimmt auf. Laege ihr Code auf derselben Seite, haenge das
   Aufnehmen nur noch an einer Verzweigung - und ein Fehlklick in Rikes
   Sitzung startete ein Mikrofon in einem Raum, in dem fuenf Leute
   reden. Heute ist das unmoeglich, weil `index.html` gar keinen
   Aufnahmecode enthaelt. Diese Eigenschaft bleibt: Der Knopf fuehrt
   nach `aufnahme.html`.

   ── Die Gruppennummer ──

   Knoepfe statt Tippfeld, Rikes Wahl: «Knoepfe statt tippen ist
   wahrscheinlich besser.» Wer sich vertippt, sitzt sonst allein in
   einem Raum, in dem nie etwas ankommt - oder im Brett einer anderen
   Gruppe. Wie viele: «Im Moment sind Gruppe eins bis neun vertreten.
   Ich vermute, dass es maximal fuenfzehn Gruppen am Ende gibt. Die
   Sache ist nur, es koennten tendenziell vielleicht auch mehr werden.»
   Deshalb `D.gruppen_max` aus thema.py UND ein Weg fuer den seltenen
   Fall daneben.

   Die Wahl SCHREIBT DIE ADRESSE (`?raum=`), statt sie nur im Speicher
   zu halten. Damit uebersteht sie ein Neuladen mitten in der Sitzung,
   und Rikes fertige `?raum=`-Links funktionieren unveraendert weiter -
   wer einen bekommt, sieht die Frage gar nicht. */
(function(){
  if (!D.pate && !D.gruppen_max) return;      // anderes Thema: nichts tun

  /* FEHLERBEHOBEN (2026-09-09, im Bau bemerkt): Diese Datei traegt
     BEIDE Fassungen - `index.html` und `aufnahme.html` binden dasselbe
     etappen.js ein. Ohne die Abfrage unten stand die Gruppenwahl auch
     in Fassung B, wo es gar kein gemeinsames Brett gibt, und der Knopf
     «Wir machen's alleine» zeigte dort auf die Seite selbst - eine
     Schlaufe.

     `D.aufnahme` unterscheidet die Fassungen: 'nie' ist A (im
     Meilensteinblock, Rike dabei), 'immer' ist B (allein, mit
     Aufnahme). In B bleibt das Startfeld des Kerns stehen, das die
     Aufnahme ansagt - und genau dort gehoert der Nachweissatz hin, der
     noch offen ist.

     Der Pate steht trotzdem in BEIDEN. Er gehoert zur Station, nicht
     zur Fassung. */
  const FASSUNG_A = (D.aufnahme || 'wahl') === 'nie';

  /* Die Stilregeln JETZT einhaengen, nicht erst mit der ersten Etappe.
     `stilSetzen()` lief bisher am Anfang von etappe1() - das genuegte,
     solange nur Etappen eigene Regeln brauchten. Das Startfeld kommt
     davor, und ohne diesen Aufruf stand der Pate ungestaltet da: ein
     380 Pixel breites Bild statt eines runden Ausschnitts. Der Aufruf
     ist gegen Mehrfachausfuehrung gesichert. */
  stilSetzen();

  const RAUM_DA = !!new URLSearchParams(location.search).get('raum');

  function pateHtml(){
    if (!D.pate) return '';
    return `<div class="pate">
      <img src="${D.pate.bild}" alt="${D.pate.name}">
      <div><b>${D.pate.name}</b><span>${D.pate.daten}</span></div></div>`;
  }

  function rahmen(inhalt){
    document.getElementById('buehne').innerHTML =
      `<div class="start">${pateHtml()}${inhalt}
       <p class="hinweis">${D.nachweis || ''}</p></div>`;
  }

  /* Der Raumname. Das Praefix kommt aus dem Thema, die Nummer von der
     Gruppe. So kann derselbe Knopf naechstes Semester wieder benutzt
     werden, ohne dass Gruppe 3 die Karten des vorigen Jahrgangs
     vorfindet - das Semester steckt im Praefix. */
  /* NEU (2026-09-23): Der Raumname traegt jetzt auch den TAG.

     Lars hat gemessen, was Rike gemeldet hatte: Meine Reparatur vom
     21.09. raeumt den Tisch AM RECHNER - die Sortierung liegt aber auf
     dem gemeinsamen Brett, und die blieb liegen. Wer Gruppe 8 waehlte,
     fand 36 Kaertchen der vorigen Sitzung vor. Der Vorsatz nannte nur
     das Semester (`kz-m1-hs26`), also trifft dieselbe Gruppennummer
     naechste Woche auf die Arbeit von dieser.

     Der Tag im Namen loest das ohne Aufraeumen: Alle, die am selben
     Tag dieselbe Nummer waehlen, sind zusammen - und die naechste
     Sitzung faengt von selbst auf leeren Brettern an. Gerechnet wird
     der Tag im Browser, nicht beim Bauen: Sonst haengt der Raum am
     Zeitpunkt der Auslieferung, und ein Neubau mitten in der Sitzung
     risse eine Gruppe auseinander.

     PRUEFEN (fuer Rike): Damit kommt eine Gruppe NICHT mehr an die
     Arbeit der vorigen Woche heran. Fuer die Meilensteine ist das
     richtig - jede Sitzung faengt neu an. Soll eine Gruppe je
     fortsetzen koennen, muss der Tag wieder heraus, und dann braucht
     es das Aufraeumen von Hand. */
  const heute = () => {
    const d = new Date();
    return d.getFullYear().toString().slice(2)
         + String(d.getMonth() + 1).padStart(2, '0')
         + String(d.getDate()).padStart(2, '0');
  };
  const raumname = (nr) => (D.raum_vorsatz || 'raum') + '-' + heute() + '-g' + nr;

  /* Der unberuehrte Ausgangszustand, gesichert BEVOR irgendetwas
     wiederhergestellt wird.

     Der Kern holt einen gespeicherten Stand erst beim ersten `los()`
     zurueck (`_wiederaufnehmen`), und dieser Anbau laeuft beim Laden
     der Datei - also davor. Was hier steht, ist der leere Tisch.

     WARUM EINE KOPIE STATT EINER LISTE VON FELDERN: Ein
     `stand.karten = {}` und so weiter waere eine Aufzaehlung, und eine
     Aufzaehlung vergisst. Genau daran ist am 20.09. schon einmal etwas
     gehangen - `stand.e3text` wurde beim Umbau uebersehen. Die Kopie
     kennt jedes Feld, auch die, die es erst spaeter geben wird. */
  const LEERER_TISCH = JSON.parse(JSON.stringify(stand));

  function gruppeGewaehlt(nr){
    const u = new URL(location.href);
    u.searchParams.set('raum', raumname(nr));
    history.replaceState(null, '', u);
    if (window.KASPER_GEMEINSAM_START) KASPER_GEMEINSAM_START(raumname(nr));

    /* FEHLERBEHOBEN (2026-09-21, Rikes Befund): «Ich kann zwar die
       Gruppennamen angeben, aber wenn ich dann einen neuen
       Gruppennamen habe, dann taucht in den Etappen 1, 2, 3 immer die
       Sortierung auf, die ich mit der anderen Gruppe schon gemacht
       habe.»

       URSACHE: Der Kern sichert den Stand nach `localStorage`, unter
       `kasper:` plus dem Namen des STUECKS - die Gruppe steht nicht im
       Schluessel. Zwoelf Stunden lang erbt deshalb jede naechste
       Gruppe am selben Rechner die Sortierung der vorigen.

       Der Kommentar im Kern nennt den Fall sogar - «am selben Rechner
       arbeitet naechste Woche eine andere Gruppe» - und leitet daraus
       die Haltbarkeit von zwoelf Stunden ab. Die Rechnung stimmt fuer
       naechste Woche und nicht fuer denselben Abend: Rike laesst die
       Gruppen nacheinander durch, mit einer Stunde Abstand.

       BEHOBEN WIRD ES HIER, nicht im Kern: Der Kern traegt auch die
       vier Flaechen von «Daten und Zufall», und dort gibt es weder
       Gruppen noch dieses Problem. Die Gruppenwahl ist ein Anbau von
       «Komplexe Zahlen», also gehoert die Reparatur daneben.

       Der Tisch wird GELEERT, nicht der Speicher geloescht: `los()`
       ruft am Ende `sichern()`, und damit ueberschreibt der leere
       Tisch den alten Eintrag von selbst. Eine zweite Stelle, die den
       Speicherschluessel kennen muesste, entsteht gar nicht erst.

       Was vom gemeinsamen Brett kommt, ist davon unberuehrt: Der neue
       Raum wird frisch gelesen. Wer dieselbe Gruppe noch einmal waehlt,
       bekommt ihren Stand also vom Server zurueck, nicht aus diesem
       Rechner. */
    /* NUR BEI EINEM ECHTEN WECHSEL leeren.

       FEHLERBEHOBEN (2026-09-23, Rikes Befund): «Wenn man auf Refresh
       macht, sollten die bisher sortierten Sachen nicht neu sortiert
       sein.» Sie waren es. Wer neu laedt und SEINE EIGENE Gruppe noch
       einmal waehlt, bekam den leeren Tisch der Reparatur vom 21.09. -
       obwohl er gar nicht die Gruppe gewechselt hat, sondern nur die
       Seite neu geladen hat.

       Die Abfrage unten kostet nichts und nimmt der Reparatur nichts:
       Die naechste Gruppe traegt eine andere Nummer, und fuer sie wird
       weiter geleert. */
    const wechsel = stand.gruppe && stand.gruppe !== nr;
    if (wechsel || !stand.gruppe){
      /* UND STUMM DABEI. Nach dem Leeren streut `felder()` die Karten
         neu und ruft `merken()`, und `merken()` meldet an das
         gemeinsame Brett. Der frisch gestreute Tisch ging damit an
         alle hinaus und warf die Sortierung der Gruppe um - genau das
         zweite, was Rike gesehen hat: «die Studierenden haben nicht
         immer alle Kaertchen gesehen und das hat sich immer so ein
         bisschen verschoben».

         Der Riegel faellt nach zweieinhalb Sekunden. So lange braucht
         die erste Antwort des Bretts; was in dieser Zeit von dort
         kommt, setzt den Tisch, und erst danach wird wieder gemeldet.
         Wer in diesen zwei Sekunden schon zieht, meldet es beim
         naechsten Zug - eine Bewegung, nicht die Arbeit. */
      window.KASPER_GEMEINSAM_STUMM = true;
      setTimeout(() => {
        window.KASPER_GEMEINSAM_STUMM = false;
        if (window.KASPER_GEMEINSAM_MELDEN) KASPER_GEMEINSAM_MELDEN();
      }, 2500);

      Object.keys(stand).forEach(k => { delete stand[k]; });
      Object.assign(stand, JSON.parse(JSON.stringify(LEERER_TISCH)));
    }

    stand.gruppe = nr;
    stand.aufnahme = false; stand.etappe = 0;
    los();
  }

  function gruppenfeld(){
    const max = D.gruppen_max || 15;
    let knoepfe = '';
    for (let i = 1; i <= max; i++) knoepfe += `<button data-g="${i}">${i}</button>`;
    rahmen(`<h2>In welcher Gruppe sind Sie?</h2>
      <p class="lage">Alle mit derselben Nummer arbeiten auf demselben Brett —
         jede und jeder am eigenen Rechner, und alle sehen, was die anderen
         schieben.</p>
      <div class="gruppengitter">${knoepfe}</div>
      <button class="andere" id="andere">Meine Gruppe hat eine höhere Nummer …</button>
      <div class="anderefeld" id="anderefeld" hidden>
        <input type="number" min="1" max="99" step="1" id="anderenr"
               placeholder="Nr.">
        <button class="knopf" id="anderelos">Weiter</button>
      </div>`);

    document.querySelectorAll('.gruppengitter button').forEach(b =>
      b.onclick = () => gruppeGewaehlt(parseInt(b.dataset.g, 10)));
    const feld = document.getElementById('anderefeld');
    document.getElementById('andere').onclick = () => {
      feld.hidden = false;
      document.getElementById('andere').hidden = true;
      document.getElementById('anderenr').focus();
    };
    const nimm = () => {
      const n = parseInt(document.getElementById('anderenr').value, 10);
      if (n >= 1 && n <= 99) gruppeGewaehlt(n);
    };
    document.getElementById('anderelos').onclick = nimm;
    document.getElementById('anderenr').onkeydown = e => {
      if (e.key === 'Enter') nimm();
    };
  }

  /* Fassung B: das Startfeld des Kerns behalten, aber den Paten davor
     setzen. Er gehoert zur Station. */
  if (!FASSUNG_A){
    const _start = window.startfeld;
    window.startfeld = function(){
      const r = _start.apply(this, arguments);
      const kasten = document.querySelector('.start');
      if (!kasten) return r;
      /* Der Einstiegskasten des Kerns setzt Lage, Frage und Nachsatz.
         Seit die Einstiegsfrage gestrichen ist, sind alle drei leer -
         und ein leerer Kasten mit Rahmen stand als weisser Streifen
         da. Er wird entfernt, wenn nichts darin steht; ein Thema mit
         Einstiegstext behaelt ihn. */
      const ein = kasten.querySelector('.einstieg');
      if (ein && !ein.textContent.trim() && !ein.querySelector('img'))
        ein.remove();
      if (D.pate && !kasten.querySelector('.pate'))
        kasten.insertAdjacentHTML('afterbegin', pateHtml());
      return r;
    };
    return;
  }

  /* FEHLERBEHOBEN (2026-09-23): Nach einem Neuladen der BLANKEN Adresse -
     also des Links, den Rike im Zoom gibt - kam die Arbeit zwar
     vollstaendig aus dem Browserspeicher zurueck, aber das gemeinsame
     Brett blieb ABGEHAENGT. Der Raumname steht nur in der Adresse; ohne
     `?raum=` faengt `gemeinsam.js` gar nicht erst an.

     Die Folge ist die schlimmste Sorte: Es sieht richtig aus. Die eigene
     Sortierung ist da, es fehlt keine Karte - nur sieht niemand sonst,
     was man schiebt, und man sieht die anderen nicht. Das erklaert Rikes
     «die Studierenden haben nicht immer alle Kaertchen gesehen und das
     hat sich immer so ein bisschen verschoben».

     Die Gruppe ist bekannt, sie ueberlebt im Speicher. Also wird die
     Adresse wiederhergestellt und das Brett nachtraeglich gestartet -
     beim ersten `los()`, denn erst dort holt der Kern den Stand zurueck.

     HIER und nicht beim Weiter-Knopf: `RAUM_DA` und `raumname` liegen in
     DIESEM Block. Ein erster Versuch stand im Abschnitt daneben und warf
     «RAUM_DA is not defined»; der Browser meldete es sofort, und dabei
     fiel auch der Weiter-Knopf aus. */
  let raumNachgeholt = false;
  const _losRaum = window.los;
  window.los = function(){
    const r = _losRaum.apply(this, arguments);
    if (!raumNachgeholt){
      raumNachgeholt = true;
      if (!RAUM_DA && stand.gruppe){
        const u = new URL(location.href);
        u.searchParams.set('raum', raumname(stand.gruppe));
        history.replaceState(null, '', u);
        if (window.KASPER_GEMEINSAM_START)
          KASPER_GEMEINSAM_START(raumname(stand.gruppe));
      }
    }
    return r;
  };

  window.startfeld = function(){
    /* Steht der Raum schon in der Adresse, ist die Gruppe entschieden -
       dann faellt die Frage weg. Das ist der Weg fuer Rikes fertige
       Links und fuer jeden, der neu laedt. */
    const alleinWeg = D.fassung_allein || 'aufnahme.html';
    rahmen(`<h2>${(D.start && D.start.titel) || ''}</h2>
      <div class="wahl" data-weg="gruppe"><b>Los geht's — in der Gruppe</b>
        <span>Sie arbeiten gemeinsam an einem Brett. Es wird nichts
        aufgezeichnet.</span></div>
      <div class="wahl" data-weg="allein"><b>Wir machen's alleine</b>
        <span>Vorgezogen oder nachgeholt — dieser Weg ist noch nicht offen.</span></div>`);

    document.querySelectorAll('.wahl').forEach(w => w.onclick = () => {
      if (w.dataset.weg === 'allein'){ location.href = alleinWeg; return; }
      if (RAUM_DA){ stand.aufnahme = false; stand.etappe = 0; los(); }
      else gruppenfeld();
    });
  };
})();


/* ───────── 3 · «Weiter» — und die Frage davor ─────────

   Rike, 2026-09-09, nach dem Ansehen:

     «Prinzipiell, wenn quasi diese Frage kommt, wenn ich auf die
      naechste Etappe rutsche, dann oeffnet sich schon das Bild von
      zwei. Also ich glaub, ich haette gerne, da wo Etappe eins steht,
      haette ich gerne ein Weiter, sodass man quasi durch die Etappen
      durchhuepft. Und dieses Weiter sollte verbunden sein mit der
      Frage, die aufploppt, bevor man dann auf Weiter geht.»

   Zwei Dinge, und das zweite behebt einen Baufehler von heute
   Vormittag: Die Frage lag als SCHICHT UEBER Etappe 2, das Bild stand
   also schon dahinter. Das war eine Ausweichloesung - ein eigener
   Bildschirm davor haette damals das Brett auf Etappe 2 gestellt,
   bevor Etappe 2 ihre Leitung angemeldet hat.

   JETZT RICHTIG GELOEST, ohne die Ausweiche: Nicht `los()` wird
   abgefangen, sondern der Weg dorthin. Der Weiter-Knopf zeigt die
   Frage, und erst ihr eigener Knopf ruft `los()` - EINMAL, zum
   richtigen Zeitpunkt. Damit laeuft der Raumwechsel aus
   `gemeinsam.js` weiter genau dann, wenn die Etappe gebaut wird.

   Der Knopf steht im Auftragskopf, gleich neben dem Etappenschild.
   Ueber die Kopfleiste kommt man weiter wie bisher - der Weiter-Knopf
   ist der Weg fuer die, die der Reihe nach durchgehen. */
(function(){
  const _los = window.los;
  window.los = function(){
    const r = _los.apply(this, arguments);
    weiterKnopf();
    return r;
  };

  function weiterKnopf(){
    if (stand.aufnahme === null) return;             // Startfeld
    const kopf = document.querySelector('.auftrag');
    if (!kopf || kopf.querySelector('.weiter')) return;
    const nach = stand.etappe + 1;
    const letzte = nach >= ETAPPEN.length;
    const k = document.createElement('button');
    k.className = 'knopf weiter';
    k.textContent = letzte ? 'Weiter zum Mitnehmen' : 'Weiter zu Etappe ' + (nach + 1);
    k.onclick = () => {
      /* Die Frage kommt VOR dem Wechsel - und nur auf dem Weg von
         Etappe 1 nach Etappe 2, wo die Sortierung fertig und die
         Frage beantwortbar ist. Einmal je Sitzung. */
      if (stand.etappe === 0 && !stand.uebergangGezeigt && D.uebergang){
        stand.uebergangGezeigt = true;
        frageZeigen(() => gehe(nach));
      } else {
        gehe(nach);
      }
    };
    // Direkt hinter das Etappenschild, wie Rike es beschrieben hat.
    const schild = kopf.querySelector('.rang');
    if (schild) schild.insertAdjacentElement('afterend', k);
    else kopf.insertAdjacentElement('afterbegin', k);
  }

  function gehe(nr){
    stand.etappe = nr;
    los();
    nav();
  }

  function frageZeigen(dann){
    const U = D.uebergang;
    const d = document.createElement('div');
    d.className = 'uebergang';
    d.innerHTML = `<div class="blatt2">
      <p class="frage">${U.frage}</p>
      <p>${U.nachsatz}</p>
      <div class="knopfreihe">
        <button class="knopf" id="uebergangweiter">${U.weiter}</button>
        <button class="knopf leer" id="uebergangbleiben">Noch hierbleiben</button>
      </div></div>`;
    document.body.appendChild(d);
    d.querySelector('#uebergangweiter').onclick = () => { d.remove(); dann(); };
    /* Wer noch etwas nachsehen will, kommt zurueck auf die eigene
       Sortierung - und nicht auf Etappe 2, wie es die Schicht von
       heute Vormittag getan haette. */
    d.querySelector('#uebergangbleiben').onclick = () => d.remove();
  }
})();


/* ───────── 4 · Keine Lösungen am Ausgang ─────────

   HIER STAND ein Knopf «Lösungen nachlesen» auf dem Schlussbildschirm.
   Er war Rikes Wunsch vom Vormittag des 2026-09-09 - und am Nachmittag
   hat sie ihn nach dem Ansehen zurueckgenommen:

     «Die Loesungen nachlesen, das macht irgendwie keinen Sinn auf der
      letzten Seite. Auf der letzten Seite brauchen wir keine
      Loesungen. Wir haben das Pruefen bei Etappe eins, das ist gut.
      Wir haben die richtigen Zeiger ein- und ausblenden auch drin.
      Einfach auf der letzten Seite nur noch die Moeglichkeit, alles
      runterzuladen.»

   Das ist stimmig: Jede Etappe hat ihre eigene Rueckmeldung an der
   Stelle, an der sie hilft. Eine Loesungsliste am Ausgang haette
   daneben nur noch die Rolle, das Nachdenken zu ersetzen.

   MIT ENTFERNT: `loesung_e1` wird von `flaeche.py` gar nicht mehr
   mitgegeben. Der Text stand in BEIDEN Dateien - auch in der, die die
   Studierenden oeffnen -, obwohl ein Kommentar im Generator das
   Gegenteil behauptete. Er stammte aus «Daten und Zufall», wo
   index.html die Kontrollfassung war; hier sind beide Dateien fuer
   die Studierenden. Nachgewiesen am 2026-09-09: 744 Zeichen mit allen
   sechs Rechnungen, in index.html und in aufnahme.html. */

/* ───────── 5 · Das Bild zum Mitnehmen — mit den Ueberlegungen ─────────

   Wie in Meilenstein 1, aber mit EINER Etappe. Unter das Bild der
   Quartette kommen die beiden Schreibfelder: `standAlsLeinwand()` des
   Kerns zeichnet Karten und Felder, aber keine Textfelder - ohne diesen
   Anbau fehlte genau das, was die Person selbst formuliert hat. */
(function(){
  if (!D.mitnehmen) return;

  const bilder = {};
  let sichtbar = null;
  const NAME = (D.stueck || 'sortierung')
    .replace(/[^0-9A-Za-zÄÖÜäöü]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

  function umbrechen(g, text, breite){
    const zeilen = [];
    (text || '').split('\n').forEach(absatz => {
      let z = '';
      absatz.split(/\s+/).forEach(w => {
        const probe = z ? z + ' ' + w : w;
        if (g.measureText(probe).width > breite && z){ zeilen.push(z); z = w; }
        else z = probe;
      });
      zeilen.push(z);
    });
    return zeilen;
  }

  function mitUeberlegung(bild){
    const U = (D.e1 || {}).ueberlegung;
    const texte = (stand.texte || {});
    if (!U) return bild;
    /* Das Bild des Kerns entsteht in doppelter Aufloesung (2880 Punkte
       bei 1440 Fensterbreite). Feste Pixelgroessen standen darin wie
       Fussnoten - gemessen am 2026-09-25. Alles hier waechst deshalb
       mit der Bildbreite mit. */
    const m = Math.max(1, bild.width / 1100);
    const B = bild.width, rand = 30 * m, zeile = 27 * m;
    const schrift = (px, fett) => (fett ? '600 ' : '') + Math.round(px * m) + 'px system-ui, sans-serif';
    const g0 = document.createElement('canvas').getContext('2d');
    g0.font = schrift(18);
    const bloecke = U.fragen.map(f => ({
      frage: f.frage.replace(/<[^>]+>/g, ''),
      zeilen: umbrechen(g0, texte['m2-' + f.id] || '— nichts notiert —', B - 2 * rand)
    }));
    const hoehe = 70 * m + bloecke.reduce((s, b) => s + 40 * m + b.zeilen.length * zeile + 14 * m, 0);
    const c = document.createElement('canvas');
    c.width = B; c.height = bild.height + hoehe;
    const g = c.getContext('2d');
    const farbe = (w, ersatz) => getComputedStyle(document.body)
      .getPropertyValue(w).trim() || ersatz;
    g.fillStyle = farbe('--papier', '#F4F0E9');
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(bild, 0, 0);
    let y = bild.height + 44 * m;
    g.fillStyle = farbe('--akzent', '#007D57');
    g.font = schrift(22, true);
    g.fillText(U.kopf, rand, y);
    y += 16 * m;
    bloecke.forEach(b => {
      y += 32 * m;
      g.fillStyle = farbe('--tinte', '#2b2622');
      g.font = schrift(17, true);
      g.fillText(b.frage, rand, y);
      y += 6 * m;
      g.font = schrift(18);
      b.zeilen.forEach(z => { y += zeile; g.fillText(z, rand, y); });
      y += 14 * m;
    });
    return c;
  }

  window.bildSammeln = function(){
    if (sichtbar === null) return;
    /* NEU (2026-10-11): Das Eigenschaftsspiel hat Runden in EINER Etappe.
       Es sagt selbst, unter welcher Nummer das Bild liegt (null: kein
       Bild), und schaltet das Sammeln beim Rundenwechsel ab. */
    if (window._ruKeinBild) return;
    const schluessel = window.m2BildSchluessel ? window.m2BildSchluessel() : sichtbar + 1;
    if (schluessel === null) return;
    try {
      if (document.querySelector('.buehne .k'))
        /* FEHLERBEHOBEN (2026-09-25, im Browser gemessen): Hier stand
           `mitUeberlegung(standAlsLeinwand())`. `standAlsLeinwand()`
           liefert aber ein VERSPRECHEN, keine Leinwand - gezeichnet
           wurde auf «undefined», der Fehler verschwand im catch, und
           der Schlussbildschirm sagte «Noch nichts zum Mitnehmen».
           Meilenstein 1 reicht das Versprechen nur weiter und merkt es
           deshalb nicht. */
        bilder[schluessel] = Promise.resolve(standAlsLeinwand())
          .then(mitUeberlegung);
    } catch(e){ /* ein Bild fehlt, der Bildschirm bleibt heil */ }
  };

  const _los = window.los;
  window.los = function(){
    const r = _los.apply(this, arguments);
    sichtbar = (stand.aufnahme === null || stand.etappe >= ETAPPEN.length)
      ? null : stand.etappe;
    return r;
  };

  /* ---- Der Schlussbildschirm ---- */
  const _mitnehmen = window.mitnehmen;
  window.mitnehmen = function(){
    const nummern = Object.keys(bilder).map(Number).sort((a, b) => a - b);
    if (!nummern.length) return _mitnehmen.apply(this, arguments);

    // Runden statt Etappen, wo das Spiel die Namen liefert (2026-10-11).
    const WORT = window.m2BildName ? 'Runde' : 'Etappe';
    const name = n => window.m2BildName ? window.m2BildName(n) : 'Etappe ' + n;
    const b = document.getElementById('buehne');
    b.innerHTML = `<div class="start">
      <h2>Nehmen Sie Ihre Arbeit mit</h2>
      <p class="lage">Von ${nummern.length === 1 ? 'einer ' + WORT : 'jeder der ' + nummern.length + ' ' + WORT + 'n'}
        ist ein Bild entstanden — so, wie Sie am Ende gearbeitet haben. Für Ihre Notizen.</p>
      <p class="frage">${nummern.map(name).join(' · ')}</p>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="knopf" id="holen">Bilder speichern</button></div>
      <p class="hinweis">Die Bilder bleiben auf Ihrem Rechner. Es wird nichts
         hochgeladen und nichts an uns gesendet.</p></div>`;

    const knopf = document.getElementById('holen');
    knopf.onclick = async () => {
      knopf.disabled = true; knopf.textContent = 'Wird vorbereitet …';
      const fertige = [];
      for (const n of nummern){
        try {
          const c = await bilder[n];
          if (c) fertige.push({nr: n, blob: await new Promise(f =>
            c.toBlob(f, 'image/png'))});
        } catch(e){ /* dieses eine Bild faellt aus */ }
      }
      const P = window.SORT_PAKET;
      if (P && fertige.length > 1){
        const dateien = [];
        for (const f of fertige)
          dateien.push({name: WORT.toLowerCase() + '-' + f.nr + '.png',
                        daten: await P.zuBytes(f.blob)});
        _herunterladen(P.zip(dateien), NAME + '_bilder.zip');
      } else {
        for (const f of fertige)
          _herunterladen(f.blob, NAME + '_' + WORT.toLowerCase() + '-' + f.nr + '.png');
      }
      knopf.disabled = false;
      knopf.textContent = fertige.length
        ? 'Gespeichert ✓ — nochmals speichern' : 'Kein Bild entstanden';
    };
  };
})();

/* ───────── Meilenstein 2 · Das Eigenschaftsspiel ─────────

   NEU (Rike, 2026-10-10/11). Das Quartett geht aus dem Meilenstein -
   «allein durch die 1,5 und die 1,5» war es zu schnell eindeutig. An
   seine Stelle ein Spiel:

     «Man hat einen Kartenstapel und deckt von dem Kartenstapel eine
      Eigenschaftskarte auf. Und dann muss man alle Karten finden, die
      dazugehoeren. [...] Karte umdrehen, jeder sucht, wir haben quasi ein
      Vorsortieren - alle aus, die dazugehoeren -, und dann haben wir einen
      dritten Bereich vom Tisch, wo wir dann aus den ausgefilterten die
      Paerchen bilden. Und dann kann man eine neue Runde anfangen.»

   EIN Kartensatz (36 Karten: 18 Terme F, 18 Bilder G), komplett
   gemischt. EINE Etappe; die Runden laufen darin (Rike: «nicht in
   Etappen, sondern Runden», wie bei SORT).

     Tisch      links, alle Karten durcheinander, ohne Ueberlappen
     Gefunden   rechts oben - zwoelf Einzelplaetze, in jeder Runde zwoelf
     Paare      rechts unten - sechs Paarfelder, erst nach «Jetzt Paare
                bilden»

   Die Reihenfolge der Eigenschaftskarten steht in thema.RUNDEN (Rike:
   vorher ueberlegt, «damit wir alles ein bisschen abgehandelt haben»).
   Mit dem Leitungslink waehlt Rike jede Karte direkt.

   Die Quartett-Datei (etappen_quartette.js) wird weiter mitgebaut - sie
   liefert die Buehne mit zwei Haelften und den Stil des Startfelds.
   Ihre Etappe gehoert nicht mehr zum Meilenstein; ETAPPEN wird hier
   geleert.
*/
const RU = D.ru || {};
const RU_GEF = 12, RU_PAARE = 6;

const RUSTIL = `
.buehne.m2r{align-items:stretch}
.buehne.m2r > .haelfte{flex:1 1 0;display:flex;flex-direction:column;overflow:hidden}
.buehne.m2r > .haelfte > .marke{position:static;flex:0 0 auto}
.buehne.m2r > .haelfte > .blatt{flex:1 1 auto;min-height:0;min-width:0;overflow:hidden}
.buehne.m2r > .haelfte.rechts{flex:1.1 1 0}
.buehne.m2r #feld{position:static;display:flex;flex-direction:column;gap:6px;
  box-sizing:border-box;padding:2px 6px 6px}
.buehne.m2r .zone{border-radius:12px;padding:4px 6px 6px;border:1px solid rgba(0,0,0,.06)}
.buehne.m2r .zone h4{margin:0 0 4px;font-family:var(--hand);font-weight:400;font-size:16px;
  color:var(--matt);display:flex;align-items:center;gap:10px}
.buehne.m2r .zone.gef{background:#FDF1D6}
.buehne.m2r .zone.paarzone{background:#EAF2EC}
.buehne.m2r .zone.zu .paargitter{opacity:.45}
.buehne.m2r .gefgitter{display:grid;gap:4px;justify-content:center}
.buehne.m2r .paargitter{display:grid;gap:6px;justify-content:center}
.buehne.m2r .feld.gefplatz{position:static;display:block;padding:0;border:none;background:none;height:auto}
.buehne.m2r .feld.rpaar{position:static;display:grid;grid-template-columns:repeat(2,auto);
  gap:3px;padding:4px;height:auto;border-radius:10px;background:rgba(255,255,255,.55);
  border:1px solid rgba(0,0,0,.06)}
.buehne.m2r .paar{position:relative;left:auto;top:auto;background:rgba(255,255,255,.6)}
.buehne.m2r .paar > .k{width:var(--m2karte)}
.buehne.m2r #feldru > .k{width:min(var(--kb), var(--m2vorrat, var(--kb)))}
.buehne.m2r .knopf.klein{font-size:12.5px;padding:3px 12px}

.m2stapel{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.m2stapel .ekarte{font-family:var(--hand);font-size:24px;color:var(--akzent);
  background:#fff;border:2px solid var(--akzent);border-radius:12px;padding:4px 18px;
  box-shadow:3px 3px 0 rgba(0,0,0,.08)}
.m2stapel .rest{font-size:13px;color:var(--matt)}
.m2leitung{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;
  margin-top:6px;color:var(--matt)}
.m2leitung button{font:inherit;font-size:12.5px;padding:2px 10px;border-radius:12px;
  border:1.4px solid var(--linie);background:var(--karte);cursor:pointer;color:var(--tinte)}
.m2leitung button.an{border-color:var(--akzent);color:var(--akzent);font-weight:600}
.m2leitung button.war{opacity:.5}
.m2leitung .leitmarke{background:#2b2622;color:#fff;border-radius:8px;padding:1px 8px}
`;

function ruStil(){
  if (document.getElementById('m2rustil')) return;
  const t = document.createElement('style');
  t.id = 'm2rustil'; t.textContent = RUSTIL;
  document.head.appendChild(t);
}

/* ---------- Rikes Leitungslink ----------
   Wie im Quartett (ansicht.js): `?leitung=WORT`, im Quelltext nur die
   Pruefsumme. Mit ihm sieht Rike alle Eigenschaftskarten und deckt jede
   direkt auf. */
let RU_LEITUNG = false;
(async function(){
  const wort = new URLSearchParams(location.search).get('leitung');
  if (!wort || !RU.leitung || !(window.crypto && crypto.subtle)) return;
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(wort.trim().toLowerCase()));
  const hex = [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (hex === RU.leitung){ RU_LEITUNG = true; if (window._ruKopf) window._ruKopf(); }
})();

/* Der Spielstand: welche Eigenschaftskarte liegt offen (Index in
   RU.runden), welche waren schon dran, in welchem Schritt die Gruppe
   ist, und die Mischung des Tisches. Geht ueber das Brett. */
function ruSpiel(){
  stand.ruSpiel = stand.ruSpiel || {offen: 0, war: [0], schritt: 'suchen', mischung: 1};
  return stand.ruSpiel;
}

function eigenschaftsspiel(){
  ruStil();
  const vorrat = {id: 'ru', name: 'Der Tisch'};
  buehneNeben(
    {rang: 'Runde', titel: '', text: ''},
    vorrat, 'Gefunden — und dann Paare',
    `<button class="knopf leer" id="zurueck" title="Alle Karten zurück auf den Tisch">↺</button>
     <button class="knopf" id="pruefen">Prüfen</button>
     <span class="befund" id="befund"></span>`);
  document.querySelector('.buehne.m2q').classList.replace('m2q', 'm2r');

  const feld = document.getElementById('feld');
  const tisch = document.getElementById('feld' + vorrat.id);
  /* Nur die Auswahl dieser Eigenschaftskarte liegt auf dem Tisch (Rike,
     2026-10-11: «dass es uebersichtlich bleibt»). */
  const AUSWAHL = RU.runden[ruSpiel().offen].auswahl;
  const IDS = RU.karten.filter(id => AUSWAHL.includes(RU.gehoert[id]));
  const els = {};
  IDS.forEach(id => {
    els[id] = karte(id);
    els[id].addEventListener('dblclick', ev => { ev.stopPropagation(); ruGross(id); });
  });

  /* ---------- Kopf: die aufgedeckte Karte ---------- */
  function kopf(){
    const S = ruSpiel(), R = RU.runden[S.offen];
    const rest = RU.runden.length - S.war.length;
    const rang = document.querySelector('.auftrag .rang');
    if (rang) rang.textContent = 'Runde ' + S.war.length;
    const ziel = document.querySelector('.auftrag .text');
    if (!ziel) return;
    ziel.innerHTML = `<span class="m2stapel">
        <span class="ekarte">${R.name}</span>
        <span>${S.schritt === 'suchen'
          ? 'Legen Sie <b>alle</b> Karten, die diese Eigenschaft haben — Terme <b>und</b> Bilder —, nach rechts unter «Gefunden».'
          : 'Bilden Sie jetzt aus den gefundenen Karten <b>Paare</b>: Je ein Term und ein Bild gehören zusammen.'}</span>
        <button class="knopf klein" id="naechste">${rest > 0 ? 'Nächste Eigenschaft aufdecken' : 'Der Stapel ist leer'}</button>
        <span class="rest">noch ${rest} im Stapel</span></span>`
      + (RU_LEITUNG ? `<div class="m2leitung"><span class="leitmarke">Leitung</span> aufdecken:
          ${RU.runden.map((r, i) => `<button data-i="${i}" class="${i === S.offen ? 'an' : S.war.includes(i) ? 'war' : ''}">${r.name}</button>`).join('')}</div>` : '');
    const n = ziel.querySelector('#naechste');
    n.disabled = rest <= 0;
    n.onclick = () => {
      const S = ruSpiel();
      const i = RU.runden.findIndex((_, j) => !S.war.includes(j));
      if (i >= 0) aufdecken(i);
    };
    ziel.querySelectorAll('.m2leitung button').forEach(b => b.onclick = () => aufdecken(Number(b.dataset.i)));
  }
  window._ruKopf = kopf;

  function aufdecken(i){
    rundeFesthalten();
    const S = ruSpiel();
    S.offen = i;
    if (!S.war.includes(i)) S.war.push(i);
    S.schritt = 'suchen';
    S.mischung = (S.mischung || 1) + 1;
    melden();
    alleZurueck();
  }
  function alleZurueck(){
    RU.karten.forEach(id => delete stand.karten[id]);
    // Das Bild der alten Runde ist schon festgehalten (rundeFesthalten);
    // los() wuerde sonst den alten Tisch unter der NEUEN Runde ablegen.
    window._ruKeinBild = true;
    try { los(); } finally { window._ruKeinBild = false; }
  }
  function melden(){
    sichern();
    if (window.KASPER_GEMEINSAM_MELDEN) window.KASPER_GEMEINSAM_MELDEN();
  }

  /* ---------- Rechts: Gefunden und Paare ---------- */
  const gef = document.createElement('div');
  gef.className = 'zone gef';
  gef.innerHTML = '<h4>Gefunden</h4><div class="gefgitter"></div>';
  const pz = document.createElement('div');
  pz.className = 'zone paarzone';
  feld.appendChild(gef); feld.appendChild(pz);

  /* Kartengroesse rechts: zwoelf Einzelplaetze (sechs je Reihe) und
     sechs Paarfelder (drei je Reihe), also vier Kartenreihen. Rechnen,
     dann nachmessen wie in den anderen Etappen. */
  function kartenbreite(){
    const ausBreite = (feld.clientWidth - 12 - 12 - 5 * 4 - 3 * 10) / 6 - RAND;
    const ausHoehe = ((feld.clientHeight - 6 - 2 * 32 - 6 - 2 * 6 - 3 * 4 - 2 * 8) / 4 - RAND) / 0.845;
    return Math.max(KARTE_MIN, Math.min(KARTE_MAX, Math.floor(Math.min(ausBreite, ausHoehe))));
  }
  function felder(){
    let kw = kartenbreite();
    zeichneFelder(kw);
    while ((feld.scrollHeight > feld.clientHeight || feld.scrollWidth > feld.clientWidth) && kw > KARTE_MIN){
      kw = Math.max(KARTE_MIN, kw - 4);
      zeichneFelder(kw);
    }
  }
  function zeichneFelder(kw){
    const S = ruSpiel();
    const kh = Math.round(kw * 0.845);
    feld.style.setProperty('--m2karte', kw + 'px');
    tisch.style.setProperty('--m2vorrat', tischbreite(kw) + 'px');
    const gg = gef.querySelector('.gefgitter');
    gg.innerHTML = '';
    gg.style.gridTemplateColumns = 'repeat(6,auto)';
    for (let i = 0; i < RU_GEF; i++){
      const d = document.createElement('div');
      d.className = 'feld gefplatz';
      d.dataset.ort = 'gef' + i;
      d.appendChild(platz('gef' + i, 0, kw + RAND, kh + RAND));
      gg.appendChild(d);
    }
    const offen = S.schritt === 'paare';
    pz.classList.toggle('zu', !offen);
    pz.innerHTML = `<h4>Paare ${offen ? '' : '<button class="knopf klein" id="paarebilden">Jetzt Paare bilden</button>'}</h4>
      <div class="paargitter" style="grid-template-columns:repeat(3,auto)"></div>`;
    const pg = pz.querySelector('.paargitter');
    for (let n = 1; n <= RU_PAARE; n++){
      const d = document.createElement('div');
      d.className = 'feld rpaar';
      if (offen){
        d.dataset.ort = 'pa' + n;
        for (let p = 0; p < 2; p++) d.appendChild(platz('pa' + n, p, kw + RAND, kh + RAND));
      } else {
        // Zu: Platzhalter in derselben Groesse, ohne Ort - hier legt
        // niemand etwas ab, bevor gesammelt ist.
        for (let p = 0; p < 2; p++){
          const x = document.createElement('div');
          x.style.cssText = `width:${kw + RAND}px;height:${kh + RAND}px;border-radius:8px;background:rgba(255,255,255,.5)`;
          d.appendChild(x);
        }
      }
      pg.appendChild(d);
    }
    const pb = pz.querySelector('#paarebilden');
    if (pb) pb.onclick = () => { ruSpiel().schritt = 'paare'; melden(); kopf(); felder(); };
    Object.entries(stand.karten).forEach(([id, s]) => {
      const el = els[id]; if (!el) return;
      const ziel = document.querySelector(`[data-ort="${s.ort}"]`) || tisch;
      ziel.appendChild(el); el._x = s.x; el._y = s.y; el._rot = s.rot; pos(el);
    });
  }

  /* ---------- Links: der Tisch ----------
     36 Karten, ALLE durcheinander (Rike: «komplett durchmischt, mal
     Terme, mal die Bilder»), in einem Raster ohne Ueberlappen - Bild-
     karten verdecken sich sonst genau dort, wo der Inhalt ist (agent/06).
     Spaltenzahl so, dass die Karten am groessten werden und alles ohne
     Rollen passt. */
  let TSPALTEN = 6;
  function tischbreite(kw){
    const luft = 6, B = tisch.clientWidth - 16, H = tisch.clientHeight - 12;
    let beste = 0;
    for (let c = 3; c <= 12; c++){
      const r = Math.ceil(IDS.length / c);
      const w = Math.min((B - (c - 1) * luft) / c, (H / r - luft) / 0.845);
      if (w > beste){ beste = w; TSPALTEN = c; }
    }
    return Math.max(44, Math.floor(Math.min(kw, beste)));
  }
  /* Gemischt mit einem Zufall, der an der Runde haengt (S.mischung):
     Alle in der Gruppe sehen dieselbe Anordnung, und jede Runde eine
     neue. */
  function zufall(saat){
    let x = (saat * 7919) % 233280;
    return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  }
  function auslegen(neu, mischen){
    neu.forEach(el => tisch.appendChild(el));
    const luft = 6;
    const w = parseFloat(tisch.style.getPropertyValue('--m2vorrat')) || 80;
    const h = Math.max(w * 0.845, ...neu.map(el => el.offsetHeight || 0));
    let folge;
    if (mischen){
      const z = zufall(ruSpiel().mischung || 1);
      folge = neu.slice().sort((a, b) => a.dataset.id.localeCompare(b.dataset.id))
        .map(el => [z(), el]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    } else folge = neu.slice().sort((p, q) => (p._y - q._y) || (p._x - q._x));
    folge.forEach((el, i) => {
      el._rot = 0;
      el._x = 8 + (i % TSPALTEN) * (w + luft);
      el._y = 6 + Math.floor(i / TSPALTEN) * (h + luft);
      el.style.zIndex = ++zmax;
      pos(el);
    });
  }

  window._neuzeichnen = felder;
  window._nachAblegen = null;
  /* Erst der Kopf - die Eigenschaftskarte macht ihn hoeher, und davon
     haengt die Hoehe des Tisches ab. Vorher gemessen, lag die letzte
     Kartenreihe 33 Pixel unter dem Rand (2026-10-11, 1280 x 720). */
  sobaldBreit(feld, () => {
    kopf();
    felder();
    const neu = IDS.filter(id => !(id in stand.karten)).map(id => els[id]);
    sobaldBreit(tisch, () => {
      if (neu.length){ auslegen(neu, true); merken(); }
      else auslegen([...tisch.querySelectorAll(':scope > .k')], false);
    });
  });
  let hoeheVorher = 0, breiteVorher = 0;
  if (window._m2beobachter) window._m2beobachter.disconnect();
  window._m2beobachter = new ResizeObserver(() => {
    if (!document.body.contains(feld)) return;
    if (feld.clientHeight === hoeheVorher && feld.clientWidth === breiteVorher) return;
    hoeheVorher = feld.clientHeight; breiteVorher = feld.clientWidth;
    felder();
    // Kein merken() hier: Der Kern loescht dabei die Pruefmarken, und die
    // Pruefmeldung selbst veraendert die Hoehe (2026-10-10 gemessen).
    auslegen([...tisch.querySelectorAll(':scope > .k')], false);
  });
  window._m2beobachter.observe(feld);

  /* Das Brett: eine Zeile «m2s» - x = offene Karte, y = Schritt und
     Mischung; eine Zeile «m2w» - welche Karten schon dran waren
     (Bitmaske). Kommt eine neue offene Karte herein, raeumt jeder seinen
     Tisch selbst ab. */
  window.KASPER_GEMEINSAM_ZUSATZ = {
    stand(){
      const S = ruSpiel();
      return {
        m2s: {ort: 'm2', x: S.offen, y: (S.schritt === 'paare' ? 1 : 0) + 2 * (S.mischung || 1), rot: 0},
        m2w: {ort: 'm2', x: S.war.reduce((s, i) => s | (1 << i), 0), y: 0, rot: 0},
      };
    },
    anwenden(r){
      const S = ruSpiel();
      if (r.karte === 'm2w'){
        S.war = RU.runden.map((_, i) => i).filter(i => r.x & (1 << i));
        kopf(); return true;
      }
      if (r.karte !== 'm2s') return false;
      const schritt = r.y % 2 ? 'paare' : 'suchen', mischung = Math.floor(r.y / 2);
      const neueRunde = r.x !== S.offen || mischung !== S.mischung;
      if (neueRunde) rundeFesthalten();
      S.offen = r.x; S.mischung = mischung;
      if (!S.war.includes(r.x)) S.war.push(r.x);
      if (neueRunde){ S.schritt = schritt; alleZurueck(); return true; }
      if (schritt !== S.schritt){ S.schritt = schritt; kopf(); felder(); }
      return true;
    }
  };

  document.getElementById('zurueck').onclick = () => {
    ruSpiel().schritt = 'suchen';
    melden();
    alleZurueck();
  };
  document.getElementById('pruefen').onclick = () => ruPruefen(RU.runden[ruSpiel().offen]);
}

/* ---------- Mitnehmen: ein Bild je Runde ----------
   Die Anbauten sammeln je Etappe ein Bild; hier gibt es nur EINE Etappe
   mit vielen Runden. Deshalb sagt diese Datei, unter welchem Schluessel
   und Namen das Bild liegt - die laufende Runde -, und haelt es vor jedem
   Wechsel fest. Eine Runde, in der rechts nichts liegt, gibt kein Bild. */
window.m2BildSchluessel = function(){
  const S = ruSpiel();
  const rechts = Object.values(stand.karten).some(s => /^(gef|pa)/.test(s.ort || ''));
  if (!rechts) return null;
  window._ruNamen = window._ruNamen || {};
  const n = S.war.indexOf(S.offen) + 1;
  window._ruNamen[n] = 'Runde ' + n + ' · ' + RU.runden[S.offen].name;
  return n;
};
window.m2BildName = n => (window._ruNamen || {})[n] || ('Runde ' + n);
function rundeFesthalten(){
  if (window.bildSammeln) window.bildSammeln();
}

/* Die Navigation des Kerns zaehlt Etappen. Hier ist es eine - das Spiel. */
(function(){
  const _nav = window.nav;
  window.nav = function(){
    _nav.apply(this, arguments);
    const k = document.querySelectorAll('#nav button')[1];
    if (k && ETAPPEN.length === 1) k.textContent = 'Spiel';
  };
})();

/* Doppelklick: die Karte gross. Nur fuer mich. */
function ruGross(id){
  const d = document.createElement('div');
  d.className = 'rugross';
  d.style.cssText = 'position:fixed;inset:0;z-index:2000000;background:rgba(30,26,20,.45);'
    + 'display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  d.innerHTML = `<img src="karten/${id}.svg" alt="" style="width:min(560px,86vw,calc(86vh / .845));`
    + `background:var(--karte);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.25)">`;
  const zu = () => { d.remove(); document.removeEventListener('keydown', taste); };
  const taste = e => { if (e.key === 'Escape') zu(); };
  d.onclick = zu;
  document.addEventListener('keydown', taste);
  document.body.appendChild(d);
}

/* Pruefen - Rikes Regel: hervorheben, was nicht stimmt, keine Loesung.

   Gefunden und Paare: rot, wenn die Karte die Eigenschaft nicht hat.
   Paare: gruen, wenn Term und Bild zusammengehoeren; gelb, wenn beide die
   Eigenschaft haben, aber nicht zusammengehoeren.
   «Es fehlen noch Karten» - ohne zu sagen, welche oder wie viele. */
function ruPruefen(R){
  document.querySelectorAll('.k').forEach(k => k.classList.remove('ok', 'falsch', 'fastok'));
  const drin = fn => R.funktionen.includes(fn);
  const m = (id, c) => { const el = document.querySelector(`.k[data-id="${id}"]`); if (el) el.classList.add(c); };
  let falsch = 0, gefunden = 0, paare = 0, gelb = 0;
  Object.entries(stand.karten).forEach(([id, s]) => {
    if (!(id in RU.gehoert)) return;
    const o = s.ort || '';
    if (!o.startsWith('gef') && !o.startsWith('pa')) return;
    if (drin(RU.gehoert[id])) gefunden++;
    else { m(id, 'falsch'); falsch++; }
  });
  if (ruSpiel().schritt === 'paare'){
    for (let n = 1; n <= RU_PAARE; n++){
      const ids = Object.entries(stand.karten)
        .filter(([id, s]) => (s.ort || '').startsWith('pa' + n + '/') && id in RU.gehoert)
        .map(([id]) => id).filter(id => drin(RU.gehoert[id]));
      if (ids.length !== 2) continue;
      const [x, y] = ids;
      if (x[0] !== y[0] && RU.gehoert[x] === RU.gehoert[y]){ ids.forEach(id => m(id, 'ok')); paare++; }
      else { ids.forEach(id => m(id, 'fastok')); gelb++; }
    }
  }
  const eins = n => n === 1, t = [];
  if (falsch) t.push(`${falsch} ${eins(falsch) ? 'Karte hat' : 'Karten haben'} die Eigenschaft nicht`);
  if (gefunden < 2 * R.funktionen.length) t.push('es fehlen noch Karten');
  else if (ruSpiel().schritt === 'suchen' && !falsch) t.push('<b>alle gefunden</b> — jetzt Paare bilden');
  if (paare) t.push(`<b>${paare}</b> ${eins(paare) ? 'Paar stimmt' : 'Paare stimmen'}`);
  if (gelb) t.push(`${gelb} ${eins(gelb) ? 'Paar gehört' : 'Paare gehören'} nicht zusammen`);
  if (paare === R.funktionen.length && !falsch) t.push('<b>Runde geschafft</b>');
  document.getElementById('befund').innerHTML = t.join(' · ') || 'Es liegt noch nichts rechts.';
  stand.geprueft = true;
}

ETAPPEN.length = 0;
ETAPPEN.push(eigenschaftsspiel);

/* ───────── Meilenstein 2 · Etappe 2 (Zusatz) — Das Spiegellabor ─────────

   Rike, 2026-09-25: «Bei dem Spiegellabor geht es mir wirklich darum,
   dass wir Funktionen, die sie wirklich benennen oder erzeugen koennen,
   dort austesten koennen» - und dass sie sehen, was z-quer tut.
   Vorbereitet wird PIAs Station 2, Aufgabe 3 («Spiegelung aufstellen»).

   f(z) = a · [z | z̄] + b wird eingetippt, das Labor zeichnet das Bild des
   Dreiecks von Rikes Folien und BENENNT, was herausgekommen ist (Rikes
   Entscheidung vom 2026-09-25) - auch dann, wenn es keine Spiegelung
   ist. Wer z̄ + 3 statt z̄ + 3i tippt, bekommt eine Schubspiegelung und
   liest das dort.

   Eine Aufgabe zeichnet ihr Ziel gestrichelt; wer es trifft, bekommt
   ein Haekchen. Die ersten vier sind Rikes Folien aus «Form und Raum»,
   je als Paar: dieselbe Verschiebung bzw. Drehung einmal mit z (zwei
   Spiegelungen) und einmal mit z̄ (Spiegelung und Verschiebung bzw.
   Drehung) - die «Gegenoperation».

   Etappe 2 ist ZUSATZ (Rike, 2026-09-26). In der Gruppe geht der Stand
   ueber das Brett; in `labor.html` laeuft dieselbe Etappe allein.
*/
const E2 = D.e2 || {};

/* ---------- Komplexe Zahlen lesen ----------
   Angenommen wird, was Studierende tippen: 2, -3i, 1+i, 0,5 - 0,87i,
   i/2, ½(1 + √3 i), √2/2 (1 + i), cis(60°), 2·cis(90). Komma oder
   Punkt, «·» oder «*» oder gar kein Malzeichen. Unbekanntes gibt null. */
const LaborZahl = (function(){
  const C = (r, i) => [r, i || 0];
  const plus = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const minus = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const mal = (p, q) => [p[0]*q[0] - p[1]*q[1], p[0]*q[1] + p[1]*q[0]];
  const durch = (p, q) => { const n = q[0]*q[0] + q[1]*q[1];
    return [(p[0]*q[0] + p[1]*q[1]) / n, (p[1]*q[0] - p[0]*q[1]) / n]; };

  function lesen(text){
    const s = String(text || '').replace(/\s+/g, '').replace(/−/g, '-')
      .replace(/[·×]/g, '*').replace(/,/g, '.').replace(/°/g, '')
      .replace(/½/g, '(1/2)').toLowerCase();
    if (!s) return null;
    let i = 0;
    const sieh = () => s[i];
    function ausdruck(){
      let w = glied();
      while (sieh() === '+' || sieh() === '-'){
        const op = s[i++]; const r = glied();
        w = op === '+' ? plus(w, r) : minus(w, r);
      }
      return w;
    }
    function beginntFaktor(c){ return c && /[0-9.i(√s c]/.test(c); }
    function glied(){
      let w = faktor();
      for (;;){
        if (sieh() === '*'){ i++; w = mal(w, faktor()); }
        else if (sieh() === '/'){ i++; w = durch(w, faktor()); }
        else if (beginntFaktor(sieh())) w = mal(w, faktor());   // 2i, √3i
        else return w;
      }
    }
    function faktor(){
      if (sieh() === '-'){ i++; const w = faktor(); return [-w[0], -w[1]]; }
      if (sieh() === '+'){ i++; return faktor(); }
      return grund();
    }
    function grund(){
      const c = sieh();
      if (c === '('){ i++; const w = ausdruck(); if (sieh() !== ')') throw 0; i++; return w; }
      if (c === 'i'){ i++; return C(0, 1); }
      if (c === '√' || s.startsWith('sqrt', i)){
        i += c === '√' ? 1 : 4;
        const w = grund();
        return C(Math.sqrt(w[0]));
      }
      if (s.startsWith('cis', i)){
        i += 3; const w = grund();
        const g = w[0] * Math.PI / 180;
        return C(Math.cos(g), Math.sin(g));
      }
      const m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i));
      if (m){ i += m[0].length; return C(parseFloat(m[0])); }
      throw 0;
    }
    try {
      const w = ausdruck();
      return i === s.length && isFinite(w[0]) && isFinite(w[1]) ? w : null;
    } catch(e){ return null; }
  }
  return {lesen, plus, minus, mal, durch};
})();

/* ---------- Was ist das fuer eine Abbildung? ----------
   Mit z:  f(z) = a·z + b
     a = 1            Verschiebung um b (oder die Identitaet)
     |a| = 1          Drehung um arg a, Zentrum b : (1 − a)
     sonst            Drehstreckung
   Mit z̄: f(z) = a·z̄ + b, a = cis(φ)
     |a| ≠ 1          keine Spiegelung - es wird auch gestreckt
     a·b̄ + b = 0      Spiegelung an der Geraden durch b/2 unter φ/2
     sonst            Schubspiegelung: Spiegelung an der Achse durch
                      (b − v)/2 unter φ/2 und Verschiebung um v laengs
                      der Achse, v = der Anteil von b in Achsenrichtung */
function laborBenennen(a, b, konj){
  const Z = LaborZahl, eps = 1e-6;
  const betrag = p => Math.hypot(p[0], p[1]);
  const grad = p => Math.atan2(p[1], p[0]) * 180 / Math.PI;
  const k = (x, s) => { let t = (Math.abs(x) < 5e-7 ? 0 : x).toFixed(s === undefined ? 2 : s);
    if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, '');
    return t.replace('.', ',').replace('-', '−'); };
  const zahl = p => {
    const r = Math.abs(p[0]) > eps, j = Math.abs(p[1]) > eps;
    if (!r && !j) return '0';
    const im = Math.abs(Math.abs(p[1]) - 1) < eps ? (p[1] < 0 ? '−i' : 'i') : k(p[1]) + 'i';
    if (!j) return k(p[0]);
    if (!r) return im;
    return k(p[0]) + (p[1] < 0 ? ' − ' + im.replace('−', '') : ' + ' + im);
  };
  const gerade = (punkt, winkel) => {
    let w = ((winkel % 180) + 180) % 180;
    if (Math.abs(w - 180) < 1e-6) w = 0;
    if (Math.abs(w) < 1e-6)
      return Math.abs(punkt[1]) < 1e-6 ? 'der x-Achse' : 'der Geraden y = ' + k(punkt[1]);
    if (Math.abs(w - 90) < 1e-6)
      return Math.abs(punkt[0]) < 1e-6 ? 'der y-Achse' : 'der Geraden x = ' + k(punkt[0]);
    // durch den Ursprung?
    const kreuz = punkt[0] * Math.sin(w * Math.PI / 180) - punkt[1] * Math.cos(w * Math.PI / 180);
    if (Math.abs(kreuz) < 1e-6) return 'der Ursprungsgeraden unter ' + k(w, 1) + '°';
    return 'der Geraden durch (' + k(punkt[0]) + ' | ' + k(punkt[1]) + ') unter ' + k(w, 1) + '°';
  };

  if (betrag(a) < eps) return {art: 'punkt', text: 'Alles fällt auf einen einzigen Punkt, nämlich b.'};
  if (!konj){
    if (Math.abs(a[0] - 1) < eps && Math.abs(a[1]) < eps)
      return betrag(b) < eps ? {art: 'identitaet', text: 'Nichts bewegt sich: die Identität.'}
        : {art: 'verschiebung', text: 'Eine <b>Verschiebung</b> um ' + zahl(b) + '.'};
    const z0 = Z.durch(b, Z.minus([1, 0], a));
    const zentrum = '(' + k(z0[0]) + ' | ' + k(z0[1]) + ')';
    if (Math.abs(betrag(a) - 1) < eps)
      return {art: 'drehung', text: 'Eine <b>Drehung</b> um ' + k(grad(a), 1) + '° um ' + zentrum + '.'};
    return {art: 'drehstreckung', text: 'Eine <b>Drehstreckung</b>: Faktor ' + k(betrag(a)) +
      ', Winkel ' + k(grad(a), 1) + '°, Zentrum ' + zentrum + '.'};
  }
  if (Math.abs(betrag(a) - 1) > eps)
    return {art: 'keine', text: '<b>Keine Spiegelung</b>: |a| = ' + k(betrag(a)) +
      ' — die Figur wird dabei auch gestreckt. Für eine Spiegelung muss |a| = 1 sein.'};
  const phi = grad(a), u = [Math.cos(phi / 2 * Math.PI / 180), Math.sin(phi / 2 * Math.PI / 180)];
  const laengs = b[0] * u[0] + b[1] * u[1];              // Anteil von b laengs der Achse
  const v = [laengs * u[0], laengs * u[1]];
  const punkt = [(b[0] - v[0]) / 2, (b[1] - v[1]) / 2];
  const achse = gerade(punkt, phi / 2);
  if (Math.abs(laengs) < 1e-6)
    return {art: 'spiegelung', text: 'Eine <b>Spiegelung</b> an ' + achse + '.',
            achse: {punkt, winkel: phi / 2}};
  return {art: 'schub', text: '<b>Keine reine Spiegelung</b>: gespiegelt an ' + achse +
    ' und dazu <b>längs dieser Geraden</b> um ' + zahl(v) + ' verschoben — eine Schubspiegelung.',
    achse: {punkt, winkel: phi / 2}};
}

/* ---------- Die Etappe ---------- */
const E2STIL = `
.buehne.m2l{gap:14px;align-items:stretch}
.buehne.m2l > .haelfte{flex:1 1 0;display:flex;flex-direction:column;overflow:auto;
  padding:0 12px 12px}
.buehne.m2l > .haelfte.bild{flex:1.15 1 0;align-items:center}
.buehne.m2l > .haelfte > *{flex:0 0 auto}
.buehne.m2l .quer{text-decoration:overline;text-decoration-thickness:1.5px}
/* Das Bild nimmt die ganze Breite seiner Haelfte, aber nie mehr, als
   die Hoehe hergibt - quadratisch. */
.buehne.m2l #lbild{width:100%;max-width:min(680px, calc(100vh - 240px));margin:0 auto}
.buehne.m2l svg{width:100%;height:auto;display:block}
.buehne.m2l .aufgaben{display:flex;flex-direction:column;gap:6px;margin:6px 0 10px}
.buehne.m2l .aufgaben h4{margin:8px 0 2px;font-size:12.5px;color:var(--matt);
  font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.buehne.m2l .aufgaben button{font:inherit;font-size:13.5px;text-align:left;
  padding:6px 10px;border:1.4px solid var(--linie);border-radius:10px;
  background:var(--karte);cursor:pointer;color:var(--tinte);line-height:1.35}
.buehne.m2l .aufgaben button.an{border-color:var(--akzent);background:#fff;
  box-shadow:0 0 0 2px rgba(0,125,87,.12)}
.buehne.m2l .aufgaben button .ok{color:#2E7D32;font-weight:700;margin-left:6px}
.buehne.m2l .formel{display:flex;align-items:center;flex-wrap:wrap;gap:8px;
  font-size:22px;margin:4px 0 8px}
.buehne.m2l .formel input{font:inherit;font-size:19px;width:7.5em;padding:4px 8px;
  border:2px solid var(--linie);border-radius:8px;background:#fff;text-align:center}
.buehne.m2l .formel input.falsch{border-color:#b3261e}
.buehne.m2l .zz{display:inline-flex;border:1.6px solid var(--linie);border-radius:10px;
  overflow:hidden}
.buehne.m2l .zz button{font:inherit;font-size:20px;padding:2px 14px;border:none;
  background:var(--karte);cursor:pointer;color:var(--matt)}
.buehne.m2l .zz button.an{background:var(--akzent);color:#fff}
.buehne.m2l .ergebnis{font-size:15px;line-height:1.5;padding:8px 12px;
  border-left:4px solid var(--akzent);background:#fff;border-radius:6px;min-height:2.6em}
.buehne.m2l .treffer{color:#2E7D32;font-weight:700}
.buehne.m2l .hilfe{font-size:12.5px;color:var(--matt);margin-top:6px}
.buehne.m2l .auftext{font-size:14px;margin:0 0 6px}
body.nurlabor #nav button:not([aria-current="true"]), body.nurlabor .auftrag .weiter{display:none}
`;

const LABOR_FARBE = {ziel: '#9867A5', achse: '#007D57'};

function etappe2(){
  if (!document.getElementById('m2lstil')){
    const t = document.createElement('style'); t.id = 'm2lstil'; t.textContent = E2STIL;
    document.head.appendChild(t);
  }
  // GEAENDERT (2026-10-10): Etappe 2 des Meilensteins sind jetzt die
  // Spiegelungen (etappen_spiegel.js). Das Labor lebt nur noch in
  // labor.html und traegt seinen Auftrag selbst.
  const a = {rang: 'Spiegellabor', auftrag: E2.auftrag || ''};
  const L = stand.labor = stand.labor || {aufgabe: null, a: '1', b: '0', konj: true};
  const b = document.getElementById('buehne');
  window._nachAblegen = null;

  const gruppen = [];
  (E2.aufgaben || []).forEach(x => {
    let g = gruppen.find(g => g.name === x.gruppe);
    if (!g){ g = {name: x.gruppe, liste: []}; gruppen.push(g); }
    g.liste.push(x);
  });

  b.innerHTML = `
    <div class="auftrag"><span class="rang">${a.rang}</span>
      <span class="titel">Spiegellabor</span>
      <span class="text">${a.auftrag}</span></div>
    <div class="buehne m2l">
      <div class="haelfte">
        <div class="formel">f(z) =
          <input id="la" value="" spellcheck="false" title="a — zum Beispiel 1, −1, i, cis(60°)">
          ·
          <span class="zz"><button data-k="0">z</button><button data-k="1" title="z quer — das komplex Konjugierte"><span class="quer">z</span></button></span>
          +
          <input id="lb" value="" spellcheck="false" title="b — zum Beispiel 0, 6i, 4">
        </div>
        <div class="ergebnis" id="lerg"></div>
        <div class="hilfe">Tippen wie auf Papier: <i>i</i>, <i>−1</i>, <i>6i</i>, <i>0,5 + 0,87i</i>,
          <i>cis(60°)</i>, <i>½(1 + √3 i)</i>.</div>
        <div class="aufgaben">
          <button data-a="" class="${L.aufgabe ? '' : 'an'}">Frei ausprobieren</button>
          ${gruppen.map(g => `<h4>${g.name}</h4>` + g.liste.map(x =>
            `<button data-a="${x.id}" class="${L.aufgabe === x.id ? 'an' : ''}">${x.text}<span class="ok"></span></button>`).join('')).join('')}
        </div>
      </div>
      <div class="haelfte bild"><div id="lbild"></div></div>
    </div>
    <div class="leiste"></div>`;
  _leisteChrome(b);

  const ia = b.querySelector('#la'), ib = b.querySelector('#lb');
  ia.value = L.a; ib.value = L.b;

  function zeichnen(){
    const va = LaborZahl.lesen(ia.value), vb = LaborZahl.lesen(ib.value);
    ia.classList.toggle('falsch', !va); ib.classList.toggle('falsch', !vb);
    b.querySelectorAll('.zz button').forEach(x =>
      x.classList.toggle('an', (x.dataset.k === '1') === !!L.konj));
    b.querySelectorAll('.aufgaben button').forEach(x =>
      x.classList.toggle('an', (x.dataset.a || null) === (L.aufgabe || null)));

    const ziel = (E2.aufgaben || []).find(x => x.id === L.aufgabe) || null;
    const S = 480, lo = -6, hi = 6, m = S / (hi - lo);
    const X = p => ((p[0] - lo) * m).toFixed(1), Y = p => ((hi - p[1]) * m).toFixed(1);
    const pkt = p => X(p) + ',' + Y(p);
    const f = (aa, bb, kk) => z => LaborZahl.plus(LaborZahl.mal(aa, kk ? [z[0], -z[1]] : z), bb);
    const T = E2.dreieck || [[2, 1], [4, 1], [4, 2]];
    const teile = [];
    for (let g = lo; g <= hi; g++){
      const achse = g === 0;
      teile.push(`<line x1="${X([g,0])}" y1="0" x2="${X([g,0])}" y2="${S}" stroke="${achse ? '#b9ac97' : '#efeae1'}" stroke-width="${achse ? 1.3 : .8}"/>`);
      teile.push(`<line x1="0" y1="${Y([0,g])}" x2="${S}" y2="${Y([0,g])}" stroke="${achse ? '#b9ac97' : '#efeae1'}" stroke-width="${achse ? 1.3 : .8}"/>`);
      if (g && g % 2 === 0){
        teile.push(`<text x="${X([g,0])}" y="${+Y([0,0]) + 14}" font-size="11" fill="#6c6357" text-anchor="middle">${g}</text>`);
        teile.push(`<text x="${+X([0,0]) - 5}" y="${+Y([0,g]) + 4}" font-size="11" fill="#6c6357" text-anchor="end">${g}</text>`);
      }
    }
    const linie = (achse, farbe, strich) => {
      const w = achse.winkel * Math.PI / 180, d = [Math.cos(w) * 20, Math.sin(w) * 20];
      const p = achse.punkt;
      return `<line x1="${X([p[0]-d[0], p[1]-d[1]])}" y1="${Y([p[0]-d[0], p[1]-d[1]])}" x2="${X([p[0]+d[0], p[1]+d[1]])}" y2="${Y([p[0]+d[0], p[1]+d[1]])}" stroke="${farbe}" stroke-width="2" ${strich ? 'stroke-dasharray="7 5"' : ''}/>`;
    };
    // Das Original, wie auf den Karten: graue Flaeche.
    teile.push(`<polygon points="${T.map(pkt).join(' ')}" fill="#8c8579" fill-opacity=".2" stroke="#8c8579" stroke-width="2"/>`);
    ['A', 'B', 'C'].forEach((n, j) => teile.push(`<text x="${+X(T[j]) + (j ? 6 : -14)}" y="${+Y(T[j]) + (j === 2 ? -6 : 16)}" font-size="13" fill="#6c6357">${n}</text>`));

    let treffer = false;
    if (ziel){
      const zf = f(ziel.a, ziel.b, ziel.konj), zb = T.map(zf);
      const zn = laborBenennen(ziel.a, ziel.b, ziel.konj);
      if (zn.achse && ziel.gerade) teile.push(linie(zn.achse, LABOR_FARBE.ziel, true));
      teile.push(`<polygon points="${zb.map(pkt).join(' ')}" fill="none" stroke="${LABOR_FARBE.ziel}" stroke-width="2.4" stroke-dasharray="7 5"/>`);
      if (va && vb){
        const eigen = T.map(f(va, vb, L.konj));
        treffer = eigen.every((p, j) => Math.hypot(p[0] - zb[j][0], p[1] - zb[j][1]) < 0.03);
      }
    }
    let text = '';
    if (va && vb){
      const bild = T.map(f(va, vb, L.konj));
      const n = laborBenennen(va, vb, L.konj);
      if (n.achse) teile.push(linie(n.achse, LABOR_FARBE.achse, false));
      teile.push(`<polygon points="${bild.map(pkt).join(' ')}" fill="none" stroke="#2b2622" stroke-width="2.6" stroke-linejoin="round"/>`);
      ['A′', 'B′', 'C′'].forEach((nm, j) => teile.push(`<text x="${+X(bild[j]) + 6}" y="${+Y(bild[j]) - 6}" font-size="13" font-weight="600" fill="#2b2622">${nm}</text>`));
      text = n.text;
      if (ziel) text += treffer ? ' <span class="treffer">✓ Das ist die gesuchte Abbildung.</span>'
                                : ' <span style="color:var(--matt)">— noch nicht das Ziel (gestrichelt).</span>';
    } else {
      text = '<span style="color:#b3261e">Diese Zahl kann ich nicht lesen.</span>';
    }
    if (treffer){
      L.geloest = L.geloest || {};
      L.geloest[ziel.id] = true;
    }
    b.querySelectorAll('.aufgaben button').forEach(x => {
      const o = x.querySelector('.ok');
      if (o) o.textContent = (L.geloest || {})[x.dataset.a] ? '✓' : '';
    });
    b.querySelector('#lerg').innerHTML = (ziel ? `<div class="auftext">${ziel.text}</div>` : '') + text;
    b.querySelector('#lbild').innerHTML = `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${S}" height="${S}" fill="#fff" stroke="#e4d9c7"/>${teile.join('')}</svg>`;
  }

  function melden(){
    sichern();
    if (window.KASPER_GEMEINSAM_MELDEN) window.KASPER_GEMEINSAM_MELDEN();
  }
  // Tippen zeichnet sofort, geteilt wird beim Verlassen des Feldes.
  [ia, ib].forEach(inp => {
    inp.addEventListener('input', () => { L[inp.id === 'la' ? 'a' : 'b'] = inp.value; zeichnen(); });
    inp.addEventListener('change', melden);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
  });
  b.querySelectorAll('.zz button').forEach(x => x.onclick = () => {
    L.konj = x.dataset.k === '1'; zeichnen(); melden();
  });
  b.querySelectorAll('.aufgaben button').forEach(x => x.onclick = () => {
    L.aufgabe = x.dataset.a || null; zeichnen(); melden();
  });

  /* Das gemeinsame Brett: eine Zeile fuer a, eine fuer b (mal tausend,
     das Brett traegt ganze Zahlen), eine fuer z/z̄ und die Aufgabe.
     Getippter Text geht dabei als ZAHL hinueber - wer «cis(60°)» tippt,
     sieht bei den anderen «0,5 + 0,866i». */
  const AUFG = (E2.aufgaben || []).map(x => x.id);
  const zuText = p => {
    const k = x => String(Math.round(x * 1000) / 1000).replace('.', ',').replace('-', '−');
    if (Math.abs(p[1]) < 1e-9) return k(p[0]);
    const im = Math.abs(Math.abs(p[1]) - 1) < 1e-9 ? 'i' : k(Math.abs(p[1])) + 'i';
    if (Math.abs(p[0]) < 1e-9) return (p[1] < 0 ? '−' : '') + im;
    return k(p[0]) + (p[1] < 0 ? ' − ' : ' + ') + im;
  };
  window.KASPER_GEMEINSAM_ZUSATZ = {
    stand(){
      const va = LaborZahl.lesen(L.a), vb = LaborZahl.lesen(L.b);
      const aus = {m2lk: {ort: 'm2l', x: L.konj ? 1 : 0, y: AUFG.indexOf(L.aufgabe) + 1, rot: 0}};
      if (va) aus.m2la = {ort: 'm2l', x: Math.round(va[0] * 1000), y: Math.round(va[1] * 1000), rot: 0};
      if (vb) aus.m2lb = {ort: 'm2l', x: Math.round(vb[0] * 1000), y: Math.round(vb[1] * 1000), rot: 0};
      return aus;
    },
    anwenden(r){
      if (!/^m2l[kab]$/.test(r.karte)) return false;
      if (r.karte === 'm2lk'){ L.konj = r.x === 1; L.aufgabe = AUFG[r.y - 1] || null; }
      else {
        const w = [r.x / 1000, r.y / 1000];
        const eigen = LaborZahl.lesen(r.karte === 'm2la' ? L.a : L.b);
        // Nur ersetzen, wenn der Wert wirklich ein anderer ist - sonst
        // wuerde «cis(60°)» beim Echo zu «0,5 + 0,866i».
        if (!eigen || Math.hypot(eigen[0] - w[0], eigen[1] - w[1]) > 5e-4){
          if (r.karte === 'm2la') L.a = zuText(w); else L.b = zuText(w);
        }
      }
      if (document.activeElement !== ia) ia.value = L.a;
      if (document.activeElement !== ib) ib.value = L.b;
      zeichnen();
      return true;
    }
  };

  zeichnen();
}

/* GEAENDERT (2026-10-10): kein ETAPPEN.push mehr - Etappe 2 des
   Meilensteins ist etappeSpiegel. Das Labor setzt sich nur in labor.html
   an deren Stelle (unten). */

/* ---------- labor.html: das Labor allein ----------
   Rike, 2026-09-26: fuer alle zum Mitnehmen eine eigene Adresse, die nur
   das Labor oeffnet - ohne Quartette, ohne Gruppenwahl, ohne Brett. Die
   Seite ist dieselbe; `window.M2_NUR_LABOR` setzt sie der Bau davor. */
if (window.M2_NUR_LABOR){
  document.body.classList.add('nurlabor');
  ETAPPEN[1] = etappe2;
  const st = document.createElement('style'); st.textContent = E2STIL;
  document.head.appendChild(st);
  /* FEHLERBEHOBEN (2026-09-26, im Browser gesehen): Nur das Startfeld zu
     ersetzen genuegte nicht. Wer vorher die Meilensteinseite offen hatte,
     brachte deren gespeicherten Stand mit, und `los()` sprang direkt in
     Etappe 1. Jetzt steht die Etappe bei JEDEM Aufruf fest - und der
     Speicher ist ein eigener (D.stueck, gesetzt in flaeche.labor_seite). */
  const _los = window.los;
  window.los = function(){
    stand.aufnahme = false; stand.etappe = 1;
    return _los.apply(this, arguments);
  };
  window.startfeld = function(){ los(); };
}
