/* Der Zettel «Diese Woche» auf der Navigationsseite.
 *
 * Rike, 28.08.2026: «Ich fände es cool, wenn in dieser Woche immer
 * genau das Kapitel aufgeführt ist, das dran ist — dann muss niemand
 * erst ins Material gehen und die Station suchen, sondern kommt direkt
 * dorthin, was für die aktuelle Woche ansteht.»
 *
 * **Entschieden wird hier, nicht beim Bauen.** Sonst müsste jede Woche
 * jemand neu bauen, und einmal vergessen hiesse, dass wochenlang das
 * falsche Kapitel dasteht. So schaltet die Seite selbst um, auch wenn
 * monatelang niemand etwas anfasst.
 *
 * **Der Montag zählt.** Anders als bei den Einführungsvideos, die an
 * verschiedenen Wochentagen erscheinen, beginnt hier jede Woche am
 * Montag — für alle drei Module gleich.
 *
 * Die Farbe kommt vom Kapitel selbst (`--fach`, `--zugang`, `--beweis`,
 * `--aktion`), damit der Zettel dasselbe sagt wie die Kachel im
 * Material. Bei den komplexen Zahlen steht zusätzlich das Porträt des
 * Mathematikers dabei, so eingefärbt wie überall sonst.
 */
(function () {
  'use strict';

  var FARBEN = {
    fach: '#0065A9', zugang: '#007D57',
    beweis: '#E09E5A', aktion: '#9867A5', didaktik: '#A6083D'
  };

  var kasten = document.querySelector('[data-diese-woche]');
  if (!kasten) return;

  var modul = (document.body.className.match(/m-([a-z_]+)/) || [])[1];
  if (!modul) return;

  fetch('gemeinsam/wochenplan.json')
    .then(function (a) { return a.json(); })
    .then(function (plan) { zeichnen(plan[modul] || []); })
    .catch(function () { /* Ohne Plan bleibt der Zettel einfach leer. */ });

  function zeichnen(wochen) {
    /* Die letzte Woche, deren Montag schon vorbei ist. Vor dem Semester
       steht die erste da — wer im August schaut, soll sehen, womit es
       losgeht, statt gar nichts zu finden. */
    var heute = new Date();
    heute.setHours(0, 0, 0, 0);
    var jetzt = null;
    for (var i = 0; i < wochen.length; i++) {
      if (new Date(wochen[i].ab + 'T00:00:00') <= heute) jetzt = wochen[i];
    }
    var vorher = !jetzt;
    if (!jetzt) jetzt = wochen[0];
    if (!jetzt) return;

    if (jetzt.art !== 'kapitel') {
      /* Herbstpause, Wiederholung, Praktikum: kein Ziel, nur ein Wort. */
      kasten.className = 'zettel ruhig';
      kasten.removeAttribute('href');
      kasten.innerHTML =
        '<b>' + text(jetzt.titel) + '</b><span>' + text(jetzt.dazu) + '</span>';
      return;
    }

    var farbe = FARBEN[jetzt.farbe] || FARBEN.fach;
    kasten.setAttribute('href', '../' + jetzt.weg);
    kasten.className = 'zettel woche';
    kasten.style.setProperty('--wochenfarbe', farbe);
    kasten.innerHTML =
      (jetzt.portraet
        /* **Dieselbe Bildbehandlung wie im Material**: das Foto über
           der Stationsfarbe, mit `mix-blend-mode: luminosity`. Nur die
           Helligkeit des Fotos bleibt, die Farbe kommt von unten.

           Zwei Fehlversuche davor, beide am 28.08.2026: erst ein
           schlichtes <img> mit einer Maske, die es nie gab — das Foto
           blieb unverändert. Dann eine echte Maske aus dem Foto selbst
           — und weil ein Foto überall undurchsichtig ist, wurde daraus
           ein blaues Quadrat. Ein Foto ist keine Silhouette. */
        ? '<span class="wochenbild" aria-hidden="true">'
          + '<img src="../gemeinsam/symbole/' + text(jetzt.portraet)
          + '" alt=""></span>'
        : '')
      + '<span class="wochentext">'
      + '<b>' + text(jetzt.wort) + ' ' + text(jetzt.nummer) + ' — '
      + text(jetzt.titel) + '</b>'
      + '<span>' + (vorher ? 'Damit geht es los' : 'Diese Woche')
      + '</span></span>';
  }

  function text(x) {
    return String(x == null ? '' : x)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
