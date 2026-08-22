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
