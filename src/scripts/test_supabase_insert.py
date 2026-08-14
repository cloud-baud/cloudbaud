
import os
import requests
import json
from datetime import datetime, timedelta
from load_local_env import load_local_env

load_local_env()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials in .env.test or .env")
    exit(1)

# API Endpoint for inserting into calendar_events
url = f"{SUPABASE_URL}/rest/v1/calendar_events"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Test Event Data
event = {
    "title": "Test Event from Python Agent",
    "start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
    "end_time": (datetime.now() + timedelta(hours=2)).isoformat(),
    "description": "This is a test to check write access.",
    "category": "Test",
    "user_email": "agent@cloudbaud.com"
}

try:
    response = requests.post(url, headers=headers, json=event)
    print(f"Status Code: {response.status_code}")
    if response.status_code in [200, 201]:
        print("Success! Event inserted.")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Failed to insert event.")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
