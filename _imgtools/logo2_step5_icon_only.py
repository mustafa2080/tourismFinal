from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean.png').convert('RGBA')
arr = np.array(im)
h, w = arr.shape[0], arr.shape[1]

# Icon (compass/yacht/buggy) ends around row ~518; wordmark starts after.
split_row = 518

icon = Image.fromarray(arr[:split_row, :, :], mode='RGBA')
bbox = icon.getbbox()
pad = 10
if bbox:
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(icon.width, right + pad)
    bottom = min(icon.height, bottom + pad)
    icon = icon.crop((left, top, right, bottom))

icon.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_only.png')
print("icon size:", icon.size)
