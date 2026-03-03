// 3:12-reglerna använder föregående års IBB.
// För beskattningsår 2026 → IBB 2025 = 80 600 kr
export const IBB = 80_600;
export const IBB_AR = 2025;

// Grundbelopp: 4 × IBB
export const GRUNDBELOPP_FACTOR = 4;
export const GRUNDBELOPP_FULL = GRUNDBELOPP_FACTOR * IBB; // 322 400 kr

// Löneavdrag: 8 × IBB
export const LONEAVDRAG_FACTOR = 8;
export const LONEAVDRAG = LONEAVDRAG_FACTOR * IBB; // 644 800 kr

// Lönebaserat utrymme: 50% av (löneunderlag - löneavdrag)
export const LONEBASERAT_PERCENTAGE = 0.50;

// Cap: max 50 × ägarens kontanta ersättning
export const LONEBASERAT_CAP_FACTOR = 50;

// Ränta på omkostnadsbelopp: (omkostnadsbelopp - 100 000) × (SLR + 9%)
// Statslåneräntan 30 nov 2025 = 2,55%
export const SLR = 0.0255;
export const RANTA_TILLAGG = 0.09;
export const RANTA_PROCENT = SLR + RANTA_TILLAGG; // 11,55%
export const OMKOSTNAD_TRÖSKEL = 100_000;

// Skattesatser
export const KAPITALSKATT = 0.20;           // 20% inom gränsbelopp
export const PROGRESSIV_SKATT_APPROX = 0.50; // ~50% över gränsbelopp (approximation)
