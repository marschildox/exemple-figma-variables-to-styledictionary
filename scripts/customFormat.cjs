
const StyleDictionary = require('style-dictionary');
const path = require('path');

// Transformador de nombre que usa prop.path
StyleDictionary.registerTransform({
  name: 'name/with-path-prefix',
  type: 'name',
  transformer: function (prop) {
    const file = prop.filePath.split('/').pop().replace('.json', '');
    const fileKey = file.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    const pathKey = prop.path.join('-').toLowerCase();
    return `tw-${fileKey}-${pathKey}`;
  }
});

// Grupo de transformación que aplica el nombre seguro
StyleDictionary.registerTransformGroup({
  name: 'custom/css-unique-path',
  transforms: ['attribute/cti', 'name/with-path-prefix', 'color/css']
});

// Formato modular con atributos por colección/modo
StyleDictionary.registerFormat({
  name: 'custom/css-theme-modular',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const match = filename.match(/^(.+)\.([^.]+)\.json$/); // grupo 1 = colección, grupo 2 = modo
      const collection = match?.[1]?.toLowerCase().replace(/\s+/g, '').replace(/\./g, '') || 'unknown';
      const mode = match?.[2]?.toLowerCase().replace(/\s+/g, '').replace(/\./g, '') || 'base';

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

    const themeBlocks = Object.entries(blocks)
      .map(([key, content]) => {
        const [collection, mode] = key.split('|');
        return `[data-${collection}="${mode}"] {\n${content}}\n\n`;
      })
      .join('');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
