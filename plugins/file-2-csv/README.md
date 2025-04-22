## 📂 Files to CSV Exporter
![image](https://github.com/user-attachments/assets/701074e2-bf04-43c4-a859-4edf3c263394)

**Files to CSV Exporter** is a browser-based tool that allows users to scan a selected folder on their device for specific text-based file types (`.md`, `.txt`, `.srt`) and export their contents into a structured CSV file. The app is entirely client-side and does not require any server or external backend, making it lightweight and secure for personal data handling.

### Features

- **Folder Picker**: Users can select any local directory using the browser's native folder picker.
- **File Type Filter**: Choose which type of files to process – Markdown, Text, or Subtitle formats.
- **CSV Conversion**: Extracts filenames and file contents and compiles them into a downloadable CSV file.
- **Preview Panel**: Displays a snippet of each file’s content within the app interface.
- **Recursive Search**: Automatically scans through nested folders and subdirectories.

---

### How to use?

1. Open the app in a modern browser that supports the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) (e.g., Chrome or Edge).
2. Select the file type you want to extract (`.md`, `.txt`, or `.srt`) using the dropdown.
3. Click **"Choose Folder"** and pick the folder you want to scan.
4. Press **"Convert to CSV"** to scan and preview the file contents.
5. Click **"Download CSV"** to save the generated file.

---

### Special Requirements

- **Browser Compatibility**: Requires a Chromium-based browser that supports `window.showDirectoryPicker()` – this feature is not available in Safari or Firefox.
- **Local Access Only**: The app does not upload or process files over the internet, ensuring privacy.
