import requests

URL = "http://localhost:5000/auth/login"
DATA = {
    "email": "admin@quasar.com",
    "password": "admin123"
}

try:
    print(f"Attempting login to {URL}...")
    res = requests.post(URL, json=DATA)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
