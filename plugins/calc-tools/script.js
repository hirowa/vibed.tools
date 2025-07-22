const toolTypeEl = document.getElementById("tool-type");
const categoryContainer = document.getElementById("category-container");
const categoryEl = document.getElementById("tool-category");
const itemEl = document.getElementById("tool-item");
const toolContent = document.getElementById("tool-content");
const initialMessage = document.getElementById("initial-message");

let tools = [];

async function discoverTools() {
  const dirPath = "tools/";
  try {
    console.log("🔍 Attempting to fetch directory:", dirPath);
    const res = await fetch(dirPath);
    console.log("📥 Response status:", res.status);
    const html = await res.text();

    const snippet = html.slice(0, 300).replace(/\n/g, " ");
    console.log("📄 Fetched HTML snippet:", snippet);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const links = [...doc.querySelectorAll("a")]
      .map((a) => a.getAttribute("href"))
      .filter((href) => {
        if (!href) return false;
        const filename = href.split("/").pop();
        return (
          filename.endsWith(".html") &&
          !filename.includes("index") &&
          !filename.startsWith("..")
        );
      })
      .map((href) => {
        const filename = href.split("/").pop().replace(/\/$/, "");
        const fullPath = `${dirPath}${filename}`;
        console.log("🔗 Found link:", href, "→", fullPath);
        return fullPath;
      });

    console.log("🛠 Final normalized files:", links);
    return links;
  } catch (e) {
    console.error("❌ Could not read directory:", dirPath, e);
    return [];
  }
}

async function loadToolList() {
  const files = await discoverTools();
  console.log("🛠 Detected files:", files);
  const result = [];

  for (const file of files) {
    try {
      const res = await fetch(file);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const name = doc
        .querySelector('meta[name="plugin-name"]')
        ?.content?.trim();
      const type = doc
        .querySelector('meta[name="plugin-type"]')
        ?.content?.trim();
      const category =
        doc.querySelector('meta[name="plugin-category"]')?.content?.trim() ||
        "_";

      if (name && type) {
        result.push({ name, type, category, file });
      }
    } catch (e) {
      console.warn(`⚠️ Error loading ${file}:`, e);
    }
  }

  console.log("📦 Parsed tool metadata:", result);
  tools = result;
  populateTypeDropdown();
  populateItems();
}

function populateTypeDropdown() {
  const types = [...new Set(tools.map((t) => t.type))];
  toolTypeEl.innerHTML = "";
  types.forEach((type) => {
    const opt = document.createElement("option");
    opt.textContent = type;
    toolTypeEl.appendChild(opt);
  });
  onTypeChange();
}

function onTypeChange() {
  const type = toolTypeEl.value;
  const hasCat = type === "🧮 Calculator";
  categoryContainer.style.display = hasCat ? "block" : "none";

  const cats = [
    ...new Set(tools.filter((t) => t.type === type).map((t) => t.category)),
  ];
  categoryEl.innerHTML = "";
  cats.forEach((cat) => {
    const opt = document.createElement("option");
    opt.textContent = cat;
    categoryEl.appendChild(opt);
  });

  populateItems();
}

function populateItems() {
  const type = toolTypeEl.value;
  const category = categoryEl.value;

  const matches = tools.filter(
    (t) =>
      t.type === type && (type !== "🧮 Calculator" || t.category === category)
  );

  itemEl.innerHTML = "";
  matches.forEach((t) => {
    const opt = document.createElement("option");
    opt.textContent = t.name;
    opt.dataset.file = t.file;
    itemEl.appendChild(opt);
  });

  if (matches.length) loadTool(matches[0].file);
}

function loadTool(file) {
  fetch(file)
    .then((res) => res.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      toolContent.innerHTML = doc.body.innerHTML;
      initialMessage.style.display = "none";

      doc.querySelectorAll("script").forEach((script) => {
        const s = document.createElement("script");
        if (script.src) s.src = script.src;
        else s.textContent = script.textContent;
        document.body.appendChild(s);
      });
    });
}

toolTypeEl.addEventListener("change", onTypeChange);
categoryEl.addEventListener("change", populateItems);
itemEl.addEventListener("change", () => {
  const selected = itemEl.selectedOptions[0];
  if (selected?.dataset?.file) loadTool(selected.dataset.file);
});

loadToolList();
