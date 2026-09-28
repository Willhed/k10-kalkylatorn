// Gemensam hantering av sifferfält: användaren skriver fritt, värdet tolkas,
// begränsas och formateras när fältet lämnas.

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function parseNumber(str) {
  // Tillåt både punkt och komma som decimaltecken
  const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

export function roundTo(val, decimals) {
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

export function handleBlur(e, min, max, setter, formatter, decimals = 0) {
  const val = parseNumber(e.target.value);
  if (!isNaN(val)) {
    const clamped = clamp(roundTo(val, decimals), min, max);
    setter(clamped);
    e.target.value = formatter(clamped);
  }
}

export function handleFocus(e) {
  e.target.select();
}

export function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.target.blur();
  }
}
