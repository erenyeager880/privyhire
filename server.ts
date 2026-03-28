import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Explicitly set WASM MIME type
  express.static.mime.define({ 'application/wasm': ['wasm'] });

  // Mock data for matches
  app.get("/api/matches", (req, res) => {
    res.json([
      {
        id: "204",
        role: "Senior Systems Architect",
        matchScore: 94,
        tags: ["Rust", "Distributed Systems", "Cryptography"],
        experience: "12 Years",
        equity: "0.5% - 1.2%",
        location: "Remote (Global)"
      },
      {
        id: "118",
        role: "Lead Product Designer",
        matchScore: 88,
        tags: ["Prototyping", "System Thinking", "Web3 UI"],
        experience: "8 Years",
        equity: "Confidential",
        location: "Zurich / Hybrid"
      }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
