const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, 'img', 'logos', 'alusiza.png');
const destPath = path.join(__dirname, 'img', 'logos', 'alusiza_v2.png');

try {
    console.log(`Reading ${imgPath}...`);
    const data = fs.readFileSync(imgPath);
    console.log(`Read ${data.length} bytes.`);

    console.log(`Writing to ${destPath}...`);
    fs.writeFileSync(destPath, data);
    console.log(`Success!`);
} catch (e) {
    console.error(`Error: ${e.message}`);
}
