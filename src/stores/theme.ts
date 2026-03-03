import { defineStore } from "pinia";

export const useThemeStore = defineStore('theme', {
    state: () => ({
        current:'light' as 'light' | 'dark' | 'campus'
    }),
    actions: {
        setTheme(theme: 'light' | 'dark' | 'campus') {
            this.current = theme
            document.documentElement.setAttribute('data-theme', theme)
            localStorage.setItem('theme',theme)
        },
        init() {
            const saved = localStorage.getItem('theme') as any
            if (saved && ['light', 'dark', 'campus'].includes(saved)) {
                this.setTheme(saved)
            } else {
                this.setTheme('light')
            }
        }
    }
})