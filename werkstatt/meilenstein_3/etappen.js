/* ZUSAMMENGELEGT beim Bauen - nicht von Hand aendern.
   1. themen/meilenstein_3/etappen_m3.js
   2. themen/meilenstein_3/anbauten.js
   3. themen/meilenstein_3/notizblatt_m3.js */

/* ───────── Meilenstein 3 · Iteratoren und Zyklen ─────────

   NEU (Rike, 2026-10-29). Spezifikation: themen/meilenstein_3/thema.md.

     Etappe 1  Iteratoren in vier Felder sortieren; bei den zyklischen
               die Laenge an die Karte schreiben. Jede Karte ploppt auf
               (▶): Bahnen simulieren, umschaltbar «a und b».
     Etappe 2  Zyklen zaehlen unter z -> z^2: je Laenge n ein Topf mit
               Gleichung, Startwerten, Zyklusfaechern und Rechnung;
               dazu das Kreisbild, das aus der Sortierung entsteht.

   Gebaut auf dem Werkstattgeruest (kern/flaechen) wie Meilenstein 1 und
   2. Das Aussehen des neuen SORT-Tisches (Eichenplatte, Kartenbild
   «Band», Lesefenster) ist hier NACHGEBAUT, nicht eingebunden -
   kern/tisch bleibt unberuehrt (Rike, 2026-10-29: «Werkstatt + Kopie»).

   Synchronisation: noch nicht ueberlegt (thema.md 5). Was hier liegt,
   folgt aber schon der Regel, die gemeinsam.js braucht: Jede Karte hat
   einen Ort mit Namen, keine Pixel. Auf dem Tisch liegt sie auf einem
   festen Platz, den jeder Rechner selbst ausrechnet. */
const M3 = D.m3 || {};

/* «Ich uebe allein» (Rike, 2026-10-30): ein eigener Speicherplatz, damit
   Allein-Ueben und Gruppe sich nicht gegenseitig den Tisch umlegen. Der
   Kern nennt seinen Platz _SPEICHER (eine Konstante); hier wird nur
   dieser eine Schluessel umgeleitet. */
const M3_ALLEIN_HIER = !new URLSearchParams(location.search).get('raum')
  && new URLSearchParams(location.search).get('allein') === '1';
/* FEHLERBEHOBEN (Rike, 2026-10-30: «wenn ich auf allein gehe, dann sind
   gar keine Karten da»): Die erste Fassung wies localStorage.getItem usw.
   NEU ZU - ein Speicherobjekt nimmt so etwas aber als gewoehnlichen
   Eintrag «getItem» auf, die Umleitung griff nie, und allein erbte den
   Gruppenstand. Jetzt am Prototyp, nur fuer diesen einen Schluessel; die
   verirrten Eintraege werden weggeraeumt. */
try {
  ['getItem', 'setItem', 'removeItem'].forEach(k => {
    if (Object.prototype.hasOwnProperty.call(localStorage, k)) Storage.prototype.removeItem.call(localStorage, k);
  });
} catch(_) {}
if (M3_ALLEIN_HIER){
  try {
    const umleiten = k => k === _SPEICHER ? k + ':allein' : k;
    const P = Storage.prototype;
    const g = P.getItem, st = P.setItem, rm = P.removeItem;
    P.getItem = function(k){ return g.call(this, umleiten(k)); };
    P.setItem = function(k, v){ return st.call(this, umleiten(k), v); };
    P.removeItem = function(k){ return rm.call(this, umleiten(k)); };
  } catch(_) {}
}
const M3_RAND = 6;
const M3_KMIN = 56, M3_KMAX = 150;
const M3_SEITE = 0.845;              // Hoehe : Breite der Karten

const STIL = `
.buehne.m3{align-items:stretch}
.buehne.m3 > .haelfte{flex:1 1 0;display:flex;flex-direction:column;overflow:hidden}
.buehne.m3 > .haelfte > .marke{position:static;flex:0 0 auto}
.buehne.m3 > .haelfte > .blatt{flex:1 1 auto;min-height:0;min-width:0;overflow:hidden}
.buehne.m3 > .haelfte.rechts{flex:1.55 1 0}
/* Die Eichenplatte des neuen Tisches (Kopie von kern/tisch/eiche.jpg) */
.buehne.m3 > .haelfte:first-child > .blatt{background:#8a6a45 url(eiche.jpg) center/cover;
  border-radius:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}
.buehne.m3 #feld{position:static;display:flex;flex-direction:column;gap:8px;
  box-sizing:border-box;padding:2px 6px 8px;overflow:auto}
.buehne.m3 .paar > .k, .buehne.m3 .m3slot > .k{width:var(--m3karte)}
/* GEAENDERT (Rike, 2026-10-29: «mit Blick auf die SORT-Gestaltung ... nur
   am Rand Farbe, mehr Schatten, so gross wie moeglich, eher alles ohne
   abgerundete Seiten»): Karten eckig, Schatten wie am SORT-Tisch
   (kern/tisch/tisch.css, abgeschrieben). */
.buehne.m3 .k{border-radius:0;background:transparent;box-shadow:none}
.buehne.m3 .k img{border-radius:0;
  filter:drop-shadow(0 1px 1.5px rgba(60,40,10,.22)) drop-shadow(0 4px 9px rgba(60,40,10,.22))}
.m3sim .seite img{border-radius:0 !important;
  filter:drop-shadow(0 1px 1.5px rgba(60,40,10,.22)) drop-shadow(0 4px 9px rgba(60,40,10,.22))}
.buehne.m3 .blatt[data-ort^="tisch"] > .k{width:var(--m3vorrat, var(--kb))}
.buehne.m3 .paar{position:relative;left:auto;top:auto;background:rgba(255,255,255,.5);
  border-radius:0;border:1px dashed rgba(0,0,0,.14);box-sizing:border-box}
.buehne.m3 .k .sim{position:absolute;right:3px;bottom:3px;width:24px;height:24px;
  border-radius:2px;border:1px solid rgba(0,0,0,.18);background:#fff;color:#447AAF;
  font-size:11px;line-height:22px;text-align:center;cursor:pointer;padding:0;z-index:2}
.buehne.m3 .k .sim:hover{background:#447AAF;color:#fff}

/* Etappe 1: vier Felder */
.m3felder{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.m3zone{border-radius:0;padding:5px 6px 6px;border:1px solid rgba(0,0,0,.07)}
.m3zone h4{margin:0 0 5px;font-family:var(--hand);font-weight:400;font-size:16px;color:var(--tinte)}
.m3zone.konv{background:#E8E0F3}.m3zone.div{background:#DDEFE2}
.m3zone.zykl{background:#DCE8F6}.m3zone.ab{background:#F6E7D2}
.m3gitter{display:grid;gap:4px;justify-content:start}
.m3gitter.feld{position:static;padding:0;border:none;background:none;height:auto;min-height:0}
.m3notiz{display:block;width:100%;box-sizing:border-box;margin-top:2px;font:inherit;font-size:12px;
  padding:2px 5px;border:1px solid rgba(0,0,0,.15);border-radius:0;background:#fff}
.m3notiz[hidden]{display:block;visibility:hidden}

/* Etappe 2: Toepfe */
/* Die Marke ueber der Haelfte ist im Kern durchlaessig (pointer-events:none);
   die Reiter darin muessen greifbar sein. */
.m3reiter{display:flex;gap:6px;flex-wrap:wrap;align-items:center;pointer-events:auto}
.m3reiter button{font:inherit;font-size:13px;padding:3px 12px;border-radius:2px;
  border:1.4px solid var(--linie);background:var(--karte);cursor:pointer;color:var(--tinte)}
.m3reiter button.an{border-color:#B5762F;color:#B5762F;font-weight:600}
.m3kopf{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
.m3glplatz{display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:var(--matt)}
.m3rechnung{font-size:14px;line-height:2.1;color:var(--tinte);background:#FFF8EC;
  border:1px solid rgba(0,0,0,.08);border-radius:0;padding:4px 10px;flex:1 1 260px}
.m3rechnung input{font:inherit;width:3.2em;text-align:center;padding:1px 3px;
  border:1px solid rgba(0,0,0,.25);border-radius:0;background:#fff}
.m3mitte{display:flex;gap:10px;align-items:flex-start}
.m3faecher{display:flex;flex-wrap:wrap;gap:6px;flex:1 1 auto;align-content:flex-start}
.m3fach{border-radius:0;padding:3px 5px 5px;background:rgba(255,255,255,.65);
  border:1px solid rgba(0,0,0,.08);border-top:4px solid #cfc8bc}
.m3fach h5{margin:0 0 3px;font-size:11.5px;font-weight:600;color:var(--matt)}
/* Farbe erst, wenn der Zyklus fertig ist (Rike, 2026-10-29: zu viele
   Streifen) - dann dieselbe wie sein Linienzug im Kreis. */
.m3fach.fertig{border-top-color:var(--fach)}
.m3fach.fertig h5{color:var(--fach)}
.m3fach.bekannt{--fach:#8c8579}
.m3fach .feld{position:static;display:grid;gap:3px;padding:0;border:none;background:none;height:auto;min-height:0}
.m3kreis{flex:0 0 auto;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:0}
/* Etappe 2, Teil 1: Zeilen je Laenge, daneben der Kreis */
.m3legen{display:flex;gap:10px;align-items:flex-start}
/* Der Kreis bleibt beim Rollen durch die Zeilen stehen. */
.m3legen > canvas.m3kreis{position:sticky;top:0}
.m3reihen{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-width:0}
.m3reihe{background:#F6E7D2;padding:4px 6px 6px}
.m3reihe h4{font-size:14px;margin:0 0 3px}
/* Die Farbe gehoert dem Zyklus (Rike, 2026-10-29): Die Startwerte sind
   weiss, das Fach traegt die Farbe seines Linienzugs im Kreis. Fertig
   heisst: das Fach leicht in seiner Farbe getoent. */
.m3fach.fertig{background:color-mix(in srgb, var(--fach) 14%, #fff)}
/* Etappe 2, Teil 1: Bahnen */
.m3bahn{min-width:0;overflow:hidden;padding:3px 5px 5px;background:rgba(255,255,255,.65);border:1px solid rgba(0,0,0,.08);
  border-left:4px solid #cfc8bc}
.m3bahn h5{margin:0 0 3px;font-size:11.5px;font-weight:600;color:var(--matt)}
.m3bahn .feld{position:static;display:grid;gap:3px 14px;padding:0;border:none;background:none;height:auto;min-height:0}
.m3bahn.fertig{border-left-color:var(--fach);background:color-mix(in srgb, var(--fach) 12%, #fff)}
.m3bahn.fertig h5{color:var(--fach)}
.buehne.m3 .paar.pfeilvor{overflow:visible}
.buehne.m3 .paar.pfeilvor::before{content:'→';position:absolute;left:-13px;top:50%;transform:translateY(-50%);
  font-size:13px;color:var(--matt)}
.m3kreisspalte{position:sticky;top:0;display:flex;flex-direction:column;gap:6px;flex:0 0 auto}
.m3gefunden{font-size:12.5px;color:var(--tinte);display:flex;flex-direction:column;gap:2px}
.m3werkzeug{display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap}
.m3wegknoepfe{display:flex;flex-direction:column;gap:5px;align-items:flex-start}
.m3knopf.an{background:#B5762F;color:#fff}
.m3tabelle tr.an td{background:rgba(181,118,47,.12)}
.m3uebrig{font-size:13px;font-weight:600;margin-top:4px}
.m3tabelle tr.m3zwischen td{background:#FFF1C9;white-space:normal;padding:6px 8px;font-size:13px}
.m3tabelle tr.m3zwischen .m3knopf{margin-left:8px}
.m3tabelle tr.allein td{background:rgba(255,255,255,.55)}
.m3vergleich{margin-top:8px}
.m3vergleich td{font-variant-numeric:tabular-nums}
.m3vergleich td.wer{font-weight:600;color:var(--matt)}
.m3knopf.leise{border-color:transparent;color:var(--matt);text-decoration:underline}
/* Etappe 2, Teil 2: die Tabelle */
.m3tabelle{border-collapse:collapse;font-size:13.5px;width:100%}
.m3tabelle th{font-weight:600;font-size:12px;color:var(--matt);text-align:left;padding:3px 5px;
  border-bottom:1px solid rgba(0,0,0,.12)}
.m3tabelle td{padding:4px 5px;border-bottom:1px solid rgba(0,0,0,.06);white-space:nowrap}
.m3tabelle td.n{font-weight:700;text-align:center}
.m3tabelle td.gel{text-align:center;color:var(--matt)}
.m3tabelle input{font:inherit;text-align:center;padding:1px 3px;border:1px solid rgba(0,0,0,.25);
  border-radius:0;background:#fff}
.m3tabelle sup input{font-size:11px;padding:0 2px}
.m3best{margin-top:8px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.m3knopf{font:inherit;font-size:12.5px;padding:3px 12px;border-radius:2px;cursor:pointer;
  border:1.4px solid #B5762F;background:#fff;color:#B5762F}
.m3still{font-size:12.5px;color:var(--matt)}

/* Das Lesefenster: Bahnen simulieren (Form vom neuen Tisch) */
.m3sim{position:fixed;inset:0;z-index:2147480000;background:rgba(40,30,20,.35);
  display:flex;align-items:center;justify-content:center}
.m3sim .fenster{background:var(--karte, #fffefb);border-radius:0;border-top:4px solid #B5762F;
  box-shadow:0 10px 40px rgba(0,0,0,.25);padding:12px 14px;display:flex;gap:14px;
  max-width:96vw;max-height:94vh;overflow:auto}
.m3sim .seite{display:flex;flex-direction:column;gap:8px;width:230px}
.m3sim .seite img{width:100%;border-radius:8px}
.m3sim .seite button{font:inherit;font-size:13px;padding:5px 10px;border-radius:2px;cursor:pointer;
  border:1.4px solid var(--linie);background:#fff;color:var(--tinte)}
.m3sim .seite button.an{border-color:#B5762F;color:#B5762F;font-weight:600}
.m3sim .werte{font-size:12.5px;color:var(--matt);font-variant-numeric:tabular-nums;line-height:1.5;
  height:150px;overflow:auto}
.m3sim .wink{font-size:12.5px;color:var(--matt);margin:0}
.m3sim canvas{background:#fff;border-radius:0;border:1px solid rgba(0,0,0,.08);cursor:crosshair;
  touch-action:none}
.m3sim .zu{align-self:flex-end}
.m3sim .reihe{display:flex;gap:6px}
.m3sim .reihe button{flex:1 1 0}
.m3sim .zoom button{padding:5px 4px}
.m3sim .seite button.an{border-color:#7A5AA6;color:#7A5AA6;font-weight:600}
.m3sim .m3leitzeile{background:#2b2622;color:#fff;font-size:12.5px;padding:6px 8px;
  display:flex;flex-direction:column;gap:6px}
.m3sim .m3leitzeile button{background:#fff;color:#2b2622}
.m3sim .m3gemeinsam{background:#F6E7D2;font-size:12.5px;padding:6px 8px;margin:0}
.m3sim.folgt canvas.haupt{cursor:default}
/* NEU (Rike, 2026-10-30, Fuehrungs-Vorschlag A): die Simulation als feste
   Spalte rechts neben dem Tisch, nicht mehr als Fenster. */
body.m3gedockt #buehne{margin-right:var(--m3dock)}
/* Schmales Fenster (etwa neben Zoom): die Spalte liegt UEBER dem Tisch
   und laesst sich schliessen; ein Griff rechts holt sie zurueck. */
body.m3gedockt.m3eng #buehne{margin-right:0}
body.m3eng .m3sim.dock{box-shadow:-8px 0 30px rgba(0,0,0,.25)}
body.m3dockzu .m3sim.dock{display:none}
.m3sim .dockzu{display:none;align-self:flex-end}
body.m3eng .m3sim .dockzu{display:block}
.m3dockgriff{display:none;position:fixed;right:0;top:50%;z-index:41;writing-mode:vertical-rl;
  background:#B5762F;color:#fff;border:none;border-radius:4px 0 0 4px;padding:14px 7px;
  font:600 13px/1 "Source Sans 3",system-ui,sans-serif;cursor:pointer}
body.m3eng.m3gedockt.m3dockzu .m3dockgriff{display:block}
.m3sim.dock{position:fixed;top:var(--m3docktop,0px);right:0;bottom:0;left:auto;width:var(--m3dock);
  background:none;display:block;z-index:40}
.m3sim.dock .fenster{height:100%;max-height:none;max-width:none;display:block;overflow:auto;
  border-top:none;border-left:4px solid #B5762F;box-shadow:-4px 0 18px rgba(0,0,0,.08);padding:10px 12px}
.m3sim.dock .seite{width:auto;gap:7px}
.m3sim.dock .kopfzeile img{max-height:96px;width:auto;max-width:100%;display:block}
.m3sim.dock .m3term{margin:0}
.m3sim.dock .werte{height:auto;max-height:110px}
.m3sim.dock .reihe .zoom{display:flex;gap:4px;flex:0 0 auto}
.m3sim.dock .reihe .zoom button{flex:0 0 auto;min-width:2.2em}
.m3sim.dock .leer{color:var(--matt);font-size:14px;line-height:1.5;margin-top:24px}
.m3dreh{border-top:1px solid var(--linie);padding-top:4px}
.m3dreh > summary{cursor:pointer;font-weight:600;font-size:13.5px;padding:6px 0;color:#7A5AA6}
.m3dreh[open] > summary{margin-bottom:6px}
.m3dreh .m3selbst{margin-top:6px}
.m3sim.dock canvas.m3akreis{width:200px;height:200px;align-self:center}
.m3leitstreifen{flex-basis:100%;display:flex;gap:10px;align-items:center;flex-wrap:wrap;
  background:#2b2622;color:#fff;font-size:12.5px;padding:5px 10px;margin-top:4px}
.m3leitstreifen .leitmarke{font-weight:700;letter-spacing:.03em}
.m3leitstreifen button{font:inherit;font-size:12.5px;padding:2px 10px;border-radius:2px;cursor:pointer;
  border:1px solid #fff;background:transparent;color:#fff}
.m3leitstreifen button.an{background:#fff;color:#2b2622;font-weight:600}
.m3sim.folgt .seite button:not(.zu), .m3sim.folgt .seite input{opacity:.5;pointer-events:none}
.m3term{font-size:17px;line-height:1.6;padding:8px 10px;background:#fff;border:1px solid var(--linie)}
.m3term .ta{color:#B5762F;font-weight:600}
.m3term .tb{color:#2F7F8C;font-weight:600}
.m3term .ta.an{background:#B5762F;color:#fff;padding:0 3px}
.m3term .hinweis{display:block;font-size:12px;color:var(--matt)}
.m3selbst{display:flex;flex-direction:column;gap:4px;font-size:12.5px;padding:6px 8px;
  background:#EEF6F7;border:1px solid #cfe3e6}
.m3selbst input{font:inherit;width:3.6em;padding:1px 3px;border:1px solid rgba(0,0,0,.25);background:#fff}
#m3wahlreihe{align-items:center}
#m3wahlreihe span{flex:2 1 auto;text-align:center;font-size:12.5px}
.m3akreis{background:#fff;border:1px solid var(--linie);width:100%;height:auto}
.m3akreis[hidden]{display:none}

/* Zurueckschauen: privat und nur zum Lesen (Synchronisation, unten) */
.m3privatband{flex-basis:100%;display:flex;gap:10px;align-items:center;flex-wrap:wrap;
  margin-top:6px;padding:6px 10px;border-radius:0;background:#FFF1C9;
  border:1px solid #E0B44A;font-size:13.5px;color:var(--tinte)}
.m3privatband .knopf{font-size:12.5px;padding:3px 12px}
/* GEAENDERT (Rike, 2026-10-29: «da kann ich irgendwie nichts schreiben
   und ich kann nichts anklicken»): Die Rueckschau war gesperrt - ein Klick
   auf einen Reiter machte die Seite stumm, ohne dass klar war, warum. Jetzt
   ist sie offen; es bleibt nur das Band. Was man dort legt oder schreibt,
   geht wie sonst aufs Brett (ein Brett fuer alles) und ist da, wenn die
   Gruppe hinkommt. Gesperrt bleibt nur «Weiter zu …», das die Gruppe
   bewegt. */
body.m3privat #m3weitertopf{display:none}
/* «Weiter» bewegt die Gruppe - aus der Rueckschau heraus darf das nicht
   geschehen. Dafuer steht im Band «Alle hierher holen». */
body.m3privat .auftrag .knopf.weiter{display:none}

/* Das Zeichen, wie gearbeitet wird (Rike, 2026-10-30) */
.m3wie{display:inline-block;margin-left:8px;padding:1px 9px;font-size:12px;font-weight:600;
  border:1.4px solid var(--matt);color:var(--matt);white-space:nowrap}
.m3wie.allein{border-color:#2F7F8C;color:#2F7F8C}
.m3wie.einer{border-color:#7A5AA6;color:#7A5AA6}
.m3wie.aufgeteilt{border-color:#B5762F;color:#B5762F}
.m3wie.alleinarbeit{border-color:#2b2622;color:#fff;background:#2b2622}
.auftrag .knopf.weiter{margin-left:10px}
#nav button{min-width:2.2em}
.m3hinweis{margin:0 0 8px;font-size:13.5px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}

/* Startfeld - wie Meilenstein 2 (etappen_quartette.js) */
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
.start .gruppengitter button:hover{border-color:var(--akzent);color:var(--akzent)}
.start .andere{font:inherit;font-size:13.5px;background:none;border:none;
  color:var(--matt);text-decoration:underline;cursor:pointer;padding:0}
.start .anderefeld{display:flex;gap:8px;align-items:center;margin-top:10px}
.start .anderefeld[hidden]{display:none}
.start .anderefeld input{font:inherit;font-size:15px;width:5.5em;padding:7px 9px;
  border:1px solid var(--linie);border-radius:8px;background:var(--karte)}
.auftrag{flex-wrap:wrap;align-items:center;row-gap:6px}
.auftrag .titel{flex:0 0 auto}
.auftrag .text{flex:1 1 320px}
.m3wie{margin-left:0 !important}
.m3wahltabelle tr[data-n]{cursor:pointer}
.m3wahltabelle tr[data-n]:hover td{background:rgba(181,118,47,.08)}
.m3wahltabelle tr.gewaehlt td{background:rgba(181,118,47,.18)}
.m3wahltabelle tr.gewaehlt td.n{font-weight:700;color:#B5762F}
.m3linksbox{background:#fffefb;margin:8px;padding:8px 10px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.m3linksbox .m3werkzeug{flex-direction:column;align-items:center}
.m3zyknav{display:flex;gap:8px;align-items:center;justify-content:center;margin:4px 0;font-size:13px}
.m3teile{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.m3teile button{font:inherit;font-size:12.5px;padding:2px 10px;border-radius:2px;cursor:pointer;
  border:1.2px solid var(--linie);background:#fff;color:var(--matt)}
.m3teile button.an{border-color:#2b2622;color:#2b2622;font-weight:600}
.m3zeile{flex-basis:100%;display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.m3zeile:empty{display:none}
.m3zeile > *{margin:0 !important;flex:0 1 auto !important}
#nav .m3etappe{font-size:12px;font-weight:700;color:var(--matt);margin:0 2px 0 10px;
  align-self:center;white-space:nowrap}
.auftrag .knopf.weiter{font-size:12.5px;padding:3px 12px;white-space:nowrap;flex:0 0 auto}
`;

