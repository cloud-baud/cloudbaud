"""
Analyze the 2017 tax return PDF to identify pages for each form/schedule.
Extracts text from each page and prints a summary.
"""
import sys
from pypdf import PdfReader

pdf_path = r"d:\repos\cloudbaud.com\src\data\Documents - Taxes\2017\Nath2017Form1040.pdf"
reader = PdfReader(pdf_path)

print(f"Total pages: {len(reader.pages)}\n")
print("=" * 80)

for i, page in enumerate(reader.pages):
    text = page.extract_text() or ""
    # Get first 200 chars for identification
    preview = text[:300].replace('\n', ' | ').strip()
    
    # Try to identify the form type
    form_id = "UNKNOWN"
    text_upper = text.upper()
    
    if "FORM 1040" in text_upper and "SCHEDULE" not in text_upper:
        form_id = "Form 1040"
    elif "SCHEDULE A" in text_upper and "ITEMIZED" in text_upper:
        form_id = "Schedule A"
    elif "SCHEDULE B" in text_upper and "INTEREST" in text_upper:
        form_id = "Schedule B"
    elif "SCHEDULE C" in text_upper and ("PROFIT" in text_upper or "BUSINESS" in text_upper):
        form_id = "Schedule C"
    elif "SCHEDULE D" in text_upper and "CAPITAL" in text_upper:
        form_id = "Schedule D"
    elif "SCHEDULE E" in text_upper and ("RENTAL" in text_upper or "SUPPLEMENTAL" in text_upper):
        form_id = "Schedule E"
    elif "SCHEDULE SE" in text_upper and "SELF-EMPLOYMENT" in text_upper:
        form_id = "Schedule SE"
    elif "FORM 8949" in text_upper:
        form_id = "Form 8949"
    elif "FORM 8995" in text_upper or "QUALIFIED BUSINESS" in text_upper:
        form_id = "Form 8995 (QBI)"
    elif "FORM 8829" in text_upper:
        form_id = "Form 8829 (Home Office)"
    elif "FORM 4562" in text_upper and "DEPRECIATION" in text_upper:
        form_id = "Form 4562 (Depreciation)"
    elif "FORM 8959" in text_upper:
        form_id = "Form 8959 (Medicare)"
    elif "FORM 8960" in text_upper:
        form_id = "Form 8960 (NII Tax)"
    elif "FORM 1116" in text_upper:
        form_id = "Form 1116 (Foreign Tax)"
    elif "ESTIMATED TAX" in text_upper and "VOUCHER" in text_upper:
        form_id = "Estimated Tax Voucher"
    elif "EXTENSION" in text_upper:
        form_id = "Extension"
    elif "COVER" in text_upper or "TRANSMITTAL" in text_upper:
        form_id = "Cover Letter/Transmittal"
    elif "VEHICLE" in text_upper:
        form_id = "Vehicle Info"
    elif "FORM 2210" in text_upper:
        form_id = "Form 2210 (Underpayment)"
    elif "FORM 6251" in text_upper or "AMT" in text_upper:
        form_id = "Form 6251 (AMT)"
    elif "DEPRECIATION" in text_upper:
        form_id = "Depreciation"
    elif "1099" in text_upper:
        form_id = "1099 Summary"
    elif "W-2" in text_upper:
        form_id = "W-2 Summary"
    elif "INVOICE" in text_upper or "ENGAGEMENT" in text_upper:
        form_id = "CPA Invoice/Engagement"
    
    print(f"Page {i+1:3d} | {form_id:30s} | {preview[:120]}")

print("=" * 80)
