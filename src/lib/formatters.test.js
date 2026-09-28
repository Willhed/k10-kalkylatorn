import { describe, it, expect } from 'vitest';
import { formatPercentDecimal } from './formatters.js';
import { RANTA_PROCENT, SLR } from './constants.js';

// Intl använder hårt mellanslag före "%"
const norm = (s) => s.replace(/\s/g, ' ');

describe('formatPercentDecimal', () => {
  it('visar räntesatsen med två decimaler trots flyttalsfel', () => {
    // 0,0255 + 0,09 blir 0,11549999… i flyttal
    expect(norm(formatPercentDecimal(0.0255 + 0.09))).toBe('11,55 %');
  });

  it('visar den aktiva räntesatsen exakt som SLR + 9 procentenheter', () => {
    const forvantat = Math.round((SLR + 0.09) * 10_000) / 100; // t.ex. 11.55
    expect(norm(formatPercentDecimal(RANTA_PROCENT))).toBe(`${String(forvantat).replace('.', ',')} %`);
  });

  it('skriver jämna procent utan decimaler', () => {
    expect(norm(formatPercentDecimal(0.5))).toBe('50 %');
    expect(norm(formatPercentDecimal(0.2))).toBe('20 %');
  });
});
