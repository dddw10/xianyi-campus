import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Unocss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts:'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts:'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      // ✅ 关键：代理 /api 开头的请求到后端
      '/api': {
        target: 'http://localhost:3000',  // 后端地址
        changeOrigin: true,  // ✅ 必须 true，否则 Host 头不对
        secure: false,  // ✅ 如果是 http 不是 https，设为 false
        // 可选：重写路径（如果后端接口没有 /api 前缀）
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
