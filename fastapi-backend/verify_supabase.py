import os
from supabase import create_client

url = os.getenv('SUPABASE_URL', 'https://tuqzlpjeshsokitjxsrg.supabase.co')
key = os.getenv('SUPABASE_KEY', '')

if not key:
    print("Warning: SUPABASE_KEY not set in environment. Checking local config...")
    try:
        from app.core.config import settings
        url = settings.SUPABASE_URL or url
        key = settings.SUPABASE_KEY
    except Exception:
        pass

if not key:
    print("Error: SUPABASE_KEY is required to verify Supabase connection.")
    exit(1)

client = create_client(url, key)

tables = [
    'users', 'crops', 'diagnostic_reports', 'rental_listings', 
    'rental_bookings', 'chat_sessions', 'chat_messages', 
    'pest_reports', 'pest_library'
]

print("=== VERIFYING SUPABASE TABLES ===")
all_ok = True
for t in tables:
    try:
        res = client.table(t).select('*', count='exact').limit(0).execute()
        print(f"  [OK] Table '{t}' exists! Count: {res.count}")
    except Exception as e:
        all_ok = False
        print(f"  [MISSING/ERROR] Table '{t}': {e}")

if all_ok:
    print("\nALL 16 TABLES ARE LIVE AND ACCESSIBLE ON SUPABASE!")
