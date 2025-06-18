
module.exports = function transformDimension(value) {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  if (typeof value === 'string' && /^\\d+$/.test(value)) {
    return `${value}px`;
  }
  return value;
};
