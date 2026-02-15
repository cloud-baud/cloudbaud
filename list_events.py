
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL_TEST") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_TEST") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_PROD") or os.getenv("VITE_SUPABASE_ANON_KEY_TEST")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing credentials.")
    exit(1)

url = f"{SUPABASE_URL}/rest/v1/calendar_events?select=id,title,start_time,end_time"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    events = response.json()
    print(f"Found {len(events)} events.")
    for e in events:
        print(f"ID: {e['id']} | {e['title']} | Start: {e['start_time']}")
else:
    print(response.text)
