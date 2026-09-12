from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\musta\Desktop\pro\tour\_imgtools\logo3_transparent_raw.png").convert("RGBA")
arr = np.array(im)
alpha = arr[:, :, 3]
h, w = alpha.shape

# Column density profile to find the gap between icon (left cluster) and
# "Travluyo" wordmark (right cluster).
col_density = (alpha > 20).sum(axis=0)
nonzero_cols = np.where(col_density > 0)[0]
print("content x-range:", nonzero_cols.min(), nonzero_cols.max())

# scan for the minimum-density column in the middle region (the gap)
mid_lo, mid_hi = int(w * 0.30), int(w * 0.48)
window = col_density[mid_lo:mid_hi]
min_idx = window.argmin()
split_col = mid_lo + min_idx
print("split col:", split_col, "density there:", col_density[split_col])

# icon bbox = content left of split_col
icon_mask_cols = np.zeros_like(col_density, dtype=bool)
icon_mask_cols[:split_col] = True
icon_alpha = alpha.copy()
icon_alpha[:, split_col:] = 0
rows_nonzero = np.where((icon_alpha > 20).any(axis=1))[0]
cols_nonzero = np.where((icon_alpha > 20).any(axis=0))[0]
top, bottom = rows_nonzero.min(), rows_nonzero.max()
left, right = cols_nonzero.min(), cols_nonzero.max()
print("icon bbox:", (left, top, right, bottom))

pad = 4
left = max(0, left - pad)
top = max(0, top - pad)
right = min(w, right + pad)
bottom = min(h, bottom + pad)

icon_crop = im.crop((left, top, right, bottom))
icon_crop.save(r"C:\Users\musta\Desktop\pro\tour\_imgtools\logo3_icon_only.png")
print("saved icon crop", icon_crop.size, "aspect", icon_crop.size[0]/icon_crop.size[1])
