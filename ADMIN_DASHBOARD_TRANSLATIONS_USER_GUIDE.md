ADMIN DASHBOARD - HOW TO USE TRANSLATION FIELDS
================================================

👤 ADMIN USER GUIDE
==================

HOW TO CREATE A PACKAGE WITH TRANSLATIONS
-------------------------------------------
1. Go to Admin Dashboard → Tours → Packages
2. Click the "➕ ADD NEW PACKAGE" button (blue button at top right)
3. Fill in the basic information:
   - Package Name (English default)
   - Category
   - Destination
   - Duration (Days)
   - Base Price
   - Mark as Featured (optional)
   - Short Description
   - Detailed Description
   - Add Images
   - Add Inclusions
   - Add Exclusions
   - Add Daily Itinerary

4. SCROLL DOWN to find "🌐 Translations & Multi-Language Content" section

5. EXPAND LANGUAGE TABS:
   - English (EN) 🇺🇸 - This one is expanded by default
   - العربية (AR) 🇪🇬 - Click to expand Arabic
   - Español (ES) 🇪🇸 - Click to expand Spanish
   - Deutsch (DE) 🇩🇪 - Click to expand German
   - Русский (RU) 🇷🇺 - Click to expand Russian

6. FOR EACH LANGUAGE, FILL IN:
   
   Package Name *
   ├─ Required field
   ├─ Max 255 characters
   ├─ Example EN: "Amazing Pyramids Tour"
   ├─ Example AR: "جولة الأهرامات المذهلة"
   └─ Example ES: "Fascinante recorrido por las pirámides"

   Short Description
   ├─ Optional
   ├─ Max 200 characters (counter shows usage)
   ├─ Brief summary of the package
   └─ Example: "Explore the wonders of ancient Egypt"

   Detailed Description
   ├─ Optional
   ├─ Max 1000 characters (counter shows usage)
   ├─ More comprehensive description
   └─ Include details about what makes this special

   What's Included
   ├─ Optional
   ├─ Textarea for listing items
   ├─ Can be multiple lines
   └─ Example: "Hotel, Breakfast, Guided tour, Transportation"

   What's Excluded
   ├─ Optional
   ├─ Textarea for listing what's NOT included
   └─ Example: "Personal insurance, Tips, Meals not mentioned"

   Daily Itinerary
   ├─ Optional
   ├─ Textarea for detailed day-by-day plan
   ├─ Multiple lines supported
   └─ Example: "Day 1: Cairo arrival...\nDay 2: Pyramids tour..."

7. SAVE YOUR CHANGES
   - Click "💾 Save Changes" button (green button at bottom)
   - Wait for confirmation message
   - Package created with all translations!

HOW TO EDIT A PACKAGE WITH TRANSLATIONS
-----------------------------------------
1. Go to Admin Dashboard → Tours → Packages
2. Find the package you want to edit
3. Click the "✏️ EDIT" button (purple button)
4. Modal opens with all package data including translations
5. Modify any fields as needed
6. If you need to change translations:
   - Scroll down to "🌐 Translations & Multi-Language Content"
   - Click on the language tab you want to modify
   - Update the translation fields
7. Click "💾 Save Changes"
8. Changes saved to database

HOW TO CREATE AN ADD-ON WITH TRANSLATIONS
------------------------------------------
1. Go to Admin Dashboard → Tours → Add-Ons
2. Click "➕ CREATE ADD-ON" button
3. Select Package (dropdown at top)
4. Fill in basic info (quantity range, availability)
5. SCROLL DOWN to "🌐 Translations & Multi-Language Content"
6. Follow the same process as packages:
   - Expand language tabs
   - Fill in the 6 translation fields per language
   - Use character counters as guide
7. Click "💾 Save Changes"
8. Add-On created with translations!

HOW TO EDIT AN ADD-ON WITH TRANSLATIONS
----------------------------------------
1. Go to Admin Dashboard → Tours → Add-Ons
2. Find the add-on in the list
3. Click "✏️ EDIT" button
4. Expand language tabs in "Translations" section
5. Update translation fields as needed
6. Click "💾 Save Changes"
7. All translations updated in database!

🎯 QUICK TIPS
=============
✅ START WITH ENGLISH
   - English tab is open by default
   - Fill English first, then translate to other languages
   - English serves as the base language

