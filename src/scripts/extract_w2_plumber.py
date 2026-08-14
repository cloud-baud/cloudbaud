import pdfplumber
import sys

def extract_w2_with_plumber(pdf_path):
    """Extract text from W2 PDF using pdfplumber for better accuracy"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                print(f"\n=== PAGE {page_num} ===")
                print(text)
                full_text += text + "\n"
            
            print("\n=== ANALYSIS ===")
            print(f"Total pages: {len(pdf.pages)}")
            print(f"Total characters: {len(full_text)}")
            
            return full_text
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    pdf_path = r"d:\repos\cloudbaud.com\src\data\Documents - Taxes\2017\2017 W2.pdf"
    extract_w2_with_plumber(pdf_path)
