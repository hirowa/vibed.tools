let rootHandle = null;

document.getElementById("extensionSelect").addEventListener("change", (e) => {
  const customInput = document.getElementById("customExtGroup");
  customInput.classList.toggle("hidden", e.target.value !== "other");
});

document.getElementById("pickFolderBtn").addEventListener("click", async () => {
  try {
    rootHandle = await window.showDirectoryPicker();
    document.getElementById("folderPath").textContent = rootHandle.name;
  } catch (err) {
    console.error(err);
  }
});

document.getElementById("organizeBtn").addEventListener("click", async () => {
  const extSelect = document.getElementById("extensionSelect").value;
  const customExt = document.getElementById("customExtension").value.trim();
  const extension = extSelect === "other" ? customExt : extSelect;

  if (!extension.startsWith(".")) {
    alert("Extension must start with a dot (e.g. .md)");
    return;
  }

  const action = document.getElementById("actionType").value;
  const targetFolderName = document.getElementById("targetFolder").value.trim();
  if (!targetFolderName) return alert("Enter a target folder name");
  if (!rootHandle) return alert("Select a root folder first");

  const targetFolderHandle = await rootHandle.getDirectoryHandle(
    targetFolderName,
    { create: true }
  );
  const movedFiles = [];

  await organizeFiles(
    rootHandle,
    extension,
    targetFolderHandle,
    movedFiles,
    action
  );

  // Preview UI
  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  movedFiles.forEach((path) => {
    const div = document.createElement("div");
    div.textContent = `✅ ${action.toUpperCase()}: ${path}`;
    preview.appendChild(div);
  });

  document.getElementById("initialMessage").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
});

async function organizeFiles(
  dirHandle,
  ext,
  targetHandle,
  resultList,
  action,
  currentPath = ""
) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file" && name.endsWith(ext)) {
      const sourceFile = await handle.getFile();

      // Determine prefix from folder path
      const pathParts = currentPath.split("/").filter(Boolean);
      const folderPrefix =
        pathParts.length > 0 ? pathParts[pathParts.length - 1] : "root";
      const newName = `${folderPrefix}-${name}`;

      const destHandle = await targetHandle.getFileHandle(newName, {
        create: true,
      });
      const writable = await destHandle.createWritable();
      await writable.write(await sourceFile.arrayBuffer());
      await writable.close();
      resultList.push(`${newName}`);

      if (action === "move") {
        await dirHandle.removeEntry(name);
      }
    } else if (handle.kind === "directory") {
      await organizeFiles(
        handle,
        ext,
        targetHandle,
        resultList,
        action,
        `${currentPath}/${name}`
      );
    }
  }
}
