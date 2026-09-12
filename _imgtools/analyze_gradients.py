import re, glob, os, json

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

pattern = re.compile(r'\b(bg-gradient-to-\w+|from-[\w\-/\[\]%.]+|via-[\w\-/\[\]%.]+|to-[\w\-/\[\]%.]+)\b')

gradient_tokens = {}
files_with_gradient = []

for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    matches = pattern.findall(content)
    if matches:
        files_with_gradient.append((f, len(matches)))
        for m in matches:
            gradient_tokens[m] = gradient_tokens.get(m, 0) + 1

print("Files with gradient tokens:", len(files_with_gradient))
print("Total files:", len(files))
print()
print("=== Token frequency ===")
for tok, cnt in sorted(gradient_tokens.items(), key=lambda x: -x[1]):
    print(f"{cnt:4d}  {tok}")
