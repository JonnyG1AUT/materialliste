/*
 * Gemeinsame Kopfdaten (Stammdaten) für Stundenzettel-, Bautagesbericht-
 * und Regiebericht-Erfassung.
 *
 * Damit Name, aktuelles Bauvorhaben und Auftraggeber nicht in jedem der
 * drei mobilen Tools einzeln eingetippt werden müssen: wer es in einem
 * Tool einträgt, findet es beim nächsten Öffnen eines anderen Tools
 * (im selben Browser/Gerät) schon vor. Jedes Tool bleibt trotzdem
 * eigenständig nutzbar, falls diese Datei einmal fehlt.
 */

const STAMMDATEN_KEY = "hsbau_stammdaten_v1";

function ladeStammdaten() {
  try {
    return JSON.parse(localStorage.getItem(STAMMDATEN_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function speichereStammdaten(patch) {
  const aktuell = ladeStammdaten();
  const neu = { ...aktuell, ...patch };
  try { localStorage.setItem(STAMMDATEN_KEY, JSON.stringify(neu)); } catch (e) {}
  return neu;
}
