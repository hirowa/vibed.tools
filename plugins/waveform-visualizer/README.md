## 〰️Waveform Visualizer
![image](https://github.com/user-attachments/assets/0c1949b8-5549-42df-ac1a-b3f939e253d3)

**Waveform Visualizer** is an interactive media plugin that transforms audio into mesmerizing waveform animations, offering users a customizable experience to generate and export visually engaging audio-reactive content. It’s ideal for content creators, musicians, and developers looking to visualize sound as high-quality MP4 video clips.

### Features

- **Multiple Waveform Styles**: Choose from _Linear_, _Polar (Circular)_, _Spectrogram_, or _Blob (Siri-style)_ animations to best match the mood and vibe of your audio.
- **Color Customization**: Modify both the waveform and background colors using intuitive color pickers and HEX input fields.
- **Flexible Aspect Ratios**: Supports square (1:1), landscape (3:2), and portrait (2:3) layouts to match social media formats.
- **Live Preview & Real-time Playback**: Play and visualize your audio instantly with a real-time canvas renderer.
- **Sensibility Control**: Adjust waveform sensitivity with a smooth slider, changing how reactive the visuals are to the audio amplitude.
- **Export to Video (MP4)**: Generates high-quality video files using WebCodecs + mp4-muxer for full offline export including synchronized audio and animation.
- **Progress Feedback**: Integrated progress bar shows real-time rendering status when exporting video.

---

### How to use?

1. **Upload Audio**: Click "Upload Audio Files" to select a compatible file (.mp3, .wav, .ogg, .flac, .aac, .m4a, .aiff).
2. **Customize Appearance**:
   - Select waveform style from the dropdown.
   - Pick waveform and background colors.
   - Choose aspect ratio (1:1, 3:2, 2:3).
   - Adjust the "Sensibility" slider to control animation amplitude.
3. **Render and Preview**:
   - Press the "Render Waveform" button or the green "Play" button to start playback and preview the animation.
4. **Export to Video**:
   - Click “Export as Video” to begin rendering the animation to MP4.
   - Monitor progress via the export bar.
   - Once completed, the download starts automatically.

---

### Special Requirements

- **Modern Browser Support**: Requires a browser supporting WebCodecs API and OffscreenCanvas (e.g. latest Chrome, Edge).
- **No External FFmpeg**: Uses browser-native tools (WebCodecs + `mp4-muxer`) for exporting video and audio, avoiding external dependencies.
