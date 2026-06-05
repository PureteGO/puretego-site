import os
import re
from urllib.parse import urlparse

html_files = []
for root, dirs, files in os.walk(r"c:\ProAG\PureteGO_Site"):
    if ".git" in root or "node_modules" in root or ".vite" in root:
        continue
    for file in files:
        if file.endswith(".html"):
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files to check.")

for filepath in html_files:
    rel_path = os.path.relpath(filepath, r"c:\ProAG\PureteGO_Site")
    if "backup" in rel_path or "_new" in rel_path or "_fixed" in rel_path or "logo_wall" in rel_path or "ticker" in rel_path:
        # skip backup/temp files
        continue
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Find all href links
    links = re.findall(r'href="([^"]+)"', content)
    broken_links = []
    
    file_dir = os.path.dirname(filepath)
    
    for link in links:
        # Ignore external links, mailto, tel, anchor-only links
        if link.startswith("http") or link.startswith("mailto:") or link.startswith("tel:") or link.startswith("javascript:") or link.startswith("#") or link.startswith("https://wa.me"):
            continue
        
        # Parse link to separate anchor
        clean_link = link.split("#")[0]
        if not clean_link:
            continue
            
        target_path = os.path.abspath(os.path.join(file_dir, clean_link))
        
        if not os.path.exists(target_path):
            broken_links.append((link, target_path))
            
    if broken_links:
        print(f"\nBroken links in {rel_path}:")
        for link, target in broken_links:
            print(f"  - {link} (resolved to: {target})")
