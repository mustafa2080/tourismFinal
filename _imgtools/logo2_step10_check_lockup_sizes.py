from PIL import Image

im = Image.open(r'C:\Users\musta\Desktop\pro\tour\frontend\src\assets\logo-full.webp').convert('RGBA')

# Simulate actual header display sizes to judge legibility
for h, label in [(64, 'h16_desktop'), (48, 'h12_tablet'), (40, 'h10_mobile')]:
    scale = h / im.size[1]
    w = int(im.size[0] * scale)
    small = im.resize((w, h), Image.LANCZOS)
    bg = Image.new('RGBA', (w, h), (255,255,255,255))
    bg.alpha_composite(small)
    # upscale x4 for viewing clarity (nearest, to see actual pixels)
    view = bg.resize((w*4, h*4), Image.NEAREST)
    view.convert('RGB').save(rf'C:\Users\musta\Desktop\pro\tour\_imgtools\lockup_check_{label}.jpg', quality=95)
    print(label, "actual size", (w,h))
