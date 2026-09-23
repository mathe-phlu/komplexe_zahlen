/* ============================================================
   PIA - Notizen beim Zuschauen

   Rike sieht sich eine Aufnahme an und denkt dabei laut. Was sie
   denkt, ist der Rohstoff fuer die Rueckmeldung - und es ist genau
   dann da, wenn sie die Stelle sieht. Eine Stunde spaeter ist es weg.

   GETIPPT ODER DIKTIERT ENTSCHEIDET DAS GERAET, NICHT DIESE SEITE.

   Es gaebe eine Schnittstelle fuer Spracherkennung im Browser
   (`webkitSpeechRecognition`). Die schickt den Ton zu Google - ueber
   eine namentlich genannte Studierende, waehrend ihre Pruefung laeuft.
   Das ist derselbe Grund, aus dem die Schriften mitgeliefert und nicht
   geholt werden (Entscheid vom 22.08.2026), nur schwerer wiegend.

   Das Diktat von macOS und iPadOS laeuft auf dem Geraet, kann Deutsch
   und funktioniert in JEDEM Textfeld - also auch in diesem. Darum
   steht hier ein Feld und kein Mikrofonknopf. Der Knopf koennte nur
   weniger.

   GESICHERT WIRD LAUFEND IM BROWSER - ABER DAS IST KEINE SICHERUNG.
   Wer den Browserspeicher leert, verliert alles. Die Sicherung ist
   die Datei, und die gibt es auf Knopfdruck. Auf dem Tablet ist das
   nicht Bequemlichkeit, sondern der einzige Weg zurueck.
   ============================================================ */
