/* -------------------------------------------------------------------
 *  Minimal, robust signature pad
 * -----------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  /* Elements -------------------------------------------------------- */
  const canvas = document.getElementById("sign-pad");
  const ctx = canvas.getContext("2d");

  const wrapper = document.getElementById("wrapper");
  const clearBtn = document.getElementById("clear-btn");
  const undoBtn = document.getElementById("undo-btn");
  const playBtn = document.getElementById("play-btn");

  const savePNG = document.getElementById("save-png-btn");
  const saveSVG = document.getElementById("save-svg-btn");
  const saveAnim = document.getElementById("save-anims-svg-btn");

  const loadJSON = document.getElementById("load-json-input");
  const loadBG = document.getElementById("bg-image-input");

  const colorInp = document.getElementById("color-picker"); // ← matches HTML
  const widthInp = document.getElementById("stroke-width");
  const speedInp = document.getElementById("anim-speed");

  const widthLbl = document.getElementById("width-label");
  const speedLbl = document.getElementById("speed-label");
  const includeBg = document.getElementById("bg-export-toggle"); // ← matches HTML
  const mainPanel = document.getElementById("main-panel");

  const totalAnimSecs = () =>
    strokes.reduce(
      (sum, s) =>
        sum +
        Math.max(0.1, s.points.length / (60 * Math.ceil(+speedInp.value))),
      0
    );

  const saveVideo = document.getElementById("save-video-btn");

  /* State ----------------------------------------------------------- */
  let strokes = [];
  let current = null;

  let bgImg = null; // HTMLImageElement
  let bgDataURL = "";

  /* Canvas size helpers -------------------------------------------- */
  const setCanvasSize = () => {
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    redraw();
  };

  /* Background drawing & wrapper sizing ---------------------------- */
  const fitWrapperToBG = () => {
    const pane = mainPanel.getBoundingClientRect();
    const maxW = pane.width;
    const maxH = pane.height;

    /* 1. No background → restore defaults */
    if (!bgImg) {
      mainPanel.classList.add("p-4");
      mainPanel.style.justifyContent = "";
      mainPanel.style.alignItems = "";
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      wrapper.style.flex = originalWrapperFlex;
      setCanvasSize();
      return;
    }

    /* 2. Background present → drop padding + centre child */
    mainPanel.classList.remove("p-4");
    mainPanel.style.display = "flex";
    mainPanel.style.flexDirection = "column"; // NEW
    mainPanel.style.justifyContent = "center";
    mainPanel.style.alignItems = "center";

    /* 3. Calculate scaled wrapper size honouring aspect ratio */
    const imgW = bgImg.width;
    const imgH = bgImg.height;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1);
    const w = imgW * scale;
    const h = imgH * scale;

    /* 4. Apply */
    wrapper.style.flex = "0 0 auto";
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;

    setCanvasSize();
  };

  const drawBG = (c = ctx) => {
    if (!bgImg) return;

    const cw = c.canvas.width,
      ch = c.canvas.height,
      rImg = bgImg.width / bgImg.height,
      rCan = cw / ch;

    let w, h, x, y;

    if (rImg >= rCan) {
      // image wider → fit width, crop bottom
      w = cw;
      h = w / rImg;
      x = 0;
      y = 0; // top-align
    } else {
      // image taller → fit height, crop sides
      h = ch;
      w = h * rImg;
      x = (cw - w) / 2; // centre horizontally
      y = 0;
    }
    c.drawImage(bgImg, x, y, w, h);
  };

  /* Redraw ---------------------------------------------------------- */
  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    strokes.forEach((s) => drawStroke(ctx, s));
  };

  const drawStroke = (target, s, upto = s.points.length) => {
    if (!s.points.length) return;
    target.strokeStyle = s.color;
    target.lineWidth = s.width;
    target.lineCap = target.lineJoin = "round";
    target.beginPath();
    target.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < upto; i++) {
      target.lineTo(s.points[i].x, s.points[i].y);
    }
    target.stroke();
  };

  /* Pointer events -------------------------------------------------- */
  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  canvas.addEventListener(
    "pointerdown",
    (e) => {
      current = {
        color: colorInp.value,
        width: +widthInp.value,
        points: [point(e)],
      };
      strokes.push(current);
      setCanvasSize();
      draw(e);
      const move = (ev) => draw(ev);
      document.addEventListener("pointermove", move, { passive: false });
      document.addEventListener(
        "pointerup",
        () => {
          current = null;
          document.removeEventListener("pointermove", move);
        },
        { once: true }
      );
    },
    { passive: false }
  );

  const draw = (e) => {
    e.preventDefault();
    if (!current) return;
    current.points.push(point(e));
    drawStroke(ctx, current, current.points.length);
  };

  /* Controls -------------------------------------------------------- */
  clearBtn.onclick = () => {
    strokes = [];
    bgImg = null;
    bgDataURL = "";
    mainPanel.classList.add("p-4"); // put padding back
    fitWrapperToBG();
    redraw();
  };

  undoBtn.onclick = () => {
    strokes.pop();
    redraw();
  };

  /* Animation ------------------------------------------------------- */
  let anim;
  playBtn.onclick = () => {
    if (anim) {
      cancelAnimationFrame(anim);
      anim = null;
      redraw();
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBG();
    let si = 0,
      pi = 0,
      speed = +speedInp.value;
    const step = () => {
      if (si >= strokes.length) {
        anim = null;
        return;
      }
      const st = strokes[si];
      pi = Math.min(st.points.length, pi + Math.ceil(speed));
      drawStroke(ctx, st, pi);
      if (pi >= st.points.length) {
        si++;
        pi = 0;
      }
      anim = requestAnimationFrame(step);
    };
    step();
  };

  /* Background loader ---------------------------------------------- */
  loadBG.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      bgDataURL = ev.target.result;
      bgImg = new Image();
      bgImg.onload = () => {
        fitWrapperToBG();
        redraw();
      };
      bgImg.src = bgDataURL;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* JSON ------------------------------------------------------------ */
  loadJSON.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      strokes = JSON.parse(ev.target.result);
      redraw();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* SVG helpers ----------------------------------------------------- */
  const svgHeader = (w, h) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  const strokesToSVG = (animated = false) => {
    const w = canvas.width,
      h = canvas.height;
    let out = "";
    if (includeBg.checked && bgDataURL) {
      const scale = Math.min(w / bgImg.width, h / bgImg.height);
      const bw = bgImg.width * scale,
        bh = bgImg.height * scale;
      const bx = (w - bw) / 2,
        by = (h - bh) / 2;
      out += `<image href="${bgDataURL}" x="${bx}" y="${by}" width="${bw}" height="${bh}"/>`;
    }
    let t = 0;
    const pps = 60 * Math.ceil(+speedInp.value);
    strokes.forEach((s) => {
      const d = ["M", s.points[0].x, s.points[0].y]
        .concat(s.points.slice(1).flatMap((p) => ["L", p.x, p.y]))
        .join(" ");
      if (animated) {
        const len = s.points.reduce(
          (a, p, i, arr) =>
            i ? a + Math.hypot(p.x - arr[i - 1].x, p.y - arr[i - 1].y) : 0,
          0
        );
        const dur = Math.max(0.1, s.points.length / pps);
        out += `<path d="${d}" stroke="${s.color}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len}"><animate attributeName="stroke-dashoffset" values="${len};0" dur="${dur}s" begin="${t}s" fill="freeze"/></path>`;
        t += dur;
      } else {
        out += `<path d="${d}" stroke="${s.color}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });
    return svgHeader(w, h) + out + "</svg>";
  };

  /* PNG ------------------------------------------------------------- */
  savePNG.onclick = () => {
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext("2d");
    if (includeBg.checked) drawBG(octx);
    strokes.forEach((s) => drawStroke(octx, s));
    const a = document.createElement("a");
    a.download = "signature.png";
    a.href = off.toDataURL("image/png");
    a.click();
  };

  /* SVG ------------------------------------------------------------- */
  saveSVG.onclick = () => {
    const blob = new Blob([strokesToSVG(false)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = "signature.svg";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  };
  saveAnim.onclick = () => {
    const blob = new Blob([strokesToSVG(true)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = "signature-animated.svg";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* Video ------------------------------------------------------------- */
  saveVideo.onclick = () => {
    if (!strokes.length) return alert("Draw something first!");

    // 1. Prepare the recorder
    const fps = 30;
    const stream = canvas.captureStream(fps);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const a = document.createElement("a");
      a.download = "signature.webm"; // change to .mp4 if you transcode later
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    };

    // 2. Play the on-screen animation while recording
    const secs = totalAnimSecs();
    rec.start();
    playBtn.click(); // starts animation

    setTimeout(() => {
      rec.stop(); // stop capture
      playBtn.click(); // stop playback / reset canvas
    }, secs * 1000 + 200); // +200 ms buffer
  };

  /* UI listeners ---------------------------------------------------- */
  widthInp.oninput = () => (widthLbl.textContent = widthInp.value + " px");
  speedInp.oninput = () => (speedLbl.textContent = speedInp.value + "×");

  /* Boot ------------------------------------------------------------- */
  new ResizeObserver(setCanvasSize).observe(wrapper);
  setCanvasSize();

  window.addEventListener("resize", () => {
    fitWrapperToBG(); // recalculates wrapper size
    redraw(); // keeps background + strokes in sync
  });
});
