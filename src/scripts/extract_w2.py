import PyPDF2
import sys
import json

def extract_w2_data(pdf_path):
    """Extract text from W2 PDF and parse key fields"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            print("=== EXTRACTED TEXT ===")
            print(text)
            print("\n=== END TEXT ===\n")
            
            # Parse W2 fields
            lines = text.split('\n')
            w2_data = {
                "raw_text": text,
                "box_1_wages": None,
                "box_2_federal_tax": None,
                "box_16_state_wages": None,
                "box_17_state_tax": None,
                "box_12_codes": []
            }
            
            # Try to find common W2 patterns
            for i, line in enumerate(lines):
                # Look for box labels and values
                if 'Wages, tips' in line or 'Box 1' in line:
                    # Next line or same line might have the value
                    pass
                    
            return w2_data
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    pdf_path = r"d:\repos\cloudbaud.com\src\data\Documents - Taxes\2017\2017 W2.pdf"
    result = extract_w2_data(pdf_path)
    if result:
        print(json.dumps(result, indent=2))
