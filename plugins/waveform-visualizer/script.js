const fps = 24;
let isRendering = false;
let animationId;
let audioCtx, analyser, mediaSource;
let audioBufferList = [];
let currentBufferIndex = 0;

const audioElement = document.getElementById("audio-player");
const canvas = document.getElementById("waveform-canvas");
const frontCtx = canvas.getContext("2d");
let currentCtx = frontCtx;

const audioUpload = document.getElementById("audio-upload");
const waveformType = document.getElementById("waveform-style");
const aspectRatio = document.getElementById("aspect-ratio");
const waveColor = document.getElementById("waveform-color");
const waveHex = document.getElementById("waveform-hex");
const bgColor = document.getElementById("background-color");
const bgHex = document.getElementById("background-hex");
const sensibilitySlider = document.getElementById("sensibility");
const renderBtn = document.getElementById("render-btn");
const exportBtn = document.getElementById("export-btn");
const formatSelect = document.getElementById("export-format");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const { Muxer, ArrayBufferTarget } = Mp4Muxer;

// ——— Helpers ———
function hexToRGBA(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function syncColor(colorInput, hexInput) {
  colorInput.addEventListener("input", () => {
    hexInput.value = colorInput.value;
  });
  hexInput.addEventListener("input", () => {
    const val = hexInput.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      colorInput.value = val;
    }
  });
}

function setCanvasAspect() {
  const [w, h] = {
    "1:1": [600, 600],
    "3:2": [900, 600],
    "2:3": [600, 900],
  }[aspectRatio.value] || [600, 600];

  canvas.width = w;
  canvas.height = h;
}

// ——— AudioContext & DOMContentLoaded ———
window.addEventListener("DOMContentLoaded", () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  mediaSource = audioCtx.createMediaElementSource(audioElement);
  mediaSource.connect(analyser);
  analyser.connect(audioCtx.destination);

  syncColor(waveColor, waveHex);
  syncColor(bgColor, bgHex);
  setCanvasAspect();
  aspectRatio.addEventListener("change", setCanvasAspect);
});

// ——— Drawing Functions ———
function drawLinear(data, sens) {
  const len = data.length;
  const step = canvas.width / len;
  currentCtx.lineWidth = 6;
  currentCtx.lineJoin = "round";
  currentCtx.lineCap = "round";

  for (let i = 0; i < len; i++) {
    const centerY = canvas.height / 2;
    const y = centerY + ((data[i] - 128) / 128) * centerY * sens;
    i === 0 ? currentCtx.moveTo(0, y) : currentCtx.lineTo(i * step, y);
  }
}

