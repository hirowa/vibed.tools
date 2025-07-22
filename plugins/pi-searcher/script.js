/* ----------------------------------------------------------
   π Digit Finder v1.1
   • Streams huge π text file in 4 MB chunks
   • KMP search for digit sequences
   • Accepts pure digits  OR  words (A‑Z) ⇒ compact base‑26 decimal
---------------------------------------------------------- */

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB

// ── DOM
const fileInput = document.getElementById("pi-file");
const searchInput = document.getElementById("search-term");
const maxResultsInput = document.getElementById("max-results");
const searchBtn = document.getElementById("search-btn");
const cancelBtn = document.getElementById("cancel-btn");
const progressWrap = document.getElementById("progress-wrapper");
const progressBar = document.getElementById("progress-bar");
const progressPct = document.getElementById("progress-percent");
const resultsCard = document.getElementById("results-card");
const matchCountSpan = document.getElementById("match-count");
const matchList = document.getElementById("match-list");
const welcome = document.getElementById("welcome");

let controller = null; // AbortController for cancellation

// ── KMP preprocessing
function buildLps(pattern) {
  const lps = new Array(pattern.length).fill(0);
  for (let len = 0, i = 1; i < pattern.length; ) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }
  return lps;
}

// ── Convert word (A‑Z) → decimal string (base‑26)
function wordToDecimal(word) {
  let val = 0n;
  for (const ch of word) {
    val = val * 26n + BigInt(ch.charCodeAt(0) - 65); // A=0 … Z=25
  }
  return val.toString();
}

// ── Stream search
async function findInFile(file, pattern, maxMatches, onProgress, signal) {
  const lps = buildLps(pattern);
  const decoder = new TextDecoder("utf-8");
  const reader = file.stream().getReader({ signal });

  let globalPos = 0; // digits processed so far
  let tail = ""; // overlap from previous chunk
  const matches = [];

  while (true) {
    const { value: chunk, done } = await reader.read();
    if (done) break;

    const text = tail + decoder.decode(chunk, { stream: true });
    const clean = text.replace(/[^0-9]/g, ""); // strip newlines/spaces

    searchWithin(
      clean,
      pattern,
      lps,
      globalPos - tail.length,
      matches,
      maxMatches
    );
    if (matches.length >= maxMatches) break;

    tail = clean.slice(-pattern.length + 1); // keep overlap
    globalPos += clean.length;

    onProgress(globalPos / file.size);
  }
  return matches;
}

// ── KMP search inside chunk
function searchWithin(text, pattern, lps, globalOffset, outArr, maxMatches) {
  let i = 0,
    j = 0;
  while (i < text.length && outArr.length < maxMatches) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        outArr.push(globalOffset + i - pattern.length + 1); // 1‑based
        j = lps[j - 1];
      }
    } else {
      j ? (j = lps[j - 1]) : i++;
    }
  }
}

// ── UI helpers
function resetUI() {
  progressWrap.classList.add("hidden");
  progressBar.style.width = "0%";
  progressPct.textContent = "0%";
  matchList.innerHTML = "";
  matchCountSpan.textContent = "";
  resultsCard.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  searchBtn.disabled = false;
}

function showMatches(matches, originalInput) {
  matchList.innerHTML = matches
    .map(
      (pos) => `<li class="py-3">
        <span class="font-mono text-blue-600">${pos.toLocaleString()}</span>
        <span class="text-gray-700">– starting index of “${originalInput}”</span>
      </li>`
    )
    .join("");
  matchCountSpan.textContent = `${matches.length} match${
    matches.length === 1 ? "" : "es"
  }`;
  resultsCard.classList.remove("hidden");
}

// ── Event handler
searchBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const rawInput = searchInput.value.trim();
  const maxMatches = +maxResultsInput.value || 20;

  if (!file) return alert("Please select your pi‑billion.txt file.");
  if (!rawInput) return alert("Enter a digit sequence or word to search.");

  // Determine search pattern
  let pattern;
  if (/^[0-9]+$/.test(rawInput)) {
    pattern = rawInput; // digits as‑is
  } else {
    const letters = rawInput.toUpperCase().replace(/[^A-Z]/g, "");
    if (!letters) return alert("Text input supports A‑Z letters only.");
    pattern = wordToDecimal(letters);
  }

  // UI
  resetUI();
  welcome.classList.add("hidden");
  progressWrap.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  searchBtn.disabled = true;

  controller = new AbortController();
  const { signal } = controller;

  try {
    const matches = await findInFile(
      file,
      pattern,
      maxMatches,
      (p) => {
        const pct = Math.min(100, Math.floor(p * 100));
        progressBar.style.width = `${pct}%`;
        progressPct.textContent = `${pct}%`;
      },
      signal
    );
    showMatches(matches, rawInput);
  } catch (err) {
    if (err.name !== "AbortError") console.error(err);
  } finally {
    cancelBtn.classList.add("hidden");
    progressWrap.classList.add("hidden");
    searchBtn.disabled = false;
  }
});

cancelBtn.addEventListener("click", () => {
  controller?.abort();
  resetUI();
  welcome.classList.remove("hidden");
});