function stilSetzen(){
  if (document.getElementById('m3stil')) return;
  const t = document.createElement('style');
  t.id = 'm3stil'; t.textContent = STIL;
  document.head.appendChild(t);
}

/* Buehne mit zwei Haelften - wie in Meilenstein 2. */
function buehneNeben(auftrag, vorrat, rechtsName, leiste){
  const b = document.getElementById('buehne');
  window._nachAblegen = null;
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${auftrag.rang}</span>
      <span class="titel">${auftrag.titel}</span>
      <span class="text">${auftrag.text}</span></div>
    <div class="buehne m3">
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

/* NEU (Rike, 2026-10-30, VORSCHLAG_meilenstein_3_ablauf.md): Jeder Schritt
   zeigt EINE Frage und ein Zeichen, wie gearbeitet wird. */
const M3_WIE = {gemeinsam: 'gemeinsam',
                allein: 'erst jede Person für sich',
                einer: 'eine Person rechnet, alle schauen',
                aufgeteilt: 'jede Person beginnt eine Bahn'};
function m3Auftrag(i){
  const a = D.etappen[i];
  /* Allein (Rike, 2026-10-30): statt «gemeinsam» usw. steht da, dass man
     allein arbeitet. */
  const wie = M3_ALLEIN_HIER ? `<span class="m3wie alleinarbeit">Sie arbeiten allein</span>`
                             : `<span class="m3wie ${a.wie}">${M3_WIE[a.wie]}</span>`;
  /* GEAENDERT (Rike, 2026-10-30: «Ja, zwei Etappen»; Schritte-Vorschlag
     B): Kopf in einer Zeile - Etappe und Teil, das Zeichen, die Frage,
     «Weiter». Hat der Teil Unterteile, stehen sie klein darunter. */
  const teile = D.etappen.map((x, k) => ({x, k}))
    .filter(({x}) => x.unterteil && x.etappe === a.etappe && x.teil === a.teil);
  const leiste = a.unterteil ? `<span class="m3teile">${teile.map(({x, k}, j) =>
      `<button data-teil="${k}" class="${k === i ? 'an' : ''}">${j + 1} · ${x.unterteil}</button>`).join('')}</span>` : '';
  return {rang: a.rang, titel: wie, text: `${M3_ALLEIN_HIER ? a.auftrag_allein : a.auftrag}${leiste}`};
}
/* Ein Unterteil anklicken wie die Leiste oben. */
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.m3teile button[data-teil]');
  if (!b) return;
  stand.etappe = Number(b.dataset.teil); los();
});

function platz(ort, breite, hoehe, nur){
  const p = document.createElement('div');
  p.className = 'paar';
  p.dataset.ort = ort;
  p.dataset.fasst = '1';
  if (nur) p.dataset.nur = nur;
  p.style.width = breite + 'px';
  p.style.height = hoehe + 'px';
  return p;
}

function m3melden(){
  sichern();
  if (window.KASPER_GEMEINSAM_MELDEN) window.KASPER_GEMEINSAM_MELDEN();
}

