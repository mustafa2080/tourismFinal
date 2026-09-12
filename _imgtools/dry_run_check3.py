import re, glob, os, sys

sys.stdout.reconfigure(encoding='utf-8')
exec(open(r"C:\Users\musta\Desktop\pro\tour\_imgtools\remove_gradients_v2.py", encoding='utf-8').read().split("replaced_files = []")[0])

sample_file = r"C:\Users\musta\Desktop\pro\tour\frontend\src\pages\AboutPage.jsx"
with open(sample_file, encoding='utf-8') as fh:
    content = fh.read()

new_content = CLASS_ATTR.sub(replace_class_attr, content)
new_content = COLOR_FIELD.sub(replace_color_field, new_content)

lines_orig = content.split('\n')
lines_new = new_content.split('\n')
diff_count = 0
for i, (lo, ln) in enumerate(zip(lines_orig, lines_new)):
    if lo != ln:
        diff_count += 1
        print(f"L{i+1}:")
        print("  OLD:", lo.strip()[:190])
        print("  NEW:", ln.strip()[:190])

print("DIFF LINES:", diff_count, "of", len(lines_orig))

with open(r"C:\Users\musta\Desktop\pro\tour\_imgtools\AboutPage_preview.jsx", 'w', encoding='utf-8') as fh:
    fh.write(new_content)
