const fs = require('fs');
const path = require('path');

const langs = ['es', 'de', 'ru'];
const localesDir = path.join(__dirname, 'src', 'locales');

console.log('\n=== التحقق من ملفات اللغات ===\n');

langs.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✓ ${lang}/common.json - صحيح`);
    
    if (content.dashboardPage) {
      const dashboardKeys = Object.keys(content.dashboardPage).length;
      console.log(`  - dashboardPage: ${dashboardKeys} مفتاح`);
    }
    if (content.booking) {
      const bookingKeys = Object.keys(content.booking).length;
      console.log(`  - booking: ${bookingKeys} مفتاح`);
    }
    if (content.messages) {
      const messagesKeys = Object.keys(content.messages).length;
      console.log(`  - messages: ${messagesKeys} مفتاح`);
    }
    if (content.auth) {
      console.log(`  - auth: موجود`);
    }
    console.log('');
  } catch (e) {
    console.log(`✗ ${lang}/common.json - خطأ: ${e.message}\n`);
  }
});
