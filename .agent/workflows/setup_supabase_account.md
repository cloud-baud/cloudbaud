
-----
description: setup a new Supabase environment and capture project details
---

1. Ask user for Supabase Project URL and Anon Key.
2. Ask user for a friendly name for this project (e.g., "Personal", "Work", "ClientX").
3. Update `.env` file to include these new variables with a prefix (e.g., `VITE_SUPABASE_URL_CLIENTX`).
4. Update `src/lib/supabase.js` to potentially allow switching to this new client or using it for specific features.
5. Create a `supabase_setup_clientx.sql` script to initialize standard tables if needed.