function drawPolar(data, sens) {
  const len = data.length;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const baseR = Math.min(cx, cy) * 0.6;
  const pts = [];

  currentCtx.lineWidth = 6;
  currentCtx.lineJoin = "round";
  currentCtx.lineCap = "round";

  for (let i = 0; i < len; i++) {
    const angle = (i / len) * 2 * Math.PI;
    const amp = ((data[i] - 128) / 128) * baseR * sens;
    const r = baseR + amp;
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  currentCtx.beginPath();
  pts.forEach((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const mx = (p.x + next.x) / 2;
    const my = (p.y + next.y) / 2;
    i === 0
      ? currentCtx.moveTo(mx, my)
      : currentCtx.quadraticCurveTo(p.x, p.y, mx, my);
  });
  currentCtx.closePath();
}

function drawSpectrogram(data, sens) {
  const centerY = canvas.height / 2;
  for (let i = 0; i < data.length; i++) {
    const h = data[i] * sens;
    const x = i * 3;
    currentCtx.fillStyle = waveColor.value;
    currentCtx.fillRect(x, centerY - h, 2, h);
    currentCtx.fillStyle = hexToRGBA(waveColor.value, 0.6);
    currentCtx.fillRect(x, centerY, 2, h);
  }
  currentCtx.strokeStyle = bgColor.value;
  currentCtx.lineWidth = 0.5;
  currentCtx.beginPath();
  currentCtx.moveTo(0, centerY);
  currentCtx.lineTo(canvas.width, centerY);
  currentCtx.stroke();
}

function drawBlob(data, sens) {
  const w = canvas.width;
  const h = canvas.height;
  const centerY = h / 2;
  const pts = 32;
  const spacing = w / (pts - 1);
  const maxAmp = centerY * 0.7;
  const step = Math.floor(data.length / pts);

  const top = [];
  const bot = [];
  for (let i = 0; i < pts; i++) {
    const idx = i * step;
    const amp = ((data[idx] - 128) / 128) * maxAmp * sens;
    top.push({ x: i * spacing, y: centerY + amp });
    bot.push({ x: i * spacing, y: centerY - amp });
  }

  [0.05, 0.1, 0.2, 0.3].forEach((opa) => {
    currentCtx.beginPath();
    currentCtx.moveTo(0, centerY);
    top.forEach((p, i) => {
      const next = top[i + 1];
      if (next) {
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        currentCtx.quadraticCurveTo(p.x, p.y, mx, my);
      }
    });
    currentCtx.lineTo(w, centerY);
    for (let i = bot.length - 1; i >= 0; i--) {
      const p = bot[i];
      const prev = bot[i - 1];
      if (prev) {
        const mx = (p.x + prev.x) / 2;
        const my = (p.y + prev.y) / 2;
        currentCtx.quadraticCurveTo(p.x, p.y, mx, my);
      }
    }
    currentCtx.closePath();
    currentCtx.fillStyle = hexToRGBA(waveColor.value, opa);
    currentCtx.fill();
  });

  currentCtx.beginPath();
  currentCtx.moveTo(0, centerY);
  currentCtx.lineTo(w, centerY);
  currentCtx.strokeStyle = hexToRGBA(waveColor.value, 0.04);
  currentCtx.lineWidth = 1;
  currentCtx.stroke();
}

// ——— PRE-COMPUTE SPECTROGRAM FRAMES ———
async function generateSpectrogramFrames(audioBuffer, fps = 24) {
  const frameCount = Math.ceil(audioBuffer.duration * fps);
  const spectrogram = [];

  // 1) create an offline context matching your buffer
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // 2) make an AnalyserNode
  const analyserOff = offlineCtx.createAnalyser();
  analyserOff.fftSize = 2048;

  // 3) wire up buffer → analyser → destination
  const src = offlineCtx.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(analyserOff);
  analyserOff.connect(offlineCtx.destination);

  // 4) grab FFT on each block via ScriptProcessorNode
  const scriptNode = offlineCtx.createScriptProcessor(2048, 1, 1);
  analyserOff.connect(scriptNode);
  scriptNode.connect(offlineCtx.destination);
  scriptNode.onaudioprocess = () => {
    const freqData = new Uint8Array(analyserOff.frequencyBinCount);
    analyserOff.getByteFrequencyData(freqData);
    spectrogram.push(freqData);
  };

  // 5) start & render offline
  src.start();
  await offlineCtx.startRendering();

  return spectrogram; // one Uint8Array per 2048-sample block
}

// ——— Render Loop ———
function renderWaveform() {
  if (isRendering) return;
  isRendering = true;

  function loop() {
    if (!isRendering || audioElement.paused) {
      isRendering = false;
      return;
    }

    const td = new Uint8Array(analyser.frequencyBinCount);
    const fd = new Uint8Array(analyser.frequencyBinCount);
    const sens = parseFloat(sensibilitySlider.value);

    currentCtx.fillStyle = bgColor.value;
    currentCtx.fillRect(0, 0, canvas.width, canvas.height);
    currentCtx.strokeStyle = waveColor.value;
    currentCtx.lineWidth = 2;
    currentCtx.beginPath();

    const style = waveformType.value;
    if (style === "spectrogram") {
      analyser.getByteFrequencyData(fd);
      drawSpectrogram(fd, sens);
    } else {
      analyser.getByteTimeDomainData(td);
      if (style === "linear") drawLinear(td, sens);
      else if (style === "polar") drawPolar(td, sens);
      else if (style === "blob") drawBlob(td, sens);
    }

    currentCtx.stroke();
    animationId = requestAnimationFrame(loop);
  }

  loop();
}

// ——— UI Event Listeners ———
sensibilitySlider.addEventListener("input", (e) => {
  document.getElementById("sensibility-value").textContent = parseFloat(
    e.target.value
  ).toFixed(1);
});

audioUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  audioElement.src = url;
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  audioBufferList = [audioBuffer];
  currentBufferIndex = 0;
});

