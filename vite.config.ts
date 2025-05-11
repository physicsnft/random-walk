import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ['982b-83-50-210-50.ngrok-free.app'],
  },
  plugins: [react()],
  define: {
    global: 'globalThis', 
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
});

