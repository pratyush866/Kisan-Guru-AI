import os
import sys
import asyncio

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
os.chdir(BASE_DIR)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.modules.weather.router import get_current_weather
async def check_weather():
    print("Testing OpenWeather...")
    try:
        res = await get_current_weather(city="Patna")
        print("Weather Success:", res)
    except Exception as e:
        print("Weather Failed:", e)

from app.modules.ai.router import process_agricultural_query
from app.modules.schemas import ChatQuery
async def check_ai():
    print("Testing Gemini AI...")
    try:
        query = ChatQuery(query="My tomato leaves have black spots", language="english")
        res = await process_agricultural_query(query)
        print("AI Success:", res)
    except Exception as e:
        print("AI Failed:", e)

async def main():
    await check_weather()
    await check_ai()

if __name__ == "__main__":
    asyncio.run(main())
