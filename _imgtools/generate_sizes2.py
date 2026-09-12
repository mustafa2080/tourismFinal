from PIL import Image
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

combo = Image.open(os.path.join(BASE, "icon_and_text.png"))
full = Image.open(os.path.join(BASE, "icon_text_slogan.png"))

# logo.png: أيقونة + نص، خلفية شفافة، بعرض مناسب لـ Header (ارتفاع ~200px مع الحفاظ على الشفافية)
target_h = 240
scale = target_h / combo.size[1]
new_w = int(combo.size[0] * scale)
logo_resized = combo.resize((new_w, target_h), Image.LANCZOS)
logo_resized.save(os.path.join(PUB, "logo.png"))
print("saved logo.png", logo_resized.size)

# og-image.jpg: لازم خلفية (jpg مش بيدعم شفافية) - نحط خلفية بيضاء نضيفة 1200x630 (نسبة OG القياسية)
og_w, og_h = 1200, 630
og_bg = Image.new("RGB", (og_w, og_h), (255, 255, 255))

# نستخدم النسخة الكاملة (أيقونة+نص+سلوجان) في النص
fh = int(og_h * 0.72)
fscale = fh / full.size[1]
fw = int(full.size[0] * fscale)
full_resized = full.resize((fw, fh), Image.LANCZOS)

x = (og_w - fw) // 2
y = (og_h - fh) // 2
og_bg.paste(full_resized, (x, y), full_resized)
og_bg.save(os.path.join(PUB, "og-image.jpg"), quality=92)
print("saved og-image.jpg", og_bg.size)
