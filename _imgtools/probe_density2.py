from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_clean.png').convert('RGBA')
arr = np.array(im)
alpha = arr[:,:,3]
row_density = (alpha > 0).sum(axis=1)
for i in range(495, 570, 2):
    print(i, row_density[i])
