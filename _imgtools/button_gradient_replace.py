import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
jsx_files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

BRAND_CLASS = "bg-primary-600"

# Match a full <button ...> opening tag (up to the closing '>').
# Handles multi-line attrs and {expr} JSX braces inside attrs reasonably well
# by matching balanced braces for simple cases and falling back to non-greedy.
BUTTON_OPEN = re.compile(r'<button\b(?:[^<>]|\{[^{}]*\})*>', re.DOTALL)

COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')
STOP_TOKEN = re.compile(
    r'\b(?:[\w-]+:)*(?:from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)
DANGLING_VARIANT = re.compile(r'\b(?:dark|hover|group-hover|focus|active):(?=[\s"\'`}])')

def clean_gradient_text(text):
    # Replace the first gradient-direction token with the brand class,
    # remove all stop tokens, then remove any dangling variant prefixes,
    # then collapse extra whitespace left behind (only within this snippet).
    replaced_once = [False]

    def repl_dir(m):
        if not replaced_once[0]:
            replaced_once[0] = True
            return BRAND_CLASS
        return ''

    new_text = GRADIENT_DIRECTION.sub(repl_dir, text)
    new_text = STOP_TOKEN.sub('', new_text)
    new_text = DANGLING_VARIANT.sub('', new_text)
    # collapse runs of 2+ spaces that appear only inside quoted class strings
    # (safe here because we only operate within the matched button tag)
    new_text = re.sub(r'[ \t]{2,}', ' ', new_text)
    new_text = re.sub(r'" +"', '"', new_text)  # just in case
    return new_text

def process_file(path):
    with open(path, encoding='utf-8') as fh:
        content = fh.read()

    changed = False
    out_parts = []
    last_end = 0
    matches_info = []

    for m in BUTTON_OPEN.finditer(content):
        tag_text = m.group(0)
        if not (GRADIENT_DIRECTION.search(tag_text) or STOP_TOKEN.search(tag_text)):
            continue
        new_tag = clean_gradient_text(tag_text)
        if new_tag != tag_text:
            changed = True
            out_parts.append(content[last_end:m.start()])
            out_parts.append(new_tag)
            last_end = m.end()
            matches_info.append(tag_text[:90].replace('\n', ' '))

    out_parts.append(content[last_end:])
    new_content = ''.join(out_parts) if changed else content
    return content, new_content, matches_info

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in jsx_files:
    orig, new, changes = process_file(f)
    if new != orig:
        total_files += 1
        total_changes += len(changes)
        print(f"{f}: {len(changes)} <button> gradient(s) -> {BRAND_CLASS}")
        for c in changes:
            print(f"    - {c}")
        if not DRY_RUN:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"\nTOTAL: {total_files} files, {total_changes} <button> gradients replaced (dry_run={DRY_RUN})")
