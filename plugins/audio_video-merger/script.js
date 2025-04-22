const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

let videoFile, audioFile;

// UI elements
const videoInput = document.getElementById("video-input");
const audioInput = document.getElementById("audio-input");
const mergeBtn = document.getElementById("merge-btn");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const resultSection = document.getElementById("result-section");
const mergedVideo = document.getElementById("merged-video");
const downloadBtn = document.getElementById("download-btn");

// Progress callback
ffmpeg.setProgress(({ ratio }) => {
  progressBar.style.width = `${Math.round(ratio * 100)}%`;
});

// File change handlers
videoInput.addEventListener("change", (e) => {
  videoFile = e.target.files[0];
});
audioInput.addEventListener("change", (e) => {
  audioFile = e.target.files[0];
});

// Merge logic
mergeBtn.addEventListener("click", async () => {
  if (!videoFile || !audioFile) {
    alert("Please upload both a video and an audio file.");
    return;
  }

  progressContainer.classList.remove("hidden");
  mergeBtn.disabled = true;

  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  await ffmpeg.FS("writeFile", "input_video", await fetchFile(videoFile));
  await ffmpeg.FS("writeFile", "input_audio", await fetchFile(audioFile));

  await ffmpeg.run(
    "-i",
    "input_video",
    "-i",
    "input_audio",
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest", // crop audio to match video length
    "output.mp4"
  );

  const data = ffmpeg.FS("readFile", "output.mp4");
  const url = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );

  mergedVideo.src = url;
  downloadBtn.href = url;
  downloadBtn.classList.remove("hidden");
  resultSection.classList.remove("hidden");

  progressContainer.classList.add("hidden");
  mergeBtn.disabled = false;
});
