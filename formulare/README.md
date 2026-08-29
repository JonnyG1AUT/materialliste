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
- `feldbeschreibungen_regiebericht.json`, `feldbeschreibungen_bautagesbericht.json`,
  `feldbeschreibungen_stundenzettel_vorne.json` – Zuordnung Feld-ID →
  Bedeutung in Klartext, als Rohdaten (siehe Abschnitt "Ausfüllen per
  Chat/Sprache")
- `ausfuellhilfe_claude.txt` – **fertiger Text zum Kopieren**: einfach den
  ganzen Inhalt in einen neuen/normalen Claude-Chat einfügen, danach
  kennt dieser Chat alle Feld-Bedeutungen und kann direkt Berichte
  entgegennehmen (siehe Abschnitt "Ausfüllen per Chat/Sprache")

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

## Ausfüllen per Chat/Sprache

Die Feld-IDs in den Layout-JSONs sind zufällige Kürzel (z. B.
`f_b0bfd31d896e9819bea3c0e2f`) und für sich genommen nicht
menschenlesbar. `ausfuellhilfe_claude.txt` übersetzt jede Feld-ID von
Regiebericht, Bautagesbericht und Stundenzettel-Vorderseite in eine
Klartext-Bedeutung (z. B. "Auftraggeber" oder "Tag 5 - Stunden") und
erklärt einem Claude-Chat, wie daraus eine Daten-JSON entsteht.

Ablauf:

1. Den kompletten Inhalt von `ausfuellhilfe_claude.txt` in einen
   (beliebigen, auch neuen) Claude-Chat einfügen.
2. Den Tag/die Baustelle in eigenen Worten beschreiben.
3. Claude formuliert daraus eine Daten-JSON passend zu den Feld-IDs.
4. Vorher im Programm das passende Formular auswählen (Regiebericht /
   Bautagesbericht), dann die JSON-Datei über "Daten laden" einlesen.

Absichtlich nicht abgedeckt:

- Die Stundenzettel-Rückseite (Fahrtzeit-Nachweis) und die
  "Original"/Finanzkopie sind nicht enthalten – die Rückseite wird von
  Hand ausgefüllt, die Original-Kopie befüllt sich automatisch aus der
  Vorderseite. Die Rohdaten dazu (`feldbeschreibungen_stundenzettel_hinten.json` /
  `_original.json`) wurden entfernt, da nicht benötigt; bei Bedarf können
  sie erneut erstellt werden.
- Im Regiebericht sind die Felder 86–119 (Arbeitszeit von/bis je
  Arbeitskraft-Zeile sowie die beiden frei benennbaren
  Aufzahlungsspalten) als "optional, meist nicht per Sprache" markiert,
  da diese normalerweise von Hand eingetragen werden.
- Bei den Stundenzettel-Kurzcodes (Spalte "Stunden") gilt weiterhin die
  bestehende Syntax (z. B. `8`, `3/3/3`, `U`, `K`, `SW`, `4A/5`) – die wird
  vom Programm selbst berechnet, nicht von Claude.

## Hinweis

Diese Dateien sind unabhängig von der Materialliste-App.
