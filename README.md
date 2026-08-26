# Komplexe Zahlen (MA02.02)

Lernlandschaft des Moduls **MA02.02 Komplexe Zahlen**, PH Luzern.

Die Seite ist statisch: kein Server, keine Datenbank, keine Anmeldung.
Die interaktiven Inhalte — Bücher, Lernpfade, Kärtchen — laufen im
**Originalcode aus den H5P-Paketen**, betrieben mit
[h5p-standalone](https://github.com/tunapanda/h5p-standalone).

## Aufbau

| Ordner | Inhalt |
|---|---|
| `index.html` | Materialseite: Einstieg über die vier Stationen |
| `station-N/` | Navigation einer Station |
| `buch-N/`, `lernpfad-N/`, `kaertchen-N/`, `reflexion-N/` | die H5P-Inhalte |
| `aufgaben-N/`, `lernziele-N/` | erzeugt aus dem LaTeX-Skript |
| `unterlagen/` | Skript, Lösungen, Karteikarten als PDF |
| `h5p/bibliotheken/` | der H5P-Programmcode, einmal für alle Inhalte |
| `h5p/inhalt/` | die Inhalte je Baustein |

## Erzeugt, nicht von Hand geschrieben

Diese Seiten entstehen aus der Moodle-Kurssicherung und dem
LaTeX-Skript. Wer etwas ändern will, ändert die Quelle und lässt neu
erzeugen — eine Änderung hier wäre beim nächsten Lauf weg.

Der Erzeuger liegt im Agentenordner `LARS`.

## `.nojekyll`

Die Datei muss bleiben. Ohne sie lässt GitHub Pages alle Ordner aus,
deren Name mit einem Punkt beginnt — und die H5P-Bibliotheken heissen
`H5P.InteractiveBook-1.7`.
