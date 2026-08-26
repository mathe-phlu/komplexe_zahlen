# Station 4 — Komplexe Potenzen · Vorschlag

**Stand: 21.08.2026 · noch nicht abgestimmt**

## Befund

Die Station, die den ganzen Umbau ausgelöst hat. Und die einzige, die
nicht nur ein Format-, sondern ein **Richtigkeitsproblem** hat: Der
Lösungsschlüssel für Potenzieren ist bei einem Drittel der Aufgaben
falsch gerechnet — unabhängig von der Frage der Mehrdeutigkeit. Siehe
`../FEHLER_ALTBESTAND.md`.

Erfreulich: Aufgabe 1 arbeitet **schon heute mit Eingabefeldern**
(`NUMERICAL` mit Toleranz 0,01). Der Weg, den wir für alle Stationen
einschlagen, ist hier bereits gegangen — er scheiterte nur an den
mehrwertigen Funktionen.

Die Toleranz von 0,01 absolut ist dabei zu eng: Bei e⁵ = 148,41 sind
0,01 rund 0,007 % — das trifft niemand beim Runden auf zwei Stellen.
Die relative Regel aus `../TOLERANZEN.md` löst genau das.

## Die vier Aufgaben

### 1 · e hoch · 4,5 → **4 Punkte**

**Heute:** Drei Werte e^z, jeweils Betrag und Winkel, dann Real- und
Imaginärteil. z ist konstruiert als rein imaginär mit y = kπ oder k,
als rein reell mit x = kπ, und als allgemeines x + iy.

**Neu:** Struktur bleibt vollständig erhalten. Nur die Toleranz wird
vernünftig, und die Winkelnormalisierung greift.

Teilpunkte: pro Zeile je 1 für Polarform und 1/3 für Normalform —
praktisch: 1 Punkt je Teilaufgabe, vier davon.

### 2 · Logarithmus · 4,5 → **4 Punkte**

**Heute:** Log(r·cis(φ)) als Hauptwert, ausgewählt aus sechs Optionen —
den drei richtigen Werten der Aufgabe gegenseitig als Distraktoren plus
drei konstruierten. Dazu drei Begriffsfragen: unendlich viele weitere
Lösungen, auf einer Geraden parallel zur y-Achse, Abstand 2π.

**Neu:** **Eingabefelder.** Realteil ist ln r, Imaginärteil ist φ im
Bogenmass.

Der Grund, warum das bisher nicht ging, ist genau das, was ein Parser
löst: Der Generator schreibt den Imaginärteil je nach Winkel mal als
`π/4`, mal als `0.79`. Angenommen werden künftig **beide**, dazu `pi/4`
und `0.785`.

Die drei Begriffsfragen bleiben Auswahl — sie sind wirklich begrifflich.

### 3 · Bilder · 2 → **3 Punkte**

**Heute:** Eingezeichnete Punkte als Lösungen von Log(z) oder e^z,
dazu Dropdowns.

**Neu:** Auswahl bleibt, aber die Punkte werden **angeklickt** statt
über Beschriftungen gewählt. Bild wird gezeichnet statt vorproduziert.

**Warum mehr Punkte:** Die Vielwertigkeit im Bild zu sehen — die
Lösungen von Log(z) auf einer Senkrechten im Abstand 2π — ist die
tragende Einsicht der Station. Zwei Punkte waren dafür zu wenig.

### 4 · Potenzieren · 0 → **4 Punkte**

**Heute:** a = ±k·i, Exponent b in drei Formen: n, 1/n, n·i. Gefragt
sind Betrag und Winkel des Ergebnisses, dann Real- und Imaginärteil,
dazu zwei Begriffsfragen über Anzahl und Lage der weiteren Lösungen.

Zuletzt mit **null Punkten** gestellt, weil Moodle richtige Lösungen als
falsch markierte und die vier Punkte deshalb geschenkt wurden.

**Neu — zurück auf volles Gewicht.** Drei Dinge müssen dafür stimmen:

1. **Der Lösungsschlüssel wird richtig gerechnet.** Für a = k·i und
   b = n·i gilt a^(ni) = e^(−nφ) · cis(n · ln r). Der Altbestand setzt
   den Betrag auf n·φ statt auf e^(−nφ) und liefert bei negativem a
   sogar einen negativen Betrag.
2. **Mehrwertigkeit wird geprüft, nicht ignoriert.** Angenommen wird
   jeder Wert, der sich als exp(b · (ln r + i(φ + 2πk))) für ein
   ganzzahliges k ergibt. Bei b = 1/n sind das n Werte, bei b = n·i
   unendlich viele, bei b = n genau einer.
3. **Die Klammern.** `(3i)^(1/2)`, nie `3i^(1/2)`.

Teilpunkte: 2 für das Ergebnis (Betrag, Winkel), 1 für die Normalform,
1 für die Begriffsfragen.

**Zu klären:** Bei ganzzahligem Exponenten gibt es **keine** weiteren
Lösungen. Zur Auswahl stehen heute «eine ~ endlich viele ~ unendlich
viele», und «eine» ist als richtig markiert. Ist das anders gemeint,
oder fehlt die Option «keine»?

### 5 · Begründungen · 0 Punkte

Erklärstellen mit Sprungmarke:

- nach Aufgabe 2: «Warum hat der Logarithmus einer komplexen Zahl
  unendlich viele Werte, die Wurzel aber nur endlich viele?»
- nach Aufgabe 4: «Was passiert anschaulich, wenn der Exponent selbst
  imaginär wird?»

## Punkte

| Aufgabe | heute | Vorschlag |
|---|---|---|
| 1 e hoch | 4,5 | **4** |
| 2 Logarithmus | 4,5 | **4** |
| 3 Bilder | 2 | **3** |
| 4 Potenzieren | **0** | **4** |
| Erklärstellen | 0 | 0 |
| **Summe** | **11** | **15** |

Damit stehen alle vier Stationen auf 15 Punkten, **56 → 60 insgesamt**,
und es gibt keine halben Punkte mehr.
