import os
import requests
import random
import time
from datetime import datetime
import pytz

def run_ping():
    # 1. Setup Timezone
    tz = pytz.timezone('Asia/Kolkata')
    now = datetime.now(tz)
    
    # 10 PM (22) to 6 AM (6) Silence
    if now.hour >= 22 or now.hour < 6:
        print(f"[{now.strftime('%H:%M:%S')}] Night mode active. Skipping.")
        return

    # 2. Get URL from GitHub Secrets (or hardcode it if you prefer)
    url = os.getenv("RENDER_URL", "https://edurpg.onrender.com")

    # 3. Rotate User-Agents to mimic different devices/browsers
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15...",
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36...",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36"
    ]
    
    headers = {'User-Agent': random.choice(user_agents)}

    try:
        # 4. Double Jitter: Internal random delay (0 to 120 seconds)
        time.sleep(random.uniform(0, 120))
        
        response = requests.get(url, headers=headers, timeout=20)
        print(f"[{now.strftime('%H:%M:%S')}] Ping Success: {response.status_code}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_ping()
