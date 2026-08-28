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
- `stundenzettel_erfassung.html` – **Neues, eigenständiges Erfassungstool**
  für den Stundenzettel (siehe unten)

## Stundenzettel-Erfassung (`stundenzettel_erfassung.html`)

Mobil nutzbare Web-Seite (funktioniert auch offline / per Doppelklick, ohne
Server) zum Erfassen von Arbeitsstunden – als Ersatz/Ergänzung zum
Papier-Stundenzettel:

- Beliebig viele Baustellen pro Tag erfassbar (mehrere Einträge mit
  gleichem Datum)
- Stunden werden automatisch aus Von-/Bis-Zeit und Pause berechnet
- Soll-Stunden pro Wochentag sind einstellbar (Einstellungen-Bereich),
  inkl. Kurzwoche/Langwoche-Unterscheidung für Freitag
- Feiertage 2026 werden automatisch mit Soll = 0 Stunden berücksichtigt
  (Quelle: `arbeitskalender_2026.json`, direkt in der Seite eingebettet)
- Wochen- und Monatsübersicht mit Ist/Soll/Differenz (Über-/Minusstunden)
- Diktier-Button (Mikrofon) zum Ausfüllen per Spracheingabe – nutzt die
  Spracherkennung des Browsers (zuverlässig nur in Chrome/Android,
  eingeschränkt/nicht verfügbar in iOS Safari); erkannter Text wird nur
  in die Felder eingetragen, nie automatisch gespeichert
- Alle Daten bleiben lokal im Browser (`localStorage`) – kein Server,
  keine Übertragung an Dritte
- Export als Text (z. B. zum Kopieren/Teilen)

**Wichtiger Hinweis:** Die ursprünglichen Layout-JSONs (oben) enthalten nur
Feld-*Positionen*, keine Berechnungsformeln. Die Soll-Stunden-Werte in den
Einstellungen sind daher sinnvoll gewählte Startwerte und sollten mit dem
tatsächlichen Kollektivvertrag/der Firmenregelung abgeglichen werden.

**Sicherheitshinweis:** Die Diktier-Funktion ist nur für die Nutzung im
Stand gedacht (Pause, Ampel, vor Fahrtantritt) – nicht während des Fahrens
bedienen.

## Hinweis

Diese Dateien sind aktuell unabhängig von der Materialliste-App. Eine
Zusammenführung (gemeinsames Datenmodell für Bauvorhaben/Datum über alle
Formulare hinweg) wurde besprochen, aber noch nicht umgesetzt. Ebenso
könnten Bautagesbericht und Regiebericht nach demselben Prinzip wie die
Stundenzettel-Erfassung digitalisiert werden – bisher aber nur der
Stundenzettel.
