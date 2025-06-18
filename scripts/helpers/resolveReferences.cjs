// resolveReferences.cjs

/**
 * Recibe un objeto flatten de tokens (globalTokens)
 * y devuelve el mismo objeto con las referencias resueltas
 */
module.exports = function resolveReferences(tokens) {
  const resolvedTokens = {};

  const getReferenceValue = (ref) => {
    // {Blue.50} → Blue.50
    const refKey = ref.replace(/[{}]/g, '');
    const match = Object.entries(tokens).find(([key]) => key.endsWith(refKey));
    if (match) {
      const [, token] = match;
      return typeof token.value === 'string' ? token.value : '';
    }
    return ref; // si no encuentra referencia, deja la referencia original
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
