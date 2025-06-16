
const StyleDictionary = require('style-dictionary');
const path = require('path');

StyleDictionary.registerFormat({
  name: 'custom/css-theme-mode-split',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const filename = prop.filePath.split('/').pop();
      const match = filename.match(/^(.+)\.([^.]+)\.json$/); // grupo 1 = colección, grupo 2 = modo
      const collection = match?.[1]?.toLowerCase().replace(/\s+/g, '').replace(/\./g, '') || 'unknown';
      const mode = match?.[2]?.toLowerCase().replace(/\s+/g, '').replace(/\./g, '') || 'base';

      const prefix = `tw-${collection}-${mode}`;
      const varName = `--${prefix}-${prop.name.replace(/\./g, '-')}`;
      const key = `${collection}|${mode}`;

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
