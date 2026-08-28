/*
 * Stundenzettel-Rechenlogik.
 *
 * Dies ist eine unveränderte Kopie des geprüften Rechenteils aus
 * FORMULARE_anschauen_RegieBautagesberichtStunden_Verknuepfung.html
 * (dort Zeilen 673-683 und 1649-2884), ausgelagert in eine eigene Datei,
 * damit sowohl das PC-Programm als auch mobile Werkzeuge exakt dieselbe
 * Formel verwenden - inklusive der Person-1/Person-2("Hannes")-Regel,
 * der Kurz-/Langwochen-Logik und der U/K/SU/SW/A/F-Sonderkürzel.
 *
 * WICHTIG: Diese Datei ist bewusst NICHT automatisch mit der PC-Datei
 * synchronisiert. Wird die Rechenlogik dort geändert, muss sie hier von
 * Hand nachgezogen werden (und umgekehrt) - siehe runStundenLogicSelfTests()
 * am Ende, die 58 konkrete Beispiele prüft und bei jeder Änderung erneut
 * laufen sollte.
 */

function storeLocal(key, obj){
  try{ localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

function loadLocal(key){
  try{
    const t = localStorage.getItem(key);
    if (!t) return null;
    return JSON.parse(t);
  } catch { return null; }
}

// Sollstunden Person 1 (normale Mitarbeiter).
const SOLL_P1 = {
  lang: [9, 9, 9, 9, 7],
  kurz: [9, 9, 9, 8, 0]
};

// Sollstunden Person 2 (= Name enthält "Hannes"): Werte im Original
const SOLL_P2 = {
  lang: [10, 10, 10, 10, 8],
  kurz: [10, 10, 10, 9, 0]
};

// Arbeitszeitkalender:
// 2026 ist vollständig nach dem schwarzen WKO-KURZ/LANG-Modell hinterlegt.
// Für Folgejahre kann eine neue arbeitskalender_JJJJ.json geladen werden.
// Es wird NICHT mehr geraten oder einfach wochenweise weitergewechselt.
const EMBEDDED_WORK_CALENDARS = {
  "2026": {
    jahr: 2026,
    wochen: {
      "1":"K",
      "2":"K",
      "3":"L",
      "4":"K",
      "5":"L",
      "6":"K",
      "7":"L",
      "8":"K",
      "9":"L",
      "10":"K",
      "11":"L",
      "12":"K",
      "13":"L",
      "14":"K",
      "15":"L",
      "16":"L",
      "17":"K",
      "18":"L",
      "19":"L",
      "20":"K",
      "21":"K",
      "22":"L",
      "23":"K",
      "24":"L",
      "25":"K",
      "26":"L",
      "27":"K",
      "28":"L",
      "29":"K",
      "30":"L",
      "31":"K",
      "32":"L",
      "33":"K",
      "34":"L",
      "35":"K",
      "36":"L",
      "37":"K",
      "38":"L",
      "39":"K",
      "40":"L",
      "41":"K",
      "42":"L",
      "43":"K",
      "44":"L",
      "45":"K",
      "46":"L",
      "47":"K",
      "48":"L",
      "49":"K",
      "50":"K",
      "51":"K",
      "52":"L",
      "53":"L"
    },
    feiertage: {
      "2026-01-01":"Neujahr",
      "2026-01-06":"Hl. 3 Könige",
      "2026-04-05":"Ostersonntag",
      "2026-04-06":"Ostermontag",
      "2026-05-01":"Staatsfeiertag",
      "2026-05-14":"Christi Himmelfahrt",
      "2026-05-24":"Pfingstsonntag",
      "2026-05-25":"Pfingstmontag",
      "2026-06-04":"Fronleichnam",
      "2026-08-15":"Mariä Himmelfahrt",
      "2026-10-26":"Nationalfeiertag",
      "2026-11-01":"Allerheiligen",
      "2026-12-08":"Mariä Empfängnis",
      "2026-12-25":"Christtag",
      "2026-12-26":"Stefanitag"
    }
  }
};

function workCalendarStorageKey(year){
  return `arbeitskalender_${year}`;
}

function normalizeWorkCalendar(data){
  if (!data || typeof data !== "object") return null;
  const year = Number(data.jahr);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;

  const weeks = data.wochen;
  if (!weeks || typeof weeks !== "object") return null;

  const normalizedWeeks = {};
  for (const [key, value] of Object.entries(weeks)){
    const kw = Number(key);
    const code = String(value ?? "").trim().toUpperCase();
    if (!Number.isInteger(kw) || kw < 1 || kw > 53) continue;
    if (code !== "K" && code !== "L") continue;
    normalizedWeeks[String(kw)] = code;
  }
  if (Object.keys(normalizedWeeks).length < 52) return null;

  const holidays = {};
  if (data.feiertage && typeof data.feiertage === "object"){
    for (const [date, name] of Object.entries(data.feiertage)){
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)){
        holidays[date] = String(name ?? "F").trim() || "F";
      }
    }
  }

  return { jahr:year, wochen:normalizedWeeks, feiertage:holidays };
}

