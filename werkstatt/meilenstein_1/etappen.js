/* ZUSAMMENGELEGT beim Bauen - nicht von Hand aendern.
   1. fremd/pia/2026-09-08/zeichnen.js (unveraendert)
   2. Ersatz fuer window.Zahl.zahlText
   3. themen/meilenstein_1/etappen.js */

/* ============================================================
   PIA - Zeichenfläche

   Die Bilder werden im Browser gezeichnet, nicht vorproduziert.
   Damit gibt es unbegrenzt viele Varianten, die Pfeile und Punkte
   sind anklickbar, und die Beschriftung bleibt in jeder Grösse
   lesbar - Kaspers 6,7-px-Schwelle (agent/05_layout.md) hält sich
   bei SVG von selbst ein.

   Achse und Raster: immer fünf Rasterschritte je Achsenhälfte.
   Der Rasterschritt ist damit ein Fünftel des Achsenmaximums, und
   die Ablesetoleranz (halber Rasterschritt, siehe TOLERANZEN.md)
   ist überall dieselbe relative Genauigkeit.
   ============================================================ */
(function(){
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attr) => {
  const e = document.createElementNS(NS, name);
  for (const k in attr) e.setAttribute(k, attr[k]);
  return e;
};

/* Achsenmaximum aus den vorkommenden Zahlen: auf eine gerade
   Rasterteilung aufrunden, aber nicht auf Vielfache von fünf -
   das war im Altbestand der Grund für Raster mit drei oder sieben
   Schritten je Seite. */
function achseFuer(zahlen, mindestens){
  let m = mindestens || 1;
  zahlen.forEach(z => {
    if (!z) return;
    m = Math.max(m, Math.abs(z.re), Math.abs(z.im));
  });
  m *= 1.15;                                   // Luft für Pfeilspitze und Marke
  /* Auf einen handlichen Rasterschritt aufrunden.

     FEHLERBEHOBEN (2026-08-21): Die Leiter war 1 / 2 / 2,5 / 5 / 10 und
     sprang damit zwischen 0,5 und 1 um das Doppelte. Gemessen an einer
     Figur, die 2,94 brauchte: Achse 5 statt 3 - die Zeichnung nutzte
     noch die halbe Flaeche, und die Ablesetoleranz wurde entsprechend
     grob. Die feinere Leiter haelt den Ueberhang unter einem Fuenftel. */
  const roh = m / 5;
  const zehner = Math.pow(10, Math.floor(Math.log10(roh)));
  const stufen = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  let schritt = zehner * 10;
  for (const s of stufen){
    if (zehner * s >= roh - 1e-12){ schritt = zehner * s; break; }
  }
  return schritt * 5;
}

function flaeche(o){
  const opt = Object.assign({ max: 5, breite: 460, gitter: true, achsenzahlen: true }, o);
  const MAX = opt.max;
  const SCHRITT = MAX / 5;
  const R = 100;                               // Halbe Kantenlänge im Zeichenraum
  const LUFT = 14;

  const svg = el('svg', {
    viewBox: (-R-LUFT) + ' ' + (-R-LUFT) + ' ' + (2*(R+LUFT)) + ' ' + (2*(R+LUFT)),
    xmlns: NS, role: 'img'
  });
  svg.style.maxWidth = opt.breite + 'px';

  const X = z => z.re / MAX * R;
  const Y = z => -z.im / MAX * R;

  /* ---------- Untergrund: Raster, Achsen, Zahlen ---------- */
  const grund = el('g', {});
  svg.appendChild(grund);

  if (opt.gitter){
    for (let k = -5; k <= 5; k++){
      const p = k / 5 * R;
      if (k !== 0){
        grund.appendChild(el('line', { x1: p, y1: -R, x2: p, y2: R,
          stroke: 'var(--linie)', 'stroke-width': .7, 'stroke-dasharray': '2 2.5' }));
        grund.appendChild(el('line', { x1: -R, y1: p, x2: R, y2: p,
          stroke: 'var(--linie)', 'stroke-width': .7, 'stroke-dasharray': '2 2.5' }));
      }
    }
  }
  grund.appendChild(el('line', { x1: -R-6, y1: 0, x2: R+6, y2: 0,
    stroke: 'var(--matt)', 'stroke-width': 1 }));
  grund.appendChild(el('line', { x1: 0, y1: R+6, x2: 0, y2: -R-6,
    stroke: 'var(--matt)', 'stroke-width': 1 }));

  if (opt.achsenzahlen){
    const t = window.Zahl.zahlText;
    [-5,-3,3,5].forEach(k => {
      const p = k / 5 * R;
      const zx = el('text', { x: p, y: 11, 'text-anchor': 'middle',
        'font-size': 7.5, fill: 'var(--matt)' });
      zx.textContent = t(k * SCHRITT, 2);
      grund.appendChild(zx);
      const zy = el('text', { x: -4, y: -p + 2.6, 'text-anchor': 'end',
        'font-size': 7.5, fill: 'var(--matt)' });
      zy.textContent = t(k * SCHRITT, 2);
      grund.appendChild(zy);
    });
    const re = el('text', { x: R+4, y: -3, 'text-anchor': 'end',
      'font-size': 7.5, fill: 'var(--matt)' });
    re.textContent = 'Re';
    grund.appendChild(re);
    const im = el('text', { x: 4, y: -R-4, 'font-size': 7.5, fill: 'var(--matt)' });
    im.textContent = 'Im';
    grund.appendChild(im);
  }

  const buehne = el('g', {});
  svg.appendChild(buehne);

  /* Ein Ziel ist eine Gruppe aus unsichtbarer Trefferfläche und
     sichtbarer Zeichnung. Die Trefferfläche ist grosszügig - auf
     dem Tablet trifft sonst niemand einen Pfeil. */
  function ziel(name, trefferElement){
    const g = el('g', { class: 'ziel', 'data-ziel': name, tabindex: 0 });
    trefferElement.setAttribute('class', 'treffer');
    trefferElement.setAttribute('fill', 'var(--akzent)');
    trefferElement.setAttribute('opacity', '0');
    g.appendChild(trefferElement);
    buehne.appendChild(g);
    return g;
  }

  const F = {
    max: MAX,
    rasterschritt: SCHRITT,
    svg: svg,

    pfeil(z, o){
      const s = Object.assign({ farbe: 'var(--tinte)', dicke: 1.8 }, o);
      const x = X(z), y = Y(z);
      const laenge = Math.hypot(x, y);
      let g;
      if (s.ziel){
        // Trefferfläche: ein dickes Band entlang des Pfeils
        const w = 7;
        const nx = laenge ? -y/laenge*w : 0, ny = laenge ? x/laenge*w : w;
        g = ziel(s.ziel, el('polygon', { points:
          [ [nx,ny], [x+nx,y+ny], [x-nx,y-ny], [-nx,-ny] ]
          .map(p => p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ') }));
      } else {
        g = el('g', {});
        buehne.appendChild(g);
      }
      g.appendChild(el('line', { x1: 0, y1: 0, x2: x, y2: y,
        stroke: s.farbe, 'stroke-width': s.dicke, 'stroke-linecap': 'round' }));
      if (laenge > 3){
        const ux = x/laenge, uy = y/laenge, sp = 6.5, br = 3.2;
        g.appendChild(el('polygon', { fill: s.farbe, points:
          [ [x, y],
            [x - ux*sp - uy*br, y - uy*sp + ux*br],
            [x - ux*sp + uy*br, y - uy*sp - ux*br] ]
          .map(p => p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ') }));
      }
      if (s.marke){
        const ux = laenge ? x/laenge : 0, uy = laenge ? y/laenge : -1;
        const t = el('text', { x: x + ux*11, y: y + uy*11 + 3,
          'text-anchor': 'middle', 'font-size': 9, 'font-weight': 600, fill: s.farbe });
        t.textContent = s.marke;
        g.appendChild(t);
      }
      return F;
    },

    punkt(z, o){
      const s = Object.assign({ farbe: 'var(--akzent)', gr: 2.6 }, o);
      const x = X(z), y = Y(z);
      let g;
      if (s.ziel){
        g = ziel(s.ziel, el('circle', { cx: x, cy: y, r: 9 }));
      } else {
        g = el('g', {});
        buehne.appendChild(g);
      }
      /* Heller Ring aussen herum: Ein Punkt, der zufaellig auf einem
         Pfeil oder einer Rasterlinie liegt, waere sonst nicht mehr als
         eigener Punkt zu erkennen. */
      if (s.ring !== false)
        g.appendChild(el('circle', { cx: x, cy: y, r: s.gr + 1.6,
          fill: 'none', stroke: 'var(--karte)', 'stroke-width': 2.2 }));
      g.appendChild(el('circle', { cx: x, cy: y, r: s.gr,
        fill: s.gefuellt === false ? 'var(--karte)' : s.farbe,
        stroke: s.farbe, 'stroke-width': 1.2 }));
      if (s.marke){
        /* Liegen Punkte dicht beieinander, ueberdecken sich die
           Beschriftungen. Mit richtung: 'aussen' wandert die Marke
           vom Nullpunkt weg - auf einem Kreis faechern sie damit
           von selbst auf. */
        let vx = 0, vy = -6;
        const l = Math.hypot(x, y);
        if (s.richtung === 'aussen' && l > 1){
          /* Der Nullpunkt hat keine Aussenrichtung - dort bleibt es
             bei der Marke darueber. Der Abstand darf wechseln, damit
             dicht benachbarte Punkte ihre Marken auf zwei Ringen
             verteilen statt sie uebereinanderzulegen. */
          const d = s.abstand || 10;
          vx = x/l * d; vy = y/l * d + 3;
        } else if (s.versatz){
          vx = s.versatz[0]; vy = s.versatz[1];
        }
        const t = el('text', { x: x + vx, y: y + vy, 'text-anchor': 'middle',
          'font-size': 8, 'font-weight': 600, fill: s.farbe });
        t.textContent = s.marke;
        g.appendChild(t);
      }
      return F;
    },

    kreis(r, o){
      const s = Object.assign({ farbe: 'var(--matt)' }, o);
      buehne.appendChild(el('circle', { cx: 0, cy: 0, r: r/MAX*R,
        fill: 'none', stroke: s.farbe, 'stroke-width': .9,
        'stroke-dasharray': s.gestrichelt === false ? '' : '3 3' }));
      return F;
    },

    gerade(z1, z2, o){
      const s = Object.assign({ farbe: 'var(--matt)', dicke: 1.2 }, o);
      buehne.appendChild(el('line', { x1: X(z1), y1: Y(z1), x2: X(z2), y2: Y(z2),
        stroke: s.farbe, 'stroke-width': s.dicke,
        'stroke-dasharray': s.gestrichelt ? '4 3' : '' }));
      return F;
    },

    vieleck(punkte, o){
      const s = Object.assign({ farbe: 'var(--akzent)', fuell: 'none', dicke: 1.5 }, o);
      buehne.appendChild(el('polygon', {
        points: punkte.map(z => X(z).toFixed(2)+','+Y(z).toFixed(2)).join(' '),
        fill: s.fuell, stroke: s.farbe, 'stroke-width': s.dicke,
        'stroke-linejoin': 'round' }));
      return F;
    },

    /* Eine offene Linie - für Bilder von Vielecken unter Abbildungen,
       die Ecken krumm werden lassen. */
    zug(punkte, o){
      const s = Object.assign({ farbe: 'var(--akzent)', dicke: 1.5 }, o);
      buehne.appendChild(el('polyline', {
        points: punkte.map(z => X(z).toFixed(2)+','+Y(z).toFixed(2)).join(' '),
        fill: s.fuell || 'none', stroke: s.farbe, 'stroke-width': s.dicke,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      return F;
    },

    text(z, inhalt, o){
      const s = Object.assign({ farbe: 'var(--matt)', gr: 8.5 }, o);
      const t = el('text', { x: X(z), y: Y(z), 'text-anchor': s.anker || 'middle',
        'font-size': s.gr, fill: s.farbe });
      t.textContent = inhalt;
      buehne.appendChild(t);
      return F;
    }
  };
  return F;
}

/* Eine Zeichenfläche in einen Rahmen setzen. Ist waehlbar gesetzt,
   melden Klicks auf Ziele den Namen des Ziels. */
function rahmen(flaecheObj, o){
  const s = o || {};
  const d = document.createElement('div');
  d.className = 'bild' + (s.waehlbar ? ' waehlbar' : '');
  d.appendChild(flaecheObj.svg);
  if (s.marke){
    const m = document.createElement('div');
    m.className = 'bildmarke';
    m.textContent = s.marke;
    d.appendChild(m);
  }
  if (s.waehlbar && s.beiWahl){
    const waehlen = e => {
      const g = e.target.closest && e.target.closest('.ziel');
      if (!g) return;
      e.preventDefault();
      s.beiWahl(g.dataset.ziel, g);
    };
    d.addEventListener('click', waehlen);
    d.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') waehlen(e);
    });
  }
  return d;
}

/* Das gewählte Ziel hervorheben - eine Fläche, ein Ziel. */
function hervorheben(rahmenEl, name){
  rahmenEl.querySelectorAll('.ziel').forEach(g => {
    const treffer = g.querySelector('.treffer');
    const dran = g.dataset.ziel === name;
    if (treffer) treffer.setAttribute('opacity', dran ? '0.22' : '0');
    g.querySelectorAll('line,polygon:not(.treffer),circle:not(.treffer),text')
     .forEach(k => k.setAttribute('stroke-width',
        k.tagName === 'line' ? (dran ? 3 : 1.8) : (k.getAttribute('stroke-width')||1.2)));
  });
}

window.Zeichnen = { flaeche: flaeche, rahmen: rahmen,
                    hervorheben: hervorheben, achseFuer: achseFuer };
})();


/* Ersatz fuer window.Zahl.zahlText aus PIAs zahl.js - siehe
   fremd/pia/2026-09-08/HERKUNFT.md. Nur die Achsenbeschriftung braucht
   sie. Definiert wird nur, was fehlt: Liegt die echte Datei eines Tages
   daneben, gewinnt sie. */
window.Zahl = window.Zahl || {};
if (!window.Zahl.zahlText) window.Zahl.zahlText = function(x, stellen){
  const s = stellen === undefined ? 2 : stellen;
  if (Math.abs(x) < 5e-11) return '0';
  let t = x.toFixed(s);
  if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, '');
  return t.replace('.', ',');
};

/* ───────── Meilenstein 1 · Etappe 1 — Zuordnung ─────────

   Links EIN Vorrat mit allen Zahlkarten durcheinander, rechts die
   sechs Rechnungen. Jede Rechnung ist eine Zeile, die sich liest wie
   eine Rechnung: die Rechenkarte als Kopf, dann drei Plaetze mit dem
   Rechenzeichen und dem Gleichheitszeichen dazwischen.

   NEU (2026-09-08, Rikes Rueckmeldung). Drei Dinge waren vorher anders:

   1. DER VORRAT WAR ZWEIGETEILT - Normalform links, Polarform rechts.
      Das nahm den ersten Schritt ab: Wer die Karten getrennt vorfindet,
      muss die Formen nicht mehr auseinanderhalten. Jetzt liegen sie
      durcheinander; der Unterschied sitzt in der Kartenfarbe.

   2. DIE PLAETZE WAREN EIN DRITTEL DER ZEILE BREIT, die Karte darin
      aber nur ein Bruchteil davon - «wie eine Zahl ein ganz langes
      Feld». Und sie waren zu NIEDRIG, weil ihre Hoehe fuer eine auf
      60 % verkleinerte Karte gerechnet war, die Karte darin aber in
      voller Groesse stand und oben und unten hinausragte.

      Ursache: `.feld.reihe > .k` in flaeche.css verkleinert nur
      DIREKTE Kinder einer Reihe. Eine Karte in einem Platz ist ein
      Enkel - die Regel griff nie. Der Fehler war stumm und sah nach
      Absicht aus.

   3. MAN SAH DREI VON SECHS RECHNUNGEN. Die Zeilen sind jetzt flach
      gesetzt statt absolut positioniert und stehen in einem Raster,
      das ab genug Breite zweispaltig wird.

   Die Regel «nicht mischen» wird weiterhin NICHT erzwungen: Eine
   Polarformkarte darf in eine Additionszeile gelegt werden. Das
   Blockieren haette den Vorteil, dass niemand danebengreift, und den
   Nachteil, dass die Regel unsichtbar bliebe - man haette sie nie
   gebraucht. Die Pruefung sagt stattdessen ausdruecklich, was los ist:
   richtig gerechnet, aber gemischt.

   PRUEFEN: Ob das so bleibt, ist Rikes Entscheidung. Der Schalter dafuer
   waere `data-nur` an den Plaetzen - eine Zeile.
*/

const REIHEN = D.e1.rechnungen;
const ZEICHENSATZ = {'+': '+', '-': '−', '*': '×', '/': '÷'};

/* GEAENDERT (2026-09-08, Rikes Rueckmeldung): Die Kartengroesse in den
   Rechnungen stand als fester Anteil von `--kb` da. Ergebnis: «Die
   Kaertchen sind relativ klein und dadurch nicht mehr gut lesbar, und
   daneben haben wir relativ viel Freiplatz.» Beides stimmte - eine
   feste Zahl kann nicht wissen, wie viel Platz da ist.

   Jetzt rechnet `felder()` die Groesse aus dem Platz, den die Flaeche
   wirklich hat: sechs Spalten nebeneinander, in jeder Spalte das
   Zeigerbild oben und darunter die drei Karten der Rechnung. Was
   uebrig ist, geht in die Kartengroesse - nicht in den Rand.

   RAND    Luft zwischen Karte und Platzrand
   KOPF    das Zeigerbild als Anteil der Kartenbreite. Genau so breit
           wie die Karten darunter - so steht die Spalte als ein Block
           da statt als Bild mit angehaengter Liste.
   ZEICHEN Hoehe der Zeile mit + oder = zwischen zwei Karten. */
const RAND = 6, KOPF = 1.0, ZEICHEN = 17;
const KARTE_MIN = 74, KARTE_MAX = 190;

/* Fuehrt `fn` aus, sobald `el` eine Breite hat - sofort, wenn es schon
   eine hat. Gebraucht, weil die Buehne beim Bauen noch hinter dem
   Startfeld liegt und dort alles null Pixel breit ist. Nach dreissig
   Anlaeufen (rund eine halbe Sekunde) wird es trotzdem versucht,
   damit nichts stillschweigend liegenbleibt. */
function sobaldBreit(el, fn, versuch){
  if (el && el.clientWidth > 0) { fn(); return; }
  if ((versuch || 0) > 30) { fn(); return; }
  requestAnimationFrame(() => sobaldBreit(el, fn, (versuch || 0) + 1));
}

/* Der Zuschnitt dieser Etappe. Er steht hier und nicht in flaeche.css,
   weil er nur hier gilt: Die gemeinsame Datei traegt die Formen, die
   ALLE Flaechen brauchen. Eine Zeile, die sich wie eine Rechnung liest,
   braucht nur dieser Meilenstein.

   Alles haengt unter `.buehne.m1` - ausserhalb dieser Etappe kann keine
   der Regeln greifen. */
const STIL = `
.buehne.m1{align-items:stretch}
/* FEHLERBEHOBEN (2026-09-08): Die Marke («Die sechs Rechnungen») klebte
   als sticky ueber dem Blatt, und das Blatt trug min-height:100%. Zusammen
   waren das immer 33 Pixel zu viel - die Flaeche rollte um genau die Hoehe
   der Ueberschrift, obwohl der Inhalt hineinpasste. Jetzt teilen sich
   Marke und Blatt die Hoehe, statt sie zu addieren. */
.buehne.m1 > .haelfte{flex:1 1 0;display:flex;flex-direction:column;
  overflow:hidden}
.buehne.m1 > .haelfte > .marke{position:static;flex:0 0 auto}
.buehne.m1 > .haelfte > .blatt{flex:1 1 auto;min-height:0;min-width:0;
  overflow:auto}
/* Mehr Platz nach rechts: Dort stehen sechs Spalten nebeneinander, und
   was die Breite hergibt, geht in die Kartengroesse. Links liegt ein
   Stapel, der sich ueberlappen darf. */
.buehne.m1 > .haelfte.rechts{flex:2.2 1 0}
/* box-sizing, damit der Innenabstand nicht ZUSAETZLICH zur Hoehe
   kommt: .blatt hat min-height:100%, und mit 10 px Polster darueber
   war das Feld immer zehn Pixel zu hoch - die Flaeche rollte, obwohl
   alles hineinpasste. Ein stummer Fehler wie die anderen. */
.buehne.m1 #feld{position:static;display:grid;gap:6px;align-content:start;
  box-sizing:border-box;padding:2px 6px 8px;grid-template-columns:repeat(6,1fr)}
.buehne.m1 .feld.reihe{position:static;display:flex;flex-direction:column;
  align-items:center;gap:3px;height:auto;padding:5px 4px 7px}
.buehne.m1 .feld.reihe > .reihenkopf{position:static;flex:0 0 auto;
  margin-bottom:2px}
.buehne.m1 .feld.reihe > .zeichen{flex:0 0 auto;line-height:1;
  color:var(--akzent);font-weight:600}
.buehne.m1 .paar{position:relative;left:auto;top:auto;flex:0 0 auto}
.buehne.m1 .paar > .k{width:var(--m1karte)}

/* ---- Etappe 2 ---- */
.buehne.m2{gap:14px}
.buehne.m2 > .haelfte{flex:1 1 0;display:flex;flex-direction:column;
  align-items:center;padding:0 10px 10px;overflow:auto}
.buehne.m2 .bild{width:100%;display:flex;justify-content:center}
.buehne.m2 .bild svg{width:100%;height:auto;touch-action:none;cursor:crosshair}
.buehne.m2 .zettel{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;
  margin-top:4px}
.buehne.m2 .zettel button{font:inherit;font-size:13.5px;padding:5px 11px;
  border-radius:16px;border:1.6px solid var(--linie);background:var(--karte);
  cursor:pointer;display:flex;align-items:center;gap:7px}
.buehne.m2 .zettel button .tupf{width:11px;height:11px;border-radius:50%}
.buehne.m2 .zettel button.dran{border-color:currentColor;font-weight:600}
.buehne.m2 .zettel button.sitzt{background:var(--creme)}
.buehne.m2 .urteil{margin-top:7px;font-size:13.5px;line-height:1.45;
  max-width:44ch;text-align:center;color:var(--matt)}
.buehne.m2 .urteil b{color:var(--tinte)}
.buehne.m2 .urteil .gut{color:var(--richtig);font-weight:600}
.buehne.m2 .urteil .schlecht{color:var(--falsch);font-weight:600}
.schalter{display:flex;align-items:center;gap:6px;font-size:13.5px;
  color:var(--matt);cursor:pointer}

/* NEU (2026-09-09): Die Regel bzw. der Hinweis als ZWEITE ZEILE im
   Auftragskopf. Vorher stand der Text in einem eigenen div darunter,
   ohne Innenabstand - er klebte am linken Rand, waehrend der Titel
   darueber 18px Abstand hat. «flex-basis:100%» bricht ihn im
   Flex-Kopf auf eine eigene Zeile. */
.auftrag{flex-wrap:wrap}
.auftrag .regeltext{flex:1 0 100%;display:block;margin-top:3px;
  font-size:13px;color:var(--matt)}
.auftrag .regeltext b{color:var(--tinte)}

/* Die Schalter JE BILD, unter dem Bild, zu dem sie gehoeren. */
.buehne.m2 .feldkopf{display:flex;align-items:center;gap:12px;
  width:100%;flex-wrap:wrap;padding:0 2px}
.buehne.m2 .feldkopf .marke{margin-right:auto}
.buehne.m2 .bildschalter{display:flex;align-items:center;gap:12px;
  flex-wrap:wrap}
.knopf.klein{font-size:12.5px;padding:3px 10px}
.knopf.klein:disabled{opacity:.45;cursor:default}

/* ── Startfeld: der Pate und die zwei Wege ── */
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
/* FEHLERBEHOBEN (2026-09-09): «display:flex» in der Regel darueber
   ist staerker als die Vorgabe des Browsers fuer [hidden] - das Feld
   stand deshalb sofort da, obwohl es erst nach dem Klick auf «hoehere
   Nummer» erscheinen soll. */
.start .anderefeld[hidden]{display:none}
.start .anderefeld input{font:inherit;font-size:15px;width:5.5em;padding:7px 9px;
  border:1px solid var(--linie);border-radius:8px;background:var(--karte)}

/* ── Die Frage auf dem Weg von Etappe 1 nach Etappe 2 ── */
.uebergang{position:fixed;inset:0;z-index:900;display:flex;
  align-items:center;justify-content:center;padding:24px;
  background:rgba(30,26,20,.42)}
.uebergang .blatt2{max-width:540px;background:var(--papier);
  border:1px solid var(--linie);border-radius:16px;padding:26px 28px;
  box-shadow:0 18px 48px rgba(0,0,0,.22)}
.uebergang .frage{font-family:var(--hand);font-size:22px;
  color:var(--akzent);margin:0 0 10px}
.uebergang p{margin:0 0 18px;color:var(--matt);font-size:14px}
.uebergang .knopfreihe{display:flex;gap:10px;flex-wrap:wrap}

/* «Weiter» im Auftragskopf, gleich neben dem Etappenschild. */
.auftrag .knopf.weiter{font-size:12.5px;padding:3px 12px;
  white-space:nowrap;flex:0 0 auto}
`;

function stilSetzen(){
  if (document.getElementById('m1stil')) return;
  const t = document.createElement('style');
  t.id = 'm1stil'; t.textContent = STIL;
  document.head.appendChild(t);
}

/* Buehne mit zwei Haelften NEBENEINANDER.

   `buehneOben()` aus flaeche.js stapelt: ein Feld oben, die Vorraete
   darunter. Rike will es fuer diesen Meilenstein andersherum - «ein
   Feld mit durcheinander Zahlen in beiden Formen links und rechts die
   Rechnungen». Das steht hier und nicht im Kern, weil sonst «Daten und
   Zufall» mitbetroffen waere; `.buehne` ist ohnehin schon eine
   Flex-Zeile, es braucht nur die Aufteilung. */
function buehneNeben(auftrag, vorrat, rechtsName, leiste, extra){
  const b = document.getElementById('buehne');
  window._nachAblegen = null;
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${auftrag.rang}</span>
      <span class="titel">${auftrag.titel}</span>
      <span class="text">${auftrag.text}</span></div>
    ${extra || ''}
    <div class="buehne m1">
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
  _leisteChrome(b);
}

/* Ein Platz - genau so gross wie die Karte, die hineingehoert. */
function platz(reihe, i, breite, hoehe){
  const p = document.createElement('div');
  p.className = 'paar';
  p.dataset.ort = reihe + '/' + i;
  // Genau eine Karte je Platz. Ohne diese Angabe gilt die Regel «zwei
  // Karten je Platz» aus flaeche.js, und eine zweite Karte legte sich
  // unbemerkt ueber die erste.
  p.dataset.fasst = '1';
  p.style.width = breite + 'px';
  p.style.height = hoehe + 'px';
  if (i === 2) p.classList.add('ergebnis');
  return p;
}

function zeichen(t, kw){
  const s = document.createElement('span');
  s.className = 'zeichen'; s.textContent = t;
  s.style.fontSize = Math.round(Math.min(22, Math.max(14, kw * 0.16))) + 'px';
  s.style.height = ZEICHEN + 'px';
  // Damit das Zeichen auch im Bild zum Mitnehmen steht - sonst nimmt
  // die Gruppe eine Zeile aus vier Kaestchen mit, ohne die Rechnung.
  s.dataset.alsbild = 'text';
  return s;
}

function etappe1(){
  stilSetzen();
  // Etappe 1 schickt Kaertchen, keine Zeiger - die Zusatzleitung aus
  // Etappe 2 muss weg, sonst meldet sie dort weiter.
  window.KASPER_GEMEINSAM_ZUSATZ = null;
  const a = D.etappen[0];
  const vorrat = D.vorrat[0];
  /* GEAENDERT (2026-09-09, Rikes Rueckmeldung): Die Regel stand als
     eigenes `<div class="regel">` UNTER dem Auftragskopf - ohne
     Innenabstand, also am linken Rand klebend, waehrend der Titel
     darueber 18px Abstand hat. Rike: «Das klebt sehr am linken Rand.
     Das ist noch nicht gut. Und vielleicht koennen wir diese
     Informationen auch direkt schon im oberen Teil, wo die Etappe
     steht, unterbringen.»

     Beides erledigt eine Massnahme: Die Regel wird eine zweite Zeile
     INNERHALB des Auftragskopfs. Sie bekommt damit denselben
     Innenabstand wie der Titel und steht dort, wo die Etappe steht. */
  buehneNeben(
    {rang:a.rang, titel:'Etappe 1 · Zuordnung',
     text:D.auftrag + '<span class="regeltext">' + D.regel + '</span>'},
    vorrat,
    'Die sechs Rechnungen',
    `<button class="knopf leer" id="zurueck" title="Alle Karten zurück">↺</button>
     <button class="knopf" id="pruefen">Prüfen</button>
     <span class="befund" id="befund"></span>`);

  const feld = document.getElementById('feld');
  const els = {};
  D.e1.zahlen.forEach(z => { els[z.id] = karte(z.id); });

  /* Wie gross darf eine Karte sein, damit sechs Spalten nebeneinander
     UND eine ganze Spalte untereinander ohne Rollen hineinpassen?

     Beides begrenzt, und die kleinere Zahl gewinnt. Gerechnet wird aus
     dem, was die Flaeche wirklich misst - nicht aus einer Konstanten,
     die nicht wissen kann, wie gross das Fenster ist.

     Eine Spalte ist hoch:  Zeigerbild + 3 Karten + 2 Zeichenzeilen
                            + Luft und Raender. */
  function kartenbreite(){
    // Gemessen wird das Feld selbst. Das geht erst, seit die Haelfte
    // eine Flex-Spalte ist: Vorher waere die Hoehe des Feldes von
    // seinem Inhalt abgehangen und die Rechnung haette sich selbst
    // bestaetigt. Jetzt gibt die Haelfte die Hoehe vor.
    const h = feld;
    const spalten = 6, luecke = 6, polster = 12;
    // Was eine Spalte AUSSER der Karte noch braucht: Luft im Platz,
    // Innenabstand der Spalte, ihr Rahmen. Ohne diesen Posten lief die
    // sechste Spalte rechts aus dem Bild - und zwar lautlos, weil die
    // Flaeche einfach zu rollen anfing.
    const spalteSonst = RAND + 2 * 4 + 3;
    const ausBreite = (h.clientWidth - polster - (spalten - 1) * luecke)
                      / spalten - spalteSonst;
    // Hoehe: kh = 0.845*kw je Karte, dazu das Zeigerbild oben.
    // Spalte = 0.845*kw*(KOPF + 3) + 3*RAND + 2*ZEICHEN + Luft
    const luft = 4 * 3 + 14 + 12;
    const ausHoehe = (h.clientHeight - luft - 3 * RAND - 2 * ZEICHEN)
                     / (0.845 * (KOPF + 3));
    return Math.max(KARTE_MIN,
             Math.min(KARTE_MAX, Math.floor(Math.min(ausBreite, ausHoehe))));
  }

  function felder(){
    feld.querySelectorAll('.feld').forEach(d => d.remove());
    const kw = kartenbreite(), kh = Math.round(kw * 0.845);
    const pw = kw + RAND, ph = kh + RAND;
    const kopfW = Math.round(kw * KOPF);
    // Die Karte im Platz richtet sich nach derselben Zahl - als
    // Variable, damit das Stylesheet sie mitbekommt.
    feld.style.setProperty('--m1karte', kw + 'px');

    REIHEN.forEach(r => {
      const d = document.createElement('div');
      d.className = 'feld reihe'; d.dataset.ort = r.id;
      feld.appendChild(d);

      // Das Zeigerbild steht OBEN in der Spalte, ueber den drei Karten -
      // Rikes Wunsch: «dass sie quasi dort immer die Normalform oder
      // Polarform direkt neben dem passenden Bild haben».
      const kopf = document.createElement('img');
      kopf.className = 'reihenkopf';
      kopf.src = 'karten/' + r.id + '.svg';
      kopf.alt = 'Rechnung ' + r.id;
      kopf.style.width = kopfW + 'px';
      d.appendChild(kopf);

      // Die Spalte liest sich als Rechnung, von oben nach unten.
      d.appendChild(platz(r.id, 0, pw, ph));
      d.appendChild(zeichen(ZEICHENSATZ[r.op], kw));
      d.appendChild(platz(r.id, 1, pw, ph));
      d.appendChild(zeichen('=', kw));
      d.appendChild(platz(r.id, 2, pw, ph));
    });

    // Karten an ihren gemerkten Ort zurueck.
    Object.entries(stand.karten).forEach(([id, s]) => {
      const el = els[id]; if (!el) return;
      const ziel = document.querySelector(`[data-ort="${s.ort}"]`)
                || document.getElementById('feld' + vorrat.id);
      ziel.appendChild(el); el._x = s.x; el._y = s.y; el._rot = s.rot; pos(el);
    });
  }

  /* GEAENDERT (2026-09-09, Rikes Entscheidung): Hier stand
     `loesungAnwenden(...)`, das den Kartenstand gegen die Loesung
     tauschte, und weiter unten `loesungsKnopf()`. Beides ist weg.

     Rike: «Ich wuerde bei Etappe eins schon einen Ueberpruefen-Button.
     Ich wuerd aber nicht die Loesung angeben, sondern ich wuerd nur die
     Kaertchen quasi highlighten, die nicht richtig sind, dass Sie dann
     noch mal neu ueberlegen koennen.» Genau das tut `pruefen()`
     ohnehin, und zwar in drei Stufen - ok, gemischt, falsch.

     Die Loesung selbst liegt jetzt hinten beim Mitnehmen, wo man sie
     nach der Arbeit nachlesen kann. */

  window._neuzeichnen = felder;
  felder();
  // Die Kartengroesse haengt jetzt an der Fenstergroesse - also neu
  // rechnen, wenn sie sich aendert. Der Haken wird beim naechsten
  // Etappenwechsel ueberschrieben, nicht angehaeuft.
  window.onresize = () => { if (document.getElementById('feld')) felder(); };

  // Neue Karten in den Vorrat streuen.
  //
  // FEHLERBEHOBEN (2026-09-08): `streuen()` verteilt die Karten ueber
  // die Breite der Flaeche. Wird es aufgerufen, solange das Startfeld
  // davorsteht, ist diese Breite null - dann liegen alle Karten
  // uebereinander am linken Rand und ragen ueber die Kante.
  const tisch = document.getElementById('feld' + vorrat.id);
  const neu = D.e1.zahlen.filter(z => !(z.id in stand.karten))
                         .map(z => els[z.id]);
  if (neu.length) sobaldBreit(tisch, () => { streuen(neu, tisch); merken(); });
  merken();

  document.getElementById('zurueck').onclick = () => {
    stand.karten = {};
    document.getElementById('befund').textContent = '';
    etappe1();
  };

  document.getElementById('pruefen').onclick = pruefen;
}

/* ───────── Pruefen ─────────

   Drei Urteile je Reihe, und sie sind ausdruecklich verschieden:

     leer       noch nicht vollstaendig belegt
     gemischt   richtig gerechnet, aber Formen gemischt - siehe oben
     falsch     rechnet nicht auf

   Der Unterschied zwischen «gemischt» und «falsch» ist der ganze Punkt.
   Wer ihn nicht macht, sagt einer Gruppe, die richtig gerechnet hat,
   sie habe sich verrechnet.
*/
function pruefen(){
  document.querySelectorAll('.k').forEach(k =>
    k.classList.remove('ok', 'falsch', 'fastok'));

  let richtig = 0, gemischt = 0, spalte = 0, falsch = 0, offen = 0;

  REIHEN.forEach(r => {
    const gelegt = [0, 1, 2].map(i => {
      const e = Object.entries(stand.karten)
        .find(([, s]) => s.ort === r.id + '/' + i);
      return e ? e[0] : null;
    });
    if (gelegt.some(x => x === null)) { offen++; return; }

    const w = gelegt.map(id => D.werte[id]);
    const rechnetAuf = rechnet(r.op, w[0], w[1], w[2]);
    const eineForm = gelegt.every(id => id[0] === gelegt[0][0]);

    /* FEHLERBEHOBEN (2026-09-09): Geprueft wurde NUR, ob die drei
       gelegten Karten mit dem Rechenzeichen der Reihe aufgehen - nicht,
       ob das Ergebnis zum Zeigerbild ueber der Spalte passt.

       R1 und R2 sind beide «+», R4 und R5 beide «×». Also gingen genau
       zwei Vertauschungen als richtig durch: R2s Tripel in R1s Reihe
       rechnet auf, steht aber unter dem Zeigerbild von 5+3i, waehrend
       die Karten 2+8i sagen.

       NACHGEWIESEN am 2026-09-09 im Browser: beide Vertauschungen
       gelegt, Befund «4 von 6 stimmen», alle vier Reihen `ok`.

       Unentdeckt geblieben ist es, weil «Lösung anzeigen» daneben
       stand: Wer unsicher war, sah nach, statt zu pruefen. Seit der
       Knopf weg ist, ist `pruefen()` die einzige Rueckmeldung in
       Etappe 1 - dann muss sie stimmen.

       PRUEFEN (fuer Rike): `D.ergebnis_verbindlich` schaltet das um.
       Es ist ein DIDAKTISCHES Urteil, nicht ein technisches - ob die
       sechs Zeigerbilder die Aufgabe stellen oder ob sechs richtige
       Gleichungen in beliebiger Spalte genuegen. Ich lese den Auftrag
       so («Legen Sie ZU JEDER RECHNUNG die drei Karten») und sechs
       verschiedene Ergebnisbilder als Ja. Ein `False` in thema.py
       stellt den alten Zustand wieder her. */
    const ergebnisPasst = !D.ergebnis_verbindlich
      || gelegt[2] === r.loesung[2];

    /* Vier Urteile, nicht drei. Der Grund ist derselbe wie oben bei
       «gemischt»: Eine vertauschte Reihe RECHNET auf. Ihr «rechnet
       nicht auf» zu melden waere genau der Fehler, den dieser Befund
       nicht machen soll. Sie bekommt deshalb dieselbe Markierung wie
       «gemischt» - richtig gerechnet, hier nicht das Gesuchte - und
       einen eigenen Satz. */
    let marke;
    if (!rechnetAuf)                    { marke = 'falsch'; falsch++; }
    else if (!ergebnisPasst)            { marke = 'fastok'; spalte++; }
    else if (!eineForm)                 { marke = 'fastok'; gemischt++; }
    else                                { marke = 'ok'; richtig++; }
    gelegt.forEach(id => document.querySelector(
      `.k[data-id="${id}"]`).classList.add(marke));
  });

  stand.geprueft = true;
  const b = document.getElementById('befund');
  const teile = [];
  // FEHLERBEHOBEN (2026-09-08): Der Befund stand immer im Plural - bei
  // einer einzigen Reihe las sich das als «1 rechnen nicht auf».
  const eins = n => n === 1;
  if (richtig)  teile.push(`<b>${richtig}</b> von 6 `
                         + `${eins(richtig) ? 'stimmt' : 'stimmen'}`);
  if (gemischt) teile.push(`<b>${gemischt}</b> `
                         + `${eins(gemischt) ? 'rechnet auf, mischt' : 'rechnen auf, mischen'}`
                         + ` aber die Formen — richtig gerechnet, hier nicht erlaubt`);
  if (spalte)   teile.push(`<b>${spalte}</b> `
                         + `${eins(spalte) ? 'rechnet' : 'rechnen'} auf, `
                         + `${eins(spalte) ? 'steht' : 'stehen'} aber unter dem `
                         + `falschen Zeigerbild — vergleichen Sie das Ergebnis `
                         + `mit dem Bild oben`);
  if (falsch)   teile.push(`<b>${falsch}</b> `
                         + `${eins(falsch) ? 'rechnet' : 'rechnen'} nicht auf`);
  if (offen)    teile.push(`${offen} noch unvollständig`);
  b.innerHTML = teile.join(' · ') || 'Es liegt noch nichts in den Reihen.';
}

/* Rechnet mit den Werten aus D.werte, die als [Realteil, Imaginaerteil]
   uebergeben werden. Die Toleranz ist grosszuegiger als im Generator:
   Die Polarwerte sind gerundet ins HTML gegangen. */
function rechnet(op, x, y, z){
  const [ar, ai] = x, [br, bi] = y, [er, ei] = z;
  let r, i;
  if (op === '+') { r = ar + br; i = ai + bi; }
  else if (op === '-') { r = ar - br; i = ai - bi; }
  else if (op === '*') { r = ar * br - ai * bi; i = ar * bi + ai * br; }
  else { const n = br * br + bi * bi;
         r = (ar * br + ai * bi) / n; i = (ai * br - ar * bi) / n; }
  return Math.abs(r - er) < 1e-6 && Math.abs(i - ei) < 1e-6;
}

ETAPPEN.push(etappe1);


/* ───────── Meilenstein 1 · Etappe 2 — Geometrische Deutung ─────────

   Rikes Whiteboard: EIN Achsenkreuz, darauf z und w als Zeiger vom
   Ursprung. Der Rest war leer und wurde in der Sitzung live gefuellt.

   Hier ist es umgedreht gegenueber Etappe 1: Dort war das ERGEBNIS als
   Zeiger gegeben und die Zahlen gesucht. Jetzt stehen die Zahlen, und
   das Ergebnis wird gesetzt - selbst, nicht ausgewaehlt. Rikes Grund:
   «Wer aus fertigen Bildern auswaehlt, erkennt wieder, statt zu
   entscheiden.»

   ZWEI FELDER, nicht vier. In einem Bild mit z, w, w+z und w−z sieht
   man, dass w−z dasselbe ist wie w plus dem umgedrehten z; bei mal und
   geteilt genauso. In vier Feldern waeren das vier einzelne Aufgaben,
   in zweien ist es zweimal eine Struktur. Ausserdem sind zwei Bilder
   groesser als vier, und Schaetzen in einem kleinen Bild ist Raten.

   UNGEFAEHR GENUEGT. Rike: «Ich haette gerne, dass sie selber die
   Pfeile ungefaehr positionieren.» Es wird deshalb nichts eingerastet,
   und die Pruefung urteilt mit Toleranz. Wie gross die sein darf, ist
   nicht geschaetzt: `pruefe_etappe2()` in inhalte.py rechnet den
   engsten Abstand zwischen einem Ziel und einem benannten Fehlgriff aus
   und laesst hoechstens die Haelfte davon zu.

   DER SCHALTER IST SELBST DER AHA-MOMENT. Karos an, Kreise aus - die
   Zahlen sind in Normalform gegeben, das Karogitter ist der natuerliche
   Anfang. Wer beim Malnehmen nicht weiterkommt und die Kreise
   einblendet, sieht in dem Moment, dass sich der Zeiger dreht.

   Gezeichnet wird mit `window.Zeichnen` aus fremd/pia/2026-09-08/ -
   Achsen, Pfeile, Beschriftung. Das Gitter, das Setzen und das
   Kreisraster sind hier dazugekommen; die Datei kennt beides nicht.
*/

const E2FARBE_GEGEBEN = 'var(--matt)';

/* GEAENDERT (2026-09-09, Rikes Rueckmeldung): `karo` und `kreis`
   standen hier EINMAL und galten fuer beide Bilder. Jetzt haelt
   `bild[feldId]` sie je Bild, dazu `vergleich` - ob in diesem Bild die
   richtigen Zeiger zusaetzlich eingeblendet sind.

   Voreinstellung wie vorher: Karos an, Kreise aus. Sie ist die
   Begruendung aus dem Kopfkommentar - die Zahlen sind in Normalform
   gegeben, das Karogitter ist der natuerliche Anfang. */
function e2Stand(){
  if (!stand.e2) stand.e2 = {gesetzt:{}, dran:null, urteil:{}, bild:{}};
  if (!stand.e2.bild) stand.e2.bild = {};
  return stand.e2;
}

/* Die Einstellungen EINES Bildes. */
function e2Bildstand(feldId){
  const s = e2Stand();
  if (!s.bild[feldId]) s.bild[feldId] = {karo:true, kreis:false, vergleich:false};
  return s.bild[feldId];
}

const z2 = (p) => ({re:p[0], im:p[1]});
const betrag = (p) => Math.hypot(p[0], p[1]);
const abstand = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1]);

/* Bildkoordinaten aus einem Zeigerereignis. Das SVG rechnet in seinem
   eigenen Raum (viewBox); getScreenCTM kennt die Umrechnung, auch wenn
   die Flaeche skaliert oder gerollt ist. */
function e2Ort(svg, ev, max){
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x / 100 * max, -q.y / 100 * max];
}

/* Das Gitter. Beides ist zuschaltbar und beides zeichnet die Etappe
   selbst - `zeichnen.js` hat ein festes Raster mit fuenf Schritten je
   Achsenhaelfte, und damit gibt es keine ganzzahligen Linien bei
   Maximum 3,6. */
function e2Gitter(F, max, s){
  if (s.karo){
    // Fein zuerst, damit die ganzen Linien darueberliegen.
    for (let k = -Math.floor(max*5); k <= Math.floor(max*5); k++){
      const v = k / 5;
      if (Math.abs(v % 1) < 1e-9) continue;
      F.gerade({re:v, im:-max}, {re:v, im:max}, {farbe:'var(--linie)', dicke:.35});
      F.gerade({re:-max, im:v}, {re:max, im:v}, {farbe:'var(--linie)', dicke:.35});
    }
    for (let k = -Math.floor(max); k <= Math.floor(max); k++){
      if (k === 0) continue;
      F.gerade({re:k, im:-max}, {re:k, im:max}, {farbe:'var(--linie)', dicke:.8});
      F.gerade({re:-max, im:k}, {re:max, im:k}, {farbe:'var(--linie)', dicke:.8});
    }
  }
  if (s.kreis){
    for (let r = 1; r <= Math.floor(max); r++) F.kreis(r, {farbe:'var(--linie)'});
    for (let g = 0; g < 180; g += 15){
      const b = g * Math.PI / 180;
      F.gerade({re:-max*Math.cos(b), im:-max*Math.sin(b)},
               {re: max*Math.cos(b), im: max*Math.sin(b)},
               {farbe:'var(--linie)', dicke:.5, gestrichelt:true});
    }
  }
}

/* Die Achsenbeschriftung.

   GEAENDERT (2026-09-08): `zeichnen.js` beschriftet sein EIGENES
   Raster - fuenf Schritte je Achsenhaelfte, also bei Maximum 3,6 die
   Marken 2,16 und 3,6. Krumme Zahlen an einem Bild, in dem alles
   Wichtige auf ganzen Linien liegt. Deshalb `achsenzahlen:false` und
   die Marken hier, an denselben Stellen wie Rikes Whiteboard. */
function e2Achsen(F, max){
  for (let k = -Math.floor(max); k <= Math.floor(max); k++){
    if (k === 0) continue;
    F.text({re:k, im:-0.22}, String(k), {gr:7.5, farbe:'var(--matt)'});
    F.text({re:-0.16, im:k}, String(k),
           {gr:7.5, farbe:'var(--matt)', anker:'end'});
  }
  F.text({re:max*0.96, im:0.22}, 'Re', {gr:7.5, farbe:'var(--matt)', anker:'end'});
  F.text({re:0.30, im:max*0.95}, 'Im', {gr:7.5, farbe:'var(--matt)', anker:'start'});
}

function e2Bild(feld, wrap, s){
  const E = D.e2, max = E.max;
  const bs = e2Bildstand(feld.id);
  const F = Zeichnen.flaeche({max, gitter:false, achsenzahlen:false, breite:520});
  e2Gitter(F, max, bs);
  e2Achsen(F, max);

  F.pfeil(z2(E.z.ort), {farbe:E2FARBE_GEGEBEN, dicke:1.7, marke:E.z.marke});
  F.pfeil(z2(E.w.ort), {farbe:E2FARBE_GEGEBEN, dicke:1.7, marke:E.w.marke});

  /* GEAENDERT (2026-09-09, Rikes Rueckmeldung): Hier stand
     `stand.loesungOffen ? auf.ziel : s.gesetzt[auf.id]` - die Loesung
     ERSETZTE den eigenen Zeiger. Rike: «Wenn man die Loesung einblenden
     laesst, sieht man die, die man selber ausgesucht hat, nicht mehr.
     Es waer ja eigentlich cool, wenn man die, die man selber gezogen
     hat, im Vergleich hat.»

     Jetzt stehen beide da. Der richtige Zeiger ist gestrichelt und
     traegt kein zweites Mal die Beschriftung - sonst stehen zwei
     gleiche Namen im Bild und man weiss nicht, welcher wozu gehoert.
     Gezeichnet wird er ZUERST, damit der eigene darueber liegt: Es geht
     um den eigenen, der Vergleich ist die Zugabe. */
  if (bs.vergleich){
    feld.aufgaben.forEach(auf => {
      /* KEIN zweiter Pfeil, sondern gestrichelte Linie mit offenem
         Punkt am Ende. Zwei Gruende:

         1. `F.pfeil` in zeichnen.js kennt kein `gestrichelt` (nur
            `gerade` und `kreis` tun das), und die Datei liegt
            eingefroren in fremd/ - sie wird nicht geaendert.
         2. Es ist ohnehin das Richtige. Rikes eigener Satz zu Etappe 2:
            «Die fangen aber immer bei null an und enden immer an einem
            bestimmten Ort.» Der ORT ist die Auskunft. Zwei gleich
            aussehende Pfeile in derselben Farbe waeren nur zu
            unterscheiden, wenn man genau hinsieht - ein offener Punkt
            sagt «hierher», ohne mit dem eigenen Zeiger zu wetteifern. */
      F.gerade({re:0, im:0}, z2(auf.ziel),
               {farbe:auf.farbe, dicke:1.3, gestrichelt:true});
      F.punkt(z2(auf.ziel), {farbe:auf.farbe, gr:3.2, gefuellt:false});
    });
  }

  feld.aufgaben.forEach(auf => {
    const p = s.gesetzt[auf.id];
    if (!p) return;
    F.pfeil(z2(p), {farbe:auf.farbe, dicke:2.6, marke:auf.text});
  });

  wrap.replaceChildren(F.svg);
  return F.svg;
}

/* Ein Feld: Bild, Zettel darunter, Urteil. */
function e2Feld(feld){
  const s = e2Stand();
  const h = document.createElement('div');
  h.className = 'haelfte';
  /* FEHLERBEHOBEN (2026-09-09, noch am selben Tag): Die Schalter je
     Bild standen zuerst als EIGENE ZEILE unter dem Bild. Das kostete
     Hoehe, die die Haelfte nicht hat - der Zettel mit den vier
     Aufgaben und das Urteil darunter rutschten aus dem Sichtfeld, und
     man konnte den zweiten Zeiger nicht mehr auswaehlen.

     Jetzt teilen sie die Kopfzeile mit dem Namen des Bildes: Titel
     links, Schalter rechts. Das kostet keine einzige Zeile. */
  const kopf = document.createElement('div');
  kopf.className = 'feldkopf';
  const marke = document.createElement('div');
  marke.className = 'marke'; marke.textContent = feld.name;
  kopf.appendChild(marke);
  h.appendChild(kopf);

  const wrap = document.createElement('div');
  wrap.className = 'bild';
  h.appendChild(wrap);

  /* NEU (2026-09-09, Rikes Rueckmeldung): Karos, Kreise und der
     Vergleich gelten JE BILD. Die Schalter sitzen deshalb hier, unter
     dem Bild, zu dem sie gehoeren - nicht in der Leiste am Fuss der
     Seite, wo nicht zu sehen war, worauf sie wirken. */
  const bs = e2Bildstand(feld.id);
  const schalter = document.createElement('div');
  schalter.className = 'bildschalter';
  const kKaro  = document.createElement('label');
  const kKreis = document.createElement('label');
  kKaro.className = kKreis.className = 'schalter';
  kKaro.innerHTML  = '<input type="checkbox"> Karos';
  kKreis.innerHTML = '<input type="checkbox"> Kreise';
  kKaro.querySelector('input').checked  = bs.karo;
  kKreis.querySelector('input').checked = bs.kreis;
  kKaro.querySelector('input').onchange  = e => { bs.karo  = e.target.checked; neu(); };
  kKreis.querySelector('input').onchange = e => { bs.kreis = e.target.checked; neu(); };

  /* «Richtige Zeiger einblenden» - Rikes Wort, nicht «Loesung
     anzeigen». Der Unterschied ist nicht nur der Name: Es wird
     ZUSAETZLICH eingeblendet, der eigene Zeiger bleibt stehen.

     Freigeschaltet erst, wenn in DIESEM Bild beide Zeiger sitzen -
     Rike: «wenn Sie Ihre Pfeile gesetzt haben». Wer vorher nachsieht,
     hat nicht ueberlegt, und dann traegt der Vergleich nichts. */
  const kVergleich = document.createElement('button');
  kVergleich.className = 'knopf leer klein';
  schalter.appendChild(kKaro);
  schalter.appendChild(kKreis);
  schalter.appendChild(kVergleich);
  kopf.appendChild(schalter);

  function vergleichZeichnen(){
    const alleGesetzt = feld.aufgaben.every(a => s.gesetzt[a.id]);
    kVergleich.disabled = !alleGesetzt;
    kVergleich.title = alleGesetzt
      ? 'Die richtigen Zeiger zusätzlich einblenden'
      : 'Erst beide Zeiger setzen';
    kVergleich.textContent = bs.vergleich
      ? 'Richtige Zeiger ausblenden' : 'Richtige Zeiger einblenden';
    if (!alleGesetzt && bs.vergleich) bs.vergleich = false;
  }
  kVergleich.onclick = () => { bs.vergleich = !bs.vergleich; neu(); };

  const zettel = document.createElement('div');
  zettel.className = 'zettel';
  h.appendChild(zettel);

  const urteil = document.createElement('div');
  urteil.className = 'urteil';
  h.appendChild(urteil);

  function zettelZeichnen(){
    zettel.replaceChildren();
    feld.aufgaben.forEach(auf => {
      const b = document.createElement('button');
      b.style.color = auf.farbe;
      if (s.dran === auf.id) b.classList.add('dran');
      if (s.gesetzt[auf.id]) b.classList.add('sitzt');
      const t = document.createElement('span');
      t.className = 'tupf'; t.style.background = auf.farbe;
      b.appendChild(t);
      b.appendChild(document.createTextNode(auf.text));
      b.onclick = () => { s.dran = (s.dran === auf.id) ? null : auf.id;
                          zettelZeichnen(); };
      zettel.appendChild(b);
    });
    const offen = feld.aufgaben.filter(a => !s.gesetzt[a.id]).length;
    if (!urteil.dataset.gefuellt)
      urteil.textContent = offen
        ? (s.dran ? 'Jetzt in das Bild tippen oder ziehen.'
                  : 'Wählen Sie einen Zeiger und setzen Sie ihn.')
        : 'Beide gesetzt. Sie können sie noch verschieben.';
  }

  function neu(){
    const svg = e2Bild(feld, wrap, s);
    binden(svg);
    zettelZeichnen();
    vergleichZeichnen();
  }

  /* Setzen und Ziehen. Der Zeiger wird am WRAP festgehalten, nicht am
     SVG: Bei jeder Bewegung entsteht ein neues SVG, und ein Griff auf
     das alte waere sofort verloren.

     FEHLERBEHOBEN (2026-09-09): `zieht` stand INNERHALB von binden().

     URSACHE: `neu()` ruft binden() erneut - und `neu()` laeuft mitten
     im pointerdown. Damit werden wrap.onpointermove und
     wrap.onpointerup durch neu erzeugte Funktionen ersetzt, deren
     eigenes `zieht` auf null steht. Die laufende Geste verlor so ihren
     Merker. Zwei Folgen: Ziehen tat nichts, und `los` brach vor
     e2Melden() ab - es landete deshalb NIE ein gesetzter Zeiger auf
     dem gemeinsamen Brett.

     NACHGEWIESEN am 2026-09-09 mit zwei Browsern im selben Raum: Der
     Zeiger kam nicht an; von Hand gerufenes KASPER_GEMEINSAM_MELDEN()
     kam sofort an. Die Leitung war also in Ordnung, der Ausloeser
     fehlte. Gemessen wurde zudem, dass wrap.onpointerup nach dem
     Druck eine andere Funktion ist als davor.

     Beim Alleintesten unsichtbar, weil ein Antippen den Zeiger
     trotzdem setzt: Man klickt, er sitzt, man klickt daneben, er sitzt
     anders. Dass sich nichts ZIEHEN laesst, faellt erst auf, wenn man
     es versucht - und dass nichts gesendet wird, erst zu zweit.

     Der Merker gehoert deshalb in den Rahmen von e2Feld, den alle
     Bindungen gemeinsam sehen. */
  let zieht = null;
  function binden(svg){
    const nimm = ev => {
      const p = e2Ort(svg, ev, D.e2.max);
      // Liegt eine Spitze in der Naehe? Dann die, sonst die gewaehlte.
      let nah = null, d0 = D.e2.max * 0.13;
      feld.aufgaben.forEach(a => {
        const g = s.gesetzt[a.id];
        if (g && abstand(g, p) < d0){ nah = a.id; d0 = abstand(g, p); }
      });
      const welche = nah || s.dran
                  || (feld.aufgaben.find(a => !s.gesetzt[a.id]) || {}).id;
      if (!welche) return null;
      s.dran = welche;
      return {id: welche, p};
    };
    wrap.onpointerdown = ev => {
      const t = nimm(ev); if (!t) return;
      ev.preventDefault();
      wrap.setPointerCapture(ev.pointerId);
      zieht = t.id;
      s.gesetzt[t.id] = t.p;
      urteil.dataset.gefuellt = ''; urteil.textContent = '';
      neu();
    };
    wrap.onpointermove = ev => {
      if (!zieht) return;
      s.gesetzt[zieht] = e2Ort(svg, ev, D.e2.max);
      neu();
    };
    const los = ev => {
      if (!zieht) return;
      zieht = null;
      try { wrap.releasePointerCapture(ev.pointerId); } catch(e){}
      if (window.Aufnahme && Aufnahme.laeuft)
        Aufnahme.merken('zeiger', {feld: feld.id, wer: s.dran,
                                   ort: s.gesetzt[s.dran]});
      e2Melden();
    };
    wrap.onpointerup = los;
    wrap.onpointercancel = los;
  }

  h._neu = neu;
  h._urteil = urteil;
  neu();
  return h;
}

/* ───────── Pruefen (Etappe 2) ─────────

   Drei Sorten Rueckmeldung, und der Unterschied ist der Ertrag:

     nah dran     innerhalb der Toleranz
     benannt      auf einem Fehlgriff, den der Korpus kennt - dann sagt
                  die Flaeche, WAS passiert ist, nicht nur dass es
                  falsch ist
     halb         Richtung stimmt und Laenge nicht, oder umgekehrt

   Die Reihenfolge zaehlt: erst das Ziel, dann die Fehlgriffe. Dass das
   eindeutig bleibt, prueft inhalte.py beim Bauen. */
function e2Urteil(auf, p){
  const T = D.e2.toleranz;
  if (abstand(p, auf.ziel) <= T)
    return {gut:true, text:'<span class="gut">Ja.</span> Genau da liegt <b>'
                          + auf.text + '</b>.'};
  for (const f of auf.fehler)
    if (abstand(p, f.ort) <= T)
      return {gut:false, text:'<span class="schlecht">Fast — aber nicht das.</span> '
                              + f.text};

  const lz = betrag(auf.ziel), lp = betrag(p);
  const wz = Math.atan2(auf.ziel[1], auf.ziel[0]);
  const wp = Math.atan2(p[1], p[0]);
  let dw = Math.abs(wz - wp) * 180 / Math.PI;
  if (dw > 180) dw = 360 - dw;
  const laengeGut = Math.abs(lz - lp) <= T;
  const winkelGut = dw <= 12;
  if (winkelGut && !laengeGut)
    return {gut:false, text:'Die <b>Richtung</b> stimmt. Wie <b>lang</b> muss '
                          + auf.text + ' sein?'};
  if (laengeGut && !winkelGut)
    return {gut:false, text:'Die <b>Länge</b> stimmt. In welche <b>Richtung</b> '
                          + 'zeigt ' + auf.text + '?'};
  return {gut:false, text:'Noch nicht. Sehen Sie sich <b>Länge</b> und '
                        + '<b>Winkel</b> von z und w an.'};
}

function e2Pruefen(haelften){
  const s = e2Stand();
  D.e2.felder.forEach((feld, i) => {
    const teile = [];
    feld.aufgaben.forEach(auf => {
      const p = s.gesetzt[auf.id];
      if (!p){ teile.push('<b>' + auf.text + '</b> ist noch nicht gesetzt.');
               return; }
      teile.push('<b>' + auf.text + '</b> — ' + e2Urteil(auf, p).text);
    });
    const u = haelften[i]._urteil;
    u.dataset.gefuellt = '1';
    u.innerHTML = teile.join('<br>');
  });
}

/* Die Zeiger ueber die gemeinsame Leitung.

   NEU (2026-09-08, Rikes Auftrag): «Es muessen alle sehen, was wie wo
   passiert.» Ihre Beobachtung war zugleich die Loesung - ein gesetzter
   Zeiger faengt immer bei null an und endet an einem Ort, also ist die
   Uebertragung dieselbe wie bei einer Karte: «liegt an Ort y».

   Es braucht deshalb keine zweite Tabelle. `gemeinsam.js` fragt hier
   nach, was ausser Kaertchen noch auf dem Brett liegt, und liefert
   Hereinkommendes hier ab. Mal hundert, weil die Leitung rundet - siehe
   den Kommentar dort.

   Die Kennung traegt `e2:` vorneweg, damit eine Zeile aus Etappe 2
   niemals mit einer Kartennummer verwechselt wird. */
const E2VOR = 'e2:';

function e2Leitung(felder, neuZeichnen){
  window.KASPER_GEMEINSAM_ZUSATZ = {
    stand(){
      const s = e2Stand(), aus = {};
      felder.forEach(f => f.aufgaben.forEach(auf => {
        const p = s.gesetzt[auf.id];
        if (p) aus[E2VOR + auf.id] = {ort:'e2', x: p[0]*100, y: p[1]*100, rot:0};
      }));
      return aus;
    },
    anwenden(z){
      if (!z.karte.startsWith(E2VOR)) return false;
      const id = z.karte.slice(E2VOR.length);
      const bekannt = felder.some(f => f.aufgaben.some(a => a.id === id));
      if (!bekannt) return true;      // fremde Etappe, aber nicht unsere Sache
      e2Stand().gesetzt[id] = [z.x/100, z.y/100];
      neuZeichnen();
      return true;
    }
  };
}

function e2Melden(){
  if (window.KASPER_GEMEINSAM_MELDEN) window.KASPER_GEMEINSAM_MELDEN();
}

function etappe2(){
  stilSetzen();
  const s = e2Stand();
  const a = D.etappen[1];

  const b = document.getElementById('buehne');
  window._nachAblegen = null;
  b.innerHTML = `
    <div class="auftrag"><span class="rang">${a.rang}</span>
      <span class="titel">Etappe 2 · Geometrische Deutung</span>
      <span class="text">${a.auftrag}<span class="regeltext"
        >${D.e2_hinweis}</span></span></div>
    <div class="buehne m2"></div>
    <div class="leiste">
      <button class="knopf" id="pruefen2">Prüfen</button>
      <button class="knopf leer" id="zurueck2" title="Alle Zeiger weg">↺</button>
    </div>`;

  const buehne = b.querySelector('.buehne.m2');
  const haelften = D.e2.felder.map(f => {
    const h = e2Feld(f);
    buehne.appendChild(h);
    return h;
  });

  /* GEAENDERT (2026-09-09, Rikes Rueckmeldung): Hier standen ZWEI
     Schalter in der Leiste, die fuer beide Bilder zugleich galten.
     Rike: «Man kann sich nicht entscheiden, links Karos und rechts
     Kreise. Diese Auswahl wuerde ich jeweils pro Bild machen.»

     Und das ist nicht nur bequemer, es passt zu der Begruendung, die
     oben im Kopfkommentar steht: Der Aha-Moment ist, dass die Kreise
     beim MALNEHMEN die Drehung zeigen. Dann gehoeren sie ins rechte
     Bild, waehrend links die Karos stehen bleiben - global ging genau
     das nicht. Die Schalter sitzen jetzt in `e2Feld()`. */

  // Anmelden, BEVOR das Brett Zeilen liefert: `los()` ruft erst diese
  // Etappe und danach den Raumwechsel, der die Zeilen holt.
  e2Leitung(D.e2.felder, () => haelften.forEach(h => h._neu()));

  document.getElementById('pruefen2').onclick = () => e2Pruefen(haelften);
  document.getElementById('zurueck2').onclick = () => {
    s.gesetzt = {}; s.dran = null;
    // Auch der Vergleich geht weg - wer neu anfaengt, soll nicht
    // die richtigen Zeiger schon im Bild haben.
    Object.values(s.bild || {}).forEach(b => b.vergleich = false);
    etappe2(); e2Melden();
  };

  _leisteChrome(b);
}

ETAPPEN.push(etappe2);


/* ───────── Meilenstein 1 · Etappe 3 — Rechengesetze ─────────

   Rikes dritte Whiteboard-Spalte: ein Ausschnitt aus ihrem Skript -
   Folgerung 2.7 mit den vier Rechenregeln - und darunter die Frage
   «Welche Regeln gibt es bei den Rationalen Zahlen?».

   ZUSATZ, NICHT PFLICHT. Rikes Entscheidung vom 2026-09-08: «Wobei
   Etappe drei ein moeglicher Zusatz waere und nicht verpflichtend.»
   Wer nach Etappe 2 aufhoert, hat den Meilenstein.

   NICHTS WIRD GESPEICHERT UND NICHTS GEPRUEFT. Rike am 2026-09-09: «Da
   muessen wir auch nichts zusaetzlich speichern oder Aehnliches. Das
   ist eine ganz guenstige Etappe, die ich bei Bedarf und Zeit
   ansprechen kann, aber nicht ansprechen muss.» Die Etappe ist ein
   Gespraechsanlass, keine Aufgabe mit Loesung - und die leere rechte
   Seite ist deshalb Absicht, nicht ein fehlendes Eingabefeld. Der
   Nachsatz sagt es ausdruecklich, damit niemand danach sucht.

   DER STIL FOLGT DEM SKRIPT. Rike: «Schoen waere, wenn wir uns vom Stil
   her ungefaehr da auch orientieren wuerden, damit ein
   Wiedererkennungseffekt da ist.» Die Markierungen sind woertlich die
   des Skripts - die Teile von z1 in `aktion!50!white`, die von z2 in
   `beweis!50!white`. Beide Farben sind aus derselben Palette gemischt,
   die auch Kasper fuehrt; nachgerechnet in
   quellen/2026-09-09_rechenregeln/HERKUNFT.md.
*/

const E3STIL = `
.buehne.m3{gap:14px;align-items:stretch}
.buehne.m3 > .haelfte{flex:1 1 0;display:flex;flex-direction:column;
  overflow:auto;padding:0 18px 16px}
.buehne.m3 .satz{border:1.5px solid var(--linie);border-radius:10px;
  background:var(--karte);padding:0 0 14px;overflow:hidden;margin-top:4px}
.buehne.m3 .satzkopf{background:var(--aktion);color:#fff;padding:6px 14px;
  font-size:14px;display:flex;gap:10px;align-items:baseline}
.buehne.m3 .satzkopf .nr{font-family:var(--hand);font-size:17px}
.buehne.m3 .satzkopf .was{opacity:.9}
.buehne.m3 .satz .lage{padding:12px 16px 4px;font-size:15px}
.buehne.m3 .regel3{display:flex;align-items:baseline;gap:12px;
  padding:7px 16px}
.buehne.m3 .regel3 .name{font-weight:700;flex:0 0 auto;min-width:8.5em}
.buehne.m3 .regel3 .term{flex:1 1 auto;text-align:right}
.buehne.m3 .frage3{margin-top:16px;background:var(--phlu,#94743A);
  color:#fff;border-radius:8px;padding:10px 16px;font-size:16px;
  font-family:var(--hand)}
/* NEU (2026-09-09, Rikes Rueckmeldung): Hier standen «.leerzeile» mit
   einem gestrichelten «.strich» - eine Linie, die aussah wie ein
   Eingabefeld und keines war. Rike: «Es sieht jetzt so aus, als
   koennte man bei Addition, Subtraktion, Multiplikation und Division
   jeweils was aufschreiben. Tatsaechlich kann man das aber nicht.»

   Und: «Sehr schoen, wenn man dann immer Addition genauso wie bei der
   Folgerung und bei dem, wie's bei den rationalen Zahlen aussieht,
   immer auf derselben Hoehe.»

   DAS IST DER GRUND FUER DAS RASTER. Zwei Haelften nebeneinander
   koennen das nicht leisten: Ueber den Regeln steht links der
   Satzkopf, rechts die Frage, und die sind verschieden hoch - dann
   liegen «Addition» links und rechts nie auf einer Linie. Ein Gitter
   mit gemeinsamen Zeilen erzwingt es. Der Regelname steht deshalb nur
   noch EINMAL und traegt beide Spalten; das ist nicht nur gleich hoch,
   es ist auch weniger Text. */
.buehne.m3.gitter{display:grid;align-content:start;
  grid-template-columns:auto 1fr 1fr;gap:0 0;padding:10px 16px;overflow:auto}
.buehne.m3.gitter .kopf{padding:7px 14px;font-size:13.5px;color:#fff;
  font-family:var(--hand);font-size:16px}
.buehne.m3.gitter .kopf.links{background:var(--aktion);
  border-radius:8px 0 0 0}
.buehne.m3.gitter .kopf.rechts{background:var(--phlu,#94743A);
  border-radius:0 8px 0 0}
.buehne.m3.gitter .lagezelle{padding:12px 14px 8px;font-size:14.5px}
.buehne.m3.gitter .zeilenname{font-weight:700;padding:11px 16px 11px 4px;
  white-space:nowrap;border-top:1px solid var(--linie)}
.buehne.m3.gitter .zelle{padding:9px 14px;border-top:1px solid var(--linie);
  display:flex;align-items:center}
.buehne.m3.gitter .cSpalte{background:var(--creme)}
.buehne.m3.gitter .qSpalte{background:var(--papier)}
.buehne.m3.gitter .cSpalte.zelle{justify-content:flex-end;text-align:right}
.buehne.m3.gitter .qfeld{display:flex;align-items:center;gap:8px;width:100%}
.buehne.m3.gitter .qfeld .vorgabe{flex:0 0 auto;white-space:nowrap}
/* Der Bruch aus zwei Feldern. Der Bruchstrich ist der untere Rand des
   oberen Feldes - so sitzt er immer richtig, egal wie breit das Feld
   wird, und es braucht kein zusaetzliches Element. */
.buehne.m3.gitter .qbruch{display:inline-flex;flex-direction:column;
  flex:0 0 auto;width:13em;max-width:100%;vertical-align:middle;gap:0}

/* GEAENDERT (2026-09-20, Rikes Idee): Hier standen zwei Eingabefelder. Jetzt
   sind es zwei ABLAGEN, in die Minikaertchen gelegt werden.

   min-height statt height: Eine Zeile waechst, wenn viele Kaertchen
   darin liegen - die Addition braucht oben vier. Ein Feld mit fester
   Hoehe haette sie abgeschnitten, und zwar stumm. */
.buehne.m3.gitter .qzeile{display:flex;flex-wrap:wrap;align-items:center;
  justify-content:center;gap:4px;min-height:34px;padding:4px 7px;
  border:1px solid var(--linie);background:var(--karte);
  box-sizing:border-box;cursor:pointer}
.buehne.m3.gitter .qzeile.oben{border-radius:7px 7px 0 0;
  border-bottom-width:1.6px;border-bottom-color:var(--tinte)}
.buehne.m3.gitter .qzeile.unten{border-radius:0 0 7px 7px;border-top:none}
/* Das aktive Feld. Es sagt, wohin ein angetipptes Kaertchen geht -
   ohne diese Marke waere Antippen blindes Raten. */
.buehne.m3.gitter .qzeile.aktiv{border-color:var(--akzent);
  box-shadow:inset 0 0 0 1px var(--akzent)}
/* Wohin ein gezogenes Kaertchen faellt. */
.buehne.m3.gitter .qzeile.ueber{background:color-mix(in srgb,
  var(--akzent) 10%, var(--karte))}

/* Das Minikaertchen. Die Farben sind DIESELBEN wie bei <fb> und <fz>
   links - das ist der ganze Punkt: Wer a legt, legt Violett, und
   sieht bei der Multiplikation oben zweimal Violett liegen. */
.mk{font-family:var(--druck);font-style:italic;font-size:15px;
  line-height:1.15;padding:3px 8px;border-radius:4px;
  border:1px solid rgba(0,0,0,.14);background:var(--karte);
  color:var(--tinte);user-select:none;touch-action:none;
  display:inline-block;white-space:nowrap}
.mk.r1{background:#CCB3D2}
.mk.r2{background:#F0CEAC}
/* Ein Rechenzeichen traegt keine Rolle und bekommt deshalb keine
   Farbe. Aufrecht statt kursiv, wie im Satz links. */
.mk.r0{font-style:normal;background:var(--karte)}
.e3vorrat .mk{cursor:grab}
.qzeile .mk{cursor:pointer}
/* Das Kaertchen am Finger. position:fixed, weil die Etappe in einem
   scrollbaren Gitter sitzt - absolut gesetzt wuerde es mitscrollen. */
.mk.zieht{position:fixed;z-index:60;pointer-events:none;
  transform:translate(-50%,-50%) rotate(-2deg) scale(1.12);
  box-shadow:0 5px 14px rgba(0,0,0,.22)}

/* Der Vorrat. Er gilt fuer alle vier Zeilen - vier eigene Vorraete
   waeren viermal dasselbe.

   Er sitzt IM Gitter, ueber der Fusszeile. Daneben gesetzt legte er
   sich ueber die letzte Fusszeile - die Buehne fuellt ihren Platz
   aus, und was danach kommt, hat keinen mehr. Gesehen am 2026-09-20
   im Browser; im Quelltext ist so etwas nicht zu erkennen. */
.buehne.m3.gitter .e3vorrat{grid-column:1 / -1;display:flex;
  flex-wrap:wrap;align-items:center;gap:7px;padding:9px 14px;
  margin:14px 4px 0;border:1px solid var(--linie);
  border-radius:9px;background:var(--creme)}
.buehne.m3.gitter .e3vorrat .was{font-size:13px;color:var(--matt);
  margin-right:4px}
.buehne.m3.gitter .fuss{grid-column:1 / -1;padding:12px 4px 0;
  color:var(--matt);font-size:13.5px;line-height:1.5}
.buehne.m3 .nachsatz{color:var(--matt);font-size:13.5px;padding:10px 16px 0;
  line-height:1.5}
m{font-family:var(--druck);font-style:italic;white-space:nowrap}
m sub,m sup{font-style:normal}
fb,fz{font-style:italic;border-radius:3px;padding:0 3px;margin:0 1px;
  display:inline-block}
fb{background:#CCB3D2}
fz{background:#F0CEAC}
bruch{display:inline-flex;flex-direction:column;vertical-align:middle;
  text-align:center;margin:0 3px}
bruch o{border-bottom:1.3px solid currentColor;padding:0 4px 1px}
bruch u{padding:1px 4px 0}
`;

function e3StilSetzen(){
  if (document.getElementById('m3stil')) return;
  const t = document.createElement('style');
  t.id = 'm3stil'; t.textContent = E3STIL;
  document.head.appendChild(t);
}

function etappe3(){
  e3StilSetzen();
  // Etappe 3 schickt nichts ueber die gemeinsame Leitung - es gibt
  // nichts zu bewegen, und das Getippte ist eine eigene Notiz, kein
  // Sortierstand. Die Zusatzleitung aus Etappe 2 muss trotzdem weg,
  // sonst meldet sie hier weiter.
  window.KASPER_GEMEINSAM_ZUSATZ = null;
  const E = D.e3, a = D.etappen[2];
  const b = document.getElementById('buehne');
  window._nachAblegen = null;

  // Das Gelegte ueberlebt den Etappenwechsel. Ohne das waere es beim
  // Zurueckblaettern weg - und niemand legt zweimal.
  //
  // GEAENDERT (2026-09-20, Rikes Idee): `stand.e3text` hiess der alte
  // Speicher, als hier noch getippt wurde. Er bleibt unangetastet
  // stehen - wer die Seite offen hatte und zurueckkommt, verliert
  // seine getippten Zeilen nicht stillschweigend. Gelesen wird er
  // nicht mehr.
  if (!stand.e3karten) stand.e3karten = {};

  const VORRAT = E.vorrat || [];
  const ROLLE = {};
  VORRAT.forEach(k => { ROLLE[k.t] = k.rolle; });

  /* Ein Fach ist eine Zeile eines Bruchs: `o` Zaehler, `u` Nenner.
     Beide starten LEER. Rike am 2026-09-20 zum Geruest: «das ist ja
     gerade der Clou, dass sie das selber sich ueberlegen sollen.» */
  function fach(name, teil){
    if (!stand.e3karten[name]) stand.e3karten[name] = {o:[], u:[]};
    return stand.e3karten[name][teil];
  }

  const mkHtml = (t) =>
    `<span class="mk r${ROLLE[t] || 0}" data-t="${t}">${t}</span>`;

  /* EIN Gitter statt zwei Haelften. Der Regelname steht links und
     traegt beide Spalten, damit «Addition» im Skript und «Addition»
     bei den rationalen Zahlen auf derselben Linie liegen. */
  /* GEAENDERT (2026-09-09, Rikes Rueckmeldung): Hier stand EIN Feld
     fuer die ganze rechte Seite, in das man `(ad+bc)/(bd)` tippen
     musste. Rike: «Waere es wichtig, dass da nicht nur ein Feld ist,
     was man reintippt, sondern dass man dort dann eher den Zaehler
     einzeln hat und den Nenner einzeln hat.»

     Der Grund ist nicht Bequemlichkeit. Ein Bruch mit Bruchstrich
     ZWINGT zur Frage «was steht unten?» - und der Hauptnenner ist
     genau die Stelle, an der der auskommentierte Entwurf im Skript
     falsch abbiegt. Ein Textfeld mit Schraegstrich laesst sie
     umgehen.

     GEAENDERT (2026-09-20, Rikes Idee): Aus den zwei Eingabefeldern
     sind zwei Ablagen geworden. Getippt wird nicht mehr, gelegt
     schon - siehe E3_VORRAT in thema.py. */
  const zeilen = E.regeln.map((r, i) => {
    const q = (E.regeln_q && E.regeln_q[i]) || {vorgabe:''};
    const ablage = (teil, wie, was) =>
      `<div class="qzeile ${wie}" data-regel="${r.name}" data-teil="${teil}"
            role="group" aria-label="${was} der Regel für ${r.name}"
       >${fach(r.name, teil).map(mkHtml).join('')}</div>`;
    return `<div class="zeilenname">${r.name}</div>
      <div class="zelle cSpalte">${r.term}</div>
      <div class="zelle qSpalte"><div class="qfeld">
        <span class="vorgabe">${q.vorgabe}</span>
        <span class="qbruch">
          ${ablage('o', 'oben', 'Zähler')}
          ${ablage('u', 'unten', 'Nenner')}
        </span>
      </div></div>`;
  }).join('');

  b.innerHTML = `
    <div class="auftrag"><span class="rang">${a.rang}</span>
      <span class="titel">Etappe 3 · Rechengesetze</span>
      <span class="text">${a.auftrag}<span class="regeltext"
        >${E.frage}</span></span></div>
    <div class="buehne m3 gitter">
      <div></div>
      <div class="kopf links">So steht es im Skript — ${E.kopf}, ${E.titel}</div>
      <div class="kopf rechts">Und bei den rationalen Zahlen?</div>
      <div></div>
      <div class="lagezelle cSpalte">${E.lage}</div>
      <div class="lagezelle qSpalte">${E.lage_q}</div>
      ${zeilen}
      <div class="e3vorrat"><span class="was">Zum Legen:</span>
        ${VORRAT.map(k => mkHtml(k.t)).join('')}</div>
      <div class="fuss">${E.nachsatz}<br>${E.bemerkung}</div>
    </div>
    <div class="leiste">
      <button class="knopf leer" id="zurueck3"
              title="Alle vier Zeilen leeren">↺</button>
    </div>`;

  /* ---------- Das aktive Feld ----------
     Es sagt, wohin ein ANGETIPPTES Kaertchen geht. Ohne diese Marke
     waere Antippen blindes Raten - und Antippen ist der Weg, der auf
     einem Tablet immer funktioniert, auch wenn das Ziehen hakt. */
  let aktiv = null;
  function aktivSetzen(el){
    b.querySelectorAll('.qzeile.aktiv').forEach(x => x.classList.remove('aktiv'));
    aktiv = el || null;
    if (aktiv) aktiv.classList.add('aktiv');
  }

  function zeichne(zeile){
    zeile.innerHTML = fach(zeile.dataset.regel, zeile.dataset.teil)
      .map(mkHtml).join('');
  }

  /* An welche Stelle faellt ein Kaertchen? Nach der Mitte der schon
     liegenden - wer links von der Mitte des dritten loslaesst, will
     davor. So laesst sich eine Zeile auch nachtraeglich noch
     richtigstellen, ohne sie zu leeren. */
  function stelle(zeile, x){
    const ks = [...zeile.querySelectorAll('.mk')];
    for (let j = 0; j < ks.length; j++){
      const r = ks[j].getBoundingClientRect();
      if (x < r.left + r.width / 2) return j;
    }
    return ks.length;
  }

  /* ---------- Ziehen und Antippen ----------
     Ein Zeiger-Ereignis, zwei Ausgaenge: Wer loslaesst, ohne den
     Finger bewegt zu haben, hat ANGETIPPT; wer bewegt hat, hat
     GEZOGEN. Die Schwelle von 4 Pixeln ist noetig, weil ein Finger
     nie ganz stillsteht - ohne sie waere jedes Antippen ein Zug.

     Die Ereignisse haengen an der Buehne, nicht an den Kaertchen: Die
     Zeilen werden nach jedem Legen neu gezeichnet, und Handler an
     einzelnen Kaertchen waeren danach weg.

     FEHLERBEHOBEN (2026-09-20, Rikes Befund): «Wenn ich ein Feld
     antippe und dann ein Kaertchen, dann kommen gleich 6 a's
     beispielsweise hin. Das ist nicht der Sinn.»

     URSACHE: Die Buehne ist ein BESTEHENDES Element und ueberlebt den
     Etappenwechsel - `etappe3()` laeuft aber bei jedem Oeffnen neu.
     Also kam bei jedem Oeffnen ein weiteres Handler-Paar dazu, und
     beim n-ten Oeffnen legte ein Antippen n Kaertchen. Gemessen:
     1, 3, 5, 7 Kaertchen bei 1, 2, 3, 4 Oeffnungen.

     Dazu ein zweites Symptom: Jede Instanz hat ihre EIGENE Closure
     und damit ihr eigenes `aktiv`. Eine alte Instanz legte in ein
     Feld, das niemand angetippt hatte.

     Der Kommentar oben war richtig und trotzdem die Falle: Er
     begruendet, warum die Handler an die Buehne gehoeren, und laesst
     die Gegenprobe aus - ob die Buehne sie zwischen zwei Aufrufen
     BEHAELT. Ein Grund, der stimmt, ersetzt die Probe nicht.

     Deshalb: Die Handler stehen in einem Buendel, das am Element
     haengt, und werden vor dem Binden abgemeldet. Neu gebaut werden
     sie bei jedem Aufruf trotzdem - so sehen sie immer das aktuelle
     `aktiv` und `zieh`, statt ein eingefrorenes von frueher. */
  const SCHWELLE = 4;
  let zieh = null;

  // Erst abmelden, was von einem frueheren Oeffnen noch haengt.
  if (b._e3zeiger){
    Object.keys(b._e3zeiger).forEach(
      art => b.removeEventListener(art, b._e3zeiger[art]));
  }
  const ZEIGER = {};

  ZEIGER.pointerdown = ((ev) => {
    const karte = ev.target.closest('.mk');
    const zeile = ev.target.closest('.qzeile');
    if (!karte){
      if (zeile) aktivSetzen(zeile);
      return;
    }
    zieh = {
      t: karte.dataset.t,
      // Woher kommt das Kaertchen? Aus dem Vorrat kommt eine KOPIE -
      // der Vorrat ist unbegrenzt. Die Addition braucht b und d je
      // zweimal; ein Vorrat, der sich leert, waere ein Hinweis auf
      // die Loesung, und ein falscher dazu.
      quelle: zeile || null,
      stelle: zeile ? [...zeile.querySelectorAll('.mk')].indexOf(karte) : -1,
      x0: ev.clientX, y0: ev.clientY, klon: null,
    };
    b.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });

  ZEIGER.pointermove = ((ev) => {
    if (!zieh) return;
    if (!zieh.klon){
      if (Math.hypot(ev.clientX - zieh.x0, ev.clientY - zieh.y0) < SCHWELLE)
        return;
      zieh.klon = document.createElement('span');
      zieh.klon.className = 'mk zieht r' + (ROLLE[zieh.t] || 0);
      zieh.klon.textContent = zieh.t;
      document.body.appendChild(zieh.klon);
    }
    zieh.klon.style.left = ev.clientX + 'px';
    zieh.klon.style.top = ev.clientY + 'px';
    const ziel = document.elementFromPoint(ev.clientX, ev.clientY);
    const zeile = ziel && ziel.closest ? ziel.closest('.qzeile') : null;
    b.querySelectorAll('.qzeile.ueber').forEach(x => x.classList.remove('ueber'));
    if (zeile) zeile.classList.add('ueber');
  });

  ZEIGER.pointerup = ((ev) => {
    if (!zieh) return;
    const z = zieh;
    zieh = null;
    b.querySelectorAll('.qzeile.ueber').forEach(x => x.classList.remove('ueber'));

    // ANGETIPPT - nie bewegt worden.
    if (!z.klon){
      if (z.quelle){
        // Ein gelegtes Kaertchen antippen nimmt es weg. Das ist der
        // Rueckweg; ohne ihn bliebe nur «alles leeren».
        fach(z.quelle.dataset.regel, z.quelle.dataset.teil).splice(z.stelle, 1);
        zeichne(z.quelle);
        aktivSetzen(z.quelle);
      } else if (aktiv){
        fach(aktiv.dataset.regel, aktiv.dataset.teil).push(z.t);
        zeichne(aktiv);
      }
      return;
    }

    // GEZOGEN.
    z.klon.remove();
    const ziel = document.elementFromPoint(ev.clientX, ev.clientY);
    const zeile = ziel && ziel.closest ? ziel.closest('.qzeile') : null;
    let stl = zeile ? stelle(zeile, ev.clientX) : -1;

    if (z.quelle){
      // Aus einer Zeile herausgezogen: Wer NEBEN die Zeilen loslaesst,
      // legt das Kaertchen zurueck in den Vorrat - es verschwindet.
      fach(z.quelle.dataset.regel, z.quelle.dataset.teil).splice(z.stelle, 1);
      if (zeile === z.quelle && stl > z.stelle) stl--;
      zeichne(z.quelle);
    }
    if (zeile){
      fach(zeile.dataset.regel, zeile.dataset.teil).splice(stl, 0, z.t);
      zeichne(zeile);
      aktivSetzen(zeile);
    }
  });

  ZEIGER.pointercancel = (() => {
    if (zieh && zieh.klon) zieh.klon.remove();
    zieh = null;
    b.querySelectorAll('.qzeile.ueber').forEach(x => x.classList.remove('ueber'));
  });

  Object.keys(ZEIGER).forEach(art => b.addEventListener(art, ZEIGER[art]));
  b._e3zeiger = ZEIGER;

  document.getElementById('zurueck3').onclick = () => {
    stand.e3karten = {};
    etappe3();
  };

  _leisteChrome(b);
}

ETAPPEN.push(etappe3);


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
  const raumname = (nr) => (D.raum_vorsatz || 'raum') + '-g' + nr;

  function gruppeGewaehlt(nr){
    const u = new URL(location.href);
    u.searchParams.set('raum', raumname(nr));
    history.replaceState(null, '', u);
    if (window.KASPER_GEMEINSAM_START) KASPER_GEMEINSAM_START(raumname(nr));
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

/* ───────── 5 · Ein Bild von JEDER Etappe ─────────

   Rikes Auftrag vom 2026-09-08: «Die Studierenden sollen am Ende ein
   Bild der fertigen Sortierflaeche aller drei Etappen mitnehmen.» In
   thema.md stand dazu seit dem 2026-09-08 ein PRUEFEN, und am
   2026-09-09 habe ich es am Bildschirm bestaetigt: Der
   Mitnehmen-Bildschirm listete nur «Etappe 1».

   URSACHE: `bildSammeln()` im Kern steigt aus, wenn auf der Buehne
   keine Kaertchen liegen (`.buehne .k`), und `standAlsLeinwand()`
   zeichnet Karten und Felder. Etappe 2 ist ein SVG mit Zeigern,
   Etappe 3 eine Tabelle mit Eingabefeldern - von beidem entsteht so
   kein Bild.

   Seit die Loesungen am Ausgang liegen, ist der Mitnehmen-Bildschirm
   die Stelle, an der alles zusammenkommt. Dass er zwei von drei
   Etappen nicht zeigt, faellt dort auf.

   WARUM HIER UND NICHT IM KERN: Die Sammlung des Kerns liegt in einem
   `const mitbringsel` auf oberster Ebene - das ist KEINE Eigenschaft
   von `window` und von aussen nicht beschreibbar. Also uebernimmt
   diese Datei das Sammeln und den Schlussbildschirm ganz. Benutzt
   werden dabei die Bausteine des Kerns (`standAlsLeinwand`,
   `_herunterladen`, `SORT_PAKET`) - nachgebaut wird nichts.

   Jeder Schritt ist einzeln abgesichert: Faellt ein Bild aus, fehlt
   dieses eine Bild - der Bildschirm bleibt benutzbar. */
(function(){
  if (!D.mitnehmen) return;

  const bilder = {};          // Etappennummer -> Leinwand
  let sichtbar = null;        // welche Etappe steht gerade da

  const NAME = (D.stueck || 'sortierung')
    .replace(/[^0-9A-Za-zÄÖÜäöü]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

  /* ---- SVG zu Leinwand ----
     Der Haken: Die Zeichnung faerbt mit `var(--linie)` und Genossen.
     Ein herausgeloestes SVG kennt diese Werte nicht mehr - es waere
     schwarz oder unsichtbar. Deshalb wird jede Farbe am LEBENDEN
     Element ausgerechnet und in die Kopie geschrieben. */
  function svgLeinwand(svg, breite){
    const klon = svg.cloneNode(true);
    const a = svg.querySelectorAll('*'), b = klon.querySelectorAll('*');
    for (let i = 0; i < a.length; i++){
      const c = getComputedStyle(a[i]);
      ['fill', 'stroke'].forEach(w => {
        const v = c.getPropertyValue(w);
        if (v && v !== 'none') b[i].setAttribute(w, v);
      });
      const sw = c.getPropertyValue('stroke-width');
      if (sw) b[i].setAttribute('stroke-width', sw);
    }
    klon.setAttribute('width', breite);
    const kasten = svg.viewBox && svg.viewBox.baseVal;
    const hoehe = kasten && kasten.width
      ? Math.round(breite * kasten.height / kasten.width) : breite;
    klon.setAttribute('height', hoehe);
    const text = new XMLSerializer().serializeToString(klon);
    return {text, breite, hoehe};
  }

  function alsBild(teil){
    return new Promise((fertig, schade) => {
      const i = new Image();
      i.onload = () => fertig(i);
      i.onerror = schade;
      i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(teil.text);
    });
  }

  /* Etappe 2: die beiden Bilder nebeneinander, mit ihren Namen. */
  async function etappe2Leinwand(){
    const haelften = [...document.querySelectorAll('.buehne.m2 > .haelfte')];
    const svgs = haelften.map(h => h.querySelector('svg')).filter(Boolean);
    if (!svgs.length) return null;
    const B = 620, luft = 24, kopf = 34;
    const teile = svgs.map(s => svgLeinwand(s, B));
    const bilderr = await Promise.all(teile.map(alsBild));
    const hoehe = Math.max(...teile.map(t => t.hoehe));
    const c = document.createElement('canvas');
    c.width = teile.length * B + (teile.length + 1) * luft;
    c.height = hoehe + kopf + 2 * luft;
    const g = c.getContext('2d');
    g.fillStyle = getComputedStyle(document.body)
      .getPropertyValue('--papier').trim() || '#F4F0E9';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = getComputedStyle(document.body)
      .getPropertyValue('--tinte').trim() || '#2b2622';
    g.font = '600 17px system-ui, sans-serif';
    bilderr.forEach((b, i) => {
      const x = luft + i * (B + luft);
      const marke = haelften[i].querySelector('.marke');
      g.fillText(marke ? marke.textContent : '', x, luft + 18);
      g.drawImage(b, x, luft + kopf, B, teile[i].hoehe);
    });
    return c;
  }

  /* Etappe 3: die vier selbst aufgestellten Regeln. Kein Bild der Seite -
     die Seite ist der Skriptauszug, den die Studierenden schon haben.
     Was sie NICHT haben, ist das, was sie selbst gelegt haben.

     FEHLERBEHOBEN (2026-09-20): Diese Funktion las `stand.e3text` - den
     Speicher von FRUEHER, als hier noch getippt wurde. Seit dem Umbau
     auf Minikaertchen fuellt ihn niemand mehr. Sie haette also brav
     `null` zurueckgegeben, und Etappe 3 waere aus dem Bild zum
     Mitnehmen VERSCHWUNDEN - ohne Fehlermeldung, ohne leere Zeile,
     ohne irgendein Zeichen. Genau der stumme Ausfall, vor dem das
     Projekt sich schon zweimal selbst gewarnt hat.

     URSACHE: Ich habe beim Umbau die Etappe angefasst und alles
     gesucht, was `qeingabe` heisst - aber nicht, was ihren Inhalt
     WEITERVERWENDET. Der Mitnehmen-Teil steht 600 Zeilen weiter unten
     unter den Anbauten und nennt die Eingabefelder nie.

     Die Kaertchen werden GEZEICHNET, nicht als Text gesetzt: Die Farbe
     ist der ganze Punkt der Etappe, und ein Bild zum Mitnehmen, auf
     dem sie fehlt, nimmt das Wichtigste nicht mit. */
  function etappe3Leinwand(){
    const karten = stand.e3karten || {};
    const namen = (D.e3.regeln || []).map(r => r.name);
    const ROLLE = {};
    (D.e3.vorrat || []).forEach(k => { ROLLE[k.t] = k.rolle; });
    const MKFARBE = {1: '#CCB3D2', 2: '#F0CEAC', 0: '#FFFEFB'};
    const gefuellt = n => {
      const v = karten[n]; if (!v) return false;
      return (v.o || []).length + (v.u || []).length > 0;
    };
    if (!namen.some(gefuellt)) return null;                      // nichts gelegt

    /* Eine Reihe Kaertchen, mittig um `mitte`. Gibt die Breite zurueck,
       damit der Bruchstrich darunter passt. */
    const reihe = (g, ks, mitte, y, nurMessen) => {
      const H = 24, LUFT = 5;
      g.font = 'italic 17px ui-monospace, monospace';
      const br = ks.map(t => Math.max(g.measureText(t).width + 16, 26));
      const gesamt = br.reduce((a, b) => a + b, 0) + LUFT * Math.max(ks.length - 1, 0);
      if (nurMessen) return gesamt;
      let x = mitte - gesamt / 2;
      ks.forEach((t, i) => {
        g.fillStyle = MKFARBE[ROLLE[t] || 0];
        g.beginPath();
        g.roundRect(x, y - H / 2, br[i], H, 4);
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1; g.stroke();
        g.fillStyle = '#2b2622';
        g.font = (ROLLE[t] ? 'italic ' : '') + '17px ui-monospace, monospace';
        g.textAlign = 'center';
        g.fillText(t, x + br[i] / 2, y + 6);
        x += br[i] + LUFT;
      });
      g.textAlign = 'left';
      return gesamt;
    };
    const c = document.createElement('canvas');
    // 74 statt 62 je Zeile: Ein Kaertchen ist hoeher als eine
    // Textzeile, und zwei uebereinander brauchen den Platz.
    c.width = 900; c.height = 96 + namen.length * 74 + 24;
    const g = c.getContext('2d');
    const farbe = (w, ersatz) => getComputedStyle(document.body)
      .getPropertyValue(w).trim() || ersatz;
    g.fillStyle = farbe('--papier', '#F4F0E9');
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = farbe('--akzent', '#0065A9');
    g.font = '600 21px system-ui, sans-serif';
    g.fillText('Etappe 3 · Meine Regeln für die rationalen Zahlen', 30, 44);
    g.strokeStyle = farbe('--linie', '#d8d0c4');
    g.beginPath(); g.moveTo(30, 62); g.lineTo(c.width - 30, 62); g.stroke();
    /* GEAENDERT (2026-09-09): Getippt wird jetzt Zaehler UND Nenner.
       Sie werden auch als Bruch gezeichnet, nicht als «a/b» - das
       Bild soll aussehen wie das, was auf dem Schirm stand. */
    namen.forEach((n, i) => {
      const y = 112 + i * 74;
      g.fillStyle = farbe('--tinte', '#2b2622');
      g.font = '600 16px system-ui, sans-serif';
      g.fillText(n, 30, y);

      /* Die Regel selbst dazu, sonst steht auf dem Bild nur ein Bruch
         ohne Aussage. Die Tiefstellung wird nicht nachgebaut - «q1»
         genuegt fuer eine Notiz. */
      const ZEICHEN = {Addition:'+', Subtraktion:'−',
                       Multiplikation:'·', Division:':'};
      g.font = '16px ui-monospace, monospace';
      g.fillStyle = farbe('--matt', '#8a8175');
      g.fillText('q1 ' + (ZEICHEN[n] || '') + ' q2  =', 210, y + 4);

      const v = karten[n] || {};
      const o = v.o || [], u = v.u || [];
      if (!o.length && !u.length){
        g.font = '17px ui-monospace, monospace';
        g.fillStyle = farbe('--matt', '#8a8175');
        g.fillText('— nichts gelegt —', 340, y + 4);
      } else {
        const breite = Math.max(reihe(g, o, 0, 0, true),
                                reihe(g, u, 0, 0, true), 40);
        const mitte = 350 + breite / 2;
        reihe(g, o, mitte, y - 12);
        reihe(g, u, mitte, y + 18);
        g.strokeStyle = farbe('--tinte', '#2b2622');
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(mitte - breite / 2 - 6, y + 3);
        g.lineTo(mitte + breite / 2 + 6, y + 3);
        g.stroke();
        g.lineWidth = 1;
      }
      g.strokeStyle = farbe('--linie', '#d8d0c4');
      g.beginPath(); g.moveTo(30, y + 42); g.lineTo(c.width - 30, y + 42); g.stroke();
    });
    return c;
  }

  /* ---- Sammeln ----
     Ersetzt `bildSammeln()` des Kerns. `los()` und `nav()` rufen den
     Namen, nicht die Funktion - sie finden also diese hier. */
  window.bildSammeln = function(){
    if (sichtbar === null) return;
    const nr = sichtbar + 1;
    try {
      if (nr === 2){
        const p = etappe2Leinwand();
        if (p) bilder[2] = p;                 // ein Versprechen, wie im Kern
      } else if (nr === 3){
        const c = etappe3Leinwand();
        if (c) bilder[3] = Promise.resolve(c);
      } else if (document.querySelector('.buehne .k')){
        bilder[nr] = Promise.resolve(standAlsLeinwand());
      }
    } catch(e){ /* ein Bild fehlt, der Bildschirm bleibt heil */ }
  };

  /* `los()` merkt sich im Kern in `_gezeigt`, welche Etappe steht -
     auch das ein `let` auf oberster Ebene, also von hier nicht lesbar.
     Wir fuehren es selbst mit. */
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

    const b = document.getElementById('buehne');
    b.innerHTML = `<div class="start">
      <h2>Nehmen Sie Ihre Arbeit mit</h2>
      <p class="lage">Von ${nummern.length === 1 ? 'einer Etappe' :
        'jeder der ' + nummern.length + ' Etappen'} ist ein Bild entstanden —
        so, wie Sie am Ende gearbeitet haben. Für Ihre Notizen.</p>
      <p class="frage">${nummern.map(n => 'Etappe ' + n).join(' · ')}</p>
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
          dateien.push({name: 'etappe-' + f.nr + '.png',
                        daten: await P.zuBytes(f.blob)});
        _herunterladen(P.zip(dateien), NAME + '_bilder.zip');
      } else {
        for (const f of fertige)
          _herunterladen(f.blob, NAME + '_etappe-' + f.nr + '.png');
      }
      knopf.disabled = false;
      knopf.textContent = fertige.length
        ? 'Gespeichert ✓ — nochmals speichern' : 'Kein Bild entstanden';
    };
  };
})();
