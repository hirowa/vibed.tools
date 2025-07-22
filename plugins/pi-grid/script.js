/* ----------------------------------------------------------
   π Grid Visualizer  v1.2   — FULL WORKING COPY
---------------------------------------------------------- */

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB

// ── DOM
const fileInput = document.getElementById("pi-file");
const searchInput = document.getElementById("search-term");
const gridXInput = document.getElementById("grid-x");
const gridYInput = document.getElementById("grid-y");
const positionInput = document.getElementById("position");
const marginInput = document.getElementById("margin");

const fontSelect = document.getElementById("font-select");

const generateBtn = document.getElementById("generate-btn");
const exportBtn = document.getElementById("export-btn");

const progressWrap = document.getElementById("progress-wrapper");
const progressBar = document.getElementById("progress-bar");
const progressPct = document.getElementById("progress-percent");

const gridContainer = document.getElementById("grid-container");
const gridDisplay = document.getElementById("grid-display");

let lastGridPlain = "";
let lastGridBold = "";

fontSelect.addEventListener("change", () =>
  document.documentElement.style.setProperty("--grid-font", fontSelect.value)
);

// ──────────────────────────────────────────────────────────
//  Low‑level helpers
// ──────────────────────────────────────────────────────────
function buildLps(p) {
  const lps = Array(p.length).fill(0);
  for (let len = 0, i = 1; i < p.length; )
    p[i] === p[len] ? (lps[i++] = ++len) : len ? (len = lps[len - 1]) : i++;
  return lps;
}

async function findSequence(file, pattern, onProgress, signal) {
  const lps = buildLps(pattern);
  const decoder = new TextDecoder("utf-8");
  const reader = file.stream().getReader({ signal });

  let globalPos = 0; // digits processed so far (no duplicates)
  let tail = ""; // last pattern‑1 digits from previous chunk

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    // Clean only the *new* chunk
    const chunkDigits = decoder
      .decode(value, { stream: true })
      .replace(/[^0-9]/g, "");

    // Prepend tail for boundary matches
    const text = tail + chunkDigits;

    // ── KMP search over (tail + chunkDigits)
    let i = 0,
      j = 0;
    while (i < text.length) {
      if (text[i] === pattern[j]) {
        i++;
        j++;
        if (j === pattern.length) {
          const pos = globalPos - tail.length + i - pattern.length + 1; // 1‑based
          return pos;
        }
      } else {
        j ? (j = lps[j - 1]) : i++;
      }
    }

    // Prepare tail for next loop
    tail = text.slice(-pattern.length + 1);

    // Only count *unique* new digits
    globalPos += chunkDigits.length;

    onProgress(globalPos / file.size); // byte‑based progress (good enough)
  }
  return -1;
}

async function extractDigits(file, startIdx, length, signal) {
  const decoder = new TextDecoder("utf-8");
  const reader = file.stream().getReader({ signal });

  let globalPos = 0;
  let digits = "";

  while (digits.length < length) {
    const { value, done } = await reader.read();
    if (done) break;

    const clean = decoder
      .decode(value, { stream: true })
      .replace(/[^0-9]/g, "");
    const nextPos = globalPos + clean.length;

    if (nextPos > startIdx) {
      const sliceStart = Math.max(0, startIdx - globalPos);
      digits += clean.slice(sliceStart, sliceStart + (length - digits.length));
    }
    globalPos = nextPos;
  }
  return digits.padEnd(length, "0");
}

function wordToDecimal(word) {
  let n = 0n;
  for (const ch of word) n = n * 26n + BigInt(ch.charCodeAt(0) - 65);
  return n.toString();
}

