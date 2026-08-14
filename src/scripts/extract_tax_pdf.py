import PyPDF2
import re

pdf_path = r"d:\repos\cloudbaud.com\src\data\Documents - Taxes\2017\Nath2017Form1040.pdf"

print("=" * 80)
print("2017 TAX RETURN EXTRACTION - GROUND TRUTH")
print("=" * 80)

try:
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        print(f"\nTotal Pages: {len(pdf_reader.pages)}\n")
        
        # Extract first 15 pages
        for page_num in range(min(15, len(pdf_reader.pages))):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            print(f"\n{'='*80}")
            print(f"PAGE {page_num + 1}")
            print(f"{'='*80}\n")
            print(text)
            print("\n")
        
except Exception as e:
    print(f"Error: {str(e)}")
