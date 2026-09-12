from PIL import Image
import os

BASE = r"C:\Users\musta\Desktop\pro\tour\_imgtools"
PUB = r"C:\Users\musta\Desktop\pro\tour\frontend\public"

icon = Image.open(os.path.join(BASE, "icon_only.png"))

size = 512
pad_ratio = 0.16
w, h = icon.size
scale = (size * (1 - 2 * pad_ratio)) / max(w, h)
nw, nh = int(w * scale), int(h * scale)
resized = icon.resize((nw, nh), Image.LANCZOS)
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
canvas.save(os.path.join(PUB, "logo.png"))
print("saved header logo.png with wider padding", canvas.size)
