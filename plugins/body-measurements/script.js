let wasDraggingRuler = false;
const rulerGrabX = 24; // must match your `ctx.arc(...)` x value
let canvas = document.getElementById("photoCanvas");
let ctx = canvas.getContext("2d");
let img = new Image();

let refLength = 0;
let refPixels = 0;
let startPoint = null;
let previewPoint = null;

const lines = new Map();
const measurements = new Map();
let rulers = [];
let draggingRulerIndex = null;

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function renderCanvas(preview = null) {
  const scaleFactor = Math.max(canvas.height / 1000, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  // Rulers
  ctx.strokeStyle = "rgba(0, 0, 255, 0.4)";
  ctx.lineWidth = 2 * scaleFactor;
  rulers.forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    const rSize = 10 * scaleFactor;
    ctx.beginPath();
    ctx.arc(24, y, rSize, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0,0,255,0.6)";
    ctx.fill();
  });

  // Measurements
  lines.forEach(({ start, end, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scaleFactor;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  // Preview line
  if (startPoint && preview) {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2 * scaleFactor;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(preview.x, preview.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function updateSummary() {
  const list = document.getElementById("measurementList");
  list.innerHTML = "";

  const allLabels = ["Height", "Shoulder", "Torso", "Arm", "Leg", "Inseam"];
  allLabels.forEach((label) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center";

    const span = document.createElement("span");
    const value = measurements.get(label);
    span.textContent =
      value !== undefined ? `${label}: ${value.toFixed(2)} cm` : `${label}: —`;

    const btn = document.createElement("button");
    btn.innerHTML = `<i class="fas fa-copy"></i>`;
    btn.className = "text-gray-500 hover:text-blue-600 ml-2 text-sm";
    btn.title = `Copy ${label}`;
    btn.onclick = () => navigator.clipboard.writeText(span.textContent);

    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

document.getElementById("photo").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (evt) {
    img.onload = function () {
      const wrapperRect = canvas.parentElement.getBoundingClientRect();

      const maxCanvasHeight = wrapperRect.height;
      const maxCanvasWidth = wrapperRect.width;
      const imgAspectRatio = img.width / img.height;

      let displayHeight = Math.min(maxCanvasHeight, img.height);
      let displayWidth = displayHeight * imgAspectRatio;

      // Constrain by width if needed
      if (displayWidth > maxCanvasWidth) {
        const scale = maxCanvasWidth / displayWidth;
        displayWidth *= scale;
        displayHeight *= scale;
      }

      // Set canvas buffer resolution (drawn size)
      canvas.width = img.width;
      canvas.height = img.height;

      // Set canvas visible (CSS) size
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      renderCanvas();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

canvas.addEventListener("mousemove", (e) => {
  const coords = getCanvasCoords(e);
  let cursor = "crosshair";

  // Show grab cursor if near a ruler handle
  for (let i = 0; i < rulers.length; i++) {
    const dx = coords.x - rulerGrabX;
    const dy = coords.y - rulers[i];
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      cursor = "grab";
    }
  }

  canvas.style.cursor = cursor;

  if (draggingRulerIndex !== null) {
    rulers[draggingRulerIndex] = coords.y;
    renderCanvas();
    return;
  }

  if (!startPoint) return;
  previewPoint = coords;
  renderCanvas(previewPoint);
});

canvas.addEventListener("mousedown", (e) => {
  const coords = getCanvasCoords(e);
  draggingRulerIndex = null;

  for (let i = 0; i < rulers.length; i++) {
    const dx = coords.x - rulerGrabX;
    const dy = coords.y - rulers[i];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
      draggingRulerIndex = i;
      break;
    }
  }
});

canvas.addEventListener("mouseup", () => {
  if (draggingRulerIndex !== null) {
    draggingRulerIndex = null;
    // Prevent accidental line draw after drag
    wasDraggingRuler = true;
    startPoint = null;
    previewPoint = null;
    renderCanvas();
  }
});

canvas.addEventListener("click", (e) => {
  if (wasDraggingRuler) {
    wasDraggingRuler = false; // reset the flag
    return; // 🛑 do NOT trace a line
  }
  if (draggingRulerIndex !== null) return;
  const point = getCanvasCoords(e);
  if (!startPoint) {
    startPoint = point;
  } else {
    const endPoint = point;
    const pixelDist = Math.hypot(
      endPoint.x - startPoint.x,
      endPoint.y - startPoint.y
    );

    const selected = document.querySelector(
      'input[name="measurementType"]:checked'
    ).value;
    const unit = document.getElementById("unit").value;
    const heightInput = document.getElementById("height");
    const label =
      selected === "height-reference"
        ? "Height"
        : selected.replace(/^\w/, (c) => c.toUpperCase());

    const colorMap = {
      Shoulder: "#f97316",
      Torso: "#14b8a6",
      Arm: "#22c55e",
      Leg: "#6366f1",
      Inseam: "#ec4899",
      Height: "#ef4444",
    };

    if (selected === "height-reference") {
      let height = parseFloat(heightInput.value);
      if (unit === "in") height *= 2.54;
      refPixels = pixelDist;
      refLength = height;
      measurements.set("Height", height);
      lines.set("Height", {
        start: startPoint,
        end: endPoint,
        color: colorMap["Height"],
      });
    } else if (refPixels > 0) {
      const realSize = (pixelDist / refPixels) * refLength;
      measurements.set(label, realSize);
      lines.set(label, {
        start: startPoint,
        end: endPoint,
        color: colorMap[label] || "gray",
      });
    }

    updateSummary();
    startPoint = null;
    previewPoint = null;
    renderCanvas();
  }
});

document.getElementById("copyAllBtn").addEventListener("click", () => {
  let output = "";
  for (const [label, value] of measurements) {
    output += `${label}: ${value.toFixed(2)} cm\n`;
  }
  navigator.clipboard.writeText(output.trim());
});

document.querySelectorAll('input[name="measurementType"]').forEach((input) => {
  input.addEventListener("change", () => {
    const heightInput = document.getElementById("height");
    heightInput.disabled = input.value !== "height-reference";
  });
});

document.getElementById("addRulerBtn").addEventListener("click", () => {
  rulers.push(canvas.height / 2);
  renderCanvas();
});

document.getElementById("resetRulersBtn").addEventListener("click", () => {
  rulers = [];
  renderCanvas();
});

document.getElementById("resetAllBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
  refPixels = 0;
  refLength = 0;
  lines.clear();
  measurements.clear();
  rulers = [];
  startPoint = null;
  previewPoint = null;
  document.getElementById("photo").value = "";
  document.getElementById("measurementList").innerHTML = "";
  updateSummary();
});

updateSummary();
