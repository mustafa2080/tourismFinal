"""
بدل تقطيع جزء من الأيقونة (اللي هيبوظ الشكل)، نستخدم الأيقونة الكاملة
لكن بـ padding أوسع جوه الكانفاس (يبقى صغير نسبيًا ومتمركز) عشان
في الأحجام الصغيرة (40-72px) يبان كعلامة مدمجة واضحة بدل ما يزحم الإطار.
"""
from PIL import Image
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png"))

size = 512
pad_ratio = 0.16  # فراغ أوسع من قبل (كان 0.05-0.06)
w, h = icon.size
scale = (size * (1 - 2 * pad_ratio)) / max(w, h)
nw, nh = int(w * scale), int(h * scale)
resized = icon.resize((nw, nh), Image.LANCZOS)
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)

canvas.save(os.path.join(PUB, "logo-512.webp"), "WEBP")
canvas.save(os.path.join(PUB, "android-chrome-512x512.png"))
print("saved wide-padding icon", canvas.size)

# نسخة 192 كمان بنفس المنطق
c192 = canvas.resize((192, 192), Image.LANCZOS)
c192.save(os.path.join(PUB, "android-chrome-192x192.png"))
print("saved 192")

# preview بحجم اللودر الفعلي (72px) للتأكد
sim = canvas.resize((144, 144), Image.LANCZOS)
bgw = Image.new("RGBA", sim.size, (255, 255, 255, 255))
bgw.paste(sim, (0, 0), sim)
bgw.convert("RGB").save(os.path.join(BASE, "loader_sim2.jpg"))
print("saved sim preview")
