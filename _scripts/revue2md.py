#!/usr/bin/env python3

"""
Goal of this script is to fetch the latest Simply Explained newsletter from
Revue (through the RSS feed) and convert it into Markdown for my website.

Output of this tool is not 100% perfect, but it automates 99% of the process.
"""

import urllib.request
import datetime
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from markdownify import markdownify as md

FEED_URL = "https://newsletter.savjee.be/?format=rss"
output = [] # Line-by-line markdown file (joined together at the end)

def fetch_latest_issue():
    with urllib.request.urlopen(FEED_URL) as response:
        xml = response.read()
        xml = ET.fromstring(xml)

    channel = xml.find("channel")
    latest = channel.find("item")
    title = latest.find("title").text
    url = latest.find("link").text
    date_str = latest.find("pubDate").text
    date_obj = datetime.datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S +0000')
    date = date_obj.strftime("%Y-%m-%d")

    print("Latest issue: '%s' with URL: %s" % (title, url))

    # front matter
    output.append("---")
    output.append('title: "%s"' % (title))
    output.append('date: %s' % (date) )
    output.append('number: X')
    output.append("---")
    output.append("")


    # fetch the HTML for the latest issue
    print("Fetching HTML contents for issue...")
    with urllib.request.urlopen(url) as response:
        html = response.read()
        soup = BeautifulSoup(html, 'html.parser')
        
    # Look in the email body only
    body = soup.find("div", id="issue-frame")
    for el in body.find_all("div"):
        if "class" not in el.attrs:
            continue

        el_class = el.attrs["class"]

        # Paragraphs
        if "revue-p" in el_class:
            html = str(el)
            output.append( md(html) )
            continue

        # Headers (orange ones)
        if "header-text" in el_class:
            txt = el.string.strip()
            output.extend(["", "## " + txt])
            continue

        # Blockquotes
        if "revue-blockquote" in el_class:
            txt = el.string.strip()
            output.extend(["", "> " + txt])
            continue

        # Link titles (from Pocket links, usually in blue)
        # -> This is only for items which have an image
        if "link-title" in el_class:
            link = el.find("a")
            txt = link.string
            href = link.attrs["href"]

            output.extend(["", "### [%s](%s)" % (txt, href)])
            continue


        # Link titles without images don't have a .link-title class
        # so I try to recover them here (doesn't always produce something good)
        if "outlook-group-fix" in el_class:
            first_link = el.find("td").find("a")
            if first_link is not None and first_link.string is not None:
                txt = first_link.string
                href = first_link.attrs["href"]
                output.extend(["", "### [%s](%s)" % (txt, href)])
            
    # Join the list together and cleanup the generated Markdown a bit
    converted_edition = "\n" \
                        .join(output) \
                        .replace('“','"') \
                        .replace('”','"') \
                        .replace('’', "'") \
                        .replace("…", "...") \
                        .replace("?utm_campaign=Simply%20Explained&utm_medium=email&utm_source=Revue%20newsletter", "")

    print()
    print(converted_edition)
    return None

def main():
    fetch_latest_issue()

if __name__ == "__main__":
    main()
