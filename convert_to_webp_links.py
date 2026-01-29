import os

# Base directory
base_dir = r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO"

# List of images and their corresponding webp versions
replacements = {
    'geomarketing-illustration.png': 'geomarketing-illustration.webp',
    'google-search-mockup.png': 'google-search-mockup.webp',
    'hero-banana.png': 'hero-banana.webp',
    'marketing-banner.png': 'marketing-banner.webp',
    'google-business-profile.png': 'google-business-profile.webp',
    'cpanel-security.png': 'cpanel-security.webp',
    'cpanel-management.png': 'cpanel-management.webp',
    'google-ads-hero.png': 'google-ads-hero.webp',
    'hero-mockup.png': 'hero-mockup.webp',
    'hero-app-mockup.png': 'hero-app-mockup.webp'
}

# Supported file extensions to search in
extensions = ['.html', '.css']

def update_files(directory):
    for root, dirs, files in os.walk(directory):
        if 'central' in dirs:
            dirs.remove('central')  # Skip central directory
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    for old, new in replacements.items():
                        content = content.replace(old, new)
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"✓ Updated image links in: {os.path.relpath(file_path, base_dir)}")
                except Exception as e:
                    print(f"✗ Error updating {file}: {e}")

if __name__ == "__main__":
    print("🚀 Starting WebP link update...")
    update_files(base_dir)
    print("\n✅ All links updated!")
