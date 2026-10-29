import {
  IBB,
  GRUNDBELOPP_FACTOR,
  LONEAVDRAG_FACTOR,
  LONEBASERAT_PERCENTAGE,
  LONEBASERAT_CAP_FACTOR,
  RANTA_PROCENT,
  OMKOSTNAD_TRÖSKEL,
  K10_BLANKETT,
} from './constants.js';

// K10 för det enkla fallet: ett svenskt bolag, aktierna ägda hela föregående år
// och vid årets ingång, ingen försäljning eller gåva under året, ingen make/maka
// som äger aktier och inga dotterföretag. Fältkoderna är Skatteverkets (SKV 269).

// Hela kronor. Avrundas först till öre så att t.ex. 100 000 × 11,55 % inte blir
// 11 549 kr på grund av flyttalsfel, och sedan nedåt så att gränsbeloppet aldrig
// blir större än vad reglerna ger.
const kronor = (x) => Math.floor(Math.round(x * 100) / 100);

/**
 * Räkna fram K10:ans rutor.
 *
 * @param {object} u
 * @param {number} u.aktierAgda - Antal aktier du ägde vid årets ingång
 * @param {number} u.aktierTotalt - Totala antalet aktier i företaget vid årets ingång
 * @param {number} u.lonesumma - Kontant ersättning till arbetstagare i företaget föregående år
 * @param {number} u.egenLon - Din (och närståendes) kontanta ersättning från företaget föregående år
 * @param {number} u.omkostnadsbelopp - Omkostnadsbelopp för dina aktier
 * @param {number} u.sparatUtrymme - Sparat utdelningsutrymme från föregående års K10
 * @param {number} u.utdelning - Utdelning du fått under inkomståret
 * @param {number[]} u.ovrigaAgarandelar - Ägarandelar 0-1 i övriga fåmansbolag
 * @param {object} v - Årsvärden; standard är det aktiva utdelningsårets
 * @returns {object} Rutor i blankettens ordning samt summor att föra till Inkomstdeklaration 1
 */