/* Ein Zufall mit Saat: Alle Rechner sehen dieselbe Mischung. */
function m3zufall(saat){
  let x = (saat * 7919) % 233280;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

/* ---------- Der Tisch links: feste Plaetze ohne Ueberlappen ----------
   Wie Meilenstein 2 (2026-10-20): Jede Karte hat einen festen Platz, ihre
   Stelle in der Mischung. Ueber die Leitung geht nur «liegt auf dem
   Tisch». Spaltenzahl so, dass die Karten am groessten werden. */
function m3Tisch(tisch, ids, saat, kwMax){
  const HEIM = {};
  if (saat === null){
    // Ohne Saat: in der Reihenfolge, die die Etappe vorgibt.
    ids.forEach((id, i) => { HEIM[id] = i; });
  } else {
    const z = m3zufall(saat);
    ids.slice().sort().map(id => [z(), id]).sort((a, b) => a[0] - b[0])
      .forEach(([, id], i) => { HEIM[id] = i; });
  }
  let SP = 4, W = 80;
  function breite(){
    const luft = 6, B = tisch.clientWidth - 16, H = tisch.clientHeight - 12;
    let beste = 0;
    for (let c = 2; c <= 10; c++){
      const r = Math.ceil(ids.length / c);
      const w = Math.min((B - (c - 1) * luft) / c, (H / r - luft) / M3_SEITE);
      if (w > beste){ beste = w; SP = c; }
    }
    W = Math.max(44, Math.floor(Math.min(kwMax || M3_KMAX, beste)));
    tisch.style.setProperty('--m3vorrat', W + 'px');
    return W;
  }
  /* Die Karten, die noch auf dem Tisch liegen, ruecken nach ihrer Stelle
     in der Mischung zusammen - sonst bleiben Loecher, wo Karten weg sind.
     Die Lage haengt nur davon ab, WELCHE Karten auf dem Tisch liegen; das
     ist bei allen gleich, also auch der Platz. */
  function ordnen(){
    const luft = 6;
    const h = W * M3_SEITE;
    const da = [...tisch.querySelectorAll(':scope > .k')]
      .sort((a, b) => (HEIM[a.dataset.id] || 0) - (HEIM[b.dataset.id] || 0));
    da.forEach((el, i) => {
      el._rot = 0;
      el._x = 8 + (i % SP) * (W + luft);
      el._y = 6 + Math.floor(i / SP) * (h + luft);
      pos(el);
      const s = stand.karten[el.dataset.id];
      if (s && s.ort === tisch.dataset.ort){ s.x = el._x; s.y = el._y; s.rot = 0; }
    });
  }
  return {breite, ordnen};
}

/* Karten auf ihre Orte.

   FEHLERBEHOBEN (2026-10-29, mit zwei Fenstern am Brett gesehen): Hier
   kam jede Karte, deren Ort es gerade nicht gab, auf den Tisch - und der
   Tisch wurde in den Stand geschrieben. Kam ein Zug vom Brett, bevor die
   Felder standen (Fenster im Hintergrund, Fach noch nicht eroeffnet),
   ueberschrieb das die richtige Lage; der naechste eigene Zug haette den
   Tisch an alle gemeldet. Jetzt: Wer noch keinen Ort hat, kommt auf den
   Tisch. Wer einen Ort hat, den es hier (noch) nicht gibt, bleibt
   draussen - nicht im DOM, also fasst merken() ihn nicht an. */
function m3Verteilen(els, tisch){
  Object.values(els).forEach(el => {
    const s = stand.karten[el.dataset.id];
    const aufTisch = !s || !s.ort || s.ort.startsWith('tisch');
    const ziel = !aufTisch
      && document.querySelector(`.buehne [data-ort="${CSS.escape(s.ort)}"]`);
    if (ziel){ ziel.prepend(el); el._x = 4; el._y = 4; el._rot = 0; pos(el); }
    /* Allein gibt es kein Brett, das den Ort je nachliefert: Was keinen
       Platz findet, liegt auf dem Tisch. */
    else if (aufTisch || M3_ALLEIN_HIER){
      tisch.appendChild(el);
      stand.karten[el.dataset.id] = {ort: tisch.dataset.ort, x: 0, y: 0, rot: 0};
    }
    else if (el.parentElement) el.remove();
  });
}

/* Die Felder messen ihre Haelfte aus und brauchen dafuer das Layout.
   requestAnimationFrame allein wartet in einem Fenster im Hintergrund,
   bis es wieder vorne ist - so lange gab es keine Felder, und Zuege vom
   Brett fanden ihren Ort nicht. Deshalb auch eine Uhr; wer zuerst kommt,
   baut. */
function m3Bald(fn){
  let erledigt = false;
  const los1 = () => { if (!erledigt){ erledigt = true; fn(); } };
  requestAnimationFrame(los1);
  setTimeout(los1, 60);
}

/* ══════════════════ Das Lesefenster: Bahnen simulieren ══════════════════

   Rike, 2026-10-29: «Ich haette gerne, dass jede Karte aufploppbar ist,
   sodass man die Bahnen simulieren kann.» Und: «dass man irgendwie
   sichtbar machen kann, wie aus der Zahl a und der Zahl b ... die
   Drehung, die Streckung ablesbar ist.»

   Tippen in die Ebene setzt einen Startwert; «Schritt» rechnet ein Glied
   weiter, «10 Schritte» zehn. Jede Bahn bekommt eine eigene Farbe.
   PRUEFEN (thema.md 5): Wer die Simulation sieht. Heute nur, wer sie
   oeffnet. */
const M3_BAHNFARBEN = ['#C2562F', '#2F7F8C', '#7A5AA6', '#B0861E', '#4F8A3C'];

function m3Schritt(t, z){
  const [x, y] = z;
  if (t.typ === 'affin'){
    const [ar, ai] = t.a, [br, bi] = t.b;
    return [ar * x - ai * y + br, ar * y + ai * x + bi];
  }
  if (t.typ === 'z2') return [x * x - y * y, 2 * x * y];
  if (t.typ === 'z2m1') return [x * x - y * y - 1, 2 * x * y];
  if (t.typ === 'z3') return [x * x * x - 3 * x * y * y, 3 * x * x * y - y * y * y];
  return z;
}
function m3Fixpunkt(t){
  if (t.typ !== 'affin') return null;
  const nr = 1 - t.a[0], ni = -t.a[1];
  const n = nr * nr + ni * ni;
  if (n < 1e-12) return null;
  const [br, bi] = t.b;
  return [(br * nr + bi * ni) / n, (bi * nr - br * ni) / n];
}
function m3Zahl(v){
  const r = Math.abs(v) < 5e-4 ? 0 : v;
  return (Math.round(r * 100) / 100).toString().replace('.', ',').replace('-', '−');
}
function m3Komplex([x, y]){
  if (Math.abs(x) > 1e6 || Math.abs(y) > 1e6) return 'sehr gross';
  const im = Math.abs(y) < 5e-4 ? '' : (y < 0 ? ' − ' : ' + ') + m3Zahl(Math.abs(y)) + 'i';
  return m3Zahl(x) + im;
}

/* Die Spalte rechts: andocken, Platz fuer den Tisch freimachen. */
function m3DockMasse(){
  const eng = window.innerWidth < 1100;
  if (eng && !document.body.classList.contains('m3eng')) document.body.classList.add('m3eng', 'm3dockzu');
  if (!eng) document.body.classList.remove('m3eng', 'm3dockzu');
  if (!document.querySelector('.m3dockgriff')){
    const g = document.createElement('button');
    g.className = 'm3dockgriff'; g.textContent = 'Simulation';
    g.onclick = () => document.body.classList.remove('m3dockzu');
    document.body.appendChild(g);
    window.addEventListener('resize', () => { if (document.body.classList.contains('m3gedockt')) m3DockMasse(); });
  }
  const breit = eng ? Math.round(Math.min(440, window.innerWidth * 0.94)) : Math.round(Math.max(330, Math.min(560, window.innerWidth * 0.38)));
  document.documentElement.style.setProperty('--m3dock', breit + 'px');
  const b = document.getElementById('buehne');
  const oben = b ? Math.max(0, b.getBoundingClientRect().top) : 0;
  document.documentElement.style.setProperty('--m3docktop', oben + 'px');
}
function m3Andocken(d){
  document.querySelectorAll('.m3sim').forEach(e => e.remove());
  document.body.classList.add('m3gedockt');
  m3DockMasse();
  document.body.appendChild(d);
}
function m3Platzhalter(){
  const d = document.createElement('div');
  d.className = 'm3sim dock';
  d.innerHTML = `<div class="fenster"><div class="seite"><p class="leer">Tippen Sie <b>▶</b> an einer Karte.
    Hier erscheint dann ihre Ebene: Startwert setzen, Schritt für Schritt.</p></div></div>`;
  m3Andocken(d);
}
function m3Abdocken(){
  document.querySelectorAll('.m3sim').forEach(e => e.remove());
  document.body.classList.remove('m3gedockt');
}

function m3Simulation(id, stufe, folgen){
  stufe = stufe || 2;
  const t = (M3.e1.terme || {})[id];
  if (!t) return;
  document.querySelectorAll('.m3sim').forEach(e => e.remove());
  const affin = t.typ === 'affin';
  const fp = m3Fixpunkt(t);
  // Ausschnitt: um den Fixpunkt, gross genug fuer ein paar Schritte.
  const mitte = fp && Math.hypot(fp[0], fp[1]) < 4 ? [0, 0] : (fp || [0, 0]);
  const R0 = affin ? Math.max(3, (fp ? Math.hypot(fp[0] - mitte[0], fp[1] - mitte[1]) : 0) + 3) : 2.2;
  let R = R0;
  const bahnen = [];
  let drehung = false, zeigA = false;
  let wahl = null;            // gewaehlter Schritt z_n -> z_n+1; null: von selbst

  /* F3 (Rike, 2026-10-30): Oeffnet die Leitung eine Karte, sehen alle der
     Gruppe dasselbe Fenster (`folgen` traegt dann den Stand vom Brett).
     «Fuer alle freigeben» laesst jede Person selbst weiterprobieren.
     Ohne Leitung: jede Person fuer sich, wie bisher. */
  const folgt = !!folgen;
  const leitet = !folgt && M3_LEITUNG && m3Verbunden();
  let geteilt = leitet && M3_ZEIGEN, phase = 0;
  const o = folgt ? folgen.o : Math.random().toString(36).slice(2, 8);

  /* Der Term mit a und b markiert (Rike, 2026-10-29: «kann ich A und B
     irgendwie im Term auch malen»). Die Teile stehen in inhalte.TERMTEILE. */
  let termHtml = '';
  if (affin){
    const [ta, tb] = t.teile;
    const hinweis = [];
    if (!ta) hinweis.push('a = 1');
    if (ta === '−') hinweis.push('a = −1');
    if (!tb) hinweis.push('b = 0');
    termHtml = `<div class="m3term"><i>f</i>(<i>z</i>) = `
      + (ta ? `<span class="ta">${ta}</span>` : '') + ` <i>z</i> `
      + (tb ? `<span class="tb">${tb}</span>` : '')
      + (hinweis.length ? `<span class="hinweis">${hinweis.join(', ')}</span>` : '')
      + `</div>`;
  }

  const d = document.createElement('div');
  d.className = 'm3sim dock' + (folgt ? ' folgt' : '');
  d.innerHTML = `<div class="fenster"><div class="seite">
        <button class="dockzu" title="Simulation schliessen" onclick="document.body.classList.add('m3dockzu')">✕ schliessen</button>
        ${folgt ? `<p class="m3gemeinsam" id="m3gemtext">Gemeinsame Ansicht: Sie sehen die Simulation der Leitung.</p>` : ''}
        <div class="kopfzeile">${termHtml || `<img src="karten/${id}.svg" alt="">`}</div>
        <div class="reihe"><button id="m3s1">Schritt</button><button id="m3s10">10 Schritte</button>
          <button id="m3weg" title="Bahnen löschen">löschen</button>
          <span class="zoom"><button id="m3zm" title="weiter weg">−</button><button id="m3zf" title="alles zeigen">alles</button><button id="m3zp" title="näher heran">+</button></span></div>
        <canvas class="haupt" width="520" height="520"></canvas>
        <p class="wink">Tippen Sie in die Ebene: Das ist der Startwert <i>z</i><sub>0</sub>. Dann Schritt für Schritt.</p>
        ${affin && stufe >= 2 ? `<details class="m3dreh"><summary>Drehung untersuchen</summary>
                     <div class="reihe" id="m3wahlreihe"><button id="m3wv" title="Schritt davor">◀</button>
                     <span id="m3wtxt"></span><button id="m3wn" title="Schritt danach">▶</button></div>
                     <button id="m3dreh">Drehung zeigen</button>
                     <div class="m3selbst"><b>Selbst ausrechnen</b>
                     <label>Drehwinkel <input id="m3iw" inputmode="decimal"> °</label>
                     <label>Streckfaktor <input id="m3ik" inputmode="decimal"></label>
                     <label>Drehzentrum <input id="m3ix" inputmode="decimal"> + <input id="m3iy" inputmode="decimal"> <i>i</i></label>
                     <span class="m3still">Der Ring zeigt, wohin <i>z</i><sub>n</sub> mit Ihren Werten käme.</span></div>
                   <canvas class="m3akreis" width="220" height="220" hidden></canvas></details>` : ''}
        <div class="werte" id="m3werte"></div>
      </div></div>`;
  m3Andocken(d);
  if (!folgt || document.body.classList.contains('m3eng')) document.body.classList.remove('m3dockzu');
  const cv = d.querySelector('canvas.haupt');
  const groesse = Math.max(220, Math.min(d.clientWidth - 32,
    window.innerHeight - d.getBoundingClientRect().top - 190));
  cv.style.width = cv.style.height = groesse + 'px';
  const g = cv.getContext('2d');
  const S = 520;
  const px = ([x, y]) => [S / 2 + (x - mitte[0]) / R * S / 2, S / 2 - (y - mitte[1]) / R * S / 2];
  const zahl = (cx, cy) => [mitte[0] + (cx - S / 2) / (S / 2) * R, mitte[1] - (cy - S / 2) / (S / 2) * R];
  const FA = '#B5762F', FB = '#2F7F8C', FZ = '#7A5AA6';

  function pfeil(g, px, a, b, farbe, breite){
    const [x1, y1] = px(a), [x2, y2] = px(b);
    g.strokeStyle = g.fillStyle = farbe; g.lineWidth = breite || 1.6;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    const w = Math.atan2(y2 - y1, x2 - x1), l = 8;
    if (Math.hypot(x2 - x1, y2 - y1) < 12) return;
    g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - l * Math.cos(w - .4), y2 - l * Math.sin(w - .4));
    g.lineTo(x2 - l * Math.cos(w + .4), y2 - l * Math.sin(w + .4)); g.fill();
  }
  /* Zoom in beide Richtungen (Rike, 2026-10-29: «manchmal hat es
     automatisch rein und rausgezoomt ... aber man konnte dann nicht wieder
     zurueckzoomen»). Von selbst waechst der Ausschnitt nur, wenn ein NEUER
     Punkt hinausfaellt; «alles zeigen» passt ihn den Bahnen an - auch
     kleiner; − und + gehen in Schritten. */
  function passend(){
    let r = 0;
    bahnen.forEach(b => b.forEach(([x, y]) => {
      const dd = Math.max(Math.abs(x - mitte[0]), Math.abs(y - mitte[1])) * 1.15;
      if (dd <= 60) r = Math.max(r, dd);
    }));
    if (fp) r = Math.max(r, Math.max(Math.abs(fp[0] - mitte[0]), Math.abs(fp[1] - mitte[1])) * 1.3);
    R = Math.max(1.3, r || R0);
  }
  function mitwachsen(z){
    const dd = Math.max(Math.abs(z[0] - mitte[0]), Math.abs(z[1] - mitte[1])) * 1.12;
    if (dd > R && dd <= 60) R = dd;
  }

  function zeichnen(){
    g.clearRect(0, 0, S, S);
    const schritt = [0.5, 1, 2, 5, 10, 20].find(v => R / v <= 7) || 20;
    g.strokeStyle = '#efe7da'; g.lineWidth = 1;
    for (let v = Math.ceil((mitte[0] - R) / schritt) * schritt; v <= mitte[0] + R; v += schritt){
      const [x] = px([v, 0]); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
    for (let v = Math.ceil((mitte[1] - R) / schritt) * schritt; v <= mitte[1] + R; v += schritt){
      const [, y] = px([0, v]); g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
    g.strokeStyle = '#8c8579'; g.lineWidth = 1.2;
    const [ox, oy] = px([0, 0]);
    g.beginPath(); g.moveTo(0, oy); g.lineTo(S, oy); g.moveTo(ox, 0); g.lineTo(ox, S); g.stroke();
    g.fillStyle = '#8c8579'; g.font = '12px sans-serif'; g.textAlign = 'left';
    g.fillText('Re', S - 22, oy - 6); g.fillText('Im', ox + 6, 14);
    g.setLineDash([4, 4]); g.beginPath();
    g.arc(ox, oy, S / 2 / R, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]);

    bahnen.forEach((b, j) => {
      const f = M3_BAHNFARBEN[j % M3_BAHNFARBEN.length];
      for (let i = 1; i < b.length; i++) pfeil(g, px, b[i - 1], b[i], f, 1.5);
      b.forEach((z, i) => {
        const [x, y] = px(z);
        if (x < -20 || y < -20 || x > S + 20 || y > S + 20) return;
        g.fillStyle = f; g.beginPath(); g.arc(x, y, i === 0 ? 5 : 3.2, 0, 2 * Math.PI); g.fill();
      });
    });
    if (drehung) drehungZeichnen();
    if (affin && stufe >= 2) eigeneZeichnen();
    wahlText();
    if (geteilt) m3SimMelden(zustand());

    const w = d.querySelector('#m3werte');
    w.innerHTML = bahnen.map((b, j) => `<div style="color:${M3_BAHNFARBEN[j % 5]}">`
      + b.slice(-6).map(z => `z<sub>${b.indexOf(z)}</sub> = ${m3Komplex(z)}`).join('<br>')
      + '</div>').join('<hr style="border:none;border-top:1px solid #eee">');
  }

  /* NEU (Rike, 2026-10-29: «die eigentliche Hilfestellung waere, wenn man
     ... das Drehzentrum einblenden koennte, den Drehwinkel und den
     Streckfaktor irgendwie visualisiert sichtbar machen kann und schauen
     kann, wie das mit dem A und dem B zusammenhaengt»).
     Am LETZTEN Schritt der letzten Bahn: das Drehzentrum (Fixpunkt), die
     Strahlen zu z_n und z_n+1, der Bogen dazwischen mit dem Winkel und das
     Verhaeltnis der Abstaende. Gerechnet aus der Bahn, nicht aus a - dass
     es dasselbe ist wie arg a und |a|, sollen die Studierenden sehen. */
  function drehungZeichnen(){
    g.textAlign = 'left'; g.font = 'bold 13px sans-serif';
    if (!fp){
      g.fillStyle = FZ;
      g.fillText('Kein Drehzentrum: f verschiebt jeden Punkt um b.', 10, S - 14);
      return;
    }
    const [cx, cy] = px(fp);
    g.strokeStyle = FZ; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(cx - 8, cy - 8); g.lineTo(cx + 8, cy + 8);
    g.moveTo(cx - 8, cy + 8); g.lineTo(cx + 8, cy - 8); g.stroke();
    g.fillStyle = FZ; g.fillText('Drehzentrum', cx + 10, cy + 18);
    const sw = schritt();
    if (!sw){
      g.font = '12.5px sans-serif';
      g.fillText('Setzen Sie einen Startwert und machen Sie einen Schritt.', 10, S - 14);
      return;
    }
    const z1 = sw.z1, z2 = sw.z2;
    // Die beiden Punkte des gewaehlten Schritts hervorheben
    g.strokeStyle = FZ; g.lineWidth = 2;
    [z1, z2].forEach(z => { const [x, y] = px(z); g.beginPath(); g.arc(x, y, 8, 0, 2 * Math.PI); g.stroke(); });
    const v1 = [z1[0] - fp[0], z1[1] - fp[1]], v2 = [z2[0] - fp[0], z2[1] - fp[1]];
    const r1 = Math.hypot(...v1), r2 = Math.hypot(...v2);
    if (r1 < 1e-9) return;
    const w1 = Math.atan2(v1[1], v1[0]);
    let dw = Math.atan2(v2[1], v2[0]) - w1;
    while (dw <= -Math.PI) dw += 2 * Math.PI;
    while (dw > Math.PI) dw -= 2 * Math.PI;
    // Strahlen vom Zentrum
    g.setLineDash([5, 4]); g.lineWidth = 1.6; g.strokeStyle = FZ;
    [z1, z2].forEach(z => { const [x, y] = px(z); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); });
    g.setLineDash([]);
    // Bogen fuer den Winkel - im Bild ist y nach unten, also Vorzeichen drehen
    const rb = Math.max(18, Math.min(r1, r2) / R * S / 2 * 0.4);
    g.lineWidth = 2.2;
    g.beginPath(); g.arc(cx, cy, rb, -w1, -(w1 + dw), dw > 0); g.stroke();
    const wm = w1 + dw / 2;
    const grad = dw * 180 / Math.PI;
    g.fillText(`${m3Zahl(grad)}°`, cx + (rb + 8) * Math.cos(wm), cy - (rb + 8) * Math.sin(wm));
    g.font = '13px sans-serif';
    g.fillText(`Drehwinkel ${m3Zahl(grad)}°   ·   Streckfaktor ${m3Zahl(r2)} : ${m3Zahl(r1)} = ${m3Zahl(r2 / r1)}`, 10, S - 14);
  }

  /* GEAENDERT (Rike, 2026-10-30: «man bekommt es immer nur angezeigt an
     dem Schritt, wo man ist, und bei den konvergierenden sieht man es bei
     spaeten Schritten nicht so gut»): Der Schritt ist waehlbar (◀ ▶). Von
     selbst der mit dem groessten Abstand zum Drehzentrum - bei
     konvergenten Bahnen der erste, bei divergenten der letzte. */
  function schritt(){
    const b = bahnen[bahnen.length - 1];
    if (!b || b.length < 2) return null;
    let n = wahl;
    if (n === null){
      n = b.length - 2;
      if (fp){
        let best = -1;
        for (let i = 0; i < b.length - 1; i++){
          const dd = Math.hypot(b[i][0] - fp[0], b[i][1] - fp[1]);
          if (dd <= 60 && dd > best){ best = dd; n = i; }
        }
      }
    }
    n = Math.max(0, Math.min(b.length - 2, n));
    return {n, z1: b[n], z2: b[n + 1], b};
  }
  function wahlText(){
    const el = d.querySelector('#m3wtxt');
    if (!el) return;
    const sw = schritt();
    el.innerHTML = sw ? `Schritt <i>z</i><sub>${sw.n}</sub> → <i>z</i><sub>${sw.n + 1}</sub>` : 'noch kein Schritt';
  }

  /* NEU (Rike, 2026-10-30: «Waere es nicht gut, wenn man das Drehzentrum
     noch ausrechnen kann nebendran - Drehwinkel, Streckfaktor und
     Streckzentrum?»): Die eigenen Werte werden ANGEWENDET, nicht
     beurteilt. Ihr Zentrum erscheint als Ring, und ein zweiter Ring zeigt,
     wohin z_n mit Ihren Werten kaeme. Sitzt er auf z_n+1, stimmt es. */
  function eigeneZeichnen(){
    const zahlAus = id => {
      const v = (d.querySelector('#' + id) || {}).value || '';
      const x = parseFloat(v.replace(',', '.').replace('−', '-'));
      return isNaN(x) ? null : x;
    };
    const w = zahlAus('m3iw'), k = zahlAus('m3ik'), cx = zahlAus('m3ix'), cy = zahlAus('m3iy');
    if (cx === null && cy === null && w === null && k === null) return;
    const c = [cx || 0, cy || 0];
    const [px0, py0] = px(c);
    g.strokeStyle = FB; g.lineWidth = 2; g.setLineDash([3, 3]);
    g.beginPath(); g.arc(px0, py0, 9, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]);
    g.fillStyle = FB; g.font = '12px sans-serif'; g.textAlign = 'right';
    g.fillText('Ihr Zentrum', px0 - 12, py0 - 10); g.textAlign = 'left';
    const sw = schritt();
    if (!sw || w === null || k === null || cx === null || cy === null) return;
    const v = [sw.z1[0] - c[0], sw.z1[1] - c[1]];
    const t = w * Math.PI / 180;
    const bild = [c[0] + k * (v[0] * Math.cos(t) - v[1] * Math.sin(t)),
                  c[1] + k * (v[0] * Math.sin(t) + v[1] * Math.cos(t))];
    const [a1, b1] = px(sw.z1), [a2, b2] = px(bild);
    g.strokeStyle = FB; g.lineWidth = 1.6; g.setLineDash([4, 3]);
    g.beginPath(); g.moveTo(a1, b1); g.lineTo(a2, b2); g.stroke(); g.setLineDash([]);
    g.lineWidth = 2.4;
    g.beginPath(); g.arc(a2, b2, 11, 0, 2 * Math.PI); g.stroke();
    g.fillText('mit Ihren Werten', a2 + 14, b2 + 4);
  }

  /* Das eigene Feld fuer a (Rike: «Vielleicht braeuchte es fuer A ... ein
     extra Feld, wo man das eingezeichnet sieht»): a als Zeiger vom
     Ursprung, Bogen fuer arg a, Laenge |a| gegen den Einheitskreis. */
  function aZeichnen(){
    const c = d.querySelector('canvas.m3akreis');
    if (!c) return;
    c.hidden = !zeigA;
    if (!zeigA) return;
    const h = c.getContext('2d'), Q = c.width;
    const RA = Math.max(1.3, Math.hypot(...t.a) * 1.25);
    const q = ([x, y]) => [Q / 2 + x / RA * Q / 2, Q / 2 - y / RA * Q / 2];
    h.clearRect(0, 0, Q, Q);
    h.strokeStyle = '#8c8579'; h.lineWidth = 1;
    h.beginPath(); h.moveTo(0, Q / 2); h.lineTo(Q, Q / 2); h.moveTo(Q / 2, 0); h.lineTo(Q / 2, Q); h.stroke();
    h.setLineDash([4, 4]); h.beginPath(); h.arc(Q / 2, Q / 2, Q / 2 / RA, 0, 2 * Math.PI); h.stroke(); h.setLineDash([]);
    pfeil(h, q, [0, 0], t.a, FA, 2.4);
    const wa = Math.atan2(t.a[1], t.a[0]);
    h.strokeStyle = FA; h.lineWidth = 2;
    h.beginPath(); h.arc(Q / 2, Q / 2, 16, 0, -wa, wa > 0); h.stroke();
    h.fillStyle = FA; h.font = 'bold 12px sans-serif'; h.textAlign = 'left';
    h.fillText('a', q(t.a)[0] + 6, q(t.a)[1] - 6);
    h.font = '12px sans-serif';
    h.fillText(`|a| = ${m3Zahl(Math.hypot(...t.a))}`, 6, Q - 22);
    h.fillText(`arg a = ${m3Zahl(wa * 180 / Math.PI)}°`, 6, Q - 8);
  }

  function weiter(n){
    const b = bahnen[bahnen.length - 1];
    if (!b) return;
    for (let i = 0; i < n; i++){
      const z = b[b.length - 1];
      if (Math.abs(z[0]) > 1e7 || Math.abs(z[1]) > 1e7) break;
      const neu = m3Schritt(t, z);
      b.push(neu);
      mitwachsen(neu);
    }
    zeichnen();
  }
  cv.addEventListener('pointerdown', e => {
    if (d.classList.contains('folgt')) return;
    const r = cv.getBoundingClientRect();
    const z = zahl((e.clientX - r.left) / r.width * S, (e.clientY - r.top) / r.height * S);
    // Auf dem Einheitskreis einrasten, wenn man nahe dran tippt.
    const b = Math.hypot(z[0], z[1]);
    const nahe = Math.abs(b - 1) < R / 40;
    bahnen.push([nahe ? [z[0] / b, z[1] / b] : z]);
    wahl = null;
    if (bahnen.length > 5) bahnen.shift();
    zeichnen();
  });
  d.querySelector('#m3s1').onclick = () => weiter(1);
  d.querySelector('#m3s10').onclick = () => weiter(10);
  d.querySelector('#m3weg').onclick = () => { bahnen.length = 0; R = R0; wahl = null; zeichnen(); };
  const wv = d.querySelector('#m3wv'), wn = d.querySelector('#m3wn');
  if (wv) wv.onclick = () => { const sw = schritt(); if (sw){ wahl = Math.max(0, sw.n - 1); zeichnen(); } };
  if (wn) wn.onclick = () => { const sw = schritt(); if (sw){ wahl = Math.min(sw.b.length - 2, sw.n + 1); zeichnen(); } };
  d.querySelectorAll('.m3selbst input').forEach(i => i.addEventListener('input', zeichnen));
  d.querySelector('#m3zm').onclick = () => { R = Math.min(60, R * 1.5); zeichnen(); };
  d.querySelector('#m3zp').onclick = () => { R = Math.max(0.6, R / 1.5); zeichnen(); };
  d.querySelector('#m3zf').onclick = () => { passend(); zeichnen(); };
  const kd = d.querySelector('#m3dreh');
  /* «Drehung zeigen» blendet beides ein: die Drehung am Schritt und das
     Feld fuer a - ein Knopf statt zwei (Ablauf-Vorschlag, Abschnitt 2). */
  function drehAnzeigen(){
    zeigA = drehung;
    if (kd){
      kd.classList.toggle('an', drehung);
      kd.textContent = drehung ? 'Drehung ausblenden' : 'Drehung zeigen';
    }
    d.querySelectorAll('.m3term .ta').forEach(e => e.classList.toggle('an', zeigA));
    aZeichnen();
  }
  if (kd) kd.onclick = () => { drehung = !drehung; drehAnzeigen(); zeichnen(); };

  /* Der Stand des Fensters - fuer die Leitung zum Mitschicken, fuer die
     Gruppe zum Uebernehmen. Gerundet, damit die Zeile kurz bleibt. */
  const EINGABEN = ['m3iw', 'm3ik', 'm3ix', 'm3iy'];
  const rund = v => Math.round(v * 1e4) / 1e4;
  function zustand(){
    return {id, stufe, o, p: phase, frei: !geteilt,
            b: bahnen.map(b => b.map(([x, y]) => [rund(x), rund(y)])),
            R: rund(R), wahl, dr: drehung,
            dt: !!(d.querySelector('.m3dreh') || {}).open,
            w: EINGABEN.map(k => (d.querySelector('#' + k) || {}).value || '')};
  }
  function setzen(z){
    bahnen.length = 0;
    (z.b || []).forEach(b => bahnen.push(b));
    R = z.R || R0; wahl = z.wahl == null ? null : z.wahl;
    drehung = !!z.dr;
    const dt = d.querySelector('.m3dreh'); if (dt) dt.open = !!z.dt;
    EINGABEN.forEach((k, j) => { const el = d.querySelector('#' + k); if (el) el.value = (z.w || [])[j] || ''; });
    drehAnzeigen(); zeichnen();
  }
  d._o = o;
  d._setzen = setzen;
  d._freigeben = () => {
    d.classList.remove('folgt');
    const t = d.querySelector('#m3gemtext');
    if (t) t.textContent = 'Jetzt probieren Sie selbst weiter.';
  };
  /* Der Schalter «Alle sehen meine Simulation» im Leitungsstreifen. */
  d._zeigen = an => {
    if (!leitet) return;
    if (!an && geteilt){ m3SimMelden(Object.assign(zustand(), {frei: true})); geteilt = false; }
    else if (an && !geteilt){ phase++; geteilt = true; zeichnen(); }
  };
  const dtEl = d.querySelector('.m3dreh');
  if (dtEl) dtEl.addEventListener('toggle', () => { if (geteilt) m3SimMelden(zustand()); });
  if (folgt){ phase = folgen.p || 0; setzen(folgen); }
  else zeichnen();
}

