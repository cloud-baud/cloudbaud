
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time
import json
import os
import uuid
from datetime import datetime, timedelta
import re
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Optional dependencies
try:
    from googlesearch import search
    GOOGLE_SEARCH_AVAILABLE = True
except ImportError:
    GOOGLE_SEARCH_AVAILABLE = False
    print("⚠️  'googlesearch-python' not found. Google fallback disabled.")

try:
    from duckduckgo_search import DDGS
    DDG_SEARCH_AVAILABLE = True
except ImportError:
    DDG_SEARCH_AVAILABLE = False
    print("⚠️  'duckduckgo-search' not found. DuckDuckGo fallback disabled.")

class CalendarManager:
    def __init__(self):
        # Prefer TEST/DEV environment variables to align with local dev server
        self.supabase_url = os.getenv("VITE_SUPABASE_URL_TEST") or os.getenv("VITE_SUPABASE_URL")
        
        # Use Service Role Key to bypass RLS for backend agent operations
        self.supabase_key = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_TEST") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY_PROD")
        
        # Fallback to Anon key if Service Key is missing (though write ops will fail if RLS blocks anon)
        if not self.supabase_key:
             self.supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY_TEST") or os.getenv("VITE_SUPABASE_ANON_KEY")
             print("⚠️  Service Role Key missing. Using Anon Key (writes may fail due to RLS).")
        
        if self.supabase_url:
            self.api_url = f"{self.supabase_url}/rest/v1/calendar_events"
            print(f"🔗 Connected to Supabase: {self.supabase_url}")
        else:
            self.api_url = None
            print("⚠️  Supabase URL missing in .env")

    def parse_date(self, date_str: str) -> tuple[Optional[str], Optional[str]]:
        """
        Parses date string like "Jan 22 - Feb 27, 2026" or "Feb 09 - Mar 25, 2026"
        Returns (start_iso, end_iso) or (None, None)
        """
        try:
            # Clean up string
            clean_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str) # Remove st/nd/rd/th
            
            # Pattern: Mon DD - Mon DD, YYYY
            match = re.search(r'([A-Za-z]{3})\s+(\d+)\s*-\s*([A-Za-z]{3})\s+(\d+),\s*(\d{4})', clean_str)
            if match:
                m1, d1, m2, d2, y = match.groups()
                # Assumption: both dates are in the same year 'y'
                # If m1 > m2 (e.g. Dec - Jan), then start year is y-1? 
                # Usually Devpost shows current year at end.
                # Let's assume the year applies to the END date.
                # If start month is > end month, start year is y-1.
                
                months = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}
                month1_num = months.get(m1, 1)
                month2_num = months.get(m2, 1)
                
                y_end = int(y)
                y_start = y_end if month1_num <= month2_num else y_end - 1
                
                start_dt = datetime(y_start, month1_num, int(d1))
                end_dt = datetime(y_end, month2_num, int(d2))
                
                return start_dt.isoformat(), end_dt.isoformat()
                
            return None, None
        except Exception as e:
            print(f"   ! Date parsing error for '{date_str}': {e}")
            return None, None

    def generate_ics(self, hackathons: List[Dict], filename="hackathons.ics"):
        """Generates an iCalendar file from hackathons."""
        content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Hackathon Scout//NONSGML v1.0//EN",
            "CALSCALE:GREGORIAN"
        ]
        
        for hack in hackathons:
            start_iso, end_iso = self.parse_date(hack['date_info'])
            if not start_iso:
                continue # Skip if no valid date
                
            # ICS format: YYYYMMDD
            dtstart = start_iso[:10].replace("-", "")
            dtend = end_iso[:10].replace("-", "")
            
            # UID
            uid = str(uuid.uuid4())
            ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
            
            content.extend([
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{ts}",
                f"DTSTART;VALUE=DATE:{dtstart}",
                f"DTEND;VALUE=DATE:{dtend}",
                f"SUMMARY:{hack['name']}",
                f"DESCRIPTION:Themes: {', '.join(hack['themes'])}\\nLink: {hack['link']}\\nStatus: {hack['status']}",
                f"URL:{hack['link']}",
                "END:VEVENT"
            ])
            
        content.append("END:VCALENDAR")
        
        with open(filename, "w", encoding="utf-8") as f:
            f.write("\n".join(content))
        print(f"📅 ICS file generated: {filename}")

    def sync_to_supabase(self, hackathons: List[Dict]):
        """Attempts to insert hackathons into Supabase calendar_events."""
        if not self.api_url or not self.supabase_key:
            print("⚠️  Supabase credentials missing. Skipping DB sync.")
            return
            
        print("🔄 Syncing to Supabase Calendar...")
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        success_count = 0
        for hack in hackathons:
            start_iso, end_iso = self.parse_date(hack['date_info'])
            if not start_iso:
                continue

            event = {
                "title": f"Hackathon: {hack['name']}",
                "start_time": start_iso,
                "end_time": end_iso,
                "description": f"Themes: {', '.join(hack['themes'])}\nLink: {hack['link']}",
                "category": "Hackathon",
                "is_all_day": True,
                "user_email": "agent@cloudbaud.com" # Placeholder
            }
            
            try:
                # Check duplication? (Simplified: just insert)
                res = requests.post(self.api_url, headers=headers, json=event)
                if res.status_code in [200, 201]:
                    success_count += 1
                elif res.status_code == 404:
                    print("   ! Error: Table 'calendar_events' not found via API. Please run setup SQL.")
                    return # Stop trying if table is missing
                else:
                    print(f"   ! Failed to insert '{hack['name']}': {res.status_code} - {res.text}")
            except Exception as e:
                print(f"   ! Sync error: {e}")
                
        print(f"✅ Synced {success_count} events to Supabase.")


