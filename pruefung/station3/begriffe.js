/* Begriffskorpus fuer Station 3, Aufgabe 4.

   Woertlich uebernommen aus
   quellen/2026-08-21_MA02.02_Fragenkataloge/Station 3/Begriffe/cloze4.py
   (Stand 21.08.2026). Inhaltlich unveraendert - nur aus Python nach
   JavaScript umgeschrieben, damit die Aufgabe im Browser laeuft.

   Aenderungen am Wortlaut gehoeren besprochen, nicht nebenbei gemacht.
*/
window.BEGRIFFE = {
 "Iterierte Funktionen": {
  "richtig": [
   "Eine iterierte Funktion wird wiederholt angewendet und erzeugt eine Folge.",
   "Iterierte Funktionen können periodische Zyklen erzeugen.",
   "Bei iterierten Funktionen wird der Ausgangswert immer wieder als Eingabe verwendet."
  ],
  "falsch": [
   "Iterierte Funktionen erreichen immer einen festen Endwert.",
   "Iterierte Funktionen konvergieren nur gegen null.",
   "Iterierte Funktionen ändern sich bei jeder Anwendung zufällig.",
   "Bei iterierten Funktionen werden alle Werte einmalig durchlaufen.",
   "Iterierte Funktionen haben immer eine endliche Anzahl an Ergebnissen.",
   "Eine iterierte Funktion führt immer zu einem fixen Punkt."
  ],
  "gruppe": "A"
 },
 "Attraktor": {
  "richtig": [
   "Ein Attraktor ist Punkt bzw. eine komplexe Zahl, der sich die Werte einer Folge nähern.",
   "Ein Attraktor kann ein Punkt, eine Schleife oder eine komplexe Struktur sein.",
   "Beim Iterator f(z)=z^2 ist die Zahl 1+0i ein Attraktor bzw. anziehender Fixpunkt. Die Zahl 0+0i ist ein abstossender Fixpunkt."
  ],
  "falsch": [
   "Attraktoren existieren nur für konvergente Folgen.",
   "Jeder Fixpunkt ist ein Attraktor.",
   "Attraktoren befinden sich nur im Einheitskreis."
  ],
  "gruppe": "A"
 },
 "Fixpunkt": {
  "richtig": [
   "Ein Fixpunkt bleibt bei Anwendung eines Iterators unverändert.",
   "Ein Fixpunkt erfüllt die Bedingung f(z) = z.",
   "Fixpunkte erzeugen bei der Anwendung eines Iterators konstante Folgen."
  ],
  "falsch": [
   "Fixpunkte sind nur in konvergenten Folgen vorhanden.",
   "Ein Fixpunkt verändert sich bei jeder Iteration.",
   "Fixpunkte existieren nur in Julia-Mengen.",
   "Fixpunkte wandern bei jeder Anwendung des Iterators."
  ],
  "gruppe": "A"
 },
 "Zyklus": {
  "richtig": [
   "Ein Zyklus wiederholt seine Werte in regelmäßigen Abständen.",
   "Ein Zyklus hat eine feste Periodenlänge.",
   "Zyklen treten in periodischen Folgen auf."
  ],
  "falsch": [
   "Ein Zyklus konvergiert gegen null.",
   "Zyklen existieren nur in divergenten Folgen.",
   "Zyklen haben unregelmäßige Abstände zwischen den Werten.",
   "Jeder Zyklus endet in einem Fixpunkt.",
   "Zyklen treten nur in explizit definierten Folgen auf.",
   "Zyklen haben eine unbestimmte Länge."
  ],
  "gruppe": "A"
 },
 "Julia-Menge": {
  "richtig": [
   "Die Julia-Menge besteht aus Punkten, deren iterierte Werte unter einer bestimmten Funktion innerhalb eines begrenzten Bereichs bleiben.",
   "Die Julia-Menge eines Punktes zeigt, wie er sich unter wiederholter Anwendung der Funktion verhält.",
   "Die Julia-Menge wird durch iterierte Funktionen der Form f(z)=z^2+c erzeugt."
  ],
  "falsch": [
   "Die Julia-Menge enthält nur Punkte, die zu einem fixen Punkt konvergieren.",
   "Die Julia-Menge wird durch lineare iterierte Funktionen erzeugt.",
   "Die Julia-Menge hat immer eine geschlossene Kreisform.",
   "Die Julia-Menge stellt immer ein Fraktal dar.",
   "Die Julia-Menge umfasst alle Punkte, die divergieren.",
   "Die Julia-Menge besteht nur aus Punkten, die im Einheitskreis liegen."
  ],
  "gruppe": "B"
 },
 "Einzugsbereich": {
  "richtig": [
   "Der Einzugsbereich beschreibt alle Startwerte, die zu konvergenten Folgen führen.",
   "Die Julia-Menge grenzt den Einzugsbereich vom Divergenzbereich ab.",
   "Alle Punkte im Einzugsbereich sind entweder Startwerte von konvergenten Folgen oder in der Bahn einer konvergenten Folge enthalten."
  ],
  "falsch": [
   "Der Einzugsbereich beschreibt alle Startwerte, die zu divergenten Folgen führen.",
   "Der Einzugsbereich und die Julia-Menge sind immer identisch.",
   "Jeder Punkt im Einzugsbereich ist ein Fixpunkt.",
   "Der Einzugsbereich wird durch einen einzigen Punkt dargestellt.",
   "Einzugsbereiche existieren nur für periodische Folgen.",
   "Der Einzugsbereich ist der Einheitskreis."
  ],
  "gruppe": "B"
 },
 "Divergenzbereich": {
  "richtig": [
   "Der Divergenzbereich beschreibt alle Startwerte, die zu divergenten Folgen führen.",
   "Punkte im Divergenzbereich entfernen sich mit jeder Iteration weiter von ihrem Startpunkt.",
   "Punkte, die auf der Bahn einer divergenten Folge liegen, sind zwingend im Divergenzbereich zu finden."
  ],
  "falsch": [
   "Der Divergenzbereich ist dasselbe wie der Einzugsbereich.",
   "Der Divergenzbereich umfasst alle Punkte, die konvergieren.",
   "Der Divergenzbereich enthält alle Punkte, die oszillieren.",
   "Divergenzbereich und Einzugsbereich können sich überschneiden."
  ],
  "gruppe": "B"
 },
 "Rekursiv definierte Folgen": {
  "richtig": [
   "Eine rekursiv definierte Folge verwendet den vorherigen Term zur Berechnung des nächsten.",
   "Rekursive Folgen folgen einer festen Regel für jedes Folgenglied.",
   "Rekursiv definierte Folgen können komplexe Muster erzeugen."
  ],
  "falsch": [
   "Eine rekursiv definierte Folge benötigt keine vorherigen Werte.",
   "Rekursive Folgen verwenden immer dieselben Anfangswerte.",
   "Eine rekursiv definierte Folge konvergiert immer gegen null.",
   "Rekursive Folgen sind immer periodisch.",
   "Jede rekursive Folge ist auch explizit definiert.",
   "Rekursive Folgen haben immer einen festen Endwert."
  ],
  "gruppe": "C"
 },
 "Explizit definierte Folgen": {
  "richtig": [
   "Eine explizit definierte Folge hat eine Formel, die direkt den Wert jedes Terms berechnet.",
   "Explizit definierte Folgen benötigen keine vorherigen Terme.",
   "Jede explizit definierte Folge ist für jeden Term unabhängig berechenbar."
  ],
  "falsch": [
   "Explizit definierte Folgen sind immer rekursiv.",
   "Explizit definierte Folgen müssen jeden Term aus den vorherigen ableiten.",
   "Eine explizit definierte Folge kann nur gegen unendlich streben.",
   "Explizit definierte Folgen sind immer periodisch.",
   "Explizit definierte Folgen können nur positive Werte annehmen.",
   "Jede explizit definierte Folge ist divergent."
  ],
  "gruppe": "C"
 },
 "Divergente Folge": {
  "richtig": [
   "Eine divergente Folge hat keinen endlichen Grenzwert.",
   "Divergente Folgen streben gegen unendlich oder -unendlich.",
   "Die Terme einer divergenten Folge entfernen sich mit wachsendem Index unbegrenzt voneinander."
  ],
  "falsch": [
   "Eine divergente Folge konvergiert gegen null.",
   "Divergente Folgen nähern sich immer einem festen Punkt.",
   "Die Werte einer divergenten Folge oszillieren um einen Grenzwert.",
   "Jede divergente Folge ist auch eine periodische Folge.",
   "Eine divergente Folge hat immer eine konstante Differenz zwischen den Folgengliedern.",
   "Divergente Folgen haben endliche Werte und kehren immer zu einem Startpunkt zurück."
  ],
  "gruppe": "C"
 },
 "Konvergente Folge": {
  "richtig": [
   "Eine konvergente Folge nähert sich einem festen Grenzwert.",
   "Die Terme einer konvergenten Folge werden mit zunehmendem Index immer ähnlicher.",
   "Konvergente Folgen haben einen endlichen Grenzwert."
  ],
  "falsch": [
   "Eine konvergente Folge strebt gegen unendlich.",
   "Konvergente Folgen sind immer rekursiv definiert.",
   "Konvergente Folgen haben einen zyklischen Verlauf.",
   "Alle Terme einer konvergenten Folge sind gleich.",
   "Konvergente Folgen entfernen sich mit jedem Term vom Grenzwert.",
   "Konvergente Folgen haben keine festgelegte Grenze."
  ],
  "gruppe": "C"
 }
};