export function beraknaK10(u, v = {}) {
  const { ibb = IBB, rantaProcent = RANTA_PROCENT, takTjanst = K10_BLANKETT.takTjanstUtdelning } = v;
  const andel = u.aktierAgda / u.aktierTotalt;
  const ovriga = u.ovrigaAgarandelar ?? [];

  // A. Gränsbelopp
  const grundFull = GRUNDBELOPP_FACTOR * ibb;
  const summaAndelar = andel + ovriga.reduce((s, a) => s + a, 0);
  const grundbelopp = kronor(summaAndelar > 1 ? (andel / summaAndelar) * grundFull : andel * grundFull);

  // D. Lönebaserat utrymme, för aktier ägda hela föregående år
  const loneunderlag = kronor(u.lonesumma * andel);
  const loneavdrag = LONEAVDRAG_FACTOR * ibb;
  const efterAvdrag = loneunderlag - loneavdrag;
  const lonebaseratSammanlagt = efterAvdrag > 0 ? kronor(efterAvdrag * LONEBASERAT_PERCENTAGE) : 0;
  const lonebaseratTak = LONEBASERAT_CAP_FACTOR * u.egenLon;
  const lonebaserat = Math.min(lonebaseratSammanlagt, lonebaseratTak);

  const ranta = kronor(Math.max(0, u.omkostnadsbelopp - OMKOSTNAD_TRÖSKEL) * rantaProcent);
  const gransbelopp = grundbelopp + lonebaserat + ranta + u.sparatUtrymme;

  const rutor = [
    { avsnitt: 'A', punkt: '1.1', kod: 4511, text: 'Grundbelopp', belopp: grundbelopp },
    { avsnitt: 'A', punkt: '1.2', kod: 4521, text: 'Lönebaserat utrymme enligt avsnitt D', belopp: lonebaserat },
    { avsnitt: 'A', punkt: '1.3', kod: 4520, text: 'Ränta på omkostnadsbelopp över 100 000 kr', belopp: ranta },
    { avsnitt: 'A', punkt: '1.4', kod: 4522, text: 'Sparat utdelningsutrymme från föregående år', belopp: u.sparatUtrymme },
    { avsnitt: 'A', punkt: '1.6', kod: 4524, text: 'Gränsbelopp', belopp: gransbelopp },
  ];

  // B. Utdelning; fylls bara i om du fått utdelning
  let tjanst = 0;
  let kapital = 0;
  let sparatTillNastaAr = gransbelopp;
  if (u.utdelning > 0) {
    tjanst = Math.min(Math.max(0, u.utdelning - gransbelopp), takTjanst);
    sparatTillNastaAr = Math.max(0, gransbelopp - u.utdelning);
    const inomGrans = Math.min(u.utdelning, gransbelopp);
    const skattepliktigInom = Math.round((inomGrans * 2) / 3);
    const kvarvarande = u.utdelning - tjanst - inomGrans;
    kapital = skattepliktigInom + kvarvarande;

    rutor.push(
      { avsnitt: 'B', punkt: '2.1', kod: 4525, text: 'Utdelning', belopp: u.utdelning },
      { avsnitt: 'B', punkt: '2.2', kod: 4731, text: 'Gränsbelopp från p. 1.6', belopp: gransbelopp },
      { avsnitt: 'B', punkt: '2.3', kod: 4526, text: 'Inkomst av tjänst', belopp: tjanst },
      { avsnitt: 'B', punkt: '2.4', kod: 4732, text: 'Sparat utdelningsutrymme', belopp: sparatTillNastaAr },
      { avsnitt: 'B', punkt: '2.6', kod: 4734, text: 'Sparat utdelningsutrymme till nästa år', belopp: sparatTillNastaAr },
      { avsnitt: 'B', punkt: '2.7', kod: 4736, text: 'Utdelning inom gränsbeloppet', belopp: inomGrans },
      { avsnitt: 'B', punkt: '2.8', kod: 4529, text: 'Skattepliktig del av utdelning inom gränsbeloppet (2/3)', belopp: skattepliktigInom },
      { avsnitt: 'B', punkt: '2.9', kod: 4540, text: 'Kvarvarande utdelning som beskattas i sin helhet', belopp: kvarvarande },
      { avsnitt: 'B', punkt: '2.10', kod: 4541, text: 'Inkomst av kapital', belopp: kapital },
    );
  }

  // D fylls bara i när det finns ett lönebaserat utrymme att föra till p. 1.2
  if (lonebaseratSammanlagt > 0) {
    rutor.push(
      { avsnitt: 'D', punkt: '4.1', kod: 4570, text: 'Kontant ersättning till arbetstagare i företaget', belopp: u.lonesumma },
      { avsnitt: 'D', punkt: '4.3', kod: 4572, text: 'Löneunderlag för aktier ägda hela året', belopp: u.lonesumma },
      { avsnitt: 'D', punkt: '4.4', kod: 4576, text: 'Din andel av löneunderlaget', belopp: loneunderlag },
      { avsnitt: 'D', punkt: '4.9', kod: 4584, text: 'Totalt löneunderlag', belopp: loneunderlag },
      { avsnitt: 'D', punkt: '4.10', kod: 4585, text: 'Löneavdrag (8 inkomstbasbelopp)', belopp: loneavdrag },
      { avsnitt: 'D', punkt: '4.11', kod: 4586, text: 'Ditt löneunderlag efter löneavdrag', belopp: efterAvdrag },
      { avsnitt: 'D', punkt: '4.12', kod: 4587, text: 'Ditt lönebaserade utrymme (50 %)', belopp: lonebaseratSammanlagt },
    );
  }

  return {
    andel,
    rutor,
    gransbelopp,
    lonebaseratBegransat: lonebaserat < lonebaseratSammanlagt,
    sparatTillNastaAr,
    // Förs till Inkomstdeklaration 1: p. 1.7 (tjänst) och p. 7.2 (kapital)
    tjanst,
    kapital,
  };
}

