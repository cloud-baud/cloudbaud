from PIL import Image
import numpy as np

def extract_from_solid():
    try:
        # Load the solid backup
        img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo_solid_backup.png').convert('RGB')
        
        # Determine content by looking for non-black pixels
        # Threshold: > 30 in any channel
        data = np.array(img)
        # Create a mask of "bright" pixels
        mask = np.any(data > 30, axis=2)
        
        # Projection on X (columns)
        col_sums = np.sum(mask, axis=0) # count of bright pixels in each column
        
        # Find start and end of content
        non_empty = np.where(col_sums > 0)[0]
        if len(non_empty) == 0:
            print("Solid image appears all black?")
            return
            
        start_x = non_empty[0]
        end_x = non_empty[-1]
        print(f"Content X range: {start_x} to {end_x}")
        
        # Find the gap
        # Look for a valley in col_sums between start_x and acceptable width
        # Icon is usually first block.
        
        # Smooth the profile
        profile = col_sums[start_x:end_x]
        
        # Simple gap search: sequence of columns with very low bright pixel count
        # Scan from start_x + 50
        
        split_x = end_x # Default to full width
        
        for i in range(start_x + 50, end_x - 50):
            # Check a window of 20 pixels
            window_sum = np.sum(col_sums[i:i+20])
            if window_sum < 10: # Almost no bright pixels in this vertical strip
                 # Verify we are physically far enough along (e.g. at least 10% of height) to be past the first stroke
                 if i > start_x + (img.height * 0.2):
                    split_x = i
                    print(f"Found gap/split at {split_x}")
                    break
        
        # Crop the icon part (still solid background)
        icon_solid = img.crop((start_x, 0, split_x, img.height))
        
        # Trim vertical whitespace (top/bottom black)
        # Re-calculate mask for this crop
        icon_data = np.array(icon_solid)
        icon_mask = np.any(icon_data > 30, axis=2)
        rows = np.any(icon_mask, axis=1)
        cols = np.any(icon_mask, axis=0)
        rmTt, rmBb = np.where(rows)[0][[0, -1]]
        cmLl, cmRr = np.where(cols)[0][[0, -1]]
        
        icon_solid = icon_solid.crop((cmLl, rmTt, cmRr + 1, rmBb + 1))
        
        print(f"Cropped icon size: {icon_solid.size}")
        
        # Now remove black background
        icon_rgba = icon_solid.convert("RGBA")
        datas = icon_rgba.getdata()
        
        new_data = []
        for item in datas:
            # simple transparency: if dark, make transparent
            if item[0] < 30 and item[1] < 30 and item[2] < 30:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)
                
        icon_rgba.putdata(new_data)
        
        icon_rgba.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
        print("Saved cloudbaud_icon.png (extracted from solid backup)")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_from_solid()
