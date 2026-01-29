const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const logosClientesDir = path.join(baseDir, 'logos_clientes');

console.log('Starting Logo Processing...');

// Renaming Map
const renameMap = {
    'LogoHorizontal.png': 'tecnocor.png',
    'logo_SanCristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png'
};

try {
    // 1. Clean
    if (fs.existsSync(logosDir)) {
        console.log('Cleaning logos dir...');
        // fs.rmSync(logosDir, { recursive: true, force: true }); 
        // Windows sometimes locks files, better to just delete files inside
        fs.readdirSync(logosDir).forEach(f => fs.unlinkSync(path.join(logosDir, f)));
    } else {
        fs.mkdirSync(logosDir, { recursive: true });
    }

    // 2. Process
    const sourceFiles = fs.readdirSync(logosClientesDir);
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const sanitize = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, '');

    let processedLogos = [];

    sourceFiles.forEach(file => {
        if (file === 'carnescampo9.png') return; // Skip old

        let effectiveName = renameMap[file] || file;
        const ext = path.extname(effectiveName).toLowerCase();

        if (validExtensions.includes(ext)) {
            const nameNoExt = path.basename(effectiveName, ext);
            const cleanName = sanitize(nameNoExt);
            const finalFilename = `${cleanName}${ext}`;

            const destPath = path.join(logosDir, finalFilename);
            const sourcePath = path.join(logosClientesDir, file);

            try {
                fs.copyFileSync(sourcePath, destPath);
                processedLogos.push(finalFilename);
                console.log(`Processed: ${file} -> ${finalFilename}`);
            } catch (e) {
                console.error(`Failed to copy ${file}:`, e);
            }
        }
    });

    // 3. UASS Handling
    const uassBackupPath = path.join(baseDir, 'uass_save.png');
    let uassFile = null;
    if (fs.existsSync(uassBackupPath)) {
        const uassDest = path.join(logosDir, 'uass.png');
        fs.copyFileSync(uassBackupPath, uassDest);
        processedLogos.push('uass.png');
        uassFile = 'uass.png';
        console.log('Included UASS backup.');
    }

    // 4. Order
    const hltuning = processedLogos.find(f => f.includes('hltuning'));
    const motoMorini = processedLogos.find(f => f.includes('morini'));
    let generalDefaults = processedLogos.filter(f => f !== uassFile && f !== hltuning && f !== motoMorini);

    let finalOrder = [];
    if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());
    if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());
    if (hltuning) finalOrder.push(hltuning);
    if (motoMorini) finalOrder.push(motoMorini);
    if (uassFile) finalOrder.push(uassFile);
    finalOrder = finalOrder.concat(generalDefaults);

    console.log(`Logos count: ${finalOrder.length}`);

    // 5. Generate HTML
    let html = '          <div class="ticker-track">\n';
    const generateItem = (filename) => {
        const isUass = filename.includes('uass');
        const className = isUass ? 'logo-item uass-special' : 'logo-item';
        const altName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
        return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="200" height="auto"></div>`;
    };

    html += '            <!-- Batch 1 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');
    html += '\n            <!-- Batch 2 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');
    html += '\n            <!-- Batch 3 -->\n';
    finalOrder.forEach(l => html += generateItem(l) + '\n');
    html += '          </div>';

    // 6. Update Index
    const indexHtmlPath = path.join(baseDir, 'index.html');
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

    // Find ticker-track div content
    // We look for <div class="ticker-track"> and the matching closing </div>
    // But since we just want to replace the whole block, let's use regex or safe find
    const startMarker = '<div class="ticker-track">';
    const endMarker = '</div>'; // This is risky if nested, but our structure is flat inside ticker-track? No, items have divs.

    // Better strategy: Find start line and end line based on indentation or context
    const lines = indexContent.split(/\r?\n/);
    let startIdx = -1;
    let endIdx = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('class="ticker-track"')) {
            startIdx = i;
        }
        // We assume the ticker-track closes when we see a </div> corresponding to the indentation? 
        // Or we search for the closing of `logo-ticker` which wraps `ticker-track`.
        // <div class="logo-ticker">
        //    <div class="ticker-track"> ... </div>
        // </div>
        if (startIdx !== -1 && i > startIdx) {
            if (lines[i].trim() === '</div>' && lines[i + 1] && lines[i + 1].trim() === '</div>') {
                endIdx = i; // This is the closing of ticker-track
                break;
            }
        }
    }

    if (startIdx !== -1 && endIdx !== -1) {
        console.log(`Replacing lines ${startIdx + 1} to ${endIdx + 1}`);
        const newLines = [
            ...lines.slice(0, startIdx),
            html,
            ...lines.slice(endIdx + 1)
        ];
        fs.writeFileSync(indexHtmlPath, newLines.join('\n'), 'utf8');
        console.log('Index updated.');
    } else {
        console.error('Could not find ticker-track block in index.html');
    }

} catch (err) {
    console.error('Error:', err);
}
