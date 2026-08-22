/* ============================================================
   PIA - Der Wiedereintrittscode

   Am Ende eines Durchgangs stellt die Prüfungsseite einen kurzen
   Code aus. Wer ihn beim erneuten Öffnen eintippt, bekommt nur
   noch die offenen Aufgaben - mit neuen Zahlen.

   SPERRFRIST: Der Code trägt den Tag mit, an dem er ausgestellt
   wurde, und gilt erst am FOLGENDEN Kalendertag. Wer am Abend des
   21. November nicht besteht, kann am 22. wieder ran - nicht
   vierundzwanzig Stunden später, sondern am nächsten Tag. So war
   es in den Moodle-Prüfungen auch, und der Grund ist gut: Zwischen
   zwei Versuchen soll man sich die Sache noch einmal ansehen.

   EHRLICH ZUR SICHERHEIT: Eine statische Seite kann kein Geheimnis
   hüten; diese Datei steht im Browser jedes Studierenden. Der Code
   ist gegen Vertippen gesichert und für praktisch alle
   undurchschaubar, aber nicht fälschungssicher. Und die Sperrfrist
   liest die Uhr des eigenen Rechners - wer sie vorstellt, kommt
   daran vorbei.

   Das trägt hier, weil
     - das Paket von Durchgang eins bereits auf SWITCHdrive liegt,
     - jedes Paket den eingelegten Code und die Browserzeit
       mitprotokolliert - eine vorgestellte Uhr faellt gegen den
       Zeitstempel der Ablage auf,
     - und die Videokontrolle ohnehin das letzte Wort hat.

   Aufbau, 40 Bit:
     3  Station        1..7
     3  Durchgang      1..7
     8  offene Aufgaben als Bitmaske (Aufgabe 1..8)
     9  Ausstellungstag (Tage seit 1.1.2026, modulo 512)
     9  Personenbindung (Streuwert des Namens)
     8  Prüfziffer

   Gerechnet wird mit gewoehnlicher Arithmetik, nicht mit
   Bitoperatoren: Die arbeiten in JavaScript auf 32 Bit und wuerden
   hier oben abschneiden. Zahlen bis 2^53 sind exakt, 2^40 ist
   also unbedenklich.
   ============================================================ */
