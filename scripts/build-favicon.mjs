import { readFileSync, writeFileSync } from 'node:fs';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  throw new Error('Usage: node scripts/build-favicon.mjs input.png output.ico');
}

const png = readFileSync(input);
if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  throw new Error('Input must be a PNG image');
}

const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width < 1 || width > 256 || height < 1 || height > 256) {
  throw new Error('Icon dimensions must be between 1 and 256 pixels');
}

const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = width === 256 ? 0 : width;
header[7] = height === 256 ? 0 : height;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(header.length, 18);

writeFileSync(output, Buffer.concat([header, png]));
