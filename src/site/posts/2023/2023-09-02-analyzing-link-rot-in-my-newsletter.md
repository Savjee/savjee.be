---
layout: post
title: "Analyzing Link Rot in My Newsletter (After 31 Editions)"
tags: [Simply Explained, Simply Explained Newsletter]
thumbnail: /uploads/2023-09-02-analyzing-link-rot-in-my-newsletter/thumb_timeline.jpg
upload_directory: /uploads/2023-09-02-analyzing-link-rot-in-my-newsletter/
---
I've been writing a monthly newsletter for the past 2.5 years. In every edition, I link to interesting articles related to science and technology. I thought it would be interesting to analyze how many of those links are still accessible, and how many have succumbed to link rot. Let's dive in!

<!--more-->

## Testing script
To test each link, I wrote a simple Python script that extracts all *external* URLs from previous newsletters and makes sure they return an `HTTP 200 OK`  status code.

```python
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
```

The script outputs a CSV file which I imported and analyzed in Google Sheets (available [here](https://docs.google.com/spreadsheets/d/1FjfrP18U9xtWglRvvVjaCKTFvjFUSEXDx7snBHLK4WI/edit?usp=sharing)).

## Link rot seems fine
I have sent 31 editions of the newsletter containing 484 links. To my surprise, only 2 links are dead and return a `404 Page Not Found` error. No other types of errors were observed.

| Reponse code | Occurances | Share  |
| ------------ | ---------- | ------ |
| 200          | 482        | 99.59% |
| 404          | 2          | 0.41%  |

Researchers [extensively studied](https://en.wikipedia.org/wiki/Link_rot#Prevalence) the rate of link rot, but got varied results.

* A [2016 study](https://blog.zomdir.com/2017/10/the-half-life-of-link-is-two-year.html) looked at links in Yahoo! Directory and found that half of all links died within 2 years. 
* [Another study](https://www.cjr.org/analysis/linkrot-content-drift-new-york-times.php) looked at articles of The New York Times and found that 25% of all links were inaccessible. They also concluded that link rot gets worse over time, with articles from 1998 containing a whopping 72% dead links!

I’m happy that the rate of link rot is very low in past editions of my newsletter, as I often refer to older editions. However, take into account that I’ve only been doing this for 2.5 years. The rate of link rot could increase over the coming years.

I attribute the low rate of link rot to the fact that I mostly feature large news websites and scientific publications. I'm sure these hold up better over time than a random person's blog.

## Most featured URLs
While writing each newsletter, I try not to feature the same sites repeatedly. So I checked if I’ve been doing a good job of that. Here’s a list of domain names that I’ve featured most often in the past 2.5 years:

| Domain                     | Times linked | %      |
| -------------------------- | ------------ | ------ |
| youtube.com                | 58           | 11.98% |
| en.wikipedia.org           | 25           | 5.17%  |
| theverge.com               | 15           | 3.10%  |
| twitter.com                | 13           | 2.69%  |
| bigthink.com               | 11           | 2.27%  |
| bbc.com                    | 11           | 2.27%  |
| nature.com                 | 10           | 2.07%  |
| theguardian.com            | 10           | 2.07%  |
| freethink.com              | 10           | 2.07%  |
| smithsonianmag.com         | 8            | 1.65%  |
| arstechnica.com            | 7            | 1.45%  |
| science.org                | 6            | 1.24%  |
| edition.cnn.com            | 5            | 1.03%  |
| space.com                  | 5            | 1.03%  |
| futurism.com               | 5            | 1.03%  |
| scanofthemonth.com         | 5            | 1.03%  |
| github.com                 | 5            | 1.03%  |
| ciechanow.ski              | 4            | 0.83%  |
| interestingengineering.com | 4            | 0.83%  |

I was a bit surprised to see YouTube in the number 1 spot. Then I remembered I shared a list of my 25 most favorite YouTubers in [edition #7]({% link collections.newsletter, "2021-08-007.md" %}). If you exclude those, YouTube sits at the same level as Wikipedia.

Overall, this seems well balanced. There's no one website that stands out significantly.

## Links shared over time
I was also interested in knowing how many links I share in each edition of the newsletter. My aim is to feature 8 to 10 articles in each edition, but I sometimes link to more resources in the summary of each article.

| Edition # | Link count |
| --------- | ---------- |
| 001       | 1          |
| 002       | 6          |
| 003       | 9          |
| 004       | 13         |
| 005       | 12         |
| 006       | 21         |
| 007       | 40         |
| 008       | 19         |
| 009       | 21         |
| 010       | 13         |
| 011       | 12         |
| 012       | 12         |
| 013       | 21         |
| 014       | 13         |
| 015       | 11         |
| 016       | 13         |
| 017       | 14         |
| 018       | 16         |
| 019       | 20         |
| 020       | 13         |
| 021       | 21         |
| 022       | 15         |
| 023       | 21         |
| 024       | 15         |
| 025       | 21         |
| 026       | 17         |
| 027       | 21         |
| 028       | 11         |
| 029       | 12         |
| 030       | 13         |
| 031       | 17         |

The data shows that, on average, a Simply Explained Newsletter contains 15 links, and that number seems to be consistent across editions. Except for edition 7, where I shared a list of my favorite YouTube channels.

![](/uploads/2023-09-02-analyzing-link-rot-in-my-newsletter/newsletter-links-shared-over-time.svg)

## What's next?
Overall, it seems like the websites I feature in my newsletter do a good job of keeping their content online! I plan to repeat this experiment in the future to see if link rot has gotten worse.

In the meantime, I will replace the two broken links with copies from the Internet Archive's Wayback Machine.

The raw data is available on Google Sheets [here](https://docs.google.com/spreadsheets/d/1FjfrP18U9xtWglRvvVjaCKTFvjFUSEXDx7snBHLK4WI/edit?usp=sharing).


<small><i>
Thumbnail by [Sophia Hilmar](https://pixabay.com/users/shilmar-73994/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1244575) from [Pixabay](https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1244575)
</i></small>