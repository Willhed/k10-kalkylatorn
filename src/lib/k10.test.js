import { describe, it, expect } from 'vitest';
import { beraknaK10, raknaDotterforetag, normaliseraPersonnummer, normaliseraOrgnr, skapaBlanketterSru, tillLatin1 } from './k10.js';
import { beraknaGransbelopp } from './calculations.js';

// Årsvärden anges explicit så att förväntade värden inte ändras när konstanterna
// byts till nästa år. Gäller K10 för inkomstår 2026 (blankett K10-2026P4).
const AR = { ibb: 80_600, rantaProcent: 0.0255 + 0.09, takTjanst: 7_506_000 };

const BAS = {
  aktierAgda: 100,
  aktierTotalt: 100,
  lonesumma: 0,
  egenLon: 0,
  omkostnadsbelopp: 25_000,
  sparatUtrymme: 0,
  utdelning: 0,
  ovrigaAgarandelar: [],
};

const ruta = (k10, punkt) => k10.rutor.find((r) => r.punkt === punkt)?.belopp;

describe('beraknaK10 – avsnitt A och D', () => {
  it('räknar gränsbelopp med lönebaserat utrymme och sparat utrymme', () => {
    const k10 = beraknaK10({ ...BAS, lonesumma: 2_000_000, egenLon: 600_000, sparatUtrymme: 50_000 }, AR);
    expect(ruta(k10, '1.1')).toBe(322_400);
    expect(ruta(k10, '4.10')).toBe(644_800);
    expect(ruta(k10, '4.11')).toBe(1_355_200);
    expect(ruta(k10, '4.12')).toBe(677_600);
    expect(ruta(k10, '1.2')).toBe(677_600);
    expect(ruta(k10, '1.6')).toBe(1_050_000);
    // Utan utdelning är gränsbeloppet det sparade utrymmet till nästa år
    expect(k10.sparatTillNastaAr).toBe(1_050_000);
    expect(k10.rutor.some((r) => r.avsnitt === 'B')).toBe(false);
  });

  it('begränsar lönebaserat utrymme till 50 × egen lön', () => {
    const k10 = beraknaK10({ ...BAS, lonesumma: 2_000_000, egenLon: 10_000 }, AR);
    expect(ruta(k10, '4.12')).toBe(677_600);
    expect(ruta(k10, '1.2')).toBe(500_000);
    expect(k10.lonebaseratBegransat).toBe(true);
  });

  it('utelämnar avsnitt D när löneunderlaget inte överstiger löneavdraget', () => {
    const k10 = beraknaK10({ ...BAS, aktierAgda: 25, lonesumma: 2_000_000, egenLon: 600_000 }, AR);
    expect(ruta(k10, '1.2')).toBe(0);
    expect(k10.rutor.some((r) => r.avsnitt === 'D')).toBe(false);
  });

  it('räknar ränta i hela kronor utan flyttalsfel', () => {
    // 100 000 × 11,55 % = 11 550, inte 11 549
    expect(ruta(beraknaK10({ ...BAS, omkostnadsbelopp: 200_000 }, AR), '1.3')).toBe(11_550);
  });

  it('avrundar grundbeloppet nedåt till hela kronor', () => {
    // 1/3 × 322 400 = 107 466,67
    expect(ruta(beraknaK10({ ...BAS, aktierAgda: 1, aktierTotalt: 3 }, AR), '1.1')).toBe(107_466);
  });

  it('stämmer med kalkylatorns gränsbelopp på hela kronan när', () => {
    const fall = [
      { aktierAgda: 60, aktierTotalt: 100, lonesumma: 5_000_000, egenLon: 700_000, omkostnadsbelopp: 1_100_000, ovrigaAgarandelar: [1] },
      { aktierAgda: 1, aktierTotalt: 3, lonesumma: 9_000_000, egenLon: 20_000, omkostnadsbelopp: 333_333, ovrigaAgarandelar: [] },
    ];
    for (const f of fall) {
      const k10 = beraknaK10({ ...BAS, ...f }, AR);
      const kalk = beraknaGransbelopp(f.aktierAgda / f.aktierTotalt, f.lonesumma, f.egenLon, f.omkostnadsbelopp, AR.ibb, f.ovrigaAgarandelar);
      expect(Math.abs(k10.gransbelopp - kalk.gransbelopp)).toBeLessThan(3);
    }
  });
});

