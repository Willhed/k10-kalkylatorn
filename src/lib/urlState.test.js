import { describe, it, expect } from 'vitest';
import { DEFAULTS, readState, writeState } from './urlState.js';

describe('writeState', () => {
  it('ger en tom sträng för standardvärden', () => {
    expect(writeState(DEFAULTS)).toBe('');
  });

  it('tar bara med värden som avviker från standard', () => {
    expect(writeState({ ...DEFAULTS, agarandel: 30 })).toBe('a=30');
  });

  it('tar bara med planerad utdelning när den är aktiv', () => {
    expect(writeState({ ...DEFAULTS, planeradUtdelning: 300_000 })).toBe('');
    expect(writeState({ ...DEFAULTS, planeradUtdelningAktiv: true, planeradUtdelning: 300_000 })).toBe('u=300000');
  });
});

describe('readState', () => {
  it('ger standardvärden utan parametrar', () => {
    expect(readState('')).toEqual(DEFAULTS);
  });

  it('läser tillbaka exakt det som skrevs (rundtur)', () => {
    const state = {
      ...DEFAULTS,
      agarandel: 33.55,
      totalLonesumma: 4_000_000,
      omkostnadsbeloppDirekt: 250_000,
      sparatUtrymme: 150_000,
      omkostnadsbeloppHolding: 50_000,
      holdingKostnad: 8_000,
      holdingStartKostnad: 0,
      planeradUtdelningAktiv: true,
      planeradUtdelning: 450_000,
      dotterbolagOverride: true,
      ovrigaBolag: [
        { namn: 'Bygg & Co | AB?', andel: 60 },
        { namn: '', andel: 100 },
      ],
    };
    expect(readState('?' + writeState(state))).toEqual(state);
  });

  it('faller tillbaka på standard för ogiltiga värden', () => {
    const s = readState('?a=abc&l=&hk=NaN');
    expect(s.agarandel).toBe(DEFAULTS.agarandel);
    expect(s.totalLonesumma).toBe(DEFAULTS.totalLonesumma);
    expect(s.holdingKostnad).toBe(DEFAULTS.holdingKostnad);
  });

  it('begränsar värden till tillåtet intervall', () => {
    const s = readState('?a=150&l=-5');
    expect(s.agarandel).toBe(100);
    expect(s.totalLonesumma).toBe(0);
  });

  it('hoppar över övriga bolag utan giltig andel och begränsar andelen', () => {
    const s = readState('?b=xyz&b=150|Stort&b=40');
    expect(s.ovrigaBolag).toEqual([
      { namn: 'Stort', andel: 100 },
      { namn: '', andel: 40 },
    ]);
  });
});
