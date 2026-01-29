const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const indexHtmlPath = path.join(baseDir, 'index.html');

// 1. Rename all files to include _v2 (physically new files)
const files = fs.readdirSync(logosDir);
let newFiles = [];

files.forEach(f => {
    // Skip if already v2
    if (f.includes('_v2')) return;

    // Skip UASS backup
    if (f === 'uass_save.png') return;

    const oldPath = path.join(logosDir, f);
    const ext = path.extname(f);
    const name = path.basename(f, ext);

    // Clean name
    const newName = `${name}_v2${ext}`;
    const newPath = path.join(logosDir, newName);

    try {
        fs.copyFileSync(oldPath, newPath);
        newFiles.push(newName);
        console.log(`Created ${newName}`);
        // Optional: delete old
        // fs.unlinkSync(oldPath); 
    } catch (e) {
        console.error(`Error processing ${f}: ${e.message}`);
    }
});

// If files were already renamed, let's find them
if (newFiles.length === 0) {
    newFiles = fs.readdirSync(logosDir).filter(f => f.includes('_v2'));
}

console.log(`Total new files: ${newFiles.length}`);

// 2. Order Logic (Same as before)
const uass = newFiles.find(f => f.includes('uass'));
const hltuning = newFiles.find(f => f.includes('hltuning'));
const motoMorini = newFiles.find(f => f.includes('morini')); // "motomorini_v2.png"

let general = newFiles.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let order = [];
if (general.length > 0) order.push(general.shift());
if (general.length > 0) order.push(general.shift());
if (hltuning) order.push(hltuning);
if (motoMorini) order.push(motoMorini);
if (uass) order.push(uass);
order = order.concat(general);

// 3. Generate HTML
let html = '          <div class="ticker-track">\n';
const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    // Remove _v2 for alt text
    const cleanName = filename.replace('_v2', '').replace(path.extname(filename), '');
    const altName = cleanName.replace(/-/g, ' ').toUpperCase();

    return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="200" height="auto"></div>`;
};

// 3 Batches
html += '            <!-- Batch 1 -->\n';
order.forEach(l => html += generateItem(l) + '\n');
html += '\n            <!-- Batch 2 -->\n';
order.forEach(l => html += generateItem(l) + '\n');
html += '\n            <!-- Batch 3 -->\n';
order.forEach(l => html += generateItem(l) + '\n');
html += '          </div>';


// 4. Update Index.html
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

const startMarker = '<div class="ticker-track">';
// We know lines based, but let's try strict string replacement if the previous content matches
// Or fall back to line finding which is robust

const lines = indexContent.split(/\r?\n/);
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="ticker-track"')) {
        startIdx = i;
    }
    // Logic: Look for the closing div of the track, which should be followed by closing div of ticker
    // OR just find the next </div></div> sequence or similar heuristic
    // Since we just wrote it, we know it closes with </div>.
    if (startIdx !== -1 && i > startIdx) {
        if (lines[i].trim() === '</div>' && lines[i + 1] && lines[i + 1].trim() === '</div>') {
            endIdx = i;
            break;
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    console.log(`Replacing lines ${startIdx + 1}-${endIdx + 1}`);
    const newLines = [
        ...lines.slice(0, startIdx),
        html,
        ...lines.slice(endIdx + 1)
    ];
    fs.writeFileSync(indexHtmlPath, newLines.join('\n'), 'utf8');
    console.log('index.html updated successfully.');
} else {
    console.error('Could not find existing ticker track block.');
}
