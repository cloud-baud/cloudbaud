from PIL import Image
import colorsys

def tint_image(src_path, dest_path, target_hex):
    # target_hex like '#00d2ff'
    target_r = int(target_hex[1:3], 16)
    target_g = int(target_hex[3:5], 16)
    target_b = int(target_hex[5:7], 16)
    t_h, t_s, t_v = colorsys.rgb_to_hsv(target_r/255.0, target_g/255.0, target_b/255.0)

    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
                # We only want to tint the cyan-ish "C" part, or everything?
                # The logo might be mostly cyan anyway, let's just force hue and sat, preserve V
                # actually, preserve a bit of original lightness using V
                
                # To match 00d2ff, we should push hue to t_h and sat to t_s, and map v
                new_h = t_h
                new_s = min(1.0, s * 1.5) # boost saturation
                
                # If we just force hue and saturation to the target
                _, g_new, b_new = colorsys.hsv_to_rgb(new_h, t_s, v)
                r_new, g_new, b_new = colorsys.hsv_to_rgb(new_h, t_s, v) # or t_v
                
                # We can do a blend to be safe, but let's just force hue/sat.
                pixels[x, y] = (int(r_new * 255), int(g_new * 255), int(b_new * 255), a)

    img.save(dest_path, "PNG")

if __name__ == "__main__":
    tint_image('src/assets/images/CB_logo_transparent.png', 'src/assets/images/CB_logo_transparent.png', '#00d2ff')
