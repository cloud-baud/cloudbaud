import sys
from PIL import Image

def remove_black_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Use brightness to determine alpha
            luminance = max(r, g, b)
            
            if luminance == 0:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # To prevent a dark halo, we un-multiply the alpha from the color channels
                # Assuming the image was composed on a black background
                # Original Color = Foreground * Alpha + Black * (1 - Alpha)
                # Color = Foreground * Alpha -> Foreground = Color / Alpha
                
                alpha = luminance
                
                new_r = min(255, int(r * 255 / alpha)) if alpha > 0 else 0
                new_g = min(255, int(g * 255 / alpha)) if alpha > 0 else 0
                new_b = min(255, int(b * 255 / alpha)) if alpha > 0 else 0
                
                pixels[x, y] = (new_r, new_g, new_b, alpha)
                
    img.save(output_path, "PNG")
    print(f"Processed {input_path} and saved to {output_path}")

if __name__ == '__main__':
    remove_black_background('CB_logo.png', 'CB_logo_transparent.png')
