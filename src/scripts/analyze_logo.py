from PIL import Image
import numpy as np
import sys

def analyze_profile():
    img = Image.open('d:/repos/cloudbaud.com/src/assets/cloudbaud_logo.png').convert('RGBA')
    data = np.array(img)
    alpha = data[:,:,3]
    col_sums = np.sum(alpha, axis=0)
    
    # Compress profile: average every 50 pixels
    bin_size = 50
    profile = []
    for i in range(0, len(col_sums), bin_size):
        chunk = col_sums[i:i+bin_size]
        avg_val = np.mean(chunk)
        profile.append(int(avg_val))
        
    print(f"Profile (bin_size={bin_size}): {profile}")
    
    # Also find the exact bounding box of the whole content
    bbox = img.getbbox()
    print(f"BBox: {bbox}")

if __name__ == "__main__":
    analyze_profile()
