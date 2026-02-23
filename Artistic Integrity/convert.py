import os
from PIL import Image

INPUT_FOLDER = "menu_uncropped"
OUTPUT_FOLDER = "Menu"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def crop_transparent(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")

    # Get alpha channel
    alpha = img.split()[3]

    # Get bounding box of non-transparent pixels
    bbox = alpha.getbbox()

    if bbox:
        cropped = img.crop(bbox)
        cropped.save(output_path)
        print(f"Cropped: {image_path}")
    else:
        print(f"Skipped (fully transparent): {image_path}")

for filename in os.listdir(INPUT_FOLDER):
    if filename.lower().endswith(".png"):
        input_path = os.path.join(INPUT_FOLDER, filename)
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        crop_transparent(input_path, output_path)

print("Done.")