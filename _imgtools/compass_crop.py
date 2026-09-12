from PIL import Image
import numpy as np
import os

SRC = r"C:\Users\musta\Desktop\pro\tour\logo.jpg"
OUT = r"C:\Users\musta\Desktop\pro\tour\_imgtools"

img = Image.open(SRC).convert("RGB")

# البوصلة/النجمة الذهبية بس - من الأصل
compass_box = (560, 100, 770, 310)
crop = img.crop(compass_box)
arr = np.array(crop).astype(int)
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
alpha = np.clip((diff - 10) / (45 - 10), 0, 1) * 255
rgba = np.dstack([arr.astype(np.uint8), alpha.astype(np.uint8)])
out = Image.fromarray(rgba, "RGBA")
a = np.array(out)
a[a[:, :, 3] < 20, 3] = 0
out = Image.fromarray(a, "RGBA")
out.save(os.path.join(OUT, "compass_only.png"))
print("saved compass_only.png", out.size, "bg:", bg)
