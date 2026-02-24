import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/bus-route-hk/', // GitHub Pages 部署路径
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    proxy: {
      // 代理 hkbus API 请求
      '/api/hkbus': {
        target: 'https://hkbus.github.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hkbus/, '/hk-bus-crawling'),
        secure: false,
      },
      // 代理 waypoints 请求
      '/api/waypoints': {
        target: 'https://hkbus.github.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/waypoints/, '/route-waypoints'),
        secure: false,
      },
    },
  },
})
