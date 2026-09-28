/**
 * Formatera belopp i svenska kronor: "1 234 567 kr"
 */
export function formatSEK(amount) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' kr';
}

/**
 * Formatera procent: "25 %" eller "33,25 %"
 */
export function formatPercent(value) {
  const formatted = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} %`;
}

/**
 * Formatera procent med decimaler: "11,55 %" eller "20 %"
 */
export function formatPercentDecimal(value) {
  // Upp till två decimaler: räntesatsen 11,55 % får inte avrundas till 11,5 %
  return new Intl.NumberFormat('sv-SE', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
