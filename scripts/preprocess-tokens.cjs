
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'tokens');
const outputDir = path.join(__dirname, '..', 'tokens-prepared');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const metadata = {};

function processTokenObject(obj, prefix = [], result = {}, fileKey = '') {
  for (const key in obj) {
    const value = obj[key];
    const pathArray = [...prefix, key];
    if (value && typeof value === 'object' && 'value' in value) {
      result[pathArray.join('.')] = {
        ...value,
        name: `${fileKey}-${pathArray.join('-')}`
      };
    } else if (typeof value === 'object') {
      processTokenObject(value, pathArray, result, fileKey);
    }
  }
  return result;
}

fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const filePath = path.join(inputDir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const baseName = file.replace('.json', '');
  const parts = baseName.split('.');
  const mode = parts.pop().toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
  const collection = parts.join('').toLowerCase().replace(/\s+/g, '');

  metadata[collection] = metadata[collection] || [];
  if (!metadata[collection].includes(mode)) {
    metadata[collection].push(mode);
  }

  const fileKey = `${collection}${mode}`;
  const flatTokens = processTokenObject(raw, [], {}, fileKey);

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

// Escribimos metadata.json
const metadataPath = path.join(outputDir, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
