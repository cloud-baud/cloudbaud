from PIL import Image
import numpy as np

def extract_from_solid_force():
    try:
        # Load the solid backup
        img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo_solid_backup.png').convert('RGB')
        
        # Determine content by looking for non-black pixels
        data = np.array(img)
        mask = np.any(data > 30, axis=2)
        
        col_sums = np.sum(mask, axis=0)
        non_empty = np.where(col_sums > 0)[0]
        
        if len(non_empty) == 0:
            return

        start_x = non_empty[0]
        end_x = non_empty[-1]
        
        # Force crop square-ish from left
        height = img.height
        target_width = int(height * 1.05) # Square + 5%
        
        split_x = start_x + target_width
        
        # Verify split_x is not beyond image
        if split_x > end_x:
            split_x = end_x # Just take whole thing if narrower than square?
            
        print(f"Force cropping: {start_x} to {split_x}")
        
        # Crop the icon part
        icon_solid = img.crop((start_x, 0, split_x, img.height))
        
        # Trim vertical whitespace
        icon_data = np.array(icon_solid)
        icon_mask = np.any(icon_data > 30, axis=2)
        rows = np.any(icon_mask, axis=1)
        cols = np.any(icon_mask, axis=0) # Also re-trim horizontal
        
        if not np.any(rows):
            print("Empty crop?")
            return
            
        rmTt, rmBb = np.where(rows)[0][[0, -1]]
        cmLl, cmRr = np.where(cols)[0][[0, -1]]
        
        icon_solid = icon_solid.crop((cmLl, rmTt, cmRr + 1, rmBb + 1))
        
        print(f"Final icon size: {icon_solid.size}")
        
        # Remove black background
        icon_rgba = icon_solid.convert("RGBA")
        datas = icon_rgba.getdata()
        
        new_data = []
        for item in datas:
            if item[0] < 30 and item[1] < 30 and item[2] < 30:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)
                
        icon_rgba.putdata(new_data)
        
        icon_rgba.save('d:/repos/cloudbaud.com/src/assets/cloudbaud_icon.png')
        print("Saved cloudbaud_icon.png")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_from_solid_force()
