// resolveReferences.cjs

/**
 * Recibe un objeto flatten de tokens (globalTokens)
 * y devuelve el mismo objeto con las referencias resueltas
 */
module.exports = function resolveReferences(tokens) {
  const resolvedTokens = {};

  const getReferenceValue = (ref) => {
    // {Blue.500-4%} → Blue.500-4%
    const refKey = ref.replace(/[{}]/g, '');

    // Si es una referencia con -4% → alpha
    if (refKey.match(/-\d+%$/)) {
      const baseRef = refKey.replace(/-\d+%$/, '');
      const alpha = parseInt(refKey.match(/-(\d+)%$/)[1], 10) / 100;
      const match = Object.entries(tokens).find(([key]) => key.endsWith(baseRef));
      if (match) {
        const [, token] = match;
        return hexToRgba(token.value, alpha);
      } else {
        console.warn(`⚠️ Reference with alpha not found: ${refKey}`);
        return ref; // fallback
      }
    }

    // Referencia simple
    const match = Object.entries(tokens).find(([key]) => key.endsWith(refKey));
    if (match) {
      const [, token] = match;
      return typeof token.value === 'string' ? token.value : '';
    }

    console.warn(`⚠️ Reference not found: ${refKey}`);
    return ref; // fallback
  };

  for (const [key, token] of Object.entries(tokens)) {
    let value = token.value;

    // Si el value es referencia, resuélvelo
    if (typeof value === 'string' && value.match(/^{.+}$/)) {
      value = getReferenceValue(value);
    }

    resolvedTokens[key] = {
      ...token,
      value
    };
  }

  return resolvedTokens;
};

function hexToRgba(hex, alpha) {
  const hexValue = hex.replace('#', '');
  const bigint = parseInt(hexValue.length === 3
    ? hexValue.split('').map(c => c + c).join('')
    : hexValue, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
