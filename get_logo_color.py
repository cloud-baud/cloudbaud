from PIL import Image

def get_colors():
    img = Image.open('src/assets/images/CB_logo_transparent.png').convert('RGBA')
    colors = img.getcolors(img.width * img.height)
    # Filter out transparent pixels and sort by frequency
    solid_colors = sorted([(count, color) for count, color in colors if color[3] > 200], reverse=True)
    # find the most common non-black/white colors
    for count, color in solid_colors[:10]:
        r, g, b, _ = color
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        print(f"Count: {count}, Color: rgb({r}, {g}, {b}) -> {hex_color}")

if __name__ == "__main__":
    get_colors()
