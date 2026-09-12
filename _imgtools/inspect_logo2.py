from PIL import Image
import numpy as np

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\logo2.jpg').convert('RGB')
arr = np.array(im).astype(int)

# Sample some background-looking pixels near the corners to find the checkerboard tones
corners = [arr[0,0], arr[0,-1], arr[-1,0], arr[-1,-1], arr[5,5], arr[5,-5]]
print("Corner samples:", corners)

# Find unique colors in a strip along the top (should be mostly checkerboard)
strip = arr[0:30, 0:30].reshape(-1, 3)
uniq, counts = np.unique(strip, axis=0, return_counts=True)
order = np.argsort(-counts)
for i in order[:10]:
    print(uniq[i], counts[i])
