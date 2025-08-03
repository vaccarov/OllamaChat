import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true,
      strictPort: true,
      hmr: {
        host: env.VITE_OLLAMA_HOST,
      },
      proxy: {
        '/api': {
          target: `http://${env.VITE_OLLAMA_HOST}:${env.VITE_OLLAMA_PORT}`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('origin', `http://${env.VITE_OLLAMA_HOST}:${env.VITE_OLLAMA_PORT}`);
            });
          }
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
        'ollama': 'ollama/browser'
      },
    },
  }
})