function getWorkCalendar(year){
  // Für fest im Programm hinterlegte Jahre ist der eingebettete Kalender maßgeblich.
  // Dadurch kann eine ältere, versehentlich geladene JSON-Datei 2026 die geprüften
  // WKO-Daten nicht mehr überschreiben. Folgejahre kommen weiterhin aus localStorage.
  const embedded = EMBEDDED_WORK_CALENDARS[String(year)];
  const normalizedEmbedded = normalizeWorkCalendar(embedded);
  if (normalizedEmbedded) return normalizedEmbedded;

  const local = loadLocal(workCalendarStorageKey(year));
  const normalizedLocal = normalizeWorkCalendar(local);
  if (normalizedLocal) return normalizedLocal;

  return null;
}

function isoWeekNumberUTC(d){
  if (!d) return null;
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
}

function getWeekTypeForDate(d){
  if (!d) return null;
  const year = d.getUTCFullYear();
  const kw = isoWeekNumberUTC(d);
  const calendar = getWorkCalendar(year);
  const code = calendar?.wochen?.[String(kw)] ?? null;
  if (code === "L") return "lang";
  if (code === "K") return "kurz";
  return null;
}

function dateKeyUTC(d){
  if (!d) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}

function getHolidayName(d){
  if (!d) return "";
  const calendar = getWorkCalendar(d.getUTCFullYear());
  return calendar?.feiertage?.[dateKeyUTC(d)] ?? "";
}

function formatClockFromHours(hours){
  if (!Number.isFinite(hours) || hours < 0) return "";

  // Allgemeine Arbeitszeitberechnung für ganze UND Dezimalstunden:
  // Start 07:00 + tatsächlich angesetzte Arbeitsstunden + 1 Stunde Pause.
  // Beispiele: 7 -> 15:00, 7,5 -> 15:30, 10,5 -> 18:30.
  const totalMinutes = Math.round((7 + hours + 1) * 60);
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `7:00 - ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}; 1 Stunde Pause`;
}

function parsePlainMultiHours(rawValue){
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;
  if (!/^\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)+$/.test(raw)) return null;
  const nums = raw.split("/").map(part => parseLooseNumber(part.trim()));
  if (!nums.length || nums.some(n => n === null || !Number.isFinite(n))) return null;
  return nums.reduce((a,b) => a+b, 0);
}

