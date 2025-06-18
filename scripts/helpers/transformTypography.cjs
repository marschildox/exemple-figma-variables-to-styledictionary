// transformTypography.cjs

module.exports = function transformTypography(typography) {
  if (!typography) return {};

  return {
    fontFamily: typography.fontFamily || '',
    fontWeight: typeof typography.fontWeight === 'string'
      ? parseInt(typography.fontWeight, 10)
      : typography.fontWeight,
    lineHeight: typeof typography.lineHeight === 'string'
      ? typography.lineHeight
      : Number(typography.lineHeight).toFixed(2),
    fontSize: typeof typography.fontSize === 'string'
      ? typography.fontSize
      : `${typography.fontSize}px`,
    letterSpacing: typography.letterSpacing || '',
    paragraphSpacing: typography.paragraphSpacing || '',
    textCase: typography.textCase || '',
    textDecoration: typography.textDecoration || ''
  };
};
