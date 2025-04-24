## 📘Markdown Merger

**Markdown Merger** is a simple web-based tool that lets users select a local folder of `.md` (Markdown) files, merge their contents, and optionally preserve specific frontmatter metadata. It's designed for writers, developers, or content managers who want to consolidate Markdown documentation quickly and cleanly.

### Features

- **Folder Picker Integration**: Uses the File System Access API to allow users to select a local folder containing Markdown files.
- **Frontmatter Key Extraction**: Lets users specify a YAML frontmatter key to highlight or retain in the merged output.
- **Pattern-Based Cleanup**: Supports optional string patterns to omit (e.g., visual separators like `---` or `___`) during the merging process.
- **Merged Preview & Download**: Displays the merged Markdown output directly in the interface and provides a one-click download link.

---

### How to use?

1. **Open the Web Page**: Load the `index.html` file in a modern browser (e.g., Chrome or Edge) that supports the File System Access API.
2. **Choose a Folder**: Click **"Choose Folder with .md Files"** to pick a directory from your local system.
3. **Enter Frontmatter Key** _(optional)_: Type the name of the frontmatter field you want to keep (e.g., `title` or `date`).
4. **Specify Omit Patterns** _(optional)_: Enter strings (comma-separated) to remove from each file's content.
5. **Click Merge**: Press **"Merge Markdown Files"** to generate the consolidated content.
6. **Preview and Download**: View the merged Markdown in the preview area, and click **"Download MD"** to save the result.

---

### Special Requirements

- **Browser Compatibility**: Requires a Chromium-based browser (like Chrome or Edge) with support for the `window.showDirectoryPicker()` API. This won't work in Firefox or Safari.
- **Local Files Only**: Due to the use of local filesystem access, the plugin doesn't support remote file loading.
