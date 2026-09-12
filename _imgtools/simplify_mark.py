"""
نسخة مبسطة للاستخدامات الصغيرة جدًا (loader 72px, header 40-48px):
نركّز على العنصر العلوي المميز (اليخت + البوصلة) بس، ونشيل الموجة/الدراجة
اللي بتضيع تفاصيلها وبتخلي الشكل يبان مزدحم في المقاسات الصغيرة.
"""
from PIL import Image
import numpy as np
import os

SRC = r"C:\Users\musta\Desktop\pro\tour\logo.jpg"
OUT = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

img = Image.open(SRC).convert("RGB")

# منطقة اليخت + البوصلة بس (فوق الموجة)
box = (555, 85, 945, 340)
crop = img.crop(box)
arr = np.array(crop).astype(int)
h, w, _ = arr.shape
s = 6
corners = np.concatenate([
    arr[0:s, 0:s].reshape(-1, 3), arr[0:s, w-s:w].reshape(-1, 3),
    arr[h-s:h, 0:s].reshape(-1, 3), arr[h-s:h, w-s:w].reshape(-1, 3),
], axis=0)
bg = corners.mean(axis=0)
diff = np.sqrt(((arr - bg) ** 2).sum(axis=2))
alpha = np.clip((diff - 10) / (45 - 10), 0, 1) * 255
rgba = np.dstack([arr.astype(np.uint8), alpha.astype(np.uint8)])
out = Image.fromarray(rgba, "RGBA")
a = np.array(out)
a[a[:, :, 3] < 20, 3] = 0
simple_mark = Image.fromarray(a, "RGBA")
simple_mark.save(os.path.join(OUT, "simple_mark.png"))
print("saved simple_mark.png", simple_mark.size)

# نحطها جوه مربع 512 بمساحة فراغ معقولة (padding أوسع شوية عشان تبقى مريحة في الأحجام الصغيرة)
size = 512
pad_ratio = 0.10
w2, h2 = simple_mark.size
scale = (size * (1 - 2 * pad_ratio)) / max(w2, h2)
nw, nh = int(w2 * scale), int(h2 * scale)
resized = simple_mark.resize((nw, nh), Image.LANCZOS)
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
canvas.save(os.path.join(PUB, "logo-512-simple.png"))
canvas.save(os.path.join(PUB, "logo-512.webp"), "WEBP")
print("saved simplified mark as logo-512.webp / logo-512-simple.png")
