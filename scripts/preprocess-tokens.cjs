
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'tokens');
const outputDir = path.join(__dirname, '..', 'tokens-prepared');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const metadata = {};

const normalize = str => str.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');

function processTokenObject(obj, prefix = [], result = {}, normalizedFileName = '') {
  for (const key in obj) {
    const value = obj[key];
    const pathArray = [...prefix, key];
    if (value && typeof value === 'object' && 'value' in value) {
      result[pathArray.join('.')] = {
        ...value,
        name: `${normalizedFileName}-${pathArray.join('-')}`
      };
    } else if (typeof value === 'object') {
      processTokenObject(value, pathArray, result, normalizedFileName);
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
  const rawMode = parts.pop();
  const rawCollection = parts.join('.');
  const mode = normalize(rawMode);
  const collection = normalize(rawCollection);

  const normalizedFileName = `${collection}-${mode}`;

  metadata[collection] = metadata[collection] || [];
  if (!metadata[collection].includes(mode)) {
    metadata[collection].push(mode);
  }

  const flatTokens = processTokenObject(raw, [], {}, normalizedFileName);

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
