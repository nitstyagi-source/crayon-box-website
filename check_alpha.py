from PIL import Image

img = Image.open('public/logo-transparent.png').convert("RGBA")
alpha_channel = img.getdata(3)
transparent_pixels = sum(1 for a in alpha_channel if a < 255)
print(f"Transparent pixels: {transparent_pixels} out of {len(alpha_channel)}")
