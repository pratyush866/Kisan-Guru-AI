import os
import urllib.request
import urllib.error
import json

api_key = os.getenv("WEATHER_API_KEY", "")

if not api_key:
    print("WEATHER_API_KEY not set. Skipping live weather API check.")
else:
    print("Testing OpenWeather API...")
    url = f"http://api.openweathermap.org/data/2.5/weather?q=London&appid={api_key}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"SUCCESS - {data.get('name')}")
    except urllib.error.HTTPError as e:
        print(f"FAILED - {e.code} {e.reason}")
    except Exception as e:
        print(f"ERROR - {str(e)}")
