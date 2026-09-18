"""Mechanical website exports of the owner's exact logo; no redrawing or AI generation.

Keep the original JPEG untouched. Crop only empty margins / existing lockup parts,
resize with Lanczos, and letterbox the existing DG mark for small platform icons.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
folder = root / 'assets' / 'brand'
with Image.open(folder / 'dawn-games-master.jpg') as source:
    source = source.convert('RGB')
    scale_x, scale_y = source.width / 1280, source.height / 853
    def crop(box):
        return source.crop(tuple(round(v * (scale_x if i % 2 == 0 else scale_y)) for i, v in enumerate(box)))
    full = crop((140, 160, 1140, 660))
    mark = crop((228, 170, 1050, 505))
    # Atomic replacement protects the previous asset if the machine runs low on memory.
    logo_pending = root / 'assets' / 'brand' / 'logo-export-pending.png'
    full.save(logo_pending, compress_level=6)
    logo_pending.replace(root / 'logo.png')
    full.resize((640, 320), Image.Resampling.LANCZOS).save(folder / 'dawn-games-full.webp', quality=92, method=6)
    mark.resize((400, 163), Image.Resampling.LANCZOS).save(folder / 'dawn-games-dg.webp', quality=92, method=6)
    def icon(size):
        canvas = Image.new('RGB', (size, size), '#050505')
        fitted = mark.copy()
        fitted.thumbnail((round(size * .9), round(size * .9)), Image.Resampling.LANCZOS)
        canvas.paste(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
        return canvas
    icon(256).save(root / 'favicon.png', optimize=True)
    icon(192).save(root / 'favicon-192.png', optimize=True)
    icon(180).save(root / 'apple-touch-icon.png', optimize=True)
    icon(64).save(root / 'favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64)])
print('Owner logo exported: full lockup, DG mark, favicon and touch icons. Master preserved.')
