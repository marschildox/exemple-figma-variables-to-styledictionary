
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
      // Extraemos collection y mode del nombre
      const match = prop.name.match(/^tw-([a-z0-9]+)-([a-z0-9]+)-/);
      if (!match) return; // ignorar si no coincide

      const collection = match[1];
      const mode = match[2];
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
