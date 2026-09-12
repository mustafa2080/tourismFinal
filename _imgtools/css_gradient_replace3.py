import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
css_files = glob.glob(os.path.join(root, "**", "*.css"), recursive=True)

BRAND = "#ED9A58"
KEEP_KEYWORDS = re.compile(r'(shimmer|skeleton|loading-skeleton|skeleton-loader|skeleton-loading)', re.IGNORECASE)

# Matches linear-gradient(...) or radial-gradient(...), handling one level of nested parens
GRADIENT_FUNC = re.compile(
    r'(?:repeating-)?(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)'
)

def split_into_blocks(content):
    """Split CSS into top-level blocks (selector { ... }) preserving text order,
    handling one level of nested braces (e.g. media queries)."""
    blocks = []
    i = 0
    n = len(content)
    depth = 0
    start = 0
    while i < n:
        c = content[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                blocks.append(content[start:i+1])
                start = i + 1
        i += 1
    if start < n:
        blocks.append(content[start:])
    return blocks

def process_block(block):
    if KEEP_KEYWORDS.search(block):
        return block, 0
    new_block, n = GRADIENT_FUNC.subn(BRAND, block)
    return new_block, n

def process_file(path):
    with open(path, encoding='utf-8') as fh:
        content = fh.read()

    blocks = split_into_blocks(content)
    total_n = 0
    new_blocks = []
    for b in blocks:
        nb, n = process_block(b)
        total_n += n
        new_blocks.append(nb)

    new_content = ''.join(new_blocks)
    return content, new_content, total_n

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in css_files:
    orig, new, n = process_file(f)
    if new != orig and n > 0:
        total_files += 1
        total_changes += n
        print(f"{f}: {n} change(s)")
        if not DRY_RUN:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new)

print(f"\nTOTAL: {total_files} files, {total_changes} changes (dry_run={DRY_RUN})")
