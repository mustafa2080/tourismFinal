import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
css_files = glob.glob(os.path.join(root, "**", "*.css"), recursive=True)

BRAND = "#0d9488"

GRAD_CALL = re.compile(
    r'(?:linear|radial|conic)-gradient\(((?:[^()]|\([^()]*\))*)\)'
)

KEEP_KEYWORDS = re.compile(
    r'(shimmer|skeleton|loading-skeleton|skeleton-loader|skeleton-loading|'
    r'auth-card|message-card-item|package-card|signup-button)',
    re.IGNORECASE
)

def get_selector_context(content, start):
    context_before = content[max(0, start-500):start]
    sel_matches = re.findall(r'([.\w#:>\-\s,&]+)\{', context_before)
    return sel_matches[-1].strip() if sel_matches else ''

def process_file(path):
    with open(path, encoding='utf-8') as fh:
        content = fh.read()

    out = []
    for m in GRAD_CALL.finditer(content):
        selector = get_selector_context(content, m.start())
        if KEEP_KEYWORDS.search(selector):
            continue
        out.append((m.start(), m.end(), selector))

    new_content = content
    changes = []
    for start, end, selector in sorted(out, key=lambda x: -x[0]):
        new_content = new_content[:start] + BRAND + new_content[end:]
        changes.append(selector)

    return content, new_content, changes

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in css_files:
    orig, new, changes = process_file(f)
    if new != orig:
        total_files += 1
        total_changes += len(changes)
        print(f"{f}: {len(changes)} gradients -> solid")
        for c in changes:
            print(f"    - {c[:70]}")
        if not DRY_RUN:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"\nTOTAL: {total_files} files, {total_changes} gradient declarations replaced (dry_run={DRY_RUN})")
