"""
خطوة 2: قص المناطق المطلوبة بدقة من الأصل، وتطبيق الشفافية محليًا
على كل منطقة على حدة (يحل مشكلة تفاوت إضاءة الخلفية).
"""
from PIL import Image
import numpy as np
import os

SRC = r"C:\Users\musta\Desktop\pro\tour\logo.jpg"
OUT = r"C:\Users\musta\Desktop\pro\tour\_imgtools"

img = Image.open(SRC).convert("RGB")
W, H = img.size
print("full size:", W, H)

def make_transparent(crop_img, low=10, high=45, corner_sample=True):
    arr = np.array(crop_img).astype(int)
    if corner_sample:
        # نجمع عينات من الزوايا الأربعة للمنطقة المقصوصة
        h, w, _ = arr.shape
        s = 6
        corners = np.concatenate([
            arr[0:s, 0:s].reshape(-1, 3),
            arr[0:s, w-s:w].reshape(-1, 3),
            arr[h-s:h, 0:s].reshape(-1, 3),
            arr[h-s:h, w-s:w].reshape(-1, 3),
        ], axis=0)
        bg = corners.mean(axis=0)
    diff = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    alpha = np.clip((diff - low) / (high - low), 0, 1) * 255
    alpha = alpha.astype(np.uint8)
    rgba = np.dstack([arr.astype(np.uint8), alpha])
    out = Image.fromarray(rgba, mode="RGBA")
    a = np.array(out)
    a[a[:, :, 3] < 20, 3] = 0
    return Image.fromarray(a, mode="RGBA"), bg

# --- منطقة الأيقونة بس (بدون نص) ---
# من المعاينة: الأيقونة تقريبًا x:440-960, y:75-430
icon_box = (440, 70, 965, 435)
icon_crop = img.crop(icon_box)
icon_rgba, bg1 = make_transparent(icon_crop)
icon_rgba.save(os.path.join(OUT, "icon_only.png"))
print("icon bg sample:", bg1, "size:", icon_rgba.size)

# --- منطقة الأيقونة + النص (بدون سلوجان) ---
combo_box = (420, 60, 970, 555)
combo_crop = img.crop(combo_box)
combo_rgba, bg2 = make_transparent(combo_crop)
combo_rgba.save(os.path.join(OUT, "icon_and_text.png"))
print("combo bg sample:", bg2, "size:", combo_rgba.size)

# --- اللوجو الكامل شفاف (أيقونة+نص+سلوجان) لو احتجناه ---
full_box = (420, 60, 970, 605)
full_crop = img.crop(full_box)
full_rgba, bg3 = make_transparent(full_crop)
full_rgba.save(os.path.join(OUT, "icon_text_slogan.png"))
print("full combo size:", full_rgba.size)