/* ══════════════════ Etappe 1 · Iteratoren sortieren ══════════════════ */
function etappeIteratoren(i, stufe){
  stilSetzen();
  const E = M3.e1;
  const vorrat = {id: 'T', name: 'Die Iteratoren'};
  if (stufe){ document.body.classList.add('m3gedockt'); m3DockMasse(); }   // Platz fuer die Spalte, bevor gemessen wird
  buehneNeben(m3Auftrag(i), vorrat, 'Was geschieht mit der Folge?',
              stufe ? `<span class="m3still">▶ an der Karte zeigt sie rechts.</span>` : '');
  const feld = document.getElementById('feld');
  const tisch = document.getElementById('feldT');
  const PLAETZE = 6, SPALTEN = 3;
  window._zustaendig = id => E.karten.includes(id);
  window.KASPER_GEMEINSAM_NORM = s => s.ort === 'tischT' ? {ort: 'tischT', x: 0, y: 0, rot: 0} : s;

  const els = {};
  E.karten.forEach(id => {
    const el = karte(id);
    /* Schritt 1 ohne Simulation: erst vermuten (Rike, 2026-10-30, B). */
    if (stufe){
    const s = document.createElement('button');
    s.className = 'sim dop'; s.textContent = '▶'; s.title = 'Bahnen ausprobieren';
    s.addEventListener('pointerdown', e => e.stopPropagation());
    const oeffnen = e => { e.stopPropagation();
      if (document.querySelector('.m3sim.folgt')) return;     // die Leitung zeigt gerade
      m3Simulation(id, stufe); };
    s.onclick = oeffnen;
    el.appendChild(s);
    el.addEventListener('dblclick', oeffnen);
    }
    els[id] = el;
  });
  const T = m3Tisch(tisch, E.karten, 3);

  function kartenbreite(){
    const B = feld.clientWidth - 12 - 8 - 2 * 12 - 2 * (SPALTEN - 1) * 4;
    const H = feld.clientHeight - 2 * (26 + 12) - 8 - 2 * 24;
    const ausB = B / (2 * SPALTEN) - M3_RAND;
    const ausH = (H / 4 - M3_RAND) / M3_SEITE;
    return Math.max(M3_KMIN, Math.min(M3_KMAX, Math.floor(Math.min(ausB, ausH))));
  }
  function zeichnen(kw){
    const kh = Math.round(kw * M3_SEITE);
    feld.style.setProperty('--m3karte', kw + 'px');
    // Karten aus den alten Plaetzen holen, bevor die Plaetze neu entstehen
    Object.values(els).forEach(el => { if (el.parentElement) el.remove(); });
    feld.innerHTML = '<div class="m3felder"></div>';
    const gitter = feld.firstChild;
    E.felder.forEach(f => {
      const z = document.createElement('div');
      z.className = 'm3zone ' + f.id;
      z.innerHTML = `<h4>${f.name}</h4>`;
      const g = document.createElement('div');
      g.className = 'm3gitter feld';
      g.dataset.ort = 'e1-' + f.id;
      g.style.gridTemplateColumns = `repeat(${SPALTEN}, ${kw + M3_RAND}px)`;
      for (let i = 0; i < PLAETZE; i++){
        const zelle = document.createElement('div');
        const p = platz('e1-' + f.id + '/' + i, kw + M3_RAND, kh + M3_RAND);
        zelle.appendChild(p);
        /* Bei den zyklischen die Laenge - an der KARTE, nicht am Platz:
           Der Text wandert mit, wenn die Karte umgelegt wird (stand.texte,
           Schluessel = Karte).
           ENTFERNT (Rike, 2026-10-29): das Feld «Startwerte?» unter «haengt
           ab». «Die Frage ist, ob wir das ueberhaupt eintragen muessen. Das
           ist ja eigentlich eine Ausgangslage, die wir diskutieren muessen.» */
        if (f.id === 'zykl'){
          const n = document.createElement('input');
          n.className = 'm3notiz';
          n.placeholder = 'Länge';
          n.hidden = true;
          n.addEventListener('pointerdown', e => e.stopPropagation());
          n.addEventListener('input', () => {
            const k = p.querySelector('.k');
            if (k) m3Wert(f.id + ':' + k.dataset.id, n.value);
          });
          zelle.appendChild(n);
        }
        g.appendChild(zelle);
      }
      z.appendChild(g);
      gitter.appendChild(z);
    });
    T.breite();
    m3Verteilen(els, tisch);
    T.ordnen();
    notizen();
  }
  function notizen(){
    feld.querySelectorAll('.m3notiz').forEach(n => {
      const p = n.previousElementSibling;
      const k = p && p.querySelector('.k');
      const art = 'zykl';
      n.hidden = !k;
      if (k && document.activeElement !== n) n.value = stand.texte[art + ':' + k.dataset.id] || '';
    });
  }
  function felder(){
    let kw = kartenbreite();
    zeichnen(kw);
    while ((feld.scrollHeight > feld.clientHeight + 2) && kw > M3_KMIN){
      kw = Math.max(M3_KMIN, kw - 4);
      zeichnen(kw);
    }
  }
  window._nachAblegen = () => { T.ordnen(); notizen(); };
  window._m3neu = () => { m3Verteilen(els, tisch); T.ordnen(); notizen(); };
  window._m3wert = () => notizen();
  m3Bald(felder);
  window.addEventListener('resize', felder);
  window._m3weg = () => window.removeEventListener('resize', felder);
}

/* ══════════════════ Etappe 2 · Bahnen legen, Zyklen zaehlen ══════════════════

   Rike, 2026-10-29 (thema.md, Nachtraege «Etappe 2 neu gefasst» und
   «nachts»). Zwei Teile, als Reiter:

     Teil 1  BAHNEN LEGEN. «Man hat eigentlich erst den Zyklus gefunden,
             wenn man sich durchgerechnet hat.» Eine Bahn beginnt mit
             irgendeinem Startwert; daneben kommt sein Quadrat, dann
             dessen Quadrat. Jeder Schritt erscheint im Kreis. Kommt die
             Bahn bei ihrem Anfang an, schliesst sie sich: Zyklus der
             Laenge k, farbig, im Kreis blass stehen gelassen. Die offene
             Bahn ist kraeftig (Kasper zu Rikes Frage «immer alle Zyklen
             oder nur den, an dem man gerade arbeitet»).
     Teil 2  WIE VIELE ZYKLEN? Gleichung z^(2^n) = z - mit der 0 (Rikes
             Fehlerbefund: «wir loesen eigentlich z Quadrat gleich z»).
             Tabelle 1-7 und ein Werkzeug fuer n = 1-8: alle Loesungen auf
             dem Kreis, kuerzere Zyklen Laenge fuer Laenge wegnehmen, den
             Rest in Zyklen faerben.
*/
const M3_BAHNEN_MAX = 10, M3_BAHN_PLAETZE = 5;

/* Die Bahnen aus dem Stand: [{j, ids (in Platzreihenfolge, lueckenlos ab 0),
   zu (geschlossen?), laenge}] - nur Bahnen mit mindestens einer Karte. */
