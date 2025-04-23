## 📏 Body Measurements
![image](https://github.com/user-attachments/assets/989fa7e2-a70b-4a61-b1fe-07bc85b4fb74)

This plugin provides an intuitive interface to calculate real-world body dimensions from a single image by leveraging a height reference. It allows users to upload a full-body photo, mark reference points, and draw lines corresponding to various body parts. Once the user's height is known, it automatically calculates other measurements in centimeters or inches.

### Features

- **Height-anchored scaling**: Start with a height reference to calibrate the scale from pixels to real-world units.
- **Interactive line drawing**: Click on the image to draw lines representing body parts like shoulder width, torso length, arms, legs, and inseam.
- **Ruler overlays**: Add draggable horizontal rulers to assist with visual alignment.
- **Live measurement summary**: See calculated measurements updated in real time, with copy-to-clipboard functionality.
- **Reset controls**: Buttons to reset rulers or clear all data and start over.

---

### How to use?

1. **Upload a full-body photo** via the input on the sidebar.
2. **Enter your height** and select the unit (cm or in).
3. **Choose “Height Reference”**, then click on the image to draw a line from head to toe.
4. **Switch to other measurement types** (shoulder, torso, etc.) and draw lines for each.
5. **See results** appear in the summary panel. Use the copy buttons to grab individual or all measurements.

---

### Special Requirements

- Requires a clear, full-body image with the subject standing upright.
- Accurate scaling depends on the precision of the height reference line.
- Modern browser support (uses Canvas API and Clipboard API). No server-side processing.
