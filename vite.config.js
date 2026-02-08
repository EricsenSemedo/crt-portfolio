import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/crt-portfolio/",
  test: {
    environment: "jsdom",
    globals: true,
  },
})
