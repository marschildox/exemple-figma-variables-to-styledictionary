
module.exports = function transformOpacity(value) {
  if (typeof value === 'string' && value.endsWith('%')) {
    const number = parseFloat(value.replace('%', ''));
    return number / 100;
  }
  return value;
};
