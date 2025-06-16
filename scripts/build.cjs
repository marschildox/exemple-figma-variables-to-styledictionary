// build.js
require('./customFormat.cjs');

const StyleDictionary = require('style-dictionary').extend('./config.json');
StyleDictionary.buildAllPlatforms();

