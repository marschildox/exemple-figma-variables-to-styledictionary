
module.exports = function transformFontWeight(value) {
  const map = {
    thin: 100, extralight: 200, light: 300, regular: 400, medium: 500,
    semibold: 600, bold: 700, extrabold: 800, black: 900
  };
  if (typeof value === 'string') {
    const key = value.toLowerCase();
    return map[key] || value;
  }
  return value;
};
