"""
    Extracts all URLs from newsletter editions and checks each URL to see if
    they're still active. It follows redirects.
    Writes output directly to the console as CSV with the following fields:
    Filename, URL, Domain name, Response code.
"""
import re
import glob
import requests 
from urllib.parse import urlparse

url_pattern = re.compile(r'\b((?:https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])')

# Try to appear somewhat legit
http_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Returns the domain name of a given URL
def extract_base_domain(url) -> str:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain

# CSV header
print("Filename;Linked URL;Domain name;Reponse code")

# Loop over all newsletter editions
for filename in glob.glob("src/site/newsletter/**/*.md"):    
    with open(filename, "r") as file:
        contents = file.read()
        urls = re.findall(url_pattern, contents)
    
        for url in urls:
            base_url = extract_base_domain(url)
            status_code = "internal_error"  # Default fallback value
            
            try:
                response = requests.get(url, allow_redirects=True, headers=http_headers)
                status_code = response.status_code
            except requests.exceptions.RequestException:
                pass

            print(f"{filename};{url};{base_url};{status_code}")
