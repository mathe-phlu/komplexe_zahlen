# Station 1 — Vorschlag für den Umbau

**Stand: 21.08.2026 · noch nicht abgestimmt**

Grundlage: die sechs Aufgaben der bisherigen Moodle-Prüfung
(`quellen/2026-08-21_MA02.02_Fragenkataloge/Station 1`, Punkte in
`quellen/HERKUNFT.md`).

## Der Befund vorweg

Der **Zuschnitt der Station stimmt**. Die sechs Aufgaben decken
Rechnen, Darstellungswechsel, Wurzeln und beide Richtungen des
Zusammenhangs Bild ↔ Operation ab. Inhaltlich ist nichts zu ersetzen.

Was sich ändert, ist fast überall nur die **Antwortform** — und das ist
kein Selbstzweck: Jede Auswahlfrage in dieser Station existiert, weil
Moodle nichts anderes zuverlässig prüfen konnte, nicht weil Ankreuzen
die Sache besser trifft.

Bemerkenswert: Aufgabe 4 und 5 sind einander invers (Bild → Operation
gegen Operation → Bild). Das ist eine gute Konstruktion und bleibt.

---

## Die sechs Aufgaben

### 1 · Rechnen mit komplexen Zahlen · 2 → **3 Punkte**

**Heute:** Multiple Choice, vier Optionen. Aufgabe der Form
(z₁) ± ((z₂) ×|÷ (z₃)), Distraktoren durch ±2 auf Real- und Imaginärteil.

**Neu:** Zwei Eingabefelder, Realteil und Imaginärteil. Keine
Distraktoren mehr.

**Achtung Brüche.** Die Division zweier ganzzahliger komplexer Zahlen
ergibt rationale Werte — der Generator arbeitet heute schon mit
`Fraction(...).limit_denominator()`. Das Feld muss `7/13` **und**
`0.538` annehmen und beides als richtig erkennen.

**Warum mehr Punkte:** Ohne Auswahl fällt der Rateboden von 25 % auf
null. Es ist die Grundfertigkeit der Station und war mit zwei Punkten
zu leicht gewichtet.

### 2 · Darstellungsformen wechseln · 2 Punkte

**Heute:** Zuordnung von vier Zahlen in Normalform zu ihren Polarformen,
mit einem Distraktor («Keine passende Polarform»). Konstruktion gut: je
eine Zahl auf einer Achse, eine auf der Winkelhalbierenden, eine
beliebige, ein Distraktor.

**Neu:** Bleibt Zuordnung, aber **mit Überhang** — sechs Polarformen für
vier Zahlen. Damit trägt das Ausschlussverfahren nicht mehr durch.

**Offen — deine Entscheidung:** Zuordnung als Kärtchen zum Ziehen
(Kaspers Maschinerie) oder als schlichte Zuordnungsliste? Kärtchen sind
mehr Arbeit, geben aber im Ereignisstrom sichtbar preis, wie überlegt
wurde: was zuerst gelegt, was wieder weggenommen.

### 3 · Wurzeln berechnen · 3 Punkte

**Heute:** Mehrfachauswahl aus acht Optionen. z² = w oder z³ = w, alle
Wurzeln in Polarform. Distraktoren teils mit richtigem Betrag und
falschem Winkel, teils mit falschem Betrag.

**Neu:** Eine Zeile je Wurzel, zwei bzw. drei Zeilen, jeweils r und φ.

**Hier zahlt sich der rechnerische Vergleich am deutlichsten aus:**
- Reihenfolge egal — geprüft wird als Menge, nicht als Liste.
- −120° und 240° sind dasselbe.
- Toleranz beim Runden.

**Teilpunkte:** ein Punkt je richtiger Wurzel.

### 4 · Bild zu Operation · 3 Punkte

**Heute:** Ein Bild zeigt z₁, z₂, z₃ als Pfeile; Auswahl aus
z₁+z₂=z₃ · z₁−z₂=z₃ · z₁×z₂=z₃ · z₁÷z₂=z₃ · kein Zusammenhang.

