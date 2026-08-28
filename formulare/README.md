# Formulare (Bautagesbericht, Regiebericht, Stundenzettel)

Dieser Ordner enthält die digitalen Vorlagen und Feld-Layouts für die
HS-Bau-Formulare, unabhängig von der Materialliste (`../index.html`).

## Inhalt

- `layout_bautagesbericht.json` – Feldkoordinaten für den Bautagesbericht
- `layout_regiebericht.json` – Feldkoordinaten für den Regiebericht
- `Stundenzettel_vorne_leer.json` / `Stundenzettel_hinten_leer.json` /
  `Stundenzettel_finanz_leer.json` / `Stundenzettel_Differenz_leer.json` –
  Feldkoordinaten für die verschiedenen Stundenzettel-Varianten
- `arbeitskalender_2026.json` – Kalenderwochen-Zuordnung (K/L) und
  Feiertage für 2026
- `FORMULARE_anschauen_RegieBautagesberichtStunden_Verknuepfung.html` –
  Ansicht/Verknüpfung der Formulare
- `vorlagen/` – Referenzbilder der Papiervorlagen (komprimiert als JPEG)
- `stunden_logik.js` – **die geprüfte Rechenlogik** für den Stundenzettel
  (Original/Differenz/Arbeitszeit, Person-1/Person-2, Kurz-/Langwoche,
  Feiertage) – unveränderte Kopie aus der PC-Datei, siehe unten
- `stundenzettel_erfassung.html` – **mobiles Erfassungstool** für den
  Stundenzettel, das exakt dieselbe Logik verwendet (siehe unten)

## Rechenlogik (`stunden_logik.js`)

Die eigentliche Stundenberechnung steckt **nicht** in den Layout-JSONs
(die enthalten nur Feld-*Positionen*), sondern im Rechenteil von
`FORMULARE_anschauen_RegieBautagesberichtStunden_Verknuepfung.html`. Diese
Datei enthält bereits 58 eingebaute Selbsttests, die die Formel exakt
festlegen – u. a.:

- **Person 1** (normale Mitarbeiter) und **Person 2** (Name enthält
  "Hannes") haben unterschiedliche Tages-Sollstunden (Hannes: +1 Stunde
  pro Tag). Die Differenz wird aber immer gegen das Soll von Person 1
  berechnet.
- Kurzwoche/Langwoche (WKO-Modell) bestimmt das Freitags-Soll.
- Mehrere Baustellen an einem Tag werden mit "/" eingetragen (z. B.
  `3/3/3`), Sonderfälle wie Urlaub (`U`), Krank (`K`), Schlechtwetter
  (`SW`), Arzttermin (z. B. `4A/5`) werden erkannt.
- Die Arbeitszeit wird immer als "7:00 + Stunden + 1 Stunde Pause"
  geschrieben.

`stunden_logik.js` ist eine **unveränderte Kopie** dieses Rechenteils,
ausgelagert in eine eigene Datei, damit sowohl das PC-Programm als auch
das mobile Tool exakt dieselbe, geprüfte Formel verwenden. Die Datei ist
bewusst nicht automatisch synchronisiert – bei Änderungen an der Formel
in der PC-Datei muss sie hier von Hand nachgezogen werden (die 58
Selbsttests laufen bei jedem Laden automatisch mit und melden Abweichungen
in der Browser-Konsole).

## Stundenzettel-Erfassung (`stundenzettel_erfassung.html`)

Mobil nutzbare Web-Seite (funktioniert auch offline / per Doppelklick,
ohne Server) zum Erfassen von Arbeitsstunden – mit **derselben
Quick-Code-Eingabe** wie im PC-Programm (kein vereinfachtes Dropdown):

- Eingabe wie gewohnt: eine Zahl, mehrere Baustellen mit "/" (z. B.
  `3/3/3`), oder Sonderkürzel (`U`, `K`, `SU`, `SW`, `4A/5`, ...)
- Live-Vorschau von Original/Differenz/Arbeitszeit beim Tippen
- Name einmal hinterlegen (Einstellungen) – die App erkennt automatisch
  "Hannes" und rechnet mit dessen höherem Soll
- Eigener Bereich "Kalender" zum jährlichen Eintragen der WKO-Kurz-/
  Langwochen und Feiertage (2026 ist bereits fix hinterlegt und
  gesperrt) – ohne hinterlegten Kalender wird deutlich gewarnt und keine
  Differenz geraten
- Wochen- und Monatsübersicht mit Ist-Stunden und Differenz-Summe
- Diktier-Buttons (Mikrofon) für Baustelle und Stunden – nutzen die
  Spracherkennung des Browsers (zuverlässig nur in Chrome/Android,
  eingeschränkt/nicht verfügbar in iOS Safari); erkannter Text wird nur
  ins Feld eingetragen, nie automatisch gespeichert
- Alle Daten bleiben lokal im Browser (`localStorage`) – kein Server,
  keine Übertragung an Dritte
- Export als Text (z. B. zum Kopieren/Teilen)

**Sicherheitshinweis:** Die Diktier-Funktion ist nur für die Nutzung im
Stand gedacht (Pause, Ampel, vor Fahrtantritt) – nicht während des Fahrens
bedienen.

## Hinweis

Diese Dateien sind aktuell unabhängig von der Materialliste-App. Eine
Zusammenführung (gemeinsames Datenmodell für Bauvorhaben/Datum über alle
Formulare hinweg) wurde besprochen, aber noch nicht umgesetzt. Ebenso
könnten Bautagesbericht und Regiebericht nach demselben Prinzip wie die
Stundenzettel-Erfassung mobil nutzbar gemacht werden – bisher aber nur der
Stundenzettel.
