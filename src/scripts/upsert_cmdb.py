import urllib.request
import json
import sys
import os
import pandas as pd
from pathlib import Path
from dotenv import dotenv_values

_root = Path(__file__).resolve().parent.parent
env_vars = {}
if os.environ.get("NETLIFY") != "true":
    for _name in (".env.test", ".env"):
        _p = _root / _name
        if _p.is_file():
            env_vars = dotenv_values(_p)
            break
supabase_url = env_vars.get('VITE_SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
# USE SERVICE ROLE KEY!
supabase_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not supabase_key:
    print("Could not find supabase service role key in .env.test or .env")
    sys.exit(1)

df = pd.read_excel('docs/CloudBaud_CMDB.xlsx', header=None)
domains = df.iloc[:, 2].dropna().tolist()

for index, domain in enumerate(domains):
    app_id = f"APP-{str(index + 1).zfill(3)}"
    name = domain.split('.')[0]
    if len(name) > 0:
        name = name[0].upper() + name[1:]
    domain_ext = domain if '.' in domain else domain + ".com"
    status = 'Active' if index < 4 else 'Development'
    tier = 'Production' if index < 4 else 'Staging'

    payload = {
        "name": name,
        "domain": domain_ext,
        "hosting": "Netlify",
        "status": status,
        "tier": tier,
        "app_id": app_id
    }
    
    url = f"{supabase_url}/rest/v1/cmdb_applications"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        urllib.request.urlopen(req)
        print(f"Upserted {domain_ext}")
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        print(f"Failed to upsert {domain_ext}: {e.status} {error_msg}")
    except Exception as e:
        print(f"Failed to upsert {domain_ext}: {e}")
