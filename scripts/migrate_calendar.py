
import os
import psycopg2

from load_local_env import load_local_env

load_local_env()

# Check for production/fallback first, then test/dev
# We want to enable this for the *running* environment, which seems to be TEST/DEV locally.
# However, the user said "save these in the supabase".
# Let's try to connect to the TEST DB since that's what `npm run dev` typically uses.

DB_URL = os.getenv("DIRECT_URL_TEST")
if not DB_URL:
    print("DIRECT_URL_TEST not found in .env.test / .env via load_local_env.") 
    # Fallback: maybe manually parse the .env if os.getenv fails due to parsing issues (unlikely with load_dotenv)
    # But wait, line 26 showed `DIRECT_URL_TEST="..."`.
    pass

SQL_FILE = "supabase_setup_calendar.sql"

def run_migration():
    if not DB_URL:
        print("Cannot run migration: No DB URL found.")
        return

    print(f"Connecting to DB: {DB_URL.split('@')[-1]}") # Log host/port only for safety
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        with open(SQL_FILE, 'r') as f:
            sql = f.read()
            
        print(f"Executing SQL from {SQL_FILE}...")
        cur.execute(sql)
        conn.commit()
        print("Migration successful! Table 'calendar_events' created/updated.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
