const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

// Paso 1: Obtener lista de modos válidos desde archivos SEMANTIC COLORS
const tokensDir = path.join(__dirname, '..', 'tokens');
const semanticFiles = fs
  .readdirSync(tokensDir)
  .filter(f => f.startsWith('SEMANTIC COLORS.') && f.endsWith('.json'));

const validModes = semanticFiles.map(file =>
  file.replace('SEMANTIC COLORS.', '').replace('.json', '').toLowerCase().replace(/\s+/g, '-')
);

// Paso 2: Registrar formato personalizado
StyleDictionary.registerFormat({
  name: 'custom/css-themes',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const themes = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const match = filename.match(/\.([^.]+)\.json$/);
      const rawMode = match?.[1] || 'base';
      const mode = rawMode.toLowerCase().replace(/\s+/g, '-');
      const varName = `--tw-${prop.name.replace(/\./g, '-')}`;

      if (mode === 'base' || !validModes.includes(mode)) {
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

    return root + themeBlocks;
  }
});
