import { getEncoding } from "https://cdn.jsdelivr.net/npm/js-tiktoken@1.0.12/+esm";

const encoder = getEncoding("cl100k_base");

const input = document.getElementById("text-input");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
const tokenCountEl = document.getElementById("token-count");
const analyzeBtn = document.getElementById("analyze-btn");

input.addEventListener("input", () => {
  updateLiveCounts(input.value);
});

function updateLiveCounts(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const tokenCount = encoder.encode(text).length;

  wordCountEl.textContent = wordCount.toLocaleString();
  charCountEl.textContent = charCount.toLocaleString();
  tokenCountEl.textContent = tokenCount.toLocaleString();

  document.getElementById("results-container").classList.remove("hidden");
}

document.getElementById("enable-chunking").addEventListener("change", (e) => {
  document
    .getElementById("chunk-size-container")
    .classList.toggle("hidden", !e.target.checked);
});

function createResultCard(fullContent, previewLimit = 300) {
  const wrapper = document.createElement("div");
  wrapper.className = "w-full";

  const card = document.createElement("div");
  card.className =
    "p-4 bg-gray-100 rounded border border-gray-300 text-gray-800 whitespace-pre-wrap flex justify-between items-start";

  const contentSpan = document.createElement("span");
  const preview =
    fullContent.length > previewLimit
      ? fullContent.slice(0, previewLimit) + "..."
      : fullContent;
  contentSpan.textContent = preview;
  contentSpan.className = "flex-grow";

  const copyBtn = document.createElement("button");
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.className = "text-sm text-gray-600 hover:text-blue-600 ml-4 mt-1";
  copyBtn.title = "Copy to clipboard";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(fullContent); // full, not preview
    copyBtn.innerHTML = '<i class="fas fa-check text-green-600"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 1500);
  };

  card.appendChild(contentSpan);
  card.appendChild(copyBtn);
  wrapper.appendChild(card);
  return wrapper;
}

analyzeBtn.addEventListener("click", () => {
  const resultsContainer = document.getElementById("results-container");
  const chunksContainer = document.getElementById("chunks-output");
  chunksContainer.innerHTML = "";

  let text = input.value;
  const stripHTML = document.getElementById("strip-html").checked;
  const chunkingEnabled = document.getElementById("enable-chunking").checked;
  const chunkSize =
    parseInt(document.getElementById("chunk-size").value) || 100;
  const previewLimit =
    parseInt(document.getElementById("chunk-preview-length").value) || 300;

  if (stripHTML) {
    const parser = new DOMParser();
    const cleanDoc = parser.parseFromString(text, "text/html");
    text = cleanDoc.body.textContent || "";
  }

  updateLiveCounts(text);

  if (stripHTML && !chunkingEnabled) {
    const card = createResultCard(text);
    chunksContainer.appendChild(card);
    document.getElementById("chunks-container").classList.remove("hidden");
    document.getElementById("chunk-count-item").classList.add("hidden");
    return;
  }

  if (chunkingEnabled) {
    const tokens = encoder.encode(text);
    let chunkCounter = 0;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunkText = encoder.decode(tokens.slice(i, i + chunkSize));
      const card = createResultCard(chunkText, previewLimit);
      chunksContainer.appendChild(card);
      chunkCounter++;
    }
    const chunkCountEl = document.getElementById("chunk-count");
    const chunkCountItem = document.getElementById("chunk-count-item");
    chunkCountEl.textContent = chunkCounter.toLocaleString();
    chunkCountItem.classList.remove("hidden");

    document.getElementById("chunks-container").classList.remove("hidden");
  } else {
    document.getElementById("chunk-count-item").classList.add("hidden");
    document.getElementById("chunks-container").classList.add("hidden");
  }
});
