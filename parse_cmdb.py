import pandas as pd
import json

df = pd.read_excel('docs/CloudBaud_CMDB.xlsx', header=None)
# The domains are in the 3rd column (index 2)
domains = df.iloc[:, 2].dropna().tolist()

print(f"Found {len(domains)} domains:")
for idx, domain in enumerate(domains):
    print(f"{idx+1}. {domain}")

print("\nJSON:")
print(json.dumps(domains, indent=2))
