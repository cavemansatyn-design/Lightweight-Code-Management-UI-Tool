import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('GROQ_API_KEY')
URL = "https://api.groq.com/openai/v1/chat/completions"

print(f"Checking API Key...")
if not API_KEY:
    print("ERROR: GROQ_API_KEY is missing from environment.")
    exit(1)

if "placeholder" in API_KEY:
    print("ERROR: GROQ_API_KEY is still the placeholder value. Please update backend/.env")
    exit(1)

print(f"API Key found (starts with {API_KEY[:5]}...)")
print("Attempting to call Groq API...")

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "user", "content": "Hello, are you working?"}
    ]
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

try:
    res = requests.post(URL, json=payload, headers=headers)
    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        print("Success!")
        print("Response:", res.json())
    else:
        print("Failed!")
        print("Response:", res.text)
except Exception as e:
    print(f"Network/Request Error: {e}")
