
const StyleDictionary = require('style-dictionary');
const path = require('path');

StyleDictionary.registerFormat({
  name: 'custom/css-themes',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const themes = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const match = filename.match(/^(.+)\.([^.]+)\.json$/); // Grupo 1 = categoría, Grupo 2 = modo
      const category = match?.[1]?.toLowerCase().replace(/\s+/g, '') || null;
      const rawMode = match?.[2] || 'base';
      const mode = rawMode.toLowerCase().replace(/\s+/g, '');
      const themeKey = category && mode !== 'base' ? `${category}-${mode}` : null;
      const varName = `--tw-${prop.name.replace(/\./g, '-')}`;

      if (!themeKey) {
        root += `  ${varName}: ${prop.value};\n`;
      } else {
        if (!themes[themeKey]) themes[themeKey] = '';
        themes[themeKey] += `  ${varName}: ${prop.value};\n`;
      }
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(themes)
      .map(([key, content]) => `[data-theme="${key}"] {\n${content}}\n\n`)
      .join('');

    const timestamp = `/* Generated: ${new Date().toISOString()} */\n`;
    return root + themeBlocks + timestamp;
  }
});
