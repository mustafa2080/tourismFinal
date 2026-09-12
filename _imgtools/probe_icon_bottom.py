from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_only.png').convert('RGBA')
arr = np.array(im)
print("size:", im.size)

alpha = arr[:,:,3]
row_density = (alpha > 0).sum(axis=1)
h = im.size[1]
for i in range(h-40, h, 2):
    print(i, row_density[i])
