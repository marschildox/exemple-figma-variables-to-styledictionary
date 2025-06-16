
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

// Grupo de transformación sin sobrescribir "name"
StyleDictionary.registerTransformGroup({
  name: 'custom/css-plain',
  transforms: ['attribute/cti', 'color/css']
});

// Formato CSS con data-theme y data-mode usando metadata
StyleDictionary.registerFormat({
  name: 'custom/css-theme-mode-attributes',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const cleanName = filename.replace('.json', '');
      const parts = cleanName.split('.');
      const mode = parts.pop().toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
      const collection = parts.join('').toLowerCase().replace(/\s+/g, '');
      const key = `${collection}|${mode}`;
      const varName = `--${prop.name}`;

      if (mode === 'base') {
        root += `  ${varName}: ${prop.value};\n`;
      } else {
        if (!blocks[key]) blocks[key] = '';
        blocks[key] += `  ${varName}: ${prop.value};\n`;
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(metadata)
      .map(([collection, modes]) =>
        modes
          .map(mode => {
            const key = `${collection}|${mode}`;
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