function placementCoords(pos, w, h, seqLen, m) {
  const centerRow = Math.floor((h - 1) / 2);
  const centerCol = Math.floor((w - seqLen) / 2);
  const bottomRow = h - m - 1;
  const rightCol = w - m - seqLen;

  switch (pos) {
    case "tl":
      return { r: m, c: m };
    case "tc":
      return { r: m, c: centerCol };
    case "tr":
      return { r: m, c: rightCol };
    case "cl":
      return { r: centerRow, c: m };
    case "c":
      return { r: centerRow, c: centerCol };
    case "cr":
      return { r: centerRow, c: rightCol };
    case "bl":
      return { r: bottomRow, c: m };
    case "bc":
      return { r: bottomRow, c: centerCol };
    case "br":
      return { r: bottomRow, c: rightCol };
    default:
      return { r: m, c: m };
  }
}

// ──────────────────────────────────────────────────────────
//  Grid builder
// ──────────────────────────────────────────────────────────
function buildGrid(
  digits,
  w,
  h,
  seqRow,
  seqCol,
  seqLenDigits,
  isLetter,
  inputWord
) {
  const rowsPlain = [];
  const rowsBold = [];

  for (let r = 0; r < h; r++) {
    const raw = digits.slice(r * w, (r + 1) * w).split("");

    let symbols = raw;
    if (isLetter) {
      symbols = raw.map((d, idx) =>
        String.fromCharCode(65 + ((parseInt(d, 10) + r * w + idx) % 26))
      );
      if (r === seqRow)
        for (let k = 0; k < inputWord.length; k++)
          symbols[seqCol + k] = inputWord[k];
    }

    const spaced = symbols.join(" ");
    rowsPlain.push(spaced);

    if (r === seqRow) {
      const boldLen = (isLetter ? inputWord.length : seqLenDigits) * 2 - 1;
      const start = seqCol * 2;
      rowsBold.push(
        spaced.slice(0, start) +
          '<span class="font-super">' +
          spaced.slice(start, start + boldLen) +
          "</span>" +
          spaced.slice(start + boldLen)
      );
    } else rowsBold.push(spaced);
  }
  return { plain: rowsPlain.join("\n"), bold: rowsBold.join("\n") };
}