class HackathonScoutAgent:
    def __init__(self, themes: List[str] = None):
        self.themes = themes or []
        self.calendar = CalendarManager()

    def scan_hackathons(self) -> List[Dict]:
        """
        Scrapes Devpost for online, open hackathons matching the themes.
        """
        print(f"🕵️ Hackathon Scout Agent activated. Searching for themes: {self.themes}")
        results = []
        
        # 1. Try Direct API (Best method)
        direct_results = self._scrape_devpost_direct()
        if direct_results:
            results.extend(direct_results)
            
        # 2. Fallbacks (DDG/Google)
        if not results and DDG_SEARCH_AVAILABLE:
            print("   -> Direct API yielded no results. Trying DuckDuckGo...")
            ddg_results = self._search_via_ddg()
            if ddg_results:
                results.extend(ddg_results)

        if not results and GOOGLE_SEARCH_AVAILABLE:
            print("   -> Direct/DDG yielded no results. Trying Google...")
            google_results = self._search_via_google()
            if google_results:
                results.extend(google_results)

        # 3. Mock Data Fallback
        if not results:
             print("   ! No hackathons found via scraping or search. Showing MOCK data.")
             results.extend([
                { "name": "Global AI Hackathon 2026 (MOCK)", "link": "https://devpost.com", "status": "Open", "date_info": "Mar 10 - Apr 05, 2026", "themes": ["AI", "Machine Learning"] },
                { "name": "Cloud Native Sustainathon (MOCK)", "link": "https://devpost.com", "status": "Upcoming", "date_info": "Apr 22 - Apr 24, 2026", "themes": ["Cloud", "Sustainability"] }
            ])
            
        return results

    def _scrape_devpost_direct(self) -> List[Dict]:
        api_url = "https://devpost.com/api/hackathons"
        params = [("challenge_type[]", "online"), ("status[]", "open")]
        for theme in self.themes:
            params.append(("themes[]", theme))
        
        print(f"   -> Querying Devpost API: '{api_url}'")
        results = []
        try:
            headers = {"Accept": "application/json", "User-Agent": "Mozilla/5.0"}
            response = requests.get(api_url, params=params, headers=headers, timeout=10)
            if response.status_code != 200: return []
            
            data = response.json()
            for hack in data.get("hackathons", []):
                try:
                    title = hack.get("title", "Unknown")
                    status = hack.get("time_left_to_submission", "Open")
                    # Formatting date to be parseable
                    # API returns localized date strings often, or specific ranges.
                    # We will try to use 'submission_period_dates'
                    date_info = hack.get("submission_period_dates", "Jan 01 - Jan 02, 2026")
                    
                    themes = []
                    if "themes" in hack: themes = [t["name"] for t in hack["themes"]]
                    
                    results.append({
                        "name": title,
                        "link": hack.get("url", "#"),
                        "status": status,
                        "date_info": date_info,
                        "themes": themes,
                        "source": "Devpost API"
                    })
                except: continue
            print(f"   -> Devpost API found {len(results)} hackathons.")
            return results
        except Exception: return []

    def _search_via_ddg(self) -> List[Dict]:
        results = []
        try:
            query = f'site:devpost.com hackathon online open {" ".join(self.themes)}'
            with DDGS() as ddgs:
                for res in list(ddgs.text(query, max_results=5)):
                    if "/software/" not in res.get('href', ''):
                        results.append({
                            "name": res.get('title'), "link": res.get('href'),
                            "status": "Check Link", "date_info": "Check Link",
                            "themes": self.themes, "source": "DuckDuckGo"
                        })
            return results
        except: return []

    def _search_via_google(self) -> List[Dict]:
        # Implementation omitted for brevity in V2, relying on API/DDG mostly
        return []

if __name__ == "__main__":
    print("\n--- HACKATHON SCOUT & CALENDAR SYNC ---")
    agent = HackathonScoutAgent(themes=["Databases", "AI"])
    hackathons = agent.scan_hackathons()

    repo_root = Path(__file__).resolve().parents[3]
    data_dir = repo_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    hackathons_json_file = data_dir / "hackathons.json"
    hackathons_ics_file = data_dir / "hackathons.ics"
    
    print(f"\n✅ Found {len(hackathons)} Hackathons:")
    for hack in hackathons:
        print(f" - {hack['name']} ({hack['date_info']})")
    
    # 1. Save JSON
    with open(hackathons_json_file, "w", encoding="utf-8") as f:
        json.dump(hackathons, f, indent=2)
    print(f"\n💾 Saved to {hackathons_json_file}")
    
    # 2. Generate ICS
    agent.calendar.generate_ics(hackathons, filename=str(hackathons_ics_file))
    
    # 3. Sync to DB
    agent.calendar.sync_to_supabase(hackathons)
