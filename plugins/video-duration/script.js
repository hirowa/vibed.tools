// script.js
document.getElementById("scan-btn").addEventListener("click", () => {
  const input = document.getElementById("folder-input");
  const files = Array.from(input.files);
  if (!files.length) {
    alert("Please select a folder with video files.");
    return;
  }

  // filter for supported video extensions
  const exts = ["mp4", "mkv", "avi", "mov", "wmv"];
  const videos = files.filter((f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    return exts.includes(ext);
  });

  if (!videos.length) {
    alert("No supported video files found in that folder.");
    return;
  }

  // hide welcome, prepare results
  document.getElementById("welcome").classList.add("hidden");
  const results = document.getElementById("results");
  const listEl = document.getElementById("video-list");
  listEl.innerHTML = "";
  let totalSeconds = 0;

  // helper to load metadata as Promise
  function getDuration(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({ name: file.name, duration: video.duration });
      };
    });
  }

  // process all videos
  Promise.all(videos.map(getDuration)).then((resultsArr) => {
    resultsArr.forEach(({ name, duration }) => {
      totalSeconds += duration;
      const li = document.createElement("li");
      li.className = "py-2 flex items-center justify-between";
      // format duration hh:mm:ss
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      const s = Math.floor(duration % 60);
      const formatted = [h, m, s]
        .map((v, i) => (i === 0 ? v : String(v).padStart(2, "0")))
        .join(":");

      li.innerHTML = `
        <span class="flex items-center">
          <i class="fas fa-video me-2 text-gray-600"></i>
          ${name}
        </span>
        <span class="font-mono">${formatted}</span>
      `;
      listEl.appendChild(li);
    });

    // show total
    const th = Math.floor(totalSeconds / 3600);
    const tm = Math.floor((totalSeconds % 3600) / 60);
    const ts = Math.floor(totalSeconds % 60);
    const totalFormatted = [th, tm, ts]
      .map((v, i) => (i === 0 ? v : String(v).padStart(2, "0")))
      .join(":");
    document.getElementById("total-duration").textContent = totalFormatted;

    results.classList.remove("hidden");
  });
});
