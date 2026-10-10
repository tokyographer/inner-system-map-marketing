/**
 * Regenerates the app icons from the Transcendent Institute logomark (gold, #DDAA11, from the
 * brand file ti-logomark-gold.png): app/icon.svg (tabs, any size), app/favicon.ico (16/32/48 for
 * old browsers) and app/apple-icon.png (180 px on platinum, because iOS fills transparency with
 * black). The geometry is the same stepped cross as public/brand/chakana-mark.svg.
 * Run: node scripts/build-favicons.mjs
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const GOLD = "#DDAA11";
const PLATINUM = "#F3F5F8";
const PATH = "M31.07 0 H68.93 V12.19 H87.81 V31.07 H100 V68.93 H87.81 V87.81 H68.93 V100 H31.07 V87.81 H12.19 V68.93 H0 V31.07 H12.19 V12.19 H31.07 Z M50 31 a19 19 0 1 0 0.001 0 Z";
const svg = (size = 100) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><title>Transcendent Institute</title><path fill="${GOLD}" fill-rule="evenodd" d="${PATH}"/></svg>\n`;

writeFileSync("app/icon.svg", svg());

const png = (size) => sharp(Buffer.from(svg(size)), { density: 300 }).resize(size, size).png().toBuffer();

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
writeFileSync("app/favicon.ico", Buffer.concat([header, ...entries, ...images]));

const mark = await png(116);
await sharp({ create: { width: 180, height: 180, channels: 4, background: PLATINUM } })
  .composite([{ input: mark, gravity: "centre" }])
  .png()
  .toFile("app/apple-icon.png");

console.log("wrote app/icon.svg, app/favicon.ico (16/32/48) and app/apple-icon.png (180)");
