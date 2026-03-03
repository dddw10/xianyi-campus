import type { App } from "vue";
import modalMessage from '@/components/messageBox/modalMessage.vue'

// 组件列表
const components = [
    modalMessage,
]

export function registerGlobalComponents(app: App) {
    components.forEach(component => {
        // 优先使用组件的name，其次用文件名
        const name = component.name || component.__name
        if (name) {
            app.component(name, component)
        }
    })
}