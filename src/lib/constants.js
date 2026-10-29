// Värden per utdelningsår (= beskattningsår). Gränsbeloppet räknas på
// föregående års inkomstbasbelopp (IBB) och statslåneräntan (SLR) den
// 30 november föregående år.
export const AR_VARDEN = {
  2026: { ibb: 80_600, slr: 0.0255 }, // IBB 2025, SLR 30 nov 2025
  2027: { ibb: 83_400, slr: null },   // IBB 2026; SLR 30 nov 2026 fastställs i början av december 2026
};

// Vid årsskiftet: byt här, så följer beräkningar och texter med.
// Testerna stoppar ett byte till ett år där något värde saknas.
export const UTDELNINGSAR = 2026;

export const IBB = AR_VARDEN[UTDELNINGSAR].ibb;
export const IBB_AR = UTDELNINGSAR - 1;

// Grundbelopp: 4 × IBB
export const GRUNDBELOPP_FACTOR = 4;
export const GRUNDBELOPP_FULL = GRUNDBELOPP_FACTOR * IBB;

// Löneavdrag: 8 × IBB
export const LONEAVDRAG_FACTOR = 8;
export const LONEAVDRAG = LONEAVDRAG_FACTOR * IBB;

// Lönebaserat utrymme: 50% av (löneunderlag - löneavdrag)
export const LONEBASERAT_PERCENTAGE = 0.50;

// Cap: max 50 × ägarens kontanta ersättning
export const LONEBASERAT_CAP_FACTOR = 50;

// Ränta på omkostnadsbelopp: (omkostnadsbelopp - 100 000) × (SLR + 9%)
export const SLR = AR_VARDEN[UTDELNINGSAR].slr;
export const RANTA_TILLAGG = 0.09;
export const RANTA_PROCENT = SLR + RANTA_TILLAGG;
export const OMKOSTNAD_TRÖSKEL = 100_000;

// Skattesatser
export const KAPITALSKATT = 0.20;           // 20% inom gränsbelopp
export const PROGRESSIV_SKATT_APPROX = 0.50; // ~50% över gränsbelopp (approximation)

// K10-blanketten per utdelningsår, enligt Skatteverkets fältnamnstabell
// (SKV 269, K10_SKV2110-39-04-26-01). Taket i p. 2.3 är 90 × IBB för utdelningsåret.
export const K10_BLANKETTER = {
  2026: { blankettblock: 'K10-2026P4', takTjanstUtdelning: 7_506_000 },
};
export const K10_BLANKETT = K10_BLANKETTER[UTDELNINGSAR];
