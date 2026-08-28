# Projektkontext

Materialplaner für einen Bauleiter (`index.html`, eine einzelne statische HTML-Datei,
kein Server/Build-Prozess). Läuft komplett offline im Browser. Nutzdaten (Baustellen,
Auswahl, Verlauf, eigene Materialien) liegen ausschließlich im `localStorage` des
jeweiligen Geräts, nicht im Repo. Der Materialkatalog (`BASE_CATALOG` im Script) ist
echte Bestandsdaten – nicht ohne Rücksprache umschreiben oder kürzen.

Der Nutzer ist kein Programmierer.

# Globale Arbeitsregeln

## Antworten
- Kurz, präzise, auf die konkrete Frage fokussiert. Keine unnötigen Einleitungen.
- Korrektheit vor Geschwindigkeit – lieber kurz nachdenken als schnell falsch antworten.
- Keine Fakten, Werte, Quellen oder Zusammenhänge erfinden. Unsicheres, Unvollständiges
  oder nicht Überprüfbares klar als solches kennzeichnen.
- Vor der Umsetzung einer Anfrage erst kurz das Verständnis der Aufgabe spiegeln
  (was gebaut werden soll, in eigenen Worten) und auf Bestätigung warten – auch bei
  scheinbar klaren Anfragen. Erst nach Bestätigung umsetzen. Ausnahme: reine
  Verständnisfragen oder explizit als klein/eindeutig markierte Änderungen, bei denen
  der Nutzer selbst sagt "leg direkt los".
- Wenn mehrere Punkte, Vergleiche oder Listen bearbeitet werden: jeden Punkt mit
  gleicher Sorgfalt behandeln, keine Qualitätsabnahme zum Ende hin.

## Code und Dateien
- Claude hat direkten Zugriff auf dieses Repository und bearbeitet Dateien selbst
  (Edit/Write + Commit/Push) statt Code-Blöcke zum manuellen Einfügen zu liefern –
  für den Nutzer ist eigenhändiges Copy-Paste fehleranfälliger als eine direkte,
  getestete Änderung.
- Nach jeder Änderung kurz und in einfacher Sprache zusammenfassen, was sich geändert
  hat und was es für den Nutzer bedeutet.
- Keine zusätzlichen Funktionen, Schalter oder Extras einbauen, die nicht angefragt
  wurden.
- Keine destruktiven Aktionen (Material/Baustelle endgültig löschen, Force-Push,
  Historie überschreiben) ohne ausdrückliche Bestätigung. Die App hat bewusst keine
  Löschen-Buttons im Materialstamm – dabei bleiben, nur Archivieren/Bearbeiten.
- Änderungen vor dem Commit im Browser (bzw. per Headless-Test) prüfen, wenn möglich.

## Fakten und Quellen
- Bei externen oder aktuellen Informationen (Preise, Produkte, Vorschriften) Quellen
  prüfen, wenn eine Prüfung möglich ist. Unsichere Quellen als unsicher kennzeichnen.
- Bei hochgeladenen Dateien nur verwenden, was tatsächlich darin steht – nichts raten,
  fehlende Informationen offen benennen.