// Mehrere Baustellenanteile mit optionalem A-Anteil, z.B. 3/1,5/2/2,5A.
// WICHTIG: Erst ab 3 Teilwerten, damit bestehende Arzt-Sonderfälle wie 4A/5
// weiterhin von der eigenen Arzt-Logik behandelt werden.
function parseMultiSiteHours(rawValue){
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;
  const parts = raw.split("/").map(p => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  let total = 0;
  for (const part of parts){
    const m = part.match(/^(\d+(?:[.,]\d+)?)\s*A?$/i);
    if (!m) return null;
    const n = parseLooseNumber(m[1]);
    if (n === null || !Number.isFinite(n)) return null;
    total += n;
  }
  return total;
}


function parseMultiDoctorHours(rawValue){
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;
  const parts = raw.split("/").map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  let doctor = null;
  let doctorIndex = -1;
  let work = 0;
  for (let i=0; i<parts.length; i++){
    const part = parts[i];
    const am = part.match(/^(\d+(?:[.,]\d+)?)\s*A$/i);
    if (am){
      if (doctor !== null) return null; // genau ein A-Anteil erlaubt
      doctor = parseLooseNumber(am[1]);
      doctorIndex = i;
      if (doctor === null) return null;
      continue;
    }
    const nm = part.match(/^(\d+(?:[.,]\d+)?)$/);
    if (!nm) return null;
    const n = parseLooseNumber(nm[1]);
    if (n === null) return null;
    work += n;
  }
  if (doctor === null) return null;
  return { doctor, doctorIndex, work, total: work + doctor, parts };
}
function parseDoctorTotal(rawValue){
  const upper = String(rawValue ?? "").trim().toUpperCase().replace(/\s+/g," ");
  let m = upper.match(/^(\d+(?:[.,]\d+)?)\s*A\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (!m) m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*A$/);
  if (!m) return null;
  const a = parseLooseNumber(m[1]), b = parseLooseNumber(m[2]);
  return a === null || b === null ? null : a+b;
}


function parseGeneralSlashCombination(rawValue){
  const raw = String(rawValue ?? "").trim();
  if (!raw || !raw.includes("/")) return null;

  const parts = raw.split("/").map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  let worked = 0;
  let hasPlainNumber = false;
  const codes = [];
  const codedParts = [];

  for (const part of parts){
    let m = part.match(/^(\d+(?:[.,]\d+)?)$/);
    if (m){
      const n = parseLooseNumber(m[1]);
      if (n === null || !Number.isFinite(n)) return null;
      worked += n;
      hasPlainNumber = true;
      continue;
    }

    m = part.match(/^(\d+(?:[.,]\d+)?)\s*(A|U|SU|SW|K|F)$/i);
    if (m){
      const n = parseLooseNumber(m[1]);
      if (n === null || !Number.isFinite(n)) return null;
      const code = m[2].toUpperCase();
      codes.push(code);
      codedParts.push({ code, hours:n });
      continue;
    }

    m = part.match(/^(A|U|SU|SW|K|F)$/i);
    if (m){
      codes.push(m[1].toUpperCase());
      codedParts.push({ code:m[1].toUpperCase(), hours:null });
      continue;
    }

    return null;
  }

  if (!codes.length) return null;
  return { raw, parts, worked, hasPlainNumber, codes, codedParts };
}

function parseWorkedHoursForSum(rawValue){
  const raw = String(rawValue ?? "").trim();
  const upper = raw.toUpperCase().replace(/\s+/g," ");
  if (!upper || ["U","SU","K","F","SW","KURZ","A"].includes(upper)) return 0;

  const generalSlash = parseGeneralSlashCombination(rawValue);
  if (generalSlash) return generalSlash.worked;

  // Für die Summe VORNE zählen nur tatsächlich gearbeitete Stunden.
  // Zeitanteile mit Kürzel (A/U/SU/SW/K/F) werden nicht mitgerechnet:
  // 7/2A -> 7, 7/2U -> 7, 7/2SU -> 7, 7/2SW -> 7, 7 + 2SW -> 7.
  // Reine Baustellenaufteilungen ohne Kürzel werden vollständig addiert: 3/3/3 -> 9.
  const parts = raw.split(/\s*[\/+]+\s*/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2){
    let total = 0;
    let recognized = true;
    for (const part of parts){
      const coded = part.match(/^(\d+(?:[.,]\d+)?)\s*(A|U|SU|SW|K|F)$/i);
      if (coded){
        // gekennzeichneter Anteil ist keine tatsächlich gearbeitete Zeit
        continue;
      }
      if (/^(A|U|SU|SW|K|F)$/i.test(part)) continue;
      const numeric = part.match(/^(\d+(?:[.,]\d+)?)$/);
      if (numeric){
        const n = parseLooseNumber(numeric[1]);
        if (n === null || !Number.isFinite(n)){ recognized = false; break; }
        total += n;
        continue;
      }
      recognized = false;
      break;
    }
    if (recognized) return total;
  }

  const n = parseLooseNumber(upper);
  if (n !== null && /^[-+]?\d+(?:[.,]\d+)?$/.test(upper)) return n;

  const worked = getWorkedHoursFromFront(rawValue);
  return worked === null ? 0 : worked;
}
function parseOriginalHoursForSum(rawValue){
  const upper = String(rawValue ?? "").trim().toUpperCase().replace(/\s+/g," ");
  if (!upper || ["U","SU","K","F","SW","KURZ"].includes(upper)) return 0;
  const multiDoctor = parseMultiDoctorHours(rawValue);
  if (multiDoctor) return multiDoctor.total;
  const multiSite = parseMultiSiteHours(rawValue);
  if (multiSite !== null) return multiSite;
  const multi = parsePlainMultiHours(rawValue);
  if (multi !== null) return multi;
  const n = parseLooseNumber(upper);
  if (n !== null && /^[-+]?\d+(?:[.,]\d+)?$/.test(upper)) return n;
  const doctor = parseDoctorTotal(rawValue);
  if (doctor !== null) return doctor;
  let m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*SW$/);
  if (m) return parseLooseNumber(m[1]) ?? 0;
  m = upper.match(/^SW\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (m) return parseLooseNumber(m[1]) ?? 0;
  return 0;
}

function getWorkedHoursFromFront(rawValue){
  const upper = String(rawValue ?? "").trim().toUpperCase().replace(/\s+/g," ");
  if (!upper) return null;

  const multiDoctor = parseMultiDoctorHours(rawValue);
  if (multiDoctor) return multiDoctor.work;

  const generalSlash = parseGeneralSlashCombination(rawValue);
  if (generalSlash) return generalSlash.worked;

  const multiSite = parseMultiSiteHours(rawValue);
  if (multiSite !== null) return multiSite;
  const multi = parsePlainMultiHours(rawValue);
  if (multi !== null) return multi;

  // Reine Stundenangabe: tatsächliche Arbeitsstunden.
  let m = upper.match(/^(\d+(?:[.,]\d+)?)$/);
  if (m) return parseLooseNumber(m[1]);

  // Schlechtwetter mit Slash: 4/SW oder SW/4 = 4 tatsächlich gearbeitete Stunden.
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*SW$/);
  if (m) return parseLooseNumber(m[1]);
  m = upper.match(/^SW\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (m) return parseLooseNumber(m[1]);

  // Arzt-Kombinationen: der Teil OHNE A sind die tatsächlich gearbeiteten Stunden.
  // 4A/5 -> 5 gearbeitet; 8/2A -> 8 gearbeitet.
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*A\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (m) return parseLooseNumber(m[2]);
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*A$/);
  if (m) return parseLooseNumber(m[1]);

  return null;
}

