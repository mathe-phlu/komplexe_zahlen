/* ============================================================
   PIA — Eine abgestürzte Prüfung nachwerten

   Wenn eine Prüfung unterbrochen wird, ist die Seite weg: die
   Aufgaben sind gebaut worden, aber die Bausteine mit ihren
   `pruefen()` leben nur im Fenster, das nicht mehr da ist. Was
   bleibt, liegt in der Datenbank des Browsers:

     · der Ereignisstrom  — was eingetragen, gewählt, geklickt wurde
     · die Schnappschüsse — wie jede Aufgabe aussah, samt Sollwerten
       (`aufgabe-gebaut`, geschrieben BEVOR jemand antwortet)

   Aus beidem lässt sich die Prüfung nachwerten, ohne eine einzige
   Seite aufzubauen. Gebraucht wird das von `retten()` in ablauf.js:
   Aus «Paket schnüren und abgeben» wird damit ein Weg, der
   weiterführt — mit Auswertung und Wiedereintrittscode.

   ZWEI REGELN, die hier alles tragen:

   1  IM ZWEIFEL OFFEN. Lässt sich ein Teil nicht zurücklesen, gilt
      er als NICHT nachgewiesen und die Aufgabe als offen. Der oder
      die Studierende löst sie dann noch einmal. Zu wenig anrechnen
      kostet Zeit; zu viel anrechnen liesse jemanden bestehen, der
      es nicht gezeigt hat. Nur der erste Fehler ist gutzumachen.

   2  DIESELBEN VERGLEICHER WIE IN DER PRÜFUNG. Verglichen wird mit
      `Zahl.*` und der Zuordnung aus `pruefung.js` — nicht mit einer
      zweiten Fassung davon. Zwei Fassungen laufen mit der Zeit
      auseinander, und die Abweichung fiele niemandem auf.

   Was NICHT nachgewertet werden kann und deshalb offen bleibt:
   Mehrfachauswahlen (der Ereignisstrom meldet dort jeden Klick
   einzeln, nicht die Menge — der Endstand steht nirgends).
   ============================================================ */
