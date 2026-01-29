from PIL import Image
import numpy as np

def extract_icon_simple():
    try:
        img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo.png').convert('RGBA')
        
        # 1. Get bbox to trim empty space around the whole logo
        bbox = img.getbbox()
        if not bbox:
            print("Image is empty")
            return
        
        print(f"BBox: {bbox}")
        img_cropped = img.crop(bbox)
        
        # 2. Extract the icon.
        # It's on the left.
        # Let's assume the icon is roughly square-ish or followed by a gap.
        # Height of the content:
        height = img_cropped.height
        
        # Check column sums to find the gap
        data = np.array(img_cropped)
        alpha = data[:,:,3]
        col_sums = np.sum(alpha, axis=0)
        
        # Find the first column where sum drops to near zero after a block of content
        # Ignore the first few columns in case of noise
        
        start_scan = 50
        gap_found = False
        split_col = height # Default to square crop if no gap found
        
        # Look for a gap of at least 10 pixels wide where density is very low
        for i in range(start_scan, len(col_sums) - 20):
            # Check if this column and next 10 are empty
            if np.sum(col_sums[i:i+10]) < 1000: # Low density window
                # Ensure we had content before this
                if np.sum(col_sums[i-50:i]) > 10000:
                    split_col = i
                    gap_found = True
                    print(f"Found gap at {split_col}")
                    break
        
        if not gap_found:
             print("No clear gap found. Using height as width (square crop).")
             split_col = int(height * 1.1)
             
        # specific fix: if split_col is too wide, cap it
        if split_col > height * 1.5:
            split_col = int(height * 1.5)
            
        print(f"Cropping 0 to {split_col}")
        
        icon = img_cropped.crop((0, 0, split_col, height))
        
        # Trim the icon itself
        icon_bbox = icon.getbbox()
        if icon_bbox:
            icon = icon.crop(icon_bbox)
            
        icon.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
        print("Saved cloudbaud_icon.png")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_icon_simple()
