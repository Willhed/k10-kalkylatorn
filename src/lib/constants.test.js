import { describe, it, expect } from 'vitest';
import { AR_VARDEN, UTDELNINGSAR, IBB, IBB_AR, SLR, RANTA_PROCENT } from './constants.js';

describe('årsvärden', () => {
  it('har alla värden ifyllda för det aktiva utdelningsåret', () => {
    // Faller om UTDELNINGSAR byts till ett år där t.ex. statslåneräntan ännu saknas
    const ar = AR_VARDEN[UTDELNINGSAR];
    expect(ar, `AR_VARDEN saknar ${UTDELNINGSAR}`).toBeDefined();
    expect(ar.ibb).toBeGreaterThan(0);
    expect(ar.slr, `Statslåneräntan för ${UTDELNINGSAR} är inte ifylld`).toBeTypeOf('number');
  });

  it('härleder IBB, IBB-år och räntesats från det aktiva året', () => {
    expect(IBB).toBe(AR_VARDEN[UTDELNINGSAR].ibb);
    expect(IBB_AR).toBe(UTDELNINGSAR - 1);
    expect(SLR).toBe(AR_VARDEN[UTDELNINGSAR].slr);
    expect(RANTA_PROCENT).toBeCloseTo(SLR + 0.09, 10);
  });
});
