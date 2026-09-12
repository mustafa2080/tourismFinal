from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean.png').convert('RGBA')
arr = np.array(im)

split_row = 665  # icon + "travluy" wordmark, excludes the slogan line

lockup = Image.fromarray(arr[:split_row, :, :], mode='RGBA')
bbox = lockup.getbbox()
pad = 8
if bbox:
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(lockup.width, right + pad)
    bottom = min(lockup.height, bottom + pad)
    lockup = lockup.crop((left, top, right, bottom))

lockup.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_wordmark.png')
print("icon+wordmark size:", lockup.size, "aspect ratio:", lockup.size[0]/lockup.size[1])
