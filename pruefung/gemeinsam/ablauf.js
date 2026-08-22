/* ============================================================
   PIA - Ablauf einer Prüfung

   Einstieg mit Geräteprobe, Aufgabenfolge, Auswertung.
   Eine Station beschreibt nur ihre Aufgaben und ruft am Schluss
   PIA.pruefung({...}) auf.
   ============================================================ */
(function(){
'use strict';

const Z = window.Zahl, AUF = window.Aufnahme, CODE = window.Code;
const el = window.PIA.el, SCHWELLE = window.PIA.SCHWELLE;

const STATIONSNAMEN = {
  1: 'Komplexe Zahlen', 2: 'Komplexe Funktionen',
  3: 'Komplexe Folgen',  4: 'Komplexe Potenzen'
};

function pruefung(def){
  document.body.dataset.station = String(def.station);
  document.title = 'Station ' + def.station + ' · ' + STATIONSNAMEN[def.station];

  const stand = {
    person: '', kuerzel: '', durchgang: 1,
    offen: def.aufgaben.map(a => a.nr),     // welche Aufgaben zu lösen sind
    seite: 0, seiten: [], geraet: null
  };

  /* ?werkstatt haengt Einstieg und Aufnahme aus. Zum Anschauen und
     Pruefen gedacht - fuer Rike, die die Aufgaben sehen will, ohne
     dass dabei eine Sitzung entsteht. Nach demselben Muster wie
     KASPERs ?ansehen. Sichtbar gekennzeichnet, damit niemand sie
     versehentlich in diesem Zustand austeilt. */
  if (new URLSearchParams(location.search).has('werkstatt')){
    stand.person = 'Werkstatt';
    stand.kuerzel = 'werkstatt';
    aufgabenAufbauen();
    const band = el('div', 'warnung',
      '<b>Werkstattansicht.</b> Es wird nichts aufgezeichnet und nichts abgegeben. ' +
      'Die Aufgaben lassen sich ausfüllen und am Schluss auswerten.');
    band.style.cssText = 'margin:0;border-radius:0;border-left:0;border-right:0';
    document.body.insertBefore(band, document.body.children[1]);
    return;
  }

  einstieg();

  /* ============================================================
     1 · Titelseite und Geräteprobe

     Zwei getrennte Schritte. Die Titelseite traegt das Wimmelbild,
     den Stationsnamen und alles zum Nachlesen - aber noch keine
     Aufgabenleiste: Wer hier steht, hat die Pruefung nicht begonnen.
     Erst der Knopf fuehrt zur Geraeteprobe, und erst danach laeuft
     die Aufnahme.

     NEU (gemeinsam entschieden, 2026-08-21): Vorher stand alles auf
     einer Seite, und die Aufgabenleiste erschien mit einer ersten
     Seite «So laeuft es» - im Kopf stand dabei «ohne Aufnahme».
     Rike: «Der Clou an der Sache ist ja, dass die Pruefung immer mit
     Aufnahme laufen wird.» Der Zustand «schon drin, aber noch nicht
     aufgenommen» soll es gar nicht geben.
     ============================================================ */

  function punktetabelle(nurOffene){
    const t = el('table');
    t.innerHTML = '<tr><th>Aufgabe</th><th class="p">Punkte</th></tr>';
    def.aufgaben.forEach(a => {
      const dran = !nurOffene || stand.offen.indexOf(a.nr) >= 0;
      const tr = el('tr');
      tr.innerHTML = '<td' + (dran ? '' : ' style="opacity:.45"') + '>Aufgabe ' +
        a.nr + ' · ' + a.titel + (dran ? '' : ' — schon erledigt') + '</td>' +
        '<td class="p"' + (dran ? '' : ' style="opacity:.45"') + '>' + a.punkte + '</td>';
      t.appendChild(tr);
    });
    return t;
  }

  function ausklapp(titel, inhalt){
    const d = el('details', 'ausklapp');
    d.appendChild(el('summary', null, titel));
    const k = el('div', 'ausklappinhalt');
    if (typeof inhalt === 'string') k.innerHTML = inhalt;
    else k.appendChild(inhalt);
    d.appendChild(k);
    return d;
  }

  function einstieg(){
    document.body.innerHTML = '';
    document.body.classList.add('titelseite');
    const streifen = el('div', 'streifen',
      '<div class="grund"></div><h1>Station ' + def.station + '<span class="punktchen">·</span>' +
      STATIONSNAMEN[def.station] + '</h1>');
    document.body.appendChild(streifen);

    const haupt = el('main');
    const blatt = el('div', 'blatt');
    haupt.appendChild(blatt);
    document.body.appendChild(haupt);

    /* --- Wer sind Sie --- */
    const s1 = el('div', 'schritt');
    s1.appendChild(el('h2', null, '<span class="nr">1</span>Wer arbeitet hier?'));
    const nameFeld = el('input', 'feld');
    nameFeld.type = 'text'; nameFeld.placeholder = 'Vorname Nachname';
    nameFeld.style.width = '18em'; nameFeld.autocomplete = 'name';
    const z1 = el('div', 'zeile'); z1.appendChild(nameFeld);
    s1.appendChild(z1);
    s1.appendChild(el('p', 'hinweis',
      'Genau so wie in Moodle. Der Name bindet Ihre Aufnahme und Ihren ' +
      'Wiedereintrittscode an Sie.'));
    blatt.appendChild(s1);

    /* --- Wiedereintritt --- */
    const s2 = el('div', 'schritt');
    s2.appendChild(el('h2', null, '<span class="nr">2</span>Ist das ein zweiter Durchgang?'));
    s2.appendChild(el('p', 'hinweis',
      'Wenn Sie diese Station schon einmal bearbeitet haben, tragen Sie Ihren ' +
      'Code ein. Dann bekommen Sie nur noch die offenen Aufgaben — mit neuen ' +
      'Zahlen. Beim ersten Durchgang bleibt das Feld leer.'));
    const codeFeld = el('input', 'feld');
    codeFeld.type = 'text'; codeFeld.placeholder = 'z. B. K7M3-XQ2-9F';
    codeFeld.style.width = '13em'; codeFeld.style.textTransform = 'uppercase';
    const codeStand = el('div', 'lesestand');
    const z2 = el('div', 'zeile'); z2.appendChild(codeFeld); z2.appendChild(codeStand);
    s2.appendChild(z2);
    blatt.appendChild(s2);

    function codePruefen(){
      const roh = codeFeld.value.trim();
      codeStand.textContent = '';
      codeStand.className = 'lesestand';
      stand.offen = def.aufgaben.map(a => a.nr);
      stand.durchgang = 1;
      if (!roh) return true;
      const e = CODE.einloesen(roh, nameFeld.value);
      if (!e.gut){
        codeStand.textContent =
            e.grund === 'person'  ? 'Dieser Code gehört zu einem anderen Namen.'
          : e.grund === 'zufrueh' ? 'Dieser Code gilt erst ab dem ' +
              CODE.datumText(e.frei) + '. Zwischen zwei Versuchen liegt ' +
              'mindestens eine Nacht — sehen Sie sich die Aufgaben bis dahin ' +
              'noch einmal an.'
          : e.grund === 'zukunft' ? 'Dieser Code passt nicht zum heutigen Datum. ' +
              'Stimmt die Uhr Ihres Rechners?'
          : 'Diesen Code kann ich nicht lesen. Bitte noch einmal prüfen.';
        return false;
      }
      if (e.station !== def.station){
        codeStand.textContent = 'Dieser Code gehört zu Station ' + e.station + '.';
        return false;
      }
      stand.offen = e.offen;
      stand.durchgang = e.durchgang + 1;
      codeStand.className = 'lesestand gut';
      codeStand.textContent = 'Durchgang ' + stand.durchgang + ' — offen: ' +
        (e.offen.length ? 'Aufgabe ' + e.offen.join(', ') : 'nichts mehr');
      tabelleErneuern();
      return true;
    }
    codeFeld.addEventListener('blur', codePruefen);
    nameFeld.addEventListener('blur', () => { if (codeFeld.value.trim()) codePruefen(); });

    /* --- Zum Nachlesen --- */
    blatt.appendChild(ausklapp('Bitte vor der Prüfung lesen', def.startseite || ''));
    const tabellenHalter = el('div');
    tabellenHalter.appendChild(punktetabelle(true));
    function tabelleErneuern(){
      tabellenHalter.innerHTML = '';
      tabellenHalter.appendChild(punktetabelle(true));
    }
    blatt.appendChild(ausklapp('Aufgaben und Punkte', tabellenHalter));

    const istSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
    if (istSafari) blatt.appendChild(el('div', 'warnung',
      '<b>Bitte Chrome oder Edge verwenden.</b> Safari nimmt in einem anderen ' +
      'Format auf; die Aufnahme lässt sich danach schlechter ansehen.'));

    /* Liegt eine unterbrochene Prüfung? Dann zuerst die retten. */
    AUF.angefangenes().then(offen => {
      offen.filter(o => o.kopf && o.kopf.station === def.station).forEach(o => {
        const w = el('div', 'warnung');
        w.innerHTML = '<b>Eine unterbrochene Prüfung liegt noch hier.</b><br>' +
          (o.kopf.person || '') + ' · Durchgang ' + (o.kopf.durchgang || '?') +
          ' · ' + (o.gesichert ? new Date(o.gesichert).toLocaleString('de-CH') : '') +
          ' · ' + o.stuecke.length + ' Aufnahmestück' +
          (o.stuecke.length === 1 ? '' : 'e') + ' (' + o.mb + ' MB).<br>' +
          'Alles bis zum Abbruch ist gesichert. Sie können daraus ein Paket ' +
          'schnüren und abgeben — und dann neu beginnen.';
        const k = el('button', 'tat', 'Paket schnüren und abgeben');
        k.type = 'button';
        k.style.marginTop = '10px';
        k.onclick = () => { k.disabled = true; retten(o); };
        w.appendChild(k);
        blatt.insertBefore(w, blatt.firstChild);
      });
    });

    /* --- Weiter zur Geräteprobe --- */
    const fuss = el('div', 'fussleiste');
    const losKnopf = el('button', 'tat', 'Prüfung starten →');
    losKnopf.type = 'button'; losKnopf.disabled = true;
    const fussWort = el('span', 'zart');
    fuss.appendChild(fussWort);
    fuss.appendChild(el('span', 'luft'));
    fuss.appendChild(losKnopf);
    document.body.appendChild(fuss);

    function pruefeBereit(){
      const name = nameFeld.value.trim();
      const codeOk = !codeFeld.value.trim() ||
        (function(){ const e = CODE.einloesen(codeFeld.value, name); 
                     return e.gut && e.station === def.station; })();
      losKnopf.disabled = !(name.length >= 3 && codeOk);
      fussWort.textContent = name.length < 3 ? 'Bitte tragen Sie Ihren Namen ein.'
        : !codeOk ? 'Der Code stimmt noch nicht.'
        : 'Als Nächstes werden Mikrofon und Kamera geprüft.';
    }
    nameFeld.addEventListener('input', pruefeBereit);
    codeFeld.addEventListener('input', pruefeBereit);
    pruefeBereit();

    losKnopf.onclick = () => {
      if (codeFeld.value.trim() && !codePruefen()){ pruefeBereit(); return; }
      stand.person = nameFeld.value.trim();
      stand.kuerzel = stand.person.toLowerCase().replace(/[^a-zäöü]+/g,'-').slice(0,20);
      geraeteprobe();
    };
  }

  /* Eine unterbrochene Prüfung zum Abgeben bringen. Dieselbe
     Abschlussseite wie sonst - nur ohne Auswertung, denn wie weit
     jemand gekommen ist, steht im Protokoll und nicht hier. */
  function retten(angefangen){
    const paket = AUF.paketAus(angefangen);
    document.body.innerHTML = '';
    document.body.classList.add('titelseite');
    const streifen = el('div', 'streifen',
      '<div class="grund"></div><h1>Station ' + def.station + '<span class="punktchen">·</span>' +
      STATIONSNAMEN[def.station] + '</h1>');
    document.body.appendChild(streifen);
    const haupt = el('main');
    const blatt = el('div', 'blatt');
    haupt.appendChild(blatt);
    document.body.appendChild(haupt);

    blatt.appendChild(el('div', 'warnung',
      '<b>Gerettete Aufnahme.</b> Diese Prüfung wurde unterbrochen. Was bis ' +
      'dahin aufgenommen wurde, steckt im Paket — geben Sie es ab und sagen ' +
      'Sie Ihrer Dozentin Bescheid. Danach können Sie neu beginnen.'));
    abgabeschritte(blatt, paket, () => AUF.aufraeumen(angefangen.sitzung));

    const zurueck = el('button', 'neben', 'Zur Titelseite');
    zurueck.type = 'button';
    zurueck.style.marginTop = '14px';
    zurueck.onclick = () => einstieg();
    blatt.appendChild(zurueck);
  }

  function geraeteprobe(){
    document.body.innerHTML = '';
    document.body.classList.add('titelseite');
    const streifen = el('div', 'streifen',
      '<div class="grund"></div><h1>Station ' + def.station + '<span class="punktchen">·</span>' +
      STATIONSNAMEN[def.station] + '</h1>');
    document.body.appendChild(streifen);
    const haupt = el('main');
    const blatt = el('div', 'blatt');
    haupt.appendChild(blatt);
    document.body.appendChild(haupt);

    const s = el('div', 'schritt');
    s.appendChild(el('h2', null, '<span class="nr">3</span>Hören und sehen wir Sie?'));
    s.appendChild(el('p', null,
      'Die Aufnahme braucht <b>Mikrofon und Kamera</b>. Der Ton trägt Ihre ' +
      'Erklärungen, das Bild zeigt beim Ansehen, wo Sie überlegt haben — und Sie ' +
      'können damit ein Blatt Papier abfotografieren, ohne zum Handy zu greifen. ' +
      'Beides wird gesichert abgelegt und nach Semesterende gelöscht.'));
    const probeKnopf = el('button', 'tat', 'Mikrofon und Kamera prüfen');
    probeKnopf.type = 'button';
    s.appendChild(probeKnopf);
    const probeBereich = el('div');
    s.appendChild(probeBereich);
    blatt.appendChild(s);

    const pegel = el('div', 'pegel', '<i></i>');
    const pegelBalken = pegel.querySelector('i');
    const spiegel = el('video', 'spiegel');
    spiegel.playsInline = true; spiegel.muted = true;

    const fuss = el('div', 'fussleiste');
    const zurueck = el('button', 'neben', '← Zurück');
    zurueck.type = 'button';
    zurueck.onclick = () => { if (stand.geraet) stand.geraet.stopp(); einstieg(); };
    const losKnopf = el('button', 'tat', 'Los geht’s — Aufnahme starten');
    losKnopf.type = 'button'; losKnopf.disabled = true;
    const fussWort = el('span', 'zart', 'Bitte zuerst Mikrofon und Kamera prüfen.');
    fuss.appendChild(zurueck); fuss.appendChild(fussWort);
    fuss.appendChild(el('span', 'luft')); fuss.appendChild(losKnopf);
    document.body.appendChild(fuss);

    probeKnopf.onclick = async () => {
      probeKnopf.disabled = true;
      probeBereich.innerHTML = '';
      try {
        const p = await AUF.probe(wert => {
          pegelBalken.style.width = Math.round(wert*100) + '%';
        }, spiegel);
        stand.geraet = p;
        const z = el('div', 'zeile');
        z.style.alignItems = 'flex-start';
        const links = el('div');
        links.appendChild(el('p', 'hinweis', 'Sagen Sie etwas — der Balken muss ausschlagen.'));
        links.appendChild(pegel);
        z.appendChild(links);
        if (p.hatBild) z.appendChild(spiegel);
        probeBereich.appendChild(z);
        if (!p.hatBild) probeBereich.appendChild(el('div', 'warnung',
          'Ich bekomme kein Kamerabild. Die Prüfung läuft auch ohne — der Ton ' +
          'genügt. Sie können dann allerdings kein Blatt abfotografieren.'));
        losKnopf.disabled = false;
        fussWort.textContent = 'Mit dem Start beginnt die Aufnahme.';
      } catch(e){
        probeBereich.appendChild(el('div', 'fehl',
          'Kein Zugriff auf Mikrofon oder Kamera. <b>Ohne Mikrofon kann die ' +
          'Prüfung nicht starten</b> — Sie müssen Ihre Überlegungen mitsprechen ' +
          'können. Erlauben Sie den Zugriff in der Adresszeile und versuchen Sie ' +
          'es noch einmal.'));
        probeKnopf.disabled = false;
      }
    };

    losKnopf.onclick = async () => {
      losKnopf.disabled = true;
      if (stand.geraet) stand.geraet.stopp();
      await AUF.starten({ person: stand.person, kuerzel: stand.kuerzel,
                          station: def.station, durchgang: stand.durchgang,
                          spur: stand.geraet.spur });
      document.body.classList.remove('titelseite');
      aufgabenAufbauen();
    };
  }

  /* ============================================================
     2 · Die Aufgaben
     ============================================================ */
  function aufgabenAufbauen(){
    /* Seiten: die offenen Aufgaben in ihrer Reihenfolge, dazwischen
       die Erklärstellen, die dahinter gehören. */
    stand.seiten = [];
    if (def.startseite) stand.seiten.push({ art: 'start' });
    def.aufgaben.forEach(a => {
      if (stand.offen.indexOf(a.nr) < 0) return;
      stand.seiten.push({ art: 'aufgabe', aufgabe: a });
      (def.erklaerstellen || []).forEach(e => {
        if (e.nach === a.nr) stand.seiten.push({ art: 'erklaeren', frage: e.frage, nr: a.nr });
      });
    });
    stand.seiten.push({ art: 'schluss' });

    /* Jede Aufgabe einmal aufbauen und behalten - beim Blättern
       bleiben die Eingaben stehen. */
    stand.seiten.forEach(s => {
      if (s.art !== 'aufgabe') return;
      const halter = el('div');
      const bau = window.PIA.Bau(s.aufgabe, halter);
      s.aufgabe.bauen(bau, window.PIA);
      const nb = window.PIA.nebenblatt(s.aufgabe.id);
      halter.appendChild(nb.element);
      s.inhalt = halter;
      s.teile = bau.teile;
      const summe = bau.teile.reduce((x,t) => x + t.p, 0);
      if (Math.abs(summe - s.aufgabe.punkte) > 1e-6)
        console.warn('Punkte von ' + s.aufgabe.id + ': Teile ergeben ' + summe +
                     ', angekündigt sind ' + s.aufgabe.punkte);
    });

    document.body.innerHTML = '';
    const kopf = el('header');
    kopf.appendChild(el('div', 'marke'));
    kopf.appendChild(el('h1', null, 'Station ' + def.station + ' · ' + STATIONSNAMEN[def.station]));
    const standAnzeige = el('div', 'stand');
    standAnzeige.innerHTML = AUF.laeuft()
      ? '<span><span class="punkt laeuft"></span>Aufnahme läuft</span><span id="uhr">00:00</span>'
      : '<span>ohne Aufnahme</span>';
    kopf.appendChild(standAnzeige);
    document.body.appendChild(kopf);

    const leiste = el('nav', 'schritte');
    document.body.appendChild(leiste);
    const auftrag = el('div', 'auftrag');
    document.body.appendChild(auftrag);
    const haupt = el('main');
    document.body.appendChild(haupt);

    const fuss = el('div', 'fussleiste');
    const zurueck = el('button', 'neben', '← Zurück');
    const weiter = el('button', 'tat', 'Weiter →');
    zurueck.type = 'button'; weiter.type = 'button';
    fuss.appendChild(zurueck);
    fuss.appendChild(el('span', 'zart', ''));
    fuss.appendChild(el('span', 'luft'));
    fuss.appendChild(weiter);
    document.body.appendChild(fuss);
    const fussWort = fuss.querySelector('.zart');

    setInterval(() => {
      const s = Math.floor(AUF.dauer()/1000);
      const u = document.getElementById('uhr');
      if (u) u.textContent = String(Math.floor(s/60)).padStart(2,'0') + ':' +
                             String(s%60).padStart(2,'0');
    }, 1000);

    function leisteZeichnen(){
      leiste.innerHTML = '';
      stand.seiten.forEach((s, k) => {
        const b = el('button', null,
          s.art === 'start' ? 'So läuft es' :
          s.art === 'aufgabe' ? 'Aufgabe ' + s.aufgabe.nr :
          s.art === 'erklaeren' ? 'Erklären' : 'Abschluss');
        b.type = 'button';
        if (k === stand.seite) b.setAttribute('aria-current', 'true');
        if (s.art === 'aufgabe' && s.teile && s.teile.every(t => t.gefuellt()))
          b.classList.add('fertig');
        b.onclick = () => zeigen(k);
        leiste.appendChild(b);
      });
    }

    function zeigen(k){
      stand.seite = Math.max(0, Math.min(stand.seiten.length-1, k));
      const s = stand.seiten[stand.seite];
      haupt.scrollTop = 0;
      haupt.innerHTML = '';
      const blatt = el('div', 'blatt');
      haupt.appendChild(blatt);

      if (s.art === 'start'){
        auftrag.innerHTML = '';
        auftrag.appendChild(el('span', 'rang', 'zum Lesen'));
        auftrag.appendChild(el('span', 'titel', 'So läuft diese Station'));
        auftrag.appendChild(el('span', 'text',
          'Einmal durchlesen, dann geht es los. Sie können jederzeit hierher zurück.'));
        blatt.appendChild(startBlatt());
        AUF.merken('startseite');
      } else if (s.art === 'aufgabe'){
        auftrag.innerHTML = '';
        auftrag.appendChild(el('span', 'rang', s.aufgabe.punkte +
          (s.aufgabe.punkte === 1 ? ' Punkt' : ' Punkte')));
        auftrag.appendChild(el('span', 'titel', 'Aufgabe ' + s.aufgabe.nr));
        auftrag.appendChild(el('span', 'text', s.aufgabe.auftrag));
        blatt.appendChild(s.inhalt);
        AUF.M.seite(s.aufgabe.nr, s.aufgabe.titel);
      } else if (s.art === 'erklaeren'){
        auftrag.innerHTML = '';
        auftrag.appendChild(el('span', 'rang', 'ohne Punkte'));
        auftrag.appendChild(el('span', 'titel', 'Erklären'));
        auftrag.appendChild(el('span', 'text',
          'Sagen Sie es laut. Diese Stelle wird in der Aufnahme markiert.'));
        blatt.appendChild(erklaerBlatt(s));
      } else {
        auftrag.innerHTML = '';
        auftrag.appendChild(el('span', 'rang', 'Abschluss'));
        auftrag.appendChild(el('span', 'titel', 'Abgeben'));
        auftrag.appendChild(el('span', 'text',
          'Prüfen Sie, ob überall etwas steht. Nach dem Abgeben ist nichts mehr zu ändern.'));
        blatt.appendChild(schlussBlatt());
      }

      zurueck.style.visibility = stand.seite === 0 ? 'hidden' : 'visible';
      weiter.style.visibility = stand.seite === stand.seiten.length-1 ? 'hidden' : 'visible';
      const leer = s.art === 'aufgabe' ? s.teile.filter(t => !t.gefuellt()).length : 0;
      void leer;
      fussWort.textContent = s.art !== 'aufgabe' ? ''
        : leer ? (leer === 1 ? 'Ein Feld ist noch leer.' : leer + ' Felder sind noch leer.')
        : 'Alles ausgefüllt.';
      leisteZeichnen();
    }

    zurueck.onclick = () => zeigen(stand.seite - 1);
    weiter.onclick  = () => zeigen(stand.seite + 1);

    /* NEU (gemeinsam entschieden, 2026-08-21): Der Knopf «Ich erkläre
       jetzt» ist entfallen. Er sollte eine Sprungmarke in die
       Zeitleiste setzen - aber das Aufschlagen der Seite tut das
       bereits (AUF.M.seite), und ein Knopf, der nichts tut, sieht aus
       wie ein Aufnahmeschalter. Genau der falsche Eindruck.

       Rikes Einwand: «Ich verstehe den Button nicht ganz genau, es
       nimmt ja eh auf.» Sie hat recht gehabt. */
    function erklaerBlatt(s){
      const d = el('div', 'erklaerstelle');
      d.appendChild(el('div', 'augen', 'Erklärstelle nach Aufgabe ' + s.nr));
      d.appendChild(el('h3', null, s.frage));
      d.appendChild(el('p', null,
        'Antworten Sie mündlich — es gibt hier nichts zu tippen und keine ' +
        'Punkte zu holen. <b>Diese Seite ist in der Aufnahme markiert</b>, Ihre ' +
        'Dozentin findet die Stelle also wieder. Nehmen Sie sich Zeit; gehen ' +
        'Sie erst weiter, wenn Sie fertig sind.'));
      AUF.M.erklaerung(s.nr, s.frage);

      /* NEU (gemeinsam entschieden, 2026-08-21): Auch hier ein
         Nebenblatt. Rike: «Falls Sie was aufnotieren wollen. Es ist
         aber nicht zwingend notwendig.» Deshalb steht es zu, nicht
         auf, und die Beschriftung sagt, dass es freiwillig ist. */
      const halter = el('div');
      halter.appendChild(d);
      const nb = window.PIA.nebenblatt('erklaeren-' + s.nr,
        'Nebenblatt — falls Sie sich etwas notieren möchten (freiwillig)');
      halter.appendChild(nb.element);
      return halter;
    }

    function startBlatt(){
      const d = el('div', 'ergebnis');
      d.innerHTML = def.startseite || '';
      d.appendChild(punktetabelle(true));
      const punkte = def.aufgaben.reduce((x,a) => x + a.punkte, 0);
      const offenePunkte = stand.seiten.filter(s => s.art === 'aufgabe')
        .reduce((x,s) => x + s.aufgabe.punkte, 0);
      d.appendChild(el('p', 'hinweis', stand.durchgang > 1
        ? 'In diesem Durchgang sind ' + offenePunkte + ' von ' + punkte +
          ' Punkten zu holen. Für das Bestehen zählen alle Durchgänge zusammen.'
        : 'Zusammen ' + punkte + ' Punkte. Zum Bestehen brauchen Sie 80 % davon — ' +
          'und die Erklärungen dazu.'));
      return d;
    }

    function schlussBlatt(){
      const d = el('div', 'ergebnis');
      d.appendChild(el('h3', null, 'Bevor Sie abgeben'));
      const t = el('table');
      t.innerHTML = '<tr><th>Aufgabe</th><th>Stand</th></tr>';
      stand.seiten.filter(s => s.art === 'aufgabe').forEach(s => {
        const leer = s.teile.filter(x => !x.gefuellt()).length;
        const tr = el('tr');
        tr.innerHTML = '<td>Aufgabe ' + s.aufgabe.nr + ' · ' + s.aufgabe.titel + '</td>' +
          '<td class="' + (leer ? 'teils' : 'ganz') + '">' +
          (leer ? leer + ' Feld' + (leer>1?'er':'') + ' leer' : 'ausgefüllt') + '</td>';
        t.appendChild(tr);
      });
      d.appendChild(t);
      d.appendChild(el('p', 'hinweis',
        'Leere Felder zählen als falsch. Wenn Sie etwas nicht wissen, sagen Sie ' +
        'es lieber in die Aufnahme, als es leer zu lassen.'));
      const knopf = el('button', 'tat', 'Prüfung abgeben');
      knopf.type = 'button';
      knopf.onclick = () => { knopf.disabled = true; abgeben(); };
      d.appendChild(knopf);
      return d;
    }

    zeigen(0);
  }

  /* ============================================================
     3 · Auswertung
     ============================================================ */
  async function abgeben(){
    const aufgabenSeiten = stand.seiten.filter(s => s.art === 'aufgabe');

    /* Teilpunkte für die 80 %, Vollständigkeit für den Wiedereintritt. */
    const ergebnis = aufgabenSeiten.map(s => {
      const teile = s.teile.map(t => ({ name: t.name, p: t.p, ok: !!t.pruefen(),
                                        gegeben: t.gegeben(), soll: t.soll() }));
      const erreicht = teile.reduce((x,t) => x + (t.ok ? t.p : 0), 0);
      return { nr: s.aufgabe.nr, id: s.aufgabe.id, titel: s.aufgabe.titel,
               moeglich: s.aufgabe.punkte, erreicht: erreicht,
               ganz: teile.every(t => t.ok), teile: teile };
    });

    const moeglich = ergebnis.reduce((x,a) => x + a.moeglich, 0);
    const erreicht = ergebnis.reduce((x,a) => x + a.erreicht, 0);
    const offen = ergebnis.filter(a => !a.ganz).map(a => a.nr);
    const anteil = moeglich > 0 ? erreicht / moeglich : 0;

    const code = offen.length
      ? CODE.ausstellen({ station: def.station, durchgang: stand.durchgang,
                          offen: offen, person: stand.person })
      : null;

    AUF.M.auswertung({ erreicht: erreicht, moeglich: moeglich, offen: offen,
                       code: code, aufgaben: ergebnis });

    document.body.innerHTML = '';
    const kopf = el('header');
    kopf.appendChild(el('div', 'marke'));
    kopf.appendChild(el('h1', null, 'Station ' + def.station + ' · Abgeschlossen'));
    document.body.appendChild(kopf);
    const haupt = el('main');
    const blatt = el('div', 'blatt');
    haupt.appendChild(blatt);
    document.body.appendChild(haupt);

    const warten = el('div', 'ergebnis');
    warten.appendChild(el('h3', null, 'Die Aufnahme wird abgeschlossen …'));
    warten.appendChild(el('p', 'hinweis', 'Bitte das Fenster noch nicht schliessen.'));
    blatt.appendChild(warten);

    const paket = await AUF.beenden({ erreicht: erreicht, moeglich: moeglich,
                                      offen: offen, code: code });
    warten.remove();

    /* --- Ergebnis --- */
    const d = el('div', 'ergebnis');
    const geschafft = anteil >= SCHWELLE && offen.length === 0;
    d.appendChild(el('h3', null, 'Ihr Ergebnis in diesem Durchgang'));
    const t = el('table');
    t.innerHTML = '<tr><th>Aufgabe</th><th>Stand</th><th class="p">Punkte</th></tr>';
    ergebnis.forEach(a => {
      const tr = el('tr');
      const klasse = a.ganz ? 'ganz' : a.erreicht > 0 ? 'teils' : 'nichts';
      const wort = a.ganz ? 'vollständig richtig'
                 : a.erreicht > 0 ? 'teilweise richtig' : 'nicht richtig';
      tr.innerHTML = '<td>Aufgabe ' + a.nr + ' · ' + a.titel + '</td>' +
        '<td class="' + klasse + '">' + wort + '</td>' +
        '<td class="p">' + Z.zahlText(a.erreicht,2) + ' / ' + a.moeglich + '</td>';
      t.appendChild(tr);
    });
    const summe = el('tr');
    summe.innerHTML = '<td><b>Zusammen</b></td><td>' +
      Math.round(anteil*100) + ' %</td><td class="p"><b>' +
      Z.zahlText(erreicht,2) + ' / ' + moeglich + '</b></td>';
    t.appendChild(summe);
    d.appendChild(t);
    blatt.appendChild(d);

    /* --- Wie es weitergeht --- */
    const w = el('div', 'ergebnis');
    if (!offen.length){
      w.appendChild(el('h3', null, 'Alle Aufgaben vollständig richtig'));
      w.appendChild(el('p', null,
        'Für diese Station ist rechnerisch alles erledigt. Es fehlt nur noch, ' +
        'dass Ihre Erklärungen angehört werden — die Rückmeldung dazu kommt ' +
        'über Moodle. <b>Bis dahin gilt die Station als noch nicht bestanden.</b>'));
    } else {
      w.appendChild(el('h3', null, 'Was noch offen ist'));
      w.appendChild(el('p', null, offen.length === 1
        ? 'Aufgabe ' + offen[0] + ' ist noch nicht vollständig richtig.'
        : 'Diese Aufgaben sind noch nicht vollständig richtig: ' + offen.join(', ') + '.'));
      const frei = new Date(Date.UTC(2026,0,1) + (CODE.tagesnummer() + 1) * 86400000);
      w.appendChild(el('p', null,
        'Sie müssen nicht auf eine Rückmeldung warten — aber <b>heute nicht mehr</b>. ' +
        'Zwischen zwei Versuchen liegt mindestens eine Nacht: Der Code unten wird ' +
        'am <b>' + CODE.datumText(frei) + '</b> frei. Sehen Sie sich bis dahin an, ' +
        'was nicht geklappt hat. Danach öffnen Sie die Station erneut und tragen ' +
        'den Code ein; dann bekommen Sie nur noch die offenen Aufgaben, mit neuen ' +
        'Zahlen:'));
      w.appendChild(el('div', 'code', code));
      const kopieren = el('button', 'neben', 'Code kopieren');
      kopieren.type = 'button';
      kopieren.onclick = () => {
        navigator.clipboard.writeText(code).then(
          () => { kopieren.textContent = '✓ kopiert'; },
          () => { kopieren.textContent = 'bitte abschreiben'; });
      };
      w.appendChild(kopieren);
      w.appendChild(el('p', 'hinweis',
        'Schreiben Sie ihn sicherheitshalber auf. Der Code gehört zu Ihrem Namen ' +
        'und zum heutigen Datum; weitergeben nützt niemandem.'));
    }
    blatt.appendChild(w);

    /* --- Abgabe: speichern, ablegen, bestätigen --- */
    if (paket && !paket.werkstatt)
      abgabeschritte(blatt, paket, () => AUF.aufraeumen(paket.sitzung));
  }

  /* ============================================================
     Der Abgabeweg — drei Schritte

     NEU (gemeinsam entschieden, 2026-08-21): Es wird nichts
     hochgeladen. SWITCHdrive nimmt kein PUT aus dem Browser
     entgegen - Rike hat das bei Kasper schon durchgespielt.
     Derselbe Weg wie dort: speichern, Abgabefenster oeffnen,
     hineinziehen, bestaetigen. Jeder Schritt schaltet den naechsten
     frei, damit niemand in der Mitte aufhoert.

     Die heruntergeladene Datei bleibt liegen. Geht beim Ablegen
     etwas schief, laesst sie sich auf jedem anderen Weg schicken.

     Dieselben Schritte gelten fuer eine gerettete Aufnahme -
     deshalb steht das hier fuer sich und nicht in abgeben().
     ============================================================ */
  function abgabeschritte(blatt, paket, beiBestaetigung){
    const a = el('div', 'ergebnis');
    a.appendChild(el('h3', null, 'Noch drei Schritte — dann sind Sie durch'));
    a.appendChild(el('p', null,
      'Ihre Aufnahme ist fertig geschnürt. <b>Sie ist noch nirgends abgelegt.</b> ' +
      'Bitte gehen Sie die drei Schritte durch, bevor Sie das Fenster schliessen.'));

    /* 1 · speichern */
    const s1 = el('div', 'schritt');
    s1.appendChild(el('h2', null, '<span class="nr">1</span>Aufnahme speichern'));
    s1.appendChild(el('p', 'hinweis', AUF.fundort()));
    const speichern = el('button', 'tat', 'Aufnahme speichern (' + paket.mb + ' MB)');
    speichern.type = 'button';
    s1.appendChild(speichern);
    a.appendChild(s1);

    /* 2 · ablegen */
    const s2 = el('div', 'schritt');
    s2.style.opacity = '.45';
    s2.appendChild(el('h2', null, '<span class="nr">2</span>Datei abgeben'));
    s2.appendChild(el('p', null, AUF.ablage()
      ? 'Es öffnet sich ein Fenster mit dem Abgabeordner. Ziehen Sie Ihre Datei ' +
        'hinein — der Ordner nimmt Dateien nur entgegen, Sie sehen darin nichts ' +
        'von anderen.'
      : 'Es ist noch kein Abgabeordner eingerichtet. Schicken Sie die gespeicherte ' +
        'Datei Ihrer Dozentin.'));
    const ablegen = el('button', 'tat', 'Abgabefenster öffnen');
    ablegen.type = 'button'; ablegen.disabled = true;
    if (AUF.ablage()) s2.appendChild(ablegen);
    a.appendChild(s2);

    /* 3 · bestätigen */
    const s3 = el('div', 'schritt');
    s3.style.opacity = '.45';
    s3.appendChild(el('h2', null, '<span class="nr">3</span>Bestätigen'));
    s3.appendChild(el('p', null,
      'Wenn die Datei drüben angekommen ist, drücken Sie hier. Erst dann gilt ' +
      'die Prüfung als abgegeben.'));
    const bestaetigen = el('button', 'tat', 'Ich habe abgegeben');
    bestaetigen.type = 'button'; bestaetigen.disabled = true;
    s3.appendChild(bestaetigen);
    a.appendChild(s3);

    a.appendChild(el('p', 'hinweis',
      'So heisst Ihre Datei: <b>' + paket.name + '</b>. ' +
      'Sie bleibt in Ihrem Download-Ordner liegen — geht beim Ablegen etwas ' +
      'schief, können Sie sie auf jedem anderen Weg schicken.'));
    if (paket.gescheitert)
      a.appendChild(el('div', 'warnung', paket.gescheitert +
        ' Aufnahmestück(e) konnten nicht gesichert werden. Geben Sie die Datei ' +
        'trotzdem ab und sagen Sie Ihrer Dozentin Bescheid.'));
    blatt.appendChild(a);

    let fenster = null;
    speichern.onclick = () => {
      AUF.herunterladen(paket.paket, paket.name);
      AUF.merken('gespeichert');
      speichern.textContent = '✓ Gespeichert — nochmals speichern';
      speichern.className = 'neben';
      s2.style.opacity = '';
      if (AUF.ablage()) ablegen.disabled = false;
      else { bestaetigen.disabled = false; s3.style.opacity = ''; }
    };
    ablegen.onclick = () => {
      const br = Math.min(900, Math.round(screen.width * 0.62));
      const ho = Math.min(760, Math.round(screen.height * 0.74));
      fenster = window.open(AUF.ablage(), 'piaabgabe',
        'width=' + br + ',height=' + ho +
        ',left=' + Math.round((screen.width - br)/2) +
        ',top=' + Math.round((screen.height - ho)/2.6) + ',resizable=yes,scrollbars=yes');
      if (!fenster) window.open(AUF.ablage(), '_blank', 'noopener');
      AUF.merken('abgabefenster');
      ablegen.textContent = 'Abgabefenster nochmals öffnen';
      ablegen.className = 'neben';
      s3.style.opacity = '';
      bestaetigen.disabled = false;
    };
    bestaetigen.onclick = () => {
      if (fenster && !fenster.closed){ try { fenster.close(); } catch(e){} }
      AUF.merken('abgegeben');
      bestaetigen.disabled = true;
      bestaetigen.textContent = '✓ Danke — Sie können das Fenster schliessen';
      s1.style.opacity = '.45'; s2.style.opacity = '.45';
      /* Erst JETZT die Zwischensicherung raeumen. Vorher waere sie
         weg, bevor die Datei wirklich angekommen ist. */
      if (beiBestaetigung) beiBestaetigung();
    };
  }
}

window.PIA.pruefung = pruefung;
window.PIA.STATIONSNAMEN = STATIONSNAMEN;
})();