// Luhn-kontrollsiffra över tio siffror
function luhn(tio) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let d = Number(tio[i]) * (i % 2 === 0 ? 2 : 1);
    sum += d > 9 ? d - 9 : d;
  }
  return sum % 10 === 0;
}

/**
 * Personnummer eller samordningsnummer som tolv siffror (ÅÅÅÅMMDDNNNK), eller null.
 * Kräver århundradet så att det inte behöver gissas.
 */
export function normaliseraPersonnummer(str) {
  const siffror = String(str).replace(/[\s-]/g, '');
  if (!/^(19|20)\d{10}$/.test(siffror)) return null;
  const manad = Number(siffror.slice(4, 6));
  const dag = Number(siffror.slice(6, 8)) % 60; // samordningsnummer: dag + 60
  if (manad < 1 || manad > 12 || dag < 1 || dag > 31) return null;
  return luhn(siffror.slice(2)) ? siffror : null;
}

/**
 * Organisationsnummer i SRU-formatet med 16 först (16NNNNNNNNNK), eller null.
 */
export function normaliseraOrgnr(str) {
  let siffror = String(str).replace(/[\s-]/g, '');
  if (/^16\d{10}$/.test(siffror)) siffror = siffror.slice(2);
  if (!/^\d{10}$/.test(siffror)) return null;
  // Juridiska personer har 20 eller mer i tredje och fjärde siffran
  if (Number(siffror.slice(2, 4)) < 20) return null;
  return luhn(siffror) ? `16${siffror}` : null;
}

const tvaSiffror = (n) => String(n).padStart(2, '0');

/**
 * Skapa innehållet i BLANKETTER.SRU med en K10.
 *
 * @param {object} p
 * @param {string} p.personnummer - Tolv siffror
 * @param {string} [p.namn]
 * @param {string} p.orgnr - SRU-format, 16NNNNNNNNNK
 * @param {number} p.aktierAgda
 * @param {number} p.aktierTotalt
 * @param {object[]} p.rutor - Från beraknaK10
 * @param {Date} [p.tid] - När filen framställs
 * @param {string} [p.blankettblock]
 * @returns {string}
 */
export function skapaBlanketterSru({ personnummer, namn, orgnr, aktierAgda, aktierTotalt, rutor, tid = new Date(), blankettblock = K10_BLANKETT.blankettblock }) {
  const datum = `${tid.getFullYear()}${tvaSiffror(tid.getMonth() + 1)}${tvaSiffror(tid.getDate())}`;
  const klocka = `${tvaSiffror(tid.getHours())}${tvaSiffror(tid.getMinutes())}${tvaSiffror(tid.getSeconds())}`;
  // # och radbrytningar är inte tillåtna i värden
  const rentNamn = (namn ?? '').replace(/[#\r\n]/g, ' ').trim().slice(0, 250);

  const rader = [
    `#BLANKETT ${blankettblock}`,
    `#IDENTITET ${personnummer} ${datum} ${klocka}`,
    ...(rentNamn ? [`#NAMN ${rentNamn}`] : []),
    `#UPPGIFT 4530 ${orgnr}`,
    `#UPPGIFT 4531 ${aktierAgda}`,
    `#UPPGIFT 4532 ${aktierTotalt}`,
    // Tomma uppgifter utelämnas; beloppen anges utan tecken enligt blankettens förtryck
    ...rutor.filter((r) => r.belopp > 0).map((r) => `#UPPGIFT ${r.kod} ${r.belopp}`),
    '#BLANKETTSLUT',
    '#FIL_SLUT',
  ];
  return rader.join('\n') + '\n';
}

/**
 * Koda text som ISO 8859-1, som SRU-filer ska vara. Tecken utanför blir "?".
 */
export function tillLatin1(text) {
  return Uint8Array.from(text, (c) => {
    const kod = c.charCodeAt(0);
    return kod <= 0xff ? kod : 0x3f;
  });
}
