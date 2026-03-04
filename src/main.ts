// import './assets/main.css'禁用原有主题


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/modules/user'
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

app.use(createPinia())
app.use(router)
useTheme().init()
registerGlobalComponents(app)
setupModalBox(app)

const userStore = useUserStore()
userStore.init()

app.mount('#app')
