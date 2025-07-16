import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { registerRoutes } from "./routes"; // adjust as needed
import { setupVite } from "./vite"; // if used in dev
import { serveStatic } from "./vite"; // if used in prod
import { log } from "./log"; // optional if you have logging

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server); // use Vite middleware for dev
  } else {
    // ✅ Serve static frontend files in production
    app.use(express.static(path.join(__dirname, "public")));

    // ✅ Catch-all route for React
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`✅ Server is running at http://localhost:${port}`);
    }
  );
})();
