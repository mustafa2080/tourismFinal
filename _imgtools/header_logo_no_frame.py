"""
دلوقتي هنشيل الإطار المربع من الـ Header، فالصورة هتتحط بـ height ثابت وwidth تلقائي.
يبقى محتاجين logo.png يبقى الأيقونة نفسها بأقل padding ممكن (crop شبه طبيعي)
عشان تملأ المساحة كويس وتبقى واضحة، مش مربع فيه فراغ كبير حواليها.
"""
from PIL import Image
import numpy as np
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png")).convert("RGBA")

# نقص أي هامش شفاف زايد حوالين الشكل نفسه (auto-crop على الـ alpha channel)
arr = np.array(icon)
alpha = arr[:, :, 3]
ys, xs = np.where(alpha > 15)
top, bottom = ys.min(), ys.max()
left, right = xs.min(), xs.max()
pad = 4  # هامش بسيط جدًا بالبكسل
top = max(0, top - pad)
left = max(0, left - pad)
bottom = min(arr.shape[0], bottom + pad)
right = min(arr.shape[1], right + pad)

trimmed = icon.crop((left, top, right, bottom))
trimmed.save(os.path.join(PUB, "logo.png"))
print("saved tightly-cropped logo.png for header (no square frame)", trimmed.size)
