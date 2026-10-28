import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/kurio-nft/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 4174 },
  preview: { port: 4174 },
  build: { sourcemap: true },
}));
