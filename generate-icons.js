const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function createIconSVG(size) {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#1e293b"/>
      <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" rx="${size * 0.05}" fill="#3b82f6"/>
      <rect x="${size * 0.25}" y="${size * 0.3}" width="${size * 0.5}" height="${size * 0.05}" fill="#ffffff"/>
      <rect x="${size * 0.25}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.03}" fill="#ffffff" opacity="0.8"/>
      <rect x="${size * 0.25}" y="${size * 0.47}" width="${size * 0.3}" height="${size * 0.03}" fill="#ffffff" opacity="0.6"/>
    </svg>
  `;
}

const iconSizes = [
  16, 32, 48, 64, 72, 96, 128, 144, 152, 192, 256, 384, 512
];

async function generateIcons() {
  console.log("Generating icons...");

  for (const size of iconSizes) {
    const svgContent = createIconSVG(size);
    const svgBuffer = Buffer.from(svgContent.trim());
    
    // Save SVG
    if (size === 192 || size === 512) {
      fs.writeFileSync(
        path.join(__dirname, "public", `icon-${size}.svg`),
        svgContent.trim()
      );
    }
    
    // Save PNG
    await sharp(svgBuffer)
      .png()
      .toFile(path.join(__dirname, "public", `icon-${size}.png`));
    
    console.log(`Generated icon-${size}.png`);
  }

  console.log("All icons generated successfully!");
}

generateIcons().catch(console.error);
