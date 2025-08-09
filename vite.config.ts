import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true,
      strictPort: true,
      hmr: {
        host: env.VITE_HOST,
      },
      proxy: {
        '/api': {
          target: `http://${env.VITE_HOST}:${env.VITE_OLLAMA_PORT}`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('origin', `http://${env.VITE_HOST}:${env.VITE_OLLAMA_PORT}`);
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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react-markdown') || id.includes('micromark') || id.includes('rehype')) {
              return 'markdown';
            }
            if (id.includes('@mantine')) {
              return 'mantine';
            }
            if (id.includes('ollama')) {
              return 'ollama';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  }
})