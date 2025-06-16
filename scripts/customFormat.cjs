
const StyleDictionary = require('style-dictionary');
const path = require('path');

// Transformador que añade el nombre del archivo como prefijo al name
StyleDictionary.registerTransform({
  name: 'name/with-file',
  type: 'name',
  transformer: function (prop, options) {
    const file = prop.filePath.split('/').pop().replace('.json', '');
    const fileKey = file.toLowerCase().replace(/\s+/g, '').replace(/\./g, '-');
    return `tw-${fileKey}-${prop.name.replace(/\./g, '-')}`;
  }
});

// Grupo de transformación personalizado que incluye nuestro transform
StyleDictionary.registerTransformGroup({
  name: 'custom/css-namespaced',
  transforms: ['attribute/cti', 'name/with-file', 'color/css']
});

// Formato para agrupar por archivo
StyleDictionary.registerFormat({
  name: 'custom/css-by-collection',
  formatter: function ({ dictionary }) {
    let root = ':root {\n';
    const blocks = {};

    dictionary.allProperties.forEach(prop => {
      const file = prop.filePath.split('/').pop().replace('.json', '');
      const key = file.toLowerCase().replace(/\s+/g, '').replace(/\./g, '-');
      if (!blocks[key]) blocks[key] = '';
      blocks[key] += `  --${prop.name}: ${prop.value};\n`;
    });

    root += '}\n\n';

    const themeBlocks = Object.entries(blocks)
      .map(([key, content]) => `[data-theme="${key}"] {\n${content}}\n\n`)
      .join('');

    return root + themeBlocks + `/* Generated: ${new Date().toISOString()} */\n`;
  }
});
