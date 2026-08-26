/* Foliensatz zum Durchklicken -- fuer Bildschirmaufnahmen (Paket B/C
   der Einfuehrungsvideos). Kein eigenes Seitengeruest: die Aufnahme
   selbst ist der Rahmen, darum keine Kopfzeile in den Folien.
   Weiter/Zurueck per Klick auf die Knoepfe oder per Pfeiltaste/
   Leertaste -- dieselbe Bedienung wie eine Praesentation. */
(function () {
  document.querySelectorAll('.folien-buehne').forEach(function (buehne) {
    var folien = [].slice.call(buehne.querySelectorAll('.folie'));
    var zaehler = buehne.querySelector('.folien-zaehler');
    var i = 0;

    function zeigen(n) {
      i = Math.max(0, Math.min(folien.length - 1, n));
      folien.forEach(function (f, idx) { f.classList.toggle('aktiv', idx === i); });
      if (zaehler) zaehler.textContent = (i + 1) + ' / ' + folien.length;
    }

    var weiter = buehne.querySelector('.folien-weiter');
    var zurueck = buehne.querySelector('.folien-zurueck');
    if (weiter) weiter.addEventListener('click', function () { zeigen(i + 1); });
    if (zurueck) zurueck.addEventListener('click', function () { zeigen(i - 1); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { zeigen(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { zeigen(i - 1); e.preventDefault(); }
    });

    zeigen(0);
  });
})();
