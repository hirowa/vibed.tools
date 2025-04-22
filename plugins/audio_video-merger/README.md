## 🎶 Audio/Video Merger
![image](https://github.com/user-attachments/assets/da789fe3-8b18-4b18-a490-842ebf4bfc51)

The **Audio/Video Merger** is a lightweight, browser-based plugin designed to let users merge video and audio files directly on their device, no uploads or server processing needed. Powered by FFmpeg compiled to WebAssembly (WASM), this tool provides a fast and private media processing experience within a clean and responsive interface.

### Features

- **Media Upload Interface**: Simple UI for uploading supported video (MP4, WEBM, AVI, MKV) and audio (MP3, WAV, FLAC) files.
- **In-Browser Merging**: Utilizes FFmpeg WASM to perform media merging entirely in the browser.
- **Progress Feedback**: Real-time progress bar during the merge process.
- **Download & Preview**: Embedded video player for previewing the merged result and one-click download button for saving the output.

---

### How to use?

1. **Open the tool** in your browser (no installation required).
2. **Upload your video file** by clicking on the "Video File" upload box.
3. **Upload your audio file** in the corresponding section.
4. Click on **“Merge Audio & Video”** button.
5. Wait for the **progress bar** to complete the merging operation.
6. View the result in the **merged video preview** section.
7. Click the **Download** button to save the new merged video as `merged_video.mp4`.

---

### Special Requirements

- **Browser Compatibility**: Modern browsers with WebAssembly and File API support are required (e.g., Chrome, Firefox, Edge).
- **No Server-Side Processing**: All operations are local; performance depends on the user's machine and browser.
- **JavaScript Enabled**: The plugin is JavaScript-heavy and won’t function if scripts are blocked.
- **Local Server Configuration for SharedArrayBuffer Support**: If using **Live Server** via VS Code, update its internal server config for `SharedArrayBuffer` compatibility:

  ```diff
  ~/.vscode/extensions/ritwickdey.live-server-X.X.X/node_modules/live-server/index.js
  @@ (inside the `liveServer` function, after any existing `app.use(require('cors')(...))` block)
  if (cors) {
    app.use(require("cors")({ origin: true, credentials: true }));
  }

  // ─── ENABLE SHAREDARRAYBUFFER ─────────────────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
  ```

  This ensures full compatibility with FFmpeg WASM's requirements under certain secure contexts.