✅ USE CHARACTER COUNTERS
   - Green fields show current usage / max limit
   - For "Package Name": 255 char limit
   - For "Short Description": 200 char limit
   - For "Detailed Description": 1000 char limit
   - Other fields have no limit

✅ EXPAND ONLY NEEDED LANGUAGES
   - Click language tab to expand/collapse
   - Only expand languages you need to fill
   - Collapse when done to keep UI clean

✅ CONSISTENCY MATTERS
   - Keep translations consistent across all languages
   - Use similar length descriptions
   - Maintain tone and style across languages
   - Don't skip languages - at least English should have all fields

✅ VIEW MODE vs EDIT MODE
   - When viewing a package/addon (click "View"):
     * Translation fields are disabled (grayed out)
     * You can read but not edit
     * Useful for reviewing before publishing
   - When editing (click "Edit"):
     * Translation fields are enabled
     * You can modify all translations
     * Changes are saved to database

📱 MOBILE/RESPONSIVE
====================
✅ Works on desktop, tablet, and mobile
✅ Language tabs stack nicely on small screens
✅ All fields expand properly on mobile
✅ Touch-friendly buttons and inputs
✅ Scrollable modal content on small screens

🌐 LANGUAGE-SPECIFIC NOTES
===========================

ENGLISH (EN) 🇺🇸
- Use professional, engaging language
- Be descriptive but concise
- Use active voice when possible

العربية (AR) 🇪🇬
- Professional Arabic terminology
- Maintain RTL text direction
- Use formal Arabic (Fuseeha)

Español (ES) 🇪🇸
- Latin American Spanish preferred
- Use "vosotros" for Spain version
- Keep consistent terminology

Deutsch (DE) 🇩🇪
- German compound words are OK
- Use formal "Sie" forms
- Capitalize nouns as in German

Русский (RU) 🇷🇺
- Modern Russian terminology
- Use proper Cyrillic characters
- Maintain formal tone

❓ FREQUENTLY ASKED QUESTIONS
=============================

Q: Can I save without filling all languages?
A: YES! But at least one language (usually English) should have Package Name filled.
   Other fields are optional per language.

Q: What happens if I leave a translation blank?
A: If a field is blank, the default English version may be used (backend dependent).
   It's best to fill all important fields.

Q: Can I copy translations from one language to another?
A: Not automatically in the UI, but you can:
   1. Open two browser tabs with edit mode
   2. Copy from one language
   3. Paste to another language
   (In future updates, we'll add a copy feature)

Q: Where are the translations stored?
A: In the database:
   - Packages: package_translations table
   - Add-ons: package_addon_translations table
   Each row has: package_id/addon_id, language code, and 6 translation fields

Q: When do users see my translations?
A: When they browse the website:
   - Their browser language is detected
   - Matching translation is shown
   - If no translation for their language, falls back to English

Q: Can I preview translations on the frontend?
A: YES! Go to the public website, change your language preference,
   and browse packages/tours to see your translations in action.

Q: What if I make a mistake in a translation?
A: Just click "Edit" again, find the package, scroll to translations,
   fix the mistake, and click "Save Changes". Done!

Q: Can I delete a translation?
A: Clear the field and save. The translation will be empty.
   (Or use the API directly for more control)

🆘 TROUBLESHOOTING
==================

PROBLEM: Translation fields don't appear
SOLUTION: Make sure you're in Edit or Create mode (not View mode)
          Scroll down to find the section

PROBLEM: Character counter shows wrong count
SOLUTION: Refresh the page, the counter should update correctly

PROBLEM: Changes not saved
SOLUTION: 
  1. Check if you clicked "Save Changes" button
  2. Look for a green success message
  3. If error appears, check all required fields are filled
  4. Verify internet connection

PROBLEM: Translation appears blank on website
SOLUTION:
  1. Check the translation was saved in admin dashboard
  2. Verify you filled the Package Name (required)
  3. Wait a few seconds for cache to clear
  4. Try changing language preference on website

📞 SUPPORT
=========
If you encounter issues:
1. Check this guide for solutions
2. Review the tip boxes in the modal
3. Contact technical support with screenshot
4. Include language and field name where issue occurs

═══════════════════════════════════════════════════════
Last Updated: 2025
Version: 1.0
Status: Complete & Live
═══════════════════════════════════════════════════════
