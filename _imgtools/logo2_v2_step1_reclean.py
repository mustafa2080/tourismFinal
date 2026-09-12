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
full = Image.fromarray(rgba, mode='RGBA')

# Tight crop to full content first (icon + text + slogan), same as before
bbox = full.getbbox()
print("full content bbox:", bbox, "size:", full.size)
full.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean_v2.png')

# Now analyze row density precisely to find the EXACT gap between
# the icon artwork and the "travluy" text, using a much finer scan.
arr2 = np.array(full)
alpha2 = arr2[:,:,3]
row_density = (alpha2 > 0).sum(axis=1)
h = full.size[1]
# print every single row from 550 to 720 to find exact gap boundaries
for i in range(540, 730):
    if row_density[i] < 5:
        print("near-empty row:", i, row_density[i])
