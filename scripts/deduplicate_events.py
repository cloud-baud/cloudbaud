
import os
import requests
import json
from collections import defaultdict
from load_local_env import load_local_env

load_local_env()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL_TEST") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_TEST") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_PROD") or os.getenv("VITE_SUPABASE_ANON_KEY_TEST")

if not SUPABASE_URL:
    print("Cannot deduplicate: No DB URL found.")
    exit(1)

url = f"{SUPABASE_URL}/rest/v1/calendar_events"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def remove_duplicates():
    # 1. Fetch all events
    resp = requests.get(f"{url}?select=id,title,start_time", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to fetch events: {resp.text}")
        return

    events = resp.json()
    print(f"Checking {len(events)} events for duplicates...")

    # 2. Group by title + start_time unique key
    grouped = defaultdict(list)
    for e in events:
        key = (e['title'], e['start_time'])
        grouped[key].append(e)

    # 3. Identify duplicates (keep the first one, delete rest)
    to_delete = []
    for key, duplicates in grouped.items():
        if len(duplicates) > 1:
            print(f"Found {len(duplicates)} copies of: {key[0]}")
            # Keep the first, delete the rest
            ids_to_del = [d['id'] for d in duplicates[1:]]
            to_delete.extend(ids_to_del)
    
    if not to_delete:
        print("No duplicates found.")
        return

    print(f"Deleting {len(to_delete)} duplicate events...")

    # 4. Delete in batches or individually
    # Supabase allows `id=in.(...)` filtering for bulk delete
    joined_ids = ",".join(to_delete)
    
    del_url = f"{url}?id=in.({joined_ids})"
    del_resp = requests.delete(del_url, headers=headers)
    
    if del_resp.status_code in [200, 204]:
        print("✅ Duplicates removed successfully.")
    else:
        print(f"Failed to delete: {del_resp.status_code} - {del_resp.text}")

if __name__ == "__main__":
    remove_duplicates()
