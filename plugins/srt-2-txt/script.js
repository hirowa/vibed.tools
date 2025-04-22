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

  const results = [];
  await scanAndConvertSRT(folderHandle, results);

  if (results.length === 0) {
    alert("No .srt files found.");
    return;
  }

  // Display preview
  const previewContainer = document.getElementById("preview");
  previewContainer.innerHTML = "";
  results.forEach(({ name, cleanedText }) => {
    const card = document.createElement("div");
    card.className = "mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg";

    card.innerHTML = `
      <div class="flex items-center mb-2">
        <i class="fas fa-file-lines text-blue-600 me-2"></i>
        <h6 class="text-md font-semibold text-gray-800 truncate">${name}</h6>
      </div>
      <pre class="text-sm text-gray-700 break-words whitespace-pre-wrap font-mono truncate block w-full">${cleanedText.slice(
        0,
        1500
      )}${cleanedText.length > 1500 ? "..." : ""}</pre>
    `;

    previewContainer.appendChild(card);
  });

  document.getElementById("initialMessage").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
});

async function scanAndConvertSRT(dirHandle, resultList) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file" && name.endsWith(".srt")) {
      const file = await handle.getFile();
      const rawText = await file.text();

      // Step-by-step cleanup
      const cleanedText = rawText
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !/^\d+$/.test(line) && // remove lines that are just numbers
            !/^\d{2}:\d{2}:\d{2},\d{3}/.test(line) // remove timestamp lines
        )
        .join(" ");

      // Save .txt in same folder
      const newFileName = name.replace(/\.srt$/i, ".txt");
      const writableHandle = await dirHandle.getFileHandle(newFileName, {
        create: true,
      });
      const writable = await writableHandle.createWritable();
      await writable.write(cleanedText);
      await writable.close();

      resultList.push({ name, cleanedText });
    } else if (handle.kind === "directory") {
      await scanAndConvertSRT(handle, resultList);
    }
  }
}
