import json
from collections import defaultdict

data = json.load(open('test/dropdowns.json', encoding='utf-8'))
locations = defaultdict(list)

def walk_links(links, prefix):
    if isinstance(links, list):
        for idx, item in enumerate(links):
            if isinstance(item, dict):
                text = item.get('text')
                if text:
                    locations[text].append(f"{prefix}[{idx}]")
            elif isinstance(item, list):
                walk_links(item, f"{prefix}[{idx}]")

for i, group in enumerate(data):
    walk_links(group.get('links', []), f"[{i}].links")

print(locations.get('Bleed Rapier'))
