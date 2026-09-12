import re, glob, os, sys, io

sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'
STOP_TOKEN = re.compile(r'\b(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b')

sample_file = os.path.join(root, "pages", "AboutPage.jsx")
with open(sample_file, encoding='utf-8') as fh:
    content = fh.read()

new_content = GRADIENT_DIRECTION.sub('bg-primary-600', content)
new_content = STOP_TOKEN.sub('', new_content)
# Only collapse runs of spaces (not touching quotes/newlines globally)
new_content = re.sub(r'[ \t]{2,}', ' ', new_content)
# Trim trailing space that lands right before a closing quote (className="... ")
new_content = re.sub(r' +(["\'`])', r'\1', new_content)

lines_orig = content.split('\n')
lines_new = new_content.split('\n')
diff_count = 0
for i, (lo, ln) in enumerate(zip(lines_orig, lines_new)):
    if lo != ln:
        diff_count += 1
        print(f"--- line {i+1} ---")
        print("OLD:", lo.strip()[:180])
        print("NEW:", ln.strip()[:180])
        print()

print("TOTAL DIFF LINES:", diff_count)
