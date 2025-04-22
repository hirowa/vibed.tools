# Advanced Stipple Effect Editor

## Script Overview

The **Advanced Stipple Effect Editor** is a web-based image processing tool designed for artists, designers, and creative developers to generate **stippled imagery** from uploaded photos using advanced dithering algorithms. It provides a user-friendly interface for transforming raster images into artistic stippled outputs with detailed control over dither method, dot configuration, color settings, and export formats.

## Detailed Use/Features

This editor enables users to:

1. **Upload and preview images** in a canvas environment.
2. **Apply various dithering algorithms**:
   - Atkinson
   - Bayer
   - Floyd-Steinberg
   - Manual control (with custom dot settings)
3. **Fine-tune stippling appearance**:
   - Adjustable threshold for pixel-level processing.
   - Dot customization (shape, size, spacing, contrast, brightness).
   - Shape selection: square, circle, triangle, or a custom character.
4. **Full color configuration**:
   - Set dot and background colors.
   - Toggle reverse color and color mode.
   - Choose to export with/without background.
5. **Export processed images**:
   - Format options: PNG, SVG, or both.
   - Export single or multiple image outputs.
6. **Built-in tools**:
   - Original vs processed image comparison.
   - Zoom reset.
   - View log of operations for review/debugging.

## Installation

### Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge).
- Internet connection for CDN resources (Bootstrap & Font Awesome).
- No server-side component required (purely client-side).

### Installation Steps

1. **Clone or download** the project folder.
2. Ensure all linked assets (`styles.css`, `script.js`) are located correctly in their relative directories.
3. Open the `index.html` in any supported web browser.

### Usage

1. Launch the `index.html` file in a browser.
2. Use the **Upload** button or drag & drop to select images.
3. Choose a **dithering method** from the dropdown.
4. Adjust **threshold** and other image parameters via sliders.
5. Optionally tweak manual settings if "Manual" dithering is selected.
6. Customize dot and background colors, shapes, and toggle effects.
7. Click **Export** to save the processed image in desired format(s).

## Disclaimer

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Additionally, the code presented here has been generated with the assistance of AI and may contain errors or require adjustments for specific use cases. This script has only been tested on Windows 11, and its compatibility with other operating systems is not guaranteed. Users are advised to back up their data before running the script to prevent any accidental loss of files.
