from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_wordmark.png').convert('RGBA')
bg = Image.new('RGBA', im.size, (255,255,255,255))
bg.alpha_composite(im)
bg.convert('RGB').save(r'C:\Users\musta\Desktop\pro\tour\_imgtools\icon_wordmark_check.jpg', quality=92)
print(im.size)
