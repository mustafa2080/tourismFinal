import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
jsx_files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

BRAND_CLASS = "bg-[#ED9A58]"
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
STOP_TOKEN = re.compile(
    r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)
DANGLING_VARIANT = re.compile(r'\b(?:dark|hover|group-hover|focus|active):(?=[\s"\'`}])')
COLOR_FIELD = re.compile(r"(color:\s*)'(?:from|via|to)-" + COLOR_NAMES + r"(?:-\d{2,3})?\s+(?:to|via)-" + COLOR_NAMES + r"(?:-\d{2,3})?'")

KEEP_KEYWORDS = re.compile(
    r'(shimmer|skeleton|loading-skeleton|skeleton-loader|skeleton-loading|'
    r'auth-card|message-card-item|package-card|signup-button)',
    re.IGNORECASE
)

def clean_snippet(text, seen_dir=[False]):
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

def process_file(path):
    with open(path, encoding='utf-8') as fh:
        content = fh.read()

    if KEEP_KEYWORDS.search(content) and False:
        pass  # keyword check happens per-match via context below

    changed_any = False

    # Pass 1: color: 'from-x to-y' JS object fields -> empty
    def repl_color_field(m):
        return m.group(1) + "''"
    new_content, n1 = COLOR_FIELD.subn(repl_color_field, content)
    if n1:
        changed_any = True

    # Pass 2: any quoted string (single/double/template) containing gradient tokens
    STRING_LITERAL = re.compile(r'(`[^`]*`|"[^"]*"|\'[^\']*\')', re.DOTALL)

    def repl_string(m):
        s = m.group(0)
        if not (GRADIENT_DIRECTION.search(s) or STOP_TOKEN.search(s)):
            return s
        return clean_snippet(s)

    final_content, n2 = STRING_LITERAL.subn(repl_string, new_content)

    return content, final_content, n1 + n2

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in jsx_files:
    orig, new, n = process_file(f)
    if new != orig and n > 0:
        total_files += 1
        total_changes += n
        print(f"{f}: {n} change(s)")
        if not DRY_RUN:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"\nTOTAL: {total_files} files, {total_changes} changes (dry_run={DRY_RUN})")
