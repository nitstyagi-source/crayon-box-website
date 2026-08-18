from PIL import Image

def make_white_transparent(input_path, output_path, tolerance=200):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # item is (R, G, B, A)
            if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
                # Replace with transparent
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed and saved to {output_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

make_white_transparent('public/logo-downloaded.png', 'public/logo-transparent.png')
