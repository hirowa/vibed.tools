## 📊CSV Merger

The **CSV Merger** is a simple, browser-based plugin that allows users to effortlessly combine multiple CSV files from a selected folder into a single, downloadable file. It's ideal for users who frequently work with scattered CSV data and want a quick, no-fuss solution to consolidate it in a few clicks. Built with a clean interface and practical utility in mind, this tool offers an efficient way to manage and preview merged data before download.

### Features

- **Folder Selection**: Allows users to pick a local folder and automatically detect all `.csv` files within it.
- **Automatic Merging**: Reads and combines the contents of all CSV files, aligning them under a shared header.
- **Preview Display**: Shows the first 20 rows of the merged output in a responsive table layout.
- **Download Option**: Generates a downloadable CSV file that users can save directly from the browser.

---

### How to use?

1. **Open the page** in a browser that supports the File System Access API (e.g., Chrome or Edge).
2. Click **“Choose Folder with CSVs”** to pick the directory containing your `.csv` files.
3. After folder selection, click **“Merge CSV Files”**.
4. A preview of the merged CSV will appear.
5. Click the **“Download CSV”** link to save the final merged file to your computer.

---

### Special Requirements

- **Browser Support**: Requires a browser that supports the **File System Access API** , primarily Chromium-based browsers like **Google Chrome** or **Microsoft Edge**.
- **Local File Access**: This tool works entirely within the browser and requires permission to access local file directories.
- **Same Header Assumption**: Assumes that all CSV files have the same column structure to ensure proper merging.
