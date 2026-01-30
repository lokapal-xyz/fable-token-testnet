import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs";
import path from "path";

export default defineConfig(() => {
  // Check if we are running on Vercel or in a CI environment
  const isVercel = process.env.VERCEL === "1";

  // Only try to read certs if we are NOT on Vercel
  const httpsConfig =
    !isVercel && fs.existsSync(path.resolve(__dirname, ".cert/localhost+2.pem"))
      ? {
          key: fs.readFileSync(
            path.resolve(__dirname, ".cert/localhost+2-key.pem"),
          ),
          cert: fs.readFileSync(
            path.resolve(__dirname, ".cert/localhost+2.pem"),
          ),
        }
      : undefined;

  return {
    plugins: [
      react(),
      nodePolyfills({
        include: ["buffer"],
        globals: {
          Buffer: true,
        },
      }),
      wasm(),
    ],
    build: {
      target: "esnext",
    },
    optimizeDeps: {
      exclude: ["@stellar/stellar-xdr-json"],
    },
    define: {
      global: "window",
    },
    envPrefix: "PUBLIC_",
    server: {
      https: httpsConfig, // Use the dynamic config here
      proxy: {
        "/friendbot": {
          target: "http://localhost:8000/friendbot",
          changeOrigin: true,
        },
      },
    },
  };
});
