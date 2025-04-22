document.getElementById("scanButton").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;

  if (!files.length) {
    alert("Please select a folder first.");
    return;
  }

  const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv"];
  const subtitleExtensions = [".srt"];

  const fileMap = Array.from(files).reduce((map, file) => {
    map[file.webkitRelativePath] = file.name;
    return map;
  }, {});

  const baseNames = new Set();
  const subtitleNames = new Set();

  Object.keys(fileMap).forEach((path) => {
    const lower = path.toLowerCase();
    const base = path.substring(0, path.lastIndexOf("."));
    if (videoExtensions.some((ext) => lower.endsWith(ext))) {
      baseNames.add(base);
    } else if (subtitleExtensions.some((ext) => lower.endsWith(ext))) {
      subtitleNames.add(base);
    }
  });

  const missing = [...baseNames].filter((name) => !subtitleNames.has(name));
  displayResults(missing);
});

function displayResults(missingFiles) {
  const results = document.getElementById("results");
  const list = document.getElementById("missingList");
  const initialMessage = document.getElementById("initialMessage");

  list.innerHTML = "";

  if (missingFiles.length === 0) {
    list.innerHTML = `<li class="py-2">✅ All videos have subtitles!</li>`;
  } else {
    missingFiles.forEach((file) => {
      const filename = file.split("/").pop();
      const li = document.createElement("li");
      const fullPath = file.split("/").pop();

      li.className =
        "py-2 flex items-center gap-2 text-gray-800 justify-between";

      li.innerHTML = `
        <div class="flex items-center gap-2 overflow-hidden flex-grow">
          <i class="fas fa-video text-red-500 flex-shrink-0"></i>
          <span class="truncate block w-full" title="${fullPath}">${fullPath}</span>
        </div>
        <button title="Copy filename" class="copy-btn text-gray-500 hover:text-blue-600 p-1" data-name="${fullPath}">
          <i class="fas fa-copy"></i>
        </button>
      `;

      list.appendChild(li);
    });
  }

  results.classList.remove("hidden");
  initialMessage.classList.add("hidden");

  // Add click events to all copy buttons
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      navigator.clipboard.writeText(name);
      btn.innerHTML = `<i class="fas fa-check text-green-600"></i>`;
      setTimeout(() => {
        btn.innerHTML = `<i class="fas fa-copy"></i>`;
      }, 1500);
    });
  });
}
