#!/usr/bin/env node

/**
 * Script لتحديث جميع import من useTranslation إلى useInstantTranslation
 * في جميع الصفحات والمكونات
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// لأن __dirname غير موجود في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesToUpdate = [
  'BookingPage.jsx',
  'CareersPage.jsx',
  'CookieSettingsPage.jsx',
  'DashboardPage.jsx',
  'FAQPage.jsx',
  'LoginPage.jsx',
  'PressPage.jsx',
  'PrivacyPolicyPage.jsx',
  'RefundPolicyPage.jsx',
  'SignupPage.jsx',
  'TermsOfServicePage.jsx',
  'AdminSetupPage.jsx'
];

const pagesDir = path.join(__dirname, 'src', 'pages'); // تعديل المسار حسب هيكل المشروع

pagesToUpdate.forEach(filename => {
  const filepath = path.join(pagesDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️ ${filename} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf-8');
  let updated = false;

  // Replace useTranslation import with useInstantTranslation
  if (content.includes("import { useTranslation } from 'react-i18next'")) {
    content = content.replace(
      "import { useTranslation } from 'react-i18next'",
      "import { useInstantTranslation } from '../hooks/useInstantTranslation'"
    );
    updated = true;
  }

  // Remove useForceTranslationUpdate import
  if (content.includes('useForceTranslationUpdate')) {
    content = content.replace(
      /import\s*{\s*[^}]*useForceTranslationUpdate[^}]*}\s*from\s*['"][^'"]*['"];?\n?/g,
      ''
    );
    // Remove the hook call
    content = content.replace(/\s*useForceTranslationUpdate\(\);?\n?/g, '\n');
    updated = true;
  }

  // Replace useTranslation() with useInstantTranslation()
  if (content.includes('useTranslation()')) {
    content = content.replace(
      /const\s*{\s*t\s*}\s*=\s*useTranslation\(\);?/g,
      'const { t } = useInstantTranslation(); // استخدام الترجمة الفورية'
    );
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ Updated: ${filename}`);
  } else {
    console.log(`ℹ️ ${filename} - no changes needed`);
  }
});

console.log('\n✅ All updates completed!');