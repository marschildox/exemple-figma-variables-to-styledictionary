const StyleDictionary = require('style-dictionary');
const path = require('path');

StyleDictionary.registerFormat({
  name: 'custom/css-by-collection',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const filepath = prop.filePath.split('/').pop(); // e.g. Color Primitives.Mode 1.json
      const cleanName = filepath.replace('.json', '')
                                .toLowerCase()
                                .replace(/\\s+/g, '')       // elimina espacios
                                .replace(/\\./g, '-')        // convierte punto a guion
                                .replace(/[^a-z0-9\\-]/g, ''); // limpia símbolos
      const varName = `--tw-${prop.name.replace(/\\./g, '-')}`;

      if (!cleanName || cleanName === 'base') {
        root += `  ${varName}: ${prop.value};\n`;
      } else {
        if (!blocks[cleanName]) blocks[cleanName] = '';
        blocks[cleanName] += `  ${varName}: ${prop.value};\n`;
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(blocks)
      .map(([key, content]) => `[data-theme="${key}"] {\n${content}}\n\n`)
      .join('');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
