import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || "/",
    server: {
      port: 5173,
      strictPort: true,
      proxy: { "/api": `http://127.0.0.1:${env.PORT || 8788}` },
    },
    build: {
      chunkSizeWarningLimit: 700,
      rolldownOptions: {
        output: {
          manualChunks: (id) =>
            id.includes("html2canvas")
              ? "export"
              : id.includes("node_modules/qrcode")
                ? "qr"
                : undefined,
        },
      },
    },
  };
});
