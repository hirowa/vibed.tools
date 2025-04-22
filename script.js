// Refactored Plugin System for Vibed Tools
class PluginSystem {
  constructor() {
    this.plugins = [];
    this.categories = {};
    this.currentPlugin = null;
    this.pluginContainer = document.getElementById("plugin-container");
    this.cachedPlugins = this.loadCachedPlugins();
    this.debugMode = true; // Set to true to enable debug logging

    this.init();
  }

  // Load cached plugins from localStorage
  loadCachedPlugins() {
    try {
      const cached = localStorage.getItem("discoveredPlugins");
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      this.logDebug(`Error loading cache: ${error.message}`);
      return [];
    }
  }

  // Save discovered plugins to localStorage
  saveCachedPlugins(plugins) {
    try {
      localStorage.setItem("discoveredPlugins", JSON.stringify(plugins));
      this.logDebug(`Plugins cached: ${plugins.join(", ")}`);
    } catch (error) {
      this.logDebug(`Error saving cache: ${error.message}`);
    }
  }

  // Initialize plugin detection and UI
  async init() {
    await this.detectPlugins();
    this.buildNavbar();

    if (this.plugins.length > 0) {
      this.loadPlugin(this.plugins[0].path);
    }

    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.logDebug("Manual refresh started...");
        this.refreshPlugins();
      });
    } else {
      this.logDebug("Refresh button not found.");
    }
  }

  // Recursively detect plugins in the /plugins/ folder
  async detectPlugins() {
    this.logDebug("Starting plugin detection process...");
    const directoryQueue = [""]; // Start at plugins root
    const processedDirs = new Set();

    while (directoryQueue.length > 0) {
      const currentRelativePath = directoryQueue.shift();
      this.logDebug(`Processing directory: "${currentRelativePath}"`);
      if (processedDirs.has(currentRelativePath)) {
        this.logDebug(`Already processed "${currentRelativePath}". Skipping.`);
        continue;
      }
      processedDirs.add(currentRelativePath);

      const currentPath = currentRelativePath
        ? `plugins/${currentRelativePath}`
        : "plugins/";
      this.logDebug(`Fetching directory: ${currentPath}`);
      let response;
      try {
        response = await fetch(currentPath);
        this.logDebug(`Response for ${currentPath}: ${response.status}`);
        if (!response.ok) {
          this.logDebug(`Non-OK status for ${currentPath}. Skipping.`);
          continue;
        }
      } catch (error) {
        this.logDebug(`Error fetching ${currentPath}: ${error.message}`);
        continue;
      }

      const html = await response.text();
      this.logDebug(`Fetched HTML from ${currentPath} (${html.length} chars)`);

      const dirEntries = this.extractDirectoriesFromHtml(html);
      this.logDebug(`Extracted directories: ${dirEntries.join(", ")}`);

      for (const entry of dirEntries) {
        if (entry === "..") continue;
        const entryRelativePath = currentRelativePath
          ? `${currentRelativePath}/${entry}`
          : entry;
        this.logDebug(`Checking if "${entryRelativePath}" is a plugin...`);
        const isPlugin = await this.checkForPlugin(entryRelativePath);
        if (isPlugin) {
          this.logDebug(`"${entryRelativePath}" is registered as a plugin.`);
        } else {
          directoryQueue.push(entryRelativePath);
          this.logDebug(
            `"${entryRelativePath}" is not a plugin; added to queue.`
          );
        }
      }
    }
    this.logDebug("Plugin detection process completed.");

    if (this.plugins.length > 0) {
      const pluginPaths = this.plugins.map((plugin) => plugin.path);
      this.saveCachedPlugins(pluginPaths);
    }
  }

  // Extract directory names from a directory listing page
  extractDirectoriesFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));
    const dirNames = [];
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !["/", "../"].includes(href)) {
        const cleaned = href.replace(/^\/?plugins\/?/, "").replace(/\/$/, "");
        if (cleaned && !dirNames.includes(cleaned)) {
          dirNames.push(cleaned);
        }
      }
    });
    return dirNames;
  }

  // Check if a directory contains a valid plugin (by fetching its index.html)
  async checkForPlugin(relativePath) {
    const url = `plugins/${encodeURIComponent(relativePath)}/index.html`;
    try {
      const response = await fetch(url);
      if (!response.ok) return false;
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const metadata = {
        name:
          this.getMetaContent(doc, "plugin-name") ||
          relativePath.split("/").pop() ||
          relativePath,
        category:
          this.getMetaContent(doc, "plugin-category") || "Uncategorized",
        description: this.getMetaContent(doc, "plugin-description") || "",
        version: this.getMetaContent(doc, "plugin-version") || "1.0",
        url: this.getMetaContent(doc, "url") || "",
      };

      this.plugins.push({ path: relativePath, metadata });
      if (!this.categories[metadata.category]) {
        this.categories[metadata.category] = [];
      }
      this.categories[metadata.category].push({ path: relativePath, metadata });
      return true;
    } catch (error) {
      this.logDebug(
        `checkForPlugin error at ${relativePath}: ${error.message}`
      );
      return false;
    }
  }

  // Helper to extract meta content
  getMetaContent(doc, name) {
    const meta =
      doc.querySelector(`meta[name="plugin-${name}"]`) ||
      doc.querySelector(`meta[name="${name}"]`) ||
      doc.querySelector(`meta[data-plugin="${name}"]`);
    return meta ? meta.getAttribute("content") : null;
  }

  // Build the navigation elements including the plugin selector (modal)
  buildNavbar() {
    this.buildPluginSelector();
  }

  // Refresh plugins
  async refreshPlugins() {
    this.plugins = [];
    this.categories = {};
    localStorage.removeItem("discoveredPlugins");
    const pluginList = document.getElementById("plugin-list");
    if (pluginList) {
      pluginList.innerHTML = `<div class="p-4 text-center">Scanning for plugins...</div>`;
    }
    await this.detectPlugins();
    this.buildPluginSelector();
  }

  // Build the plugin selector modal
  buildPluginSelector() {
    // Build category tabs first.
    const categoryTabs = document.getElementById("category-tabs");
    if (categoryTabs) {
      // Remove all tabs except for the "All" tab.
      categoryTabs
        .querySelectorAll("li:not(:first-child)")
        .forEach((li) => li.remove());
      Object.keys(this.categories).forEach((category) => {
        const li = document.createElement("li");
        li.className = "me-2";
        li.innerHTML = `<button type="button" data-category="${category}" class="inline-block px-4 py-1 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white">${category}</button>`;
        categoryTabs.appendChild(li);
      });

      // Attach event listeners to all tabs.
      const tabButtons = categoryTabs.querySelectorAll("button[data-category]");
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.filterPluginsByCategory(btn.getAttribute("data-category"));
          // Update active tab styling.
          tabButtons.forEach((b) => {
            b.className =
              "inline-block px-4 py-1 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white";
          });
          btn.className =
            "inline-block px-4 py-1 text-white bg-blue-600 rounded-lg active";
        });
      });
    }

    // Build plugin cards grid.
    const pluginList = document.getElementById("plugin-list");
    if (!pluginList) return;
    pluginList.innerHTML = "";
    Object.entries(this.categories).forEach(([category, plugins]) => {
      plugins.forEach((plugin) => {
        const col = document.createElement("div");
        col.className = "col";
        const card = document.createElement("div");
        card.className = "plugin-card";
        card.dataset.category = category;
        card.innerHTML = `
          <div class="card-body p-4 flex h-full items-start">
            <h5 class="mb-1 text-lg font-semibold text-gray-900">${
              plugin.metadata.name
            }</h5>
            <p class="mt-2 text-sm text-gray-600">${
              plugin.metadata.description || "No description provided."
            }</p>
            <br>
            <span class="inline-flex flex-none items-center whitespace-nowrap w-fit bg-blue-100 dark:bg-blue-300 text-blue-800 dark:text-blue-600 text-sm font-medium px-2 py-0.5 rounded-lg">${category}</span>
          </div>
        `;
        // On click, load the plugin.
        card.addEventListener("click", () => {
          this.loadPlugin(plugin.path);
          document.getElementById("plugin-modal-close")?.click();
          this.buildNavbar();
        });
        col.appendChild(card);
        pluginList.appendChild(col);
      });
    });
    // Default filter: show all plugins.
    this.filterPluginsByCategory("all");
  }

  // Filter plugins by category (show/hide cards)
  filterPluginsByCategory(category) {
    const cards = document.querySelectorAll(".plugin-card");
    cards.forEach((card) => {
      if (category === "all" || card.dataset.category === category) {
        card.parentElement.style.display = "";
      } else {
        card.parentElement.style.display = "none";
      }
    });
  }

  // Load a plugin into an iframe on the main canvas
  async loadPlugin(pluginPath) {
    this.logDebug(`Preparing to load plugin: ${pluginPath}`);

    // Clean up previous plugin display.
    this.cleanupPluginDisplay();
    this.pluginContainer.innerHTML = "";
    this.pluginContainer.classList.remove("text-center");
    this.pluginContainer.classList.add("h-full");
    this.logDebug("Plugin container cleared and adjusted for new content.");

    // Show a loading message.
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "p-4 text-center";
    loadingMsg.textContent = "Loading plugin...";
    this.pluginContainer.appendChild(loadingMsg);
    this.logDebug("Displayed loading message.");

    // Create an iframe for the plugin.
    const iframe = document.createElement("iframe");
    iframe.id = "plugin-iframe";
    iframe.className = "absolute inset-0 border-0";
    this.pluginContainer.appendChild(iframe);
    this.logDebug("Created iframe for plugin content.");

    // Set iframe source.
    const pluginURL = `plugins/${encodeURIComponent(pluginPath)}/index.html`;
    this.logDebug(`Setting iframe source to: ${pluginURL}`);
    iframe.src = pluginURL;

    await new Promise((resolve) => {
      iframe.onload = () => {
        this.logDebug(`Iframe loaded successfully for plugin: ${pluginPath}`);
        resolve();
      };
    });

    this.currentPlugin = pluginPath;
    this.updateSelectedPluginName(pluginPath);
    this.logDebug(`Plugin "${pluginPath}" loaded successfully.`);
  }

  // Remove existing plugin iframe
  cleanupPluginDisplay() {
    const existing = document.getElementById("plugin-iframe");
    if (existing) existing.remove();
  }

  // Update navbar display with the currently selected plugin name and version
  updateSelectedPluginName(pluginPath) {
    const plugin = this.plugins.find((p) => p.path === pluginPath);
    const selectedPluginName = document.getElementById("selected-plugin-name");
    if (selectedPluginName && plugin) {
      selectedPluginName.innerHTML = `${plugin.metadata.name} <span class="text-sm text-gray-500">v${plugin.metadata.version}</span>`;
    }
  }

  // Minimal debug logging (enabled when debugMode is true)
  logDebug(message) {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`);
      const debugContainer = document.getElementById("debug-messages");
      if (debugContainer) {
        const entry = document.createElement("div");
        entry.className = "debug-message";
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        debugContainer.appendChild(entry);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const githubBtn = document.querySelector("#readme-modal a");
  const metaUrl = document
    .querySelector('meta[name="plugin-url"]')
    .getAttribute("content");
  githubBtn.href = metaUrl;

  // Vibed Tools Readme
  const pluginReadmeBtn = document.getElementById("vibed-readme-btn");
  if (pluginReadmeBtn) {
    pluginReadmeBtn.addEventListener("click", async () => {
      // SET GitHub link from index.html metadata
      const githubBtn = document.querySelector("#readme-modal a");
      const metaUrl = document
        .querySelector('meta[name="plugin-url"]')
        .getAttribute("content");
      githubBtn.href = metaUrl;

      const readmeEl = document.getElementById("readme-content");
      readmeEl.innerHTML = "Loading...";
      if (
        window.pluginSystem &&
        typeof window.pluginSystem.logDebug === "function"
      ) {
        window.pluginSystem.logDebug(
          "Dashboard Readme button clicked, fetching..."
        );
      }
      try {
        const response = await fetch("readme.md");
        if (
          window.pluginSystem &&
          typeof window.pluginSystem.logDebug === "function"
        ) {
          window.pluginSystem.logDebug(
            "Fetched dashboard readme.md with status: " + response.status
          );
        }
        if (!response.ok) {
          throw new Error(
            "Failed to fetch readme.md, status: " + response.status
          );
        }
        const markdown = await response.text();
        marked.setOptions({
          gfm: true,
          breaks: true,
          highlight: function (code, lang) {
            if (window.hljs) {
              return window.hljs.highlightAuto(code).value;
            }
            return code;
          },
        });
        const htmlContent = marked.parse(markdown);
        readmeEl.innerHTML = htmlContent;
        if (window.hljs && typeof window.hljs.highlightAll === "function") {
          window.hljs.highlightAll();
        }
      } catch (error) {
        readmeEl.innerHTML = "<p>Error loading Readme.</p>";
        if (
          window.pluginSystem &&
          typeof window.pluginSystem.logDebug === "function"
        ) {
          window.pluginSystem.logDebug(
            "Error fetching dashboard readme.md: " + error.message
          );
        }
      }
    });
  }

  // Plugin Readme
  const vibedReadmeBtn = document.getElementById("plugin-readme-btn");
  if (vibedReadmeBtn) {
    vibedReadmeBtn.addEventListener("click", async () => {
      const readmeEl = document.getElementById("readme-content");
      readmeEl.innerHTML = "Loading...";
      if (
        window.pluginSystem &&
        typeof window.pluginSystem.logDebug === "function"
      ) {
        window.pluginSystem.logDebug(
          "Plugin Readme button clicked, fetching..."
        );
      }
      try {
        if (window.pluginSystem && window.pluginSystem.currentPlugin) {
          const pluginPath = window.pluginSystem.currentPlugin;
          // SET GitHub link based on the plugin's metadata URL
          const githubBtn = document.querySelector("#readme-modal a");
          const plugin = window.pluginSystem.plugins.find(
            (p) => p.path === pluginPath
          );
          githubBtn.href =
            plugin && plugin.metadata.url
              ? plugin.metadata.url
              : document
                  .querySelector('meta[name="plugin-url"]')
                  .getAttribute("content");

          const response = await fetch(
            `plugins/${encodeURIComponent(pluginPath)}/readme.md`
          );
          if (
            window.pluginSystem &&
            typeof window.pluginSystem.logDebug === "function"
          ) {
            window.pluginSystem.logDebug(
              "Fetched plugin readme with status: " + response.status
            );
          }
          if (!response.ok) {
            throw new Error(
              "Failed to fetch plugin readme.md, status: " + response.status
            );
          }
          const markdown = await response.text();
          marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: function (code, lang) {
              if (window.hljs) {
                return window.hljs.highlightAuto(code).value;
              }
              return code;
            },
          });
          const htmlContent = marked.parse(markdown);
          readmeEl.innerHTML = htmlContent;
          if (window.hljs && typeof window.hljs.highlightAll === "function") {
            window.hljs.highlightAll();
          }
        } else {
          readmeEl.innerHTML =
            "<p>No plugin selected or readme not available.</p>";
        }
      } catch (error) {
        readmeEl.innerHTML = "<p>Error loading plugin Readme.</p>";
        if (
          window.pluginSystem &&
          typeof window.pluginSystem.logDebug === "function"
        ) {
          window.pluginSystem.logDebug(
            "Error fetching plugin readme.md: " + error.message
          );
        }
      }
    });
  }
});

// Initialize the plugin system when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.pluginSystem = new PluginSystem();
});

document.addEventListener("keydown", (e) => {
  // open with plain “t” (no Ctrl/Alt/Cmd), and don’t trigger when typing in a field
  if (
    e.key === "t" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !["INPUT", "TEXTAREA"].includes(e.target.tagName)
  ) {
    const btn = document.getElementById("plugin-selector-btn");
    if (btn) btn.click(); // triggers the existing data‑modal‑toggle logic
  }
});
