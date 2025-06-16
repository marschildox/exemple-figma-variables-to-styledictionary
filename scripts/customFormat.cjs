const StyleDictionary = require('style-dictionary');
const path = require('path');

StyleDictionary.registerFormat({
  name: 'custom/css-themes',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const themes = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop(); // ej: Color Primitives.Mode 1.json
      const match = filename.match(/\.([^.]+)\.json$/); // extrae 'Mode 1', 'Modern', etc.
      const rawMode = match?.[1] || 'base';
      const mode = rawMode.toLowerCase().replace(/\s+/g, '-'); // limpia espacios
      const varName = `--tw-${prop.name.replace(/\./g, '-')}`;

      if (mode === 'base') {
        root += `  ${varName}: ${prop.value};\n`;
      } else {
        if (!themes[mode]) themes[mode] = '';
        themes[mode] += `  ${varName}: ${prop.value};\n`;
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(themes)
      .map(([mode, content]) => `[data-theme="${mode}"] {\n${content}}\n\n`)
      .join('');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
