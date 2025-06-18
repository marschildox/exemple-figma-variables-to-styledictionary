const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'tokens');
const outputDir = path.join(__dirname, '..', 'tokens-prepared');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const metadata = {};

const normalize = str =>
  str
    .toLowerCase()
    .normalize('NFD') // elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\-]/g, '');

// Helpers
const transformOpacity = require('./helpers/transformOpacity.cjs');
const transformLineHeight = require('./helpers/transformLineHeight.cjs');
const transformFontWeight = require('./helpers/transformFontWeight.cjs');
const transformDimension = require('./helpers/transformDimension.cjs');
const resolveReferences = require('./helpers/resolveReferences.cjs');

// tokens globales para resolver referencias cruzadas
const globalTokens = {};

function processTokenObject(obj, prefix = [], result = {}, normalizedFileName = '') {
  for (const key in obj) {
    const value = obj[key];
    const pathArray = [...prefix, key];

    if (value && typeof value === 'object' && 'value' in value) {
      let finalValue = value.value;

      // Aplica transforms según tipo
      if (key.toLowerCase().includes('opacity')) {
        finalValue = transformOpacity(finalValue);
      }
      if (key.toLowerCase().includes('lineheight')) {
        finalValue = transformLineHeight(finalValue);
      }
      if (key.toLowerCase().includes('fontweight')) {
        finalValue = transformFontWeight(finalValue);
      }
      if (typeof finalValue === 'number' || key.toLowerCase().includes('dimension') || key.toLowerCase().includes('size') || key.toLowerCase().includes('spacing')) {
        finalValue = transformDimension(finalValue);
      }

      result[pathArray.join('.')] = {
        ...value,
        name: `${normalizedFileName}-${pathArray.join('-')}`,
        value: finalValue
      };
    } else if (typeof value === 'object') {
      processTokenObject(value, pathArray, result, normalizedFileName);
    }
  }
  return result;
}

// Procesamos cada archivo
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

  // Añadimos a los tokens globales
  Object.assign(globalTokens, flatTokens);
});

// Resolvemos referencias cruzadas
const resolvedTokens = resolveReferences(globalTokens);

// Para cada archivo, generamos su versión con referencias resueltas
fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const baseName = file.replace('.json', '');
  const parts = baseName.split('.');
  const rawMode = parts.pop();
  const rawCollection = parts.join('.');
  const mode = normalize(rawMode);
  const collection = normalize(rawCollection);

  const normalizedFileName = `${collection}-${mode}`;

  const nested = {};
  for (const key in resolvedTokens) {
    if (!key.startsWith(`${normalizedFileName}-`)) continue; // solo tokens de este archivo

    const strippedKey = key.replace(`${normalizedFileName}-`, '');
    const parts = strippedKey.split('.');
    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    current[parts.at(-1)] = resolvedTokens[key];
  }

  const outPath = path.join(outputDir, file);
  fs.writeFileSync(outPath, JSON.stringify(nested, null, 2), 'utf-8');
});

// Escribimos metadata.json
const metadataPath = path.join(outputDir, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
const globalOutPath = path.join(outputDir, 'tokens-global.json');
fs.writeFileSync(globalOutPath, JSON.stringify(resolvedTokens, null, 2), 'utf-8');

