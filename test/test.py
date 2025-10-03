import requests
from bs4 import BeautifulSoup

URL = "https://newworldnews.org/barneys-ennead-and-forge-eternal-savage-desiccated/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36"
}

r = requests.get(URL, headers=HEADERS, timeout=20)
r.raise_for_status()
soup = BeautifulSoup(r.text, "html.parser")

# 1) Grab the taxonomy container(s)
containers = soup.select(".wpr-post-info-taxonomy")

tags = []
for box in containers:
    # 2) Within each box, tags are usually anchor links
    for a in box.select('a[rel="tag"], a[href*="/tag/"], a[href*="/category/"]'):
        name = a.get_text(strip=True)
        href = a.get("href")
        if name and href:
            tags.append({"name": name, "url": href})

print(tags)
