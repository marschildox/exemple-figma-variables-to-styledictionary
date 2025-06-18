// resolveReferences.cjs

/**
 * Recibe un objeto flatten de tokens (globalTokens)
 * y devuelve el mismo objeto con las referencias resueltas
 */
module.exports = function resolveReferences(tokens) {
  const resolvedTokens = {};

  const colorNames = {
    'White.FFF': '#FFFFFF',
    'White.FFFFFF': '#FFFFFF',
    'Black.000': '#000000',
    'Black.000000': '#000000'
  };

  const getReferenceValue = (ref) => {
    const refKey = ref.replace(/[{}]/g, '');

    // Si es un color "nombre conocido", devuelve el hex
    if (colorNames[refKey]) {
      return colorNames[refKey];
    }

    // Si es Primary.Primary-4%, primero resuelvo Primary.Primary
    const aliasMatch = refKey.match(/^(.+)\.(.+)-(\d+)%$/);
    if (aliasMatch) {
      const baseAlias = `${aliasMatch[1]}.${aliasMatch[2]}`;
      const alpha = parseInt(aliasMatch[3], 10) / 100;

      const baseValue = getReferenceValue(`{${baseAlias}}`);
      return hexToRgba(baseValue, alpha);
    }

    // Si es Blue.500-4%
    const percentMatch = refKey.match(/(.+)-(\d+)%$/);
    if (percentMatch) {
      const baseRef = percentMatch[1];
      const alpha = parseInt(percentMatch[2], 10) / 100;

      const match = Object.entries(tokens).find(([key]) => key.endsWith(baseRef));
      if (match) {
        const [, token] = match;
        return hexToRgba(token.value, alpha);
      } else {
        console.warn(`⚠️ Reference with alpha not found: ${refKey}`);
        return ref;
      }
    }

    // Normal referencia simple
    const match = Object.entries(tokens).find(([key]) => key.endsWith(refKey));
    if (match) {
      const [, token] = match;
      return token.value;
    } else {
      console.warn(`⚠️ Reference not found: ${refKey}`);
      return ref;
    }
  };

  for (const [key, token] of Object.entries(tokens)) {
    let value = token.value;

    if (typeof value === 'string' && value.match(/^{.+}$/)) {
      value = getReferenceValue(value);
    }

    resolvedTokens[key] = {
      ...token,
      path: token.path || key.split('.'),
      value,
      original: {
        ...token.original,
        value
      }
    };
  }

  return resolvedTokens;
};

const hexToRgba = (hex, alpha) => {
  const hexValue = hex.replace('#', '');
  const bigint = parseInt(hexValue.length === 3
    ? hexValue.split('').map(c => c + c).join('')
    : hexValue, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
