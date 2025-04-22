## 🎬 Video Duration Calculator
![image](https://github.com/user-attachments/assets/e85ebac2-e67c-4463-9631-f08fe36ba21f)

**Video Duration Calculator** is a lightweight, browser-based tool designed to calculate the total playtime of multiple video files stored in a selected folder. With a sleek interface and real-time processing, it’s perfect for content creators, editors, or educators who need to quickly assess the total length of video content without uploading or processing the files in external apps.

### Features

- **Folder-Based Video Scanning**: Users can select an entire folder, and the app will automatically filter and process supported video files.
- **Automatic Duration Extraction**: For each file, the app loads video metadata and extracts individual durations.
- **Clean UI with Total Duration Summary**: Each file’s duration is displayed in a clean list, with a total cumulative time calculated and shown prominently.

---

### How to use?

1. Open the app in your browser (`index.html`).
2. In the sidebar, click the file picker to select a folder containing video files.
3. Ensure the folder includes supported formats (e.g., `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`).
4. Click the **Scan & Calculate** button.
5. The app will display each video’s duration and calculate the total duration below the list.

---

### Special Requirements

- **Local File Access Only**: The app does not upload videos; it uses `webkitdirectory` to access folders locally.
- **Modern Browser**: Works best in Chromium-based browsers (like Chrome or Edge) that support folder selection and HTML5 video APIs.
- **No Server Needed**: Entirely client-side—just open `index.html` in a browser and start using it.
