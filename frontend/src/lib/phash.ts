// Perceptual hash (DCT-based, 64 bit) for images. Returns 16-char hex or null
// for non-image files. The file never leaves the browser.
const SIZE = 32;
const LOW = 8;

function dct2d(m: number[][]): number[][] {
  const out = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
  for (let u = 0; u < LOW; u++) {
    for (let v = 0; v < LOW; v++) {
      let sum = 0;
      for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
          sum +=
            m[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * SIZE)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * SIZE));
        }
      }
      out[u][v] = sum;
    }
  }
  return out;
}

export async function phashFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0, SIZE, SIZE);
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

    const gray: number[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        gray[x][y] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
    }

    const d = dct2d(gray);
    const vals: number[] = [];
    for (let u = 0; u < LOW; u++) for (let v = 0; v < LOW; v++) vals.push(d[u][v]);

    // median excluding the DC term
    const sorted = vals.slice(1).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const bits = vals.map((v) => (v > median ? "1" : "0")).join("");

    let hex = "";
    for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex;
  } catch {
    return null;
  }
}
