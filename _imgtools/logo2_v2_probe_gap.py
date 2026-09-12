from PIL import Image
import numpy as np

full = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean_v2.png').convert('RGBA')
arr2 = np.array(full)
alpha2 = arr2[:,:,3]
row_density = (alpha2 > 0).sum(axis=1)
h = full.size[1]
for i in range(540, 730, 3):
    print(i, row_density[i])
