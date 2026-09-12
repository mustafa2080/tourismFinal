"""
توليد كل أحجام اللوجو المطلوبة للمشروع من النسخ الشفافة النظيفة.
- الأيقونة لوحدها -> favicons / app icons (مربعة، padding مناسب)
- الأيقونة + النص -> logo.png (Header/Footer usage)
- نسخة على خلفية بيضاء -> og-image.jpg (لازم background لأنه jpg)
"""
from PIL import Image
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png"))
combo = Image.open(os.path.join(BASE, "icon_and_text.png"))

def square_pad(im, size, pad_ratio=0.08):
    """يحط الصورة جوه مربع بمساحة فراغ حوالينها، خلفية شفافة."""
    w, h = im.size
    scale = (size * (1 - 2 * pad_ratio)) / max(w, h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = im.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

# --- Favicons / App icons من الأيقونة بس ---
for size, name in [(512, "android-chrome-512x512.png"),
                    (192, "android-chrome-192x192.png"),
                    (180, "apple-touch-icon.png"),
                    (32, "favicon-32x32.png"),
                    (16, "favicon-16x16.png")]:
    square_pad(icon, size, pad_ratio=0.06 if size >= 180 else 0.02).save(os.path.join(PUB, name))
    print("saved", name)

# logo-512.webp (نفس الأيقونة، webp)
square_pad(icon, 512, pad_ratio=0.06).save(os.path.join(PUB, "logo-512.webp"), "WEBP")
print("saved logo-512.webp")

print("done step A")
