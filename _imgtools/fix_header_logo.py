"""
Header يستخدم logo.png جوه مربع صغير (40-48px) مع نص HTML منفصل جنبه.
فمحتاجين logo.png يبقى الأيقونة لوحدها (مربعة الشكل تقريبًا) من غير نص،
عشان متنكمشش أو تتقص جوه الـ container الصغير.
"""
from PIL import Image
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png"))

# نحط الأيقونة جوه مربع بمساحة فراغ بسيطة (padding قليل) عشان تملأ الـ 40-48px كويس
size = 512
pad_ratio = 0.05
w, h = icon.size
scale = (size * (1 - 2 * pad_ratio)) / max(w, h)
new_w, new_h = int(w * scale), int(h * scale)
resized = icon.resize((new_w, new_h), Image.LANCZOS)
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
x = (size - new_w) // 2
y = (size - new_h) // 2
canvas.paste(resized, (x, y), resized)
canvas.save(os.path.join(PUB, "logo.png"))
print("saved header logo.png (icon only, square)", canvas.size)
