// add-font-styles.cjs

module.exports = function addFontStyles(tokenName, typography) {
  const tokens = {};

  if (typography.fontFamily) {
    tokens[`${tokenName}-font-family`] = typography.fontFamily;
  }
  if (typography.fontWeight) {
    tokens[`${tokenName}-font-weight`] = typography.fontWeight;
  }
  if (typography.lineHeight) {
    tokens[`${tokenName}-line-height`] = typography.lineHeight;
  }
  if (typography.fontSize) {
    tokens[`${tokenName}-font-size`] = typography.fontSize;
  }
  if (typography.letterSpacing) {
    tokens[`${tokenName}-letter-spacing`] = typography.letterSpacing;
  }
  if (typography.textCase) {
    tokens[`${tokenName}-text-case`] = typography.textCase;
  }
  if (typography.textDecoration) {
    tokens[`${tokenName}-text-decoration`] = typography.textDecoration;
  }

  return tokens;
};