function m3Bahnen(){
  const E = M3.e2, W = E.winkel, N = E.nenner;
  const roh = {};
  E.karten.forEach(id => {
    const s = stand.karten[id];
    const m = s && s.ort && s.ort.match(/^B(\d+)\/(\d+)$/);
    if (m) (roh[m[1]] = roh[m[1]] || {})[m[2]] = id;
  });
  const quadrat = id => W[id] === null ? null : (2 * W[id]) % N;
  return Object.keys(roh).map(Number).sort((a, b) => a - b).map(j => {
    const ids = [];
    for (let i = 0; i < M3_BAHN_PLAETZE && roh[j][i]; i++) ids.push(roh[j][i]);
    // Stimmt die Kette? Jede Karte ist das Quadrat der vorigen.
    let kette = ids.length > 0;
    for (let i = 1; i < ids.length; i++)
      if (W[ids[i]] === null || W[ids[i]] !== quadrat(ids[i - 1])) kette = false;
    const letzte = ids[ids.length - 1];
    const zu = kette && (W[ids[0]] === null ? ids.length === 1
                         : quadrat(letzte) === W[ids[0]]);
    return {j, ids, kette, zu, laenge: zu ? ids.length : 0,
            alle: Object.values(roh[j])};
  });
}

/* Der Kreis zu Teil 1. Geschlossene Zyklen blass in ihrer Farbe, die
   offenen Bahnen kraeftig: von jeder Karte ein Pfeil zu ihrem WIRKLICHEN
   Quadrat - auch wenn daneben eine falsche Karte liegt. Der naechste Punkt
   der Bahn bekommt einen Ring: «hier geht es weiter». */
function m3KreisBahnen(cv, farbeVon){
  const E = M3.e2, W = E.winkel, N = E.nenner;
  const S = cv.width, g = cv.getContext('2d');
  g.clearRect(0, 0, S, S);
  const r = S / 2 - 26, m = S / 2;
  const pW = k => [m + r * Math.cos(2 * Math.PI * k / N), m - r * Math.sin(2 * Math.PI * k / N)];
  const p = id => W[id] === null ? [m, m] : pW(W[id]);
  g.strokeStyle = '#d8cfc0'; g.lineWidth = 1.2;
  g.beginPath(); g.arc(m, m, r, 0, 2 * Math.PI); g.stroke();
  function pfeil([x1, y1], [x2, y2], farbe, breite){
    g.strokeStyle = g.fillStyle = farbe; g.lineWidth = breite;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    const w = Math.atan2(y2 - y1, x2 - x1), l = 4 + breite * 2.4, ex = x2 - 6 * Math.cos(w), ey = y2 - 6 * Math.sin(w);
    g.beginPath(); g.moveTo(ex, ey);
    g.lineTo(ex - l * Math.cos(w - .38), ey - l * Math.sin(w - .38));
    g.lineTo(ex - l * Math.cos(w + .38), ey - l * Math.sin(w + .38)); g.fill();
  }
  function ring([x, y], w, farbe, breite){
    g.strokeStyle = farbe; g.lineWidth = breite;
    g.beginPath(); g.arc(x + 11 * Math.cos(w), y - 11 * Math.sin(w), 7, 0, 2 * Math.PI); g.stroke();
  }
  const bahnen = m3Bahnen();
  const belegt = new Set();
  bahnen.forEach(b => {
    const farbe = farbeVon(b.j);
    b.alle.forEach(id => belegt.add(id));
    const blass = b.zu;
    g.globalAlpha = blass ? 0.38 : 1;
    const breite = blass ? 1.6 : 2.6;
    b.ids.forEach(id => {
      if (W[id] === null){ ring([m, m], -Math.PI / 4, farbe, breite); return; }
      const k = W[id], k2 = (2 * k) % N;
      if (k2 === k){ ring(pW(k), 2 * Math.PI * k / N, farbe, breite); return; }
      pfeil(pW(k), pW(k2), farbe, breite);
    });
    g.globalAlpha = 1;
    // Offene Bahn: Ring um den naechsten Punkt
    if (!b.zu && b.kette){
      const last = b.ids[b.ids.length - 1];
      if (W[last] !== null){
        const [x, y] = pW((2 * W[last]) % N);
        g.strokeStyle = farbe; g.lineWidth = 2; g.setLineDash([3, 3]);
        g.beginPath(); g.arc(x, y, 10, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]);
      }
    }
  });
  E.karten.forEach(id => {
    const [x, y] = p(id);
    g.fillStyle = belegt.has(id) ? '#2b2622' : '#fff';
    g.strokeStyle = '#2b2622'; g.lineWidth = 1.3;
    g.beginPath(); g.arc(x, y, 4.5, 0, 2 * Math.PI); g.fill(); g.stroke();
  });
}

/* Das Werkzeug zu Teil 2: alle 2^n Loesungen von z^(2^n) = z. Die 0 in
   der Mitte, die anderen auf dem Kreis. `weg` sind die Laengen d, deren
   Zyklen weggenommen sind (blass grau); `farbig`: der Rest in Zyklen
   gefaerbt. Liefert die Zahl der Punkte, die noch uebrig sind. */
function m3KreisLoesungen(cv, n, weg, farbig, farben, gewaehlt, zeigNr){
  const N = 2 ** n - 1;
  const S = cv.width, g = cv.getContext('2d');
  g.clearRect(0, 0, S, S);
  const r = S / 2 - 24, m = S / 2;
  const pW = k => [m + r * Math.cos(2 * Math.PI * k / N), m - r * Math.sin(2 * Math.PI * k / N)];
  g.strokeStyle = '#d8cfc0'; g.lineWidth = 1.2;
  g.beginPath(); g.arc(m, m, r, 0, 2 * Math.PI); g.stroke();
  // Zyklen bestimmen
  const zyklen = [], von = {};
  for (let k = 0; k < N; k++){
    if (k in von) continue;
    const z = [k]; let x = (2 * k) % N;
    while (x !== k){ z.push(x); x = (2 * x) % N; }
    z.forEach(v => { von[v] = zyklen.length; });
    zyklen.push(z);
  }
  const istWeg = k => weg.includes(zyklen[von[k]].length) && zyklen[von[k]].length !== n;
  let uebrig = (weg.includes(1) && n > 1) ? 0 : 1;    // die 0
  let farbe = 0;
  const fz = {};
  zyklen.forEach((z, i) => { if (z.length === n) fz[i] = farben[farbe++ % farben.length]; });
  /* NEU (Rike, 2026-11-03): Die Zyklen der Laenge n sind VERBUNDEN, damit
     man sie sieht - mit «färben» alle duenn, der gezeigte kraeftig und mit
     Pfeilen. Gezeigt wird der angetippte oder der mit ◀ ▶ gewaehlte. */
  const lange = zyklen.map((z, i) => i).filter(i => zyklen[i].length === n);
  let zeig = Math.max(0, Math.min(lange.length - 1, zeigNr || 0));
  if (gewaehlt !== undefined && von[gewaehlt] !== undefined && lange.includes(von[gewaehlt]))
    zeig = lange.indexOf(von[gewaehlt]);
  function verbinden(z, f, breite, pfeile){
    g.strokeStyle = g.fillStyle = f; g.lineWidth = breite;
    z.forEach(k => {
      const [x1, y1] = pW(k), [x2, y2] = pW((2 * k) % N);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      if (!pfeile) return;
      const w = Math.atan2(y2 - y1, x2 - x1), l = 9;
      const mx = x1 + (x2 - x1) * 0.62, my = y1 + (y2 - y1) * 0.62;
      g.beginPath(); g.moveTo(mx, my);
      g.lineTo(mx - l * Math.cos(w - .45), my - l * Math.sin(w - .45));
      g.lineTo(mx - l * Math.cos(w + .45), my - l * Math.sin(w + .45)); g.fill();
    });
  }
  if (farbig) lange.forEach(i => { g.globalAlpha = .45; verbinden(zyklen[i], fz[i], 1.1, false); g.globalAlpha = 1; });
  if (lange.length) verbinden(zyklen[lange[zeig]], fz[lange[zeig]] || '#2b2622', 2.6, true);
  else if (gewaehlt !== undefined && von[gewaehlt] !== undefined)
    verbinden(zyklen[von[gewaehlt]], '#8c8579', 1.8, true);
  const klein = N > 100 ? 2.6 : N > 40 ? 3.6 : 5;
  for (let k = 0; k < N; k++){
    const [x, y] = pW(k);
    const w = istWeg(k);
    if (!w) uebrig++;
    g.globalAlpha = w ? 0.18 : 1;
    g.fillStyle = (!w && farbig && fz[von[k]]) ? fz[von[k]] : (w ? '#a39b8e' : '#2b2622');
    g.beginPath(); g.arc(x, y, klein, 0, 2 * Math.PI); g.fill();
    g.globalAlpha = 1;
  }
  // die 0
  const nullWeg = weg.includes(1) && n > 1;
  g.globalAlpha = nullWeg ? 0.18 : 1;
  g.fillStyle = nullWeg ? '#a39b8e' : '#2b2622';
  g.beginPath(); g.arc(m, m, klein + 1, 0, 2 * Math.PI); g.fill();
  g.globalAlpha = 1;
  g.fillStyle = '#6c6357'; g.font = '12px sans-serif'; g.textAlign = 'center';
  g.fillText('0', m, m - klein - 6);
  return {uebrig, zyklen, von, N, langeZyklen: lange, zeig};
}

/* GEAENDERT (Rike, 2026-10-30): Statt zwei Teilen mit Reitern sind es
   vier Schritte - bahnen (4), tabelle (5), allein (6), werkzeug (7). */
/* Zyklen der genauen Laenge n unter z -> z^2 auf z^(2^n) = z, mit der 0:
   Laenge 1 hat zwei (0 und 1); sonst (1/n) Summe mu(n/d) 2^d. */
