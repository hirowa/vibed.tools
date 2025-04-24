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

  const frontmatterKey = document.getElementById("frontmatterKey").value.trim();
  const omitPatterns = document
    .getElementById("omitPatterns")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean); // Remove empty strings

  const mdFiles = [];
  for await (const [name, handle] of folderHandle.entries()) {
    if (handle.kind === "file" && name.endsWith(".md")) {
      const file = await handle.getFile();
      const text = await file.text();
      mdFiles.push({ name, content: text });
    }
  }

  if (mdFiles.length === 0) {
    alert("No markdown files found in this folder.");
    return;
  }

  const merged = mergeMarkdownFiles(mdFiles, frontmatterKey, omitPatterns);
  document.getElementById("preview").textContent = merged;

  const blob = new Blob([merged], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById("downloadBtn");
  downloadLink.href = url;
  downloadLink.download = `${folderHandle.name}.md`;
  downloadLink.classList.remove("hidden");

  document.getElementById("initialMessage").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
});

function parseFrontmatter(mdContent) {
  const match = /^---\n([\s\S]*?)\n---/.exec(mdContent);
  if (!match) return { frontmatter: {}, body: mdContent };
  const frontmatterBlock = match[1];
  const body = mdContent.slice(match[0].length);
  const frontmatter = Object.fromEntries(
    frontmatterBlock.split("\n").map((line) => {
      const [key, ...rest] = line.split(":");
      return [key.trim(), rest.join(":").trim()];
    })
  );
  return { frontmatter, body };
}

function mergeMarkdownFiles(files, key, omitPatterns = []) {
  const mainFilename = `${folderHandle.name}.md`;

  files.sort((a, b) => {
    if (a.name === mainFilename) return -1;
    if (b.name === mainFilename) return 1;
    return 0;
  });

  return files
    .map(({ name, content }) => {
      const { frontmatter, body } = parseFrontmatter(content);
      const title = name.replace(/\.md$/, "");

      // Clean content: remove omit patterns
      let cleanedBody = body.trim();
      omitPatterns.forEach((pattern) => {
        cleanedBody = cleanedBody.split(pattern).join("");
      });

      const keyLine =
        key && frontmatter[key] ? `${key}: ${frontmatter[key]}\n` : "";

      return `------------------------------------------------------\n# ${title}\n${keyLine}___\n${cleanedBody}\n`;
    })
    .join("\n");
}
