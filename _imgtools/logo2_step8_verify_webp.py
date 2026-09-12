from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\frontend\src\assets\logo.webp').convert('RGBA')
print("mode:", im.mode, "size:", im.size)

for bg_color, name in [((30,41,59,255), 'dark'), ((255,255,255,255), 'light')]:
    bg = Image.new('RGBA', im.size, bg_color)
    bg.alpha_composite(im)
    bg.convert('RGB').save(rf'C:\Users\musta\Desktop\pro\tour\_imgtools\final_check_{name}.jpg', quality=92)
print("done")
