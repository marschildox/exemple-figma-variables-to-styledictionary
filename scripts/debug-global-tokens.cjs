// scripts/debug-global-tokens.cjs
const fs = require('fs');
const path = require('path');

const globalTokensPath = path.join(__dirname, '..', 'tokens-prepared', 'tokens-global.json');

if (!fs.existsSync(globalTokensPath)) {
  console.error('❌ tokens-global.json not found.');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(globalTokensPath, 'utf-8'));

console.log(`\n🔍 Total tokens: ${Object.keys(tokens).length}\n`);

Object.keys(tokens).forEach((key) => {
  console.log(`- ${key}`);
});

console.log('\n✅ Global tokens listed.\n');
