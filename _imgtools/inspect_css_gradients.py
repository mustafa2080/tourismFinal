import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
css_files = glob.glob(os.path.join(root, "**", "*.css"), recursive=True)

# Match a full gradient(...) function call, balancing parens (simple, no nested func calls inside typically,
# but rgba()/hsla() can appear inside - handle one level of nesting)
GRAD_CALL = re.compile(
    r'((?:linear|radial|conic)-gradient)\(((?:[^()]|\([^()]*\))*)\)'
)

for f in css_files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    matches = list(GRAD_CALL.finditer(content))
    if not matches:
        continue
    print(f"\n===== {f} ({len(matches)} gradients) =====")
    for m in matches:
        # find surrounding context: look back for selector or property name, and the property line
        start = m.start()
        line_start = content.rfind('\n', 0, start) + 1
        line_end = content.find('\n', start)
        # find nearest preceding selector (search back for '{' and the selector before it, or nearest class comment)
        # simplistic: grab up to 300 chars before for context, and check if 'shimmer' or 'skeleton' appears nearby
        context_before = content[max(0, start-400):start]
        # find nearest selector line: last "{" and text before it on that line-ish
        sel_match = re.findall(r'([.\w#:>\-\s,&]+)\{', context_before)
        selector = sel_match[-1].strip() if sel_match else '???'
        print(f"  [selector≈ {selector[:60]!r}] {m.group(0)[:150]}")
