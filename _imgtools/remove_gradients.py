import re, glob, os

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

# Regex for a full gradient class run: bg-gradient-to-X plus following from-/via-/to- stops
# We capture the whole className string context by operating token-by-token per file,
# removing bg-gradient-to-* and any from-*/via-*/to-* color-stop tokens (but NOT text-*, border-*, etc.
# and not layout-related to-*/from-* like "from-left-8" positioning - those are rare, exclude non-color ones)

GRADIENT_DIRECTION = re.compile(r'\bbg-gradient-to-(?:br|r|b|t|tr|tl|bl|l)\b')

# color-stop token: from- / via- / to- followed by a tailwind color name or 'transparent'/'white'/'black'
# excludes things like from-left-8, from-right, from-top-2, from-bottom-4, to-action, to-know (false positives from prose text, not real classes)
COLOR_NAMES = r'(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)'
STOP_TOKEN = re.compile(
    r'\b(from|via|to)-' + COLOR_NAMES + r'(?:-\d{2,3})?(?:/\d{1,3})?\b'
)

replaced_files = []
total_replacements = 0

for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    orig = content

    n1 = len(GRADIENT_DIRECTION.findall(content))
    n2 = len(STOP_TOKEN.findall(content))

    if n1 == 0 and n2 == 0:
        continue

    # Replace the gradient direction utility with a single solid bg class
    content = GRADIENT_DIRECTION.sub('bg-primary-600', content)
    # Remove color-stop tokens entirely (from-/via-/to-color-N)
    content = STOP_TOKEN.sub('', content)
    # Clean up resulting double spaces inside className strings
    content = re.sub(r'[ \t]{2,}', ' ', content)
    # Clean up space before closing quote in className="... "
    content = re.sub(r' +(["\'`])', r'\1', content)
    # Clean up space after opening quote
    content = re.sub(r'(className=["\'`]) +', r'\1', content)

    if content != orig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        replaced_files.append((f, n1, n2))
        total_replacements += n1 + n2

print(f"Modified {len(replaced_files)} files, {total_replacements} token replacements")
for f, n1, n2 in replaced_files:
    print(f"  {n1+n2:4d}  {f}")