(function(){
'use strict';

const Z = window.Zahl;

/* ------------------------------------------------------------
   Der letzte Stand je Feld

   Ereignisse sind zeitlich geordnet; der letzte gewinnt. Bei
   Kärtchen zählt nicht ein Feldwert, sondern wo die Karte zuletzt
   lag - deshalb ein eigener Eimer.
   ------------------------------------------------------------ */
function letzterStand(ereignisse){
  const feld = {};      // feldname -> zuletzt eingetragener Text
  const karte = {};     // kartenId -> feldId (oder 'vorrat')
  (ereignisse || []).forEach(e => {
    if (e.was === 'eingabe' || e.was === 'auswahl' || e.was === 'bildklick'){
      const wert = e.wert !== undefined ? e.wert : e.ziel;
      feld[e.feld] = wert;
    } else if (e.was === 'lesefehler'){
      /* Unlesbar ist nicht leer: Wer zuletzt etwas Unlesbares
         geschrieben hat, hat das Feld nicht richtig ausgefüllt.
         Der Rohtext bleibt stehen und fällt beim Vergleich durch. */
      feld[e.feld] = e.wert;
    } else if (e.was === 'karte'){
      karte[e.karte] = e.feld === 'vorrat' ? null : e.feld;
    }
  });
  return { feld: feld, karte: karte };
}

/* ------------------------------------------------------------
   Ein einzelner Teil
   ------------------------------------------------------------ */
/* Was zuletzt in den Feldern eines Teils stand - für die Wiedergabe,
   die «eingetragen gegen richtig» nebeneinanderstellt. */
function teilGegeben(sollRoh, stand){
  if (!sollRoh) return '—';
  if (sollRoh.art === 'karten'){
    const drin = sollRoh.felder.filter(id => stand.karte[id] === sollRoh.feld);
    return drin.length ? drin.join(', ') : '—';
  }
  if (sollRoh.art === 'polarMenge'){
    return sollRoh.felder
      .map(paar => (stand.feld[paar[0]] || '?') + '∠' + (stand.feld[paar[1]] || '?'))
      .join('  ');
  }
  const werte = sollRoh.felder.map(n => stand.feld[n])
    .filter(x => x !== undefined && String(x).trim() !== '');
  return werte.length ? werte.join(' | ') : '—';
}

function teilStimmt(sollRoh, stand){
  if (!sollRoh) return null;                 // nicht nachweisbar
  const F = stand.feld;
  const roh = name => (F[name] === undefined ? null : String(F[name]).trim());
  const da  = name => { const r = roh(name); return r !== null && r !== ''; };

  switch (sollRoh.art){

    case 'komplex': {
      if (!da(sollRoh.felder[0])) return false;
      const w = Z.lies(roh(sollRoh.felder[0]));
      if (!w) return false;
      return sollRoh.raster ? Z.abgelesenGleich(w, sollRoh.soll, sollRoh.raster)
                            : Z.gleich(w, sollRoh.soll);
    }

    case 'komplexZwei': {
      const re = Z.liesReell(roh(sollRoh.felder[0]) || '');
      const im = Z.liesReell(roh(sollRoh.felder[1]) || '');
      if (re === null || im === null) return false;
      const w = Z.K(re, im);
      return sollRoh.raster ? Z.abgelesenGleich(w, sollRoh.soll, sollRoh.raster)
                            : Z.gleich(w, sollRoh.soll);
    }

    case 'zahl':
      return Z.nahe(Z.liesReell(roh(sollRoh.felder[0]) || ''), sollRoh.soll);

    case 'winkel':
      return Z.winkelGleich(Z.liesWinkelGrad(roh(sollRoh.felder[0]) || ''), sollRoh.soll);

    case 'polar':
      return Z.polarGleich(Z.liesReell(roh(sollRoh.felder[0]) || ''),
                           Z.liesWinkelGrad(roh(sollRoh.felder[1]) || ''),
                           sollRoh.sollR, sollRoh.sollG);

    case 'potenz': {
      const w = Z.lies(roh(sollRoh.felder[0]) || '');
      return w ? Z.istPotenzWert(w, sollRoh.basis, sollRoh.exponent) : false;
    }

    case 'log': {
      const w = Z.lies(roh(sollRoh.felder[0]) || '');
      return w ? Z.istLogarithmusWert(w, sollRoh.von) : false;
    }

    case 'polarMenge': {
      /* Über alle Zeilen zusammen, mit derselben Zuordnung wie in
         der Prüfung - jede Eingabe bedient höchstens einen Sollwert. */
      const gegeben = sollRoh.felder.map(paar => ({
        r: Z.liesReell(roh(paar[0]) || ''),
        g: Z.liesWinkelGrad(roh(paar[1]) || '')
      }));
      return window.PIA.zuordnenGreedy(gegeben, sollRoh.soll)[sollRoh.k];
    }

    case 'wahl':
      /* Einfachauswahl und Bilderwahl: gemeldet wird der Text der
         gewählten Möglichkeit. */
      return da(sollRoh.felder[0]) &&
             sollRoh.richtigTexte.indexOf(roh(sollRoh.felder[0])) >= 0;

    case 'zuordnung': {
      /* Gemeldet wird «links → rechts»; verglichen wird die rechte
         Seite. */
      const r = roh(sollRoh.felder[0]);
      if (!r) return false;
      const pfeil = r.lastIndexOf(' → ');
      const rechts = pfeil < 0 ? r : r.slice(pfeil + 3);
      return sollRoh.richtigTexte.indexOf(rechts) >= 0;
    }

    case 'bildwahl':
      return da(sollRoh.felder[0]) && roh(sollRoh.felder[0]) === sollRoh.soll;

    case 'menge': {
      /* Gemeldet wird bei jedem Klick die GANZE Menge, mit + verbunden.
         Der letzte Eintrag ist deshalb der Endstand. */
      const r = roh(sollRoh.felder[0]);
      if (!r) return false;
      const g = r.split('+').filter(x => x !== '');
      return sollRoh.mengen.some(m =>
        m.length === g.length && m.every(x => g.indexOf(x) >= 0));
    }

    case 'karten': {
      const drin = sollRoh.felder.filter(id => stand.karte[id] === sollRoh.feld).sort();
      const soll = sollRoh.soll.slice().sort();
      return drin.length === soll.length && drin.every((x,i) => x === soll[i]);
    }
  }
  return null;                                // unbekannte Art: nicht nachweisbar
}

/* ------------------------------------------------------------
   Die ganze Prüfung
   ------------------------------------------------------------ */
function bewerten(ereignisse){
  const stand = letzterStand(ereignisse);

  /* Die Schnappschüsse. Jede Aufgabe steht einmal drin; wurde eine
     Prüfung wiederaufgenommen, gilt der letzte Aufbau. */
  const bilder = {};
  (ereignisse || []).forEach(e => {
    if (e.was === 'aufgabe-gebaut') bilder[e.aufgabe] = e;
  });

  const aufgaben = Object.keys(bilder).map(id => bilder[id])
    .sort((a,b) => a.nr - b.nr)
    .map(bild => {
      const teile = (bild.teile || []).map(t => {
        const ok = teilStimmt(t.sollRoh, stand);
        return { name: t.name, p: t.p, soll: t.soll,
                 gegeben: teilGegeben(t.sollRoh, stand),
                 ok: ok === true, nachweisbar: ok !== null };
      });
      const erreicht = teile.reduce((x,t) => x + (t.ok ? t.p : 0), 0);
      return {
        nr: bild.nr, id: bild.aufgabe, titel: bild.titel,
        moeglich: bild.punkte, erreicht: erreicht,
        /* Regel 1: Ein Teil, den wir nicht nachlesen können, macht die
           Aufgabe offen - auch wenn alles Übrige stimmt. */
        vollstaendig: teile.every(t => t.nachweisbar),
        ganz: teile.length > 0 && teile.every(t => t.ok && t.nachweisbar),
        teile: teile
      };
    });

  const moeglich = aufgaben.reduce((x,a) => x + a.moeglich, 0);
  const erreicht = aufgaben.reduce((x,a) => x + a.erreicht, 0);
  return {
    aufgaben: aufgaben, moeglich: moeglich, erreicht: erreicht,
    offen: aufgaben.filter(a => !a.ganz).map(a => a.nr),
    /* Aufgaben, die gar nicht erst aufgebaut wurden, fehlen hier -
       der Absturz kam, bevor die Prüfung so weit war. Wer sie
       nachträgt, muss sie als offen führen. */
    unvollstaendig: aufgaben.some(a => !a.vollstaendig)
  };
}

window.Nachwerten = { bewerten: bewerten, letzterStand: letzterStand,
                      teilStimmt: teilStimmt, teilGegeben: teilGegeben };
})();
