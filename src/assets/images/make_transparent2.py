import sys
from PIL import Image

def remove_white_background(input_path, output_path, tolerance=200):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Simple approach: if pixel is white or very light gray, make it transparent
            if r >= tolerance and g >= tolerance and b >= tolerance:
                pixels[x, y] = (r, g, b, 0)
                
    img.save(output_path, "PNG")
    print(f"Processed {input_path} and saved to {output_path}")

if __name__ == '__main__':
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    remove_white_background(input_file, output_file)
