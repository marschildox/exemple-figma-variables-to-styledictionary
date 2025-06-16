
const StyleDictionary = require('style-dictionary');
const path = require('path');

// Grupo de transformación sin nombre custom
StyleDictionary.registerTransformGroup({
  name: 'custom/css-plain',
  transforms: ['attribute/cti', 'color/css']
});

// Formato CSS modular con [data-theme="..."][data-mode="..."], tolerante con puntos
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
      const varName = `--${prop.name}`; // ya es único por preprocess

      if (mode === 'base') {
        root += `  ${varName}: ${prop.value};\n`;
      } else {
        if (!blocks[key]) blocks[key] = '';
        blocks[key] += `  ${varName}: ${prop.value};\n`;
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(blocks)
      .map(([key, content]) => {
        const [collection, mode] = key.split('|');
        return `[data-theme="${collection}"][data-mode="${mode}"] {\n${content}}\n\n`;
      })
      .join('');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