function m3Zyklen(n){
  if (n === 1) return 2;
  const mu = k => { let m = 1; for (let p = 2; p * p <= k; p++){ if (k % p === 0){ k /= p; if (k % p === 0) return 0; m = -m; } } return k > 1 ? -m : m; };
  let s = 0;
  for (let d = 1; d <= n; d++) if (n % d === 0) s += mu(n / d) * 2 ** d;
  return s / n;
}
function etappeZyklen(i, modus){
  stilSetzen();
  const E = M3.e2;
  const FARBEN = D.zyklusfarben;
  const vorrat = {id: 'Z', name: modus === 'bahnen' ? 'Die Startwerte — der Grösse nach' : modus === 'besprechen' ? 'Auf dem Kreis' : 'Ihre Bahnen'};
  const RECHTS = {bahnen: 'Ihre Bahnen', tabelle: 'Wie viele Zyklen?', besprechen: 'Wie viele Zyklen der Länge n?',
                  allein: 'Länge 5, 6 und 7', werkzeug: 'Alle Lösungen auf dem Kreis'};
  buehneNeben(m3Auftrag(i), vorrat, RECHTS[modus],
              modus === 'bahnen'
                ? (M3_ALLEIN_HIER ? `<span class="m3still"><b>Allein genügen vier Bahnen:</b> je eine der Länge 1, 2, 3 und 4.</span> ` : '')
                  + `<span class="m3still">Ein Schritt verdoppelt den Winkel: cis(<i>p</i>/<i>q</i> · 360°) ↦ cis(2<i>p</i>/<i>q</i> · 360°).</span>`
                : (modus === 'tabelle' ? `<span class="m3still">Auch die 0 löst die Gleichung.</span>` : ''));

  const feld = document.getElementById('feld');
  const tisch = document.getElementById('feldZ');
  const farbeVon = j => FARBEN[j % FARBEN.length];
  window.KASPER_GEMEINSAM_NORM = s => s.ort === 'tischZ' ? {ort: 'tischZ', x: 0, y: 0, rot: 0} : s;

  if (modus !== 'bahnen'){ teil2(); return; }

  /* ---------- Teil 1 · Bahnen legen ---------- */
  const ids = E.karten;
  window._zustaendig = id => ids.includes(id);
  const els = {};
  ids.forEach(id => { els[id] = karte(id); });
  /* Der Groesse nach (Rike: «sonst sucht man sich blind»), die 0 vorn. */
  const TT = m3Tisch(tisch, ids, null, 140);

  function zeichnen(kw){
    const kh = Math.round(kw * M3_SEITE);
    feld.style.setProperty('--m3karte', kw + 'px');
    Object.values(els).forEach(el => { if (el.parentElement) el.remove(); });
    feld.innerHTML = '';
    const oben = document.createElement('div');
    oben.className = 'm3legen';
    const reihen = document.createElement('div');
    reihen.className = 'm3reihen';
    const bahnen = m3Bahnen();
    // So viele Bahnen, wie belegt sind, und eine leere dazu.
    const hoechste = bahnen.length ? Math.max(...bahnen.map(b => b.j)) : -1;
    /* Allein (Rike, 2026-10-30, Schritte-Vorschlag C): vier Bahnen
       genuegen, je eine der Laenge 1 bis 4; die uebrigen Karten bleiben
       liegen. */
    const zahl = M3_ALLEIN_HIER ? 4 : Math.min(M3_BAHNEN_MAX, hoechste + 2);
    const info = {};
    bahnen.forEach(b => { info[b.j] = b; });
    for (let j = 0; j < zahl; j++) reihen.appendChild(bahn(j, info[j], kw, kh));
    oben.appendChild(reihen);
    const rechts = document.createElement('div');
    rechts.className = 'm3kreisspalte';
    const cv = document.createElement('canvas');
    cv.className = 'm3kreis';
    cv.width = cv.height = 320;
    cv.style.width = cv.style.height = '250px';
    rechts.appendChild(cv);
    const zs = document.createElement('div');
    zs.className = 'm3gefunden';
    rechts.appendChild(zs);
    oben.appendChild(rechts);
    feld.appendChild(oben);
    TT.breite();
    m3Verteilen(els, tisch);
    TT.ordnen();
    nachzeichnen();
  }
  function bahn(j, b, kw, kh){
    const f = document.createElement('div');
    f.className = 'm3bahn' + (b && b.zu ? ' fertig' : '');
    f.style.setProperty('--fach', farbeVon(j));
    const titel = b && b.zu ? `Zyklus der Länge ${b.laenge} ✓` : 'Bahn';
    f.innerHTML = `<h5>${titel}</h5>`;
    const g = document.createElement('div');
    g.className = 'feld';
    g.dataset.ort = 'B' + j;
    g.style.gridTemplateColumns = `repeat(${M3_BAHN_PLAETZE}, ${kw + M3_RAND}px)`;
    for (let i = 0; i < M3_BAHN_PLAETZE; i++){
      const pl = platz('B' + j + '/' + i, kw + M3_RAND, kh + M3_RAND, 'S');
      if (i > 0) pl.classList.add('pfeilvor');
      g.appendChild(pl);
    }
    f.appendChild(g);
    return f;
  }
  function nachzeichnen(){
    const cv = feld.querySelector('canvas.m3kreis');
    if (cv) m3KreisBahnen(cv, farbeVon);
    const zs = feld.querySelector('.m3gefunden');
    if (zs){
      const z = {};
      m3Bahnen().forEach(b => { if (b.zu) z[b.laenge] = (z[b.laenge] || 0) + 1; });
      zs.innerHTML = '<b>Gefunden</b>' + [1, 2, 3, 4, 5].filter(n => z[n])
        .map(n => `<span>Länge ${n}: ${z[n]}</span>`).join('') ;
    }
  }
  function felder(){
    const KLEIN = 58;
    let kw = 120;
    zeichnen(kw);
    // Breite UND Hoehe: Fuenf Plaetze je Bahn liefen sonst unter den Kreis.
    const zuBreit = () => [...feld.querySelectorAll('.m3bahn')].some(f => f.scrollWidth > f.clientWidth + 1)
      || feld.scrollWidth > feld.clientWidth + 1;
    while ((feld.scrollHeight > feld.clientHeight + 2 || zuBreit()) && kw > KLEIN){
      kw = Math.max(KLEIN, kw - 6);
      zeichnen(kw);
    }
  }
  window._nachAblegen = () => { m3melden(); felder(); };
  window._m3neu = () => felder();
  window._m3wert = () => {};
  m3Bald(felder);
  if (window._m3weg) window._m3weg();
  window.addEventListener('resize', felder);
  window._m3weg = () => window.removeEventListener('resize', felder);

  /* ---------- Teil 2 · Wie viele Zyklen? ---------- */
  function teil2(){
    window._zustaendig = () => false;
    /* NEU (Rike, 2026-11-03: «warum wir Zaehlen und Vermuten in zwei
       verschiedenen Bildern haben ... das Wegnehmen haette ich gerne im
       Bild ... einen Zyklus anklicken ... verbinden ... springen zwischen
       Zyklus 1, 2 und 3»): Im Besprechen links der Kreis zur gewaehlten
       Zeile, rechts die Tabelle 1-9. */
    const linksBox = document.createElement('div');
    linksBox.className = 'm3linksbox';
    if (modus !== 'besprechen'){
      const links = document.createElement('canvas');
      links.className = 'm3kreis';
      links.width = links.height = 420;
      links.style.cssText = 'display:block;margin:10px auto;width:min(100%, 420px);height:auto';
      tisch.appendChild(links);
      m3KreisBahnen(links, farbeVon);
    } else tisch.appendChild(linksBox);

    function gefunden(n){
      return m3Bahnen().filter(b => b.zu && b.laenge === n).length;
    }
    const teiler = n => E.werkzeug.filter(d => d < n && n % d === 0);
    /* NEU (Rike, 2026-10-30: «Ja, so bauen» - thema.md F2): Laenge 5 bis 7
       zuerst jede Person fuer sich. Die Zahlen der anderen sieht man erst
       beim Aufdecken; vorher nur, wie viele schon eingetragen haben. Danach
       die gemeinsame Zeile und das Werkzeug fuer 5 bis 8.
       Die Vermutungen stehen auf dem Brett als «~T:<person>:<n><feld>»;
       versteckt sind sie nur auf der Seite - es sind Zahlen, keine
       Personendaten. <person> ist ein Kuerzel, das der Rechner einmal
       wuerfelt und behaelt (localStorage), damit ein Neuladen nicht eine
       zweite Person erzeugt. */
    const ALLEIN = E.zaehlen.filter(n => n >= 5);
    const FELDER = [['g', 'Exponent'], ['a', 'Lösungen'], ['d', 'Zyklen']];
    function personen(){
      const p = new Set();
      Object.entries(stand.texte).forEach(([k, v]) => {
        const m = k.match(/^T:([^:]+):/);
        if (m && v !== '') p.add(m[1]);
      });
      return [...p].sort();
    }
    function zaehlsatz(){
      const andere = personen().filter(x => x !== M3ICH).length;
      return andere ? (andere === 1 ? 'Eine weitere Person hat'
                       : andere + ' weitere Personen haben') + ' schon etwas eingetragen.' : '';
    }
    /* GEAENDERT (Rike, 2026-10-30, Ablauf-Vorschlag C): drei Felder je
       Zeile - Loesungen, davon in kuerzeren Zyklen, Zyklen der Laenge n.
       Den Exponenten der Gleichung tragen die Studierenden nur in Zeile 1
       und 2 ein; ab Zeile 3 steht er da. Je Schritt nur, was er braucht:
         tabelle   Zeilen 1-4, gemeinsam
         allein    Zeilen 5-7, erst fuer sich, dann aufdecken
         werkzeug  das Wegnehmen fuer n = 1 bis 8 */
    /* GEAENDERT (Rike, 2026-11-02: «Eigentlich will ich auch das 8 und
       das 16 nicht ... welche Gleichung gehoert dazu, wie viele Loesungen
       hat die Gleichung ... davon in kuerzeren Zyklen will ich noch nicht
       vorgeben»): je Zeile die Gleichung mit dem Exponenten als Feld (in
       JEDER Zeile), die Zahl der Loesungen und die Zahl der Zyklen. Den
       Weg von den Loesungen zu den Zyklen ueberlegt die Gruppe auf dem
       Notizblatt; das Feld «davon in kuerzeren Zyklen» ist weg. */
    function gleichung(n, vorsatz){
      return `<i>z</i><sup><input data-k="${vorsatz}${n}g" inputmode="numeric" style="width:3.2em"></sup> = <i>z</i>`;
    }
    function zeile(n, vorsatz, rechts){
      const f = (s, breit) => `<input data-k="${vorsatz}${n}${s}" inputmode="numeric" style="width:${breit}em">`;
      return `<tr><td class="n">${n}</td><td>${gleichung(n, vorsatz)}</td>
        <td>${f('a', 3.6)}</td><td>${f('d', 3.2)}</td>${rechts || ''}</tr>`;
    }
    const KOPF = `<tr><th>Zyklus der Länge <i>n</i></th><th>Welche Gleichung gehört dazu?</th>
        <th>Wie viele Lösungen?</th><th>Wie viele Zyklen der Länge <i>n</i>?</th>`;
    function zeichnen(){
      let html = '';
      if (modus === 'besprechen'){
        const nW = Number(stand.texte['loes'] || 1);
        const ok = M3_ALLEIN_HIER && stand.texte['geprueft'] === '1';
        html = `<div class="m3zone" style="background:#F6E7D2">
          <p class="m3hinweis">Tippen Sie auf eine Zeile: Links erscheinen die Startwerte, die nach <i>n</i> Schritten zurück sind.
            ${M3_ALLEIN_HIER ? `<button class="m3knopf" id="m3pruefen">${ok ? 'Lösung verbergen' : 'Prüfen'}</button>` : ''}</p>
          <table class="m3tabelle m3wahltabelle">${KOPF}<th>gelegt</th>${ok ? '<th>richtig</th>' : ''}</tr>
          ${E.zaehlen.map(n => zeile(n, 'R', `<td class="gel">${n <= 4 ? gefunden(n) : ''}</td>`
              + (ok ? `<td class="gel"><i>z</i><sup>${2 ** n}</sup> = <i>z</i> · ${2 ** n} · <b>${m3Zyklen(n)}</b></td>` : ''))
              .replace('<tr>', `<tr data-n="${n}" class="${n === nW ? 'gewaehlt' : ''}">`)).join('')}
          </table></div>`;
        feld.innerHTML = html;
        feld.querySelectorAll('tr[data-n]').forEach(tr => tr.addEventListener('click', e => {
          if (e.target.closest('input')) return;
          m3Wert('loes', tr.dataset.n); zeichnen();
        }));
        werkzeug(nW, linksBox);
      } else if (modus === 'tabelle'){
        html = `<div class="m3zone" style="background:#F6E7D2">
          <table class="m3tabelle">${KOPF}<th>gelegt in Etappe 2</th></tr>
          ${E.zaehlen.filter(n => n < 5).map(n => zeile(n, 'R', `<td class="gel">${gefunden(n)}</td>`)).join('')}
          </table></div>`;
      } else if (modus === 'allein' && M3_ALLEIN_HIER){
        /* Allein (Schritte-Vorschlag D): niemand zum Aufdecken - statt
           dessen «Prüfen», das die richtigen Zahlen neben die eigenen setzt. */
        const ok = stand.texte['geprueft'] === '1';
        html = `<div class="m3zone" style="background:#F6E7D2">
          <p class="m3hinweis">Tragen Sie Ihre Vermutung ein. Dann prüfen Sie.
            <button class="m3knopf" id="m3pruefen">${ok ? 'Lösung verbergen' : 'Prüfen'}</button></p>
          <table class="m3tabelle">${KOPF}${ok ? '<th>richtig</th>' : ''}</tr>
          ${ALLEIN.map(n => zeile(n, 'R', ok ? `<td class="gel"><i>z</i><sup>${2 ** n}</sup> = <i>z</i> · ${2 ** n} Lösungen · <b>${m3Zyklen(n)}</b> Zyklen</td>` : '')).join('')}
          </table></div>`;
      } else if (modus === 'allein'){
        const auf = stand.texte['aufgedeckt'] === '1';
        const P = personen(), ich = M3ICH;
        const name = x => x === ich ? 'Sie' : 'Person ' + (P.filter(y => y !== ich).indexOf(x) + 1);
        html = `<div class="m3zone" style="background:#F6E7D2">
          ${auf
            ? `<p class="m3hinweis"><b>Aufgedeckt.</b> Vergleichen Sie und tragen Sie dann gemeinsam ein.</p>`
            : `<p class="m3hinweis">Die anderen sehen Ihre Zahlen erst beim Aufdecken.
                 <span class="m3still" id="m3zaehler">${zaehlsatz()}</span>
                 <button class="m3knopf" id="m3aufdecken">Aufdecken</button></p>`}
          <table class="m3tabelle">${KOPF}</tr>
          ${ALLEIN.map(n => zeile(n, auf ? 'R' : 'T:' + ich + ':')).join('')}
          </table>
          ${auf ? vergleich(P, name) : ''}
          ${auf ? `<p class="m3still" style="margin:6px 0 0"><button class="m3knopf leise" id="m3verdecken">wieder verdecken</button></p>` : ''}
          </div>`;
      } else {
        const nW = Number(stand.texte['loes'] || 6);
        html = `<div class="m3zone" style="background:#F6E7D2">
          <p class="m3hinweis">Länge ${E.werkzeug.map(n =>
            `<button class="m3knopf ${n === nW ? 'an' : ''}" data-loes="${n}">${n}</button>`).join(' ')}</p>
          <div class="m3best"></div></div>`;
        feld.innerHTML = html;
        feld.querySelectorAll('button[data-loes]').forEach(b => b.onclick = () => {
          m3Wert('loes', b.dataset.loes); zeichnen();
        });
        werkzeug(nW, feld.querySelector('.m3best'));
        return;
      }
      if (modus !== 'besprechen') feld.innerHTML = html;
      feld.querySelectorAll('input[data-k]').forEach(inp => {
        inp.value = stand.texte[inp.dataset.k] || '';
        inp.addEventListener('pointerdown', e => e.stopPropagation());
        inp.addEventListener('input', () => m3Wert(inp.dataset.k, inp.value));
      });
      const ad = feld.querySelector('#m3aufdecken');
      if (ad) ad.onclick = () => {
        if (!confirm('Alle Vermutungen der Gruppe aufdecken?')) return;
        m3Wert('aufgedeckt', '1'); zeichnen();
      };
      const pr = feld.querySelector('#m3pruefen');
      if (pr) pr.onclick = () => { m3Wert('geprueft', stand.texte['geprueft'] === '1' ? '' : '1'); zeichnen(); };
      const vd = feld.querySelector('#m3verdecken');
      if (vd) vd.onclick = () => { m3Wert('aufgedeckt', ''); zeichnen(); };
    }
    /* Nach dem Aufdecken: je Laenge die Vermutungen nebeneinander. */
    function vergleich(P, name){
      if (!P.length) return '<p class="m3still">Niemand hat etwas eingetragen.</p>';
      const w = (p, n, s) => stand.texte['T:' + p + ':' + n + s] || '·';
      const leer = (p, n) => FELDER.every(([s]) => !stand.texte['T:' + p + ':' + n + s]);
      P = [...P.filter(x => x === M3ICH), ...P.filter(x => x !== M3ICH)];
      return `<table class="m3tabelle m3vergleich">
        <tr><th></th>${ALLEIN.map(n => `<th>Länge ${n}</th>`).join('')}</tr>
        ${P.map(p => `<tr><td class="wer">${name(p)}</td>${ALLEIN.map(n =>
          leer(p, n) ? '<td>—</td>'
          : `<td><i>z</i><sup>${w(p, n, 'g')}</sup> = <i>z</i> · ${w(p, n, 'a')} Lösungen · <b>${w(p, n, 'd')}</b> Zyklen</td>`).join('')}</tr>`).join('')}
      </table>`;
    }
    /* Das Werkzeug (Rike: «welche fallen weg und welche bleiben uebrig ...
       eine arithmetische Sache, die eigentlich huebsch ist»). */
    function werkzeug(n, box){
      const weg = teiler(n).filter(d => stand.texte['weg:' + n + ':' + d] === '1');
      const farbig = stand.texte['farb:' + n] === '1';
      const g0 = stand.texte['gew:' + n];
      const zi = Number(stand.texte['zyk:' + n] || 0);
      const kopf = modus === 'besprechen'
        ? `<p class="m3still"><b>Länge ${n}:</b> alle Startwerte, die nach ${n} Schritt${n > 1 ? 'en' : ''} wieder da sind; die 0 in der Mitte.</p>`
        : `<p class="m3still">Die Lösungen von <i>z</i><sup>${2 ** n}</sup> = <i>z</i>;
          die 0 in der Mitte. Einen Punkt antippen: Sein Zyklus bekommt Pfeile.</p>`;
      box.innerHTML = `${kopf}
        <div class="m3zyknav"><button class="m3knopf" data-zyk="-1">◀</button>
          <span class="m3zyktext"></span><button class="m3knopf" data-zyk="1">▶</button></div>
        <div class="m3werkzeug"><canvas class="m3kreis" width="380" height="380"></canvas>
          <div class="m3wegknoepfe">
            ${teiler(n).map(d => `<button class="m3knopf ${weg.includes(d) ? 'an' : ''}" data-weg="${d}">Länge ${d} ${weg.includes(d) ? 'zurück' : 'wegnehmen'}</button>`).join('')}
            <button class="m3knopf ${farbig ? 'an' : ''}" data-farb="1">Rest in Zyklen ${farbig ? 'grau' : 'färben'}</button>
            <span class="m3uebrig"></span></div></div>`;
      const cv = box.querySelector('canvas');
      cv.style.width = cv.style.height = modus === 'besprechen' ? 'min(380px, 100%)' : '270px';
      const res = m3KreisLoesungen(cv, n, weg, farbig, FARBEN,
                                   g0 === undefined || g0 === '' ? undefined : Number(g0), zi);
      box.querySelector('.m3uebrig').textContent = `übrig: ${res.uebrig} von ${2 ** n}`;
      /* Springen zwischen den Zyklen der Laenge n (Rike: «zwischen Zyklus
         1, 2 und 3, sodass man das immer wirklich sieht»). */
      const zt = box.querySelector('.m3zyktext');
      zt.innerHTML = res.langeZyklen.length
        ? `Zyklus ${res.zeig + 1} von ${res.langeZyklen.length} der Länge ${n}${n === 1 ? ' (dazu die 0)' : ''}`
        : 'kein Zyklus';
      box.querySelectorAll('button[data-zyk]').forEach(b => b.onclick = () => {
        const L = res.langeZyklen.length || 1;
        m3Wert('zyk:' + n, String((res.zeig + Number(b.dataset.zyk) + L) % L));
        m3Wert('gew:' + n, '');
        zeichnen();
      });
      box.querySelectorAll('button[data-weg]').forEach(b => b.onclick = () => {
        const k = 'weg:' + n + ':' + b.dataset.weg;
        m3Wert(k, stand.texte[k] === '1' ? '' : '1');
        zeichnen();
      });
      box.querySelector('button[data-farb]').onclick = () => {
        m3Wert('farb:' + n, farbig ? '' : '1');
        zeichnen();
      };
      cv.style.cursor = 'pointer';
      cv.onclick = e => {
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * cv.width - cv.width / 2;
        const y = cv.height / 2 - (e.clientY - r.top) / r.height * cv.height;
        let w = Math.atan2(y, x) / (2 * Math.PI); if (w < 0) w += 1;
        m3Wert('gew:' + n, Math.round(w * res.N) % res.N);
        zeichnen();
      };
    }
    window._nachAblegen = null;
    window._m3neu = () => {};
    window._m3wert = name => {
      if (/^(loes|weg:|farb:|gew:|zyk:|aufgedeckt|geprueft)/.test(name)) { zeichnen(); return; }
      // Eine neue Person vor dem Aufdecken: nur der Zaehler aendert sich.
      // FEHLERBEHOBEN (2026-10-30, mit zwei Fenstern gesehen): Hier wurde
      // neu gezeichnet - aber nicht, solange jemand tippte, und dann blieb
      // der Zaehler alt. Jetzt nur der Satz, ohne die Felder anzufassen.
      if (name.startsWith('T:') && stand.texte['aufgedeckt'] !== '1'){
        const z = feld.querySelector('#m3zaehler');
        if (z) z.textContent = zaehlsatz();
        return;
      }
      feld.querySelectorAll('input[data-k]').forEach(inp => {
        if (document.activeElement !== inp) inp.value = stand.texte[inp.dataset.k] || '';
      });
    };
    zeichnen();
    if (window._m3weg) window._m3weg();
    window._m3weg = null;
  }
}

