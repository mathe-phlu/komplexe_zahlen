/* ============================================================
   PIA - Gerüst einer Prüfung

   Eine Station beschreibt nur ihre Aufgaben; alles Übrige steht
   hier: Einstieg mit Geräteprobe, Aufgabennavigation nach dem
   Muster der Etappen aus «Daten und Zufall», Nebenblatt zu jeder
   Aufgabe, Auswertung am Schluss, Wiedereintrittscode.

   Zwei Regeln, die überall gelten (siehe pruefungen/TOLERANZEN.md
   und station1/VORSCHLAG.md):

   1  FORMAT SOFORT, RICHTIGKEIT ERST AM SCHLUSS. Die Seite sagt
      unmittelbar, wenn sie eine Eingabe nicht als Zahl lesen kann -
      aber kein Wort darüber, ob sie stimmt. Sonst tastet man sich
      durch Ausprobieren zur Lösung; ohne das scheitert man an der
      Schreibweise.

   2  TEILPUNKTE ZÄHLEN, WIEDEREINTRITT IST GANZ ODER GAR NICHT.
      Für die 80 % zählt jeder Teil einzeln. Als erledigt gilt eine
      Aufgabe nur, wenn sie vollständig stimmt.
   ============================================================ */
(function(){
'use strict';

const Z = window.Zahl, ZE = window.Zeichnen, AUF = window.Aufnahme, CODE = window.Code;
const SCHWELLE = 0.8;

function el(tag, klasse, inhalt){
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (inhalt !== undefined) e.innerHTML = inhalt;
  return e;
}
const zufall = (a, b) => a + Math.random() * (b - a);
const wuerfel = liste => liste[Math.floor(Math.random() * liste.length)];
function mischen(liste){
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   Sich selbst setzen — nur für den Prüfstand

   Jeder Baustein bekommt weiter unten ein `setzen(wie)`. Damit kann
   `pruefstand/richtigkeit.html` eine Aufgabe zweimal durchspielen:
   einmal mit der richtigen Antwort (muss die volle Punktzahl geben)
   und einmal mit einer bewusst falschen (darf keinen Punkt geben).

   Drei Regeln, an denen das steht oder fällt:

   1  GESETZT WIRD AUS DEM AUFGABENBAU, NICHT AUS DER ANZEIGE. Die
      Anzeige rundet auf drei Stellen; wer sie zurückliest, prüft die
      Rundung statt die Sache. Deshalb `o.soll` und nicht `soll()`.

   2  GESCHRIEBEN WIRD MIT VOLLER GENAUIGKEIT, aber durch dasselbe
      Feld und dieselben Ereignisse, die ein Mensch auslöst. So läuft
      die Prüfung durch den echten Leser - und es fällt auf, wenn eine
      richtige Antwort in einer Schreibweise steht, die er nicht liest.

   3  FALSCH HEISST SICHER FALSCH. Der Abstand muss grösser sein als
      die Toleranz (Regel 1: das Grössere von 0,01 und einem halben
      Prozent) und darf bei mehrwertigen Funktionen nicht zufällig auf
      einem anderen gültigen Zweig landen.

   Wo sich «falsch» nicht bauen lässt, gibt setzen() `false` zurück.
   Der Prüfstand zählt diese Fälle und nennt sie - stillschweigend
   übergehen wäre eine Lücke, die aussieht wie ein bestandener Test.
   ============================================================ */

/* Voller Genauigkeit, aber lesbar - nicht die gerundete Anzeige. */
function genau(x){
  if (x === null || !isFinite(x)) return '0';
  return String(Math.round(x * 1e9) / 1e9);
}
function komplexText(z){
  if (Math.abs(z.im) < 1e-12) return genau(z.re);
  return genau(z.re) + (z.im < 0 ? ' - ' : ' + ') + genau(Math.abs(z.im)) + 'i';
}
/* Sicher ausserhalb der Toleranz - auch bei grossen Werten, wo die
   Toleranz mitwächst. */
function daneben(v){
  return v + Math.max(1, Math.abs(v) * 0.3) + 0.7;
}
/* Durch dasselbe Feld und dieselben Ereignisse wie von Hand. */
function schreiben(f, text){
  f.eingabe.value = text;
  f.eingabe.dispatchEvent(new Event('input', { bubbles: true }));
  f.eingabe.dispatchEvent(new Event('blur', { bubbles: true }));
}
/* Einen Index wählen, der nicht der richtige ist. */
function andererIndex(anzahl, ausser){
  for (let k = 0; k < anzahl; k++) if (k !== ausser) return k;
  return -1;
}

/* ============================================================
   Der Bauhelfer: was eine Aufgabe an Eingaben aufstellen kann
   ============================================================ */
function Bau(aufgabe, wurzel){
  const teile = [];
  let kasten = null;

  function neuerKasten(titel){
    kasten = el('div', 'frage');
    if (titel) kasten.appendChild(el('h3', null, titel));
    wurzel.appendChild(kasten);
    return kasten;
  }
  function K(){ return kasten || neuerKasten(); }

  /* --- Ein Textfeld mit sofortiger Formatprüfung --- */
  function feld(name, opt){
    const i = el('input', 'feld' + (opt.schmal ? ' schmal' : ''));
    i.type = 'text';
    i.setAttribute('inputmode', 'text');
    i.autocomplete = 'off';
    i.spellcheck = false;
    if (opt.platzhalter) i.placeholder = opt.platzhalter;
    i.dataset.feld = name;

    const stand = el('div', 'lesestand');
    let zuletzt = '';

    function pruefeFormat(){
      const roh = i.value.trim();
      if (!roh){ i.classList.remove('unlesbar'); stand.textContent = ''; return; }
      const w = opt.lesen(roh);
      if (w === null){
        i.classList.add('unlesbar');
        stand.textContent = opt.lesehinweis || 'Das lese ich nicht als Zahl.';
        stand.className = 'lesestand';
      } else {
        i.classList.remove('unlesbar');
        stand.textContent = '';
      }
    }
    i.addEventListener('input', pruefeFormat);
    i.addEventListener('blur', () => {
      pruefeFormat();
      const roh = i.value.trim();
      if (roh === zuletzt) return;
      zuletzt = roh;
      if (roh && opt.lesen(roh) === null) AUF.M.lesefehler(name, roh);
      else if (roh) AUF.M.eingabe(name, roh);
    });
    return { eingabe: i, stand: stand, wert: () => opt.lesen(i.value.trim()),
             roh: () => i.value.trim() };
  }

  function zeileMit(beschriftung, elemente){
    const z = el('div', 'zeile');
    if (beschriftung){
      const l = el('label', null, beschriftung);
      z.appendChild(l);
    }
    elemente.forEach(e => z.appendChild(e));
    K().appendChild(z);
    return z;
  }

  const B = {
    teile: teile,

    /* ---- Text ---- */
    satz(html){ K().appendChild(el('p', null, html)); return B; },
    formel(html){ K().appendChild(el('p', 'formel', html)); return B; },
    hinweis(html){ K().appendChild(el('p', 'hinweis', html)); return B; },
    kasten(titel){ neuerKasten(titel); return B; },

    /* ---- Zwei Spalten nebeneinander ----
       Bild links, Fragen rechts: das spart auf einer Aufgabenseite das
       Scrollen, das sonst zwischen Zeichnung und Antwort noetig ist. */
    zweiSpalten(links, rechts){
      const g = el('div', 'spalten');
      const a = el('div'), c = el('div');
      g.appendChild(a); g.appendChild(c);
      K().appendChild(g);
      const merk = kasten;
      kasten = a; links(B);
      kasten = c; rechts(B);
      kasten = merk;
      return B;
    },

    /* ---- Eine Formelzeile mit Feldern mittendrin ----
       Statt «f(z) = a · z + b» und darunter zwei beschriftete Felder
       steht die Funktion als Ganzes da und man schreibt hinein.

       stuecke ist eine Liste aus Zeichenketten (werden als HTML
       gesetzt) und Feldbeschreibungen {name, soll, p, art}. */
    formelZeile(stuecke){
      const z = el('div', 'zeile formelzeile');
      const staende = [];
      stuecke.forEach(s => {
        if (typeof s === 'string'){
          z.appendChild(el('span', 'formelstueck', s));
          return;
        }

        /* Eine Auswahl mitten in der Formel. Gebraucht dort, wo die
           Entscheidung selbst Teil des Terms ist - z gegen z̄ bei den
           Spiegelungen. Als eigener Block daneben war sie von der
           Formel abgetrennt, zu der sie gehoert. */
        if (s.optionen){
          const w = document.createElement('select');
          w.className = 'feld formelwahl';
          w.appendChild(new Option('?', ''));
          s.optionen.forEach((o, k) => w.appendChild(new Option(o, String(k))));
          w.addEventListener('change', () => AUF.M.auswahl(s.name,
            w.value === '' ? '—' : s.optionen[w.value]));
          z.appendChild(w);
          teile.push({ name: s.name, p: s.p, art: 'wahl',
            gefuellt: () => w.value !== '',
            pruefen: () => w.value !== '' && parseInt(w.value, 10) === s.richtig,
            gegeben: () => w.value === '' ? '—' : s.optionen[w.value],
            soll: () => s.optionen[s.richtig],
            sollRoh: { art: 'wahl', felder: [s.name],
                       richtigTexte: [s.optionen[s.richtig]] },
            setzen: (wie) => {
              const k = wie === 'richtig' ? s.richtig
                                          : andererIndex(s.optionen.length, s.richtig);
              if (k < 0) return false;
              w.value = String(k);
              w.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            } });
          return;
        }

        const art = s.art || 'komplex';
        const leser = art === 'reell' ? Z.liesReell
                    : art === 'winkel' ? Z.liesWinkelGrad
                    : art === 'bogen' ? Z.liesWinkelBogen : Z.lies;
        const f = feld(s.name, { lesen: leser, schmal: s.schmal,
          platzhalter: s.platzhalter || '?',
          lesehinweis: art === 'komplex'
            ? 'Das lese ich nicht als komplexe Zahl.' : 'Das lese ich nicht als Zahl.' });
        z.appendChild(f.eingabe);
        staende.push(f.stand);
        teile.push({ name: s.name, p: s.p, art: art,
          gefuellt: () => !!f.roh(),
          pruefen: () => {
            const x = f.wert();
            if (x === null) return false;
            if (art === 'komplex') return Z.gleich(x, s.soll);
            if (art === 'winkel')  return Z.winkelGleich(x, s.soll);
            return Z.nahe(x, s.soll);
          },
          gegeben: () => f.roh(),
          soll: () => art === 'komplex' ? Z.normalform(s.soll, 3) : Z.zahlText(s.soll, 3),
          sollRoh: art === 'komplex'
            ? { art: 'komplex', felder: [s.name], soll: s.soll }
            : { art: art === 'winkel' ? 'winkel' : 'zahl', felder: [s.name], soll: s.soll },
          setzen: (wie) => {
            if (art === 'komplex'){
              schreiben(f, wie === 'richtig' ? komplexText(s.soll)
                : komplexText(Z.K(daneben(s.soll.re), daneben(s.soll.im))));
            } else {
              schreiben(f, genau(wie === 'richtig' ? s.soll
                : art === 'winkel' ? s.soll + 37 : daneben(s.soll)));
            }
            return true;
          }
        });
      });
      K().appendChild(z);
      staende.forEach(s => K().appendChild(s));
      return B;
    },

    /* ---- Ein Bild ---- */
    bild(flaeche, o){
      const s = o || {};
      const r = ZE.rahmen(flaeche, s);
      K().appendChild(r);
      return r;
    },

    /* ---- Eine komplexe Zahl in einem Feld ---- */
    komplex(o){
      const f = feld(o.name, { lesen: Z.lies, platzhalter: o.platzhalter || 'z. B. 3 + 4i',
        lesehinweis: 'Das lese ich nicht als komplexe Zahl.' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', o.nach || ''), f.stand]);
      teile.push({ name: o.name, p: o.p, art: 'komplex',
        gefuellt: () => !!f.roh(),
        pruefen: () => {
          const w = f.wert();
          if (!w) return false;
          return o.raster ? Z.abgelesenGleich(w, o.soll, o.raster) : Z.gleich(w, o.soll);
        },
        gegeben: () => f.roh(),
        soll: () => Z.normalform(o.soll, 3),
        sollRoh: { art: 'komplex', felder: [o.name], soll: o.soll, raster: o.raster },
        setzen: (wie) => {
          schreiben(f, wie === 'richtig' ? komplexText(o.soll)
            : komplexText(Z.K(daneben(o.soll.re), daneben(o.soll.im))));
          return true;
        }
      });
      return B;
    },

    /* ---- Real- und Imaginärteil getrennt, ein Teil ---- */
    komplexZweiFelder(o){
      const fr = feld(o.name + '.re', { lesen: Z.liesReell, schmal: true, platzhalter: 'Re' });
      const fi = feld(o.name + '.im', { lesen: Z.liesReell, schmal: true, platzhalter: 'Im' });
      zeileMit(o.vor, [fr.eingabe, el('span', 'hinweis', '+'), fi.eingabe,
                       el('span', 'hinweis', 'i'), fr.stand, fi.stand]);
      teile.push({ name: o.name, p: o.p, art: 'komplex',
        gefuellt: () => !!(fr.roh() || fi.roh()),
        pruefen: () => {
          const re = fr.wert(), im = fi.wert();
          if (re === null || im === null) return false;
          const w = Z.K(re, im);
          return o.raster ? Z.abgelesenGleich(w, o.soll, o.raster) : Z.gleich(w, o.soll);
        },
        gegeben: () => fr.roh() + ' + ' + fi.roh() + 'i',
        soll: () => Z.normalform(o.soll, 3),
        sollRoh: { art: 'komplexZwei', felder: [o.name + '.re', o.name + '.im'],
                   soll: o.soll, raster: o.raster },
        setzen: (wie) => {
          const z = wie === 'richtig' ? o.soll
                  : Z.K(daneben(o.soll.re), daneben(o.soll.im));
          schreiben(fr, genau(z.re));
          schreiben(fi, genau(z.im));
          return true;
        }
      });
      return B;
    },

    /* ---- Ein Wert einer mehrwertigen Funktion ----

       Der Baustein, an dem die Moodle-Fassung gescheitert ist.
       Geprueft wird nicht gegen EINEN Wert, sondern gegen die ganze
       Schar: bei a^(1/n) sind es n Werte, bei a^(ni) unendlich
       viele, bei ganzzahligem Exponenten genau einer. Jeder davon
       gilt. Siehe TOLERANZEN.md und FEHLER_ALTBESTAND.md. */
    potenzwert(o){
      const f = feld(o.name, { lesen: Z.lies, platzhalter: 'z. B. 1.73 + i',
        lesehinweis: 'Das lese ich nicht als komplexe Zahl.' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', o.nach || ''), f.stand]);
      teile.push({ name: o.name, p: o.p, art: 'potenz',
        gefuellt: () => !!f.roh(),
        pruefen: () => { const x = f.wert();
                         return x ? Z.istPotenzWert(x, o.basis, o.exponent) : false; },
        gegeben: () => f.roh(),
        soll: () => Z.normalform(Z.hoch(o.basis, o.exponent), 3) + ' (Hauptwert)',
        sollRoh: { art: 'potenz', felder: [o.name], basis: o.basis, exponent: o.exponent },
        /* Mehrwertig: Ein Versatz träfe womöglich einen anderen gültigen
           Zweig. Bei a^(1/n) haben alle n Werte DENSELBEN Betrag, also
           ist ein anderer Betrag sicher keiner davon. */
        setzen: (wie) => {
          const h = Z.hoch(o.basis, o.exponent);
          if (wie === 'richtig'){ schreiben(f, komplexText(h)); return true; }
          if (Z.betrag(h) < 1e-9){ schreiben(f, '1 + 1i'); return true; }
          schreiben(f, komplexText(Z.K(h.re * 3 + 1, h.im * 3 + 1)));
          return true;
        }
      });
      return B;
    },

    logwert(o){
      const f = feld(o.name, { lesen: Z.lies, platzhalter: 'z. B. 1.1 + 1.57i',
        lesehinweis: 'Das lese ich nicht als komplexe Zahl.' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', o.nach || ''), f.stand]);
      teile.push({ name: o.name, p: o.p, art: 'log',
        gefuellt: () => !!f.roh(),
        pruefen: () => { const x = f.wert();
                         return x ? Z.istLogarithmusWert(x, o.von) : false; },
        gegeben: () => f.roh(),
        soll: () => Z.normalform(Z.ln(o.von), 3) + ' (Hauptwert)',
        sollRoh: { art: 'log', felder: [o.name], von: o.von },
        /* Alle Logarithmuswerte teilen den Realteil und unterscheiden
           sich nur um 2πk im Imaginärteil. Ein anderer Realteil ist
           deshalb sicher keiner davon. */
        setzen: (wie) => {
          const l = Z.ln(o.von);
          schreiben(f, wie === 'richtig' ? komplexText(l)
            : komplexText(Z.K(l.re + 2, l.im)));
          return true;
        }
      });
      return B;
    },

    /* ---- Eine reelle Zahl ---- */
    reell(o){
      const f = feld(o.name, { lesen: Z.liesReell, schmal: o.schmal !== false,
                               platzhalter: o.platzhalter || '' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', o.nach || ''), f.stand]);
      /* ohneWertung: Das Feld steht da, zaehlt aber nicht. Gebraucht,
         wo schon das Fehlen eines Feldes etwas verraten wuerde. */
      if (o.ohneWertung) return B;
      teile.push({ name: o.name, p: o.p, art: 'zahl',
        gefuellt: () => !!f.roh(),
        pruefen: () => Z.nahe(f.wert(), o.soll),
        gegeben: () => f.roh(), soll: () => Z.zahlText(o.soll, 3),
        sollRoh: { art: 'zahl', felder: [o.name], soll: o.soll },
        setzen: (wie) => {
          schreiben(f, genau(wie === 'richtig' ? o.soll : daneben(o.soll)));
          return true;
        }
      });
      return B;
    },

    /* ---- Ein Winkel in Grad ---- */
    winkel(o){
      const f = feld(o.name, { lesen: Z.liesWinkelGrad, schmal: true, platzhalter: 'Grad' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', '°'), f.stand]);
      teile.push({ name: o.name, p: o.p, art: 'winkel',
        gefuellt: () => !!f.roh(),
        pruefen: () => Z.winkelGleich(f.wert(), o.soll),
        gegeben: () => f.roh(), soll: () => Z.zahlText(o.soll, 2) + '°',
        sollRoh: { art: 'winkel', felder: [o.name], soll: o.soll },
        /* Zyklisch: 37° daneben ist in beiden Richtungen weit genug
           von der Schranke von einem Grad entfernt. */
        setzen: (wie) => {
          schreiben(f, genau(wie === 'richtig' ? o.soll : o.soll + 37));
          return true;
        }
      });
      return B;
    },

    /* ---- Ein Winkel im Bogenmass: π/4 gilt wie 0,79 ---- */
    bogen(o){
      const f = feld(o.name, { lesen: Z.liesWinkelBogen, platzhalter: 'z. B. π/4' });
      zeileMit(o.vor, [f.eingabe, el('span', 'hinweis', o.nach || ''), f.stand]);
      teile.push({ name: o.name, p: o.p, art: 'zahl',
        gefuellt: () => !!f.roh(),
        pruefen: () => Z.nahe(f.wert(), o.soll),
        gegeben: () => f.roh(), soll: () => Z.zahlText(o.soll, 3),
        sollRoh: { art: 'zahl', felder: [o.name], soll: o.soll },
        setzen: (wie) => {
          schreiben(f, genau(wie === 'richtig' ? o.soll : daneben(o.soll)));
          return true;
        }
      });
      return B;
    },

    /* ---- Betrag und Winkel als ein Teil ---- */
    polar(o){
      const fr = feld(o.name + '.r', { lesen: Z.liesReell, schmal: true, platzhalter: 'r' });
      const fg = feld(o.name + '.phi', { lesen: Z.liesWinkelGrad, schmal: true, platzhalter: 'φ' });
      zeileMit(o.vor, [fr.eingabe, el('span', 'hinweis', '· cis('), fg.eingabe,
                       el('span', 'hinweis', '°)'), fr.stand, fg.stand]);
      teile.push({ name: o.name, p: o.p, art: 'polar',
        gefuellt: () => !!(fr.roh() || fg.roh()),
        pruefen: () => Z.polarGleich(fr.wert(), fg.wert(), o.sollR, o.sollG),
        gegeben: () => fr.roh() + '·cis(' + fg.roh() + '°)',
        soll: () => Z.zahlText(o.sollR,3) + '·cis(' + Z.zahlText(o.sollG,2) + '°)',
        sollRoh: { art: 'polar', felder: [o.name + '.r', o.name + '.phi'],
                   sollR: o.sollR, sollG: o.sollG },
        setzen: (wie) => {
          schreiben(fr, genau(wie === 'richtig' ? o.sollR : daneben(o.sollR)));
          schreiben(fg, genau(wie === 'richtig' ? o.sollG : o.sollG + 37));
          return true;
        }
      });
      return B;
    },

    /* ---- Mehrere Werte in Polarform, Reihenfolge egal ---- */
    polarMenge(o){
      const felder = [];
      o.soll.forEach((s, k) => {
        const fr = feld(o.name + '.' + k + '.r', { lesen: Z.liesReell, schmal: true, platzhalter: 'r' });
        const fg = feld(o.name + '.' + k + '.phi', { lesen: Z.liesWinkelGrad, schmal: true, platzhalter: 'φ' });
        zeileMit((o.vor || 'z') + '<sub>' + (k+1) + '</sub> =',
          [fr.eingabe, el('span','hinweis','· cis('), fg.eingabe,
           el('span','hinweis','°)'), fr.stand, fg.stand]);
        felder.push({ r: fr, g: fg });
      });
      B.hinweis('Die Reihenfolge spielt keine Rolle.');

      /* Ein Teil je Sollwert: wer zwei von drei Wurzeln hat,
         bekommt zwei Drittel. Zugeordnet wird zuerst, was passt. */
      o.soll.forEach((s, k) => {
        teile.push({ name: o.name + '#' + (k+1), p: o.p, art: 'polar',
          gefuellt: () => felder.some(f => f.r.roh() || f.g.roh()),
          pruefen: () => {
            const gegeben = felder.map(f => ({ r: f.r.wert(), g: f.g.wert() }));
            const treffer = zuordnenGreedy(gegeben, o.soll);
            return treffer[k];
          },
          gegeben: () => felder.map(f => f.r.roh()+'∠'+f.g.roh()).join('  '),
          soll: () => Z.zahlText(s.r,3) + '·cis(' + Z.zahlText(s.g,2) + '°)',
          /* Die ganze Schar, nicht nur der eigene Wert: Die Zuordnung
             ist erst über alle Zeilen zusammen entscheidbar. */
          sollRoh: { art: 'polarMenge', k: k,
                     felder: o.soll.map((x, j) => [o.name + '.' + j + '.r',
                                                   o.name + '.' + j + '.phi']),
                     soll: o.soll },
          /* Jeder Teil füllt SEINE Zeile. Werden alle Teile gesetzt,
             steht die ganze Schar da; wird nur einer gesetzt, bekommt
             auch nur er seinen Punkt - genau das soll die Zuordnung
             leisten. */
          setzen: (wie) => {
            schreiben(felder[k].r, genau(wie === 'richtig' ? s.r : daneben(s.r)));
            schreiben(felder[k].g, genau(wie === 'richtig' ? s.g : s.g + 37));
            return true;
          }
        });
      });
      return B;
    },

    /* ---- Auswahl aus mehreren Möglichkeiten ---- */
    wahl(o){
      if (o.frage) K().appendChild(el('p', null, o.frage));
      const w = el('div', 'wahl');
      const gruppe = 'w' + Math.random().toString(36).slice(2);
      const reihenfolge = o.mischen === false
        ? o.optionen.map((t,k) => k) : mischen(o.optionen.map((t,k) => k));
      reihenfolge.forEach(k => {
        const l = el('label');
        const i = el('input');
        i.type = o.mehrfach ? 'checkbox' : 'radio';
        i.name = gruppe; i.value = String(k);
        i.addEventListener('change', () => AUF.M.auswahl(o.name, o.optionen[k]));
        l.appendChild(i);
        l.appendChild(el('span', null, o.optionen[k]));
        w.appendChild(l);
      });
      K().appendChild(w);
      const gewaehlt = () => Array.from(w.querySelectorAll('input:checked'))
                                  .map(i => parseInt(i.value, 10));
      const richtig = o.mehrfach ? (o.richtig || []) : [o.richtig];
      teile.push({ name: o.name, p: o.p, art: 'wahl',
        gefuellt: () => gewaehlt().length > 0,
        pruefen: () => {
          const g = gewaehlt();
          return g.length === richtig.length && richtig.every(r => g.indexOf(r) >= 0);
        },
        gegeben: () => gewaehlt().map(k => o.optionen[k]).join(', ') || '—',
        soll: () => richtig.map(k => o.optionen[k]).join(', '),
        /* Bei Mehrfachauswahl meldet der Ereignisstrom jeden Klick
           einzeln, nicht die Menge - daraus lässt sich der Endstand
           nicht zurücklesen. Deshalb kein sollRoh: Nach einem Absturz
           gilt so ein Teil als nicht nachweisbar und die Aufgabe als
           offen. Lieber noch einmal lösen als zu Unrecht gutschreiben. */
        sollRoh: o.mehrfach ? null
          : { art: 'wahl', felder: [o.name], richtigTexte: [o.optionen[richtig[0]]] },
        setzen: (wie) => {
          const kaesten = Array.from(w.querySelectorAll('input'));
          kaesten.forEach(i => { i.checked = false; });
          let ziel;
          if (wie === 'richtig') ziel = richtig;
          else if (!o.mehrfach){
            const k = andererIndex(o.optionen.length, richtig[0]);
            if (k < 0) return false;
            ziel = [k];
          } else {
            /* Mehrfachauswahl: eine falsche Menge ist eine, die sich in
               der Länge unterscheidet. Erst versuchen, eine Möglichkeit
               dazuzunehmen, die nicht dazugehört; geht das nicht, weil
               schon alle richtig sind, eine weglassen. Bleibt beides
               unmöglich (eine einzige Möglichkeit, und die stimmt),
               gibt es keine falsche Antwort - das meldet der Prüfstand. */
            const zusatz = o.optionen.map((t,k) => k).find(k => richtig.indexOf(k) < 0);
            if (zusatz !== undefined) ziel = richtig.concat([zusatz]);
            else if (richtig.length > 1) ziel = richtig.slice(1);
            else return false;
          }
          ziel.forEach(k => {
            const i = kaesten.find(x => parseInt(x.value,10) === k);
            if (i){ i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }
          });
          return true;
        }
      });
      return B;
    },

    /* ---- Im Bild anklicken ---- */
    bildwahl(o){
      let gewaehlt = null;
      const r = ZE.rahmen(o.flaeche, { waehlbar: true, marke: o.marke,
        beiWahl: (ziel) => {
          gewaehlt = ziel;
          ZE.hervorheben(r, ziel);
          AUF.M.bildklick(o.name, ziel);
        }});
      K().appendChild(r);
      teile.push({ name: o.name, p: o.p, art: 'bildwahl',
        gefuellt: () => gewaehlt !== null,
        pruefen: () => gewaehlt === o.richtig,
        gegeben: () => gewaehlt || '—', soll: () => o.richtig,
        sollRoh: { art: 'bildwahl', felder: [o.name], soll: o.richtig },
        setzen: (wie) => {
          const ziele = Array.from(r.querySelectorAll('.ziel'))
            .map(z => z.getAttribute('data-ziel'));
          const ziel = wie === 'richtig' ? o.richtig : ziele.find(z => z !== o.richtig);
          if (!ziel) return false;
          gewaehlt = ziel;
          ZE.hervorheben(r, ziel);
          AUF.M.bildklick(o.name, ziel);
          return true;
        }
      });
      return B;
    },

    /* ---- Mehrere Punkte im Bild anklicken, Reihenfolge egal ---- */
    punktwahl(o){
      const gewaehlt = new Set();
      const r = ZE.rahmen(o.flaeche, { waehlbar: true, marke: o.marke,
        beiWahl: (ziel, g) => {
          if (gewaehlt.has(ziel)){ gewaehlt.delete(ziel); }
          else {
            if (o.hoechstens && gewaehlt.size >= o.hoechstens){
              const erster = gewaehlt.values().next().value;
              gewaehlt.delete(erster);
              const alt = r.querySelector('.ziel[data-ziel="'+erster+'"] .treffer');
              if (alt) alt.setAttribute('opacity','0');
            }
            gewaehlt.add(ziel);
          }
          const t = g.querySelector('.treffer');
          if (t) t.setAttribute('opacity', gewaehlt.has(ziel) ? '0.3' : '0');
          AUF.M.bildklick(o.name, Array.from(gewaehlt).join('+'));
        }});
      K().appendChild(r);
      /* Manche Aufgaben haben mehrere richtige Antworten - «geben Sie
         EINEN Zyklus der Laenge 3 an» etwa. Dann prueft ein eigener
         Pruefer statt einer festen Menge. */
      teile.push({ name: o.name, p: o.p, art: 'punktwahl',
        gefuellt: () => gewaehlt.size > 0,
        pruefen: () => o.pruefer
          ? o.pruefer(Array.from(gewaehlt))
          : (gewaehlt.size === o.richtig.length && o.richtig.every(x => gewaehlt.has(x))),
        gegeben: () => Array.from(gewaehlt).sort().join(', ') || '—',
        soll: () => o.sollText || (o.richtig || []).slice().sort().join(', '),
        /* Der Ereignisstrom meldet hier die GANZE Menge bei jedem
           Klick, nicht den einzelnen Punkt - der letzte Eintrag ist
           also der Endstand und damit zurücklesbar. */
        sollRoh: (o.mengen || o.richtig)
          ? { art: 'menge', felder: [o.name],
              mengen: o.mengen || [o.richtig] }
          : null,
        /* Manche punktwahl-Aufgaben haben einen eigenen Prüfer statt
           einer festen Menge («geben Sie EINEN Zyklus an»). Dann lässt
           sich eine falsche Antwort nicht ausrechnen - also wird sie
           gesucht und am Prüfer selbst nachgewiesen. */
        setzen: (wie) => {
          const alle = Array.from(r.querySelectorAll('.ziel'))
            .map(z => z.getAttribute('data-ziel'));
          const nimm = (menge) => {
            gewaehlt.clear();
            menge.forEach(x => gewaehlt.add(x));
            alle.forEach(z => {
              const t = r.querySelector('.ziel[data-ziel="'+z+'"] .treffer');
              if (t) t.setAttribute('opacity', gewaehlt.has(z) ? '0.3' : '0');
            });
            /* Dieselbe Meldung wie ein echter Klick. Ohne sie stünde im
               Ereignisstrom nichts, und die Nachwertung sähe ein leeres
               Feld - der Prüfstand prüfte dann etwas anderes als die
               Prüfung tut. (Am 26.08.2026 genau so aufgefallen.) */
            AUF.M.bildklick(o.name, Array.from(gewaehlt).join('+'));
          };
          const gut = o.richtig || o.beispiel;
          if (wie === 'richtig'){
            if (!gut) return false;    // weder Sollwert noch Beispiel
            nimm(gut);
            return true;
          }
          for (const z of alle){
            nimm([z]);
            const ok = o.pruefer ? o.pruefer([z])
              : (gut && gut.length === 1 && gut[0] === z);
            if (!ok) return true;
          }
          nimm([]);
          return false;
        }
      });
      return B;
    },

    /* ---- Zwei Auswahlen in EINEM Bild, in zwei Farben ----

       Rike: «Ich überlege, ob wir wirklich zweimal das gleiche Bild
       brauchen oder ob wir in einem Bild mit zwei unterschiedlichen
       Farben die Markierungen setzen lassen können.»

       Ein Umschalter sagt, welche Auswahl gerade gemeint ist; die
       Markierungen bleiben beide sichtbar und unterscheiden sich in
       Farbe und Ringgroesse. So steht die Zeichnung einmal da statt
       zweimal, und man sieht beide Antworten nebeneinander.

       o.ebenen: [{schluessel, text, farbe, richtig | pruefer, p}]
       o.neben:  ein Element, das rechts neben das Bild kommt        */
    punktEbenen(o){
      const gewaehlt = {};
      o.ebenen.forEach(e => gewaehlt[e.schluessel] = new Set());
      let aktiv = o.ebenen[0].schluessel;

      const schalter = el('div', 'ebenenschalter');
      const knoepfe = {};
      o.ebenen.forEach((e, i) => {
        const k = el('button', 'ebenenknopf');
        k.type = 'button';
        k.style.setProperty('--ebene', e.farbe);
        k.innerHTML = '<span class="tupfen"></span>' + e.text;
        k.onclick = () => { aktiv = e.schluessel; zeichnenSchalter();
                            AUF.merken('ebene', { feld: o.name, ebene: e.schluessel }); };
        knoepfe[e.schluessel] = k;
        schalter.appendChild(k);
      });
      function zeichnenSchalter(){
        o.ebenen.forEach(e => knoepfe[e.schluessel]
          .setAttribute('aria-current', e.schluessel === aktiv ? 'true' : 'false'));
      }
      zeichnenSchalter();
      K().appendChild(schalter);

      const rahmen = ZE.rahmen(o.flaeche, { waehlbar: true, beiWahl: (ziel, g) => {
        const menge = gewaehlt[aktiv];
        if (menge.has(ziel)) menge.delete(ziel); else menge.add(ziel);
        markierungenSetzen(g, ziel);
        AUF.M.bildklick(o.name + '.' + aktiv, Array.from(menge).join('+'));
      }});

      function markierungenSetzen(gruppe, ziel){
        gruppe.querySelectorAll('.ebenenmarke').forEach(m => m.remove());
        o.ebenen.forEach((e, i) => {
          if (!gewaehlt[e.schluessel].has(ziel)) return;
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('class', 'ebenenmarke');
          c.setAttribute('cx', gruppe.querySelector('circle:not(.treffer)').getAttribute('cx'));
          c.setAttribute('cy', gruppe.querySelector('circle:not(.treffer)').getAttribute('cy'));
          c.setAttribute('r', 5.5 + i * 3.2);
          c.setAttribute('fill', 'none');
          c.setAttribute('stroke', e.farbe);
          c.setAttribute('stroke-width', 2);
          gruppe.appendChild(c);
        });
      }

      if (o.neben){
        const g = el('div', 'spalten bildundliste');
        const a = el('div'), c = el('div');
        a.appendChild(rahmen); c.appendChild(o.neben);
        g.appendChild(a); g.appendChild(c);
        K().appendChild(g);
      } else {
        K().appendChild(rahmen);
      }

      o.ebenen.forEach(e => {
        teile.push({ name: o.name + '.' + e.schluessel, p: e.p, art: 'punktwahl',
          gefuellt: () => gewaehlt[e.schluessel].size > 0,
          pruefen: () => {
            const g = Array.from(gewaehlt[e.schluessel]);
            if (e.pruefer) return e.pruefer(g);
            return g.length === e.richtig.length && e.richtig.every(x => g.indexOf(x) >= 0);
          },
          gegeben: () => Array.from(gewaehlt[e.schluessel]).sort().join(', ') || '—',
          soll: () => e.sollText || (e.richtig || []).slice().sort().join(', '),
          sollRoh: (e.mengen || e.richtig)
            ? { art: 'menge', felder: [o.name + '.' + e.schluessel],
                mengen: e.mengen || [e.richtig] }
            : null,
          setzen: (wie) => {
            const alle = Array.from(rahmen.querySelectorAll('.ziel'))
              .map(z => z.getAttribute('data-ziel'));
            const menge = gewaehlt[e.schluessel];
            const nimm = (liste) => {
              menge.clear();
              liste.forEach(x => menge.add(x));
              alle.forEach(z => {
                const g = rahmen.querySelector('.ziel[data-ziel="'+z+'"]');
                if (g) markierungenSetzen(g, z);
              });
              AUF.M.bildklick(o.name + '.' + e.schluessel, Array.from(menge).join('+'));
            };
            const gut = e.richtig || e.beispiel;
            if (wie === 'richtig'){
              if (!gut) return false;   // weder Sollwert noch Beispiel
              nimm(gut);
              return true;
            }
            for (const z of alle){
              nimm([z]);
              const ok = e.pruefer ? e.pruefer([z])
                : (gut && gut.length === 1 && gut[0] === z);
              if (!ok) return true;
            }
            nimm([]);
            return false;
          }
        });
      });
      return B;
    },

    /* ---- Eines von mehreren Bildern wählen ---- */
    bilderwahl(o){
      let gewaehlt = null;
      const reihe = el('div', 'bildreihe');
      const rahmen = [];
      o.flaechen.forEach((f, k) => {
        const r = ZE.rahmen(f, { marke: 'Bild ' + (k+1) });
        r.style.cursor = 'pointer';
        r.addEventListener('click', () => {
          gewaehlt = k;
          rahmen.forEach((x,j) => x.classList.toggle('gewaehlt', j === k));
          AUF.M.auswahl(o.name, 'Bild ' + (k+1));
          if (o.beiWahl) o.beiWahl(k);
        });
        rahmen.push(r);
        reihe.appendChild(r);
      });
      K().appendChild(reihe);
      teile.push({ name: o.name, p: o.p, art: 'bilderwahl',
        gefuellt: () => gewaehlt !== null,
        pruefen: () => gewaehlt === o.richtig,
        gegeben: () => gewaehlt === null ? '—' : 'Bild ' + (gewaehlt+1),
        soll: () => 'Bild ' + (o.richtig+1),
        sollRoh: { art: 'wahl', felder: [o.name],
                   richtigTexte: ['Bild ' + (o.richtig+1)] },
        setzen: (wie) => {
          const k = wie === 'richtig' ? o.richtig
                                      : andererIndex(o.flaechen.length, o.richtig);
          if (k < 0) return false;
          gewaehlt = k;
          rahmen.forEach((x,j) => x.classList.toggle('gewaehlt', j === k));
          AUF.M.auswahl(o.name, 'Bild ' + (k+1));
          if (o.beiWahl) o.beiWahl(k);
          return true;
        }
      });
      return B;
    },

    /* ---- Zuordnung durch Ziehen von Kärtchen ----
       o.karten  [{id, text}]
       o.felder  [{id, kopf, inhalt}]
       o.richtig {feldId: [kartenId, …]}   je Feld ein Teil
       o.fasst   wie viele Karten in ein Feld passen (Vorgabe 1)

       Geprueft wird je FELD, nicht je Karte: Was zaehlt, ist ob im
       Feld das Richtige liegt. Karten, die nirgends hingehoeren,
       bleiben im Vorrat - dass sie dort bleiben, ergibt sich von
       selbst, wenn alle Felder stimmen. */
    kartenZuordnung(o){
      const fl = window.Karten.flaeche({
        karten: o.karten, felder: o.felder, fasst: o.fasst || 1,
        vorratMarke: o.vorratMarke
      });
      K().appendChild(fl.element);
      o.felder.forEach(f => {
        const soll = (o.richtig[f.id] || []).slice().sort();
        teile.push({ name: o.name + '.' + f.id, p: o.p, art: 'karten',
          gefuellt: () => {
            const b = fl.belegung();
            return Object.keys(b).some(k => b[k] === f.id);
          },
          pruefen: () => {
            const b = fl.belegung();
            const drin = Object.keys(b).filter(k => b[k] === f.id).sort();
            return drin.length === soll.length &&
                   drin.every((x, i) => x === soll[i]);
          },
          gegeben: () => {
            const b = fl.belegung();
            const drin = Object.keys(b).filter(k => b[k] === f.id);
            return drin.length ? drin.join(', ') : '—';
          },
          soll: () => soll.join(', '),
          /* Der Ereignisstrom meldet je Karte, wo sie zuletzt lag.
             Daraus lässt sich die Belegung vollständig zurückbauen. */
          sollRoh: { art: 'karten', felder: o.karten.map(k => k.id),
                     feld: f.id, soll: soll },
          /* Erst räumen, dann legen. Ohne das Räumen blockiert eine
             zuvor falsch abgelegte Karte den Platz, und die richtige
             kommt nicht mehr hinein - das Feld bliebe falsch, obwohl
             «richtig» gesetzt wurde. (Genau so beim ersten Lauf am
             25.08.2026 aufgefallen: S1 A2 gab 1,5 statt 2 Punkten.) */
          setzen: (wie) => {
            const b = fl.belegung();
            Object.keys(b).filter(id => b[id] === f.id)
                          .forEach(id => fl.legen(id, null));
            if (wie === 'richtig'){
              soll.forEach(id => fl.legen(id, f.id));
              return true;
            }
            /* Falsch heisst: in diesem Feld liegt etwas, das nicht
               hineingehört. Eine Karte reicht dafür. */
            const fremd = o.karten.map(k => k.id).find(id => soll.indexOf(id) < 0);
            if (fremd === undefined) return false;
            fl.legen(fremd, f.id);
            return true;
          }
        });
      });
      return B;
    },

    /* ---- Zuordnung über Auswahllisten, mit Überhang ---- */
    zuordnung(o){
      const tabelle = el('table');
      tabelle.style.width = '100%';
      const auswahlen = [];
      o.links.forEach((links, k) => {
        const tr = el('tr');
        const td1 = el('td', null, links);
        td1.style.padding = '7px 8px 7px 0';
        const td2 = el('td');
        td2.style.padding = '7px 0';
        const s = document.createElement('select');
        s.className = 'feld';
        s.style.width = 'auto';
        s.appendChild(new Option('— wählen —', ''));
        o.rechts.forEach((t, j) => s.appendChild(new Option(t, String(j))));
        s.addEventListener('change',
          () => AUF.M.auswahl(o.name + '.' + k, links + ' → ' + (s.value === '' ? '—' : o.rechts[s.value])));
        td2.appendChild(s);
        auswahlen.push(s);
        tr.appendChild(td1); tr.appendChild(td2);
        tabelle.appendChild(tr);
      });
      K().appendChild(tabelle);
      o.links.forEach((links, k) => {
        teile.push({ name: o.name + '.' + k, p: o.p, art: 'zuordnung',
          gefuellt: () => auswahlen[k].value !== '',
          pruefen: () => auswahlen[k].value !== '' &&
                         parseInt(auswahlen[k].value,10) === o.richtig[k],
          gegeben: () => auswahlen[k].value === '' ? '—' : o.rechts[auswahlen[k].value],
          soll: () => o.rechts[o.richtig[k]],
          sollRoh: { art: 'zuordnung', felder: [o.name + '.' + k],
                     richtigTexte: [o.rechts[o.richtig[k]]] },
          setzen: (wie) => {
            const j = wie === 'richtig' ? o.richtig[k]
                                        : andererIndex(o.rechts.length, o.richtig[k]);
            if (j < 0) return false;
            auswahlen[k].value = String(j);
            auswahlen[k].dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        });
      });
      return B;
    }
  };
  return B;
}

/* Greedy: jede Eingabe darf höchstens einen Sollwert bedienen.
   Liefert je Sollwert, ob er getroffen wurde. */
function zuordnenGreedy(gegeben, soll){
  const getroffen = soll.map(() => false);
  const verbraucht = gegeben.map(() => false);
  soll.forEach((s, k) => {
    for (let j = 0; j < gegeben.length; j++){
      if (verbraucht[j]) continue;
      const g = gegeben[j];
      if (g.r === null || g.g === null) continue;
      if (Z.polarGleich(g.r, g.g, s.r, s.g)){
        getroffen[k] = true; verbraucht[j] = true; break;
      }
    }
  });
  return getroffen;
}

/* ============================================================
   Nebenblatt: Zeichenfeld und Foto
   ============================================================ */
function nebenblatt(aufgabeId, beschriftung){
  const d = el('details', 'nebenblatt');
  d.appendChild(el('summary', null, beschriftung ||
    'Nebenblatt — hier rechnen, zeichnen oder ein Foto anhängen'));

  const leinwand = el('canvas', 'skizze');
  leinwand.width = 1120; leinwand.height = 420;
  const g = leinwand.getContext('2d');
  g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#2d2924';
  d.appendChild(leinwand);

  let zeichnet = false, strich = [];
  const stelle = e => {
    const r = leinwand.getBoundingClientRect();
    return [ Math.round((e.clientX - r.left) / r.width * leinwand.width),
             Math.round((e.clientY - r.top) / r.height * leinwand.height) ];
  };
  leinwand.addEventListener('pointerdown', e => {
    leinwand.setPointerCapture(e.pointerId);
    zeichnet = true; strich = [stelle(e)];
    g.beginPath(); g.moveTo(strich[0][0], strich[0][1]);
  });
  leinwand.addEventListener('pointermove', e => {
    if (!zeichnet) return;
    const p = stelle(e);
    // nicht jeden Pixel merken - der Ereignisstrom soll schlank bleiben
    const l = strich[strich.length-1];
    if (Math.abs(p[0]-l[0]) + Math.abs(p[1]-l[1]) < 4) return;
    strich.push(p);
    g.lineTo(p[0], p[1]); g.stroke();
  });
  const fertig = () => {
    if (!zeichnet) return;
    zeichnet = false;
    if (strich.length > 1) AUF.M.strich(aufgabeId, strich);
    strich = [];
  };
  leinwand.addEventListener('pointerup', fertig);
  leinwand.addEventListener('pointercancel', fertig);

  const w = el('div', 'werkzeuge');
  const radieren = el('button', 'neben', 'Leeren');
  radieren.type = 'button';
  radieren.onclick = () => {
    g.clearRect(0,0,leinwand.width,leinwand.height);
    AUF.M.radiert(aufgabeId);
  };

  const liste = el('div', 'blattliste');
  function gemeldet(text){
    const z = el('div', 'hinweis', '✓ ' + text);
    z.style.color = 'var(--richtig)';
    liste.appendChild(z);
  }

  /* --- Blatt vor die Kamera halten ---
     Wer kein Tablet hat, rechnet auf Papier. Die Kamera laeuft
     ohnehin; damit entfaellt der Umweg ueber das Handy. */
  const kameraKnopf = el('button', 'neben', '📄 Blatt vor die Kamera halten');
  kameraKnopf.type = 'button';
  const sucher = el('div', 'sucher');
  const schau = el('video');
  /* FEHLERBEHOBEN (2026-08-21): Mit autoplay hielt jedes dieser
     Videoelemente das load-Ereignis der Seite offen - bei sechs
     Aufgaben also sechsmal. Gemessen im Pruefstand: statt gut einer
     Sekunde brauchte ein Aufbau ueber sechs Sekunden, und der Aufbau
     galt nie als fertig.
     Ursache: autoplay auf einem <video> ohne Quelle. Der Sucher wird
     ohnehin erst per Klick geoeffnet und dort ausdruecklich gestartet;
     autoplay war von Anfang an ueberfluessig. */
  schau.playsInline = true; schau.muted = true;
  const ausloesen = el('button', 'tat', 'Bild aufnehmen');
  ausloesen.type = 'button';
  const zu = el('button', 'neben', 'Abbrechen');
  zu.type = 'button';
  const sucherLeiste = el('div', 'werkzeuge');
  sucherLeiste.appendChild(ausloesen); sucherLeiste.appendChild(zu);
  sucher.appendChild(el('p', 'hinweis',
    'Halten Sie Ihr Blatt so vor die Kamera, dass die Schrift im Bild lesbar ist — ' +
    'meist etwa eine Handbreit entfernt und gut beleuchtet.'));
  sucher.appendChild(schau);
  sucher.appendChild(sucherLeiste);
  sucher.style.display = 'none';
  const schliessen = () => { sucher.style.display = 'none'; schau.srcObject = null;
                             kameraKnopf.style.display = ''; };
  zu.onclick = schliessen;
  kameraKnopf.onclick = () => {
    const spur = AUF.spur();
    if (!spur || !AUF.hatKamera()){
      liste.appendChild(el('div', 'hinweis',
        'Es ist keine Kamera verfügbar — bitte hängen Sie ein Foto als Datei an.'));
      return;
    }
    schau.srcObject = spur;
    schau.play().catch(()=>{});
    sucher.style.display = '';
    kameraKnopf.style.display = 'none';
    AUF.merken('sucher-auf', { aufgabe: aufgabeId });
  };
  ausloesen.onclick = async () => {
    ausloesen.disabled = true;
    try {
      const blob = await AUF.blattVonKamera(schau);
      await AUF.blattAbgeben(blob, aufgabeId, 'kamera');
      gemeldet('Blatt aufgenommen (' + Math.round(blob.size/1024) + ' KB)');
      schliessen();
    } catch(e){
      liste.appendChild(el('div', 'hinweis', 'Das Bild kam nicht zustande. Noch einmal?'));
    }
    ausloesen.disabled = false;
  };

  /* --- oder als Datei anhaengen --- */
  const fotoKnopf = el('label', 'neben', 'Foto als Datei anhängen');
  fotoKnopf.style.cursor = 'pointer';
  const fotoEingabe = el('input');
  fotoEingabe.type = 'file'; fotoEingabe.accept = 'image/*'; fotoEingabe.multiple = true;
  fotoEingabe.style.display = 'none';
  fotoEingabe.addEventListener('change', async () => {
    for (const f of Array.from(fotoEingabe.files || [])){
      await AUF.blattAbgeben(f, aufgabeId, 'datei', f.name);
      gemeldet(f.name + ' angehängt');
    }
    fotoEingabe.value = '';
  });
  fotoKnopf.appendChild(fotoEingabe);

  w.appendChild(radieren); w.appendChild(kameraKnopf); w.appendChild(fotoKnopf);
  d.appendChild(w);
  d.appendChild(sucher);
  d.appendChild(liste);

  d.addEventListener('toggle',
    () => { if (d.open) AUF.merken('nebenblatt-auf', { aufgabe: aufgabeId }); });
  return { element: d, leinwand: leinwand };
}

window.PIA = { Bau: Bau, el: el, zufall: zufall, wuerfel: wuerfel,
               mischen: mischen, nebenblatt: nebenblatt, SCHWELLE: SCHWELLE,
               /* Von `nachwerten.js` gebraucht: Die Zuordnung mehrerer
                  Werte zu mehreren Sollwerten soll nach einem Absturz
                  GENAU SO laufen wie in der Prüfung - eine zweite
                  Fassung davon würde irgendwann auseinanderlaufen. */
               zuordnenGreedy: zuordnenGreedy };
})();
