import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

// Plugin to:
// 1. Set correct Content-Type for .wasm files
// 2. Prevent SPA fallback from hijacking .wasm requests (return 404 instead of HTML)
function wasmPlugin(): Plugin {
  return {
    name: 'wasm-fix',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
        next();
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), wasmPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    worker: {
      format: 'es',
    },
    // Exclude tfhe from dependency pre-bundling — it uses dynamic WASM loading
    // that breaks when bundled. Keeping it as-is preserves import.meta.url resolution.
    optimizeDeps: {
      exclude: ['tfhe'],
    },
    assetsInclude: ['**/*.wasm'],
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

