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

/* ============================================================
   Was den Studierenden vor der Prüfung gesagt wird

   Steht hier und nicht viermal in den Stationen: Der Text gilt für
   alle vier gleich, und was für alle gilt, soll man an EINER Stelle
   ändern können.

   Der Ton ist Absicht. Beide Fälle - Netz weg, Rechner weg - sind
   für die Prüfung harmlos (siehe UEBERGABE.md, «Was bei einem
   Ausfall passiert»). Wer das vorher weiss, gerät nicht in Panik und
   tut dann auch nicht das eine, was wirklich schadet: neu laden.

   Der Tabletabsatz ist Rikes Entscheidung vom 25.08.2026, wörtlich
   gemeint - kein Ständer, keine Vorschrift zur Haltung, keine
   Ermahnung. Begründung: ENTSCHEIDUNGEN.md, 25.08.
   ============================================================ */
const WENN_ETWAS_SCHIEFGEHT =
  '<h3>Wenn etwas schiefgeht</h3>' +
  '<p><b>Internet weg?</b> Arbeiten Sie einfach weiter. Diese Prüfung ist ' +
  'eine einzige geladene Seite — es wird nichts nachgeladen und während der ' +
  'Prüfung auch nichts hochgeladen. Nichts geht verloren. ' +
  '<b>Laden Sie die Seite nicht neu.</b> Das ist das Einzige, was hier ' +
  'wirklich schadet.</p>' +
  '<p><b>Rechner abgestürzt, Strom weg, versehentlich geschlossen?</b> ' +
  'Öffnen Sie <i>denselben Browser auf demselben Rechner</i> wieder und rufen ' +
  'Sie <i>dieselbe Seite</i> auf. Das Angefangene meldet sich von selbst.</p>' +
  '<p><b>Damit es gar nicht erst dazu kommt:</b> Stromkabel einstecken, und ' +
  'was Sie nicht brauchen, vorher schliessen.</p>' +
  '<p><b>Sie arbeiten auf einem Tablet?</b> Stellen Sie es so hin, dass die ' +
  'Kamera Sie sieht, solange Sie nicht schreiben. Zum Schreiben dürfen Sie es ' +
  'flach hinlegen — dann filmt die Kamera die Decke, und <b>das ist in ' +
  'Ordnung</b>. Der Ton läuft weiter, und darauf kommt es an. Nur ' +
  'ausschalten sollten Sie die Kamera nicht.</p>';

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

    /* ?werkstatt&offen=4,5 spielt einen ZWEITEN DURCHGANG durch: Nur
       diese Aufgaben werden gebaut, die uebrigen gelten als frueher
       vollstaendig geloest und bringen ihre Punkte mit.

       Ohne das liesse sich der Wiedereintritt gar nicht pruefen - der
       echte Weg dorthin fuehrt ueber Kamera, Sperrfrist und Code, und
       genau die Rechnung dahinter ist die heikle: Der Anteil muss
       ueber die ganze Station gehen, nicht nur ueber die
       wiedereroeffneten Aufgaben. */
    const offenP = new URLSearchParams(location.search).get('offen');
    if (offenP){
      const nrn = offenP.split(',').map(x => parseInt(x, 10))
                        .filter(n => n >= 1 && n <= def.aufgaben.length);
      if (nrn.length){ stand.offen = nrn; stand.durchgang = 2; }
    }

    aufgabenAufbauen();
    const band = el('div', 'warnung',
      '<b>Werkstattansicht.</b> Es wird nichts aufgezeichnet und nichts abgegeben. ' +
      'Die Aufgaben lassen sich ausfüllen und am Schluss auswerten.');
    band.style.cssText = 'margin:0;border-radius:0;border-left:0;border-right:0';
    document.body.insertBefore(band, document.body.children[1]);

    /* Nur in der Werkstatt: der Griff, an dem `pruefstand/richtigkeit.html`
       die gebauten Aufgaben fasst. Nicht in der echten Prüfung - dort
       soll `soll()` nicht mit einem Wort aus der Konsole zu holen sein.
       (Wasserdicht ist das nicht; die Aufgaben liegen als Quelltext im
       Browser. Aber es soll nicht bequemer sein als nötig.) */
    window.PIA.werkstatt = stand;
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

    /* «Wenn etwas schiefgeht» stand frueher auf einer eigenen Seite
       INNERHALB der Pruefung - zusammen mit einer wortgleichen Kopie
       von `startseite`, die hier eine Zeile darueber schon steht. Die
       Seite ist weg; der Notfalltext gehoert ohnehin hierher.

       Es ist die Stelle, an der jemand landet, dessen Rechner
       abgestuerzt ist und der die Seite neu aufruft - und es ist der
       letzte Moment vor der Aufnahme, in dem man in Ruhe liest, dass
       man die Seite auf keinen Fall neu laden soll. */
    const notfall = el('div');
    notfall.innerHTML = WENN_ETWAS_SCHIEFGEHT;
    blatt.appendChild(ausklapp('Wenn etwas schiefgeht', notfall));

    const tabellenHalter = el('div');
    function tabelleErneuern(){
      tabellenHalter.innerHTML = '';
      tabellenHalter.appendChild(punktetabelle(true));
      const punkte = def.aufgaben.reduce((x,a) => x + a.punkte, 0);
      const offenePunkte = def.aufgaben.filter(a => stand.offen.indexOf(a.nr) >= 0)
                                       .reduce((x,a) => x + a.punkte, 0);
      tabellenHalter.appendChild(el('p', 'hinweis', stand.durchgang > 1
        ? 'In diesem Durchgang sind ' + offenePunkte + ' von ' + punkte +
          ' Punkten zu holen. Für das Bestehen zählen alle Durchgänge zusammen.'
        : 'Zusammen ' + punkte + ' Punkte. Zum Bestehen brauchen Sie 80 % davon — ' +
          'und die Erklärungen dazu.'));
    }
    tabelleErneuern();
    blatt.appendChild(ausklapp('Aufgaben und Punkte', tabellenHalter));

    /* Liegt eine unterbrochene Prüfung? Dann zuerst die retten.

       ZWEI Fälle, nicht einer (Rike, 09.09.2026). Bis dahin hiess es
       immer «unterbrochen» - auch bei jemandem, der die Prüfung
       vollständig durchlaufen hatte und nur den Bestätigungsknopf
       nicht mehr gedrückt hat. Der las dann, etwas sei schiefgegangen,
       obwohl nichts schiefgegangen war.

       Erkennbar ist der Unterschied an `kopf.auswertung`: Die steht
       nur da, wenn `AUF.beenden()` gelaufen ist. */
    AUF.angefangenes().then(offen => {
      offen.filter(o => o.kopf && o.kopf.station === def.station).forEach(o => {
        const fertig = o.kopf.auswertung;
        const w = el('div', 'warnung');
        w.innerHTML = (fertig
            ? '<b>Eine abgeschlossene Prüfung wurde noch nicht abgegeben.</b><br>'
            : '<b>Eine unterbrochene Prüfung liegt noch hier.</b><br>') +
          (o.kopf.person || '') + ' · Durchgang ' + (o.kopf.durchgang || '?') +
          ' · ' + (o.gesichert ? new Date(o.gesichert).toLocaleString('de-CH') : '') +
          ' · ' + o.stuecke.length + ' Aufnahmestück' +
          (o.stuecke.length === 1 ? '' : 'e') + ' (' + o.mb + ' MB).<br>' +
          (fertig
            ? 'Sie ist fertig ausgewertet — es fehlt nur die Abgabe. Schnüren Sie ' +
              'das Paket und geben Sie es ab; Auswertung und Code bleiben, wie sie ' +
              'waren.'
            : 'Alles bis zum Abbruch ist gesichert. Sie können daraus ein Paket ' +
              'schnüren und abgeben — und dann neu beginnen.');
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

  /* Eine liegengebliebene Prüfung zum Abgeben bringen.

     ZWEI Wege, seit 09.09.2026. War die Prüfung fertig (`kopf.auswertung`
     steht), wird sie NICHT neu bewertet - es wird nur noch abgegeben.

     Warum das nötig war: Der Rettungsweg wertet aus dem Ereignisstrom
     neu aus, und dort gilt «was sich nicht zurücklesen lässt, zählt
     als nicht gelöst» (nachwerten.js, Regel 1). Er kann deshalb MEHR
     Aufgaben als offen sehen als der reguläre Abschluss - und stellte
     daraufhin einen ANDEREN Code aus als den, den die Person schon
     notiert hatte. Zwei Codes für dieselbe Sache, und niemand konnte
     sagen, welcher gilt. */
  function retten(angefangen){
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

    /* ---- Auswerten, was sich auswerten lässt ----
       Bis zum 25.08.2026 hat retten() nur das Paket geschnürt und
       gesagt «danach können Sie neu beginnen» - also die ganze Station
       noch einmal. Das ist mehr Strafe als nötig: Was richtig gelöst
       war, war richtig gelöst, auch wenn danach der Strom ausfiel.

       Ausgewertet wird aus dem Ereignisstrom gegen die Schnappschüsse
       (nachwerten.js), ohne eine Seite aufzubauen - die Aufgaben von
       damals sind mit dem Fenster verschwunden.

       Im Zweifel offen: Was sich nicht zurücklesen lässt, zählt als
       nicht gelöst. Siehe nachwerten.js, Regel 1. */
    const fertig = angefangen.kopf && angefangen.kopf.auswertung;
    const nach = fertig
      ? { erreicht: fertig.erreicht, moeglich: fertig.moeglich,
          aufgaben: fertig.aufgaben || [], unvollstaendig: false }
      : window.Nachwerten.bewerten(angefangen.ereignisse);
    const geloest = nach.aufgaben.filter(a => a.ganz).map(a => a.nr);
    const offen = fertig ? (fertig.offen || [])
      : def.aufgaben.map(a => a.nr).filter(nr => geloest.indexOf(nr) < 0);

    /* Der Code wird auf GESTERN datiert. Sonst griffe die Sperrfrist
       (am Ausstellungstag gilt ein Code nicht) und der Wiedereintritt
       wäre bis morgen versperrt - bei einer Abgabe ist die Frist
       gewollt, hier wäre sie eine zweite Strafe für einen Stromausfall. */
    const code = fertig ? (fertig.code || null)
      : offen.length
      ? CODE.ausstellen({ station: def.station,
                          durchgang: (angefangen.kopf && angefangen.kopf.durchgang) || 1,
                          offen: offen, person: angefangen.kopf && angefangen.kopf.person,
                          tag: CODE.tagesnummer() - 1 })
      : null;

    /* Die Auswertung gehört INS PAKET, nicht nur auf den Bildschirm:
       Wer beurteilt, soll sie sehen, ohne sie nachrechnen zu müssen.
       Deshalb erst anhängen, dann schnüren - in dieser Reihenfolge. */
    if (!fertig){
      const bilanz = { erreicht: nach.erreicht, moeglich: nach.moeglich,
                       offen: offen, code: code, gerettet: true,
                       aufgaben: nach.aufgaben };
      angefangen.ereignisse = (angefangen.ereignisse || [])
        .concat([Object.assign({ t: 0, was: 'auswertung' }, bilanz)]);
      /* Auch in den KOPF: Die Wiedergabe holt die Auswertung von dort
         (`kopf.auswertung`), nicht aus dem Ereignisstrom. Ohne das stünde
         eine gerettete Prüfung beim Beurteilen ohne Auswertung da. */
      angefangen.kopf = Object.assign({}, angefangen.kopf, { auswertung: bilanz });
    }
    const paket = AUF.paketAus(angefangen, { unterbrochen: !fertig });

    blatt.appendChild(el('div', 'warnung', fertig
      ? '<b>Diese Prüfung war fertig — nur abgegeben wurde sie nicht.</b> Die ' +
        'Auswertung von damals steckt im Paket und bleibt, wie sie war. Es fehlt ' +
        'nur noch die Abgabe.'
      : '<b>Diese Prüfung wurde unterbrochen.</b> Was bis dahin aufgenommen ' +
        'wurde, steckt im Paket. Geben Sie es ab — danach können Sie dort ' +
        'weitermachen, wo es aufgehört hat.'));

    /* --- Was schon gelöst ist --- */
    const uebersicht = el('div', 'ergebnis');
    uebersicht.appendChild(el('h3', null, fertig
      ? 'Ihr Ergebnis' : 'Was bis zur Unterbrechung stand'));
    const t = el('table');
    t.innerHTML = '<tr><th>Aufgabe</th><th>Stand</th></tr>';
    def.aufgaben.forEach(a => {
      const x = nach.aufgaben.find(y => y.nr === a.nr);
      const gel = geloest.indexOf(a.nr) >= 0;
      /* Im fertigen Fall wird berichtet, nicht aufgetragen: Wer
         bestanden hat, muss nichts wiederholen, und «noch einmal zu
         lösen» waere schlicht falsch. */
      const wort = fertig
                 ? (!x ? 'in einem früheren Durchgang gelöst'
                    : x.ganz ? 'vollständig richtig'
                    : x.erreicht > 0 ? 'teilweise richtig' : 'nicht richtig')
                 : gel ? 'vollständig richtig'
                 : !x ? 'nicht begonnen'
                 : x.erreicht > 0 ? 'teilweise — noch einmal zu lösen'
                 : 'noch einmal zu lösen';
      const klasse = fertig
                   ? (!x || x.ganz ? 'ganz' : x.erreicht > 0 ? 'teils' : 'nichts')
                   : gel ? 'ganz' : x && x.erreicht > 0 ? 'teils' : 'nichts';
      const tr = el('tr');
      tr.innerHTML = '<td>Aufgabe ' + a.nr + ' · ' + a.titel + '</td>' +
        '<td class="' + klasse + '">' + wort + '</td>';
      t.appendChild(tr);
    });
    uebersicht.appendChild(t);

    if (!code){
      uebersicht.appendChild(el('p', null, fertig
        ? '<b>Die Prüfung ist bestanden — Sie müssen nichts wiederholen.</b> ' +
          'Geben Sie das Paket ab; die Auswertung steckt darin.'
        : '<b>Alle Aufgaben sind gelöst.</b> Geben Sie das Paket ab und sagen Sie ' +
          'Ihrer Dozentin Bescheid — die Auswertung steckt darin.'));
    } else {
      uebersicht.appendChild(el('p', null,
        'Mit diesem Code steigen Sie wieder ein. Es sind dann nur noch ' +
        (offen.length === 1 ? 'Aufgabe ' + offen[0]
                            : 'die Aufgaben ' + offen.join(', ')) + ' zu lösen.'));
      uebersicht.appendChild(el('p', 'code', code));
      /* Der gerettete Code ist auf gestern datiert und gilt sofort; der
         Code einer fertigen Prüfung ist der von damals und trägt seine
         Sperrfrist mit. Beides zu sagen waere falsch. */
      uebersicht.appendChild(el('p', 'hinweis', (fertig
        ? 'Es ist derselbe Code, der schon am Ende der Prüfung dastand — nicht ' +
          'ein zweiter. '
        : 'Der Code gilt sofort. ') +
        'Schreiben Sie ihn auf, bevor Sie das Fenster schliessen. ' +
        '<b>Geben Sie zuerst das Paket ab</b> — ohne die Aufnahme zählt der ' +
        'bisherige Teil nicht.'));
    }
    if (nach.unvollstaendig)
      uebersicht.appendChild(el('p', 'hinweis',
        'Bei einzelnen Aufgaben lässt sich aus der Aufzeichnung nicht ' +
        'zweifelsfrei ablesen, was zuletzt eingetragen war. Die stehen oben ' +
        'als offen — im Zweifel lieber noch einmal.'));
    blatt.appendChild(uebersicht);

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
    const fussWort = el('span', 'zart',
      'Bitte zuerst Mikrofon und Kamera prüfen und einmal probeweise aufnehmen.');
    fuss.appendChild(zurueck); fuss.appendChild(fussWort);
    fuss.appendChild(el('span', 'luft')); fuss.appendChild(losKnopf);
    document.body.appendChild(fuss);

    probeKnopf.onclick = async () => {
      probeKnopf.disabled = true;
      probeBereich.innerHTML = '';
      let p;
      try {
        p = await AUF.probe(wert => {
          pegelBalken.style.width = Math.round(wert*100) + '%';
        }, spiegel);
        stand.geraet = p;
      } catch(e){
        probeBereich.appendChild(el('div', 'fehl',
          'Kein Zugriff auf Mikrofon oder Kamera. <b>Ohne Mikrofon kann die ' +
          'Prüfung nicht starten</b> — Sie müssen Ihre Überlegungen mitsprechen ' +
          'können. Erlauben Sie den Zugriff in der Adresszeile und versuchen Sie ' +
          'es noch einmal.'));
        probeKnopf.disabled = false;
        return;
      }

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

      /* --- Zweite Stufe: wirklich zwei Sekunden aufnehmen ---

         NEU (gemeinsam entschieden, 2026-08-22): Statt vor Safari zu
         warnen, wird die Aufnahme hier ausprobiert. Der Browsername
         sagt nichts darueber, ob es auf DIESEM Rechner traegt. */
      const lauf = el('div', 'schritt');
      lauf.appendChild(el('h2', null,
        '<span class="nr">4</span>Kurze Probeaufnahme'));
      lauf.appendChild(el('p', null,
        'Zwei Sekunden zur Probe — <b>sagen Sie etwas</b>. Danach hören und ' +
        'sehen Sie es gleich wieder. So wissen wir, dass es in Ihrem Browser ' +
        'wirklich funktioniert, statt es zu vermuten.'));
      const laufKnopf = el('button', 'tat', 'Probeaufnahme starten');
      laufKnopf.type = 'button';
      lauf.appendChild(laufKnopf);
      const laufStand = el('div');
      lauf.appendChild(laufStand);
      probeBereich.appendChild(lauf);

      laufKnopf.onclick = async () => {
        laufKnopf.disabled = true;
        laufStand.innerHTML = '';
        laufStand.appendChild(el('p', 'hinweis', '● Nimmt auf … zwei Sekunden.'));
        const [r, sp] = await Promise.all([
          AUF.probeMitRueckfall(p.spur, p.hatBild),
          AUF.speicherprobe()
        ]);
        laufStand.innerHTML = '';

        if (!r.gut){
          laufStand.appendChild(el('div', 'fehl',
            '<b>Die Probeaufnahme hat nicht geklappt.</b> ' + r.grund +
            '<br>Bitte versuchen Sie es in einem anderen Browser — ' +
            'Chrome, Edge, Firefox und Safari sollten alle gehen. ' +
            'Sagen Sie Ihrer Dozentin Bescheid, welcher es war.'));
          laufKnopf.disabled = false;
          return;
        }

        /* Ging es nur ohne Bild, wird mit Ton allein aufgezeichnet.
           Die Kamera bleibt trotzdem an - fuers Abfotografieren. */
        stand.mitBild = r.bild;
        if (p.hatBild && !r.bild)
          laufStand.appendChild(el('div', 'warnung',
            '<b>Nur der Ton wird aufgezeichnet.</b> Ihr Browser konnte Ton und ' +
            'Bild nicht zusammen aufnehmen. Das ist kein Hindernis — der Ton ' +
            'trägt Ihre Erklärungen, und darauf kommt es an. Die Kamera bleibt ' +
            'an, Sie können weiterhin ein Blatt abfotografieren.<br>' +
            '<span class="hinweis">Bitte sagen Sie Ihrer Dozentin, in welchem ' +
            'Browser das war.</span>'));

        r.spieler.controls = true;
        r.spieler.muted = false;
        if (r.bild){
          r.spieler.className = 'spiegel';
          r.spieler.style.width = '260px';
          r.spieler.style.transform = 'none';
        } else {
          r.spieler.style.width = '100%';
          r.spieler.style.maxWidth = '340px';
        }
        laufStand.appendChild(el('p', null,
          '<b>Hat geklappt.</b> Hören Sie kurz hinein — verstehen Sie sich?'));
        laufStand.appendChild(r.spieler);
        laufStand.appendChild(el('p', 'hinweis',
          'Format: ' + r.typ + ' · ' + r.brocken + ' Stücke, wieder ' +
          'zusammengesetzt · ' + Math.round(r.groesse/1024) + ' KB' +
          (r.bild ? ' · mit Bild' : ' · nur Ton')));

        if (!sp.gut) laufStand.appendChild(el('div', 'warnung',
          '<b>Zwischensicherung geht nicht.</b> ' + sp.grund +
          ' Die Prüfung läuft trotzdem — aber wenn der Browser abstürzt, ist ' +
          'die Aufnahme weg. Falls möglich: privates Fenster schliessen oder ' +
          'anderen Browser nehmen.'));

        laufKnopf.textContent = 'Probeaufnahme wiederholen';
        laufKnopf.className = 'neben';
        laufKnopf.disabled = false;
        losKnopf.disabled = false;
        fussWort.textContent = 'Mit dem Start beginnt die Aufnahme.';
      };
    };

    losKnopf.onclick = async () => {
      losKnopf.disabled = true;
      if (stand.geraet) stand.geraet.stopp();
      await AUF.starten({ person: stand.person, kuerzel: stand.kuerzel,
                          station: def.station, durchgang: stand.durchgang,
                          spur: stand.geraet.spur, mitBild: stand.mitBild });
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
    def.aufgaben.forEach(a => {
      if (stand.offen.indexOf(a.nr) < 0) return;
      stand.seiten.push({ art: 'aufgabe', aufgabe: a });
    });
    stand.seiten.push({ art: 'schluss' });

    /* Jede Aufgabe einmal aufbauen und behalten - beim Blättern
       bleiben die Eingaben stehen. */
    stand.seiten.forEach(s => {
      if (s.art !== 'aufgabe') return;
      const halter = el('div');
      const bau = window.PIA.Bau(s.aufgabe, halter);
      s.aufgabe.bauen(bau, window.PIA);

      /* ---- Der Schnappschuss ----
         Was hier ins Protokoll geht, ist die Aufgabe, WIE SIE DASTAND -
         mit den gezogenen Zahlen und der gezeichneten Ebene, aber ohne
         eine einzige Antwort. Er entsteht genau hier: nach dem Bauen,
         vor dem Nebenblatt, vor dem ersten Klick.

         Warum vorher und nicht bei der Abgabe: Eine Prüfung, die
         abstürzt, kommt nie zur Abgabe. Ohne diesen Eintrag wüsste man
         hinterher nicht, was gefragt war - die Werte sind im Browser
         gezogen und nirgends sonst aufgehoben.

         Warum kein Seed: siehe ENTSCHEIDUNGEN.md, 25.08.2026. */
      s.bild = {
        aufgabe: s.aufgabe.id, nr: s.aufgabe.nr, titel: s.aufgabe.titel,
        punkte: s.aufgabe.punkte,
        teile: bau.teile.map(t => ({ name: t.name, art: t.art, p: t.p,
                                    soll: t.soll(), sollRoh: t.sollRoh || null })),
        html: halter.innerHTML
      };
      AUF.M.aufgabeGebaut(s.bild);

      const nb = window.PIA.nebenblatt(s.aufgabe.id);
      halter.appendChild(nb.element);
      s.inhalt = halter;
      /* Welche Frage kommt, entscheidet der Durchgang: Beim
         Wiedereintritt bekommt dieselbe Aufgabe neue Zahlen - und
         eine andere Frage. */
      const fragen = s.aufgabe.erklaeren;
      s.erklaerfrage = fragen && fragen.length
        ? fragen[(stand.durchgang - 1) % fragen.length] : null;
      s.erklaert = false;
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
          s.art === 'aufgabe' ? 'Aufgabe ' + s.aufgabe.nr : 'Abschluss');
        b.type = 'button';
        if (k === stand.seite) b.setAttribute('aria-current', 'true');
        if (s.art === 'aufgabe' && s.teile && s.teile.every(t => t.gefuellt())
            && (!s.erklaerfrage || s.erklaert))
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

      if (s.art === 'aufgabe'){
        auftrag.innerHTML = '';
        auftrag.appendChild(el('span', 'rang', s.aufgabe.punkte +
          (s.aufgabe.punkte === 1 ? ' Punkt' : ' Punkte')));
        auftrag.appendChild(el('span', 'titel', 'Aufgabe ' + s.aufgabe.nr));
        auftrag.appendChild(el('span', 'text', s.aufgabe.auftrag));
        blatt.appendChild(s.inhalt);
        AUF.M.seite(s.aufgabe.nr, s.aufgabe.titel);
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
      /* Gekoppelte Teile teilen sich dieselben Felder: Vier Kriterien
         auf EINER Wurzelschar sind eine unausgefuellte Eingabe, nicht
         vier. Ohne das Zusammenfassen meldete die Fusszeile «4 Felder
         sind noch leer» fuer eine einzige leere Aufgabe. */
      const leer = s.art !== 'aufgabe' ? 0
        : new Set(s.teile.filter(t => !t.gefuellt())
                         .map(t => t.gekoppelt || t.name)).size;
      fussWort.textContent = s.art !== 'aufgabe' ? ''
        : leer ? (leer === 1 ? 'Ein Feld ist noch leer.' : leer + ' Felder sind noch leer.')
        : 'Alles ausgefüllt.';
      leisteZeichnen();
    }

    zurueck.onclick = () => zeigen(stand.seite - 1);
    weiter.onclick  = () => {
      const s = stand.seiten[stand.seite];
      if (s && s.art === 'aufgabe' && s.erklaerfrage && !s.erklaert)
        return erklaerHof(s, () => zeigen(stand.seite + 1));
      zeigen(stand.seite + 1);
    };

    /* NEU (gemeinsam entschieden, 2026-08-21): Der Knopf «Ich erkläre
       jetzt» ist entfallen. Er sollte eine Sprungmarke in die
       Zeitleiste setzen - aber das Aufschlagen der Seite tut das
       bereits (AUF.M.seite), und ein Knopf, der nichts tut, sieht aus
       wie ein Aufnahmeschalter. Genau der falsche Eindruck.

       Rikes Einwand: «Ich verstehe den Button nicht ganz genau, es
       nimmt ja eh auf.» Sie hat recht gehabt. */
    /* ---- Die Erklaerfrage beim Weitergehen ----

       Drei Anlaeufe hat diese Stelle gebraucht, und die ersten zwei
       waren falsch herum:

       1  Eine eigene Seite HINTER der Aufgabe. Dort erklaert man
          rekonstruierend - und beim Wiedereintritt kam dieselbe Frage,
          die schon beantwortet war.
       2  Ein Kasten UEBER der Aufgabe. Der las sich wie «erst
          erklaeren, dann rechnen», und genau andersherum ist es
          gemeint.
       3  Ein Knopf oben rechts. Der lud dazu ein, sofort zu druecken -
          also wieder vor dem Rechnen.

       Jetzt legt sich die Frage beim Klick auf «Weiter» vor die
       Aufgabe. Damit steht sie zwangslaeufig NACH dem Loesen, sie ist
       nicht zu uebersehen, und die Aufgabe bleibt dahinter sichtbar -
       man soll ja sehen, worauf sich die Frage bezieht.

       «Spaeter» gibt es trotzdem: Erzwingen laesst sich eine Erklaerung
       nicht, sie gibt keine Punkte. Wer sie ueberspringt, findet sie
       auf der Abschlussseite wieder aufgelistet. */
    function erklaerHof(s, weitergehen){
      const hof = el('div', 'erklaerhof');
      const d = el('div', 'erklaerstelle');
      d.appendChild(el('div', 'augen', 'Zusätzlich zu Aufgabe ' + s.aufgabe.nr));
      d.appendChild(el('h3', null, s.erklaerfrage));
      d.appendChild(el('p', null,
        'Antworten Sie <b>mündlich</b>, es gibt hier nichts zu tippen. Nehmen Sie ' +
        'sich Zeit — die Aufgabe bleibt dahinter stehen.'));

      const knoepfe = el('div', 'knoepfe');
      const fertig = el('button', 'tat', 'Ich habe es erklärt');
      fertig.type = 'button';
      fertig.onclick = () => {
        s.erklaert = true;
        AUF.M.erklaerung(s.aufgabe.nr, s.erklaerfrage);
        hof.remove(); leisteZeichnen(); weitergehen();
      };
      const spaeter = el('button', 'neben', 'Ich erkläre es später');
      spaeter.type = 'button';
      spaeter.onclick = () => { hof.remove(); weitergehen(); };
      knoepfe.appendChild(fertig); knoepfe.appendChild(spaeter);
      d.appendChild(knoepfe);
      hof.appendChild(d);
      document.body.appendChild(hof);
      fertig.focus();
    }

    function schlussBlatt(){
      const d = el('div', 'ergebnis');
      d.appendChild(el('h3', null, 'Bevor Sie abgeben'));
      const t = el('table');
      t.innerHTML = '<tr><th>Aufgabe</th><th>Ausgefüllt</th><th>Erklärt</th></tr>';
      const ohneErklaerung = [];
      stand.seiten.filter(s => s.art === 'aufgabe').forEach(s => {
        /* Gekoppelte Teile teilen sich Felder - hier dieselbe
           Zusammenfassung wie in der Fusszeile. */
        const leer = new Set(s.teile.filter(x => !x.gefuellt())
                                    .map(x => x.gekoppelt || x.name)).size;
        if (s.erklaerfrage && !s.erklaert) ohneErklaerung.push(s.aufgabe.nr);
        const tr = el('tr');
        tr.innerHTML = '<td>Aufgabe ' + s.aufgabe.nr + ' · ' + s.aufgabe.titel + '</td>' +
          '<td class="' + (leer ? 'teils' : 'ganz') + '">' +
          (leer ? leer + (leer>1 ? ' Eingaben leer' : ' Eingabe leer') : 'ausgefüllt') +
          '</td>';   /* die dritte Zelle kommt gleich, sie traegt einen Knopf */
        const zelle = el('td');
        if (!s.erklaerfrage){ zelle.textContent = '—'; }
        else if (s.erklaert){ zelle.className = 'ganz'; zelle.textContent = 'ja'; }
        else {
          /* Nachholen, ohne zurueckblaettern zu muessen. Wer hier steht
             und «Aufgabe 2 fehlt noch» liest, soll nicht erst suchen,
             wie er dorthin kommt. */
          zelle.className = 'teils';
          const nach = el('button', 'neben', 'Jetzt erklären');
          nach.type = 'button';
          nach.onclick = () => erklaerHof(s, () => zeigen(stand.seite));
          zelle.appendChild(nach);
        }
        tr.appendChild(zelle);
        t.appendChild(tr);
      });
      d.appendChild(t);
      d.appendChild(el('p', 'hinweis',
        'Leere Felder zählen als falsch. Wenn Sie etwas nicht wissen, sagen Sie ' +
        'es lieber in die Aufnahme, als es leer zu lassen.'));

      const knopf = el('button', 'tat', 'Prüfung abgeben');
      knopf.type = 'button';
      knopf.onclick = () => { knopf.disabled = true; abgeben(); };

      /* KEINE ABGABE OHNE ERKLAERUNGEN. Sie geben zwar keine Punkte -
         aber ohne sie ist die Pruefung nicht bestanden, das steht schon
         auf der Startseite. Eine Abgabe zuzulassen, bei der von vornherein
         etwas Notwendiges fehlt, waere eine Falle. */
      if (ohneErklaerung.length){
        knopf.disabled = true;
        const w = el('p', null,
          '<b>Noch nicht erklärt: ' + (ohneErklaerung.length === 1
            ? 'Aufgabe ' + ohneErklaerung[0]
            : 'Aufgaben ' + ohneErklaerung.join(', ')) + '.</b> ' +
          'Holen Sie das oben in der Tabelle nach — abgeben können Sie erst danach. ' +
          'Wer eine Aufgabe richtig hat, sie aber nicht erklären kann, hat sie ' +
          'nicht bestanden.');
        w.style.cssText = 'border-left:4px solid var(--akzent);padding-left:14px';
        d.appendChild(w);
      }
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

    const erreicht = ergebnis.reduce((x,a) => x + a.erreicht, 0);
    const offen = ergebnis.filter(a => !a.ganz).map(a => a.nr);

    /* ---- Punkte aus frueheren Durchgaengen zaehlen mit ----

       Wer eine Aufgabe nicht mehr wiederholen musste, hatte sie
       VOLLSTAENDIG richtig - also hat er ihre volle Punktzahl. Der
       mitgebrachte Stand ist damit aus der Bitmaske des
       Wiedereintrittscodes ableitbar, ohne ein einziges zusaetzliches
       Bit.

       Vorher rechnete der Anteil nur ueber die wiedereroeffneten
       Aufgaben. Das konnte jemanden durchfallen lassen, der ueber die
       ganze Station laengst ueber 80 % lag: drei Aufgaben ganz richtig
       (9 P), zwei wiederholt und dort 4 von 6 - ueber die Station 13
       von 15, also 87 %, nach alter Rechnung aber 67 %. Er waere an
       der Bezugsgroesse gescheitert, nicht an seiner Leistung. */
    const frueher = def.aufgaben.filter(a => stand.offen.indexOf(a.nr) < 0);
    const mitgebracht = frueher.reduce((x,a) => x + a.punkte, 0);
    const moeglich = def.aufgaben.reduce((x,a) => x + a.punkte, 0);
    const gesamt = mitgebracht + erreicht;
    const anteil = moeglich > 0 ? gesamt / moeglich : 0;

    /* ---- Bestanden heisst 80 %, nicht 100 % ----

       Hier stand frueher `anteil >= SCHWELLE && offen.length === 0`.
       Sind null Aufgaben offen, ist jeder Teil richtig und der Anteil
       damit 100 % - die zweite Bedingung machte die erste
       bedeutungslos. Der Entwurf hatte die beiden Regeln ausdruecklich
       auseinandergehalten: Teilpunkte entscheiden ueber die 80 %,
       Ganzheit darueber, welche Aufgaben im naechsten Durchgang
       wiederkommen. Zwei Fragen, nicht eine. */
    const bestanden = anteil >= SCHWELLE;

    const code = bestanden ? null
      : CODE.ausstellen({ station: def.station, durchgang: stand.durchgang,
                          offen: offen, person: stand.person });

    AUF.M.auswertung({ erreicht: gesamt, moeglich: moeglich, offen: offen,
                       code: code, bestanden: bestanden, aufgaben: ergebnis });

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
    d.appendChild(el('h3', null, stand.durchgang > 1
      ? 'Ihr Ergebnis über alle Durchgänge' : 'Ihr Ergebnis'));
    const t = el('table');
    t.innerHTML = '<tr><th>Aufgabe</th><th>Stand</th><th class="p">Punkte</th></tr>';
    /* Die Station steht ganz da, nicht nur dieser Durchgang - sonst
       liesse die Tabelle die mitgebrachten Punkte verschwinden, mit
       denen die Prozentzahl darunter gerechnet ist. */
    frueher.forEach(a => {
      const tr = el('tr');
      tr.innerHTML = '<td>Aufgabe ' + a.nr + ' · ' + a.titel + '</td>' +
        '<td class="ganz">in einem früheren Durchgang gelöst</td>' +
        '<td class="p">' + a.punkte + ' / ' + a.punkte + '</td>';
      t.appendChild(tr);
    });
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
    /* Die Prozentzelle bleibt blank: Das Urteil steht als Ueberschrift
       darunter, und `pruefstand/durchgang.html` liest diese Zeile mit
       einem Muster aus - jedes Wort dazwischen bricht es. */
    summe.innerHTML = '<td><b>Zusammen</b></td><td>' +
      Math.round(anteil*100) + ' %</td><td class="p"><b>' +
      Z.zahlText(gesamt,2) + ' / ' + moeglich + '</b></td>';
    t.appendChild(summe);
    d.appendChild(t);
    blatt.appendChild(d);

    /* --- Wie es weitergeht --- */
    const w = el('div', 'ergebnis');
    /* Drei Faelle, nicht zwei. Frueher verzweigte diese Stelle allein
       ueber `offen.length` - damit gab es «alles richtig» und «noch
       offen», aber keinen Platz fuer den haeufigsten Fall: bestanden
       mit ein paar Luecken. */
    /* Der Erfolg wird im selben Kasten nicht zurueckgenommen.

       Bis zum 09.09.2026 endeten BEIDE Bestanden-Zweige mit «Bis dahin
       gilt die Station als noch nicht bestanden» - unter einer
       Ueberschrift, die das Gegenteil sagte. Die Abnahme faellt nicht
       weg, sie wechselt die Richtung: aus der Einschraenkung wird eine
       Zusage. Wortlaut von Rike abgenommen, 09.09.2026. */
    const abnahme = () => el('p', null,
      'Was jetzt noch kommt: <b>Ich höre mir Ihre Erklärungen an</b> und gebe ' +
      'Ihnen über Moodle Rückmeldung. Damit haben Sie dann auch die Bestätigung, ' +
      'dass die Station bestanden ist.');

    if (bestanden && !offen.length){
      w.appendChild(el('h3', null, 'Bestanden — alle Aufgaben vollständig richtig'));
      w.appendChild(el('p', null,
        'Sie haben <b>' + Math.round(anteil*100) + ' %</b> erreicht, und jede ' +
        'Aufgabe war vollständig richtig. Damit ist die Prüfung bestanden, und ' +
        'Sie brauchen keinen zweiten Durchgang.'));
      w.appendChild(abnahme());
    } else if (bestanden){
      w.appendChild(el('h3', null, 'Bestanden — Sie müssen nichts wiederholen'));
      w.appendChild(el('p', null,
        'Sie haben <b>' + Math.round(anteil*100) + ' %</b> erreicht. Damit ist die ' +
        'Prüfung rechnerisch bestanden, und Sie brauchen keinen zweiten Durchgang.'));
      w.appendChild(el('p', null, (offen.length === 1
          ? 'Aufgabe ' + offen[0] + ' ist zwar nicht vollständig richtig'
          : 'Die Aufgaben ' + offen.join(', ') + ' sind zwar nicht vollständig richtig') +
        ' — <b>wiederholen müssen Sie deshalb nichts.</b> Für das Bestehen zählen ' +
        'die Punkte, nicht die Zahl der ganz gelösten Aufgaben.'));
      w.appendChild(abnahme());
    } else {
      w.appendChild(el('h3', null, 'Noch nicht bestanden'));
      w.appendChild(el('p', null,
        'Sie haben ' + Math.round(anteil*100) + ' % erreicht; zum Bestehen brauchen ' +
        'Sie 80 %. ' + (offen.length === 1
          ? 'Zu wiederholen ist Aufgabe ' + offen[0] + '.'
          : 'Zu wiederholen sind die Aufgaben ' + offen.join(', ') + '.') +
        ' Was Sie schon vollständig richtig hatten, bleibt Ihnen erhalten.'));
      const frei = new Date(Date.UTC(2026,0,1) + (CODE.tagesnummer() + 1) * 86400000);
      w.appendChild(el('p', null,
        'Sie müssen nicht auf eine Rückmeldung warten — aber <b>heute nicht mehr</b>. ' +
        'Zwischen zwei Versuchen liegt mindestens eine Nacht: Der Code unten wird ' +
        'am <b>' + CODE.datumText(frei) + '</b> frei. Sehen Sie sich bis dahin an, ' +
        'was nicht geklappt hat. Danach öffnen Sie die Station erneut und tragen ' +
        'den Code ein; dann bekommen Sie nur noch die offenen Aufgaben, mit neuen ' +
        'Zahlen.'));
      /* Der Code selbst steht NICHT hier, sondern unten in Schritt 4.

         Er stand bis zum 09.09.2026 an dieser Stelle, als grosser Block
         vor den Abgabeschritten - die lasen sich danach wie Beiwerk.
         Jetzt ordnet die Reihenfolge den Weg: Ergebnis, Urteil, dann
         die vier Schritte. Wer den Code lesen will, hat die drei
         anderen Schritte gesehen.

         An ZWEI Stellen steht er ausdruecklich nicht (Rike, 09.09.):
         Derselbe neunstellige Code doppelt laedt dazu ein, den falschen
         abzuschreiben, sobald einmal nur eine der beiden nachgezogen
         wird.

         AUSNAHME WERKSTATT: Dort gibt es gar keine Abgabeschritte (kein
         Paket, keine Abgabe) - der Code stuende also NIRGENDS. Genau das
         hat `pruefstand/durchgang.html` am 09.09.2026 gemeldet: 48 von
         48 Laeufen «kein Code ausgestellt». Es bleibt bei EINER Stelle,
         sie liegt nur woanders: entweder hier oder in Schritt 4, nie
         beides. */
      if (paket && !paket.werkstatt){
        w.appendChild(el('p', 'hinweis',
          'Der Code steht unten in <b>Schritt 4</b>.'));
      } else {
        w.appendChild(el('div', 'code', code));
        w.appendChild(el('p', 'hinweis',
          'In der Prüfung steht dieser Code in Schritt 4 der Abgabe; hier gibt ' +
          'es keine Abgabe, deshalb steht er an dieser Stelle.'));
      }
    }
    blatt.appendChild(w);

    /* --- Abgabe: speichern, ablegen, bestätigen, Code notieren --- */
    if (paket && !paket.werkstatt)
      abgabeschritte(blatt, paket, () => AUF.aufraeumen(paket.sitzung), code);
  }

  /* ============================================================
     Der Abgabeweg — drei Schritte, mit Code vier

     NEU (gemeinsam entschieden, 2026-08-21): Es wird nichts
     hochgeladen. SWITCHdrive nimmt kein PUT aus dem Browser
     entgegen - Rike hat das bei Kasper schon durchgespielt.
     Derselbe Weg wie dort: speichern, Abgabefenster oeffnen,
     hineinziehen, bestaetigen.

     Die heruntergeladene Datei bleibt liegen. Geht beim Ablegen
     etwas schief, laesst sie sich auf jedem anderen Weg schicken.

     Dieselben Schritte gelten fuer eine gerettete Aufnahme -
     deshalb steht das hier fuer sich und nicht in abgeben().
     Der Rettungsweg ruft OHNE `code` auf: Er zeigt Code und
     Uebersicht selbst, und derselbe Code an zwei Stellen waere
     genau der Fehler, den Schritt 4 vermeidet.

     UMBAU 09.09.2026 (Auftrag «Der Pruefungsabschluss»):

     - Schritt 4 kam dazu. Der Wiedereintrittscode stand vorher als
       grosser Block VOR den Schritten; die lasen sich danach wie
       Beiwerk. Jetzt ordnet die Reihenfolge den Weg.

     - Der Code ist dabei NICHT gesperrt und wird nicht
       freigeschaltet. Grund ist der Download-Fall: Klemmt der
       Download, darf Schritt 3 gar nicht gedrueckt werden - sonst
       ist die einzige Kopie weg. Haenge der Code an Schritt 3, saesse
       genau die Person ohne Code da, die ohnehin schon ein Problem
       hat. Ein Code hinter einer Sperre ist ein Code, den jemand
       nicht bekommt.

     - Schritt 1 behauptet nicht mehr, was er nicht weiss. Ein Klick
       auf <a download> meldet nichts zurueck; «✓ Gespeichert» war
       eine Vermutung. Jetzt fragt die Seite nach, und erst das Ja
       schaltet weiter. Das ist die einzige Stelle im Ablauf, an der
       eine Selbstauskunft etwas wert ist: Die Person kann nachsehen,
       die Seite nicht.

     - Schritt 3 hat zwei Knoepfe. Wer ehrlich ist und bei wem der
       Upload klemmt, konnte den einen Knopf nicht druecken - und
       liess damit auch das Raeumen aus, obwohl seine Aufnahme laengst
       sicher im Download-Ordner lag.

     BEIDE Knoepfe in Schritt 3 raeumen, auch der Notfallknopf. Wer
     bis dorthin kommt, hat Schritt 1 mit «Ja» bestaetigt; die Datei
     ist gesichert, egal auf welchem Weg sie zur Dozentin kommt.
     Geraeumt wird an Schritt 3 und nirgends frueher - sonst waere
     die Aufnahme weg, bevor jemand merkt, dass der Download nicht
     angekommen ist.
     ============================================================ */
  /* ============================================================
     Die Skizze zum Abgabefenster

     Gezeichnet statt fotografiert. Ein Screenshot veraltet mit der
     naechsten Fassung von SWITCHdrive, und niemand merkt es - die
     Seite behauptet dann, wie es aussieht, und liegt falsch. Eine
     Skizze behauptet nur, was gemeint ist.

     Sie zeigt BEIDE Wege, weil beide vorkommen: den Klick unten, der
     immer geht, und das Ziehen nach oben. Und sie zeigt den dritten,
     der wie ein Weg aussieht und keiner ist - das Ziehen nach unten.

     Alle Farben aus den Seitenvariablen, damit die Skizze zur Seite
     passt und nicht wie ein Fremdkoerper wirkt.
     ============================================================ */
  function abgabeskizze(){
    const d = el('div', 'skizze');
    d.innerHTML =
    '<svg viewBox="0 0 480 296" width="100%" style="max-width:480px;height:auto" ' +
         'role="img" aria-label="Skizze des Abgabefensters: oben das gestrichelte ' +
         'Feld zum Hineinziehen, unten der Knopf Hochladen zum Anklicken.">' +
      '<defs>' +
        '<marker id="pfeilgut" viewBox="0 0 10 10" refX="9" refY="5" ' +
                'markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--richtig)"/></marker>' +
        '<marker id="pfeilschlecht" viewBox="0 0 10 10" refX="9" refY="5" ' +
                'markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="var(--falsch)"/></marker>' +
      '</defs>' +

      /* das Fenster des Abgabeordners */
      '<rect x="14" y="30" width="286" height="250" rx="8" ' +
            'fill="var(--karte)" stroke="var(--linie)" stroke-width="1.5"/>' +
      '<rect x="14" y="30" width="286" height="26" rx="8" fill="var(--creme)"/>' +
      '<rect x="14" y="48" width="286" height="8" fill="var(--creme)"/>' +
      '<line x1="14" y1="56" x2="300" y2="56" stroke="var(--linie)" stroke-width="1.5"/>' +
      '<text x="26" y="48" font-size="12" fill="var(--matt)">Abgabeordner</text>' +

      /* oben: das gestrichelte Ziehfeld */
      '<rect x="30" y="70" width="254" height="62" rx="6" fill="none" ' +
            'stroke="var(--akzent)" stroke-width="2" stroke-dasharray="7 5"/>' +
      '<text x="157" y="96" font-size="12.5" text-anchor="middle" ' +
            'fill="var(--tinte)">Dateien hierhin ziehen</text>' +
      '<text x="157" y="114" font-size="11" text-anchor="middle" ' +
            'fill="var(--matt)">erscheint erst beim Ziehen</text>' +

      /* Mitte: die Dateiliste, nur angedeutet */
      '<line x1="30" y1="152" x2="284" y2="152" stroke="var(--linie)"/>' +
      '<line x1="30" y1="174" x2="284" y2="174" stroke="var(--linie)"/>' +
      '<line x1="30" y1="196" x2="284" y2="196" stroke="var(--linie)"/>' +

      /* unten: der Knopf */
      '<rect x="30" y="228" width="112" height="30" rx="6" ' +
            'fill="var(--papier)" stroke="var(--tinte)" stroke-width="1.5"/>' +
      '<text x="86" y="248" font-size="12.5" text-anchor="middle" ' +
            'fill="var(--tinte)">+ Hochladen</text>' +
      /* der Mauszeiger darauf */
      '<path d="M92,252 l0,17 l4.5,-4.5 l3,6.5 l3,-1.5 l-3,-6.5 l6,0 z" ' +
            'fill="var(--tinte)"/>' +

      /* Weg 1: klicken - geht immer */
      '<path d="M330,243 C300,243 290,243 146,243" fill="none" ' +
            'stroke="var(--richtig)" stroke-width="2" marker-end="url(#pfeilgut)"/>' +
      '<text x="336" y="239" font-size="12.5" fill="var(--richtig)">' +
        '<tspan x="336" dy="0">1 · hier klicken</tspan>' +
        '<tspan x="336" dy="15" font-size="11" fill="var(--matt)">geht immer</tspan>' +
      '</text>' +

      /* Weg 2: ziehen, aber nach oben */
      '<path d="M336,100 C320,100 310,100 290,100" fill="none" ' +
            'stroke="var(--richtig)" stroke-width="2" marker-end="url(#pfeilgut)"/>' +
      '<text x="342" y="96" font-size="12.5" fill="var(--richtig)">' +
        '<tspan x="342" dy="0">2 · oder hierhin</tspan>' +
        '<tspan x="342" dy="15" font-size="11" fill="var(--matt)">ziehen</tspan>' +
      '</text>' +

      /* der Irrweg: ziehen nach unten */
      '<path d="M336,170 C300,170 250,196 152,236" fill="none" ' +
            'stroke="var(--falsch)" stroke-width="2" stroke-dasharray="6 4" ' +
            'marker-end="url(#pfeilschlecht)"/>' +
      '<line x1="238" y1="186" x2="262" y2="210" stroke="var(--falsch)" stroke-width="2.5"/>' +
      '<line x1="262" y1="186" x2="238" y2="210" stroke="var(--falsch)" stroke-width="2.5"/>' +
      '<text x="342" y="166" font-size="12.5" fill="var(--falsch)">' +
        '<tspan x="342" dy="0">nicht hierhin</tspan>' +
        '<tspan x="342" dy="15" font-size="11" fill="var(--matt)">ziehen — es</tspan>' +
        '<tspan x="342" dy="14" font-size="11" fill="var(--matt)">passiert nichts</tspan>' +
      '</text>' +
    '</svg>';
    return d;
  }

  function abgabeschritte(blatt, paket, beiBestaetigung, code){
    const a = el('div', 'ergebnis');
    a.appendChild(el('h3', null, code
      ? 'Noch vier Schritte — dann sind Sie durch'
      : 'Noch drei Schritte — dann sind Sie durch'));
    a.appendChild(el('p', null,
      'Ihre Aufnahme ist fertig geschnürt. <b>Sie ist noch nirgends abgelegt.</b> ' +
      'Bitte gehen Sie die Schritte der Reihe nach durch, bevor Sie das Fenster ' +
      'schliessen.'));

    /* 1 · speichern */
    const s1 = el('div', 'schritt');
    s1.appendChild(el('h2', null, '<span class="nr">1</span>Aufnahme speichern'));
    s1.appendChild(el('p', 'hinweis', AUF.fundort()));
    const speichern = el('button', 'tat', 'Aufnahme speichern (' + paket.mb + ' MB)');
    speichern.type = 'button';
    s1.appendChild(speichern);

    /* Die Rueckfrage. Sie ersetzt das «✓ Gespeichert», das die Seite
       nicht wissen konnte. */
    const frage = el('div');
    frage.style.display = 'none';
    frage.style.marginTop = '12px';
    frage.appendChild(el('p', null,
      'Liegt <b>' + paket.name + '</b> jetzt in Ihrem Download-Ordner? ' +
      'Bitte sehen Sie nach.'));
    const jaKnopf = el('button', 'tat', 'Ja');
    jaKnopf.type = 'button';
    const neinKnopf = el('button', 'neben', 'Nein — nochmal versuchen');
    neinKnopf.type = 'button';
    neinKnopf.style.marginLeft = '8px';
    frage.appendChild(jaKnopf);
    frage.appendChild(neinKnopf);
    s1.appendChild(frage);

    /* Der Ausweg hier ist das GEGENTEIL von dem in Schritt 3: dort
       «weitergehen und die Datei anders schicken», hier
       «stehenbleiben und nichts raeumen». Beides muss dastehen, und
       beides muss verschieden klingen. */
    const klemmt = el('div', 'warnung',
      '<b>Finden Sie die Datei nicht?</b> Drücken Sie noch einmal auf ' +
      '«Aufnahme speichern». <b>Schliessen Sie dieses Fenster nicht und ' +
      'drücken Sie unten nichts</b>, solange die Datei nicht da ist — bis dahin ' +
      'ist Ihre Aufnahme nur hier im Browser gespeichert. Wenn Sie die Seite ' +
      'später wieder öffnen, können Sie sie von dort holen.');
    klemmt.style.display = 'none';
    s1.appendChild(klemmt);
    a.appendChild(s1);

    /* 2 · ablegen

       UMBAU 15.09.2026, nach der ersten echten Pruefung: Von zwei
       Abgaben kam eine nicht an, obwohl die Person geschrieben hatte,
       sie habe abgegeben. Am Code lag es nicht - nachgemessen wurde
       alles, vom Abgabelink bis zum Speicherplatz.

       Die Ursache ist die Oberflaeche von SWITCHdrive, und der Text
       hier fuehrte hinein statt vorbei. Rike: «Das Ablagefeld
       erscheint erst, wenn man irgendwie von seinem Ordner
       rueberzieht, dann erscheint es da oben. Man schiebt es nicht
       unten, da wo das Plus ist, rein, sondern muss es oben in dieses
       Feld reinschieben. Und das hat [sie] nicht gemacht.»

       Der alte Text sagte AUSSCHLIESSLICH «Ziehen Sie Ihre Datei
       hinein» - also genau den Weg, der stumm scheitert. Der Knopf
       unten ist immer sichtbar, das Ziehfeld oben erscheint erst
       waehrend des Ziehens. Wer ziehen will, sieht den Knopf und
       zielt nach unten. Dort wird nichts angenommen, und es kommt
       keine Fehlermeldung.

       Drei Aenderungen, alle aus Rikes Worten:

       1  DER KLICKWEG STEHT ZUERST. «Wenn man einfach unten auf
          hochladen klickt und sich ein Feld oeffnet, ist es kein
          Problem.» Nicht das Ziehen ist der Fehler, sondern das
          Ziehen nach UNTEN. Also wird der unproblematische Weg der
          Hauptweg und das Ziehen die Alternative - mit der Warnung
          dazu.

       2  DER BALKEN IST DAS ERKENNUNGSZEICHEN. «Es muss nachher,
          damit es klappt, so ein Balken erscheinen ... und wenn
          dieser Balken nicht erscheint, dann wird auch nichts
          hochgeladen. Und das muss den Studierenden klar sein.»

       3  EINE SKIZZE, DIE BEIDE WEGE ZEIGT. Von Rike so abgenommen.
          Gezeichnet, nicht fotografiert: Ein Screenshot veraltet mit
          der naechsten Fassung von SWITCHdrive, und niemand merkt es.
          Die Skizze zeigt, was gemeint ist, und behauptet nicht, wie
          es heute aussieht. */
    const s2 = el('div', 'schritt');
    s2.style.opacity = '.45';
    s2.appendChild(el('h2', null, '<span class="nr">2</span>Datei abgeben'));
    if (AUF.ablage()){
      s2.appendChild(el('p', null,
        'Es öffnet sich das Fenster mit dem Abgabeordner. Der Ordner nimmt Dateien ' +
        'nur entgegen; Sie sehen darin nichts von anderen.'));
      s2.appendChild(el('p', null,
        '<b>Der einfachste Weg:</b> unten auf <b>«+ Hochladen»</b> drücken und ' +
        '<b>' + paket.name + '</b> auswählen.'));
      s2.appendChild(el('p', null,
        '<b>Wenn Sie die Datei lieber hineinziehen:</b> Das gestrichelte Feld dafür ' +
        'liegt <b>oben</b> und erscheint erst, <i>während</i> Sie ziehen. Ziehen Sie ' +
        '<b>nicht</b> auf «+ Hochladen» unten — dort nimmt der Ordner nichts an, ' +
        'und es erscheint auch keine Fehlermeldung.'));
      s2.appendChild(abgabeskizze());
      s2.appendChild(el('p', 'warnung',
        '<b>Kein Balken, keine Abgabe.</b> Wenn es klappt, läuft ein ' +
        'Fortschrittsbalken; danach steht grün <b>«Dateien wurden hochgeladen»</b> ' +
        'mit Ihrem Dateinamen darunter. Warten Sie darauf, bevor Sie weitergehen.'));
    } else {
      s2.appendChild(el('p', null,
        'Es ist noch kein Abgabeordner eingerichtet. Schicken Sie die gespeicherte ' +
        'Datei Ihrer Dozentin.'));
    }
    const ablegen = el('button', 'tat', 'Abgabefenster öffnen');
    ablegen.type = 'button'; ablegen.disabled = true;
    if (AUF.ablage()) s2.appendChild(ablegen);

    /* Die Merkliste erscheint erst, wenn das Abgabefenster offen ist -
       vorher waere sie eine Wiederholung. Sie steht bewusst KURZ da:
       Das Abgabefenster liegt dann rechts ueber der Seite, und links
       bleibt nur ein Streifen sichtbar. Was dort steht, muss auf einen
       Blick lesbar sein. */
    const merkliste = el('div', 'merkliste');
    merkliste.style.display = 'none';
    merkliste.innerHTML =
      '<b>Im Abgabefenster:</b>' +
      '<ol>' +
      '<li>unten <b>«+ Hochladen»</b> drücken — oder <b>oben</b> ins gestrichelte ' +
      'Feld ziehen</li>' +
      '<li>den <b>Balken</b> abwarten</li>' +
      '<li>auf <b>«Dateien wurden hochgeladen»</b> warten</li>' +
      '<li>zurück auf diese Seite, Schritt 3</li>' +
      '</ol>';
    s2.appendChild(merkliste);
    a.appendChild(s2);

    /* 3 · bestätigen — zwei Wege, beide räumen */
    const s3 = el('div', 'schritt');
    s3.style.opacity = '.45';
    s3.appendChild(el('h2', null, '<span class="nr">3</span>Bestätigen'));
    /* UMBAU 15.09.2026: Die Frage lautete «Ist die Datei drüben
       angekommen?» - eine Frage nach dem Eindruck. Genau den hatte
       die Person, deren Abgabe nie ankam: Sie hatte gezogen, nichts
       war passiert, und sie hielt es fuer erledigt.

       Gefragt wird deshalb nach der MELDUNG, nicht nach dem Gefuehl.
       Sie ist das einzige, was von aussen belegt, dass etwas
       angekommen ist - und sie steht in SWITCHdrives Fenster, nicht
       in unserem. Wir koennen sie nicht pruefen; wir koennen nur
       genau genug danach fragen, dass ein Nein auffaellt. */
    s3.appendChild(el('p', null,
      'Stand im Abgabeordner die grüne Meldung <b>«Dateien wurden ' +
      'hochgeladen»</b> — mit <b>' + paket.name + '</b> darunter?'));
    const bestaetigen = el('button', 'tat', 'Ja — die Bestätigung stand da');
    bestaetigen.type = 'button'; bestaetigen.disabled = true;
    const notfall = el('button', 'neben',
      'Nein — ich schicke die Datei anders');
    notfall.type = 'button'; notfall.disabled = true;
    notfall.style.marginLeft = '8px';
    s3.appendChild(bestaetigen);
    s3.appendChild(notfall);
    const ansage = el('div', 'warnung');
    ansage.style.display = 'none';
    s3.appendChild(ansage);
    a.appendChild(s3);

    /* 4 · Code — von Anfang an lesbar, nie freigeschaltet */
    let s4 = null;
    if (code){
      s4 = el('div', 'schritt');
      s4.appendChild(el('h2', null,
        '<span class="nr">4</span>Wiedereintrittscode notieren'));
      s4.appendChild(el('p', null,
        'Für den zweiten Durchgang brauchen Sie diesen Code. Schreiben Sie ihn ' +
        'auf, <b>nachdem</b> Sie die Schritte 1 bis 3 erledigt haben — ohne die ' +
        'abgegebene Aufnahme zählt der bisherige Teil nicht.'));
      s4.appendChild(el('div', 'code', code));
      const kopieren = el('button', 'neben', 'Code kopieren');
      kopieren.type = 'button';
      kopieren.onclick = () => {
        navigator.clipboard.writeText(code).then(
          () => { kopieren.textContent = '✓ kopiert'; },
          () => { kopieren.textContent = 'bitte abschreiben'; });
      };
      s4.appendChild(kopieren);
      s4.appendChild(el('p', 'hinweis',
        'Der Code gehört zu Ihrem Namen und zum heutigen Datum; weitergeben nützt ' +
        'niemandem.'));
      a.appendChild(s4);
    }

    if (paket.gescheitert)
      a.appendChild(el('div', 'warnung', paket.gescheitert +
        ' Aufnahmestück(e) konnten nicht gesichert werden. Geben Sie die Datei ' +
        'trotzdem ab und sagen Sie Ihrer Dozentin Bescheid.'));
    blatt.appendChild(a);

    let fenster = null;

    speichern.onclick = () => {
      AUF.herunterladen(paket.paket, paket.name);
      AUF.merken('download-versucht');
      speichern.textContent = 'Nochmals speichern';
      speichern.className = 'neben';
      frage.style.display = '';
      klemmt.style.display = '';
    };

    /* Erst das Ja schaltet weiter. */
    jaKnopf.onclick = () => {
      AUF.merken('gespeichert');
      frage.style.display = 'none';
      klemmt.style.display = 'none';
      s1.classList.add('getan');
      s1.appendChild(el('p', 'hinweis',
        'Gut — <b>' + paket.name + '</b> liegt in Ihrem Download-Ordner.'));
      s2.style.opacity = '';
      if (AUF.ablage()) ablegen.disabled = false;
      else { bestaetigen.disabled = false; notfall.disabled = false;
             s3.style.opacity = ''; }
    };
    neinKnopf.onclick = () => {
      AUF.merken('download-fehlt');
      frage.style.display = 'none';
      speichern.className = 'tat';
      speichern.textContent = 'Aufnahme speichern (' + paket.mb + ' MB)';
      /* Die Warnung bleibt stehen: Sie ist jetzt der wichtigste Text
         auf der Seite. */
    };

    ablegen.onclick = () => {
      /* RECHTS statt in der Mitte. Vorher lag das Abgabefenster
         mittig ueber der Seite und verdeckte alles, was man dort
         gerade braucht. Am rechten Rand bleibt links ein Streifen
         der Seite stehen - und genau dort steht die Merkliste.
         Rikes Punkt: «Vielleicht koennten wir irgendwas, was wirklich
         klar ist fuer die Studierenden.» Ein Merksatz, den man
         waehrend des Abgebens noch sieht, ist klarer als einer, den
         man vorher gelesen hat. */
      const br = Math.min(860, Math.round(screen.width * 0.58));
      const ho = Math.min(780, Math.round(screen.height * 0.78));
      fenster = window.open(AUF.ablage(), 'piaabgabe',
        'width=' + br + ',height=' + ho +
        ',left=' + Math.max(0, screen.width - br - 24) +
        ',top=' + Math.round(screen.height * 0.08) + ',resizable=yes,scrollbars=yes');
      if (!fenster) window.open(AUF.ablage(), '_blank', 'noopener');
      AUF.merken('abgabefenster');
      ablegen.textContent = 'Abgabefenster nochmals öffnen';
      ablegen.className = 'neben';
      merkliste.style.display = '';
      merkliste.scrollIntoView({ block: 'center' });
      s3.style.opacity = '';
      bestaetigen.disabled = false;
      notfall.disabled = false;
    };

    /* Beide Knoepfe enden hier - gleicher Abschluss, gleiches
       Raeumen, verschiedene Ansage. */
    function abschliessen(wort, text){
      if (fenster && !fenster.closed){ try { fenster.close(); } catch(e){} }
      AUF.merken(wort);
      bestaetigen.disabled = true; notfall.disabled = true;
      bestaetigen.textContent = '✓ Danke';
      notfall.style.display = 'none';
      s3.classList.add('getan');
      if (text){ ansage.innerHTML = text; ansage.style.display = ''; }
      else s3.appendChild(el('p', 'hinweis',
        'Sie können das Fenster schliessen.'));
      s1.style.opacity = '.45'; s2.style.opacity = '.45';
      /* Erst JETZT die Zwischensicherung raeumen. Vorher waere sie
         weg, bevor die Datei wirklich angekommen ist. */
      if (beiBestaetigung) beiBestaetigung();
    }

    bestaetigen.onclick = () => abschliessen('abgegeben', null);
    notfall.onclick = () => abschliessen('abgabe-geklemmt',
      /* Der Vermerk kann NICHT mehr ins Paket: Das ist bei Schritt 1
         geschnuert und heruntergeladen, bevor Schritt 3 gedrueckt
         wird. Deshalb steht hier, dass die Person es in die E-Mail
         schreiben soll. */
      'Ihre Datei <b>' + paket.name + '</b> liegt in Ihrem Download-Ordner. ' +
      'Schicken Sie sie Ihrer Dozentin per E-Mail und schreiben Sie dazu, dass ' +
      'im Abgabeordner <b>keine Bestätigung</b> erschienen ist.');
  }
}

window.PIA.pruefung = pruefung;
window.PIA.STATIONSNAMEN = STATIONSNAMEN;
})();
