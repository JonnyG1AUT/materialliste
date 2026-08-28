# Formulare (Bautagesbericht, Regiebericht, Stundenzettel)

Dieser Ordner enthält die digitalen Vorlagen, Feld-Layouts und das
Programm für die HS-Bau-Formulare, unabhängig von der Materialliste
(`../index.html`).

## Inhalt

- `FORMULARE_anschauen_RegieBautagesberichtStunden_Verknuepfung.html` –
  **das eigentliche Programm** (siehe unten)
- `layout_bautagesbericht.json` – Feldkoordinaten für den Bautagesbericht
- `layout_regiebericht.json` – Feldkoordinaten für den Regiebericht
- `Stundenzettel_vorne_leer.json` / `Stundenzettel_hinten_leer.json` /
  `Stundenzettel_finanz_leer.json` / `Stundenzettel_Differenz_leer.json` –
  Feldkoordinaten für die verschiedenen Stundenzettel-Varianten
- `arbeitskalender_2026.json` – Kalenderwochen-Zuordnung (K/L) und
  Feiertage für 2026
- `regiebericht.png`, `bautagesbericht.png`, `stundenzettel_vorne.png`,
  `stundenzettel_hinten.png`, `stundenzettel_finanz.png` – die
  Hintergrundbilder, unter genau den Dateinamen, die das Programm
  erwartet (siehe unten)
- `vorlagen/` – dieselben Bilder zusätzlich als komprimierte
  Referenz-JPEGs (nur zum Anschauen, nicht vom Programm genutzt)

## Das Programm (`FORMULARE_anschauen_RegieBautagesberichtStunden_Verknuepfung.html`)

Ein einziges HTML-Programm für Regiebericht, Bautagesbericht und
Stundenzettel zusammen. Es legt die Eingabefelder exakt an den in den
Layout-JSONs gespeicherten Koordinaten über das jeweilige
Hintergrundbild (die eingescannte Papiervorlage) – die Koordinaten
beziehen sich auf eine feste Bezugsgröße von 794×1123 Pixel (A4 bei
96dpi), unabhängig von der tatsächlichen Auflösung der Bilddatei.

Weitere Funktionen: Layout-Editor (Passwort-geschützt), Unterschriftsfelder,
Speichern/Laden der Daten als JSON, Drucken als PDF, sowie die komplette
Stundenberechnung (siehe nächster Abschnitt).

**Mobil nutzbar:** Die Seite passt ihren Zoom automatisch an die
Fensterbreite an (auch beim Drehen des Handys), inklusive größerer
Tippflächen auf schmalen Bildschirmen. Bedienung per Finger funktioniert
bereits über Pointer-Events (Ziehen von Feldern, Unterschreiben).

**Eingebaute Layouts:** Falls für ein Formular noch keine eigenen Daten
im Browser gespeichert sind, greift das Programm auf ein eingebautes
Standard-Layout zurück (für alle drei Formulartypen) – so zeigt es auch
auf einem ganz neuen Gerät/Browser sofort die richtigen Felder statt
einer leeren Seite.

## Rechenlogik (Stundenzettel)

Die eigentliche Stundenberechnung steckt **nicht** in den Layout-JSONs
(die enthalten nur Feld-*Positionen*), sondern im Rechenteil des
Programms selbst. Es sind bereits 58 eingebaute Selbsttests enthalten
(`runStundenLogicSelfTests()`), die die Formel exakt festlegen – u. a.:

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

Für 2026 ist der Arbeitskalender fix im Programm hinterlegt. Für
Folgejahre wird eine neue `arbeitskalender_JJJJ.json` (Jahr, KW 1–53 mit
K/L, Feiertage) über "Arbeitskalender laden" eingelesen und im Browser
gespeichert, sobald die WKO die Daten veröffentlicht hat.

## Hinweis

Diese Dateien sind unabhängig von der Materialliste-App.
