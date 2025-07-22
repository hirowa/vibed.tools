## π Digit Finder

**π Digit Finder** is a high-performance browser tool designed to search for digit sequences or encoded words within the first billion digits of π. Built for speed and simplicity, it streams large `.txt` files in chunks and performs fast substring matching using the KMP algorithm. It supports searching for both raw numbers and base-26 encoded words, making it a powerful tool for π enthusiasts, educators, and number pattern researchers.

### Features

- **Efficient Search**: Streams large π digit files (≈1 GB) in 4MB chunks using KMP pattern matching for fast and memory-safe searching.
- **Digit or Word Input**: Search for numeric sequences or words. Words are automatically encoded to base-26 (A=0…Z=25) to match numeric substrings.
- **Match Count Control**: Limit search results by setting the maximum number of matches (up to 1000).
- **Interactive Interface**: See each result clearly listed with 1-based starting positions and a live progress bar during scanning.
- **Abortable Search**: Cancel searches at any point with one click.

---

### How to use?

1. Download a `.txt` file containing digits of π from [https://stuff.mit.edu/afs/sipb/contrib/pi/](https://stuff.mit.edu/afs/sipb/contrib/pi/).
2. Upload the file using the **Pi Digits File** input.
3. Type a number or word in the **Sequence or Word** box.
4. (Optional) Set a limit for the number of matches.
5. Click **Start Search** to begin scanning.
6. View results with position indices; click **Cancel Search** anytime to stop early.

---

### Special Requirements

- A plain-text file containing digits of π is required (≈1 GB). Download it from: [MIT SIPB π repository](https://stuff.mit.edu/afs/sipb/contrib/pi/).
- Words must contain only A–Z characters; others are filtered.
- Modern browsers only; all processing happens locally without server use.