function isSlashSchlechtwetter(rawValue){
  const parsed = parseGeneralSlashCombination(rawValue);
  return !!parsed && parsed.codes.includes("SW");
}

function isDoctorCombination(rawValue){
  return parseMultiDoctorHours(rawValue) !== null;
}

function formatClockWorkedSpan(hours){
  if (!Number.isFinite(hours) || hours < 0) return "";
  const totalMinutes = Math.round((7 + hours) * 60);
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `7:00 - ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}; 1 Stunde Pause`;
}

function buildAutomaticWorktimeFromFront(rawValue, d, rowIndex, result){
  const targets = Number.isInteger(rowIndex) ? getTargetHoursForRow(d, rowIndex) : getTargetHours(d, false);
  const shortFriday = targets.week === "kurz" && targets.weekday === 5 && targets.p1 === 0;
  if (shortFriday || targets.weekday === 6 || targets.weekday === 7) return "";

  const originalUpper = String(result?.original ?? "").trim().toUpperCase();
  if (!originalUpper || ["F","U","SU","SW","KURZ"].includes(originalUpper)) return "";

  // Slash-Kombinationen mit Kürzeln: alle reinen Zahlenanteile sind tatsächlich gearbeitet.
  // Beispiele: 5/2/SW -> 7 h, SW/5/2 -> 7 h, 5/K -> 5 h, F/5 -> 5 h.
  const generalSlash = parseGeneralSlashCombination(rawValue);
  if (generalSlash && !generalSlash.codes.includes("A") && generalSlash.worked > 0){
    return formatClockFromHours(generalSlash.worked);
  }

  // Arzt-Kombination: Für die Arbeitszeit zählt der Arbeitsanteil im ORIGINAL.
  // Beispiel Hannes: vorne 3/1,5/2/2,5A = 9 Gesamtstunden -> Original 7,5/2,5A.
  // Daher muss die Arbeitszeit mit 7,5 h berechnet werden, nicht mit den 6,5 h aus Vorne.
  if (isDoctorCombination(rawValue)){
    const worked = getWorkedHoursFromFront(result?.original ?? rawValue);
    return worked === null ? "" : formatClockFromHours(worked);
  }

  // Bei normalen Stunden richtet sich die Arbeitszeit nach den Stunden im ORIGINAL.
  // Dadurch gilt z.B. bei Hannes: Original 10 -> 7:00 - 18:00.
  const originalHours = parseLooseNumber(originalUpper);
  if (originalHours !== null && /^[-+]?\d+(?:[.,]\d+)?$/.test(originalUpper)){
    return formatClockFromHours(originalHours);
  }

  return "";
}

function normalizeNumberString(n){
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(".", ",");
}

