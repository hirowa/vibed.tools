## 🗂️Extension Organizer
![image](https://github.com/user-attachments/assets/2564237b-dbf4-42e1-9ebd-961946230cb6)

**Extension Organizer** is a simple, intuitive web-based utility that allows users to organize files within a selected folder based on file extensions. Designed for efficient digital housekeeping, the tool supports both copying and moving files into designated folders, helping users quickly declutter or restructure their directories based on file types.

### Features

- **Extension-Based Sorting**: Automatically filters and organizes files by their extensions, including `.jpg`, `.pdf`, `.txt`, `.mp3`, `.md`, and more.
- **Custom Extensions**: Users can define custom file extensions beyond the provided list for specialized use cases.
- **Copy or Move Actions**: Offers the flexibility to either duplicate or relocate matching files into a specified folder.
- **Folder Picker Integration**: Utilizes the native folder picker interface, allowing users to choose the root directory easily.
- **Responsive UI**: Built with Flowbite and Tailwind CSS for a modern, mobile-friendly interface.

---

### How to use?

1. **Open the Web App**: Load the HTML file in a modern browser (supporting the File System Access API).
2. **Select File Type**: Use the dropdown to choose a file extension or define a custom one.
3. **Choose Action**: Select whether you want to copy or move the files.
4. **Name Target Folder**: Enter a name for the destination folder (it will be created if it doesn’t exist).
5. **Pick Root Folder**: Click the “Select Root Folder” button to choose the directory to scan.
6. **Organize Files**: Click “Organize Files” to start the process.
7. **View Results**: Check the results preview for a list of moved/copied files.

---

### Special Requirements

- **Modern Browser Support**: The tool relies on the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), which is supported in Chromium-based browsers (e.g., Chrome, Edge).
- **User Permissions**: Browser must be granted permission to access local directories.
- **No Backend Needed**: Entirely client-side; works offline after loading.
