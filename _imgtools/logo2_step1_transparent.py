from PIL import Image
import numpy as np

src = r'C:\Users\musta\Desktop\pro\tour\logo2.jpg'
im = Image.open(src).convert('RGB')
arr = np.array(im).astype(int)

r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Checkerboard = near-grayscale (r~g~b) AND within the two known gray bands
is_grayish = (np.abs(r-g) < 8) & (np.abs(g-b) < 8) & (np.abs(r-b) < 8)
in_light_band = (arr[:,:,0] >= 215) & (arr[:,:,0] <= 245)
in_dark_band  = (arr[:,:,0] >= 175) & (arr[:,:,0] <= 205)
is_checker = is_grayish & (in_light_band | in_dark_band)

alpha = np.where(is_checker, 0, 255).astype(np.uint8)

rgba = np.dstack([arr.astype(np.uint8), alpha])
out = Image.fromarray(rgba, mode='RGBA')
out.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_transparent_raw.png')
print("Saved raw transparent version:", out.size)
