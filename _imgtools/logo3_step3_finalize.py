from PIL import Image

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
ASSETS = r"C:\Users\musta\Desktop\pro\tour\frontend\src\assets"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(rf"{BASE}\logo3_icon_only.png").convert("RGBA")
print("source icon size:", icon.size, "bbox:", icon.getbbox())

# Add uniform transparent padding so nothing sits flush against the canvas
# edge (avoids visual clipping when the browser scales the image).
pad_pct = 0.04
w, h = icon.size
pad_w = int(w * pad_pct)
pad_h = int(h * pad_pct)
padded = Image.new("RGBA", (w + pad_w * 2, h + pad_h * 2), (0, 0, 0, 0))
padded.paste(icon, (pad_w, pad_h), icon)
print("padded size:", padded.size, "bbox:", padded.getbbox())

target_h = 280
scale = target_h / padded.size[1]
new_w = int(padded.size[0] * scale)
header_logo = padded.resize((new_w, target_h), Image.LANCZOS)

header_logo.save(rf"{ASSETS}\logo.webp", format="WEBP", lossless=True)
print("saved assets/logo.webp", header_logo.size)

header_logo.save(rf"{PUB}\logo.png")
print("saved public/logo.png", header_logo.size)

for size, fname in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png")]:
    small = padded.resize((size, size), Image.LANCZOS)
    small.save(rf"{PUB}\{fname}")
    print("saved", fname, small.size)

for size, fname in [(192, "android-chrome-192x192.png"), (512, "android-chrome-512x512.png")]:
    sq = padded.resize((size, size), Image.LANCZOS)
    sq.save(rf"{PUB}\{fname}")
    print("saved", fname, sq.size)

apple = padded.resize((180, 180), Image.LANCZOS)
apple.save(rf"{PUB}\apple-touch-icon.png")
print("saved apple-touch-icon.png", apple.size)
