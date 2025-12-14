const fs = require('fs');
const path = require('path');

// Simple function to create a colored square PNG
function createPNG(size, color, outputPath) {
  const width = size;
  const height = size;

  // PNG header and data
  const png = [];

  // PNG signature
  png.push(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  png.push(...ihdrChunk);

  // IDAT chunk (image data)
  const imageData = [];
  for (let y = 0; y < height; y++) {
    imageData.push(0); // filter type for scanline
    for (let x = 0; x < width; x++) {
      imageData.push(...color); // RGB
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(imageData));
  const idatChunk = createChunk('IDAT', compressed);
  png.push(...idatChunk);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  png.push(...iendChunk);

  fs.writeFileSync(outputPath, Buffer.from(png));
  console.log(`Created ${outputPath}`);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return [...length, ...typeBuffer, ...data, ...crcBuffer];
}

function calculateCRC(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0; // Force unsigned
}

// Create icons with a blue color (RGB: 70, 130, 180)
const color = [70, 130, 180];
const iconsDir = path.join(__dirname, 'dist', 'icons');

createPNG(16, color, path.join(iconsDir, 'icon16.png'));
createPNG(48, color, path.join(iconsDir, 'icon48.png'));
createPNG(128, color, path.join(iconsDir, 'icon128.png'));

console.log('All icons created successfully!');
