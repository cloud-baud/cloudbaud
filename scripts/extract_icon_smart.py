from PIL import Image
import numpy as np
import sys

def intelligent_extract():
    try:
        img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo.png').convert('RGBA')
        
        # 1. Crop to Content
        bbox = img.getbbox()
        if not bbox:
            print("Image is empty")
            return
            
        print(f"Original BBox: {bbox}")
        # Crop
        img_cropped = img.crop(bbox)
        
        # 2. Analyze X-axis density of Cropped Image
        data = np.array(img_cropped)
        alpha = data[:,:,3]
        col_sums = np.sum(alpha, axis=0)
        
        # Find split point
        # Heuristic: Look for a "valley" in density after the first "peak" block
        # The icon is usually the first block.
        # Let's assume the icon won't be wider than it is tall (aspect Ratio ~ 1:1)
        
        height = img_cropped.height
        max_icon_width = int(height * 1.2) 
        
        # Only look for split points within the first max_icon_width + padding
        search_region = col_sums[:min(len(col_sums), int(height * 1.5))]
        
        # We need a valley. 
        # Smooth data first?
        # Simple approach: Find the index with minimum sum in the range [0.3*height, 1.5*height]
        # Avoid the very start (sometimes hollow icons start slow)
        
        start_search = int(height * 0.3)
        end_search = len(search_region)
        
        if start_search < end_search:
            # Find min density in this region
            min_val = np.min(col_sums[start_search:end_search])
            split_idx = np.where(col_sums[start_search:end_search] == min_val)[0][0] + start_search
            
            print(f"Split candidate at: {split_idx} (Value: {min_val})")
            
            # If the valley is "low enough" (relative to peak), cut there.
            # Or just cut blindly if no clear valley?
            
            # Let's save a "debug" crop just to see
            icon_candidate = img_cropped.crop((0, 0, split_idx, height))
             # Trim
            c_bbox = icon_candidate.getbbox()
            if c_bbox:
                icon_candidate = icon_candidate.crop(c_bbox)
            icon_candidate.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
            print("Saved cloudbaud_icon.png based on density valley")
        else:
            print("Image too narrow to split? Saving cropped original as icon.")
            img_cropped.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    intelligent_extract()
