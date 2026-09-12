from PIL import Image, ImageFilter
import numpy as np

src = r'C:\Users\musta\Desktop\pro\tour\logo2.jpg'
im = Image.open(src).convert('RGB')
arr = np.array(im).astype(int)

r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

is_grayish = (np.abs(r-g) < 10) & (np.abs(g-b) < 10) & (np.abs(r-b) < 10)
in_light_band = (arr[:,:,0] >= 210) & (arr[:,:,0] <= 248)
in_dark_band  = (arr[:,:,0] >= 170) & (arr[:,:,0] <= 210)
is_checker = (is_grayish & (in_light_band | in_dark_band)).astype(np.uint8) * 255

mask_img = Image.fromarray(is_checker, mode='L')
dilated = mask_img.filter(ImageFilter.MaxFilter(size=3))
closed = dilated.filter(ImageFilter.MinFilter(size=3))
smoothed = closed.filter(ImageFilter.MedianFilter(size=3))

alpha = 255 - np.array(smoothed)

rgba = np.dstack([arr.astype(np.uint8), alpha.astype(np.uint8)])
out = Image.fromarray(rgba, mode='RGBA')

bbox = out.getbbox()
pad = 15
if bbox:
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(out.width, right + pad)
    bottom = min(out.height, bottom + pad)
    out = out.crop((left, top, right, bottom))

out.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean.png')
print("Saved cleaned + cropped:", out.size)
