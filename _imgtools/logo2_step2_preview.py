from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_transparent_raw.png')
im.thumbnail((400, 400))

# Composite over a mid-gray backdrop so we can see edges/artifacts clearly
bg = Image.new('RGB', im.size, (100, 100, 100))
bg.paste(im, (0,0), im)
bg.save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_preview_check.jpg', quality=85)
print("done", im.size)
