/* ============================================================
   LARS — Verhalten der Lernlandschaftsseiten

   Drei Stuecke, alle klein und ohne Bibliothek: Kapitelnavigation,
   Video mit Pausen, Kaertchen zuordnen. Die Seiten sollen sich
   einzeln weitergeben lassen und in zehn Jahren noch oeffnen.

   Was hier NICHT steht: das Aufklappen von Starthilfe und Loesung.
   Das laeuft ueber <details> und braucht kein Skript — der Inhalt
   muss auch ohne JavaScript erreichbar bleiben.

   Kein Farbwert steht hier; alle kommen aus :root (Kaspers Regel,
   GESTALTUNG.md Abschnitt 7).
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     1 · Buch: ein Kapitel auf einmal
     ========================================================== */
  function buchAufsetzen(buch) {
    var kapitel = [].slice.call(buch.querySelectorAll('.kapitel'));
    var eintraege = [].slice.call(buch.querySelectorAll('.kapitelliste a'));
    if (!kapitel.length) return;
    var jetzt = -1;

    function zeigen(nr, rollen) {
      nr = Math.max(0, Math.min(kapitel.length - 1, nr));
      if (nr === jetzt) return;
      jetzt = nr;
      kapitel.forEach(function (k, i) { k.hidden = i !== nr; });
      eintraege.forEach(function (a, i) {
        a.setAttribute('aria-current', i === nr ? 'true' : 'false');
      });
      var zurueck = buch.querySelector('.blaettern .zurueck');
      var weiter = buch.querySelector('.blaettern .weiter');
      if (zurueck) zurueck.disabled = nr === 0;
      if (weiter) weiter.disabled = nr === kapitel.length - 1;
      if (history.replaceState) {
        history.replaceState(null, '', '#' + kapitel[nr].id);
      }
      if (rollen) buch.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function nachMarke() {
      var marke = location.hash.replace('#', '');
      /* Die Marke kann auch auf etwas INNERHALB eines Kapitels zeigen -
         auf eine Aufgabe zum Beispiel. Dann muss erst das Kapitel
         sichtbar werden, sonst springt der Browser ins Leere. */
      var ziel = marke && document.getElementById(marke);
      var nr = 0;
      if (ziel) {
        var eigenes = ziel.closest('.kapitel');
        nr = eigenes ? kapitel.indexOf(eigenes) : 0;
      }
      zeigen(nr < 0 ? 0 : nr, false);
      if (ziel && ziel !== kapitel[nr]) {
        setTimeout(function () {
          ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 30);
      }
    }

    eintraege.forEach(function (a, i) {
      a.addEventListener('click', function (ev) { ev.preventDefault(); zeigen(i, true); });
    });
    buch.addEventListener('click', function (ev) {
      if (ev.target.closest('.blaettern .zurueck')) zeigen(jetzt - 1, true);
      if (ev.target.closest('.blaettern .weiter')) zeigen(jetzt + 1, true);
    });
    window.addEventListener('hashchange', nachMarke);
    nachMarke();
  }

  /* ==========================================================
     2 · Video: haelt an, wo etwas eingeblendet gehoert

     Der Kern des interaktiven Videos ist die Pause. Alle
     Einblendungen sind verborgen; erreicht das Video eine Stelle
     mit Pause, haelt es an und zeigt genau die eine, die dorthin
     gehoert.
     ========================================================== */
  function videoAufsetzen(block) {
    var leiste = block.querySelector('.marken');
    var tafeln = [].slice.call(block.querySelectorAll('.einblendung'));
    if (!leiste || !tafeln.length) return;
    var knoepfe = [].slice.call(leiste.querySelectorAll('button[data-marke]'));
    var marken = knoepfe.map(function (b) {
      return {
        nr: parseInt(b.getAttribute('data-marke'), 10),
        sekunde: parseFloat(b.getAttribute('data-sekunde')) || 0,
        haelt: b.classList.contains('haelt'),
        knopf: b
      };
    });
    var alleZeigen = false;
    var zuletzt = -1;

    function tafelZeigen(nr, rollen) {
      if (alleZeigen) return;
      tafeln.forEach(function (t) {
        t.hidden = parseInt(t.getAttribute('data-marke'), 10) !== nr;
      });
      knoepfe.forEach(function (b) {
        b.setAttribute('aria-current',
          parseInt(b.getAttribute('data-marke'), 10) === nr ? 'true' : 'false');
      });
      var offen = tafeln.filter(function (t) { return !t.hidden; })[0];
      if (offen && rollen) offen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    var schalter = block.querySelector('.alle-zeigen');
    if (schalter) {
      schalter.addEventListener('click', function () {
        alleZeigen = !alleZeigen;
        schalter.setAttribute('aria-pressed', alleZeigen ? 'true' : 'false');
        schalter.textContent = alleZeigen ? 'einzeln anzeigen' : 'alle anzeigen';
        if (alleZeigen) {
          tafeln.forEach(function (t) { t.hidden = false; });
        } else {
          tafeln.forEach(function (t) { t.hidden = true; });
          zuletzt = -1;
        }
      });
    }

    /* --- gemeinsamer Teil: Stand pruefen --- */
    function pruefen(sekunde, anhalten) {
      for (var i = 0; i < marken.length; i++) {
        var m = marken[i];
        if (m.nr === zuletzt) continue;
        if (sekunde >= m.sekunde && sekunde < m.sekunde + 1.2) {
          zuletzt = m.nr;
          tafelZeigen(m.nr, true);
          if (m.haelt && anhalten) anhalten();
          return;
        }
      }
    }

    var typ = block.getAttribute('data-typ');

    if (typ === 'datei') {
      var video = block.querySelector('video');
      if (!video) return;
      video.addEventListener('timeupdate', function () {
        pruefen(video.currentTime, function () { video.pause(); });
      });
      knoepfe.forEach(function (b, i) {
        b.addEventListener('click', function () {
          zuletzt = marken[i].nr;
          var laeuft = !video.paused;
          video.currentTime = marken[i].sekunde;
          tafelZeigen(marken[i].nr, true);
          if (laeuft) video.play().catch(function () {});
        });
      });
      return;
    }

    /* --- YouTube --- */
    var platz = block.querySelector('.spieler[data-video]');
    if (!platz) return;
    var spieler = null, takt = null;

    function starten() {
      if (spieler || !window.YT || !window.YT.Player) return;
      spieler = new YT.Player(platz, {
        videoId: platz.getAttribute('data-video'),
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: function (ev) {
            /* Nur waehrend des Laufs takten. Ein Zaehler, der im
               Hintergrund weiterlaeuft, kostet Rechenzeit und haelt
               das Telefon wach. */
            clearInterval(takt);
            if (ev.data === YT.PlayerState.PLAYING) {
              takt = setInterval(function () {
                pruefen(spieler.getCurrentTime(), function () { spieler.pauseVideo(); });
              }, 250);
            }
          }
        }
      });
      knoepfe.forEach(function (b, i) {
        b.addEventListener('click', function () {
          zuletzt = marken[i].nr;
          tafelZeigen(marken[i].nr, true);
          var laeuft = spieler.getPlayerState && spieler.getPlayerState() === 1;
          spieler.seekTo(marken[i].sekunde, laeuft);
          if (!laeuft && spieler.pauseVideo) spieler.pauseVideo();
        });
      });
    }

    if (window.YT && window.YT.Player) starten();
    else {
      var vorher = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (vorher) vorher();
        document.querySelectorAll('.videoblock[data-typ="youtube"]').forEach(function (b) {
          if (b._start) b._start();
        });
      };
      block._start = starten;
    }
  }

  /* ==========================================================
     3 · Kaertchen zuordnen

     HERKUNFT: Die Ziehmechanik stammt aus Kaspers `flaeche.js` ueber
     Pias `karten.js`. Uebernommen sind vor allem die Stellen, die
     dort als behoben dokumentiert sind und die man sonst alle noch
     einmal faende:

       - Zeiger festhalten, sonst reisst die Geste ab, sobald sie
         ueber ein anderes Element faehrt
       - die gezogene Karte an die Buehne haengen und `position:fixed`
         geben, damit sie ueber beide Haelften wandern kann
       - `pointer-events:none` auf der gezogenen Karte, sonst findet
         elementFromPoint immer sie selbst und nie das Ziel darunter
       - `ondragstart` abschalten, sonst kapert der Browser die Geste
       - die Heimatlage VOR dem Ziehen merken
       - ist das Ziel voll, lieber heimkehren als verdecken
     ========================================================== */
  var zmax = 20;

  function unterZeiger(x, y, wahl) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest(wahl) : null;
  }

  function kartenAufsetzen(buehne) {
    var fasst = parseInt(buehne.getAttribute('data-fasst') || '99', 10);

    function platzFrei(ablage, ausser) {
      var drin = [].filter.call(ablage.children, function (k) { return k !== ausser; });
      return drin.length < fasst;
    }

    function ziehbar(karte) {
      karte.ondragstart = function () { return false; };

      karte.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        e.preventDefault();
        var start = karte.getBoundingClientRect();
        var dx = e.clientX - start.left, dy = e.clientY - start.top;
        var heim = karte.parentElement;          // VOR dem Ziehen merken
        karte.classList.add('zieht');
        karte.style.width = start.width + 'px';
        try { karte.setPointerCapture(e.pointerId); } catch (_) {}
        karte.style.zIndex = ++zmax;
        buehne.appendChild(karte);
        karte.style.position = 'fixed';

        var setzen = function (ev) {
          karte.style.left = (ev.clientX - dx) + 'px';
          karte.style.top = (ev.clientY - dy) + 'px';
        };
        setzen(e);

        var bewegen = function (ev) {
          setzen(ev);
          buehne.querySelectorAll('.drueber').forEach(function (d) {
            d.classList.remove('drueber');
          });
          var ziel = unterZeiger(ev.clientX, ev.clientY, '.kartenablage,.kartenblatt');
          if (ziel && (ziel.dataset.feld === '' || platzFrei(ziel, karte))) {
            ziel.classList.add('drueber');
          }
        };
        var los = function (ev) {
          window.removeEventListener('pointermove', bewegen);
          window.removeEventListener('pointerup', los);
          window.removeEventListener('pointercancel', los);
          karte.classList.remove('zieht');
          karte.style.position = ''; karte.style.left = '';
          karte.style.top = ''; karte.style.width = '';
          buehne.querySelectorAll('.drueber').forEach(function (d) {
            d.classList.remove('drueber');
          });
          var ziel = unterZeiger(ev.clientX, ev.clientY, '.kartenablage,.kartenblatt');
          if (ziel && ziel.dataset.feld !== '' && !platzFrei(ziel, karte)) ziel = null;
          (ziel || heim).appendChild(karte);
        };
        window.addEventListener('pointermove', bewegen);
        window.addEventListener('pointerup', los);
        window.addEventListener('pointercancel', los);
      });

      /* Zurueck in den Vorrat, ohne zu ziehen. Auf dem Tablet oft der
         bequemere Weg. */
      karte.addEventListener('dblclick', function () {
        var blatt = buehne.querySelector('.kartenblatt');
        if (blatt && karte.parentElement !== blatt) blatt.appendChild(karte);
      });
    }

    buehne.querySelectorAll('.kk').forEach(ziehbar);
  }


  /* ==========================================================
     4 · Der Rahmen um den Originalinhalt

     H5P laeuft in einem eigenen Rahmen (iframe) und meldet seine
     Hoehe normalerweise an die umgebende Seite. Diese Meldung
     stammt aus der Moodle-Umgebung; ohne sie bleibt der Rahmen
     einen Pixel hoch, obwohl der Inhalt darin vollstaendig da ist.

     Deshalb messen wir selbst nach: Hoehe des Inhalts ablesen,
     Rahmen darauf setzen, und bei jeder Aenderung — Kapitelwechsel,
     aufgeklappte Aufgabe, gedrehtes Telefon — neu messen.
     ========================================================== */
  function rahmenNachfuehren(buehne) {
    /* H5P meldet seine Hoehe normalerweise an die umgebende Seite.
       Diese Meldung stammt aus der Moodle-Umgebung; ohne sie bleibt der
       Rahmen einen Pixel hoch, obwohl der Inhalt vollstaendig da ist.

       WICHTIG — teuer gelernt: Hier wird nur **gemessen**, nie in den
       Rahmen hineingeschrieben. Der erste Versuch setzte die Hoehe von
       `body` und `.h5p-content` zurueck. Beim Buch half das, die
       Landkarte dagegen zerlegte es: H5P misst waehrend des Aufbaus
       selbst nach, und zwei Stellen, die gleichzeitig an derselben
       Hoehe drehen, bringen es aus dem Tritt. Sichtbar wurde das als
       grauer Schleier ohne Inhalt.

       Der Inhalt ragt ueber den zu kleinen Rahmen hinaus, statt
       abgeschnitten zu werden — deshalb liefert `scrollHeight` die
       richtige Hoehe, ganz ohne Eingriff. */
    var wache = null;

    function messen() {
      var rahmen = buehne.querySelector('iframe');
      if (!rahmen) return;
      var d = rahmen.contentDocument;
      if (!d || !d.body) return;
      var mass = d.querySelector('.h5p-content') || d.body;

      /* Das interaktive Buch verhaelt sich anders als alles uebrige.
         Es fuellt eine ihm **gegebene** Flaeche und blaettert innen —
         gemessen ergaebe es 244 Pixel, und der Inhalt waere weg. Sein
         Deckblatt dagegen waechst wie jeder andere Inhalt und muss
         ganz zu sehen sein, sonst ist der Knopf «Öffnen» unerreichbar.

         Also: Deckblatt messen, aufgeschlagenes Buch bemessen. */
      var buch = d.querySelector('.h5p-interactive-book');
      var deckel = d.querySelector('.h5p-interactive-book-cover');
      var aufgeschlagen = buch && (!deckel || deckel.offsetParent === null ||
                                   deckel.classList.contains('covered'));
      if (aufgeschlagen) {
        var platz = Math.max(600, Math.round(window.innerHeight * 0.86));
        if (Math.abs((parseInt(rahmen.style.height, 10) || 0) - platz) > 8) {
          rahmen.style.height = platz + 'px';
        }
        if (!wache && window.ResizeObserver) {
          wache = new ResizeObserver(function () { messen(); });
          wache.observe(mass);
        }
        return;
      }

      var hoehe = Math.max(mass.scrollHeight, d.body.scrollHeight,
                           Math.ceil(mass.getBoundingClientRect().height), 240);
      var jetzt = parseInt(rahmen.style.height, 10) || 0;
      /* Nur bei deutlicher Abweichung anfassen. Sonst schaukeln sich
         Messung und H5P-eigene Anpassung gegenseitig auf. */
      if (Math.abs(jetzt - hoehe) > 24) rahmen.style.height = hoehe + 'px';

      if (!wache && window.ResizeObserver) {
        wache = new ResizeObserver(function () { messen(); });
        wache.observe(mass);
      }
    }

    /* Anfangs oefter nachsehen: Bilder, Schriften und Videos kommen
       nach. Der erste Blick erst nach einer Sekunde — vorher baut H5P
       noch auf, und eine Messung mittendrin misst einen Zwischenstand. */
    var versuche = 0;
    setTimeout(function () {
      var takt = setInterval(function () {
        messen();
        if (++versuche > 40) clearInterval(takt);
      }, 400);
    }, 1000);
    window.addEventListener('resize', messen);
    buehne.addEventListener('click', function () {
      setTimeout(messen, 300); setTimeout(messen, 1000);
    });
  }


  /* ==========================================================
     5 · Etappe: Video links, Aufgaben rechts

     Der Kern ist die Zeitmarke. Erreicht das Video eine Stelle, an
     der eine Aufgabe hinterlegt ist, erscheint sie rechts — und wo
     im alten Material eine Pause gesetzt war, haelt das Video an.
     Wer eine bestimmte Aufgabe sucht, klickt sie in der Liste an;
     das Video springt hin.

     Was hier NICHT passiert: die Aufgabe ins Video einblenden. Auf
     dem Telefon war das nie lesbar, und im Video steht sie klein,
     waehrend sie rechts in voller Groesse steht.
     ========================================================== */
  /* **Die YouTube-Schnittstelle wird nachgeladen, nicht eingebunden.**
     Sie taktet die Sprungmarken mit und wird erst gebraucht, wenn
     jemand ein Video startet. Als `<script>` in der Seite ging sie
     beim Seitenaufruf an Google — auch bei dem, der nur liest.

     `onYouTubeIframeAPIReady` ruft der Browser genau einmal auf. Eine
     schon gesetzte Fassung wird deshalb weitergereicht, nicht
     ueberschrieben, und das Skript nur einmal eingehaengt. */
  function apiLaden(fertig) {
    if (window.YT && window.YT.Player) { fertig(); return; }
    var vorher = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (vorher) { try { vorher(); } catch (_) {} }
      fertig();
    };
    if (document.querySelector('script[data-yt-api]')) return;
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.setAttribute('data-yt-api', '');
    s.defer = true;
    document.head.appendChild(s);
  }

  function etappeAufsetzen(etappe) {
    var knoepfe = [].slice.call(etappe.querySelectorAll('.marken button[data-marke]'));
    var tafeln = [].slice.call(etappe.querySelectorAll('.tafel'));
    /* **Kein frueher Ausstieg mehr.** Hier stand `if (!tafeln.length)
       return;` — und damit blieb auf jeder Etappe **ohne** Aufgaben
       auch der Abspielknopf tot, weil das Video weiter unten in
       derselben Funktion verdrahtet wird. «Stationen der
       Ideengeschichte» liess sich deshalb nicht starten, «Polarform»
       schon: Der Unterschied war nicht das Video, sondern ob Aufgaben
       daran hingen. Die Zeitmarken brauchen Tafeln, das Video nicht. */

    var marken = knoepfe.map(function (b) {
      return { nr: parseInt(b.getAttribute('data-marke'), 10),
               sekunde: parseFloat(b.getAttribute('data-sekunde')) || 0,
               pause: b.hasAttribute('data-pause'),
               knopf: b };
    });
    var offen = -1;
    var spieler = null, video = null, takt = null;

    function zeigen(nr) {
      if (nr === offen) return;
      offen = nr;
      var sichtbar = null;
      tafeln.forEach(function (t) {
        t.hidden = parseInt(t.getAttribute('data-marke'), 10) !== nr;
        if (!t.hidden) sichtbar = t;
      });
      knoepfe.forEach(function (b) {
        b.setAttribute('aria-current',
          parseInt(b.getAttribute('data-marke'), 10) === nr ? 'true' : 'false');
      });
      /* Formeln nachsetzen lassen. MathJax geht die Seite beim Laden
         einmal durch; was danach sichtbar wird, muss angestossen
         werden — sonst steht dort der Quelltext statt der Formel. */
      if (sichtbar && window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([sichtbar]).catch(function () {});
      }

      /* **Der Wechsel der Stelle raeumt das Applet weg.** Rike,
         24.08.2026: «Bitte beim Wechsel von einer Aufgabe zur naechsten
         das GeoGebra der alten Aufgabe prinzipiell ausblenden.» Sonst
         stuende unter dem Video die Zeichnung zu einer Aufgabe, die
         daneben gar nicht mehr steht. */
      etappe.querySelectorAll('.reiter button.hinaus').forEach(function (a) {
        if (a.getAttribute('aria-expanded') !== 'true') return;
        var f = document.getElementById(a.dataset.ziel);
        if (f) f.hidden = true;
        a.setAttribute('aria-expanded', 'false');
      });

      /* **Wo das Applet der ganze Inhalt ist, geht es von selbst auf.**
         Diese Tafeln tragen nichts als den Knopf; ihn erst noch
         anklicken zu muessen waere ein Klick ohne Entscheidung.
         `schaltenApplet` haengt `stufenAufsetzen` an den Knopf — laeuft
         das noch nicht, tut ein einfacher Klick dasselbe. */
      if (sichtbar) {
        var selbst = sichtbar.querySelector('.reiter button.hinaus[data-auto]');
        if (selbst && selbst.getAttribute('aria-expanded') !== 'true') {
          if (selbst.schaltenApplet) selbst.schaltenApplet(true);
          else selbst.click();
        }
      }
    }
    /* Anfangs ist **nichts** eingeblendet. Die erste Aufgabe erscheint,
       wenn das Video ihre Stelle erreicht — oder wenn jemand sie in der
       Leiste anklickt. Sie vorweg zu zeigen nimmt der Sache genau das,
       worum es geht: dass die Aufgabe kommt, wenn sie dran ist. */
    zeigen(-1);

    /* **Kein Ausstieg wegen fehlender Marken.** Hier stand
       `if (!marken.length) return;` — und damit blieb auf jeder Etappe
       ohne Aufgaben auch der Abspielknopf tot, denn das Video wird
       weiter unten in derselben Funktion verdrahtet. «Stationen der
       Ideengeschichte» liess sich deshalb nicht starten, «Polarform»
       schon; der Unterschied war nicht das Video, sondern ob Aufgaben
       daran hingen.

       Ohne Marken laeuft alles Folgende ins Leere, ohne Schaden:
       `pruefen` geht eine leere Liste durch, und die Knopfreihe hat
       keine Knoepfe. */

    /* Welche Marken sind schon durchlaufen? Nur beim **Erreichen**
       wird angehalten, nicht beim spaeteren Vorbeispulen — sonst
       klebte das Video an derselben Stelle fest. */
    var angehalten = {};

    function pruefen(sekunde) {
      for (var i = marken.length - 1; i >= 0; i--) {
        if (sekunde + 0.4 < marken[i].sekunde) continue;
        zeigen(marken[i].nr);
        /* Das automatische Anhalten ist der Kern des interaktiven
           Videos: Die Aufgabe kommt, wenn sie dran ist, und man muss
           nicht selbst auf Pause druecken. Es greift dort, wo die
           YouTube-Schnittstelle antwortet; sonst erscheint die Aufgabe
           trotzdem, nur ohne Pause. */
        if (marken[i].pause && !angehalten[marken[i].nr] &&
            sekunde < marken[i].sekunde + 1.5) {
          angehalten[marken[i].nr] = true;
          if (spieler && spieler.pauseVideo) spieler.pauseVideo();
          if (video && video.pause) video.pause();
        }
        return;
      }
    }

    /* **Nur das Video der Etappe, nicht das an der Aufgabe.**
       Hier stand `etappe.querySelector('video')` — und das griff in die
       Aufgabentafel hinein: Unter dem Reiter «Video» steht bei
       MA01.03 ein Kaltura-Film als gewoehnliches `<video>`. Wo es eines
       gab, nahm die Etappe diesen Zweig, band die Sprungmarken an das
       AUFGABENvideo und stieg aus, bevor das eigentliche Video der
       Etappe verdrahtet war.

       Sichtbar wurde das als Gespenst: Ein Klick auf eine Sprungmarke
       zeigte die Aufgabe — und 16 Millisekunden spaeter sprang die
       Anzeige auf eine andere. Denn `video.currentTime = 503.9` auf
       einem viel kuerzeren Aufgabenvideo loeste sofort ein
       `timeupdate` aus, und `pruefen()` schaltete auf die Marke, die
       zu dieser Zeit passte. (Henrike, Kapitel 2, Etappe 5.) */
    video = etappe.querySelector('.film video');
    if (video) {
      if (!tafeln.length) return;
      video.addEventListener('timeupdate', function () { pruefen(video.currentTime); });
      knoepfe.forEach(function (b, i) {
        b.addEventListener('click', function () {
          zeigen(marken[i].nr);
          /* Springen heisst nicht starten — siehe unten beim
             YouTube-Abspieler. Lief es, laeuft es weiter. */
          var laeuft = !video.paused;
          video.currentTime = marken[i].sekunde;
          if (laeuft) video.play().catch(function () {});
        });
      });
      return;
    }

    /* --- YouTube: erst auf Klick einbetten --- */
    /* **Nur das Video der Etappe, nicht das an der Aufgabe.**
       `querySelector` nahm das erste Vorschaubild der ganzen Seite —
       und in der Reiterleiste einer Aufgabe steht unter «Video» ein
       zweites. Ohne die Einschraenkung haetten die Sprungmarken der
       Etappe unter Umstaenden das Aufgabenvideo gesteuert. */
    var vorschau = etappe.querySelector('.film .rahmen.vorschau[data-video]');
    if (!vorschau) return;
    vorschau.dataset.verdrahtet = '1';
    var kennung = vorschau.getAttribute('data-video');
    var rahmen = null;

    function adresse(start) {
      /* **youtube.com**, nicht youtube-nocookie.com.
         Gemessen am 22.08.2026 ueber vier Browser: In Chrome spielt
         die Einbettung ueber youtube.com — ueber den datenschonenden
         Wirt dagegen nicht. Der schonendere Weg waere der schoenere
         gewesen; er funktioniert hier nicht, und ein Video, das nicht
         spielt, nuetzt niemandem.

         Der Rahmen laedt weiterhin erst auf Klick. Das bleibt richtig:
         Vorher geht nichts an Google, und die Seite ist schneller da. */
      /* **`enablejsapi` braucht `origin`.** YouTube verlangt bei
         eingeschalteter Schnittstelle die Adresse der einbettenden
         Seite. Fehlt sie, kommt der Handschlag zwischen Seite und
         Abspieler in Browsern mit getrenntem Speicher (Safari mit
         ITP, Firefox mit Total Cookie Protection) nicht zustande —
         der Abspieler erscheint und tut nichts. Bei `file://` ist die
         Adresse «null»; dann wird sie weggelassen.

         **`playsinline` fuer das Telefon.** Ohne das versucht iOS,
         das Video im Vollbild zu oeffnen, und verweigert es teils
         ganz.

         **Kein `autoplay` mehr.** Safari und Firefox lassen ein Video
         mit Ton nicht von selbst anlaufen, und die Klickerlaubnis
         traegt nicht in einen Rahmen hinein, der durch denselben
         Klick erst entsteht. Der Abspieler laedt dann, startet aber
         nicht — was aussieht, als sei er blockiert. Ohne `autoplay`
         zeigt YouTube seinen eigenen Startknopf, und ein Klick
         darauf laeuft in jedem Browser. Fuer Chrome kostet das einen
         Klick, ueberall sonst macht es den Unterschied zwischen
         «spielt» und «spielt nicht».

         `start` bleibt: Wer eine Sprungmarke anklickt, landet an der
         richtigen Stelle, sobald er startet. */
      var ursprung = (window.location.protocol === 'file:')
                     ? '' : '&origin=' + encodeURIComponent(window.location.origin);
      return 'https://www.youtube.com/embed/' + kennung +
             '?rel=0&modestbranding=1&playsinline=1&enablejsapi=1' + ursprung +
             (start ? '&start=' + Math.floor(start) : '');
    }

    function einbetten(start) {
      /* Das Vorschaubild weicht dem Rahmen. Erst hier wird ueberhaupt
         etwas von YouTube geladen — vorher sendet die Seite nichts
         dorthin. */
      if (rahmen) {
        rahmen.src = adresse(start);
        return;
      }
      rahmen = document.createElement('iframe');
      rahmen.className = 'spieler';
      rahmen.setAttribute('allowfullscreen', '');
      rahmen.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      rahmen.setAttribute('title', 'Video');
      rahmen.src = adresse(start);
      vorschau.innerHTML = '';
      vorschau.classList.remove('vorschau');
      vorschau.appendChild(rahmen);

      /* Die Schnittstelle ist ein Zusatz, keine Bedingung. Klinkt sie
         sich ein, erscheinen die Aufgaben von selbst an ihrer Marke.
         Tut sie es nicht, bleibt alles andere unberuehrt.

         **Geladen wird sie erst hier.** Frueher stand sie als
         `<script>` in jeder Etappenseite und ging beim Seitenaufruf an
         Google — genau das, was das mitgelieferte Standbild vermeiden
         soll. Wer kein Video startet, sendet jetzt gar nichts. */
      apiLaden(function () {
        if (!window.YT || !YT.Player) return;
        try {
          spieler = new YT.Player(rahmen, {
            events: {
              onStateChange: function (ev) {
                clearInterval(takt);
                if (ev.data === YT.PlayerState.PLAYING) {
                  takt = setInterval(function () {
                    if (spieler.getCurrentTime) pruefen(spieler.getCurrentTime());
                  }, 300);
                }
              }
            }
          });
        } catch (_) { spieler = null; }
      });
    }

    vorschau.addEventListener('click', function () { einbetten(0); });

    knoepfe.forEach(function (b, i) {
      b.addEventListener('click', function () {
        zeigen(marken[i].nr);
        if (spieler && spieler.seekTo) {
          /* **Springen heisst nicht starten.** Wer eine Sprungmarke
             anklickt, will meistens die Aufgabe LESEN — dass dabei das
             Video zu reden anfaengt, war das Aergerlichste an der
             ganzen Seite. Lief es schon, laeuft es weiter; stand es,
             bleibt es stehen. Gestartet wird nur ueber den Startknopf. */
          var laeuft = spieler.getPlayerState
                       && spieler.getPlayerState() === 1;
          spieler.seekTo(marken[i].sekunde, laeuft);
          if (!laeuft && spieler.pauseVideo) spieler.pauseVideo();
        } else {
          einbetten(marken[i].sekunde);
        }
      });
    });
  }

  /* ==========================================================
     Anschalten
     ========================================================== */
  /* Starthilfe, Loesung und GeoGebra stehen in <details>. Was darin
     steht, ist beim Laden verborgen — MathJax setzt es zwar mit, aber
     erst beim Aufklappen kennt der Browser die Masse. Ein Anstoss beim
     Oeffnen sorgt dafuer, dass Formeln richtig sitzen. */
  document.addEventListener('toggle', function (ereignis) {
    var d = ereignis.target;
    if (!d || d.tagName !== 'DETAILS' || !d.open) return;
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([d]).catch(function () {});
    }
  }, true);

  /* Blaettern innerhalb eines Kastens. An 21 Stellen liegen mehrere
     Einblendungen auf derselben Sekunde — teils vier Aufgaben. Sie
     stehen in einem Kasten, und hier wird zwischen ihnen gewechselt. */
  document.addEventListener('click', function (ereignis) {
    var knopf = ereignis.target.closest('.blaetter button[data-blatt]');
    if (!knopf) return;
    var tafel = knopf.closest('.tafel');
    var welches = knopf.getAttribute('data-blatt');
    tafel.querySelectorAll('.blatt').forEach(function (b) {
      b.hidden = b.getAttribute('data-blatt') !== welches;
    });
    tafel.querySelectorAll('.blaetter button').forEach(function (b) {
      b.setAttribute('aria-current',
        b.getAttribute('data-blatt') === welches ? 'true' : 'false');
    });
    var offen = tafel.querySelector('.blatt:not([hidden])');
    if (offen && window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([offen]).catch(function () {});
    }

    /* **Auch beim Blättern wechselt, was unter dem Video steht.**
       Rike, 25.08.2026: «Applets bitte beide in getrennten Marken,
       gleiche Stelle, damit sie einzeln eingebettet werden können.»
       Zwei Applets auf derselben Sekunde liegen in einem Kasten als
       zwei Blätter — und ohne das hier blieb beim Umblättern das
       Applet des ersten stehen und das des zweiten kam nie. Dieselbe
       Regel wie beim Wechsel der Stelle: erst wegräumen, dann das
       aufmachen, das allein im Blatt steht. */
    var etappe_b = tafel.closest('.etappe') || document;
    etappe_b.querySelectorAll('.reiter button.hinaus').forEach(function (a) {
      if (a.getAttribute('aria-expanded') !== 'true') return;
      if (offen && offen.contains(a)) return;
      var f = document.getElementById(a.dataset.ziel);
      if (f) f.hidden = true;
      a.setAttribute('aria-expanded', 'false');
    });
    if (offen) {
      var selbst_b = offen.querySelector('.reiter button.hinaus[data-auto]');
      if (selbst_b && selbst_b.getAttribute('aria-expanded') !== 'true') {
        if (selbst_b.schaltenApplet) selbst_b.schaltenApplet(true);
        else selbst_b.click();
      }
    }
  });

  /* ==========================================================
     6 · Der Weg passt sich der Fensterbreite an

     Er soll **eine** Zeile bleiben und die Breite ausfuellen. Umbrechen
     sah unruhig aus, Schieben verdeckt die Haelfte. Also wird die
     natuerliche Breite gemessen und der ganze Weg darauf gerechnet.
     ========================================================== */
  function wegAnpassen(strahl) {
    var feld = strahl.querySelector('.feld');
    var strecke = strahl.querySelector('.strecke');
    if (!feld || !strecke) return;

    function rechnen() {
      strecke.style.transform = 'none';
      var breit = strecke.scrollWidth;
      var platz = feld.clientWidth;
      if (!breit || !platz) return;
      /* Kleiner rechnen, wenn es zu breit ist; groesser, wenn Platz
         bleibt — aber nicht ins Uferlose, sonst wirken die Kacheln
         plakativ. */
      var mass = Math.min(platz / breit, 1.55);
      strecke.style.transform = 'scale(' + mass.toFixed(4) + ')';
      /* **Die Hoehe nur schreiben, wenn sie sich aendert.** Sie ist das
         Einzige an `.feld`, was diese Funktion selbst veraendert — und
         der ResizeObserver unten hoert darauf. Wer sie bei jedem Lauf
         neu setzt, meldet sich seine eigene Aenderung zurueck und
         dreht sich im Kreis. */
      var hoehe = Math.ceil(strecke.offsetHeight * mass) + 'px';
      if (feld.style.height !== hoehe) feld.style.height = hoehe;
    }

    /* **Wird hier nie gerechnet, ist der Weg nicht unschoen, sondern
       abgeschnitten.** `.feld` hat `overflow:hidden`. Ohne Massstab
       steht der rechte Teil des Weges ausserhalb und ist weg — bei
       Station I der ganze vierte Abschnitt, gemessen 444 Pixel, und
       man kommt nicht hin.

       `rechnen()` steigt aus, wenn das Feld (noch) keine Breite hat:
       im Hintergrundtab, bei spaeter eingeblendeten Elternelementen,
       bei verzoegertem Satz. Dafuer gab es einen einmaligen Versuch
       nach 400 ms — war das Feld dann immer noch ohne Breite, blieb
       der Weg fuer immer unskaliert. Ein `resize` reparierte es
       sofort, aber nur, wenn eines kam.

       Der `ResizeObserver` deckt alle diese Faelle ab: Er meldet sich,
       sobald das Feld eine Breite bekommt.

       **Ohne Bedingung.** Ein erster Versuch verglich die Breite mit
       der zuletzt gesehenen und rechnete nur bei Aenderung — das
       unterdrueckte genau die Rettung: Meldet das Ausblenden nichts,
       sieht das Einblenden dieselbe Breite wie vorher und tut nichts.
       Gegen die Schleife hilft stattdessen, dass `rechnen()` die Hoehe
       nur bei Aenderung schreibt (siehe oben). */
    rechnen();
    window.addEventListener('resize', rechnen);
    /* Schriften kommen nach und aendern die Breite. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rechnen).catch(function () {});
    }
    if (window.ResizeObserver) {
      new ResizeObserver(rechnen).observe(feld);
    } else {
      setTimeout(rechnen, 400);
    }
  }

  /* ==========================================================
     7 · Starthilfe, Loesung, GeoGebra — immer nur eine offen

     Untereinander wuchs die Tafel mit jedem Aufklappen, und wer die
     Loesung ansah, hatte die Starthilfe noch darueber stehen. Drei
     Reiter und **ein** Feld darunter halten die Hoehe ruhig.

     Der GeoGebra-Rahmen wird erst gebaut, wenn jemand ihn oeffnet.
     Sonst laedt jede Etappe beim Aufschlagen ungefragt ein Applet.
     ========================================================== */
  function stufenAufsetzen(kasten) {
    /* **`.hinaus` gehoert nicht in diese Reihe.** Der GeoGebra-Knopf
       schaltet ein Feld ausserhalb der Tafel (unter dem Video) und wird
       weiter unten eigens verdrahtet. Lief er hier mit, geschah beim
       Klick zweierlei: Das Applet ging auf — und `zeigen(undefined)`
       schloss im selben Atemzug Starthilfe und Loesung. Genau das
       Gegenteil dessen, was gewollt ist. */
    var knoepfe = [].slice.call(kasten.querySelectorAll('.reiter button:not(.hinaus)'));
    var felder = [].slice.call(kasten.querySelectorAll('.faltung'));

    function applet(feld) {
      if (feld.dataset.gebaut || !feld.dataset.applet) return;
      feld.dataset.gebaut = '1';
      var rahmen = document.createElement('iframe');
      rahmen.title = 'GeoGebra-Applet';
      rahmen.allowFullscreen = true;
      /* Ohne `allow-modals` darf die Anwendung beim Verlassen der Seite
         nicht mehr «Webseite verlassen?» fragen. */
      rahmen.setAttribute('sandbox', 'allow-scripts allow-same-origin '
        + 'allow-popups allow-forms allow-downloads');
      rahmen.src = 'https://www.geogebra.org/calculator/'
        + feld.dataset.applet + '?embed';
      feld.insertBefore(rahmen, feld.firstChild);
    }

    function zeigen(welche) {
      knoepfe.forEach(function (k) {
        k.setAttribute('aria-expanded', String(k.dataset.stufe === welche));
      });
      /* Starthilfe und Loesung schliessen jetzt auch das Applet — es
         steht ueber die ganze Breite, es kann nicht daneben stehen. */
      if (welche) {
        kasten.querySelectorAll('.reiter button.hinaus').forEach(function (a) {
          if (a.getAttribute('aria-expanded') !== 'true') return;
          var f = document.getElementById(a.dataset.ziel);
          if (f) f.hidden = true;
          a.setAttribute('aria-expanded', 'false');
        });
      }
      felder.forEach(function (f) {
        var auf = f.dataset.stufe === welche;
        f.hidden = !auf;
        if (auf) {
          applet(f);
          if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([f]).catch(function () {});
          }
        }
      });
    }

    knoepfe.forEach(function (k) {
      k.addEventListener('click', function () {
        /* Noch einmal auf denselben Reiter schliesst wieder. */
        zeigen(k.getAttribute('aria-expanded') === 'true' ? null : k.dataset.stufe);
      });
    });

    /* **Der GeoGebra-Knopf schaltet ein Feld AUSSERHALB der Tafel.**
       Das Applet steht jetzt unter Video UND Arbeitsspalte, ueber die
       ganze Seitenbreite — Rike, 25.08.2026: «Dann haben wir einfach
       ein riesiges, grosses, breites GeoGebra-Applet.»

       Damit faellt der Grund weg, aus dem es bisher NICHT schloss, was
       daneben offen war: Nebeneinander gab es Loesung und Applet nur,
       solange das Applet halb so breit war. Sie hat die Folge selbst
       benannt: «Das haette zur Folge, dass man die Loesungen nicht
       parallel lesen kann. Das heisst: entweder ist die Starthilfe
       offen oder die Loesung oder das Applet.» Genau so ist es jetzt —
       eine Reihe, ein Feld, egal wo das Feld steht. */
    kasten.querySelectorAll('.reiter button.hinaus').forEach(function (k) {
      var feld = document.getElementById(k.dataset.ziel);
      if (!feld) return;
      function schalten(auf) {
        if (auf) {
          /* Erst alles andere zu: die eigenen Reiter dieser Tafel ... */
          zeigen(null);
          /* ... und jedes Applet, das sonst noch offen steht. */
          document.querySelectorAll('.reiter button.hinaus').forEach(function (a) {
            if (a === k || a.getAttribute('aria-expanded') !== 'true') return;
            var f = document.getElementById(a.dataset.ziel);
            if (f) f.hidden = true;
            a.setAttribute('aria-expanded', 'false');
          });
        }
        k.setAttribute('aria-expanded', String(auf));
        feld.hidden = !auf;
        if (auf) applet(feld);
      }
      k.schaltenApplet = schalten;
      k.addEventListener('click', function () {
        schalten(k.getAttribute('aria-expanded') !== 'true');
      });
    });
  }

  /* ==========================================================
     Vorschaubilder ausserhalb der Etappe

     Unter dem Reiter «Video» an einer Aufgabe steht dasselbe
     Vorschaubild wie bei der Etappe — und auf der Aufgabenseite steht
     es ganz allein, ohne Etappe drumherum. Verdrahtet war bisher nur
     das der Etappe; ueberall sonst tat der Startknopf **nichts**.

     Kein `autoplay`: Safari und Firefox lassen ein Video mit Ton nicht
     von selbst anlaufen, und die Klickerlaubnis traegt nicht in einen
     Rahmen hinein, der durch denselben Klick erst entsteht. YouTube
     zeigt seinen eigenen Startknopf — ein Klick mehr, dafuer laeuft es
     ueberall.
     ========================================================== */
  function vorschauAufsetzen(v) {
    if (v.dataset.verdrahtet) return;
    v.dataset.verdrahtet = '1';
    v.addEventListener('click', function () {
      var kennung = v.getAttribute('data-video');
      if (!kennung) return;
      var ursprung = (window.location.protocol === 'file:')
                     ? '' : '&origin=' + encodeURIComponent(window.location.origin);
      var rahmen = document.createElement('iframe');
      rahmen.className = 'spieler';
      rahmen.setAttribute('allowfullscreen', '');
      rahmen.setAttribute('allow', 'encrypted-media; picture-in-picture');
      rahmen.setAttribute('title', 'Video');
      rahmen.src = 'https://www.youtube.com/embed/' + kennung
                 + '?rel=0&modestbranding=1&playsinline=1' + ursprung;
      v.innerHTML = '';
      v.classList.remove('vorschau');
      v.appendChild(rahmen);
    });
  }

  /* ---- Der Gedankengang wandert mit ------------------------------
     Rike am 23.08.: «Ich fände es gut, wenn oben bei dem Gedankengang
     immer der Teil gehighlightet wird, der gerade dran ist.»

     Beobachtet wird, welcher Abschnitt gerade im oberen Drittel des
     Fensters steht — nicht welcher am meisten zu sehen ist. Beim
     Lesen wandert das Auge von oben nach unten; der Abschnitt, dessen
     Anfang man eben passiert hat, ist der, in dem man liest.

     Faellt `IntersectionObserver` aus, bleibt die Reihe einfach ohne
     Auszeichnung — anklickbar ist sie ohnehin. */
  function gedankengangAufsetzen(reihe) {
    var teile = [].slice.call(document.querySelectorAll('.schulpraxis .teil'));
    if (!teile.length || !window.IntersectionObserver) return;
    var verweise = {};
    reihe.querySelectorAll('a[data-teil]').forEach(function (a) {
      verweise[a.getAttribute('data-teil')] = a;
    });
    var sichtbar = {};

    function zeichnen() {
      var jetzt = null;
      teile.forEach(function (t) {
        if (sichtbar[t.id]) jetzt = jetzt || t.id;
      });
      /* Nichts sichtbar (ganz unten angekommen)? Dann bleibt der
         letzte Abschnitt ausgezeichnet, statt dass alles erlischt. */
      if (!jetzt) {
        for (var i = teile.length - 1; i >= 0; i--) {
          if (teile[i].getBoundingClientRect().top < window.innerHeight / 2) {
            jetzt = teile[i].id;
            break;
          }
        }
      }
      Object.keys(verweise).forEach(function (k) {
        verweise[k].setAttribute('aria-current', k === jetzt ? 'true' : 'false');
      });
    }

    var waechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { sichtbar[e.target.id] = e.isIntersecting; });
      zeichnen();
    }, { rootMargin: '-12% 0px -62% 0px' });
    teile.forEach(function (t) { waechter.observe(t); });
    zeichnen();
  }

  /* ---- Die Arbeitsblattseite ---------------------------------------
     Sie hat nur einen Zweck: das Applet zu zeigen, auf das der QR-Code
     im Skript fuehrt. Es wird darum **sofort** geladen und nicht hinter
     einen Klick gelegt — anders als das Video auf der Etappenseite, wo
     der Film nur eines von mehreren Dingen ist.

     Dieselbe Adresse und dieselbe Sandbox wie in der Aufgabentafel:
     `geogebra.org/m/<buch>#material/<applet>` antwortet seit August
     2026 mit 502, `geogebra.org/calculator/<applet>` laeuft. */
  function arbeitsblattAufsetzen(feld) {
    if (feld.dataset.gebaut || !feld.dataset.applet) return;
    feld.dataset.gebaut = '1';
    var rahmen = document.createElement('iframe');
    rahmen.title = 'GeoGebra-Applet';
    rahmen.allowFullscreen = true;
    rahmen.setAttribute('sandbox', 'allow-scripts allow-same-origin '
      + 'allow-popups allow-forms allow-downloads');
    rahmen.loading = 'lazy';
    rahmen.src = 'https://www.geogebra.org/calculator/'
      + feld.dataset.applet + '?embed';
    feld.insertBefore(rahmen, feld.firstChild);
  }

  function los() {
    document.querySelectorAll('.arbeitsblatt .applet[data-applet]')
            .forEach(arbeitsblattAufsetzen);
    /* **Ein Applet in der Einblendung baut sich selbst auf.** Rike,
       24.08.2026: «Wenn hier ein Applet ohne Aufgabe eingebunden wird,
       immer direkt einbetten.» Der Rahmen haengt zu diesem Zeitpunkt in
       einer verborgenen Tafel; `loading="lazy"` sorgt dafuer, dass er
       erst laedt, wenn die Tafel wirklich aufgeht. Sonst zoege jede
       Etappenseite ein halbes Dutzend GeoGebra-Fenster nach. */
    document.querySelectorAll('.applet.eingebettet[data-applet]')
            .forEach(arbeitsblattAufsetzen);
    document.querySelectorAll('.gedankengang').forEach(gedankengangAufsetzen);
    document.querySelectorAll('.buch').forEach(buchAufsetzen);
    document.querySelectorAll('.videoblock').forEach(videoAufsetzen);
    document.querySelectorAll('.kartenbuehne').forEach(kartenAufsetzen);
    document.querySelectorAll('.h5p-buehne').forEach(rahmenNachfuehren);
    document.querySelectorAll('.etappe').forEach(etappeAufsetzen);
    document.querySelectorAll('.zeitstrahl').forEach(wegAnpassen);
    document.querySelectorAll('.stufen').forEach(stufenAufsetzen);
    /* Nach `etappeAufsetzen`, damit das Video der Etappe schon
       beansprucht ist und hier nicht doppelt verdrahtet wird. */
    document.querySelectorAll('.rahmen.vorschau[data-video]')
            .forEach(vorschauAufsetzen);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', los);
  } else {
    los();
  }
})();
