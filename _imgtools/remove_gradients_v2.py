import re, glob, os

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'
# stop token, optionally prefixed by a variant like dark:/hover:/group-hover:/focus: etc.
STOP_TOKEN = re.compile(
    r'(?P<prefix>(?:[\w-]+:)*)(?P<base>from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)

def clean_class_string(s: str) -> str:
    """Operate only on the inside of a className string/template."""
    s2 = GRADIENT_DIRECTION.sub('bg-primary-600', s)
    # remove the whole token INCLUDING its variant prefix (dark:, hover:, etc.)
    # so "dark:from-slate-900" -> "" entirely, not "dark:"
    s2 = STOP_TOKEN.sub('', s2)
    # collapse repeated spaces (safe here, we're only inside class strings)
    s2 = re.sub(r'[ \t]{2,}', ' ', s2)
    s2 = s2.strip()
    # strip stray leading/trailing spaces adjacent to template braces
    return s2

# Match className="..."  className='...'  className={`...`}
CLASS_ATTR = re.compile(
    r'className=(\{`(?P<tpl>[^`]*)`\}|"(?P<dq>[^"]*)"|\'(?P<sq>[^\']*)\')'
)

def replace_class_attr(m):
    if m.group('tpl') is not None:
        inner = m.group('tpl')
        cleaned = clean_class_string(inner)
        return f'className={{`{cleaned}`}}'
    elif m.group('dq') is not None:
        inner = m.group('dq')
        cleaned = clean_class_string(inner)
        return f'className="{cleaned}"'
    else:
        inner = m.group('sq')
        cleaned = clean_class_string(inner)
        return f"className='{cleaned}'"

# Also handle bare "color: 'from-x to-y'" data entries used inside template literals elsewhere,
# e.g. color: 'from-teal-500 to-teal-600'
COLOR_FIELD = re.compile(
    r"(color:\s*)'((?:from|via|to)-[\w\-/]+(?:\s+(?:from|via|to)-[\w\-/]+)*)'"
)
def replace_color_field(m):
    return f"{m.group(1)}''"

replaced_files = []

for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    orig = content

    content = CLASS_ATTR.sub(replace_class_attr, content)
    content = COLOR_FIELD.sub(replace_color_field, content)

    if content != orig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        replaced_files.append(f)

print(f"Modified {len(replaced_files)} files")
for f in replaced_files:
    print(" ", f)
