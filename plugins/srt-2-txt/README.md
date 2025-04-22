## 📄 SRT to TXT Converter

The **SRT to TXT Converter** is a browser-based tool designed to effortlessly transform `.srt` subtitle files into clean, readable `.txt` dialogue files. With a modern UI and smooth folder-based processing, it’s ideal for users who frequently work with subtitle data and want a fast way to strip timestamps and formatting for pure text extraction.

### Features

- **Folder Selection**: Users can select an entire folder using the browser's directory picker, enabling bulk processing of multiple `.srt` files.
- **Automatic Cleaning**: Converts `.srt` files by removing timestamps, numbers, and empty lines, outputting clean dialogue in `.txt` format.
- **Preview Display**: After conversion, previews of the resulting `.txt` content are shown directly within the app for immediate review.
- **Modern UI**: Clean and responsive interface styled with Flowbite and Font Awesome for an intuitive and aesthetic experience.

---

### How to use?

1. **Open the App** in your browser (HTML + JS file).
2. **Click “Choose Folder”** to select the directory containing your `.srt` files.
3. **Click “Convert to TXT”** to start the conversion.
4. **View Previews** of the converted `.txt` content inside the interface.
5. **Access Saved Files** directly in the same folder where the original `.srt` files were located.

---

### Special Requirements

- This app **requires a Chromium-based browser** (like Chrome or Edge) that supports the `window.showDirectoryPicker()` API.
- The app must be run in a **secure context (HTTPS)** or from `localhost` to use the folder picker.
- Files are processed **locally in the browser**, so no backend or server deployment is necessary.
