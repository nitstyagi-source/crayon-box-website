import urllib.request
import os

url = "https://crayonboxpreschool.in/wp-content/uploads/2021/02/LOGO_FINAL-2021-removebg-preview.png"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req) as response, open('public/logo-downloaded.png', 'wb') as out_file:
        data = response.read()
        out_file.write(data)
        print(f"Downloaded successfully. Size: {len(data)} bytes")
except Exception as e:
    print(f"Failed to download: {e}")
