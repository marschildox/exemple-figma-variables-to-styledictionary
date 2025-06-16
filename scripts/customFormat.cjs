const StyleDictionary = require('style-dictionary');

StyleDictionary.registerFormat({
  name: 'custom/css-themes',
  formatter: function({ dictionary }) {
    let root = ':root {\n';
    const themes = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const match = filename.match(/\.([^.]+)\.json$/);
      const rawMode = match?.[1] || 'base';
      const mode = rawMode.toLowerCase().replace(/\s+/g, '-');
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

    return root + themeBlocks;
  }
});
