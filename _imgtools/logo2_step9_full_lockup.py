from PIL import Image

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
ASSETS = r"C:\Users\musta\Desktop\pro\tour\frontend\src\assets"

full = Image.open(rf"{BASE}\logo2_clean.png").convert("RGBA")
print("full logo size:", full.size)

# Header display height target ~ 56-64px on desktop (h-14/h-16).
# Full logo (icon+text+slogan) is roughly square (758x756-ish aspect),
# so at that height the width would only be ~60-70px - too small to
# read "travluy" and the slogan clearly. Instead we render it a bit
# taller (like a vertical lockup) so the wordmark stays legible.
target_h = 400
scale = target_h / full.size[1]
new_w = int(full.size[0] * scale)
resized = full.resize((new_w, target_h), Image.LANCZOS)
resized.save(rf"{ASSETS}\logo-full.webp", format="WEBP", lossless=True)
print("saved logo-full.webp", resized.size)
