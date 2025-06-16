// build.js
require('./scripts/customFormat'); // registra el nuevo formato

const StyleDictionary = require('style-dictionary').extend('./config.json');
StyleDictionary.buildAllPlatforms();
