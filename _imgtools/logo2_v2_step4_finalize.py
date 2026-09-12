from PIL import Image

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
ASSETS = r"C:\Users\musta\Desktop\pro\tour\frontend\src\assets"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

# Uses the precisely re-cropped icon (true boundary detection via row-density
# minimum, not a hardcoded row cutoff) to regenerate all logo/favicon assets.
icon = Image.open(rf"{BASE}\logo2_icon_only_v2.png").convert("RGBA")

target_h = 280
scale = target_h / icon.size[1]
new_w = int(icon.size[0] * scale)
header_logo = icon.resize((new_w, target_h), Image.LANCZOS)

header_logo.save(rf"{ASSETS}\logo.webp", format="WEBP", lossless=True)
print("saved assets/logo.webp", header_logo.size)

header_logo.save(rf"{PUB}\logo.png")
print("saved public/logo.png", header_logo.size)

for size, fname in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png")]:
    small = icon.resize((size, size), Image.LANCZOS)
    small.save(rf"{PUB}\{fname}")
    print("saved", fname, small.size)

for size, fname in [(192, "android-chrome-192x192.png"), (512, "android-chrome-512x512.png")]:
    sq = icon.resize((size, size), Image.LANCZOS)
    sq.save(rf"{PUB}\{fname}")
    print("saved", fname, sq.size)

apple = icon.resize((180, 180), Image.LANCZOS)
apple.save(rf"{PUB}\apple-touch-icon.png")
print("saved apple-touch-icon.png", apple.size)
