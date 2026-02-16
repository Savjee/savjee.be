"""
    Extracts all URLs from all markdown files and checks each URL to see if
    they're still active. It follows redirects.
    Writes output for failed URLs (non-200) to the console.
"""
import re
import glob
import requests 
from urllib.parse import urlparse
import sys

# Regex for URLs
url_pattern = re.compile(r'\b((?:https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])')

# Try to appear somewhat legit
http_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Domains to skip
skip_domains = ['localhost', '127.0.0.1', 'savjee.be', 'simplyexplained.com', 'twitter.com', 'x.com', 'facebook.com']

# Returns the domain name of a given URL
def extract_base_domain(url) -> str:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain

# Loop over all markdown files in site
print("Scanning markdown files for broken links...")
files = glob.glob("src/site/**/*.md", recursive=True)
print(f"Found {len(files)} files.")

broken_links = []

for filename in files:
    print(f"Checking {filename}...", flush=True)
    with open(filename, "r") as file:
        contents = file.read()
        urls = set(re.findall(url_pattern, contents))
    
        for url in urls:
            base_url = extract_base_domain(url)
            
            if base_url in skip_domains:
                continue
                
            try:
                # HEAD request first to be fast/polite
                response = requests.head(url, allow_redirects=True, headers=http_headers, timeout=5)
                if response.status_code >= 400:
                    # Retry with GET just in case HEAD is blocked
                    response = requests.get(url, allow_redirects=True, headers=http_headers, timeout=5)
                
                if response.status_code >= 400:
                    print(f"BROKEN: {filename} -> {url} ({response.status_code})")
                    broken_links.append((filename, url, response.status_code))
            except Exception as e:
                print(f"ERROR: {filename} -> {url} ({str(e)})")
                broken_links.append((filename, url, "ERROR"))

if not broken_links:
    print("No broken links found!")
else:
    print(f"\nTotal broken links: {len(broken_links)}")