function parseLooseNumber(s){
  const n = parseFloat(String(s ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseMonthNumber(s){
  const raw = String(s ?? "").trim().toLowerCase()
    .replaceAll(".", "")
    .normalize("NFD").replace(/[̀-ͯ]/g,"");

  const n = parseInt(raw,10);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return n;

  const names = {
    januar:1, jan:1,
    februar:2, feb:2,
    marz:3, mrz:3, mar:3,
    april:4, apr:4,
    mai:5,
    juni:6, jun:6,
    juli:7, jul:7,
    august:8, aug:8,
    september:9, sep:9, sept:9,
    oktober:10, okt:10,
    november:11, nov:11,
    dezember:12, dez:12
  };
  return names[raw] || null;
}

function dateFromRow(dayValue, monthValue, yearValue){
  const dm = String(dayValue ?? "").match(/\d{1,2}/);
  const day = dm ? parseInt(dm[0],10) : NaN;
  const month = parseMonthNumber(monthValue);
  const yearMatch = String(yearValue ?? "").match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0],10) : NaN;

  if (!Number.isFinite(day) || !month || !Number.isFinite(year)) return null;

  const d = new Date(Date.UTC(year, month-1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month-1 || d.getUTCDate() !== day) return null;
  return d;
}

function mondayUTC(d){
  const day = d.getUTCDay(); // So=0, Mo=1
  const back = (day + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back);
}

function getTargetHours(d, person2){
  if (!d) return { p1:null, p2:null, week:null, weekday:null };
  const jsDay = d.getUTCDay(); // Mo=1 ... Fr=5
  if (jsDay < 1 || jsDay > 5) return { p1:null, p2:null, week:null, weekday:jsDay };

  const idx = jsDay - 1;
  const week = getWeekTypeForDate(d);
  if (!week) return { p1:null, p2:null, week:null, weekday:jsDay, calendarMissing:true };

  return {
    p1: SOLL_P1[week][idx],
    p2: SOLL_P2[week][idx],
    week,
    weekday: jsDay
  };
}

function getTargetHoursForRow(d, rowIndex){
  if (!d) return { p1:null, p2:null, week:null, weekday:null };

  // Die sichtbare Tages-Spalte des Formulars ist maßgeblich.
  // rowIndex 0=Mo, 1=Di, ... 6=So; danach beginnt die nächste Woche.
  const intendedIdx = ((rowIndex % 7) + 7) % 7; // Mo=0 ... So=6
  if (intendedIdx > 4) return { p1:null, p2:null, week:null, weekday:intendedIdx+1 };

  // Das eingetragene Datum kann in einer Testdatei einmal um einen Tag zur
  // gedruckten Wochentagszeile versetzt sein. Für LANG/KURZ wird es deshalb
  // auf den sichtbaren Wochentag derselben Zeile ausgerichtet.
  const actualIdx = (d.getUTCDay() + 6) % 7; // Mo=0 ... So=6
  let delta = intendedIdx - actualIdx;
  if (delta > 3) delta -= 7;
  if (delta < -3) delta += 7;
  const aligned = new Date(d.getTime() + delta * 24*60*60*1000);

  const week = getWeekTypeForDate(aligned);
  if (!week){
    return { p1:null, p2:null, week:null, weekday:intendedIdx + 1, calendarMissing:true };
  }
  return {
    p1: SOLL_P1[week][intendedIdx],
    p2: SOLL_P2[week][intendedIdx],
    week,
    weekday: intendedIdx + 1
  };
}

function computeHoursEntry(rawValue, d, person2, rowIndex=null){
  const raw = String(rawValue ?? "").trim();
  const upper = raw.toUpperCase().replace(/\s+/g," ").trim();
  const targets = Number.isInteger(rowIndex) ? getTargetHoursForRow(d, rowIndex) : getTargetHours(d, person2);

  // Ohne hinterlegten Jahreskalender werden keine Sollstunden geraten.
  if (targets.calendarMissing){
    return { original: raw, diff:"", calendarMissing:true };
  }

  // Hinterlegter Feiertag: wenn vorne nichts eingetragen wurde, wird automatisch F gesetzt.
  // Eine bewusste manuelle Eingabe vorne wird nicht überschrieben oder umgedeutet.
  const holiday = getHolidayName(d);
  if (!raw && holiday){
    return { original:"F", diff:"F", holiday };
  }

  // Kurzer Freitag ist im Original IMMER sichtbar.
  // Eingetragene Arbeitsstunden an diesem Tag sind vollständig Differenzstunden.
  const shortFriday = targets.week === "kurz" && targets.weekday === 5 && targets.p1 === 0;
  if (!raw){
    return { original: shortFriday ? "Kurz" : "", diff:"" };
  }

  // Reine Abwesenheits-/Sonderkürzel werden 1:1 übertragen.
  if (upper === "F")  return { original:"F",  diff:"F" };
  if (upper === "U")  return { original:"U",  diff:"U" };
  if (upper === "K")  return { original:"K",  diff:"K" };
  if (upper === "SU") return { original:"SU", diff:"SU" };
  if (upper === "SW") return { original:"SW", diff:"SW" };

  // U/SU + Zahl oder Zahl + U/SU -> Reihenfolge und Leerzeichen egal.
  // Beispiel: U + 9, 9 + U, SU+9, 9+SU.
  let m = upper.match(/^(U|SU)\s*\+\s*(\d+(?:[.,]\d+)?)$/);
  if (m){
    const code = m[1];
    const extra = parseLooseNumber(m[2]);
    return { original:code, diff: normalizeNumberString(extra) };
  }
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\+\s*(U|SU)$/);
  if (m){
    const extra = parseLooseNumber(m[1]);
    const code = m[2];
    return { original:code, diff: normalizeNumberString(extra) };
  }

  // SW + 6 bzw. 6 + SW -> Original SW, Differenz nur die Zahl.
  m = upper.match(/^SW\s*\+\s*(\d+(?:[.,]\d+)?)$/);
  if (m){
    const extra = parseLooseNumber(m[1]);
    return { original:"SW", diff: normalizeNumberString(extra) };
  }
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\+\s*SW$/);
  if (m){
    const extra = parseLooseNumber(m[1]);
    return { original:"SW", diff: normalizeNumberString(extra) };
  }

  // Allgemeine Slash-Kombinationen mit U/SU/SW/K/F, z.B. 5/2/SW, SW/5/2, 5/K, F/5.
  // Reihenfolge und Leerzeichen sind egal. Reine Zahlenanteile gelten als gearbeitet.
  // A-Kombinationen bleiben in der eigenen Arzt-Logik weiter unten.
  const generalSlash = parseGeneralSlashCombination(raw);
  if (generalSlash && !generalSlash.codes.includes("A")){
    const worked = generalSlash.worked;

    if (shortFriday){
      if (generalSlash.codes.includes("F")) return { original:"F", diff: worked > 0 ? normalizeNumberString(worked) : "F" };
      return { original:"Kurz", diff: worked > 0 ? normalizeNumberString(worked) : "" };
    }

    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5){
        return { original:"", diff: worked > 0 ? normalizeNumberString(worked) : "" };
      }
    }

    return { original:raw, diff:"" };
  }

  // 6/SW oder SW/6 -> unverändert ins Original, keine Differenz.
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*SW$/);
  if (m) return { original: raw, diff:"" };
  m = upper.match(/^SW\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (m) return { original: raw, diff:"" };

  // Arzt-Kombinationen mit beliebig vielen Slash-Teilen, z.B. 6/1/2A.
  // Alle Arbeitsanteile werden addiert, der A-Anteil bleibt im Original erhalten.
  // Original wird auf die jeweilige Sollzeit komprimiert: 6/1/2A -> 7/2A,
  // bei Hannes -> 8/2A. Die Differenz bleibt gegen Person-1-Soll.
  const multiDoctor = parseMultiDoctorHours(raw);
  if (multiDoctor){
    const total = multiDoctor.total;

    if (shortFriday){
      return { original:"Kurz", diff: total > 0 ? normalizeNumberString(total) : "" };
    }

    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5){
        return { original:"", diff: total > 0 ? normalizeNumberString(total) : "" };
      }
    }

    const target = person2 ? targets.p2 : targets.p1;
    let original = raw;
    if (Number.isFinite(target) && target > 0){
      const workTarget = Math.max(0, target - multiDoctor.doctor);
      if (multiDoctor.doctorIndex === 0){
        original = `${normalizeNumberString(multiDoctor.doctor)}A/${normalizeNumberString(workTarget)}`;
      } else {
        original = `${normalizeNumberString(workTarget)}/${normalizeNumberString(multiDoctor.doctor)}A`;
      }
    }

    const diff = Number.isFinite(targets.p1) ? Math.max(0, total - targets.p1) : 0;
    return { original, diff: diff > 0 ? normalizeNumberString(diff) : "" };
  }

  // Arzt-Kombinationen, z.B. 4A/5 oder 8/2A.
  // Für die Differenz zählt die Summe aus Arzt- und Arbeitszeit gegen Person-1-Soll.
  m = upper.match(/^(\d+(?:[.,]\d+)?)\s*A\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  let doctorForm = "left";
  if (!m){
    m = upper.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*A$/);
    doctorForm = "right";
  }
  if (m){
    const first = parseLooseNumber(m[1]) ?? 0;
    const second = parseLooseNumber(m[2]) ?? 0;
    const total = first + second;

    if (shortFriday){
      return { original:"Kurz", diff: total > 0 ? normalizeNumberString(total) : "" };
    }

    // Wochenende: komplette erfasste Zeit ist Differenz, Original bleibt leer.
    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5){
        return { original:"", diff: total > 0 ? normalizeNumberString(total) : "" };
      }
    }

    let original = raw;

    // Hannes: Original orientiert sich an seinem höheren Soll. Der A-Anteil bleibt unverändert,
    // nur der Arbeitsanteil wird bei Bedarf auf das Hannes-Soll ergänzt.
    if (person2 && Number.isFinite(targets.p2) && targets.p2 > 0 && total < targets.p2){
      if (doctorForm === "left"){
        const doctor = first;
        const work = Math.max(0, targets.p2 - doctor);
        original = `${normalizeNumberString(doctor)}A/${normalizeNumberString(work)}`;
      } else {
        const doctor = second;
        const work = Math.max(0, targets.p2 - doctor);
        original = `${normalizeNumberString(work)}/${normalizeNumberString(doctor)}A`;
      }
    }

    const diff = Number.isFinite(targets.p1) ? Math.max(0, total - targets.p1) : 0;
    return { original, diff: diff > 0 ? normalizeNumberString(diff) : "" };
  }

  // Mehrere Baustellenstunden, auch mit optionalem A-Anteil in einem Teilwert,
  // z.B. 3/3/3 oder 3/1,5/2/2,5A. Zuerst wird ALLES addiert.
  // Danach gilt dieselbe Soll-/Differenzlogik wie bei einer normalen Gesamtstundenzahl.
  const multiSiteHours = parseMultiSiteHours(raw);
  if (multiSiteHours !== null){
    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5) return { original:"", diff: multiSiteHours > 0 ? normalizeNumberString(multiSiteHours) : "" };
    }
    if (shortFriday) return { original:"Kurz", diff: multiSiteHours > 0 ? normalizeNumberString(multiSiteHours) : "" };
    if (!Number.isFinite(targets.p1)) return { original:raw, diff:"" };
    const diff = multiSiteHours - targets.p1;
    const originalTarget = person2 ? targets.p2 : targets.p1;
    const original = Number.isFinite(originalTarget) && originalTarget > 0 ? normalizeNumberString(originalTarget) : "";
    return { original, diff: Math.abs(diff) > 1e-9 ? normalizeNumberString(diff) : "" };
  }

  // Mehrere reine Baustellenstunden, z.B. 3/3/3 oder 3 / 4 / 3.
  const multiHours = parsePlainMultiHours(raw);
  if (multiHours !== null){
    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5) return { original:"", diff: multiHours > 0 ? normalizeNumberString(multiHours) : "" };
    }
    if (shortFriday) return { original:"Kurz", diff: multiHours > 0 ? normalizeNumberString(multiHours) : "" };
    if (!Number.isFinite(targets.p1)) return { original:raw, diff:"" };
    const diff = multiHours - targets.p1;
    const originalTarget = person2 ? targets.p2 : targets.p1;
    const original = Number.isFinite(originalTarget) && originalTarget > 0 ? normalizeNumberString(originalTarget) : "";
    return { original, diff: Math.abs(diff) > 1e-9 ? normalizeNumberString(diff) : "" };
  }

  // Normale Stunden.
  const hours = parseLooseNumber(upper);
  if (hours !== null && /^[-+]?\d+(?:[.,]\d+)?$/.test(upper)){
    if (Number.isInteger(rowIndex)){
      const dayIndex = ((rowIndex % 7) + 7) % 7;
      if (dayIndex >= 5){
        return { original:"", diff: hours > 0 ? normalizeNumberString(hours) : "" };
      }
    }

    if (shortFriday){
      return { original:"Kurz", diff: hours > 0 ? normalizeNumberString(hours) : "" };
    }

    if (!Number.isFinite(targets.p1)){
      return { original: raw, diff:"" };
    }

    // Differenz IMMER gegen Person 1, auch bei Hannes.
    // Bei normalen numerischen Arbeitstagen werden jetzt auch Minusstunden ausgewiesen.
    // Sonderfälle wie U/SU/K/F/SW/A bleiben davon ausdrücklich ausgenommen.
    const diff = hours - targets.p1;

    // Original zeigt immer die Sollzeit der jeweiligen Person, auch wenn vorne weniger steht.
    const originalTarget = person2 ? targets.p2 : targets.p1;
    const original = Number.isFinite(originalTarget) && originalTarget > 0
      ? normalizeNumberString(originalTarget)
      : "";

    return { original, diff: Math.abs(diff) > 1e-9 ? normalizeNumberString(diff) : "" };
  }

  // Unbekannte Eingaben werden nicht erfunden oder umgedeutet.
  return { original: raw, diff:"" };
}

