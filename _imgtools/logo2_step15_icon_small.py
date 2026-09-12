from PIL import Image

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
ASSETS = r"C:\Users\musta\Desktop\pro\tour\frontend\src\assets"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(rf"{BASE}\logo2_icon_only.png").convert("RGBA")
print("icon source size:", icon.size)

# Smaller header icon (text will sit beside it again), sized for
# crisp retina at header display height (~44-56px).
target_h = 220
scale = target_h / icon.size[1]
new_w = int(icon.size[0] * scale)
header_logo = icon.resize((new_w, target_h), Image.LANCZOS)
header_logo.save(rf"{ASSETS}\logo.webp", format="WEBP", lossless=True)
print("saved assets/logo.webp", header_logo.size)

header_logo.save(rf"{PUB}\logo.png")
print("saved public/logo.png", header_logo.size)
