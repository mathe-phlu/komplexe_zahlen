/* ============================================================
   PIA - Zahlen lesen, schreiben, vergleichen

   Der Baustein, auf dem alles steht. Moodle hat Antworten als
   Zeichenketten verglichen; hier wird gerechnet.

   Drei Toleranzregeln, siehe pruefungen/TOLERANZEN.md:
     1  gerechnet   0,01 absolut oder 0,5 % relativ, was groesser ist
     2  Winkel      1 Grad, nach zyklischer Normalisierung
     3  abgelesen   halber Rasterschritt je Komponente
   ============================================================ */
(function(){
'use strict';

/* ---------- Komplexe Zahlen als schlichtes Paar ---------- */
function K(re, im){ return { re: re, im: im === undefined ? 0 : im }; }
const plus  = (a,b) => K(a.re+b.re, a.im+b.im);
const minus = (a,b) => K(a.re-b.re, a.im-b.im);
const mal   = (a,b) => K(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
function durch(a,b){
  const n = b.re*b.re + b.im*b.im;
  if (n === 0) return null;
  return K((a.re*b.re + a.im*b.im)/n, (a.im*b.re - a.re*b.im)/n);
}
const betrag = a => Math.hypot(a.re, a.im);
const arg    = a => Math.atan2(a.im, a.re);

function expK(a){                       // e hoch a
  const m = Math.exp(a.re);
  return K(m*Math.cos(a.im), m*Math.sin(a.im));
}
function lnK(a){                        // Hauptwert
  if (a.re === 0 && a.im === 0) return null;
  return K(Math.log(betrag(a)), arg(a));
}
function hochK(a, b){                   // Hauptwert von a^b
  if (a.re === 0 && a.im === 0) return (b.re === 0 && b.im === 0) ? K(1) : K(0);
  return expK(mal(b, lnK(a)));
}

/* ============================================================
   Lesen

   Ein kleiner Ausdrucksrechner statt einer Liste erlaubter
   Schreibweisen. Damit fallen alle Formen auf einmal an:

     3+4i     3 + 4*i     -i        2i
     7/13     0.538       0.54
     pi/4     π/4         0.785
     0.5·(√3 + i)         2·cis(30°)
     5∠30°    e^(0.5i)    sqrt(2)/2

   Implizite Multiplikation ist erlaubt: 3i, 2π, 0.5√3.
   ============================================================ */

const ZIFFER = c => c >= '0' && c <= '9';
const BUCHSTABE = c => /[a-zA-Zπ√]/.test(c);

function zerlegen(s){
  const t = [];
  let i = 0;
  s = String(s)
        .replace(/ /g, ' ')        // geschuetztes Leerzeichen
        .replace(/,(\d)/g, '.$1')       // Dezimalkomma
        .trim();
  while (i < s.length){
    const c = s[i];
    if (c === ' '){ i++; continue; }
    if (ZIFFER(c) || (c === '.' && ZIFFER(s[i+1]))){
      let j = i;
      while (j < s.length && (ZIFFER(s[j]) || s[j] === '.')) j++;
      t.push({ art: 'zahl', wert: parseFloat(s.slice(i, j)) });
      i = j; continue;
    }
    if (BUCHSTABE(c)){
      let j = i;
      while (j < s.length && BUCHSTABE(s[j])) j++;
      t.push({ art: 'wort', wert: s.slice(i, j) });
      i = j; continue;
    }
    if ('+-*·×/÷^()°'.indexOf(c) >= 0){
      // Vereinheitlichen, damit der Rechner nur drei Zeichen kennt
      const z = c === '·' || c === '×' ? '*' : c === '÷' ? '/' : c;
      t.push({ art: 'zeichen', wert: z });
      i++; continue;
    }
    return null;                        // unbekanntes Zeichen: nicht lesbar
  }
  return t;
}

function rechne(t){
  let p = 0;
  const schau = () => t[p];
  const nimm = () => t[p++];

  function ausdruck(){
    let a = summand();
    if (a === null) return null;
    while (schau() && schau().art === 'zeichen' &&
           (schau().wert === '+' || schau().wert === '-')){
      const op = nimm().wert;
      const b = summand();
      if (b === null) return null;
      a = op === '+' ? plus(a,b) : minus(a,b);
    }
    return a;
  }

  function summand(){
    let a = potenz();
    if (a === null) return null;
    for(;;){
      const s = schau();
      if (!s) break;
      if (s.art === 'zeichen' && (s.wert === '*' || s.wert === '/')){
        nimm();
        const b = potenz();
        if (b === null) return null;
        if (s.wert === '*') a = mal(a,b);
        else { const q = durch(a,b); if (q === null) return null; a = q; }
        continue;
      }
      // implizite Multiplikation: 3i, 2π, 0.5(1+i)
      if (s.art === 'zahl' || s.art === 'wort' ||
          (s.art === 'zeichen' && s.wert === '(')){
        const b = potenz();
        if (b === null) return null;
        a = mal(a,b);
        continue;
      }
      break;
    }
    return a;
  }

  function potenz(){
    const a = vorzeichen();
    if (a === null) return null;
    const s = schau();
    if (s && s.art === 'zeichen' && s.wert === '^'){
      nimm();
      const b = potenz();               // rechtsassoziativ
      if (b === null) return null;
      return hochK(a, b);
    }
    return a;
  }

  function vorzeichen(){
    const s = schau();
    if (s && s.art === 'zeichen' && (s.wert === '-' || s.wert === '+')){
      nimm();
      const a = vorzeichen();
      if (a === null) return null;
      return s.wert === '-' ? K(-a.re, -a.im) : a;
    }
    return grundwert();
  }

  function grad(a){                     // Gradzeichen dahinter?
    const s = schau();
    if (s && s.art === 'zeichen' && s.wert === '°'){
      nimm();
      return mal(a, K(Math.PI/180));
    }
    return a;
  }

  function grundwert(){
    const s = nimm();
    if (!s) return null;

    if (s.art === 'zahl') return grad(K(s.wert));

    if (s.art === 'zeichen' && s.wert === '('){
      const a = ausdruck();
      if (a === null) return null;
      const z = nimm();
      if (!z || z.art !== 'zeichen' || z.wert !== ')') return null;
      return grad(a);
    }

    if (s.art === 'wort'){
      const w = s.wert.toLowerCase();

      if (w === 'i' || w === 'j') return K(0,1);
      if (w === 'e') return K(Math.E);
      if (w === 'pi' || w === 'π') return K(Math.PI);

      // Funktionen; √ und sqrt duerfen ohne Klammer stehen
      if (w === 'cis' || w === 'sqrt' || w === '√' || w === 'exp' ||
          w === 'ln' || w === 'log'){
        // √ darf ohne Klammer stehen: √2
        let a;
        const n = schau();
        if (n && n.art === 'zeichen' && n.wert === '('){
          nimm();
          a = ausdruck();
          if (a === null) return null;
          const z = nimm();
          if (!z || z.art !== 'zeichen' || z.wert !== ')') return null;
        } else if (w === '√' || w === 'sqrt'){
          a = grundwert();
          if (a === null) return null;
        } else return null;

        if (w === 'cis') return grad(expK(K(0, a.re)));
        if (w === 'exp') return grad(expK(a));
        if (w === 'ln' || w === 'log'){
          const l = lnK(a);
          return l === null ? null : grad(l);
        }
        return grad(hochK(a, K(0.5)));
      }

      return null;
    }
    return null;
  }

  const ergebnis = ausdruck();
  if (ergebnis === null) return null;
  if (p !== t.length) return null;       // Rest nicht gelesen: nicht lesbar
  return ergebnis;
}

/* ---------- Die eine Lesefunktion ---------- */
function lies(text){
  if (text === null || text === undefined) return null;
  const s = String(text).trim();
  if (!s) return null;
  // 5∠30° -> 5*cis(30°); die Klammer ergaenzen wir, wenn sie fehlt
  let v = s;
  const m = v.match(/^(.*?)∠(.*)$/);
  if (m) v = '(' + m[1] + ')*cis(' + m[2] + ')';
  const t = zerlegen(v);
  if (t === null || !t.length) return null;
  const z = rechne(t);
  if (z === null) return null;
  if (!isFinite(z.re) || !isFinite(z.im)) return null;
  return z;
}

/* Reelle Zahl lesen - fuer Felder, die keine komplexe Zahl wollen */
function liesReell(text){
  const z = lies(text);
  if (z === null) return null;
  if (Math.abs(z.im) > 1e-9) return null;
  return z.re;
}

/* Winkel in Grad lesen. Ein blosses "240" ist 240 Grad, nicht 240 rad.
   Steht ein Gradzeichen dabei, aendert das nichts - es ist derselbe Wert.
   Nur wenn π vorkommt, ist Bogenmass gemeint. */
function liesWinkelGrad(text){
  if (text === null || text === undefined) return null;
  const s = String(text).trim();
  if (!s) return null;
  const imBogenmass = /π|\bpi\b/i.test(s);
  const ohneGrad = s.replace(/°/g, '');
  const z = lies(ohneGrad);
  if (z === null || Math.abs(z.im) > 1e-9) return null;
  return imBogenmass ? z.re * 180 / Math.PI : z.re;
}

/* Winkel im Bogenmass lesen - fuer den Imaginaerteil des Logarithmus.
   Dort schreibt der eine π/4, der andere 0.79. Beides gilt. */
function liesWinkelBogen(text){
  if (text === null || text === undefined) return null;
  const s = String(text).trim();
  if (!s) return null;
  if (/°/.test(s)){                      // ausdruecklich Grad
    const g = liesWinkelGrad(s);
    return g === null ? null : g * Math.PI / 180;
  }
  return liesReell(s);
}

/* ============================================================
   Vergleichen
   ============================================================ */

/* Regel 1 */
function nahe(a, b){
  if (a === null || b === null || !isFinite(a) || !isFinite(b)) return false;
  const schranke = Math.max(0.01, Math.abs(b) * 0.005);
  return Math.abs(a - b) <= schranke + 1e-12;
}

function gleich(z, soll){
  if (!z || !soll) return false;
  return nahe(z.re, soll.re) && nahe(z.im, soll.im);
}

/* Regel 2 - zyklisch, deshalb nicht ueber nahe() */
function winkelGleich(grad, sollGrad, schranke){
  if (grad === null || sollGrad === null) return false;
  if (!isFinite(grad) || !isFinite(sollGrad)) return false;
  const s = schranke === undefined ? 1 : schranke;
  let d = (grad - sollGrad) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Math.abs(d) <= s + 1e-12;
}

/* Regel 3 - je Komponente ein halber Rasterschritt */
function abgelesenGleich(z, soll, rasterschritt){
  if (!z || !soll) return false;
  const s = rasterschritt / 2 + 1e-12;
  return Math.abs(z.re - soll.re) <= s && Math.abs(z.im - soll.im) <= s;
}

/* Polarform: Betrag nach Regel 1, Winkel nach Regel 2 */
function polarGleich(r, grad, sollR, sollGrad){
  if (!nahe(r, sollR)) return false;
  // Bei Betrag 0 ist der Winkel bedeutungslos
  if (Math.abs(sollR) < 1e-9) return true;
  return winkelGleich(grad, sollGrad);
}

/* Mengenvergleich - Reihenfolge egal, jede Sollantwort genau einmal.
   Fuer die Wurzeln in Station 1 und die Zyklen in Station 3. */
function mengeGleich(eingaben, sollwerte, passt){
  if (!eingaben || eingaben.length !== sollwerte.length) return false;
  const offen = sollwerte.slice();
  for (const e of eingaben){
    let gefunden = -1;
    for (let k = 0; k < offen.length; k++){
      if (passt(e, offen[k])){ gefunden = k; break; }
    }
    if (gefunden < 0) return false;
    offen.splice(gefunden, 1);
  }
  return offen.length === 0;
}

/* ============================================================
   Mehrwertigkeit

   Der Grund, aus dem die Moodle-Fassung an Station 4 gescheitert
   ist. log(z) hat unendlich viele Werte, z^w je nach Exponent
   einen, endlich viele oder unendlich viele. Geprueft wird nicht
   gegen einen Wert, sondern gegen die ganze Schar.
   ============================================================ */

/* Ist die Eingabe irgendein Wert von log(z)?
   log(z) = ln|z| + i(arg z + 2πk), k ganz. */
function istLogarithmusWert(eingabe, z){
  if (!eingabe || !z) return false;
  const r = betrag(z);
  if (r === 0) return false;
  if (!nahe(eingabe.re, Math.log(r))) return false;
  const d = (eingabe.im - arg(z)) / (2*Math.PI);
  return Math.abs(d - Math.round(d)) * 2*Math.PI <= 0.01 + Math.abs(eingabe.im)*0.005;
}

/* Ist die Eingabe irgendein Wert von a^b?
   a^b = exp(b · (ln|a| + i(arg a + 2πk))).
   b ganzzahlig  -> genau ein Wert
   b = 1/n       -> n Werte
   b nicht reell -> unendlich viele; wir pruefen k von -40 bis 40,
                    das deckt jeden Wert ab, den jemand von Hand
                    ausrechnet. */
function istPotenzWert(eingabe, a, b){
  if (!eingabe || !a || !b) return false;
  const l = lnK(a);
  if (l === null) return false;
  for (let k = -40; k <= 40; k++){
    const zweig = K(l.re, l.im + 2*Math.PI*k);
    const w = expK(mal(b, zweig));
    if (gleich(eingabe, w)) return true;
  }
  return false;
}

/* Wie viele Werte hat a^b? Fuer die Begriffsfragen in Station 4. */
function anzahlPotenzwerte(b){
  if (Math.abs(b.im) > 1e-9) return 'unendlich';
  const n = b.re;
  if (Math.abs(n - Math.round(n)) < 1e-9) return 'einer';
  const bruch = naeherungsbruch(n);
  return bruch ? 'endlich' : 'unendlich';
}

function naeherungsbruch(x, maxNenner){
  const M = maxNenner || 50;
  for (let n = 1; n <= M; n++){
    const z = x * n;
    if (Math.abs(z - Math.round(z)) < 1e-9) return { z: Math.round(z), n: n };
  }
  return null;
}

/* ============================================================
   Schreiben - damit Aufgabentexte ueberall gleich aussehen
   ============================================================ */

function zahlText(x, stellen){
  const s = stellen === undefined ? 2 : stellen;
  if (Math.abs(x) < 5e-11) return '0';
  let t = x.toFixed(s);
  if (t.indexOf('.') >= 0) t = t.replace(/0+$/, '').replace(/\.$/, '');
  return t;
}

/* Normalform. Klammern nie vergessen - der Fehler aus Station 4
   entstand genau daran (siehe FEHLER_ALTBESTAND.md). */
function normalform(z, stellen){
  const re = zahlText(z.re, stellen), im = zahlText(z.im, stellen);
  if (im === '0') return re;
  const ibetrag = zahlText(Math.abs(z.im), stellen);
  const iteil = (ibetrag === '1' ? '' : ibetrag) + 'i';
  if (re === '0') return (z.im < 0 ? '-' : '') + iteil;
  return re + (z.im < 0 ? ' - ' : ' + ') + iteil;
}

/* Fuer Stellen, an denen die Zahl eine Potenz oder einen Faktor traegt.

   FEHLERBEHOBEN (2026-08-21): Die erste Fassung klammerte nur, wenn ein
   Vorzeichen oder ein Zwischenraum vorkam. Damit blieb 3i ungeklammert -
   und 3i^(1/2) liest sich als 3 mal i^(1/2). Genau der Fehler, den der
   Altbestand in Station 4 hat (siehe FEHLER_ALTBESTAND.md). Er ist hier
   auf demselben Weg noch einmal entstanden: durch die Frage, wann
   Klammern noetig SIND, statt durch die Frage, wann sie entbehrlich sind.

   Ursache: 3i ist ein Produkt und braucht Klammern, obwohl es weder ein
   Vorzeichen noch einen Zwischenraum enthaelt.

   Jetzt umgekehrt gedacht: geklammert wird immer. Ohne Klammern bleiben
   nur die beiden Faelle, in denen es keine geben kann - eine
   nichtnegative Zahl fuer sich, und das blosse i. Zuviel geklammert ist
   haesslich, zuwenig geklammert ist falsch. */
function normalformGeklammert(z, stellen){
  const t = normalform(z, stellen);
  if (t === 'i') return t;
  if (/^\d+(\.\d+)?$/.test(t)) return t;
  return '(' + t + ')';
}

function polarform(z, stellen){
  const r = zahlText(betrag(z), stellen);
  const g = zahlText(((arg(z) * 180/Math.PI) % 360 + 360) % 360, stellen);
  return r + ' · cis(' + g + '°)';
}

function gradAusArg(z){
  return ((arg(z) * 180/Math.PI) % 360 + 360) % 360;
}

/* ---------- nach draussen ---------- */
window.Zahl = {
  K: K, plus: plus, minus: minus, mal: mal, durch: durch,
  betrag: betrag, arg: arg, gradAusArg: gradAusArg,
  exp: expK, ln: lnK, hoch: hochK,

  lies: lies, liesReell: liesReell,
  liesWinkelGrad: liesWinkelGrad, liesWinkelBogen: liesWinkelBogen,

  nahe: nahe, gleich: gleich, winkelGleich: winkelGleich,
  abgelesenGleich: abgelesenGleich, polarGleich: polarGleich,
  mengeGleich: mengeGleich,

  istLogarithmusWert: istLogarithmusWert, istPotenzWert: istPotenzWert,
  anzahlPotenzwerte: anzahlPotenzwerte, naeherungsbruch: naeherungsbruch,

  zahlText: zahlText, normalform: normalform,
  normalformGeklammert: normalformGeklammert, polarform: polarform
};
})();
