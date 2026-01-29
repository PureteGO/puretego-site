const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const sourceDir = path.join(baseDir, 'logos_clientes');
// NEW DESTINATION to bypass any 'img/logos' corruption/locks
const destDir = path.join(baseDir, 'img', 'clientes');
const indexHtmlPath = path.join(baseDir, 'index.html');

console.log('--- FORCED MIGRATION TO img/clientes ---');

// 1. Create New Dir
if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// 2. Map
const renameMap = {
    'logohorizontal.png': 'tecnocor.png',
    'logo_sancristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png'
};

const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
const files = fs.readdirSync(sourceDir);
let validFiles = [];

files.forEach(file => {
    // Skip old
    if (file.toLowerCase() === 'carnescampo9.png') return;

    const ext = path.extname(file).toLowerCase();
    if (!validExts.includes(ext)) return;

    const lowerName = file.toLowerCase();
    let finalName = lowerName; // Default to lowercase filename

    // Rename logic
    if (renameMap[lowerName]) {
        finalName = renameMap[lowerName];
    } else {
        // Just lowercase it for consistency
        finalName = file.toLowerCase();
    }

    try {
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, finalName));
        validFiles.push(finalName);
    } catch (e) {
        console.error(`Error copying ${file}: ${e.message}`);
    }
});

console.log(`Copied ${validFiles.length} files to img/clientes`);

// 3. Order (UASS, HLTuning, MotoMorini)
const uass = validFiles.find(f => f.includes('uass'));
const hltuning = validFiles.find(f => f.includes('hltuning'));
const motoMorini = validFiles.find(f => f.includes('morini'));

let others = validFiles.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let ticker = [];
if (others.length > 0) ticker.push(others.shift());
if (others.length > 0) ticker.push(others.shift());
if (hltuning) ticker.push(hltuning);
if (motoMorini) ticker.push(motoMorini);
if (uass) ticker.push(uass);
ticker = ticker.concat(others);

// 4. Generate HTML
let html = '          <div class="ticker-track">\n';
const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const cleanName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    // Use img/clientes path
    return `            <div class="${className}"><img src="img/clientes/${filename}" alt="${cleanName}" loading="lazy" width="200" height="auto"></div>`;
};

[1, 2, 3].forEach(b => {
    html += `            <!-- Batch ${b} -->\n`;
    ticker.forEach(l => html += generateItem(l) + '\n');
    html += '\n';
});

html += '          </div>';

// 5. Update HTML
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
const lines = indexContent.split(/\r?\n/);
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="ticker-track"')) {
        startIdx = i;
    }
    if (startIdx !== -1 && i > startIdx) {
        if (lines[i].trim() === '</div>') {
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
    console.log('✓ index.html updated.');
} else {
    // If empty found (likely), we replace the empty block we just saw in view_file
    // The previous view_file showed lines 559-566 are just batch comments.
    // The previous script wrote comments but no items.
    // We can rely on the same startIdx logic.
    console.error('! Could not find block indices. Check file manually.');
}
