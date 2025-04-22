+++ ~/.vscode/extensions/ritwickdey.live-server-X.X.X/node_modules/live-server/index.js
@@ (inside the `liveServer` function, after any existing `app.use(require('cors')(...))` block)
if (cors) {
app.use(require("cors")({ origin: true, credentials: true }));
}

- // ─── ENABLE SHAREDARRAYBUFFER ─────────────────────────────────────────────────
- app.use((req, res, next) => {
- res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
- res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
- next();
- });
