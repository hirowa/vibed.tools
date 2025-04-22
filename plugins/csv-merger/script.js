let folderHandle = null;

document.getElementById("pickFolderBtn").addEventListener("click", async () => {
  try {
    folderHandle = await window.showDirectoryPicker();
    document.getElementById("folderPath").textContent = folderHandle.name;
  } catch (err) {
    console.error("Folder selection cancelled or unsupported.", err);
  }
});

document.getElementById("mergeBtn").addEventListener("click", async () => {
  if (!folderHandle) {
    alert("Please choose a folder first.");
    return;
  }

  const csvFiles = [];
  for await (const [name, handle] of folderHandle.entries()) {
    if (handle.kind === "file" && name.endsWith(".csv")) {
      const file = await handle.getFile();
      const text = await file.text();
      csvFiles.push(text);
    }
  }

  if (csvFiles.length === 0) {
    alert("No CSV files found in this folder.");
    return;
  }

  const merged = mergeCSVFiles(csvFiles);
  showMergedPreview(merged.preview);

  // Trigger download
  const blob = new Blob([merged.csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById("downloadBtn");
  downloadLink.href = url;
  downloadLink.classList.remove("hidden");

  // Toggle UI
  document.getElementById("initialMessage").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
});

function mergeCSVFiles(csvContents) {
  const mergedRows = [];
  let header = "";

  for (const content of csvContents) {
    const lines = content.trim().split(/\r?\n/);
    if (!header) {
      header = lines[0];
      mergedRows.push(header);
    }
    const dataRows = lines.slice(1);
    mergedRows.push(...dataRows);
  }

  return {
    csv: mergedRows.join("\n"),
    preview: mergedRows.slice(0, 20).join("\n"), // First 20 lines
  };
}

function showMergedPreview(previewText) {
  const container = document.getElementById("preview");
  container.innerHTML = ""; // Clear previous

  const lines = previewText.trim().split("\n");
  if (lines.length === 0) return;

  const table = document.createElement("table");
  table.className = "w-full text-sm text-left text-gray-700 border";

  const thead = document.createElement("thead");
  thead.className = "text-xs text-gray-700 uppercase bg-gray-100 border-b";
  const headerCells = lines[0].split(",");
  thead.innerHTML = `
    <tr>
      ${headerCells
        .map((col) => `<th scope="col" class="px-4 py-2">${col}</th>`)
        .join("")}
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  lines.slice(1).forEach((line) => {
    const cols = line.split(",");
    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";

    const limitedCols = cols.map((col) => {
      const maxLen = 80;
      return col.length > maxLen ? col.slice(0, maxLen) + "…" : col;
    });

    row.innerHTML = limitedCols
      .map((col) => `<td class="px-4 py-2 break-words">${col}</td>`)
      .join("");
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
