import {
  IBB,
  GRUNDBELOPP_FACTOR,
  LONEAVDRAG_FACTOR,
  LONEBASERAT_PERCENTAGE,
  LONEBASERAT_CAP_FACTOR,
  RANTA_PROCENT,
  OMKOSTNAD_TRÖSKEL,
  KAPITALSKATT,
  PROGRESSIV_SKATT_APPROX,
} from './constants.js';

/**
 * Beräkna gränsbelopp och alla delkomponenter.
 *
 * @param {number} agarandel - Ägarandel 0-1 (t.ex. 0.25 = 25%)
 * @param {number} totalLonesumma - Total lönesumma i bolaget (kr)
 * @param {number} egenLon - Ägarens egen lön (kr)
 * @param {number} omkostnadsbelopp - Anskaffningsvärde för aktierna (kr)
 * @param {number} ibb - Inkomstbasbelopp (default IBB)
 * @returns {object} Objekt med alla beräkningskomponenter
 */
export function beraknaGransbelopp(agarandel, totalLonesumma, egenLon, omkostnadsbelopp = 0, ibb = IBB) {
  // 1. Grundbelopp = ägarandel × 4 × IBB
  const grundbelopp = agarandel * GRUNDBELOPP_FACTOR * ibb;

  // 2. Lönebaserat utrymme
  const loneunderlag = agarandel * totalLonesumma;
  const loneavdrag = LONEAVDRAG_FACTOR * ibb;
  const lonebaseratRaw = Math.max(0, loneunderlag - loneavdrag) * LONEBASERAT_PERCENTAGE;

  // 3. Cap: lönebaserat ≤ 50 × ägarens kontanta ersättning
  const lonebaseratCap = LONEBASERAT_CAP_FACTOR * egenLon;
  const capApplied = lonebaseratRaw > lonebaseratCap;
  const lonebaseratUtrymme = Math.min(lonebaseratRaw, lonebaseratCap);

  // 4. Ränta på omkostnadsbelopp: (belopp - 100 000) × (SLR + 9%)
  const rantaBas = Math.max(0, omkostnadsbelopp - OMKOSTNAD_TRÖSKEL);
  const rantaUtrymme = rantaBas * RANTA_PROCENT;

  // 5. Gränsbelopp = grundbelopp + lönebaserat utrymme + ränta
  const gransbelopp = grundbelopp + lonebaseratUtrymme + rantaUtrymme;

  return {
    agarandel,
    grundbelopp,
    loneunderlag,
    loneavdrag,
    lonebaseratRaw,
    lonebaseratCap,
    lonebaseratUtrymme,
    capApplied,
    omkostnadsbelopp,
    rantaBas,
    rantaUtrymme,
    gransbelopp,
  };
}

/**
 * Beräkna skatt på utdelning givet gränsbelopp.
 *
 * @param {number} utdelning - Utdelningsbelopp (kr)
 * @param {number} gransbelopp - Gränsbelopp (kr)
 * @returns {object} Skatteuppdelning
 */
export function beraknaTax(utdelning, gransbelopp) {
  const inomGrans = Math.min(utdelning, gransbelopp);
  const overGrans = Math.max(0, utdelning - gransbelopp);

  const skattInom = inomGrans * KAPITALSKATT;
  const skattOver = overGrans * PROGRESSIV_SKATT_APPROX;
  const totalSkatt = skattInom + skattOver;
  const effektivSkattesats = utdelning > 0 ? totalSkatt / utdelning : 0;

  return {
    utdelning,
    gransbelopp,
    inomGrans,
    overGrans,
    skattInom,
    skattOver,
    totalSkatt,
    effektivSkattesats,
  };
}
