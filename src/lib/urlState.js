// Kalkylatorns indata sparas i URL:en så att ett scenario kan delas som länk.
// Bara värden som skiljer sig från standard skrivs ut, så länkarna hålls korta.

export const DEFAULTS = {
  agarandel: 25,
  totalLonesumma: 2_000_000,
  omkostnadsbeloppDirekt: 100_000,
  sparatUtrymme: 0,
  omkostnadsbeloppHolding: 100_000,
  holdingKostnad: 5_000,
  holdingStartKostnad: 7_500,
  planeradUtdelningAktiv: false,
  planeradUtdelning: 200_000,
  ovrigaBolag: [],
  dotterbolagOverride: false,
};

// Talparametrar: fält → [URL-nyckel, min, max]
const NUMBERS = {
  agarandel: ['a', 1, 100],
  totalLonesumma: ['l', 0, Infinity],
  omkostnadsbeloppDirekt: ['od', 0, Infinity],
  sparatUtrymme: ['s', 0, Infinity],
  omkostnadsbeloppHolding: ['oh', 0, Infinity],
  holdingKostnad: ['hk', 0, Infinity],
  holdingStartKostnad: ['hs', 0, Infinity],
};

function parseNumber(raw, min, max) {
  const n = Number(raw);
  if (raw === null || raw === '' || !Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

/**
 * Läs ett scenario från en query-sträng. Saknade eller ogiltiga värden
 * får sitt standardvärde.
 *
 * @param {string} search - t.ex. location.search
 * @returns {object} Fullständigt state med samma fält som DEFAULTS
 */
export function readState(search) {
  const params = new URLSearchParams(search);
  const state = { ...DEFAULTS, ovrigaBolag: [] };

  for (const [field, [key, min, max]] of Object.entries(NUMBERS)) {
    const value = parseNumber(params.get(key), min, max);
    if (value !== undefined) state[field] = value;
  }

  // Planerad utdelning: parametern finns bara när den är aktiv
  const utdelning = parseNumber(params.get('u'), 0, Infinity);
  if (utdelning !== undefined) {
    state.planeradUtdelningAktiv = true;
    state.planeradUtdelning = utdelning;
  }

  state.dotterbolagOverride = params.get('d') === '1';

  // Övriga bolag: upprepad parameter "andel|namn", t.ex. b=60|Bolag%20AB
  for (const entry of params.getAll('b')) {
    const sep = entry.indexOf('|');
    const andel = parseNumber(sep === -1 ? entry : entry.slice(0, sep), 1, 100);
    if (andel === undefined) continue;
    state.ovrigaBolag.push({ namn: sep === -1 ? '' : entry.slice(sep + 1), andel });
  }

  return state;
}

/**
 * Skriv ett scenario som query-sträng (utan inledande "?").
 * Standardvärden utelämnas.
 *
 * @param {object} state - Samma fält som DEFAULTS
 * @returns {string}
 */
export function writeState(state) {
  const params = new URLSearchParams();

  for (const [field, [key]] of Object.entries(NUMBERS)) {
    if (state[field] !== DEFAULTS[field]) params.set(key, String(state[field]));
  }
  if (state.planeradUtdelningAktiv) params.set('u', String(state.planeradUtdelning));
  if (state.dotterbolagOverride) params.set('d', '1');
  for (const bolag of state.ovrigaBolag) {
    params.append('b', bolag.namn ? `${bolag.andel}|${bolag.namn}` : String(bolag.andel));
  }

  return params.toString();
}
