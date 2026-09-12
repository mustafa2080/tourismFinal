import re, sys
sys.stdout.reconfigure(encoding='utf-8')

src = open(r"C:\Users\musta\Desktop\pro\tour\_imgtools\remove_gradients_v3_sweep.py", encoding='utf-8').read()
src = src.split("replaced_files = []")[0]
exec(src)

for path in [
    r"C:\Users\musta\Desktop\pro\tour\frontend\src\pages\AdminDashboard\pages\BookingsPage.jsx",
    r"C:\Users\musta\Desktop\pro\tour\frontend\src\pages\AdminDashboard\pages\ContactMessagesPage.jsx",
    r"C:\Users\musta\Desktop\pro\tour\frontend\src\pages\AdminDashboard\pages\ReportsPage.jsx",
]:
    with open(path, encoding='utf-8') as fh:
        content = fh.read()
    new_content = STRING_LITERAL.sub(replace_literal, content)
    lo = content.split('\n')
    ln = new_content.split('\n')
    print("=====", path, "=====")
    for i, (a, b) in enumerate(zip(lo, ln)):
        if a != b:
            print(f"L{i+1}")
            print("  OLD:", a.strip()[:180])
            print("  NEW:", b.strip()[:180])
