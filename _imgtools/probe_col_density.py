from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_wordmark.png').convert('RGBA')
arr = np.array(im)
alpha = arr[:,:,3]

# check column density to see actual horizontal content span
col_density = (alpha > 0).sum(axis=0)
nonzero_cols = np.where(col_density > 0)[0]
print("width:", im.size[0], "content spans cols:", nonzero_cols.min(), "to", nonzero_cols.max())
print("tight width would be:", nonzero_cols.max() - nonzero_cols.min())
