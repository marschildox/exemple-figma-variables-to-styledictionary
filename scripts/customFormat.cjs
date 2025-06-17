
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
  name: 'custom/css-theme-per-collection',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const name = prop.name.toLowerCase();
      // buscamos colección y modo desde el prefijo del name
      for (const [collection, modes] of Object.entries(metadata)) {
        for (const mode of modes) {
          const prefix = `${collection}-${mode}-`;
          if (name.startsWith(prefix)) {
            const key = `${collection}||${mode}`;
            const varName = `--${prop.name}`;
            if (!blocks[key]) blocks[key] = '';
            blocks[key] += `  ${varName}: ${prop.value};\n`;
          }
        }
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(blocks)
      .map(([key, content]) => {
        const [collection, mode] = key.split('||');
        return `[data-theme-${collection}="${mode}"] {\n${content}}\n`;
      })
      .join('\n\n');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
