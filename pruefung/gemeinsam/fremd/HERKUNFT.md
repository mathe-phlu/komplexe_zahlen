# gemeinsam/fremd/

Schriften, die **mitgeliefert** statt von Google geholt werden.

## Warum

Eine Prüfungsseite, die bei jedem Aufruf Schriften von
`fonts.googleapis.com` nachlädt, überträgt dabei die Adresse der
Studierenden an Google. Einer Prüfung kann sich niemand entziehen —
also darf sie das nicht verlangen. Nebenbei läuft die Prüfung so auch
ohne Netz.

Der Hinweis kam von **LARS** über Rike, am 22.08.2026. Kaspers
`referenzen/GESTALTUNG.md` führt denselben Punkt schon länger als
offen (Abschnitt «Was noch offen ist»); LARS hat ihn zuerst erledigt.

## Herkunft

| Datei | Herkunft | Lizenz | Stand |
|---|---|---|---|
| `fira-400-latin.woff2`, `fira-400-latin-ext.woff2` | LARS, `bauen/gestalt/fremd/` | SIL Open Font License 1.1 | 22.08.2026 |
| `fira-500-latin.woff2`, `fira-500-latin-ext.woff2` | ebenda | SIL OFL 1.1 | 22.08.2026 |
| `patrick-400-latin.woff2`, `patrick-400-latin-ext.woff2` | ebenda | SIL OFL 1.1 | 22.08.2026 |
| `../schriften.css` | ebenda, **wortgleich** | — | 22.08.2026 |

LARS holt sie mit `werkzeuge/schriften_holen.py` von Google Fonts und
schneidet sie nach Zeichenbereichen zu. Pia holt sie **nicht selbst** —
sie nimmt LARS' Dateien, damit im gemeinsamen Repository nicht zwei
Fassungen derselben Schrift liegen.

## Hier wird nichts bearbeitet

Insbesondere nicht `schriften.css`. Sie ist wortgleich mit LARS' Fassung,
und das soll sie bleiben: Sonst laufen Original und Kopie auseinander,
und niemand sieht es. Neue Fassung heisst: bei LARS neu holen, Datum
hier nachtragen.

**Der Bezugsweg ist derselbe wie bei LARS.** Dort wird `schriften.css`
beim Bauen der Hauptdatei vorangestellt, damit die Pfade `url(fremd/…)`
relativ zu `gemeinsam/` aufgehen. Pia hat keinen Bauschritt und bindet
sie deshalb als eigene Datei **vor** `pruefung.css` ein — dieselbe
Auflösung, dieselben Pfade, unverändertes Original.

## Folge für die Gestaltung

LARS liefert **400 und 500**, sonst nichts. Pia hatte 600 verwendet und
verlässt sich für `<b>` auf den Vorgabewert 700. Beides gibt es nicht
mehr; der Browser müsste es aus 400 künstlich fetten, und das sieht
nachgezogen aus. Deshalb steht Pias Auszeichnung jetzt ebenfalls auf
**500** — dieselbe Abstufung wie in der Lernlandschaft.
