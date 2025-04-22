# Vibed Tools - Plugin System

A modular web application framework that allows you to create and switch between different tools using a plugin architecture.

## Features

- **Plugin Architecture**: Easily add new tools as plugins
- **Dynamic Loading**: Plugins are loaded dynamically when selected
- **Categorized Navigation**: Plugins are organized by category in the top navbar
- **Shared Styling**: All plugins use the same base stylesheet for a consistent look and feel
- **Isolated Plugin Code**: Each plugin's JavaScript is loaded dynamically when the plugin is selected

## Current Plugins

- **Stipple Effect Editor**: Create stipple effects from images using various dithering methods
- **Example Plugin**: A simple example plugin to demonstrate how to create plugins

## Running the Application

This application needs to be run from a web server to work properly. You can use one of these methods:

- Python: `python -m http.server`
- Node.js: `npx serve`
- PHP: `php -S localhost:8000`
- Or use the Live Server extension in VS Code

## Project Structure

```
stipple.web/
├── index.html           # Main container with navbar
├── styles.css           # Core styles (shared across all plugins)
├── script.js            # Plugin system functionality
├── plugins/
│   ├── stipple-editor/  # Stipple Effect Editor plugin
│   │   ├── index.html   # With metadata
│   │   └── script.js    # Plugin functionality
│   └── example-plugin/  # Example plugin
│       ├── index.html   # With metadata
│       └── script.js    # Plugin functionality
```

## How to Add New Plugins

1. Create a new folder in the `plugins` directory (e.g., `plugins/my-new-tool/`)

2. Create an `index.html` file with the required metadata:

   ```html
   <meta name="plugin-category" content="Your Category" />
   <meta name="plugin-name" content="Your Tool Name" />
   <meta name="plugin-description" content="Description of your tool" />
   <meta name="plugin-version" content="1.0" />
   ```

3. Make sure to link to the shared stylesheet:

   ```html
   <link rel="stylesheet" href="../../styles.css" />
   ```

4. Create a `script.js` file for your plugin's functionality

5. The plugin will automatically appear in the navigation bar under its specified category

## Plugin HTML Structure

Your plugin's HTML should follow this basic structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Plugin Name</title>
    <meta name="plugin-category" content="Your Category" />
    <meta name="plugin-name" content="Your Plugin Name" />
    <meta name="plugin-description" content="Description of your plugin" />
    <meta name="plugin-version" content="1.0" />
    <link rel="stylesheet" href="../../styles.css" />
  </head>
  <body>
    <header>
      <h1>Your Plugin Name</h1>
      <div class="header-actions">
        <!-- Optional header actions -->
      </div>
    </header>

    <div class="app-container">
      <div class="sidebar">
        <!-- Sidebar controls -->
      </div>

      <div class="main-content">
        <!-- Main content area -->
      </div>
    </div>

    <script src="script.js"></script>
  </body>
</html>
```

## Plugin JavaScript

Your plugin's JavaScript should be self-contained and not interfere with other plugins. It's recommended to wrap your code in a class or module to avoid global namespace pollution.

Example:

```javascript
// My Plugin Script
class MyPlugin {
  constructor() {
    // Initialize your plugin
    this.init();
  }

  init() {
    // Set up event listeners and initialize your plugin
  }

  // Add your plugin's functionality here
}

// Initialize the plugin when the script is loaded
const myPlugin = new MyPlugin();
```

## Troubleshooting

If you don't see any plugins in the navigation bar:

1. Make sure you're running the application from a web server
2. Check the browser console for any errors
3. Verify that your plugin's HTML file has the correct metadata
4. Ensure your plugin's folder is in the `plugins` directory
