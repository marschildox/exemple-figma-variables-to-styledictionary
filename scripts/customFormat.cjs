
const StyleDictionary = require('style-dictionary');
const path = require('path');
const fs = require('fs');

const metadataPath = path.join(__dirname, '..', 'tokens-prepared', 'metadata.json');
let metadata = {};

if (fs.existsSync(metadataPath)) {
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
} else {
  console.warn('⚠️ No se encontró metadata.json. Se generarán solo bloques disponibles.');
}

StyleDictionary.registerTransformGroup({
  name: 'custom/css-plain',
  transforms: ['attribute/cti', 'color/css']
});

StyleDictionary.registerFormat({
  name: 'custom/css-theme-mode-attributes',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      // buscamos patrón: tw-[colección][modo]-resto...
      const name = prop.name.replace(/^tw-/, '');
      const collectionMatch = name.match(/^([a-z0-9]+)(kawaii|mode\d+|modern|blue|standard|condensed|expanded|occidental|asiaverdezul|musulmán|gubernamental|asiático|square|m|s|l|xlrounded)-/i);
      if (!collectionMatch) return;

      const collection = collectionMatch[1].toLowerCase();
      const mode = collectionMatch[2].toLowerCase();
      const key = `${collection}${mode}`;
      const varName = `--${prop.name}`;

      if (!blocks[key]) blocks[key] = '';
      blocks[key] += `  ${varName}: ${prop.value};\n`;
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(metadata)
      .map(([collection, modes]) =>
        modes
          .map(mode => {
            const key = `${collection}${mode}`;
            const content = blocks[key] || '';
            return `[data-theme="${collection}"][data-mode="${mode}"] {\n${content}}\n`;
          })
          .join('\n')
      )
      .join('\n\n');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
