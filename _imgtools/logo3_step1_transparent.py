from PIL import Image, ImageFilter
import numpy as np

im = Image.open(r"C:\Users\musta\Desktop\pro\tour\logo3.jpg").convert("RGB")
arr = np.array(im).astype(np.float32) / 255.0
h, w, _ = arr.shape

mx = arr.max(axis=2)
mn = arr.min(axis=2)
sat = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
val = mx

fg_by_sat = sat > 0.10
fg_by_dark = val < 0.55
fg = (fg_by_sat | fg_by_dark).astype(np.uint8) * 255

mask_img = Image.fromarray(fg, mode="L")
# smooth the mask edges slightly for anti-aliasing (avoid jagged hard edges)
mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=1.2))

rgba = np.dstack([np.array(im), np.array(mask_img)])
out = Image.fromarray(rgba, mode="RGBA")
out.save(r"C:\Users\musta\Desktop\pro\tour\_imgtools\logo3_transparent_raw.png")
print("saved", out.size)