function runStundenLogicSelfTests(){
  const tests = [];
  const add = (name, got, expected) => tests.push({name, got:String(got ?? ""), expected:String(expected ?? "")});
  const d = (y,m,day) => new Date(Date.UTC(y,m-1,day));

  // Mehrere Baustellenanteile inkl. Dezimalkomma + A-Anteil werden zuerst summiert.
  let md = computeHoursEntry("6/1/2A", d(2026,7,1), false, 2);
  add("Mehrfach+A P1 Original", md.original, "7/2A");
  add("Mehrfach+A P1 Differenz", md.diff, "");
  md = computeHoursEntry("6/1/2A", d(2026,7,1), true, 2);
  add("Mehrfach+A Hannes Original", md.original, "8/2A");
  add("Mehrfach+A Hannes Differenz", md.diff, "");

  let mx = computeHoursEntry("3/1,5/2/2,5A", d(2026,7,1), true, 2);
  add("Mehrbaustelle+A Hannes Original", mx.original, "7,5/2,5A");
  add("Mehrbaustelle+A Hannes Differenz", mx.diff, "");
  add("Mehrbaustelle+A Arbeitssumme", parseWorkedHoursForSum("3/1,5/2/2,5A"), "6.5");
  add("7/2A Arbeitssumme", parseWorkedHoursForSum("7/2A"), "7");
  add("7/2U Arbeitssumme", parseWorkedHoursForSum("7/2U"), "7");
  add("7/2SU Arbeitssumme", parseWorkedHoursForSum("7 / 2SU"), "7");
  add("7/2SW Arbeitssumme", parseWorkedHoursForSum("7/2SW"), "7");
  add("7+2SW Arbeitssumme", parseWorkedHoursForSum("7 + 2Sw"), "7");
  add("5/2/SW Arbeitssumme", parseWorkedHoursForSum("5 / 2 / SW"), "7");
  add("SW/5/2 Arbeitssumme", parseWorkedHoursForSum("SW/5/2"), "7");
  add("5/K Arbeitssumme", parseWorkedHoursForSum("5/K"), "5");
  add("F/5 Arbeitssumme", parseWorkedHoursForSum("F/5"), "5");
  let slashCombo = computeHoursEntry("5 / 2 / SW", d(2026,7,8), false, 2);
  add("5/2/SW Original", slashCombo.original, "5 / 2 / SW");
  add("5/2/SW Differenz", slashCombo.diff, "");
  add("5/2/SW Arbeitszeit", buildAutomaticWorktimeFromFront("5 / 2 / SW", d(2026,7,8), 2, slashCombo), "7:00 - 15:00; 1 Stunde Pause");
  let plusCode = computeHoursEntry("U + 9", d(2026,7,1), false, 2);
  add("U+9 Original", plusCode.original, "U");
  add("U+9 Differenz", plusCode.diff, "9");
  plusCode = computeHoursEntry("9 + U", d(2026,7,1), false, 2);
  add("9+U Original", plusCode.original, "U");
  add("9+U Differenz", plusCode.diff, "9");
  plusCode = computeHoursEntry("9 + SU", d(2026,7,1), false, 2);
  add("9+SU Original", plusCode.original, "SU");
  add("9+SU Differenz", plusCode.diff, "9");

  // 2026: erste Aprilwoche ist KURZ, 06.-10.04. und 13.-17.04. sind LANG.
  let r = computeHoursEntry("9", d(2026,4,1), true, 2);   // Mi, Hannes, kurz
  add("Hannes kurz Mi Original", r.original, "10");
  add("Hannes kurz Mi Differenz", r.diff, "");

  r = computeHoursEntry("10", d(2026,4,2), true, 3);     // Do, Hannes, kurz
  add("Hannes kurz Do Original", r.original, "9");
  add("Hannes kurz Do Differenz", r.diff, "2");

  r = computeHoursEntry("9", d(2026,4,3), true, 4);      // kurzer Freitag
  add("Kurzer Freitag Original", r.original, "Kurz");
  add("Kurzer Freitag Differenz", r.diff, "9");

  r = computeHoursEntry("9", d(2026,4,4), true, 5);      // Samstag
  add("Samstag Original", r.original, "");
  add("Samstag Differenz", r.diff, "9");

  r = computeHoursEntry("10", d(2026,4,10), true, 11);   // Fr der Folgewoche: rowIndex 11 -> Fr
  add("Hannes lang Fr Original", r.original, "8");
  add("Hannes lang Fr Differenz", r.diff, "3");

  r = computeHoursEntry("SW + 6", d(2026,7,7), false, 1);
  add("SW plus Original", r.original, "SW");
  add("SW plus Differenz", r.diff, "6");

  r = computeHoursEntry("6/SW", d(2026,7,8), false, 2);
  add("Slash SW Original", r.original, "6/SW");
  add("Slash SW Differenz", r.diff, "");

  r = computeHoursEntry("4A/5", d(2026,7,9), false, 3);
  add("Arzt erfüllt Original", r.original, "4A/5");
  add("Arzt erfüllt Differenz", r.diff, "");

  r = computeHoursEntry("", d(2026,4,6), false, 0);
  add("Ostermontag Original", r.original, "F");
  add("Ostermontag Differenz", r.diff, "F");

  r = computeHoursEntry("9", d(2026,4,1), true, 2);
  add("Hannes 10h Arbeitszeit", buildAutomaticWorktimeFromFront("9", d(2026,4,1), 2, r), "7:00 - 18:00; 1 Stunde Pause");

  r = computeHoursEntry("10", d(2026,4,10), true, 11);
  add("Hannes Freitag 8h Arbeitszeit", buildAutomaticWorktimeFromFront("10", d(2026,4,10), 11, r), "7:00 - 16:00; 1 Stunde Pause");

  r = computeHoursEntry("7/SW", d(2026,7,8), false, 2);
  add("7/SW Arbeitszeit", buildAutomaticWorktimeFromFront("7/SW", d(2026,7,8), 2, r), "7:00 - 15:00; 1 Stunde Pause");

  r = computeHoursEntry(" sw / 7 ", d(2026,7,8), false, 2);
  add("SW/7 Schreibweise", buildAutomaticWorktimeFromFront(" sw / 7 ", d(2026,7,8), 2, r), "7:00 - 15:00; 1 Stunde Pause");

  r = computeHoursEntry("K", d(2026,7,9), false, 3);
  add("K Original", r.original, "K");
  add("K Differenz", r.diff, "K");

  r = computeHoursEntry("4A/5", d(2026,7,9), false, 3);
  add("4A/5 Arbeitszeit", buildAutomaticWorktimeFromFront("4A/5", d(2026,7,9), 3, r), "7:00 - 13:00; 1 Stunde Pause");

  r = computeHoursEntry("8", d(2026,7,13), false, 0);
  add("Normaltag Minusstunde", r.diff, "-1");

  r = computeHoursEntry("U", d(2026,7,14), false, 1);
  add("Urlaub keine Minusstunde", r.diff, "U");

  r = computeHoursEntry("6/SW", d(2026,7,15), false, 2);
  add("SW Slash keine Minusstunde", r.diff, "");

  r = computeHoursEntry("3/3/3", d(2026,7,13), false, 0);
  add("Mehrere Baustellen 9 Original", r.original, "9");
  add("Mehrere Baustellen 9 Differenz", r.diff, "");

  r = computeHoursEntry("3 / 4 / 3", d(2026,7,13), false, 0);
  add("Mehrere Baustellen 10 Original", r.original, "9");
  add("Mehrere Baustellen 10 Differenz", r.diff, "1");

  r = computeHoursEntry("2/3/2", d(2026,7,13), false, 0);
  add("Mehrere Baustellen 7 Differenz", r.diff, "-2");

  const failures = tests.filter(t => t.got !== t.expected);
  if (failures.length){
    console.error("Stundenzettel-Logiktest FEHLER", failures);
    return false;
  }
  console.info(`Stundenzettel-Logiktest OK (${tests.length} Prüfungen)`);
  return true;
}
