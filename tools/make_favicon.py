"""Generate favicon files from the DG logo."""
from PIL import Image

logo = Image.open(r"C:\Users\nicho\clawd\projects\dawngamesapp.com\logo.png").convert("RGBA")
out_dir = r"C:\Users\nicho\clawd\projects\dawngamesapp.com"

# favicon.png (32x32)
favicon_32 = logo.resize((32, 32), Image.LANCZOS)
favicon_32.save(f"{out_dir}/favicon.png")

# favicon-192.png (for Android/PWA)
favicon_192 = logo.resize((192, 192), Image.LANCZOS)
favicon_192.save(f"{out_dir}/favicon-192.png")

# apple-touch-icon (180x180)
favicon_180 = logo.resize((180, 180), Image.LANCZOS)
favicon_180.save(f"{out_dir}/apple-touch-icon.png")

# og-image (1200x630 with logo centered on dark bg)
og = Image.new("RGBA", (1200, 630), (10, 10, 12, 255))
logo_resized = logo.resize((400, 400), Image.LANCZOS)
x = (1200 - 400) // 2
y = (630 - 400) // 2
og.paste(logo_resized, (x, y), logo_resized)
og.save(f"{out_dir}/og-image.png")

# .ico file (multi-size)
ico_16 = logo.resize((16, 16), Image.LANCZOS)
ico_32 = logo.resize((32, 32), Image.LANCZOS)
ico_48 = logo.resize((48, 48), Image.LANCZOS)
ico_16.save(f"{out_dir}/favicon.ico", format="ICO", sizes=[(16,16), (32,32), (48,48)], 
            append_images=[ico_32, ico_48])

print("All favicons + OG image generated")
