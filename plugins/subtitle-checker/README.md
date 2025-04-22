## 🎬 Subtitle Checker

**Subtitle Checker** is a lightweight, user-friendly web app designed to scan directories for video files and identify those missing accompanying subtitle files (.srt). Built with simplicity in mind, it allows users to quickly ensure all their media content is accessible with proper subtitles, making it especially helpful for content creators, archivists, and media enthusiasts.

### Features

- **Folder-based Scanning**: Allows users to select entire folders for scanning, making batch operations seamless.
- **Video & Subtitle Matching**: Automatically matches video files with `.srt` subtitle files based on their base filename.
- **Clear Results Display**: Presents a clean list of videos that lack subtitles, including options to copy filenames with one click.
- **Responsive UI**: Modern interface built using Flowbite and FontAwesome for a polished user experience.

---

### How to use?

1. **Open the Web App**: Load the `index.html` file in your browser.
2. **Select a Folder**: Use the "Select a Folder" input to choose a directory containing video files.
3. **Scan**: Click the "Scan for Missing Subtitles" button.
4. **View Results**: A list of video files missing `.srt` subtitles will be displayed.
5. **Copy Names** _(Optional)_: Use the copy button next to each file to copy its name for quick reference or action.

---

### Special Requirements

- **Browser Support**: Requires a modern browser that supports the `webkitdirectory` attribute (e.g., Chrome or Edge).
- **File Structure**: Works best when subtitles and videos are in the same directory, with matching base filenames.
- **Local Only**: This is a client-side app — no files are uploaded to a server, ensuring full privacy.
