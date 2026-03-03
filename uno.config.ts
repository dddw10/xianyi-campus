// uno.config.ts
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class'
    })
  ],
  theme: {
    breakpoints: {
      xs: '375px', // 新增：小屏起始点
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    colors: {
      primary: 'var(--primary)',
      bg: 'var(--bg)',
      text: 'var(--text)',
    },
  },
})
