// Generate app icons with no image dependencies: a pure-Node PNG encoder draws
// the Intentions mark (a focus ring + dot on an indigo→violet field). Also
// writes the SVG used for the favicon / apple-touch fallback.
//
//   npm run icons

import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "public");
fs.mkdirSync(outDir, { recursive: true });

// --- tiny PNG encoder (truecolor + alpha) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  // 10,11,12 = compression, filter, interlace = 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const ring = size * 0.3; // ring radius
  const ringW = size * 0.055; // ring thickness
  const dot = size * 0.11; // inner dot radius
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // diagonal gradient: indigo (#4F46E5) -> violet (#7C3AED)
      const t = (x + y) / (2 * size);
      let r = mix(0x4f, 0x7c, t);
      let g = mix(0x46, 0x3a, t);
      let b = mix(0xe5, 0xed, t);
      const d = Math.hypot(x - cx, y - cy);
      // focus ring + dot in soft white
      const onRing = Math.abs(d - ring) < ringW;
      const inDot = d < dot;
      if (onRing || inDot) {
        const edge = onRing
          ? 1 - Math.min(1, (Math.abs(d - ring) / ringW) ** 2)
          : 1 - Math.min(1, (d / dot) ** 4);
        const a = 0.55 + 0.4 * edge;
        r = mix(r, 0xff, a);
        g = mix(g, 0xff, a);
        b = mix(b, 0xff, a);
      }
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }
  return encodePng(size, size, buf);
}

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  fs.writeFileSync(path.join(outDir, name), drawIcon(size));
  console.log("wrote", name);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4F46E5"/>
      <stop offset="1" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#fff" stroke-width="28" opacity="0.92"/>
  <circle cx="256" cy="256" r="56" fill="#fff"/>
</svg>
`;
fs.writeFileSync(path.join(outDir, "icon.svg"), svg);
console.log("wrote icon.svg");
