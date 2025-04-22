let folderHandle = null;

document.getElementById("pickFolderBtn").addEventListener("click", async () => {
  try {
    folderHandle = await window.showDirectoryPicker();
    document.getElementById("folderPath").textContent = folderHandle.name;
  } catch (err) {
    console.error("Folder selection cancelled or unsupported.", err);
  }
});

document.getElementById("convertBtn").addEventListener("click", async () => {
  if (!folderHandle) {
    alert("Please choose a folder first.");
    return;
  }

  const ext = document.getElementById("fileType").value;
  const rows = [];
  await scanDirectory(folderHandle, ext, rows);

  if (rows.length === 0) {
    alert("No matching files found.");
    return;
  }

  // CSV conversion
  let csv = "Filename,Content\n";
  const preview = [];

  rows.forEach(({ name, content }) => {
    const safeContent = content.replace(/"/g, '""').replace(/\n/g, " ");
    csv += `"${name}","${safeContent}"\n`;
    preview.push(`▶ ${name}\n${content.slice(0, 300)}...\n`);
  });

  // Show result
  document.getElementById("initialMessage").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
  const previewContainer = document.getElementById("preview");
  previewContainer.innerHTML = ""; // Clear previous results

  rows.forEach(({ name, content }) => {
    const isTruncated = content.length > 100;
    const displayedContent = isTruncated
      ? content.slice(0, 100) + "..."
      : content;

    const card = document.createElement("div");
    card.className = "mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg";

    card.innerHTML = `
      <div class="flex items-center mb-2">
        <i class="fas fa-file-alt text-blue-600 me-2"></i>
        <h6 class="text-md font-semibold text-gray-800 truncate">${name}</h6>
      </div>
      <pre class="text-sm text-gray-700 break-words whitespace-pre-wrap font-mono">${displayedContent}</pre>
    `;

    previewContainer.appendChild(card);
  });

  // Download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.getElementById("downloadBtn");
  link.href = url;
  link.classList.remove("hidden");
});

async function scanDirectory(dirHandle, extension, resultList) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file" && name.endsWith(extension)) {
      const file = await handle.getFile();
      const content = await file.text();
      resultList.push({ name, content });
    } else if (handle.kind === "directory") {
      await scanDirectory(handle, extension, resultList); // recursive
    }
  }
}
