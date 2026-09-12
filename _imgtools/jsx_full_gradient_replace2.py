import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
jsx_files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

BRAND_CLASS = "bg-[#ED9A58]"
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'

# Matches bg-gradient-to-X or hover:bg-gradient-to-X, dark:bg-gradient-to-X, etc.
GRADIENT_DIRECTION = re.compile(r'\b((?:[\w-]+:)*)bg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
STOP_TOKEN = re.compile(
    r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)

KEEP_KEYWORDS = re.compile(
    r'(shimmer|skeleton|loading-skeleton|skeleton-loader|skeleton-loading)',
    re.IGNORECASE
)

def clean_snippet(text):
    """Replace bg-gradient-to-X (with any variant prefix like hover:/dark:) with
    the brand color class carrying the SAME variant prefix, then strip stop tokens."""
    seen_prefixes = set()

    def repl_dir(m):
        prefix = m.group(1)  # e.g. '' or 'hover:' or 'dark:hover:'
        if prefix in seen_prefixes:
            return ''
        seen_prefixes.add(prefix)
        return f"{prefix}{BRAND_CLASS}"

    new_text = GRADIENT_DIRECTION.sub(repl_dir, text)
    new_text = STOP_TOKEN.sub('', new_text)
    new_text = re.sub(r'[ \t]{2,}', ' ', new_text)
    return new_text

def process_file(path):
    with open(path, encoding='utf-8') as fh:
        content = fh.read()

    STRING_LITERAL = re.compile(r'(`[^`]*`|"[^"]*"|\'[^\']*\')', re.DOTALL)

    def repl_string(m):
        s = m.group(0)
        if KEEP_KEYWORDS.search(s):
            return s
        if not (GRADIENT_DIRECTION.search(s) or STOP_TOKEN.search(s)):
            return s
        return clean_snippet(s)

    final_content, n = STRING_LITERAL.subn(repl_string, content)
    return content, final_content, n

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in jsx_files:
    if KEEP_KEYWORDS.search(os.path.basename(f)):
        continue
    orig, new, n = process_file(f)
    if new != orig:
        total_files += 1
        total_changes += 1
        print(f"{f}: changed")
        if not DRY_RUN:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"\nTOTAL: {total_files} files changed (dry_run={DRY_RUN})")