(function(){
'use strict';

/* 31 Zeichen: ohne I, O, U, 1, 0 - die verwechselt man beim Abtippen.
   31^9 ist rund 2,6·10^13 und damit weit mehr als die 2^40 Werte,
   die untergebracht werden muessen. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTVWXYZ';
const BASIS = ALPHABET.length;
const STELLEN = 9;
const TAGKREIS = 512;               // rund 1,4 Jahre, dann faengt es von vorn an

function streuwert(text, bits){
  // FNV-1a, gekuerzt. Bindet den Code an den Namen, damit er nicht
  // einfach weitergereicht wird.
  let h = 0x811c9dc5;
  const s = String(text || '').trim().toLowerCase().replace(/\s+/g,' ');
  for (let i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = (h + ((h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24))) >>> 0;
  }
  return h % Math.pow(2, bits === undefined ? 9 : bits);
}

/* Tagesnummer aus einem Datum - ueber den Kalendertag, nicht ueber
   die Uhrzeit. Sommerzeit und Zeitzonen aendern daran nichts. */
function tagesnummer(d){
  const t = d || new Date();
  return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000)
       - Math.floor(Date.UTC(2026, 0, 1) / 86400000);
}

/* ------------------------------------------------------------
   Felder packen und auspacken

   FEHLERBEHOBEN (2026-08-21): Die erste Fassung rechnete die
   Multiplikatoren von Hand aus. Dabei blieben in der unteren
   Haelfte sechs Bit ungenutzt, das Verwuerfeln mit einem 31-Bit-
   Schluessel blies den Wert trotzdem auf 32 Bit auf, und alles
   Weitere rutschte nach oben: 46 Bit statt 40. In neun Zeichen zu
   Basis 31 passen aber nur 44,6 - die oberste Stelle fiel ab.
   Gemessen: von acht Proben scheiterten fuenf, und zwar je nach
   Name, was besonders schwer zu deuten war.

   Ursache: von Hand gerechnete Stellenwerte. Jetzt tragen die
   Felder ihre Breite selbst, und Packen wie Auspacken lesen
   dieselbe Liste. Der Schluessel ist auf 26 Bit gekuerzt, damit
   das Verwuerfeln nicht ueber das Feld hinauswaechst.
   ------------------------------------------------------------ */
const FELDER = [
  { name: 'station',   bits: 3 },
  { name: 'durchgang', bits: 3 },
  { name: 'maske',     bits: 8 },
  { name: 'tag',       bits: 9 },
  { name: 'person',    bits: 9 }
];                                    // zusammen 32 Bit
const NUTZBITS = FELDER.reduce((s,f) => s + f.bits, 0);
const SCHLUESSEL = 0x35C7E91 % Math.pow(2, 26);   // verwuerfelt die unteren 26 Bit

function packen(werte){
  let wert = 0;
  for (let i = FELDER.length - 1; i >= 0; i--){
    const f = FELDER[i];
    wert = wert * Math.pow(2, f.bits) + (werte[f.name] % Math.pow(2, f.bits));
  }
  return wert;
}
function auspacken(wert){
  const w = {};
  let rest = wert;
  FELDER.forEach(f => {
    const m = Math.pow(2, f.bits);
    w[f.name] = rest % m;
    rest = Math.floor(rest / m);
  });
  return w;
}

/* Verwuerfeln beruehrt nur die unteren 26 Bit - so bleibt der Wert
   innerhalb seiner Breite. */
const verwuerfeln = x => {
  const M = Math.pow(2, 26);
  return Math.floor(x / M) * M + (((x % M) ^ SCHLUESSEL) >>> 0);
};

function pruefziffer(wert){
  let p = 0x5B, rest = wert;
  for (let i = 0; i < 5; i++){
    p = ((p * 31) ^ (rest % 256)) & 0xFF;
    rest = Math.floor(rest / 256);
  }
  return p;
}

function ausstellen(o){
  const station   = Math.max(1, Math.min(7, o.station|0));
  const durchgang = Math.max(1, Math.min(7, o.durchgang|0));
  let maske = 0;
  (o.offen || []).forEach(nr => { if (nr >= 1 && nr <= 8) maske += Math.pow(2, nr-1); });
  const tag = ((o.tag === undefined ? tagesnummer() : o.tag) % TAGKREIS + TAGKREIS) % TAGKREIS;

  const wert = packen({ station: station, durchgang: durchgang, maske: maske,
                        tag: tag, person: streuwert(o.person, 9) });
  const gesamt = verwuerfeln(wert) + pruefziffer(wert) * Math.pow(2, NUTZBITS);

  let rest = gesamt, zeichen = '';
  for (let i = 0; i < STELLEN; i++){
    zeichen = ALPHABET[rest % BASIS] + zeichen;
    rest = Math.floor(rest / BASIS);
  }
  return zeichen.slice(0,4) + '-' + zeichen.slice(4,7) + '-' + zeichen.slice(7);
}

function einloesen(code, person, heuteTag){
  if (!code) return { gut: false, grund: 'leer' };
  const s = String(code).toUpperCase().replace(/[^0-9A-Z]/g, '')
              .replace(/I/g,'J').replace(/O/g,'Q').replace(/U/g,'V')
              .replace(/1/g,'J').replace(/0/g,'Q');
  if (s.length !== STELLEN) return { gut: false, grund: 'laenge' };

  let gesamt = 0;
  for (const c of s){
    const k = ALPHABET.indexOf(c);
    if (k < 0) return { gut: false, grund: 'zeichen' };
    gesamt = gesamt * BASIS + k;
  }
  const pz   = Math.floor(gesamt / Math.pow(2, NUTZBITS)) % 256;
  const wert = verwuerfeln(gesamt % Math.pow(2, NUTZBITS));
  if (pruefziffer(wert) !== pz) return { gut: false, grund: 'pruefziffer' };

  const w = auspacken(wert);
  const offen = [];
  for (let nr = 1; nr <= 8; nr++)
    if (Math.floor(w.maske / Math.pow(2, nr-1)) % 2) offen.push(nr);

  if (person !== undefined && person !== null && String(person).trim() &&
      w.person !== streuwert(person, 9))
    return { gut: false, grund: 'person', station: w.station };

  /* Sperrfrist: gueltig ab dem FOLGENDEN Kalendertag. */
  const heute = heuteTag === undefined ? tagesnummer() : heuteTag;
  const abstand = ((heute - w.tag) % TAGKREIS + TAGKREIS) % TAGKREIS;
  if (abstand === 0)
    return { gut: false, grund: 'zufrueh', station: w.station,
             frei: new Date(Date.UTC(2026,0,1) + (w.tag + 1) * 86400000) };
  if (abstand > TAGKREIS - 60)
    return { gut: false, grund: 'zukunft', station: w.station };

  return { gut: true, station: w.station, durchgang: w.durchgang, offen: offen,
           tag: w.tag, alter: abstand };
}

function datumText(d){
  const monate = ['Januar','Februar','März','April','Mai','Juni','Juli',
                  'August','September','Oktober','November','Dezember'];
  return d.getUTCDate() + '. ' + monate[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

window.Code = { ausstellen: ausstellen, einloesen: einloesen,
                streuwert: streuwert, tagesnummer: tagesnummer,
                datumText: datumText };
})();