(function(){
'use strict';

const SCHRANK = 'pia-notizen-v1';

/* Eigene kleine Helfer statt der aus der Wiedergabe: Diese Datei muss
   auch in der Reisefassung laufen, und die hat sie nicht. */
function el(t, k, i){
  const e = document.createElement(t);
  if (k) e.className = k;
  if (i !== undefined) e.innerHTML = i;
  return e;
}
function mmss(ms){
  const s = Math.max(0, Math.floor(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

/* ---------- Der Schrank ---------- */
let alles = {};
try { alles = JSON.parse(localStorage.getItem(SCHRANK) || '{}') || {}; }
catch(e){ alles = {}; }

function fuer(kennung){
  if (!alles[kennung]) alles[kennung] = { gesamt: '', aufgaben: {} };
  if (!alles[kennung].aufgaben) alles[kennung].aufgaben = {};
  return alles[kennung];
}

function ablegen(){
  try { localStorage.setItem(SCHRANK, JSON.stringify(alles)); }
  catch(e){ /* voll, privates Fenster, file:// - die Datei bleibt der Weg */ }
}

function lesen(kennung, schluessel){
  const n = fuer(kennung);
  return schluessel === 'gesamt' ? (n.gesamt || '') : (n.aufgaben[schluessel] || '');
}

function schreiben(kennung, schluessel, text){
  const n = fuer(kennung);
  if (schluessel === 'gesamt') n.gesamt = text;
  else if (text) n.aufgaben[schluessel] = text;
  else delete n.aufgaben[schluessel];
  n.geaendert = new Date().toISOString();
  ablegen();
}

function hatWas(kennung){
  const n = fuer(kennung);
  return !!(n.gesamt || '').trim() ||
         Object.keys(n.aufgaben).some(k => (n.aufgaben[k] || '').trim());
}

/* ---------- Wie man hier diktiert ----------
   Die Taste ist einstellbar und heisst nicht ueberall gleich. Also
   wird sie nicht behauptet, sondern der Ort genannt, an dem sie
   steht. Eine falsche Tastenangabe ist schlimmer als keine. */
const AMGERAET = (function(){
  const p = navigator.platform || '';
  const u = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(u) ||
              (p === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (iOS) return 'Diktieren: das 🎤 unten rechts auf der Bildschirmtastatur.';
  if (/Mac/.test(p)) return 'Diktieren: die Diktiertaste — welche das ist, ' +
                            'steht in Systemeinstellungen → Tastatur → Diktat.';
  return 'Diktieren: die Diktierfunktion des Geräts, sie schreibt in jedes Textfeld.';
})();

/* ---------- Ein Feld ----------
   `zeitgeber` liefert die Stelle im Video in Millisekunden oder null.
   Ohne ihn faellt der Zeitmarkenknopf weg statt eine Null zu setzen. */
function feld(opt){
  const kennung = opt.kennung, schluessel = opt.schluessel;
  const kasten = el('div', 'notiz');
  kasten.appendChild(el('h3', null, opt.titel || 'Notiz'));
  if (opt.hinweis) kasten.appendChild(el('p', 'hinweis', opt.hinweis));

  const t = el('textarea');
  t.value = lesen(kennung, schluessel);
  t.placeholder = opt.platzhalter || '';
  t.spellcheck = true;
  t.setAttribute('aria-label', opt.titel || 'Notiz');
  if (t.value.trim()) t.classList.add('voll');
  kasten.appendChild(t);

  /* Laufend sichern, aber nicht bei jedem Buchstaben in den Speicher
     schreiben - beim Diktieren kommen sie in Schueben. */
  let warten = null;
  t.addEventListener('input', () => {
    t.classList.toggle('voll', !!t.value.trim());
    winkZeigen();
    clearTimeout(warten);
    warten = setTimeout(() => {
      schreiben(kennung, schluessel, t.value);
      if (opt.geaendert) opt.geaendert();
    }, 400);
  });
  /* Beim Verlassen sofort - wer die Seite zuklappt, wartet nicht. */
  t.addEventListener('blur', () => {
    clearTimeout(warten);
    schreiben(kennung, schluessel, t.value);
    if (opt.geaendert) opt.geaendert();
  });

  const leiste = el('div', 'notizleiste');
  if (opt.zeitgeber){
    const z = el('button', null, '⏱ Zeitmarke');
    z.type = 'button';
    z.title = 'Die Stelle, die gerade läuft, an den Cursor schreiben';
    z.onclick = () => {
      const ms = opt.zeitgeber();
      if (ms === null || ms === undefined) return;
      const marke = '[' + mmss(ms) + '] ';
      const a = t.selectionStart, b = t.selectionEnd;
      t.value = t.value.slice(0, a) + marke + t.value.slice(b);
      t.selectionStart = t.selectionEnd = a + marke.length;
      t.focus();
      t.dispatchEvent(new Event('input'));
    };
    leiste.appendChild(z);
  }
  /* Der Hinweis aufs Diktieren steht nur an LEEREN Feldern. Unter
     jedem einzelnen wiederholt, waere er Tapete - und wer schon etwas
     hineingeschrieben hat, weiss, wie es geht. */
  const wink = el('span', 'wink', AMGERAET);
  leiste.appendChild(wink);
  function winkZeigen(){ wink.hidden = !!t.value.trim(); }
  winkZeigen();
  kasten.appendChild(leiste);

  kasten._textfeld = t;
  return kasten;
}

/* ---------- Herausschreiben ----------
   `kopf` ist der Protokollkopf der Sitzung, `titel` eine Abbildung
   von Aufgabennummer auf Aufgabentitel. Beides darf fehlen. */
function alsDaten(kennung, kopf, titel){
  const n = fuer(kennung);
  const aufgaben = Object.keys(n.aufgaben)
    .filter(k => (n.aufgaben[k] || '').trim())
    .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0))
    .map(k => ({ nr: parseInt(k, 10) || k,
                 titel: (titel && titel[k]) || '',
                 text: n.aufgaben[k].trim() }));
  return {
    art: 'pia-notizen',
    fassung: 1,
    sitzung: kennung,
    person: (kopf && kopf.person) || '',
    station: (kopf && kopf.station) || null,
    durchgang: (kopf && kopf.durchgang) || null,
    begonnen: (kopf && kopf.begonnen) || null,
    notiert: new Date().toISOString(),
    gesamt: (n.gesamt || '').trim(),
    aufgaben: aufgaben
  };
}

function alsText(kennung, kopf, titel){
  const d = alsDaten(kennung, kopf, titel);
  const zeilen = [];
  zeilen.push('# Notizen zu ' + (d.person || d.sitzung));
  zeilen.push('');
  zeilen.push('Station ' + (d.station || '?') +
              (d.durchgang > 1 ? ' · Durchgang ' + d.durchgang : '') +
              (d.begonnen ? ' · Prüfung vom ' +
                new Date(d.begonnen).toLocaleDateString('de-CH') : ''));
  zeilen.push('Notiert am ' + new Date(d.notiert).toLocaleString('de-CH'));
  zeilen.push('');
  d.aufgaben.forEach(a => {
    zeilen.push('## Aufgabe ' + a.nr + (a.titel ? ' · ' + a.titel : ''));
    zeilen.push('');
    zeilen.push(a.text);
    zeilen.push('');
  });
  if (d.gesamt){
    zeilen.push('## Gesamteindruck');
    zeilen.push('');
    zeilen.push(d.gesamt);
    zeilen.push('');
  }
  if (!d.aufgaben.length && !d.gesamt) zeilen.push('*(noch nichts notiert)*');
  return zeilen.join('\n');
}

function sichern(kennung, kopf, titel){
  const d = alsDaten(kennung, kopf, titel);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)],
    { type: 'application/json' }));
  a.download = kennung + '_notizen.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* Der zweite Weg vom Geraet herunter. Auf dem Tablet ist er manchmal
   der einzige, der ohne Nachdenken funktioniert: kopieren, in eine
   Mail an sich selbst einsetzen, abschicken. */
async function kopieren(kennung, kopf, titel){
  const text = alsText(kennung, kopf, titel);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch(e){
    /* Ohne sicheren Kontext oder ohne Erlaubnis geht das nicht. Dann
       der alte Weg: markieren und Befehl-C. */
    const t = document.createElement('textarea');
    t.value = text;
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(t);
    t.select();
    let gut = false;
    try { gut = document.execCommand('copy'); } catch(e2){ gut = false; }
    t.remove();
    return gut;
  }
}

/* ---------- Wieder hereinholen ----------
   Was unterwegs entstanden ist, kommt als Datei zurueck. Zusammen-
   gefuehrt wird NICHT ueberschrieben: Steht auf beiden Seiten etwas,
   bleibt beides stehen, mit einem Strich dazwischen. Ein stilles
   Ueberschreiben waere genau der Verlust, den diese Datei verhindern
   soll - und welche Fassung die juengere ist, weiss hier niemand
   sicher. */
async function einlesen(datei){
  const d = JSON.parse(await datei.text());
  if (d.art !== 'pia-notizen') throw new Error('Das ist keine Notizendatei.');
  if (!d.sitzung) throw new Error('In der Datei steht nicht, zu welcher Sitzung sie gehört.');
  const n = fuer(d.sitzung);
  let neu = 0, vereint = 0;

  function dazu(altText, neuText){
    const alt = (altText || '').trim(), frisch = (neuText || '').trim();
    if (!frisch) return alt;
    if (!alt){ neu++; return frisch; }
    if (alt === frisch) return alt;
    vereint++;
    return alt + '\n\n--- aus ' + datei.name + ' ---\n\n' + frisch;
  }

  n.gesamt = dazu(n.gesamt, d.gesamt);
  (d.aufgaben || []).forEach(a => {
    const k = String(a.nr);
    n.aufgaben[k] = dazu(n.aufgaben[k], a.text);
  });
  n.geaendert = new Date().toISOString();
  ablegen();
  return { sitzung: d.sitzung, person: d.person || '', neu: neu, vereint: vereint };
}

window.Notizen = {
  lesen: lesen,
  schreiben: schreiben,
  hatWas: hatWas,
  feld: feld,
  alsDaten: alsDaten,
  alsText: alsText,
  sichern: sichern,
  kopieren: kopieren,
  einlesen: einlesen,
  amGeraet: AMGERAET
};
})();