**Neu:** Die Auswahl bleibt — hier ist sie sachlich richtig, es geht ums
Wiedererkennen, und fünf Möglichkeiten sind kein Ratespiel. **Dazu ein
Ablesefeld:** «und z₃ ≈ ___ + ___ i». Das prüft, ob sie die Zeichnung
wirklich lesen und nicht nur ein Muster wiedererkennen.

Aufteilung: 2 Punkte Zusammenhang, 1 Punkt Ablesen (mit Toleranz).

### 5A · Operation zu Bild (+ − × ÷) · 2 Punkte
### 5B · Operation zu Bild (^n und ^1/n) · 3 → **2 Punkte**

**Heute:** Das Bild zeigt z₁, z₂ schwarz und drei farbige Kandidaten
w₁, w₂, w₃. Multiple Choice über die Beschriftungen.

**Neu:** **Direkt in den Pfeil klicken.** Beschriftungen und Legende
entfallen. Näher an der Sache, und der Klick steht im Ereignisstrom —
beim Abspielen sieht man, ob gezögert oder umentschieden wurde.

**Warum 5B weniger Punkte:** Anklicken ist leichter als Ankreuzen mit
acht Distraktoren. Die drei Punkte waren zum Teil eine Prämie auf die
Schwierigkeit des Formats, nicht der Sache.

### 6 · Begründungen · 0 Punkte

**Heute:** Essay-Frage am Schluss, Video über Kaltura, unbewertet.

**Neu:** Entfällt als eigene Aufgabe. Erklärt wird durchgehend in die
Tonspur.

**Aber nicht ersatzlos:** An zwei Stellen zeigt die Seite eine gezielte
Frage und setzt beim Antippen eine **Sprungmarke** in den Ereignisstrom.
Beim Abspielen springt Rike mit einem Klick genau dorthin, statt zu
suchen. Bleibt bewusst bei 0 Punkten — nicht automatisch bewertbar.

---

## Punkte

| Aufgabe | heute | Vorschlag |
|---|---|---|
| 1 Rechnen | 2 | **3** |
| 2 Darstellungsformen | 2 | 2 |
| 3 Wurzeln (1 P je Wurzel) | 3 | 3 |
| 4 Bild → Operation (2 + 1 Ablesen) | 3 | 3 |
| 5A Operation → Bild (+ − × ÷) | 2 | 2 |
| 5B Operation → Bild (^n, ^1/n) | 3 | **2** |
| Erklärstellen | 0 | 0 |
| **Summe** | **15** | **15** |

---

## Zwei Entscheidungen, die alle vier Stationen betreffen

### Teilpunkte zählen, Wiedereintritt ist ganz oder gar nicht

- Für die **80 %** zählen Teilpunkte (zwei von drei Wurzeln = 2 Punkte).
- Für den **Wiedereintritt** gilt eine Aufgabe nur als erledigt, wenn
  sie **vollständig** richtig ist. Sonst wird sie wieder geöffnet.

Sonst käme jemand mit lauter halben Aufgaben über die Grenze, ohne eine
davon ganz zu können.

### Format sofort prüfen, Richtigkeit erst am Schluss

Sonst haben wir das Moodle-Problem in neuen Kleidern: eine unglückliche
Schreibweise kostet eine ganze Aufgabe.

- **Sofort:** «Das lese ich nicht als komplexe Zahl.» Nur die Lesbarkeit,
  kein Wort über richtig oder falsch.
- **Am Schluss:** die Auswertung.

So kann niemand sich durch Ausprobieren zur Lösung tasten, aber auch
niemand an der Schreibweise scheitern.

---

## Was gebaut, was übernommen, was weggeworfen wird

### Bleibt inhaltlich unverändert
- Alle sechs Aufgabenideen samt Zuschnitt der Station
- Die Zufallslogik der Generatoren: Wertebereiche, Nebenbedingungen,
  die Konstruktion der vier Fälle in Aufgabe 2

