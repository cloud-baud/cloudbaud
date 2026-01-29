from PIL import Image
import numpy as np
import sys

def process_logo():
    try:
        img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo.png').convert('RGBA')
        data = np.array(img)
        alpha = data[:,:,3]
        
        # Projection on X axis
        col_sums = np.sum(alpha, axis=0)
        
        # Find columns where there is significant visible content (sum > threshold)
        # 1536 height. Fully opaque column = 1536 * 255 = ~390k. 
        # Threshold of 1000 sum roughly means "at least 4 pixels are fully opaque" or "many pixels are faint"
        non_empty_cols = np.where(col_sums > 1000)[0]
        
        if len(non_empty_cols) == 0:
            print("Image appears empty")
            return

        print(f"Content spans from {non_empty_cols[0]} to {non_empty_cols[-1]}")
        
        # Identify separate clusters of content separated by gaps
        # A gap is defined as a sequence of empty columns > 20px
        
        clusters = []
        if len(non_empty_cols) > 0:
            current_start = non_empty_cols[0]
            prev_col = non_empty_cols[0]
            
            for col in non_empty_cols[1:]:
                if col - prev_col > 50: # Gap > 50 pixels
                    clusters.append((current_start, prev_col))
                    current_start = col
                prev_col = col
            clusters.append((current_start, prev_col))
            
        print(f"Found {len(clusters)} clusters: {clusters}")
        
        if len(clusters) >= 2:
            # First cluster is likely the icon
            c1_start, c1_end = clusters[0]
            # Add some padding
            crop_box = (c1_start, 0, c1_end + 10, img.height)
            print(f"Cropping icon from {crop_box}")
            
            icon_part = img.crop(crop_box)
            # Trim tight
            bbox = icon_part.getbbox()
            if bbox:
                icon_part = icon_part.crop(bbox)
                
            icon_part.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
            print("Saved d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png")
            
        elif len(clusters) == 1:
            # Maybe no gap found? Or just one big block?
            # If the aspect ratio is wide, force crop the left square
            width = clusters[0][1] - clusters[0][0]
            height = img.height
            if width > height * 1.5:
                print("One big cluster found, but wide aspect ratio. Guessing icon is left 1/3...")
                # Crop first height worth of pixels?
                # Actually, let's look for a dip in density instead of a zero gap?
                # For now, let's just assume square crop from left
                crop_width = int(height * 1.0)
                icon_part = img.crop((0,0, crop_width, height))
                 # Trim tight
                bbox = icon_part.getbbox()
                if bbox:
                    icon_part = icon_part.crop(bbox)
                icon_part.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
                print("Saved d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png (Square Guess)")
            else:
                print("Logo seems to be just the icon already?")
                # Just save it as is
                img.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_logo()
