const fs = require('fs');
const path = require('path');

const localesDir = './src/locales';
const languages = ['en', 'es', 'de', 'ru', 'ar'];

console.log('🔍 Translation Files Validation\n');

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ ${lang.toUpperCase()} - JSON is valid`);
    console.log(`   - Has myProfilePage: ${!!json.myProfilePage}`);
    if (json.myProfilePage) {
      console.log(`   - myProfilePage.title: "${json.myProfilePage.title}"`);
    }
  } catch (error) {
    console.error(`❌ ${lang.toUpperCase()} - ${error.message}`);
  }
});
