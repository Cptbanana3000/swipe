// swipe/packages/client/vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite" // <--- IMPORT THIS

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- ADD THE PLUGIN HERE
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})