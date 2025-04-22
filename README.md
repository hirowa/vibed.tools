## Vibed Tools

**Vibed Tools** is a modular web application framework that allows developers to build and manage multiple tools via a plugin-based architecture. It's designed to provide a smooth user experience with dynamic loading, categorized navigation, and seamless integration of new tools through isolated plugin folders.

### Features

- **Plugin Architecture**: Tools are created as plugins, making them easy to add, manage, and isolate.
- **Dynamic Loading**: Tools are loaded on demand via an iframe, ensuring lightweight performance.
- **Categorized Navigation**: Plugins are grouped by category for easy discovery using a tabbed UI.
- **Shared Styling**: A global stylesheet ensures consistent appearance across all plugins.
- **Debug Interface**: A built-in debug modal shows real-time log messages for developers.
- **Readme Viewer**: Easily view Readme documentation for the dashboard or individual plugins via modal dialogs.
- **Tool Selection Modal**: A searchable, categorized plugin selector with dynamic refresh.

---

### How to use?

1. **Run a Local Web Server**:
   This app needs to be served through a web server for dynamic file fetching.

   - Using Python: `python -m http.server`
   - Using Node.js: `npx serve`
   - Using PHP: `php -S localhost:8000`
   - Or use **Live Server** in VS Code.

2. **Navigate to the App**:
   Open your browser and go to `http://localhost:8000` (or the correct port based on your server).

3. **Select a Plugin**:

   - Click the "Change Tool [T]" button to open the plugin selector.
   - Choose a plugin from the grid, organized by category.

4. **View Plugin Info**:

   - Click the book icon 📖 to view the plugin's README.
   - Click the info icon ℹ️ for the dashboard's general README.

5. **Debug (optional)**:

   - Click the bug icon 🐞 to open the debug panel and see internal logs.

6. **Refresh Plugins**:
   - Use the refresh button 🔄 in the plugin selector to rescan for new plugins.

---

### Special Requirements

- **Plugins Folder**:

  - Place all plugin folders inside `/plugins/`.
  - Each plugin must have:
    - `index.html` with metadata:
      ```html
      <meta name="plugin-category" content="Category Name" />
      <meta name="plugin-name" content="Plugin Name" />
      <meta name="plugin-description" content="Plugin Description" />
      <meta name="plugin-version" content="1.0" />
      <meta name="plugin-url" content="https://github.com/link_example" />
      ```
    - `script.js` for plugin-specific logic.
    - A link to `../../styles.css` for shared styling.

- **Isolated Plugin Scripts**:
  Each plugin should encapsulate its logic (e.g., inside a class) to avoid polluting the global namespace.
