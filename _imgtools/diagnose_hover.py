import re, sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"C:\Users\musta\Desktop\pro\tour\frontend\src\components\layout\Header.jsx"

BRAND_CLASS = "bg-[#ED9A58]"
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'

GRADIENT_DIRECTION = re.compile(r'\b((?:[\w-]+:)*)bg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
STOP_TOKEN = re.compile(
    r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)
KEEP_KEYWORDS = re.compile(r'(shimmer|skeleton|loading-skeleton|skeleton-loader|skeleton-loading)', re.IGNORECASE)

def clean_snippet(text):
    seen_prefixes = set()
    def repl_dir(m):
        prefix = m.group(1)
        if prefix in seen_prefixes:
            return ''
        seen_prefixes.add(prefix)
        return f"{prefix}{BRAND_CLASS}"
    new_text = GRADIENT_DIRECTION.sub(repl_dir, text)
    new_text = STOP_TOKEN.sub('', new_text)
    new_text = re.sub(r'[ \t]{2,}', ' ', new_text)
    return new_text

with open(path, encoding='utf-8') as fh:
    content = fh.read()

STRING_LITERAL = re.compile(r'(`[^`]*`|"[^"]*"|\'[^\']*\')', re.DOTALL)

count = 0
for m in STRING_LITERAL.finditer(content):
    s = m.group(0)
    if KEEP_KEYWORDS.search(s):
        continue
    if not (GRADIENT_DIRECTION.search(s) or STOP_TOKEN.search(s)):
        continue
    if 'hover:bg-gradient' not in s:
        continue
    new_s = clean_snippet(s)
    count += 1
    print(f"--- match #{count} ---")
    print("BEFORE:", s[:200])
    print("AFTER :", new_s[:200])
    print()
    if count >= 10:
        break

print(f"Total hover matches shown: {count}")
