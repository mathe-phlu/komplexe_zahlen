/* ============================================================
   PIA - Kärtchen zuordnen

   Karten links im Vorrat, Felder rechts. Wer eine Karte in ein
   Feld zieht, ordnet sie zu. Ein Klick auf eine liegende Karte
   schickt sie in den Vorrat zurück.

   HERKUNFT: Die Ziehmechanik stammt aus Kaspers `flaeche.js`
   (eingefroren in fremd/kasper/2026-08-21/). Übernommen sind vor
   allem die Stellen, die dort als FEHLERBEHOBEN dokumentiert sind
   und die man sonst alle noch einmal fände:

     - Zeiger festhalten, sonst reisst die Geste ab, sobald sie
       über ein anderes Element fährt
     - die gezogene Karte während des Ziehens an die Bühne hängen
       und `position: fixed` geben, damit sie über beide Hälften
       wandern kann
     - `pointer-events: none` auf der gezogenen Karte, sonst findet
       elementFromPoint immer sie selbst und nie das Ziel darunter
     - `ondragstart` abschalten, sonst kapert der Browser die Geste
     - die Heimatlage VOR dem Ziehen merken
     - ist das Ziel voll, lieber heimkehren als verdecken

   NICHT übernommen ist Kaspers Bühne: `buehne()`, `los()`, `nav()`
   besitzen dort die ganze Seite und hängen an den Kapiteldaten.
   Pia braucht ausserdem eine dritte Kartensorte - Kasper kennt
   Bildkarten und beschreibbare Karten, hier stehen feste Texte
   auf den Karten.
   ============================================================ */
