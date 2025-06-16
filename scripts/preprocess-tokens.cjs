
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'tokens');
const outputDir = path.join(__dirname, '..', 'tokens-prepared');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function processTokenObject(obj, prefix = [], result = {}) {
  for (const key in obj) {
    const value = obj[key];
    const pathArray = [...prefix, key];
    if (value && typeof value === 'object' && 'value' in value) {
      result[pathArray.join('.')] = {
        ...value,
        name: pathArray.join('-') // genera name único
      };
    } else if (typeof value === 'object') {
      processTokenObject(value, pathArray, result);
    }
  }
  return result;
}

fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const filePath = path.join(inputDir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const flatTokens = processTokenObject(raw);
  const nested = {};

  for (const key in flatTokens) {
    const parts = key.split('.');
    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    current[parts.at(-1)] = flatTokens[key];
  }

  const outPath = path.join(outputDir, file);
  fs.writeFileSync(outPath, JSON.stringify(nested, null, 2), 'utf-8');
});
