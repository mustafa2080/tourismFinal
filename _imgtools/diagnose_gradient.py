import re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"C:\Users\musta\Desktop\pro\tour\frontend\src\pages\DashboardPage.jsx"

BRAND_CLASS = "bg-[#ED9A58]"
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
STOP_TOKEN = re.compile(
    r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)
DANGLING_VARIANT = re.compile(r'\b(?:dark|hover|group-hover|focus|active):(?=[\s"\'`}])')

def clean_snippet(text):
    replaced_once = [False]
    def repl_dir(m):
        if not replaced_once[0]:
            replaced_once[0] = True
            return BRAND_CLASS
        return ''
    new_text = GRADIENT_DIRECTION.sub(repl_dir, text)
    new_text = STOP_TOKEN.sub('', new_text)
    new_text = DANGLING_VARIANT.sub('', new_text)
    new_text = re.sub(r'[ \t]{2,}', ' ', new_text)
    return new_text

with open(path, encoding='utf-8') as fh:
    content = fh.read()

STRING_LITERAL = re.compile(r'(`[^`]*`|"[^"]*"|\'[^\']*\')', re.DOTALL)

count = 0
for m in STRING_LITERAL.finditer(content):
    s = m.group(0)
    if not (GRADIENT_DIRECTION.search(s) or STOP_TOKEN.search(s)):
        continue
    new_s = clean_snippet(s)
    if new_s != s:
        count += 1
        print(f"--- match #{count} ---")
        print("BEFORE:", s[:150])
        print("AFTER :", new_s[:150])
        print()
    if count >= 15:
        break

print(f"Total matches shown: {count}")