(function(){
'use strict';

const AUF = window.Aufnahme;
let zmax = 20;

function el(tag, klasse, inhalt){
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (inhalt !== undefined) e.innerHTML = inhalt;
  return e;
}

function unterZeiger(x, y, wahl){
  const e = document.elementFromPoint(x, y);
  return e ? e.closest(wahl) : null;
}

/* ------------------------------------------------------------
   Eine Zuordnungsfläche
     o.karten  [{id, text}]        Karten mit festem Text
     o.felder  [{id, kopf, inhalt}] Ziele; inhalt darf ein Element sein
     o.fasst   wie viele Karten ein Feld nimmt (Vorgabe 1)
     o.beiAenderung(belegung)      wird nach jedem Ablegen gerufen
   ------------------------------------------------------------ */
function flaeche(o){
  const fasst = o.fasst || 1;
  const buehne = el('div', 'kartenbuehne');
  const vorrat = el('div', 'kartenvorrat');
  vorrat.appendChild(el('div', 'kartenmarke', o.vorratMarke || 'Noch zuzuordnen'));
  const vorratBlatt = el('div', 'kartenblatt');
  vorratBlatt.dataset.feld = '';
  vorrat.appendChild(vorratBlatt);

  const felderSeite = el('div', 'kartenfelder');
  const felder = {};
  o.felder.forEach(f => {
    const d = el('div', 'kartenfeld');
    d.dataset.feld = f.id;
    if (f.kopf) d.appendChild(el('div', 'kartenfeldkopf', f.kopf));
    if (f.inhalt) d.appendChild(f.inhalt);
    const ablage = el('div', 'kartenablage');
    ablage.dataset.feld = f.id;
    d.appendChild(ablage);
    felder[f.id] = ablage;
    felderSeite.appendChild(d);
  });

  buehne.appendChild(vorrat);
  buehne.appendChild(felderSeite);

  function belegung(){
    const b = {};
    o.karten.forEach(k => {
      const kel = buehne.querySelector('.kk[data-id="' + k.id + '"]');
      const ablage = kel && kel.parentElement;
      b[k.id] = (ablage && ablage.dataset.feld) ? ablage.dataset.feld : null;
    });
    return b;
  }

  function melden(kartenId, zielId){
    if (AUF && AUF.M) AUF.M.karte(kartenId, 0, 0, zielId || 'vorrat');
    if (o.beiAenderung) o.beiAenderung(belegung());
  }

  function platzFrei(ablage, ausser){
    const drin = Array.prototype.filter.call(ablage.children, k => k !== ausser);
    return drin.length < fasst;
  }

  function ziehbar(karte){
    /* Der Browser startet auf Text und Bildern ein eigenes Ziehen.
       Das kapert die Geste: Die Karte klebt am Zeiger, aber unser
       pointerup kommt nie an. */
    karte.ondragstart = () => false;

    karte.addEventListener('pointerdown', e => {
      if (e.button) return;
      e.preventDefault();
      const start = karte.getBoundingClientRect();
      const dx = e.clientX - start.left, dy = e.clientY - start.top;
      const heim = karte.parentElement;        // VOR dem Ziehen merken
      karte.classList.add('zieht');
      karte.style.width = start.width + 'px';
      try { karte.setPointerCapture(e.pointerId); } catch(_){}
      karte.style.zIndex = ++zmax;

      /* An die Buehne haengen, damit die Karte ueber beide Seiten
         wandern kann statt am Rand ihres Kastens zu enden. */
      buehne.appendChild(karte);
      karte.style.position = 'fixed';
      const setzen = ev => {
        karte.style.left = (ev.clientX - dx) + 'px';
        karte.style.top  = (ev.clientY - dy) + 'px';
      };
      setzen(e);

      const bewegen = ev => {
        setzen(ev);
        buehne.querySelectorAll('.drueber').forEach(d => d.classList.remove('drueber'));
        const ziel = unterZeiger(ev.clientX, ev.clientY, '.kartenablage,.kartenblatt');
        if (ziel && (ziel.dataset.feld === '' || platzFrei(ziel, karte)))
          ziel.classList.add('drueber');
      };
      const los = ev => {
        window.removeEventListener('pointermove', bewegen);
        window.removeEventListener('pointerup', los);
        window.removeEventListener('pointercancel', los);
        karte.classList.remove('zieht');
        karte.style.position = ''; karte.style.left = ''; karte.style.top = '';
        karte.style.width = '';
        buehne.querySelectorAll('.drueber').forEach(d => d.classList.remove('drueber'));

        let ziel = unterZeiger(ev.clientX, ev.clientY, '.kartenablage,.kartenblatt');
        /* Ist das Ziel voll, lieber heimkehren als eine Karte
           verdecken - eine verdeckte Karte gilt beim Pruefen mit,
           ohne dass jemand sie sieht. */
        if (ziel && ziel.dataset.feld !== '' && !platzFrei(ziel, karte)) ziel = null;
        (ziel || heim).appendChild(karte);
        melden(karte.dataset.id, ziel ? ziel.dataset.feld : null);
      };
      window.addEventListener('pointermove', bewegen);
      window.addEventListener('pointerup', los);
      window.addEventListener('pointercancel', los);
    });

    /* Zurueck in den Vorrat, ohne zu ziehen. Auf dem Tablet ist das
       oft der bequemere Weg. */
    karte.addEventListener('dblclick', () => {
      if (karte.parentElement === vorratBlatt) return;
      vorratBlatt.appendChild(karte);
      melden(karte.dataset.id, null);
    });
  }

  o.karten.forEach(k => {
    const karte = el('div', 'kk', k.text);
    karte.dataset.id = k.id;
    karte.title = 'Ziehen zum Zuordnen · Doppelklick legt zurück';
    ziehbar(karte);
    vorratBlatt.appendChild(karte);
  });

  /* Eine Karte ohne Zieh-Geste ablegen. Gebraucht vom Prüfstand
     `richtigkeit.html`, der eine Zuordnung setzen muss, ohne mit dem
     Zeiger zu fahren. Nimmt denselben Weg wie das Ziehen: dieselbe
     Platzprüfung, dieselbe Meldung in den Ereignisstrom.
     zielId === null legt die Karte zurück in den Vorrat. */
  function legen(kartenId, zielId){
    const karte = buehne.querySelector('.kk[data-id="' + kartenId + '"]');
    if (!karte) return false;
    const ablage = zielId === null || zielId === undefined
      ? vorratBlatt : felder[zielId];
    if (!ablage) return false;
    if (ablage !== vorratBlatt && !platzFrei(ablage, karte)) return false;
    if (karte.parentElement === ablage) return true;
    ablage.appendChild(karte);
    melden(kartenId, ablage === vorratBlatt ? null : zielId);
    return true;
  }

  return { element: buehne, belegung: belegung, legen: legen };
}

window.Karten = { flaeche: flaeche };
})();
