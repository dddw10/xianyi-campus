import { useThemeStore } from "@/stores/theme";

export function useTheme() {
    const store = useThemeStore()
    return {
        current: store.current,
        setTheme: store.setTheme,
        init: store.init
    }
}