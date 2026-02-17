"""
Split the 2017 Nath tax return PDF into individual schedule/form files.

Source: Nath2017Form1040.pdf (31 pages)
Output: Individual PDF files for each form/schedule in the same directory.

Page Map (identified from text extraction):
  P01-02: Cover Letter (CPA transmittal)
  P03:    Cover Letter Page 2 (safeguards)
  P04:    Form 1040-V Payment Voucher
  P05-07: Form 1040 (U.S. Individual Income Tax Return, 3 pages)
  P08-09: Schedule C (CloudBaud LLC)
  P10-11: Schedule C (Comfort Foods / Robertos)
  P12-13: Schedule D (Capital Gains)
  P14:    Form 8949 (Sales/Exchanges)
  P15:    Schedule A (Itemized Deductions)
  P16:    Schedule SE (Self-Employment Tax)
  P17:    Form 4797 (Sale of Business Property)
  P18:    Form 6251 (AMT)
  P19-20: Form 4952 (Investment Interest) — 2 copies
  P21:    Form 8959 (Additional Medicare Tax)
  P22:    Form 8829 (Business Use of Home)
  P23:    Form 4562 (Depreciation)
  P24:    Federal Statements (Software Consulting)
  P25:    Salaries & Wages Report (Form A)
  P26-28: Two Year Comparison Report (2016 & 2017)
  P29-30: Income Analysis / Reconciliation
  P31:    Reconciliation Worksheet
"""
import os
from pypdf import PdfReader, PdfWriter

SRC = r"d:\repos\cloudbaud.com\src\data\Documents - Taxes\2017\Nath2017Form1040.pdf"
OUT_DIR = os.path.dirname(SRC)

reader = PdfReader(SRC)
print(f"Source: {os.path.basename(SRC)} ({len(reader.pages)} pages)")

# Define the splits: (filename, start_page, end_page) — 1-indexed inclusive
SPLITS = [
    ("2017_Cover_Letter.pdf",                  1,  3),
    ("2017_Form_1040V_Payment_Voucher.pdf",    4,  4),
    ("2017_Form_1040.pdf",                     5,  7),
    ("2017_Schedule_C_CloudBaud.pdf",          8,  9),
    ("2017_Schedule_C_Robertos.pdf",          10, 11),
    ("2017_Schedule_D_Capital_Gains.pdf",     12, 13),
    ("2017_Form_8949_Sales.pdf",              14, 14),
    ("2017_Schedule_A_Itemized_Deductions.pdf", 15, 15),
    ("2017_Schedule_SE_Self_Employment.pdf",   16, 16),
    ("2017_Form_4797_Business_Property.pdf",  17, 17),
    ("2017_Form_6251_AMT.pdf",                18, 18),
    ("2017_Form_4952_Investment_Interest.pdf", 19, 20),
    ("2017_Form_8959_Medicare.pdf",           21, 21),
    ("2017_Form_8829_Home_Office.pdf",        22, 22),
    ("2017_Form_4562_Depreciation.pdf",       23, 23),
    ("2017_Federal_Statements.pdf",           24, 24),
    ("2017_Wages_Report.pdf",                 25, 25),
    ("2017_Two_Year_Comparison.pdf",          26, 28),
    ("2017_Income_Analysis.pdf",              29, 30),
    ("2017_Reconciliation_Worksheet.pdf",     31, 31),
]

print(f"\nSplitting into {len(SPLITS)} files...\n")

for filename, start, end in SPLITS:
    writer = PdfWriter()
    for page_num in range(start - 1, end):  # Convert to 0-indexed
        writer.add_page(reader.pages[page_num])
    
    out_path = os.path.join(OUT_DIR, filename)
    with open(out_path, "wb") as f:
        writer.write(f)
    
    pages_str = f"p{start}" if start == end else f"p{start}-{end}"
    print(f"  ✓ {filename:50s} ({pages_str}, {end - start + 1} page{'s' if end > start else ''})")

print(f"\n✅ Done! {len(SPLITS)} files written to:\n   {OUT_DIR}")
