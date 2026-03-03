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
 * Formatera procent med decimaler: "20,0 %"
 */
export function formatPercentDecimal(value) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
