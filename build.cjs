// build.js
require('./scripts/customFormat.cjs');

const StyleDictionary = require('style-dictionary').extend('./config.json');
StyleDictionary.buildAllPlatforms();