/* ══════════════════ Synchronisation: der Spielstand der Gruppe ══════════════════

   VORSCHLAG_meilenstein_3.md, Abschnitt 5; Rike, 2026-10-29: «Ja,
   Synchronisation.» Der Befund, der dazu fuehrt: «wenn wir Etappen
   wechseln, muessen alle wechseln; wenn einer eine Runde zurueckgeht, ist
   es auf einmal irgendwo ganz anders und wir schaffen es nicht mehr, das
   zu synchronisieren.»

     1  Ein Spielstand je Gruppe auf dem Brett: wo die Gruppe ist (Etappe,
        Topf) und eine Fassung, die hochzaehlt. Neuere Fassung gewinnt.
     2  «Weiter» bewegt alle - der Knopf im Kopf und «Weiter zu Länge …».
     3  Alles andere (Navigation oben, Reiter) ist ZURUECKSCHAUEN: privat
        und nur zum Lesen. Ein Band sagt, wo die Gruppe ist.
     4  Zurueckholen ist ausdruecklich: «Alle hierher holen», mit Rueckfrage.
     5  Ein Brett fuer den ganzen Meilenstein (gemeinsam_m3.js, M3: 1).

   Wer neu laedt oder spaeter kommt, liest zuerst das Brett und geht dann
   dorthin, wo die Gruppe ist - nicht dorthin, wo der eigene Rechner
   zuletzt war.

   Ohne Brett (allein, ohne Gruppe) tut dieser Teil nichts. */
let M3SPIEL = null;              // {e, t, n} - wo die Gruppe ist

/* ---------- Rikes Leitungslink (D und F3, Rike 2026-10-30) ----------
   Wie in Meilenstein 2: `?leitung=WORT`, im Quelltext nur die
   Pruefsumme (thema.LEITUNG). Mit ihm geht jede Simulation, die Rike
   oeffnet, an die ganze Gruppe (m3Simulation, «folgen»). */
let M3_LEITUNG = false;
(async function(){
  const wort = new URLSearchParams(location.search).get('leitung');
  if (!wort || !D.leitung || !(window.crypto && crypto.subtle)) return;
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(wort.trim().toLowerCase()));
  const hex = [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (hex === D.leitung){ M3_LEITUNG = true; document.body.classList.add('m3leitung'); m3Beschriften(); }
})();

/* Die geteilte Simulation geht als Wert «sim» uebers Brett. */
let M3_ZEIGEN = true;             // Leitung: «Alle sehen meine Simulation»
function m3SimMelden(z){ m3Wert('sim', JSON.stringify(z)); }
window._m3simBrett = () => {
  if (M3_LEITUNG) return;
  let z = null;
  try { z = JSON.parse(stand.texte.sim || 'null'); } catch(_) {}
  if (!document.body.classList.contains('m3gedockt')) return;   // nur in Schritt 2
  const offen = document.querySelector('.m3sim.folgt');
  if (!z || !z.id || z.frei){ if (offen) offen._freigeben(); return; }
  if (offen && offen._o === z.o){ offen._setzen(z); return; }
  m3Simulation(z.id, z.stufe, z);
};
/* Ein Kuerzel fuer diesen Rechner, einmal gewuerfelt und behalten - fuer
   die Vermutungen in Etappe 2, Teil 2. Kein Name, keine Personendaten. */
const M3ICH = (() => {
  try {
    let p = localStorage.getItem('kasper:m3person');
    if (!p){ p = Math.random().toString(36).slice(2, 7); localStorage.setItem('kasper:m3person', p); }
    return p;
  } catch(_) { return Math.random().toString(36).slice(2, 7); }
})();
let m3privat = false;

function m3Verbunden(){
  return !!(window.GEMEINSAM && GEMEINSAM.gestartet && GEMEINSAM.gestartet()
            && GEMEINSAM.bereit && GEMEINSAM.bereit());
}
function m3Hier(){ return {e: stand.etappe || 0, t: 0}; }
function m3Gleich(a, b){ return !!(a && b && a.e === b.e); }
function m3Ortname(p){
  if (p.e >= ETAPPEN.length) return 'Mitnehmen';
  const a = D.etappen[p.e];
  return a.rang + (a.unterteil ? ' (' + a.unterteil + ')' : '');
}
/* Band und Leitungsstreifen teilen sich EINE Zeile unter der Frage. */
function m3Zeile(kopf){
  let z = kopf.querySelector(':scope > .m3zeile');
  if (!z){ z = document.createElement('div'); z.className = 'm3zeile'; kopf.appendChild(z); }
  return z;
}

/* Ein Text oder Schalter: in den Stand und aufs Brett. */
const _m3uhr = {};
/* FEHLERBEHOBEN (2026-10-30): Geschickt wird der Wert vom Aufruf, nicht
   stand.texte beim Ablauf der Uhr - das Nachfragen im Sekundentakt kann
   stand.texte in der Zwischenzeit mit dem alten Wert vom Brett
   ueberschrieben haben, und dann ging der alte Wert zurueck aufs Brett. */
function m3Wert(name, w){
  const v = String(w);
  stand.texte[name] = v;
  clearTimeout(_m3uhr[name]);
  _m3uhr[name] = setTimeout(() => {
    if (window.GEMEINSAM && GEMEINSAM.wert) GEMEINSAM.wert(name, v);
  }, name === 'sim' ? 120 : 300);
}

function m3GruppeSetzen(p){
  M3SPIEL = {e: p.e, t: p.t, n: (M3SPIEL ? M3SPIEL.n : 0) + 1};
  GEMEINSAM.spiel('e' + p.e + '-t' + p.t, M3SPIEL.n);
}

/* Dorthin gehen, wo die Gruppe ist - ohne selbst etwas zu melden. */
function m3Folgen(){
  if (!M3SPIEL || stand.aufnahme === null) return;
  m3privat = false;
  if (m3Gleich(m3Hier(), M3SPIEL)) { m3Band(); return; }
  stand.etappe = M3SPIEL.e;
  stand.m3topf = M3SPIEL.t;
  window._m3folgt = true;
  try { los(); } finally { window._m3folgt = false; }
}

/* Das Band im Kopf, solange man allein woanders hinschaut. */
function m3Band(){
  document.body.classList.toggle('m3privat', m3privat);
  const alt = document.querySelector('.m3privatband');
  if (alt) alt.remove();
  if (!m3privat || !M3SPIEL) return;
  const kopf = document.querySelector('.auftrag') || document.querySelector('.start');
  if (!kopf) return;
  const b = document.createElement('div');
  b.className = 'm3privatband';
  b.innerHTML = `<span>Sie sehen <b>${m3Ortname(m3Hier())}</b> für sich.
      Ihre Gruppe ist bei <b>${m3Ortname(M3SPIEL)}</b>.</span>
    <button class="knopf" id="m3zurgruppe">Zurück zur Gruppe</button>
    <button class="knopf leer" id="m3holen">Alle hierher holen</button>`;
  m3Zeile(kopf).appendChild(b);
  b.querySelector('#m3zurgruppe').onclick = m3Folgen;
  b.querySelector('#m3holen').onclick = () => {
    if (!confirm('Alle in Ihrer Gruppe kommen hierher, zu ' + m3Ortname(m3Hier()) + '. Einverstanden?')) return;
    m3privat = false;
    m3GruppeSetzen(m3Hier());
    m3Band();
  };
}

/* Wer drueckt «Weiter»? Der Knopf kommt aus den Anbauten; er wird beim
   Klick erkannt, bevor er los() ruft. */
document.addEventListener('click', e => {
  if (!(e.target.closest && e.target.closest('.auftrag .knopf.weiter'))) return;
  window._m3gruppe = true;
}, true);

(function(){
  const _los = window.los;
  window.los = function(){
    const r = _los.apply(this, arguments);
    const gruppe = window._m3gruppe; window._m3gruppe = false;
    if (!m3Verbunden() || stand.aufnahme === null) return r;
    if (window._m3folgt){ m3privat = false; m3Band(); return r; }
    /* NEU (Fuehrungs-Vorschlag C): Die Leitung nimmt mit jedem Schritt,
       den sie waehlt, die Gruppe mit. */
    if (gruppe || !M3SPIEL || M3_LEITUNG){
      // «Weiter» - oder es gibt noch gar keinen Spielstand: Dann ist die
      // Gruppe dort, wo der Erste hingeht.
      m3privat = false;
      m3GruppeSetzen(m3Hier());
    } else {
      m3privat = !m3Gleich(m3Hier(), M3SPIEL);
    }
    m3Band();
    return r;
  };
})();

/* NEU (Rike, 2026-10-30): keine Systemwoerter. Das Geruest beschriftet die
   Navigation mit «Etappe n» und den Knopf mit «Weiter zu Etappe n». Hier,
   nachdem alle Anbauten fertig sind (Microtask), wird daraus die
   Schrittleiste 1-7 und ein schlichtes «Weiter» am Ende der Frage. */
function m3Streifen(){
  const alt = document.querySelector('.m3leitstreifen');
  if (alt) alt.remove();
  if (!M3_LEITUNG) return;
  const kopf = document.querySelector('.auftrag');
  if (!kopf) return;
  const s = document.createElement('div');
  s.className = 'm3leitstreifen';
  const sim = document.body.classList.contains('m3gedockt');
  s.innerHTML = `<span class="leitmarke">Leitung</span>
    <span>${m3Verbunden() ? 'Die Schrittleiste nimmt die Gruppe mit.' : 'Nicht mit einer Gruppe verbunden.'}</span>
    ${sim && m3Verbunden() ? `<button class="${M3_ZEIGEN ? 'an' : ''}" id="m3zeigen">Alle sehen meine Simulation: ${M3_ZEIGEN ? 'an' : 'aus'}</button>` : ''}`;
  m3Zeile(kopf).prepend(s);
  const z = s.querySelector('#m3zeigen');
  if (z) z.onclick = () => {
    M3_ZEIGEN = !M3_ZEIGEN;
    const d = document.querySelector('.m3sim.dock');
    if (d && d._zeigen) d._zeigen(M3_ZEIGEN);
    m3Streifen();
  };
}
function m3Beschriften(){
  /* Die Leiste: «Etappe 1  Sortieren  Besprechen  Etappe 2  Sortieren
     Besprechen». Unterteile haben keinen eigenen Knopf; ihr Teil
     leuchtet, solange man in einem von ihnen ist. */
  if (!document.querySelector('#nav .m3etappe'))
  document.querySelectorAll('#nav button').forEach(b => {
    const m = b.textContent.match(/^Etappe (\d+)$/);
    if (!m) return;
    const k = m[1] - 1, a = D.etappen[k];
    const erster = D.etappen.findIndex(x => x.etappe === a.etappe && x.teil === a.teil);
    if (erster !== k){ b.hidden = true; return; }
    b.textContent = a.teil;
    b.title = a.rang;
    const hier = D.etappen[stand.etappe];
    if (stand.aufnahme !== null && hier && hier.etappe === a.etappe && hier.teil === a.teil)
      b.setAttribute('aria-current', 'true');
    if (D.etappen.findIndex(x => x.etappe === a.etappe) === k)
      b.insertAdjacentHTML('beforebegin', `<span class="m3etappe">Etappe ${a.etappe}</span>`);
  });
  const w = document.querySelector('.auftrag .knopf.weiter');
  if (w){
    w.textContent = /Mitnehmen/.test(w.textContent) ? 'Zum Schluss' : 'Weiter';
    w.parentElement.appendChild(w);
    // «Weiter» gehoert ans Ende der Fragezeile, die Zeile mit Band und
    // Leitung darunter.
    const z = w.parentElement.querySelector(':scope > .m3zeile');
    if (z) w.parentElement.appendChild(z);
  }
  m3Streifen();
}
(function(){
  const _los2 = window.los;
  window.los = function(){ const r = _los2.apply(this, arguments); queueMicrotask(m3Beschriften); return r; };
  const _nav = window.nav;
  window.nav = function(){ const r = _nav.apply(this, arguments); m3Beschriften(); return r; };
})();

/* Ein Spielstand kommt vom Brett. */
window._m3spiel = z => {
  const m = z.ort.match(/^e(\d+)-t(\d+)$/);
  if (!m) return;
  const neu = {e: Number(m[1]), t: Number(m[2]), n: z.x};
  if (M3SPIEL && neu.n < M3SPIEL.n) return;          // aelter: verwerfen
  const warDabei = !m3privat;
  M3SPIEL = neu;
  if (!m3Verbunden()) return;                       // erstes Lesen: siehe _m3bereit
  if (warDabei) m3Folgen();
  else m3Band();
};
/* Das Brett ist zum ersten Mal ganz gelesen: dorthin, wo die Gruppe ist. */
window._m3bereit = () => {
  if (M3SPIEL) m3Folgen();
  else if (stand.aufnahme !== null) m3GruppeSetzen(m3Hier());
  window._m3simBrett();
  m3Streifen();
};

/* Etappe 1 entfernt ihren resize-Haken, sobald eine andere Etappe baut. */
/* Sieben Schritte (thema.ETAPPEN, Rike 2026-10-30). Jeder entfernt beim
   Bauen den resize-Haken des vorigen.
   FEHLERBEHOBEN (2026-10-30): Der Helfer hiess zuerst m3Schritt - wie die
   Rechenfunktion der Simulation, die er damit ueberschrieb. */
function m3Etappe(fn){ return function(){
  if (window._m3weg) window._m3weg();
  /* Die Leitung verlaesst Schritt 2: ihre gezeigte Simulation nicht stehen
     lassen - sonst saehe die Gruppe sie beim naechsten Besuch wieder. */
  if (M3_LEITUNG && document.querySelector('.m3sim.dock') && /"id":"[^"]/.test(stand.texte.sim || ''))
    m3SimMelden({id: ''});
  m3Abdocken();
  fn();
  if (document.body.classList.contains('m3gedockt')){
    m3Platzhalter();
    window._m3simBrett();
  }
}; }
/* GEAENDERT (Rike, 2026-10-30, Fuehrungs-Vorschlag A): sechs Schritte.
   Ausprobieren und Drehung sind ein Schritt; die Simulation steht als
   Spalte daneben, die Drehung liegt darin eingeklappt. */
ETAPPEN.length = 0;
ETAPPEN.push(m3Etappe(() => etappeIteratoren(0, 0)),
             m3Etappe(() => etappeIteratoren(1, 2)),
             m3Etappe(() => etappeZyklen(2, 'bahnen')),
             /* GEAENDERT (Rike, 2026-11-03): Zaehlen, Vermuten und Wegnehmen
                in EINEM Bild. */
             m3Etappe(() => etappeZyklen(3, 'besprechen')));

