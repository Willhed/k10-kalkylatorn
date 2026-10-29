import { describe, it, expect } from 'vitest';
import { AR_VARDEN, UTDELNINGSAR, IBB, IBB_AR, SLR, RANTA_PROCENT, K10_BLANKETTER } from './constants.js';

describe('årsvärden', () => {
  it('har alla värden ifyllda för det aktiva utdelningsåret', () => {
    // Faller om UTDELNINGSAR byts till ett år där t.ex. statslåneräntan ännu saknas
    const ar = AR_VARDEN[UTDELNINGSAR];
    expect(ar, `AR_VARDEN saknar ${UTDELNINGSAR}`).toBeDefined();
    expect(ar.ibb).toBeGreaterThan(0);
    expect(ar.slr, `Statslåneräntan för ${UTDELNINGSAR} är inte ifylld`).toBeTypeOf('number');
  });

  it('har K10-blankettens värden för det aktiva utdelningsåret', () => {
    // Fältkoder och blankettblock kommer från Skatteverkets SKV 269 för året
    const k10 = K10_BLANKETTER[UTDELNINGSAR];
    expect(k10, `K10_BLANKETTER saknar ${UTDELNINGSAR}`).toBeDefined();
    expect(k10.blankettblock).toBe(`K10-${UTDELNINGSAR}P4`);
    // Taket är 90 × IBB för utdelningsåret, som är nästa års IBB-värde i AR_VARDEN
    expect(k10.takTjanstUtdelning).toBe(90 * AR_VARDEN[UTDELNINGSAR + 1].ibb);
  });

  it('härleder IBB, IBB-år och räntesats från det aktiva året', () => {
    expect(IBB).toBe(AR_VARDEN[UTDELNINGSAR].ibb);
    expect(IBB_AR).toBe(UTDELNINGSAR - 1);
    expect(SLR).toBe(AR_VARDEN[UTDELNINGSAR].slr);
    expect(RANTA_PROCENT).toBeCloseTo(SLR + 0.09, 10);
  });
});