### Wird angepasst
| Aufgabe | Änderung |
|---|---|
| 1, 3 | Eingabefelder statt Auswahl |
| 2 | Überhang statt genau einem Distraktor |
| 4 | Auswahl bleibt, Ablesefeld kommt dazu |
| 5A, 5B | Anklicken im Bild statt Auswahl |

### Wird neu geschrieben
1. **Antwortvergleich** — rechnerisch statt als Zeichenkette. Parsen,
   Winkel normalisieren, Toleranz, Mengenvergleich. Der Baustein, der
   die ganze Umstellung trägt; alle vier Stationen brauchen ihn.
2. **Bilderzeugung** — siehe unten.
3. **Aufzeichnung** — Eingabefelder, Klicks im Bild, Zeichenstriche,
   Kameraspur, stückweiser Upload. Geht von `fremd/kasper/…/aufnahme.js`
   aus, wird aber eine eigene Fassung.
4. **Auswertung und Wiedereintrittscode**
5. **Die Prüfungsseite** — eine Aufgabe je Seite, wie bisher in Moodle.
   Klare Marken im Ereignisstrom, und der Wiedereintritt kann ganze
   Seiten überspringen.
6. **Zeichenfeld und Foto-Upload** je Aufgabe. Das Foto wandert ins
   Paket — ohne Server, ohne Moodle.

### Entfällt ersatzlos
- Die gesamte Moodle-XML-Erzeugung
- Die Distraktorenerzeugung für 1, 3 und 5 — ohne Auswahl unnötig.
  In Aufgabe 2 und 4 bleiben Distraktoren, dort tragen sie.
- Die Kaltura-Einbettung

---

## Die eine grössere Entscheidung: Bilder im Browser zeichnen

**Heute:** matplotlib erzeugt PNG, base64 in die XML eingebettet.

**Vorschlag:** Die Bilder werden **im Browser als SVG gezeichnet**, aus
den Zahlen des jeweiligen Durchgangs.

**Was das bringt:**
- Unbegrenzt viele Varianten, ohne dass jemand vorproduziert. Beim
  Wiedereintritt kommen zwangsläufig neue Zahlen.
- Pfeile werden **anklickbar** — Voraussetzung für Aufgabe 5.
- Lesbar in jeder Grösse. Kaspers 6,7-px-Schwelle
  (`agent/05_layout.md`) ist mit SVG von selbst eingehalten; die
  matplotlib-PNG waren genau dort das Problem — in der Moodle-Fassung
  stand eigens der Hinweis, man müsse die Anzeige vergrössern.
- Dieselben Farbtokens wie das übrige Material (`--papier`, `--tinte`,
  `--braun`, `--linie`), statt matplotlib-Rot-Blau-Grün.
- Keine Bilddateien im Repository.

**Was es kostet:** Die Zeichenroutinen werden einmal neu geschrieben —
Achsenkreuz, Raster, Pfeile, Beschriftung. Schätzung: gut überschaubar,
und alle vier Stationen erben es.

---

## Abgestimmt am 21.08.2026

1. **Aufgabe 2** wird eine Kärtchenaufgabe zum Ziehen — Kaspers
   Maschinerie. Erste Stelle, an der Pia sie tatsächlich braucht.
2. **Punkteverschiebung** 1 auf 3 und 5B auf 2: angenommen.
3. **Erklärstellen:** nach Aufgabe 3 «Warum hat eine Zahl drei dritte
   Wurzeln, und wie liegen sie?», nach Aufgabe 5 «Woran erkennen Sie
   eine Multiplikation im Bild?»
4. **Toleranzen** siehe `../TOLERANZEN.md`. Dabei ist ein Fehler der
   Zeichnung in Aufgabe 4 aufgefallen, der dort mitbehandelt wird:
   Die Beträge von z₁ und z₂ müssen begrenzt werden, sonst ist z₃ bei
   der Multiplikation bis zu zehnmal so lang wie die Operanden.
