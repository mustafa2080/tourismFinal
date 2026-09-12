from PIL import Image

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
ASSETS = r"C:\Users\musta\Desktop\pro\tour\frontend\src\assets"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

lockup = Image.open(rf"{BASE}\logo2_icon_wordmark.png").convert("RGBA")
print("source size:", lockup.size)

# Render at a generous height for crisp @2x/@3x retina display at the
# header's max on-screen height (~80px).
target_h = 480
scale = target_h / lockup.size[1]
new_w = int(lockup.size[0] * scale)
header_logo = lockup.resize((new_w, target_h), Image.LANCZOS)
header_logo.save(rf"{ASSETS}\logo.webp", format="WEBP", lossless=True)
print("saved assets/logo.webp", header_logo.size)

header_logo.save(rf"{PUB}\logo.png")
print("saved public/logo.png", header_logo.size)
