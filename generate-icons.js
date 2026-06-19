const fs = require("fs");
const path = require("path");

function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#1e293b"/>
      <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" rx="${size * 0.05}" fill="#3b82f6"/>
      <rect x="${size * 0.25}" y="${size * 0.3}" width="${size * 0.5}" height="${size * 0.05}" fill="#ffffff"/>
      <rect x="${size * 0.25}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.03}" fill="#ffffff" opacity="0.8"/>
      <rect x="${size * 0.25}" y="${size * 0.47}" width="${size * 0.3}" height="${size * 0.03}" fill="#ffffff" opacity="0.6"/>
    </svg>
  `;
  return svg;
}

const icons = [
  { size: 192, filename: "icon-192.svg" },
  { size: 512, filename: "icon-512.svg" },
];

icons.forEach((icon) => {
  const svgContent = createIcon(icon.size);
  fs.writeFileSync(
    path.join(__dirname, "public", icon.filename),
    svgContent.trim()
  );
});

console.log("SVG icons generated! To convert to PNG, you can use a tool like svgexport.");
