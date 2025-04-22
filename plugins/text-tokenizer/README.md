## 🔤 Text Tokenizer
![image](https://github.com/user-attachments/assets/df931bdc-d0eb-4b3b-987d-1db2d8d0aeb3)

**Text Tokenizer** is a web-based tool designed to analyze any input text and display detailed metrics including word count, character count, and token count (using OpenAI’s `cl100k_base` tokenizer). Users can also strip HTML tags from their input and optionally split the text into smaller, token-limited chunks for better readability or model handling. It's a perfect utility for developers, writers, and AI prompt engineers needing precise text insights.

---

### Features

- **Live Word, Character & Token Counting**: Instantly displays word, character, and token counts as you type.
- **HTML Stripping Option**: Cleans out all HTML tags from input text with one checkbox toggle.
- **Token-Based Chunking**: Splits large input into customizable token-sized chunks.
- **Preview Limit for Chunks**: Allows setting a visible character limit per chunk for quick scanning.
- **Clipboard Copy Function**: Enables copying entire chunks to clipboard with one click.
- **Interactive UI**: Uses modern UI libraries like Flowbite and Font Awesome for a sleek and intuitive user experience.

---

### How to use?

1. Open the app in a browser.
2. Enter or paste text into the **Text Input** area.
3. (Optional) Check **“Strip HTML tags”** if your input contains HTML.
4. (Optional) Enable **“Split into chunks”** and select a chunk size (in tokens).
5. Click **“Process Text”**.
6. View word, character, and token counts in the **Analysis Results** panel.
7. If chunking is enabled, scroll down to see each token chunk with a copy button.

---

### Special Requirements

- **Internet Connection**: The script depends on external CDN imports (e.g., js-tiktoken, Flowbite, Font Awesome).
- **Modern Browser**: Requires JavaScript and ES module support.
