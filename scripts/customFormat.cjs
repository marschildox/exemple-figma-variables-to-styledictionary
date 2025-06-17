
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

// ✅ Filtro para evitar tokens mal formados o duplicados sin valor
StyleDictionary.registerFilter({
  name: 'isDesignToken',
  matcher: function(prop) {
    return !!prop.name && !!prop.value;
  }
});

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
      const parts = prop.name.split('-');
      if (parts.length < 3) return;

      const collection = parts[0];
      const mode = parts[1];
      const key = `${collection}||${mode}`;
      const varName = `--${prop.name}`;

      if (!blocks[key]) blocks[key] = '';
      blocks[key] += `  ${varName}: ${prop.value};\n`;
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(metadata)
      .map(([collection, modes]) =>
        modes
          .map(mode => {
            const key = `${collection}||${mode}`;
            const content = blocks[key] || '';
            return `[data-theme-${collection}="${mode}"] {\n${content}}\n`;
          })
          .join('\n')
      )
      .join('\n\n');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
