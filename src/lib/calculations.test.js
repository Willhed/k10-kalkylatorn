import { describe, it, expect } from 'vitest';
import { beraknaGransbelopp, beraknaBreakEven } from './calculations.js';
import { RANTA_PROCENT } from './constants.js';

// IBB anges explicit så att förväntade värden inte ändras när konstanterna
// byts till nästa år. 80 600 kr = IBB 2025, som gäller utdelning 2026.
const IBB = 80_600;

describe('beraknaGransbelopp – grundbelopp', () => {
  it('ger ägarandel × 4 × IBB för ett enda bolag', () => {
    expect(beraknaGransbelopp(1, 0, 0, 0, IBB).grundbelopp).toBe(322_400);
    expect(beraknaGransbelopp(0.25, 0, 0, 0, IBB).grundbelopp).toBe(80_600);
  });

  it('proportionerar när flera bolag tillsammans överstiger 4 × IBB (Skatteverkets exempel)', () => {
    // 60 % i X och 100 % i Y: X får 60/160 och Y 100/160 av 4 × IBB
    const x = beraknaGransbelopp(0.6, 0, 0, 0, IBB, [1]);
    const y = beraknaGransbelopp(1, 0, 0, 0, IBB, [0.6]);
    expect(x.grundbeloppProportioneras).toBe(true);
    expect(x.grundbelopp).toBeCloseTo(120_900, 6);
    expect(y.grundbelopp).toBeCloseTo(201_500, 6);
    expect(x.grundbelopp + y.grundbelopp).toBeCloseTo(322_400, 6);
  });

  it('proportionerar inte när summan ryms inom 4 × IBB', () => {
    const r = beraknaGransbelopp(0.3, 0, 0, 0, IBB, [0.5]);
    expect(r.grundbeloppProportioneras).toBe(false);
    expect(r.grundbelopp).toBeCloseTo(0.3 * 322_400, 6);
  });
});

describe('beraknaGransbelopp – lönebaserat utrymme', () => {
  it('drar löneavdraget på 8 × IBB från ägarens andel av lönesumman', () => {
    // 25 % av 2 Mkr = 500 000 kr, under avdraget 644 800 kr
    expect(beraknaGransbelopp(0.25, 2_000_000, 1e9, 0, IBB).lonebaseratUtrymme).toBe(0);
    // 60 % av 5 Mkr = 3 Mkr; (3 000 000 − 644 800) × 50 %
    expect(beraknaGransbelopp(0.6, 5_000_000, 1e9, 0, IBB).lonebaseratUtrymme).toBeCloseTo(1_177_600, 6);
  });

  it('begränsas till 50 × ägarens lön', () => {
    const r = beraknaGransbelopp(1, 5_000_000, 10_000, 0, IBB);
    expect(r.capApplied).toBe(true);
    expect(r.lonebaseratUtrymme).toBe(500_000);
  });
});

describe('beraknaGransbelopp – ränta på omkostnadsbelopp', () => {
  it('räknar bara på den del som överstiger 100 000 kr', () => {
    expect(beraknaGransbelopp(1, 0, 0, 100_000, IBB).rantaUtrymme).toBe(0);
    expect(beraknaGransbelopp(1, 0, 0, 50_000, IBB).rantaUtrymme).toBe(0);
    expect(beraknaGransbelopp(1, 0, 0, 1_100_000, IBB).rantaUtrymme).toBeCloseTo(1_000_000 * RANTA_PROCENT, 6);
  });

  it('summerar grundbelopp, lönebaserat utrymme och ränta', () => {
    const r = beraknaGransbelopp(0.6, 5_000_000, 1e9, 1_100_000, IBB);
    expect(r.gransbelopp).toBeCloseTo(r.grundbelopp + r.lonebaseratUtrymme + r.rantaUtrymme, 6);
  });
});

describe('beraknaBreakEven', () => {
  // Standardscenariot: 25 % ägande, 2 Mkr lönesumma → direkt 80 600 kr, holding 322 400 kr
  const DIREKT = 80_600;
  const HOLDING = 322_400;

  it('räknar netto vid fullt uttag och gränsen där holdingbolaget lönar sig', () => {
    const r = beraknaBreakEven(DIREKT, HOLDING, 5_000, 7_500);
    expect(r.besparing).toBeCloseTo(72_540, 6);        // 241 800 × 30 %
    expect(r.netto).toBeCloseTo(67_540, 6);
    expect(r.lonsamt).toBe(true);
    expect(r.breakEvenUttag).toBeCloseTo(97_266.67, 1); // 80 600 + 5 000 / 0,3
    expect(r.aterbetalningManader).toBe(2);             // 7 500 / (67 540 / 12) = 1,33
  });

  it('räknar bara den del av en planerad utdelning som ligger mellan gränsbeloppen', () => {
    const r = beraknaBreakEven(DIREKT, HOLDING, 5_000, 7_500, 200_000);
    expect(r.lagbeskattatExtra).toBe(119_400);
    expect(r.netto).toBeCloseTo(30_820, 6);
    expect(r.aterbetalningManader).toBe(3);
  });

  it('är olönsamt när den planerade utdelningen ligger under gränsen', () => {
    const r = beraknaBreakEven(DIREKT, HOLDING, 5_000, 7_500, 90_000);
    expect(r.netto).toBeCloseTo(-2_180, 6);
    expect(r.lonsamt).toBe(false);
    expect(r.breakEvenUttag).toBeCloseTo(97_266.67, 1);
    expect(r.aterbetalningManader).toBeNull();
  });

  it('ger ingen besparing när utdelningen ryms i direktägandets gränsbelopp', () => {
    const r = beraknaBreakEven(DIREKT, HOLDING, 5_000, 7_500, 50_000);
    expect(r.lagbeskattatExtra).toBe(0);
    expect(r.netto).toBe(-5_000);
  });

  it('tak vid holdingbolagets gränsbelopp: mer utdelning ger ingen extra besparing', () => {
    const full = beraknaBreakEven(DIREKT, HOLDING, 5_000, 0);
    const over = beraknaBreakEven(DIREKT, HOLDING, 5_000, 0, 500_000);
    expect(over.netto).toBeCloseTo(full.netto, 6);
  });

  it('lönar sig aldrig när direkt ägande ger lika mycket eller mer', () => {
    const r = beraknaBreakEven(HOLDING, DIREKT, 5_000, 7_500);
    expect(r.besparing).toBe(0);
    expect(r.lonsamt).toBe(false);
    expect(r.breakEvenUttag).toBeNull();
  });

  it('lönar sig aldrig när kostnaden överstiger maximal besparing', () => {
    const r = beraknaBreakEven(100_000, 110_000, 5_000, 0); // max 3 000 kr besparing
    expect(r.lonsamt).toBe(false);
    expect(r.breakEvenUttag).toBeNull();
  });
});
