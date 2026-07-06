import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        research: resolve(__dirname, "research.html"),
        projects: resolve(__dirname, "projects.html"),
        notes: resolve(__dirname, "notes.html"),
        teaching: resolve(__dirname, "teaching.html"),
        cv: resolve(__dirname, "cv.html"),
        contact: resolve(__dirname, "contact.html"),
        models: resolve(__dirname, "models.html"),
        notFound: resolve(__dirname, "404.html")
      }
    }
  }
});
