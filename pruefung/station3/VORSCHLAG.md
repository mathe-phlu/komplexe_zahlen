# Station 3 — Komplexe Folgen · Vorschlag

**Stand: 21.08.2026 · noch nicht abgestimmt**

## Befund

**Die didaktisch am weitesten entwickelte Station.** Als einzige hat sie
schon einleitende Aufgabenblöcke («AUFGABE 1: BAHNEN VORHERSAGEN …») —
die Etappenidee ist hier bereits umgesetzt.

Und sie ist zugleich die Station, die am stärksten unter Moodle
gelitten hat. Aufgabe 3 verlangt «Geben Sie einen Zyklus der Länge 4
an» und akzeptiert dafür **alle Permutationen aller passenden
Viererkombinationen** als Zeichenketten — Hunderte von Varianten in
einem Feld. In HTML werden die Punkte angeklickt und Mengen verglichen.
Der ganze Apparat entfällt.

Zwei Fehler im Altbestand siehe `../FEHLER_ALTBESTAND.md`.

## Die vier Aufgaben

### 1 · Bahnen vorhersagen · 5 Punkte

**Heute:** Drei Iteratoren — f₁ = a₁·z + a₃ mit a₁ ∈ {−1, i, −i},
f₂ = a₂·z mit |a₂| > 1, f₃ = a₃·z + a₂ mit |a₃| < 1. Gefragt: welcher
divergiert, welcher konvergiert, welcher ist zyklisch; dazu der Fixpunkt
des divergenten und die Zyklenlänge.

Die Konstruktion ist sauber und bleibt.

**Neu:** Die drei «welcher» werden eine **Zuordnung** — drei Iteratoren
auf drei Verhaltensweisen. Fixpunkt und Zyklenlänge werden
Eingabefelder.

**Zu beheben:** Der Fixpunkt war mit `%0%` auf null Prozent gesetzt und
damit nicht zu gewinnen. Und die Schreibfehler: «zylkische» →
zyklische, «Integratoren» → **Iteratoren** (dreimal).

Teilpunkte: 3 für die Zuordnung, 1 Fixpunkt, 1 Zyklenlänge.

### 2 · Zyklenlänge bestimmen · 3 Punkte

**Heute:** Drei Iteratoren f = a·z mit |a| = 1. Der Generator dazu
(`Zyklen/cloze2.py`) ist **leer** — die Erzeugungslogik steht nur in
`test.py`, die Aufgabe selbst nur als fertige XML.

Für den Neubau kein Verlust: Die Logik in `test.py` ist vollständig.
Winkel aus {90°, 180°, −90°}, {±45°, ±135°} und
{±30°, ±60°, ±120°, ±150°} — Zyklenlängen 4/2/4, 8 und 12/6/3/12.

**Neu:** Ein Eingabefeld je Iterator. Ohne Auswahl.

Anzumerken: Die exakte Darstellung der Zahlen (`0.5·(√3 + i)` statt
`0.87 + 0.5i`) ist ein guter Zug — sie zwingt dazu, den Winkel zu sehen
statt zu rechnen. Bleibt.

### 3 · Zyklen bei f(z) = z² · 3 Punkte

**Heute:** 22 Punkte auf dem Einheitskreis als festes Bild.
(a) Welche sind Fixpunkte? (b) Geben Sie einen Zyklus der Länge x an.
(c) Eine Zählkette: m, Anzahl Lösungen, wie viele zu Zyklen genau der
Länge y gehören, wie viele Zyklen das sind.

**Neu:** (a) und (b) werden **angeklickt**. Kein Tippen von
«z3, z10, z20», keine Reihenfolge, keine Permutationsliste. (c) bleibt
Eingabefelder.

**Dazu:** Das Bild wird erzeugt statt fest hinterlegt. Die Punktzahl und
die Zyklenstruktur lassen sich rechnen; damit gibt es beliebig viele
Varianten statt einer.

Teilpunkte: 1 Fixpunkte, 1 Zyklus, 1 Zählkette.

Die Mathematik ist nachgerechnet und stimmt: 30, 54, 126, 240 bzw. 504
Punkte gehören zu Zyklen genau der Länge y, das sind 6, 9, 18, 30 bzw.
56 Zyklen.

### 4 · Begriffe einordnen · 4 Punkte

**Heute:** Acht Begriffe — Iterierte Funktionen, Attraktor, Fixpunkt,
Zyklus, Julia-Menge, Einzugsbereich, Divergenzbereich, rekursiv
definierte Folgen — je mit richtigen und falschen Aussagen. Die
Begriffe tragen bereits eine Gruppenmarke A/B.

**Neu:** **Kärtchen zum Sortieren.** Aussagen als Karten, Begriffe als
Felder. Die vorhandene Gruppenmarke A/B legt nahe, dass die Aufgabe von
Anfang an so gedacht war.

Zweite Stelle, an der Pia Kaspers Maschinerie braucht — und die
passendere von beiden. Wenn nur eine Kärtchenaufgabe gebaut werden
soll, dann diese.

### 5 · Erklären · 0 Punkte

Erklärstellen mit Sprungmarke:

- nach Aufgabe 2: «Woran sehen Sie einer Zahl vom Betrag 1 die
  Zyklenlänge an?»
- nach Aufgabe 3(c): «Warum gehören nicht alle Lösungen von z^(2^y) = z
  zu Zyklen genau der Länge y?»

Die zweite steht schon heute als Klammerbemerkung im Aufgabentext
(«Erklären Sie im Video warum!») — sie bekommt nur ihren eigenen Ort.

## Punkte

| Aufgabe | heute | Vorschlag |
|---|---|---|
| 1 Bahnen vorhersagen | 5 | 5 |
| 2 Zyklenlänge | 3 | 3 |
| 3 Zyklen bei z² | 3 | 3 |
| 4 Begriffe einordnen | 4 | 4 |
| Erklärstellen | 0 | 0 |
| **Summe** | **15** | **15** |

**Unverändert.** Die Verteilung sitzt; es gibt keinen Grund, sie
anzufassen. Was sich ändert, ist allein die Antwortform.
