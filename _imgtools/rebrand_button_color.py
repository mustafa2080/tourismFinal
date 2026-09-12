import re, glob, os, sys
sys.stdout.reconfigure(encoding='utf-8')

root = r"C:\Users\musta\Desktop\pro\tour\frontend\src"
jsx_files = glob.glob(os.path.join(root, "**", "*.jsx"), recursive=True)

OLD = "bg-primary-600"
NEW = "bg-[#ED9A58]"

DRY_RUN = len(sys.argv) > 1 and sys.argv[1] == '--dry'

total_files = 0
total_changes = 0
for f in jsx_files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    count = content.count(OLD)
    if count:
        total_files += 1
        total_changes += count
        print(f"{f}: {count} occurrence(s)")
        if not DRY_RUN:
            new_content = content.replace(OLD, NEW)
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new_content)

print(f"\nTOTAL: {total_files} files, {total_changes} replacements (dry_run={DRY_RUN})")
