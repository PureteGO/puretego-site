#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

files_to_update = [
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\geomarketing.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\perfil-empresarial.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\creacion-sitios.html"
]

for filepath in files_to_update:
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace
        new_content = content.replace('planes-hosting.html', 'hospedaje-web.html')
        
        # Write back
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        
        filename = os.path.basename(filepath)
        print(f"✓ Updated: {filename}")
        
    except Exception as e:
        print(f"✗ Error with {os.path.basename(filepath)}: {str(e)}")

print("\n✅ Completed!")
