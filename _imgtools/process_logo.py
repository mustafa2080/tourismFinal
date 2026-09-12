"""
معالجة لوجو travluyo:
1) شفافية الخلفية البيج
2) قص الأيقونة لوحدها (بدون نص/سلوجان)
3) قص الأيقونة + النص (بدون سلوجان)
4) توليد أحجام: favicon 512/192/32, header logo, og-image
"""
from PIL import Image
import numpy as np
import os

SRC = r"C:\Users\musta\Desktop\pro\tour\logo.jpg"
OUT = r"C:\Users\musta\Desktop\pro\tour\_imgtools"

img = Image.open(SRC).convert("RGB")
print("size:", img.size)

arr = np.array(img).astype(int)

# لون الخلفية تقريبي (بيج فاتح) - ناخده من زاوية الصورة
bg_sample = arr[5:15, 5:15].reshape(-1, 3).mean(axis=0)
print("bg color approx:", bg_sample)

# نحسب المسافة اللونية لكل بكسل عن لون الخلفية
diff = np.sqrt(((arr - bg_sample) ** 2).sum(axis=2))

# alpha: كل ما البكسل قريب من لون الخلفية كل ما يبقى شفاف أكتر
# threshold ناعم (soft) عشان نحافظ على حواف ناعمة للعناصر الذهبية/الزرقاء
low, high = 14, 55
alpha = np.clip((diff - low) / (high - low), 0, 1) * 255
alpha = alpha.astype(np.uint8)

rgba = np.dstack([arr.astype(np.uint8), alpha])
out_img = Image.fromarray(rgba, mode="RGBA")

# تنظيف إضافي: أي بكسل شبه شفاف تمامًا خليه شفاف كامل (يشيل بقايا التدرج)
a = np.array(out_img)
mask_faint = a[:, :, 3] < 25
a[mask_faint, 3] = 0
out_img = Image.fromarray(a, mode="RGBA")

out_img.save(os.path.join(OUT, "logo_transparent_full.png"))
print("saved transparent full")