// ──────────────────────────────────────────────────────────
//  SVG
// ──────────────────────────────────────────────────────────
function gridToSVG(gridPlain, w, h, seqRow, seqCol, displayLen) {
  const fontSize = 14;
  const svgW = (w * 2 - 1) * 8.5;
  const svgH = h * fontSize * 1.2;
  const lines = gridPlain.split("\n");

  const svgLines = lines.map((ln, i) => {
    const y = (i + 1) * fontSize;
    if (i !== seqRow) return `<text x="0" y="${y}">${ln}</text>`;
    const start = seqCol * 2;
    const boldLen = displayLen * 2 - 1;
    return `<text x="0" y="${y}">${ln.slice(
      0,
      start
    )}<tspan class="font-super">${ln.slice(
      start,
      start + boldLen
    )}</tspan>${ln.slice(start + boldLen)}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}"
     xmlns="http://www.w3.org/2000/svg">
  <style>
    .font-super { font-weight: 950 !important; }
    text { font-family: var(--grid-font, monospace); font-size: ${fontSize}px; white-space: pre; }
  </style>
  ${svgLines.join("\n")}
</svg>`;
}

// ──────────────────────────────────────────────────────────
//  UI helpers
// ──────────────────────────────────────────────────────────
function setProgress(p) {
  const pct = Math.min(100, Math.floor(p * 100));
  progressBar.style.width = `${pct}%`;
  progressPct.textContent = `${pct}%`;
}

function resetUI() {
  progressWrap.classList.add("hidden");
  gridContainer.classList.add("hidden");
  exportBtn.classList.add("hidden");
  gridDisplay.innerHTML = "";
}

// ──────────────────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────────────────
generateBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const rawInput = searchInput.value.trim();
  const W = +gridXInput.value;
  const H = +gridYInput.value;
  const posChoice = positionInput.value;
  const margin = +marginInput.value;

  if (!file) return alert("Please select your pi‑billion.txt file.");
  if (!rawInput) return alert("Enter a digit sequence or word.");
  if (W < 1 || H < 1) return alert("Grid size must be positive.");

  // Determine pattern
  const isLetter = !/^[0-9]+$/.test(rawInput);
  let pattern, displayLen;

  if (isLetter) {
    const letters = rawInput.toUpperCase().replace(/[^A-Z]/g, "");
    if (!letters) return alert("Text input supports A‑Z only.");
    pattern = wordToDecimal(letters);
    displayLen = letters.length;
  } else {
    pattern = rawInput;
    displayLen = pattern.length;
  }
  const seqLen = pattern.length;

  if (displayLen > W) return alert("Sequence longer than grid width.");

  resetUI();
  progressWrap.classList.remove("hidden");
  setProgress(0);

  const ctrl = new AbortController();
  const signal = ctrl.signal;

  // 1. Find sequence
  const foundPos = await findSequence(file, pattern, setProgress, signal);
  if (foundPos === -1) {
    resetUI();
    return alert("Sequence not found in π.");
  }

  // 2. Grid anchor
  let { r: seqRow, c: seqCol } = placementCoords(
    posChoice,
    W,
    H,
    seqLen,
    margin
  );
  const offset = seqRow * W + seqCol;
  let startIdx = foundPos - 1 - offset; // 0‑based

  if (startIdx < 0) {
    const shift = -startIdx;
    startIdx = 0;
    const newOff = offset - shift;
    seqRow = Math.floor(newOff / W);
    seqCol = newOff % W;
  }

  // 3. Pull digits for grid
  const gridSize = W * H;
  const digits = await extractDigits(file, startIdx, gridSize, signal);

  // 3a. DEBUG group
  console.groupCollapsed("π‑Grid Debug");
  console.log("rawInput / pattern:", rawInput, pattern);
  console.log("foundPos (1‑based):", foundPos);
  console.log(
    "startIdx:",
    startIdx,
    "offset:",
    offset,
    "seqRow, seqCol:",
    seqRow,
    seqCol
  );
  console.log(
    "digits @ highlight slice:",
    digits.slice(seqRow * W + seqCol, seqRow * W + seqCol + seqLen)
  );
  console.groupEnd();

  // 4. **Verify** that the digits at highlight location match pattern;
  //    if not, search within extracted grid and realign.
  const localIdx = digits.indexOf(pattern);
  if (localIdx !== -1 && localIdx + seqLen <= gridSize) {
    seqRow = Math.floor(localIdx / W);
    seqCol = localIdx % W;
  }

  // 5. Build grid + display
  const { plain, bold } = buildGrid(
    digits,
    W,
    H,
    seqRow,
    seqCol,
    seqLen,
    isLetter,
    rawInput
  );

  lastGridPlain = plain;
  lastGridBold = bold;

  document.documentElement.style.setProperty("--grid-font", fontSelect.value);

  gridDisplay.innerHTML = bold;
  gridContainer.classList.remove("hidden");
  exportBtn.classList.remove("hidden");
  progressWrap.classList.add("hidden");
});

// ── SVG export
exportBtn.addEventListener("click", () => {
  if (!lastGridPlain) return;

  const W = +gridXInput.value;
  const H = +gridYInput.value;
  const rawInput = searchInput.value.trim();
  const isLetter = !/^[0-9]+$/.test(rawInput);
  const displayLen = isLetter
    ? rawInput.toUpperCase().replace(/[^A-Z]/g, "").length
    : rawInput.length;

  const seqLen = isLetter
    ? wordToDecimal(rawInput.toUpperCase().replace(/[^A-Z]/g, "")).length
    : rawInput.length;

  const coords = placementCoords(
    positionInput.value,
    W,
    H,
    seqLen,
    +marginInput.value
  );

  const svgStr = gridToSVG(lastGridPlain, W, H, coords.r, coords.c, displayLen);

  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: "pi-grid.svg",
  });
  a.click();
  URL.revokeObjectURL(url);
});
