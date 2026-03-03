import type { App, ComponentCustomProperties } from "vue";
import { modalBox } from "@/components/messageBox/modalBox";

// 类型声明
declare module 'vue' {
    interface ComponentCustomProperties {
        $modalBox: typeof modalBox;
    }
}

export function setupModalBox(app: App) {
    // 挂载到globalProperties
    app.config.globalProperties.$modalBox = modalBox
}

// 默认导出
export default {
    install: setupModalBox
}