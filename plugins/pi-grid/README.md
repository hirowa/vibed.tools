## π Grid Visualizer
<img width="1582" height="860" alt="image" src="https://github.com/user-attachments/assets/d55d2204-51d5-47bc-97a0-fb7d0202a537" />

**π Grid Visualizer** is an interactive browser-based tool that renders a grid of digits from π and visually highlights a specific sequence or word within the grid. Designed for educational or curiosity-driven exploration of the digits of π, it allows users to search for number sequences or encoded words and position them precisely within a customizable grid layout.

### Features

- **Sequence Search in π**: Upload a `.txt` file containing digits of π (\~1GB supported) and search for a digit sequence or a word (base-26 encoded).
- **Custom Grid Layout**: Set your desired grid dimensions (width and height), font style, and sequence placement (e.g., center, top-left, bottom-right).
- **Letter Encoding Support**: Automatically converts words into numeric sequences using base-26 encoding (A=0 to Z=25) for searching.
- **Highlighted Visualization**: The matched sequence is clearly bolded in the grid, rendered using a monospace font for clean alignment.
- **SVG Export**: Once generated, the visual grid can be exported as an SVG file for sharing or further use.

---

### How to use?

1. Download a `.txt` file containing digits of π from [this MIT mirror](https://stuff.mit.edu/afs/sipb/contrib/pi/).
2. Upload the file using the file selector in the sidebar.
3. Enter a digit sequence or word to search.
4. Customize the grid: set width (X), height (Y), font, position, and margin.
5. Click **Generate Grid** to visualize the match.
6. Optionally, click **Export SVG** to download the result.

---

### Special Requirements

- Requires a plain-text file with digits of π. A suitable file (\~1GB) can be downloaded from [https://stuff.mit.edu/afs/sipb/contrib/pi/](https://stuff.mit.edu/afs/sipb/contrib/pi/).
- Words are internally converted using base-26 encoding before the search.
- Modern browser support is required (runs entirely in the browser).
