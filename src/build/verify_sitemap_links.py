import glob
import requests

SITEMAP_PATHS = [
    "test-sitemaps/*.txt"
]


def main():
    for g in SITEMAP_PATHS:
        for sitemap_name in glob.glob(g):
            with open(sitemap_name, 'r') as sitemap:
                urls = sitemap.read().splitlines()

            session = requests.Session()
            session.cookies['CF_Authorization'] = ""

            for url in urls:
                url = url.replace("https://savjee.be/", "https://v6.savjee-be.pages.dev/")
                r = requests.get(url)
                status = r.status_code

                if status == 200:
                    print("OK", url)
                else:
                    print("Error", status, "on", url)
                    
if __name__ == '__main__':
    main()