document.getElementById("play-btn").addEventListener("click", async () => {
  if (!audioElement.src) return alert("Upload audio first.");
  if (audioCtx.state === "suspended") await audioCtx.resume();
  audioElement.play();
  renderWaveform();
});

document.getElementById("pause-btn").addEventListener("click", () => {
  audioElement.pause();
  isRendering = false;
  cancelAnimationFrame(animationId);
});

renderBtn.addEventListener("click", () => {
  if (!audioElement.src) return alert("Upload audio first.");
  cancelAnimationFrame(animationId);
  isRendering = false;
  setCanvasAspect();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioElement.currentTime = 0;
  audioElement.play();
  setTimeout(renderWaveform, 100);
});

exportBtn.addEventListener("click", () => {
  if (!audioBufferList.length) {
    return alert("Please upload audio first.");
  }
  // grab the decoded AudioBuffer
  const buffer = audioBufferList[0];
  exportWithCodecs(buffer);
});

/**
 * Draws frame for a given time into ANY 2D context.
 * Pass in your audioBuffer so you can sample at the right offset.
 */
function renderFrameAt(timeSec, ctx, w, h, audioBuffer) {
  // clear
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, w, h);

  // pick your data slice from the audioBuffer
  const sampleIndex = Math.floor(timeSec * audioBuffer.sampleRate);
  const dataWindow = new Uint8Array(2048);
  for (let j = 0; j < 2048; j++) {
    const sample = audioBuffer.getChannelData(0)[sampleIndex + j] || 0;
    dataWindow[j] = Math.floor((sample + 1) * 127.5);
  }

  // draw waveform
  ctx.strokeStyle = waveColor.value;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const sens = parseFloat(sensibilitySlider.value);
  switch (waveformType.value) {
    case "linear":
      drawLinear.call(
        {
          canvas: { width: w, height: h },
          moveTo: ctx.moveTo.bind(ctx),
          lineTo: ctx.lineTo.bind(ctx),
          beginPath: ctx.beginPath.bind(ctx),
          lineJoin: ctx.lineJoin,
          lineCap: ctx.lineCap,
          lineWidth: ctx.lineWidth,
        },
        dataWindow,
        sens
      );
      break;
    case "polar":
      drawPolar.call(ctx, dataWindow, sens);
      break;
    case "spectrogram":
      drawSpectrogram.call(ctx, dataWindow, sens);
      break;
    case "blob":
      drawBlob.call(ctx, dataWindow, sens);
      break;
  }
  ctx.stroke();
}

/**
 * Draw your waveform at given time into any 2D context.
 * You must adapt this to call your existing drawLinear/drawBlob/etc,
 * but targeting the passed-in ctx (not frontCtx).
 */
function renderFrameAt(timeSec, ctx, w, h, audioBuffer) {
  // clear
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, w, h);

  // pick your data slice from the passed-in audioBuffer
  const sampleIndex = Math.floor(timeSec * audioBuffer.sampleRate);
  const dataWindow = new Uint8Array(2048);
  const channelData = audioBuffer.getChannelData(0);
  for (let j = 0; j < 2048; j++) {
    const s = channelData[sampleIndex + j] || 0;
    dataWindow[j] = Math.floor((s + 1) * 127.5);
  }

  // draw waveform on ctx
  ctx.strokeStyle = waveColor.value;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sens = parseFloat(sensibilitySlider.value);
  switch (waveformType.value) {
    case "linear":
      // UPDATED: use ctx directly instead of currentCtx
      {
        const step = w / dataWindow.length;
        for (let i = 0; i < dataWindow.length; i++) {
          const centerY = h / 2;
          const y = centerY + ((dataWindow[i] - 128) / 128) * centerY * sens;
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y);
        }
      }
      break;
    case "polar":
      // similarly inline your polar draw logic using ctx, w, h, dataWindow, sens
      drawPolar.call(ctx, dataWindow, sens);
      break;
    case "spectrogram":
      drawSpectrogram.call(ctx, dataWindow, sens);
      break;
    case "blob":
      drawBlob.call(ctx, dataWindow, sens);
      break;
  }

  ctx.stroke();
}

/**
 * 1) Offline‐encode video frames at max speed (OffscreenCanvas + WebCodecs)
 * 2) Encode the ENTIRE original audio buffer in one go (AudioData)
 * 3) Mux into MP4 via mp4-muxer
 */
