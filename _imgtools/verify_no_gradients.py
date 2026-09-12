import re, glob, os

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'
STOP_TOKEN = re.compile(r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b')

remaining = []
for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    g = GRADIENT_DIRECTION.findall(content)
    s = STOP_TOKEN.findall(content)
    if g or s:
        remaining.append((f, len(g), len(s)))

print("Files still containing gradient tokens:", len(remaining))
for f, g, s in remaining:
    print(f"  {f}  (direction={g}, stops={s})")

# also check tailwind.config.js and CSS files for gradient defs
import glob as g2
css_files = g2.glob(r"C:\Users\musta\Desktop\pro\tour\frontend\src\**\*.css", recursive=True)
for f in css_files:
    with open(f, encoding='utf-8') as fh:
        c = fh.read()
    if 'gradient' in c.lower():
        print("CSS FILE WITH GRADIENT:", f)
