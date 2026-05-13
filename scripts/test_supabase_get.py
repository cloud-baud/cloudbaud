
import os
import requests
from load_local_env import load_local_env

load_local_env()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    print("Missing SUPABASE_URL")
    exit(1)

API_URL = f"{SUPABASE_URL}/rest/v1/calendar_events"
print(f"Testing URL: {API_URL}")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

try:
    response = requests.get(API_URL, headers=headers)
    print(f"Status: {response.status_code}")
    print(response.text[:500])
except Exception as e:
    print(f"Error: {e}")
