const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const logosClientesDir = path.join(baseDir, 'logos_clientes');

console.log('Starting Robust Logo Processing...');

// Renaming Map (Keys lowercased for case-insensitive matching)
const renameMap = {
    'logohorizontal.png': 'tecnocor.png',
    'logo_sancristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png',
    'soundpro.png': 'soundpro.png' // explicitly ensure this one
};

try {
    // 1. Clean logos dictionary completely
    if (fs.existsSync(logosDir)) {
        console.log('Cleaning logos dir...');
        fs.readdirSync(logosDir).forEach(f => {
            try { fs.unlinkSync(path.join(logosDir, f)); } catch (e) { }
        });
    } else {
        fs.mkdirSync(logosDir, { recursive: true });
    }

    // 2. Process Files
    if (!fs.existsSync(logosClientesDir)) {
        throw new Error(`logos_clientes directory not found at ${logosClientesDir}`);
    }

    const sourceFiles = fs.readdirSync(logosClientesDir);
    const validExtensions = ['.png', '.jpg', '.jpeg'];

    // Helper to sanitize fallback names
    const sanitize = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, '');

    let processedLogos = [];

    sourceFiles.forEach(file => {
        // Skip explicitly ignored files
        if (file.toLowerCase() === 'carnescampo9.png') return;

        // Determine destination filename
        const lowerFile = file.toLowerCase();
        let finalFilename = '';

        if (renameMap[lowerFile]) {
            finalFilename = renameMap[lowerFile];
        } else {
            // Default sanitization
            const ext = path.extname(file).toLowerCase();
            if (!validExtensions.includes(ext)) return;
            const nameNoExt = path.basename(file, ext); // keeps case of basename if needed, but we lower anyway
            finalFilename = sanitize(nameNoExt) + ext;
        }

        // Copy
        const sourcePath = path.join(logosClientesDir, file);
        const destPath = path.join(logosDir, finalFilename);

        try {
            fs.copyFileSync(sourcePath, destPath);
            // Verify copy success
            const stats = fs.statSync(destPath);
            if (stats.size > 0) {
                processedLogos.push(finalFilename);
                console.log(`✓ Copied: ${file} -> ${finalFilename} (${stats.size} bytes)`);
            } else {
                console.error(`x Failed: ${finalFilename} is 0 bytes`);
            }
        } catch (e) {
            console.error(`! Error copying ${file}:`, e.message);
        }
    });

    // 3. UASS Handling (Backup)
    const uassBackupPath = path.join(baseDir, 'uass_save.png');
    let uassFile = null;
    if (fs.existsSync(uassBackupPath)) {
        const uassDest = path.join(logosDir, 'uass.png');
        fs.copyFileSync(uassBackupPath, uassDest);
        processedLogos.push('uass.png');
        uassFile = 'uass.png';
        console.log('✓ Included UASS backup.');
    }

    // 4. Order Logic
    // Specific order: Generic, Generic, HL Tuning, Moto Morini, UASS, then rest.
    const hltuning = processedLogos.find(f => f.includes('hltuning'));
    const motoMorini = processedLogos.find(f => f.includes('morini'));
    // Filter out special ones from general list
    let generalDefaults = processedLogos.filter(f => f !== uassFile && f !== hltuning && f !== motoMorini);

    let finalOrder = [];
    // Add 2 generics first
    if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());
    if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());

    if (hltuning) finalOrder.push(hltuning);
    if (motoMorini) finalOrder.push(motoMorini);
    if (uassFile) finalOrder.push(uassFile);

    // Add the rest
    finalOrder = finalOrder.concat(generalDefaults);

    console.log(`Total Logos for Wall: ${finalOrder.length}`);

    // 5. Generate HTML (Standard Clean Implementation)
    // Structure: items inside .ticker-track
    let html = '          <div class="ticker-track">\n';

    const generateItem = (filename) => {
        const isUass = filename.includes('uass');
        const className = isUass ? 'logo-item uass-special' : 'logo-item';
        // Pretty alt text
        const altName = path.basename(filename, path.extname(filename))
            .replace(/-/g, ' ')
            .toUpperCase();

        // Use relative path "img/logos/..." which works for index.html at root
        return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="200" height="auto"></div>`;
    };

    // 3 Batches for infinite scroll
    html += '            <!-- Batch 1 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');
    html += '\n            <!-- Batch 2 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');
    html += '\n            <!-- Batch 3 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');

    html += '          </div>';

    // 6. Update index.html
    const indexHtmlPath = path.join(baseDir, 'index.html');
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

    // Regex to find the inner content of .logo-ticker
    // We expect: <div class="logo-ticker"> ...content... </div>
    // But since we are replacing .ticker-track, let's look for that div specifically.
    // The previous script looked for lines.

    const tickerTrackRegex = /<div class="ticker-track">[\s\S]*?<\/div>/; // Non-greedy match for div content?? 
    // HTML is nested, regex is dangerous.
    // Let's stick to the line-based approach but match strictly the opening <div class="ticker-track">

    const lines = indexContent.split(/\r?\n/);
    let startIdx = -1;
    let closingDivCount = 0;
    let endIdx = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (startIdx === -1 && line.includes('class="ticker-track"')) {
            startIdx = i;
        } else if (startIdx !== -1) {
            // Simple heuristic: The ticker track is closed by a single </div> at the same indentation level usually
            // Or we just look for </div> followed by <!-- Logos - Batch 2 --> etc?
            // Since we generated the code previously, we know it ends with </div>
            if (line.trim() === '</div>') {
                // Check if it's the right closing div? 
                // Assuming the `ticker-track` doesn't have nested divs EXCEPT looking at the indentation or subsequent lines.
                // In our generated code, we have `</div>` at the end.
                // Let's assume the first `</div>` that appears on its own line after the batches is the one.
                // But wait, the items have `</div>`.
                // `            <div class="...">...</div>` is one line.
                // The closing `</div>` for track is usually at the bottom.
                // Let's just find the closing tag based on indentation if formatted?
                // Safer: Read the file, find `<div class="ticker-track">`, find the NEXT `</div>` that is at the start of the line or matches indentation?
                // Let's use the loose check: if we see `</div>` and the next line is NOT a logo-item.

                // Better: We know the previous block ends before `</div>` of `logo-ticker`.
                // Let's accept that we replace from startIdx to where we find `</div>`?? No.
                // Let's try to match the block we just wrote?

                // Let's just use the previous logic: if line is `</div>` and next line is `</div>` (closing ticker then closing container), 
                // then the first `</div>` is the one we want.
                if (lines[i].trim() === '</div>' && lines[i + 1] && lines[i + 1].trim() === '</div>') {
                    endIdx = i;
                    break;
                }
            }
        }
    }

    if (startIdx !== -1 && endIdx !== -1) {
        console.log(`Replacing HTML between lines ${startIdx + 1} and ${endIdx + 1}`);
        const newLines = [
            ...lines.slice(0, startIdx),
            html,
            ...lines.slice(endIdx + 1)
        ];
        fs.writeFileSync(indexHtmlPath, newLines.join('\n'), 'utf8');
        console.log('✓ index.html updated.');
    } else {
        console.error('! Could not find .ticker-track block in index.html to replace.');
    }

} catch (err) {
    console.error('! Critical Error:', err);
}
