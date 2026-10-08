import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { purchaseApi } from "./plugins/purchaseApi.ts"

export default defineConfig({
  plugins: [react(), tailwindcss(), purchaseApi()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