async function exportWithCodecs(audioBuffer) {
  // — Show progress UI —
  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";
  const spectrogramFrames = await generateSpectrogramFrames(audioBuffer, fps);
  progressText.textContent = "0%";
  const width = canvas.width;
  const height = canvas.height;
  const duration = audioBuffer.duration;
  const totalFrames = Math.ceil(duration * fps);

  // ——— Prep muxer ———
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    fastStart: "in-memory",
    video: {
      codec: "avc",
      width,
      height,
      frameRate: fps,
    },
    audio: {
      codec: "aac",
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate,
    },
  });

  // ——— VideoEncoder ———
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error(e),
  });
  videoEncoder.configure({
    codec: "avc1.42E01F",
    width,
    height,
    bitrate: 2_000_000,
    framerate: fps,
  });

  // ——— AudioEncoder ———
  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (e) => console.error(e),
  });
  audioEncoder.configure({
    codec: "mp4a.40.2",
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    bitrate: 128_000,
  });

  // ——— Offscreen setup & redirect draws ———
  const offscreen = new OffscreenCanvas(width, height);
  const offCtx = offscreen.getContext("2d");
  const prevCtx = currentCtx;
  currentCtx = offCtx;

  const sens = parseFloat(sensibilitySlider.value);
  const samples = audioBuffer.getChannelData(0);

  // ——— Encode video frames ———
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;

    // clear
    offCtx.fillStyle = bgColor.value;
    offCtx.fillRect(0, 0, width, height);

    // build data window
    const idxStart = Math.floor(t * audioBuffer.sampleRate);
    const window = new Uint8Array(2048);
    for (let j = 0; j < 2048; j++) {
      const s = samples[idxStart + j] || 0;
      window[j] = Math.floor((s + 1) * 127.5);
    }

    // draw exactly as live preview
    offCtx.strokeStyle = waveColor.value;
    offCtx.lineWidth = 2;
    offCtx.beginPath();
    if (waveformType.value === "spectrogram") {
      // use the precomputed FFT for frame i (fallback to last frame)
      const freqData =
        spectrogramFrames[i] || spectrogramFrames[spectrogramFrames.length - 1];
      drawSpectrogram(freqData, sens);
    } else if (waveformType.value === "linear") {
      drawLinear(window, sens);
    } else if (waveformType.value === "polar") {
      drawPolar(window, sens);
    } else {
      drawBlob(window, sens);
    }
    offCtx.stroke();

    // encode frame
    const bitmap = offscreen.transferToImageBitmap();
    const frame = new VideoFrame(bitmap, { timestamp: i * (1e6 / fps) });
    videoEncoder.encode(frame);
    frame.close();
    // — Update progress bar —
    const percent = Math.floor(((i + 1) / totalFrames) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = percent + "%";
  }
  await videoEncoder.flush();

  // restore live draw context
  currentCtx = prevCtx;

  // ——— Encode ENTIRE audio buffer as one AudioData ———
  // ——— Interleave all channels into one Float32Array ———
  const chCount = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.getChannelData(0).length;
  // collect each channel’s data
  const channels = Array.from({ length: chCount }, (_, ch) =>
    audioBuffer.getChannelData(ch)
  );
  // interleave L0,R0,L1,R1,… for stereo (or more channels)
  const interleaved = new Float32Array(frameCount * chCount);
  for (let i = 0; i < frameCount; i++) {
    for (let ch = 0; ch < chCount; ch++) {
      interleaved[i * chCount + ch] = channels[ch][i];
    }
  }

  // ——— Now encode the interleaved PCM in one go ———
  const ad = new AudioData({
    format: "f32",
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: chCount,
    numberOfFrames: frameCount,
    timestamp: 0,
    data: interleaved,
  });
  audioEncoder.encode(ad);
  ad.close();
  await audioEncoder.flush();

  // ——— Finalize & download ———
  muxer.finalize();
  const { buffer } = muxer.target;
  const blob = new Blob([buffer], { type: "video/mp4" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "waveform.mp4";
  a.click();
  // — Ensure it finishes at 100% and hide after a moment —
  progressBar.style.width = "100%";
  progressText.textContent = "100%";
  setTimeout(() => progressContainer.classList.add("hidden"), 1500);
}
