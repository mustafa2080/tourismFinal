from PIL import Image
import numpy as np

full = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean_v2.png').convert('RGBA')
arr = np.array(full)

# Find exact row of minimum density in the 600-660 gap zone
alpha = arr[:,:,3]
row_density = (alpha > 0).sum(axis=1)
zone = row_density[600:660]
min_offset = np.argmin(zone)
split_row = 600 + min_offset
print("split row (min density):", split_row, "density:", row_density[split_row])

icon = Image.fromarray(arr[:split_row, :, :], mode='RGBA')
bbox = icon.getbbox()
print("icon-only bbox before pad:", bbox)
pad = 6
if bbox:
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(icon.width, right + pad)
    bottom = min(icon.height, bottom + pad)
    icon = icon.crop((left, top, right, bottom))

icon.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_only_v2.png')
print("final icon size:", icon.size, "aspect (w/h):", icon.size[0]/icon.size[1])
