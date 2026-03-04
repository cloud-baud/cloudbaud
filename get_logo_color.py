from PIL import Image
import colorsys

def get_accent_colors():
    img = Image.open('src/assets/images/CB_logo_transparent.png').convert('RGBA')
    colors = img.getcolors(img.width * img.height)
    
    candidates = []
    for count, (r, g, b, a) in colors:
        if a > 200:
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            if s > 0.4 and v > 0.4:
                # Calculate a "score" to find the most prominent bright saturated color
                # favoring quantity, saturation, and brightness
                score = count * (s ** 2) * v
                candidates.append((score, count, r, g, b, h, s, v))
                
    candidates.sort(reverse=True)
    
    for score, count, r, g, b, h, s, v in candidates[:10]:
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        print(f"Score: {score:.1f}, count: {count}, rgb({r}, {g}, {b}) -> {hex_color} (H: {h:.2f}, S: {s:.2f}, V: {v:.2f})")

if __name__ == "__main__":
    get_accent_colors()
