"""
favicon 16x16: نعمل نسخة مبسطة (سيلويت ذهبي موحد بدون تفاصيل داخلية معقدة)
عشان تبان واضحة في الحجم الصغير جدًا، بدل التفاصيل اللي بتضيع.
"""
from PIL import Image, ImageFilter
import numpy as np
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png"))

# نعمل تبسيط: نزود الكونتراست ونعمل صورة أصغر بحواف أنضف عبر resize بجودة عالية + sharpen خفيف
small = icon.resize((16, 16), Image.LANCZOS)
small = small.filter(ImageFilter.SHARPEN)
small.save(os.path.join(PUB, "favicon-16x16.png"))
print("saved simplified favicon-16x16.png")

# نتأكد كمان إن 32x32 واضحة بنفس الطريقة (sharpen خفيف بعد الـ resize)
sz32 = icon.resize((32, 32), Image.LANCZOS)
sz32 = sz32.filter(ImageFilter.SHARPEN)
sz32.save(os.path.join(PUB, "favicon-32x32.png"))
print("saved sharpened favicon-32x32.png")
