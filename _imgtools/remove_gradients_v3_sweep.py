import re, glob, os

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'
STOP_TOKEN = re.compile(
    r'(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)

def has_gradient(s: str) -> bool:
    return bool(GRADIENT_DIRECTION.search(s) or STOP_TOKEN.search(s))

def clean_class_string(s: str) -> str:
    s2 = GRADIENT_DIRECTION.sub('bg-primary-600', s)
    s2 = STOP_TOKEN.sub('', s2)
    s2 = re.sub(r'[ \t]{2,}', ' ', s2)
    return s2.strip()

# Generic string literal matcher: "...", '...', `...` (non-greedy, no escaped-quote handling needed
# since Tailwind class strings never contain quotes/backticks inside them)
STRING_LITERAL = re.compile(r'"([^"\n]*)"|\'([^\'\n]*)\'|`([^`]*)`')

def replace_literal(m):
    for g in (1, 2, 3):
        val = m.group(g)
        if val is not None:
            if has_gradient(val):
                cleaned = clean_class_string(val)
                quote = m.group(0)[0]
                return f'{quote}{cleaned}{quote}'
            return m.group(0)
    return m.group(0)

replaced_files = []
total = 0

for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    orig = content

    new_content = STRING_LITERAL.sub(replace_literal, content)

    if new_content != orig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        replaced_files.append(f)
        total += 1

print(f"Modified {total} additional files")
for f in replaced_files:
    print(" ", f)
