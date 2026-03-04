"""Remove the black area outside the rounded rectangle logo, keep the inside intact."""
from PIL import Image
import queue

input_path = r"C:\Users\nicho\.clawdbot\media\inbound\a11f14ce-86f3-4f69-94a8-b9f49287acc6.png"
output_path = r"C:\Users\nicho\clawd\projects\dawngamesapp.com\logo.png"

img = Image.open(input_path).convert("RGBA")
pixels = img.load()
w, h = img.size

# Flood fill from all edges - any pixel that's very dark (near black) and connected to the edge
threshold = 30  # pixels with R,G,B all below this are "black"
visited = set()
q = queue.Queue()

# Seed from all edge pixels
for x in range(w):
    q.put((x, 0))
    q.put((x, h - 1))
for y in range(h):
    q.put((0, y))
    q.put((w - 1, y))

while not q.empty():
    x, y = q.get()
    if (x, y) in visited:
        continue
    if x < 0 or x >= w or y < 0 or y >= h:
        continue
    visited.add((x, y))
    
    r, g, b, a = pixels[x, y]
    if r < threshold and g < threshold and b < threshold:
        pixels[x, y] = (0, 0, 0, 0)
        # Check neighbors
        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                q.put((nx, ny))

img.save(output_path)
print(f"Done - saved to {output_path} ({w}x{h})")
