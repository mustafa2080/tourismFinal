from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_only_v2.png').convert('RGBA')

for bg_color, name in [((30,41,59,255), 'dark'), ((255,255,255,255), 'light')]:
    bg = Image.new('RGBA', im.size, bg_color)
    bg.alpha_composite(im)
    bg.convert('RGB').save(rf'C:\Users\musta\Desktop\pro\tour\_imgtools\icon_v2_check_{name}.jpg', quality=92)
print(im.size)
