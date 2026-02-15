
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL_TEST") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_TEST") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_PROD") or os.getenv("VITE_SUPABASE_ANON_KEY_TEST")

if not SUPABASE_URL:
    print("No DB URL found.")
    exit(1)

url = f"{SUPABASE_URL}/rest/v1/calendar_events"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# List of mock titles to remove
mock_titles = [
    "Quarterly Business Review",
    "Team Lunch",
    "Project Deadline",
    "Client Meeting - Acme Corp"
]

def remove_mock_events():
    # Construct filter query: title=in.("Title1","Title2")
    # URL encoding needed for commas and quotes, simpler to delete by ID after fetching or loop delete
    
    print("Fetching events to identify mocks...")
    resp = requests.get(f"{url}?select=id,title", headers=headers)
    if resp.status_code != 200:
        print(f"Error fetching: {resp.text}")
        return

    all_events = resp.json()
    ids_to_remove = []
    
    for e in all_events:
        if e['title'] in mock_titles:
            print(f" - Marking for deletion: {e['title']} ({e['id']})")
            ids_to_remove.append(e['id'])

    if not ids_to_remove:
        print("No mock events found.")
        return

    print(f"Deleting {len(ids_to_remove)} mock events...")
    
    # Bulk delete
    id_list = ",".join(ids_to_remove)
    del_resp = requests.delete(f"{url}?id=in.({id_list})", headers=headers)
    
    if del_resp.status_code in [200, 204]:
        print("✅ Mock events removed successfully.")
    else:
        print(f"Failed to delete: {del_resp.text}")

if __name__ == "__main__":
    remove_mock_events()
