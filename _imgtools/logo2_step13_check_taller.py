from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\_imgtools\logo2_icon_wordmark.png').convert('RGBA')

for h, label in [(80, 'h20_full_header'), (72, 'h18'), (64, 'h16')]:
    scale = h / im.size[1]
    w = int(im.size[0] * scale)
    small = im.resize((w, h), Image.LANCZOS)
    bg = Image.new('RGBA', (w, h), (255,255,255,255))
    bg.alpha_composite(small)
    view = bg.resize((w*4, h*4), Image.NEAREST)
    view.convert('RGB').save(rf'C:\Users\musta\Desktop\pro\tour\_imgtools\wordmark_check_{label}.jpg', quality=95)
    print(label, "actual size", (w,h))
