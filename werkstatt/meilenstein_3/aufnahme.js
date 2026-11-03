/* Aufnahme fuer Sortierflaechen - die schlanke Fassung.
 *
 * ZWISCHENLOESUNG, 2026-08-21. bauen/aufnahme.js kann alles, was hier
 * steht, und mehr - aber es haengt an SORTs Klassenkuerzeln und an der
 * Pfadlogik der Studienseiten. Es zu verallgemeinern ist eine eigene
 * Aufgabe; sie steht in TODO_A1.md. Bis dahin dieses hier, nach
 * demselben Muster gebaut: Ereignisse mit Zeitstempel, Ton in Brocken,
 * am Ende beides zum Speichern.
 *
 * HIERHER GEZOGEN am 2026-09-08. Die Datei lag in
 * projekte/daten_und_zufall/themen/kombinatorik/ und wurde von den drei
 * anderen Flaechen jenes Projekts und von «Komplexe Zahlen» dorthin
 * mitbenutzt. Damit hing ein Projekt an einem anderen. Sie liegt jetzt
 * neben paket.js und rueckmeldung.js in bauen/, aus demselben Grund,
 * den Rike fuer die Rueckmeldung genannt hat: «Wir bauen das
 * themenunabhaengig und koennen es dann immer zuschalten bei Bedarf.»
 * Der Kern holt sie von hier, ohne dass ein Thema sie nennen muss.
 *
 * Der Name ist nicht `aufnahme.js`, weil daneben in bauen/ schon SORTs
 * grosse Fassung unter diesem Namen liegt. Im Ausgabeordner heisst sie
 * weiterhin `aufnahme.js` - nur das Original traegt den Zusatz.
 *
 * KEINE Ablageadresse. Es wird nichts hochgeladen; die Gruppe speichert
 * selbst. Erhebungsmaterial gehoert nie ins Repository.
 */
(function(){
  const A = {
    laeuft: false, t0: 0, ereignisse: [], brocken: [],
    aufnehmer: null, spur: null, pegel: 0
  };
  const jetzt = () => Math.round(performance.now() - A.t0);

  A.merken = function(was, mehr){
    A.ereignisse.push(Object.assign({t: jetzt(), was}, mehr || {}));
  };

  /* Mikrofonprobe: erst zeigen, dass es geht - dann erst aufnehmen. */
  A.probe = async function(anzeigen){
    const spur = await navigator.mediaDevices.getUserMedia({audio:true});
    const ktx = new (window.AudioContext || window.webkitAudioContext)();
    const quelle = ktx.createMediaStreamSource(spur);
    const messer = ktx.createAnalyser();
    messer.fftSize = 512;
    quelle.connect(messer);
    const daten = new Uint8Array(messer.frequencyBinCount);
    let an = true;
    (function messen(){
      if (!an) return;
      messer.getByteTimeDomainData(daten);
      let s = 0;
      for (const v of daten) s += (v-128)*(v-128);
      A.pegel = Math.min(1, Math.sqrt(s/daten.length)/40);
      anzeigen(A.pegel);
      requestAnimationFrame(messen);
    })();
    return { spur, stopp(){ an = false; ktx.close(); } };
  };

  A.starten = async function(spur){
    A.spur = spur || (await navigator.mediaDevices.getUserMedia({audio:true}));
    const typ = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : '';
    A.aufnehmer = new MediaRecorder(A.spur, typ ? {mimeType:typ} : {});
    A.brocken = [];
    A.aufnehmer.ondataavailable = e => { if (e.data.size) A.brocken.push(e.data); };
    A.aufnehmer.start(4000);          // Brocken, damit nichts verlorengeht
    A.t0 = performance.now(); A.laeuft = true;
    A.merken('aufnahme-start');
  };

  A.beenden = function(){
    if (!A.laeuft) return;
    A.merken('aufnahme-ende');
    A.laeuft = false;
    if (A.aufnehmer && A.aufnehmer.state !== 'inactive') A.aufnehmer.stop();
    if (A.spur) A.spur.getTracks().forEach(t => t.stop());
  };

  /* Speichern: Ton und Ereignisse getrennt, beides ueber den Browser.
     Keine Uebertragung an eine Ablage - die Adresse fehlt bewusst. */
  A.sichern = function(name){
    if (A.brocken.length){
      const b = new Blob(A.brocken, {type: A.brocken[0].type || 'audio/webm'});
      lade(b, name + '.webm');
    }
    lade(new Blob([JSON.stringify(A.ereignisse, null, 1)],
                  {type:'application/json'}), name + '_ereignisse.json');
  };
  function lade(blob, dateiname){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = dateiname; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  }

  window.Aufnahme = A;
})();
