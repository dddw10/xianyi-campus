// stores/theme.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const current = ref<'light' | 'dark'>('light')

    const setTheme = (theme: 'light' | 'dark') => {
        current.value = theme

        // 🔑 关键：操作 html 标签的 classList，Element Plus 依赖这个
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        // 可选：持久化到 localStorage
        localStorage.setItem('theme', theme)
    }

    const init = () => {
        // 1. 优先读取 localStorage
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (saved) {
            setTheme(saved)
            return
        }
        // 2. 其次跟随系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
    }

    return { current, setTheme, init }
}, {
    persist: true // 如果用了 pinia-plugin-persistedstate，可自动持久化
} as any)