/* KOPIERT aus meilenstein_2/anbauten.js am 2026-10-29, unveraendert -
   wie Meilenstein 2 es aus Meilenstein 1 genommen hat. Der PRUEFEN-Satz
   unten trifft jetzt zu: Mit dem dritten Meilenstein gehoert das Geruest
   in eine gemeinsame Datei. Nicht jetzt - Meilenstein 1 und 2 sind
   draussen, und ein gemeinsamer Bau veraenderte sie mit. */

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
  const M3_ALLEIN = !RAUM_DA && new URLSearchParams(location.search).get('allein') === '1';

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
  /* GEAENDERT (Rike, 2026-10-30, VORSCHLAG_meilenstein_3_schritte.md E):
     Ohne Gruppe in der Adresse kommt JEDES Mal die Startseite - nicht mehr
     von selbst die zuletzt gewaehlte Gruppe. Die eigene Arbeit kommt
     trotzdem zurueck: Wer die Gruppe wieder waehlt, liest das Brett. Der
     gespeicherte Stand wird hier selbst zurueckgeholt (statt im ersten
     los() des Kerns), damit danach die Startseite gesetzt werden kann. */
  if (!RAUM_DA && !M3_ALLEIN){
    const _losStart = window.los;
    let erstes = true;
    window.los = function(){
      if (erstes){
        erstes = false;
        if (!_wiederaufgenommen){ _wiederaufgenommen = true; _wiederaufnehmen(); }
        stand.aufnahme = null;
      }
      return _losStart.apply(this, arguments);
    };
  }

  let raumNachgeholt = false;
  const _losRaum = window.los;
  window.los = function(){
    const r = _losRaum.apply(this, arguments);
    if (!raumNachgeholt){
      raumNachgeholt = true;
      if (!RAUM_DA && !M3_ALLEIN && stand.gruppe && stand.aufnahme !== null){
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
    /* GEAENDERT (Rike, 2026-10-30, VORSCHLAG_meilenstein_3_fuehrung.md B):
       statt «Wir machen's alleine» (aufgezeichnet, abgegeben) jetzt «Ich
       uebe allein» - ohne Brett, ohne Aufzeichnung, alle Schritte frei.
       Die Adresse traegt `?allein=1`, damit Neuladen allein bleibt.
       aufnahme.html bleibt als Datei, ist aber nicht mehr verlinkt. */
    if (M3_ALLEIN){ stand.gruppe = null; stand.aufnahme = false; los(); return; }
    rahmen(`<h2>${(D.start && D.start.titel) || ''}</h2>
      <div class="wahl" data-weg="gruppe"><b>Los geht's — in der Gruppe</b>
        <span>Sie arbeiten gemeinsam an einem Brett. Es wird nichts
        aufgezeichnet.</span></div>
      <div class="wahl" data-weg="allein"><b>Ich übe allein</b>
        <span>Für sich erkunden, im eigenen Tempo. Alle Schritte sind
        offen. Es wird nichts aufgezeichnet und nichts abgegeben.</span></div>`);

    document.querySelectorAll('.wahl').forEach(w => w.onclick = () => {
      if (w.dataset.weg === 'allein'){ location.href = location.pathname + '?allein=1'; return; }
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

/* ══════════════════ Das Notizblatt ══════════════════

   NEU (Rike, 2026-10-30, VORSCHLAG_meilenstein_3_fuehrung.md D): «wie bei
   Lars in der Werkstatt links ein Notizblatt, das ich einblenden kann ...
   damit ich nicht immer auf ein Whiteboard wechseln muss. Gerne mit Stift
   und Farbwahl.» Entscheid: ein Blatt je Gruppe, alle sehen und schreiben.

   Vorbild ist Lars' Notizblatt (LARS/bauen/gestalt/notizblatt.js) - von
   dort die ERFAHRUNGEN, nicht der Code:
     - Die Leinwand ist so gross wie das Sichtfenster und wird beim Rollen
       neu gezeichnet; der Bogen waechst nach unten, sobald man sich dem
       Ende naehert (ein Bogen als eine Leinwand waere Bildspeicher fuer
       nichts).
     - Hat die Flaeche einmal einen Stift (pointerType «pen») gesehen,
       zeichnet nur noch der Stift; der Handballen nicht, der Finger rollt.
     - Der Radierer nimmt ganze Striche.
     - Gespeichert werden Striche als Zahlen, nicht als Bild.

   UEBER DAS BRETT: jeder Strich und jeder Text ist ein Wert «nb:<id>»
   (gemeinsam_m3.js, M3: 6). Geloescht wird, indem der Wert leer wird.
   «Leeren» zaehlt «nbgen» hoch; was eine aeltere Nummer traegt, gilt
   nicht mehr. Allein (ohne Brett) liegt alles nur im eigenen Stand.

   Koordinaten in Bildpunkten ab der linken oberen Ecke des Bogens. Wer
   ein schmaleres Blatt hat, sieht rechts weniger - abgeschnitten wird
   nichts.
*/
(function(){
  /* Allein braucht es kein Notizblatt (Rike, 2026-10-30). */
  if (typeof M3_ALLEIN_HIER !== 'undefined' && M3_ALLEIN_HIER) return;
  const FARBEN = ['#2b2622', '#C2562F', '#2F6FB0', '#3E8A4F', '#D08A1E'];
  const KARO = 24;

  const stil = document.createElement('style');
  stil.textContent = `
.m3nbgriff{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:2147480100;
  writing-mode:vertical-rl;transform-origin:center;rotate:180deg;
  background:#2b2622;color:#fff;border:none;border-radius:0 4px 4px 0;padding:14px 7px;
  font:600 13px/1 "Source Sans 3",system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;
  box-shadow:2px 0 10px rgba(0,0,0,.15)}
body.m3nbauf .m3nbgriff{display:none}
.m3nb{position:fixed;left:0;top:0;bottom:0;width:50vw;z-index:2147480050;display:none;
  flex-direction:column;background:#fffefb;box-shadow:6px 0 28px rgba(0,0,0,.22);
  border-right:4px solid #2b2622}
.m3nb.breit{width:100vw}
body.m3nbauf .m3nb{display:flex}
.m3nb .leiste{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:7px 10px;
  border-bottom:1px solid rgba(0,0,0,.1);font:13px "Source Sans 3",system-ui,sans-serif}
.m3nb .leiste b{margin-right:6px}
.m3nb .leiste button{font:inherit;padding:3px 10px;border:1.4px solid rgba(0,0,0,.15);
  border-radius:2px;background:#fff;cursor:pointer;color:#2b2622}
.m3nb .leiste button.an{border-color:#2b2622;font-weight:700}
.m3nb .leiste .farbe{width:22px;height:22px;padding:0;border-radius:50%;border:2px solid #fff;
  box-shadow:0 0 0 1px rgba(0,0,0,.25)}
.m3nb .leiste .farbe.an{box-shadow:0 0 0 2px #2b2622}
.m3nb .leiste .luft{flex:1 1 auto}
.m3nb .bogen{position:relative;flex:1 1 auto;overflow-y:auto;overflow-x:hidden}
.m3nb .bogen .hoehe{width:1px}
.m3nb canvas{position:absolute;left:0;top:0;touch-action:none;user-select:none;
  -webkit-user-select:none;-webkit-touch-callout:none}
.m3nb.nurstift canvas, .m3nb.tippen canvas{touch-action:pan-y}
.m3nb textarea{position:absolute;font:16px/1.3 "Andika","Source Sans 3",sans-serif;
  border:1px dashed #999;background:rgba(255,255,255,.9);padding:2px 4px;min-width:160px;
  min-height:28px;resize:both;z-index:2}
`;
  document.head.appendChild(stil);

  const griff = document.createElement('button');
  griff.className = 'm3nbgriff';
  griff.textContent = 'Notizblatt';
  const nb = document.createElement('div');
  nb.className = 'm3nb';
  nb.innerHTML = `<div class="leiste">
      <b id="m3nbtitel">Notizblatt</b>
      <button data-mod="stift" class="an">✎ Stift</button>
      <button data-mod="tippen">T Text</button>
      <button data-mod="radieren">⌫ Radierer</button>
      ${FARBEN.map((f, i) => `<button class="farbe${i ? '' : ' an'}" data-f="${f}" style="background:${f}" title="Farbe"></button>`).join('')}
      <button data-w="2.5" class="an" title="fein">fein</button><button data-w="5" title="dick">dick</button>
      <span class="luft"></span>
      <button id="m3nbleeren" title="Alles löschen">Leeren</button>
      <button id="m3nbbreit">breiter</button>
      <button id="m3nbzu">✕</button>
    </div>
    <div class="bogen"><div class="hoehe"></div><canvas></canvas></div>`;
  document.body.appendChild(griff);
  document.body.appendChild(nb);

  const bogen = nb.querySelector('.bogen'), hoehe = nb.querySelector('.hoehe');
  const cv = nb.querySelector('canvas'), g = cv.getContext('2d');
  let modus = 'stift', farbe = FARBEN[0], breite = 2.5, stiftGesehen = false;
  let H = 0;

  const verbunden = () => typeof m3Verbunden === 'function' && m3Verbunden();
  const neueId = () => (typeof M3ICH === 'string' ? M3ICH : 'x') + Date.now().toString(36)
                       + Math.random().toString(36).slice(2, 5);
  const gen = () => Number(stand.texte.nbgen || 0);

  /* Alles, was gilt: aus stand.texte - dort landet auch, was vom Brett kommt. */
  function eintraege(){
    const g0 = gen(), aus = [];
    Object.keys(stand.texte).forEach(k => {
      if (!k.startsWith('nb:') || !stand.texte[k]) return;
      try { const e = JSON.parse(stand.texte[k]); if ((e.g || 0) === g0){ e.id = k.slice(3); aus.push(e); } }
      catch(_) {}
    });
    return aus.sort((a, b) => (a.z || 0) - (b.z || 0));
  }
  function setzen(id, e){
    const w = e ? JSON.stringify(e) : '';
    if (typeof m3Wert === 'function') m3Wert('nb:' + id, w); else stand.texte['nb:' + id] = w;
    if (typeof sichern === 'function') try { sichern(); } catch(_) {}
  }

  function masse(){
    const r = bogen.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    let unten = 0;
    eintraege().forEach(e => { if (e.p) for (let i = 1; i < e.p.length; i += 2) unten = Math.max(unten, e.p[i]); else unten = Math.max(unten, e.y || 0); });
    H = Math.max(H, r.height * 3, unten + r.height);
    hoehe.style.height = H + 'px';
    zeichnen();
  }
  function zeichnen(){
    const sy = bogen.scrollTop, w = cv.clientWidth, h = cv.clientHeight;
    cv.style.top = sy + 'px';
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#e9eef4'; g.lineWidth = 1;
    for (let x = KARO; x < w; x += KARO){ g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, h); g.stroke(); }
    for (let y = KARO - (sy % KARO); y < h; y += KARO){ g.beginPath(); g.moveTo(0, y + .5); g.lineTo(w, y + .5); g.stroke(); }
    eintraege().concat(jetzt ? [jetzt] : []).forEach(e => malen(e, sy));
  }
  function malen(e, sy){
    if (e.t != null){
      g.fillStyle = e.f; g.font = '16px Andika, "Source Sans 3", sans-serif'; g.textBaseline = 'top';
      String(e.t).split('\n').forEach((z, i) => g.fillText(z, e.x, e.y - sy + i * 21));
      return;
    }
    const p = e.p;
    if (!p || p.length < 2) return;
    g.strokeStyle = e.f; g.lineWidth = e.w || 2.5; g.lineCap = g.lineJoin = 'round';
    g.beginPath(); g.moveTo(p[0], p[1] - sy);
    if (p.length === 2) g.lineTo(p[0] + .1, p[1] - sy);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1] - sy);
    g.stroke();
  }

  /* ---------- Zeichnen, Radieren, Tippen ---------- */
  let jetzt = null;
  const ort = ev => { const r = cv.getBoundingClientRect(); return [Math.round(ev.clientX - r.left), Math.round(ev.clientY - r.top + bogen.scrollTop)]; };
  function getroffen(x, y){
    const es = eintraege();
    for (let j = es.length - 1; j >= 0; j--){
      const e = es[j];
      if (e.t != null){
        const zeilen = String(e.t).split('\n');
        g.font = '16px Andika, "Source Sans 3", sans-serif';
        const b = Math.max(...zeilen.map(z => g.measureText(z).width));
        if (x >= e.x - 4 && x <= e.x + b + 4 && y >= e.y - 4 && y <= e.y + zeilen.length * 21 + 4) return e;
      } else for (let i = 0; i < e.p.length; i += 2)
        if (Math.hypot(e.p[i] - x, e.p[i + 1] - y) < 9 + (e.w || 2.5)) return e;
    }
    return null;
  }

  cv.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'pen' && !stiftGesehen){ stiftGesehen = true; nb.classList.add('nurstift'); }
    if (stiftGesehen && ev.pointerType === 'touch') return;          // Handballen, Finger rollt
    textFertig();
    const [x, y] = ort(ev);
    if (modus === 'tippen'){ ev.preventDefault(); tippen(x, y, getroffen(x, y)); return; }
    ev.preventDefault();
    cv.setPointerCapture(ev.pointerId);
    if (modus === 'radieren'){ const e = getroffen(x, y); if (e){ setzen(e.id, null); zeichnen(); } jetzt = {radiert: true}; return; }
    jetzt = {f: farbe, w: breite, p: [x, y], g: gen(), z: Date.now()};
    zeichnen();
  });
  cv.addEventListener('pointermove', ev => {
    if (!jetzt) return;
    const [x, y] = ort(ev);
    if (jetzt.radiert){ const e = getroffen(x, y); if (e){ setzen(e.id, null); zeichnen(); } return; }
    const n = jetzt.p.length;
    if (Math.hypot(x - jetzt.p[n - 2], y - jetzt.p[n - 1]) < 2) return;
    jetzt.p.push(x, y);
    zeichnen();
  });
  const ende = () => {
    if (!jetzt) return;
    const e = jetzt; jetzt = null;
    if (!e.radiert) setzen(neueId(), e);
    masse();
  };
  cv.addEventListener('pointerup', ende);
  cv.addEventListener('pointercancel', ende);

  function textFertig(){ const ta = nb.querySelector('textarea'); if (ta && ta._fertig) ta._fertig(); }
  function tippen(x, y, alt){
    textFertig();
    const ta = document.createElement('textarea');
    const e = alt && alt.t != null ? alt : null;
    ta.value = e ? e.t : '';
    ta.style.left = (e ? e.x : x) - 5 + 'px';
    ta.style.top = (e ? e.y : y) - 3 + 'px';
    ta.style.color = e ? e.f : farbe;
    bogen.appendChild(ta);
    setTimeout(() => ta.focus(), 0);
    if (e){ const id = e.id; stand.texte['nb:' + id] = ''; zeichnen(); ta.dataset.id = id; }
    ta.addEventListener('pointerdown', ev => ev.stopPropagation());
    ta.addEventListener('keydown', ev => { if (ev.key === 'Escape') ta.blur(); });
    /* Gesichert wird beim Verlassen des Feldes UND bei jedem anderen
       Griff (neuer Klick, Moduswechsel, Schliessen) - blur allein kommt
       nicht immer. */
    ta._fertig = () => {
      if (!ta.isConnected) return;
      const t = ta.value.replace(/\s+$/, '');
      const id = ta.dataset.id || neueId();
      ta.remove();
      setzen(id, t ? {t, x: e ? e.x : x, y: e ? e.y : y, f: e ? e.f : farbe, g: gen(), z: e ? e.z : Date.now()} : null);
      masse();
    };
    ta.addEventListener('blur', ta._fertig);
  }

  /* ---------- Leiste ---------- */
  nb.querySelectorAll('[data-mod]').forEach(b => b.onclick = () => {
    textFertig();
    modus = b.dataset.mod;
    nb.querySelectorAll('[data-mod]').forEach(x => x.classList.toggle('an', x === b));
    nb.classList.toggle('tippen', modus === 'tippen');
    cv.style.cursor = modus === 'tippen' ? 'text' : modus === 'radieren' ? 'cell' : 'crosshair';
  });
  nb.querySelectorAll('.farbe').forEach(b => b.onclick = () => {
    farbe = b.dataset.f;
    nb.querySelectorAll('.farbe').forEach(x => x.classList.toggle('an', x === b));
    if (modus === 'radieren') nb.querySelector('[data-mod="stift"]').click();
  });
  nb.querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
    breite = Number(b.dataset.w);
    nb.querySelectorAll('[data-w]').forEach(x => x.classList.toggle('an', x === b));
  });
  nb.querySelector('#m3nbleeren').onclick = () => {
    const wer = verbunden() ? 'für alle in Ihrer Gruppe' : '';
    if (!confirm(`Das ganze Notizblatt ${wer} löschen?`.replace('  ', ' '))) return;
    if (typeof m3Wert === 'function') m3Wert('nbgen', String(gen() + 1)); else stand.texte.nbgen = String(gen() + 1);
    if (typeof sichern === 'function') try { sichern(); } catch(_) {}
    zeichnen();
  };
  const breitKnopf = nb.querySelector('#m3nbbreit');
  breitKnopf.onclick = () => {
    nb.classList.toggle('breit');
    breitKnopf.textContent = nb.classList.contains('breit') ? 'schmaler' : 'breiter';
    masse();
  };
  function titel(){
    nb.querySelector('#m3nbtitel').textContent = verbunden() ? 'Notizblatt der Gruppe' : 'Notizblatt (nur für Sie)';
  }
  griff.onclick = () => { document.body.classList.add('m3nbauf'); titel(); masse(); };
  nb.querySelector('#m3nbzu').onclick = () => {
    textFertig();
    document.body.classList.remove('m3nbauf');
  };
  bogen.addEventListener('scroll', () => {
    if (bogen.scrollTop + bogen.clientHeight > H - bogen.clientHeight){ H += bogen.clientHeight; hoehe.style.height = H + 'px'; }
    zeichnen();
  });
  window.addEventListener('resize', () => { if (document.body.classList.contains('m3nbauf')) masse(); });

  /* Vom Brett: neu zeichnen, wenn das Blatt offen ist. */
  let bald = 0;
  window._m3blatt = () => {
    if (!document.body.classList.contains('m3nbauf') || bald) return;
    bald = requestAnimationFrame(() => { bald = 0; zeichnen(); });
  };
})();