describe('beraknaK10 – dotterföretag', () => {
  // 556000-0100 är ett aktiebolag; nummer som börjar på 9 behandlas som handelsbolag
  const AB = '165560000100';
  const HB = '169696000000';

  it('räknar ett aktiebolags löner med moderföretagets andel (57 kap. 17 § IL)', () => {
    expect(raknaDotterforetag({ orgnr: AB, loner: 1_000_000, andel: 60 }).raknas).toBe(600_000);
  });

  it('räknar ett handelsbolag bara om det är helägt (57 kap. 19 a § IL)', () => {
    expect(raknaDotterforetag({ orgnr: HB, loner: 1_000_000, andel: 100 })).toMatchObject({ handelsbolag: true, raknas: 1_000_000 });
    expect(raknaDotterforetag({ orgnr: HB, loner: 1_000_000, andel: 99 }).raknas).toBe(0);
  });

  it('lägger dotterföretagens löner i p. 4.2 och i löneunderlaget', () => {
    const k10 = beraknaK10({
      ...BAS,
      lonesumma: 1_000_000,
      egenLon: 1e9,
      dotterforetag: [{ orgnr: AB, loner: 1_000_000, andel: 60 }, { orgnr: HB, loner: 500_000, andel: 50 }],
    }, AR);
    expect(ruta(k10, '4.2')).toBe(600_000);
    expect(ruta(k10, '4.3')).toBe(1_600_000);
    // (1 600 000 − 644 800) × 50 %
    expect(ruta(k10, '1.2')).toBe(477_600);
  });

  it('skriver dotterföretagens organisationsnummer i rutorna 4564–4567', () => {
    const sru = skapaBlanketterSru({
      personnummer: '191212121212', orgnr: AB, aktierAgda: 1, aktierTotalt: 1, rutor: [],
      dotterOrgnr: [AB, HB], tid: new Date(2027, 0, 15), blankettblock: 'K10-2026P4',
    });
    expect(sru).toContain(`#UPPGIFT 4564 ${AB}\n#UPPGIFT 4565 ${HB}\n#BLANKETTSLUT`);
  });
});

describe('beraknaK10 – avsnitt B, utdelning', () => {
  it('beskattar utdelning inom gränsbeloppet som kapital till 2/3 och sparar resten', () => {
    const k10 = beraknaK10({ ...BAS, lonesumma: 2_000_000, egenLon: 600_000, sparatUtrymme: 50_000, utdelning: 500_000 }, AR);
    expect(ruta(k10, '2.3')).toBe(0);
    expect(ruta(k10, '2.6')).toBe(550_000);
    expect(ruta(k10, '2.7')).toBe(500_000);
    expect(ruta(k10, '2.8')).toBe(333_333);
    expect(k10.tjanst).toBe(0);
    expect(k10.kapital).toBe(333_333);
    expect(k10.sparatTillNastaAr).toBe(550_000);
  });

  it('beskattar utdelning över gränsbeloppet som tjänst upp till taket, resten som kapital', () => {
    const k10 = beraknaK10({ ...BAS, utdelning: 10_000_000 }, AR);
    expect(ruta(k10, '2.3')).toBe(7_506_000);
    expect(ruta(k10, '2.7')).toBe(322_400);
    expect(ruta(k10, '2.8')).toBe(214_933);
    expect(ruta(k10, '2.9')).toBe(2_171_600);
    expect(ruta(k10, '2.10')).toBe(2_386_533);
    expect(k10.sparatTillNastaAr).toBe(0);
  });
});

describe('personnummer och organisationsnummer', () => {
  it('godtar tolv siffror med korrekt kontrollsiffra', () => {
    expect(normaliseraPersonnummer('19121212-1212')).toBe('191212121212');
    expect(normaliseraPersonnummer('191212121213')).toBeNull();
    // Utan århundrade går det inte att veta vilket år som avses
    expect(normaliseraPersonnummer('121212-1212')).toBeNull();
  });

  it('godtar samordningsnummer (dag + 60)', () => {
    // Dag 72 = 12 + 60; kontrollsiffran 9 enligt Luhn
    expect(normaliseraPersonnummer('19121272-1219')).toBe('191212721219');
    expect(normaliseraPersonnummer('19121292-1219')).toBeNull();
  });

  it('skriver organisationsnummer med 16 först', () => {
    expect(normaliseraOrgnr('556000-0100')).toBe('165560000100');
    expect(normaliseraOrgnr('165560000100')).toBe('165560000100');
    expect(normaliseraOrgnr('556000-0101')).toBeNull();
    // Ett personnummer är inget organisationsnummer
    expect(normaliseraOrgnr('121212-1212')).toBeNull();
  });
});

describe('skapaBlanketterSru', () => {
  it('skriver ett K10-block enligt SKV 269', () => {
    const k10 = beraknaK10({ ...BAS, sparatUtrymme: 50_000, utdelning: 100_000 }, AR);
    const sru = skapaBlanketterSru({
      personnummer: '191212121212',
      namn: 'Åsa #Öberg',
      orgnr: '165560000100',
      aktierAgda: 100,
      aktierTotalt: 100,
      rutor: k10.rutor,
      tid: new Date(2027, 0, 15, 9, 5, 3),
      blankettblock: 'K10-2026P4',
    });
    expect(sru).toBe(
      [
        '#BLANKETT K10-2026P4',
        '#IDENTITET 191212121212 20270115 090503',
        '#NAMN Åsa  Öberg',
        '#UPPGIFT 4530 165560000100',
        '#UPPGIFT 4531 100',
        '#UPPGIFT 4532 100',
        '#UPPGIFT 4511 322400',
        '#UPPGIFT 4522 50000',
        '#UPPGIFT 4524 372400',
        '#UPPGIFT 4525 100000',
        '#UPPGIFT 4731 372400',
        '#UPPGIFT 4732 272400',
        '#UPPGIFT 4734 272400',
        '#UPPGIFT 4736 100000',
        '#UPPGIFT 4529 66667',
        '#UPPGIFT 4541 66667',
        '#BLANKETTSLUT',
        '#FIL_SLUT',
        '',
      ].join('\n'),
    );
  });

  it('kodar åäö som ISO 8859-1', () => {
    expect([...tillLatin1('Åä€')]).toEqual([0xc5, 0xe4, 0x3f]);
  });
});
