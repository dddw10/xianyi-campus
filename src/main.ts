// import './assets/main.css'禁用原有主题

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { setupTokenSync } from '@/utils/token'
import { useTheme } from "@/composables/useTheme";
import { registerGlobalComponents } from "@/plugins/components";//注册全局组件
import { setupModalBox } from "./plugins/modalBox";

import App from './App.vue'
import router from './router'
import 'element-plus/es/components/message/style/css'
import './style/theme.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/global.scss'
import 'virtual:uno.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
useTheme().init()
registerGlobalComponents(app)
setupModalBox(app)

const registerAuthEventHandlers = (userStore: ReturnType<typeof useUserStore>) => {
    let isHandlingAuthEvent = false

    const handleAuthExpired = async () => {
        if (isHandlingAuthEvent || !userStore.token) return

        isHandlingAuthEvent = true
        try {
            await userStore.logout()
        } finally {
            isHandlingAuthEvent = false
        }
    }

    const handleTokenRemoved = async () => {
        if (isHandlingAuthEvent || !userStore.token) return

        isHandlingAuthEvent = true
        try {
            ElMessage.warning('当前账号已在其他标签页退出登录')
            await userStore.logout()
        } finally {
            isHandlingAuthEvent = false
        }
    }

    window.addEventListener('token:expired', handleAuthExpired)
    window.addEventListener('token:removed', handleTokenRemoved)
}

async function bootstrap() {
    const userStore = useUserStore(pinia)

    setupTokenSync()
    registerAuthEventHandlers(userStore)

    await userStore.init()
    app.mount('#app')
}

void bootstrap()
