import sys

try:
    import pandas as pd
    df = pd.read_excel('docs/CloudBaud_CMDB.xlsx')
    print("### Columns ###")
    print(df.columns.tolist())
    print("\n### Data ###")
    print(df.to_string())
except ImportError:
    print("pandas not installed. Trying openpyxl...")
    try:
        import openpyxl
        wb = openpyxl.load_workbook('docs/CloudBaud_CMDB.xlsx')
        sheet = wb.active
        for row in sheet.iter_rows(values_only=True):
            print(row)
    except ImportError:
        print("openpyxl not installed.")
