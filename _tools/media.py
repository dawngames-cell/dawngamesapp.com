"""Optimize owned, existing artwork only; original files are preserved."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
out = root / 'assets' / 'media'
out.mkdir(parents=True, exist_ok=True)
for size in (640, 1024):
    with Image.open(root / 'assets' / 'hero_dawn_upon_us.jpg') as image:
        image.thumbnail((size, size * 2), Image.Resampling.LANCZOS)
        image.convert('RGB').save(out / f'dawn-world-{size}.webp', quality=85, method=6)
for original, target, limit in (
    ('assets/watch_poster.jpg', 'watch-poster', 900),
    ('assets/dawn_poster.jpg', 'dawn-poster', 900),
    ('blockdrop-icon.png', 'block-drop', 256),
    ('just-right-icon.png', 'just-right', 256),
    ('logo.png', 'legacy-mark', 256),
):
    with Image.open(root / original) as image:
        image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        image.save(out / f'{target}.webp', quality=86, method=6)
        print(target, image.size)
for index in range(1, 7):
    with Image.open(root / f'screenshot_{index}.png') as image:
        image.thumbnail((600, 1300), Image.Resampling.LANCZOS)
        image.save(out / f'app-screen-{index}.webp', quality=82, method=6)
print('Optimized existing site artwork. No generated gameplay images.')
dimensions = {}
for image_path in list(root.glob('*.png')) + list((root / 'assets').rglob('*.jpg')) + list(out.glob('*.webp')):
    with Image.open(image_path) as image:
        dimensions['/' + image_path.relative_to(root).as_posix()] = list(image.size)
(root / '_content' / 'media-dimensions.json').write_text(json.dumps(dimensions, indent=2) + '\n', encoding='utf8')
