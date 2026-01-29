const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const sourceDir = path.join(baseDir, 'logos_clientes');
const destDir = path.join(baseDir, 'img', 'logos');
const indexHtmlPath = path.join(baseDir, 'index.html');

console.log('--- STARTING FINAL LOGO SYNC ---');

// 1. Ensure Source Exists
if (!fs.existsSync(sourceDir)) {
    console.error('Source directory logos_clientes not found!');
    process.exit(1);
}

// 2. Clear Destination (Rimraf style)
if (fs.existsSync(destDir)) {
    console.log(`Clearing ${destDir}...`);
    fs.readdirSync(destDir).forEach(f => {
        try { fs.unlinkSync(path.join(destDir, f)); } catch (e) { }
    });
} else {
    fs.mkdirSync(destDir, { recursive: true });
}

// 3. Define Rename Rules (Critical for specific clients)
const renameMap = {
    'logohorizontal.png': 'tecnocor.png',
    'logo_sancristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png',
    // Ensure others are mapped if needed, but these are the main "renames"
};

// 4. Process and Copy Files
const files = fs.readdirSync(sourceDir);
let copiedFiles = [];

files.forEach(file => {
    // IGNORE the old carnescampo9
    if (file.toLowerCase() === 'carnescampo9.png') return;

    // Determine New Name
    const lowerName = file.toLowerCase();
    let finalName = lowerName;

    if (renameMap[lowerName]) {
        finalName = renameMap[lowerName];
    }

    // Copy
    try {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, finalName);
        fs.copyFileSync(srcPath, destPath);

        // Verify Size
        const stats = fs.statSync(destPath);
        if (stats.size > 0) {
            copiedFiles.push(finalName);
            console.log(`✓ [${finalName}] copied from [${file}]`);
        } else {
            console.error(`X [${finalName}] is empty!`);
        }
    } catch (e) {
        console.error(`Error copying ${file}: ${e.message}`);
    }
});

// 5. Sort for Ticker (Generics first, UASS special)
// Priority: UASS, HLTuning, MotoMorini
const uass = copiedFiles.find(f => f.includes('uass'));
const hltuning = copiedFiles.find(f => f.includes('hltuning'));
const motoMorini = copiedFiles.find(f => f.includes('morini'));

let others = copiedFiles.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let tickerList = [];
// Pick 2 random/generic for start if available
if (others.length > 0) tickerList.push(others.shift());
if (others.length > 0) tickerList.push(others.shift());

// Add "Anchors"
if (hltuning) tickerList.push(hltuning);
if (motoMorini) tickerList.push(motoMorini);
if (uass) tickerList.push(uass);

// Add Rest
tickerList = tickerList.concat(others);

console.log(`Generating ticker for ${tickerList.length} logos.`);

// 6. Generate HTML
let html = '          <div class="ticker-track">\n';
const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const cleanName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    // V=FINAL to force refresh
    return `            <div class="${className}"><img src="img/logos/${filename}?v=final" alt="${cleanName}" loading="lazy" width="200" height="auto"></div>`;
};

// 3 Batches
[1, 2, 3].forEach(b => {
    html += `            <!-- Batch ${b} -->\n`;
    tickerList.forEach(l => html += generateItem(l) + '\n');
    html += '\n';
});
html += '          </div>';


// 7. Update index.html
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
const lines = indexContent.split(/\r?\n/);
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="ticker-track"')) {
        startIdx = i;
    }
    if (startIdx !== -1 && i > startIdx) {
        // Find closing div of ticker-track
        if (lines[i].trim() === '</div>') {
            // Check context: usually followed by closing logo-ticker div
            if (lines[i + 1] && lines[i + 1].trim() === '</div>') {
                endIdx = i;
                break;
            }
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const newLines = [
        ...lines.slice(0, startIdx),
        html,
        ...lines.slice(endIdx + 1)
    ];
    fs.writeFileSync(indexHtmlPath, newLines.join('\n'), 'utf8');
    console.log('✓ index.html updated successfully with new file list.');
} else {
    console.error('! Failed to find insertion point in HTML.');
}
