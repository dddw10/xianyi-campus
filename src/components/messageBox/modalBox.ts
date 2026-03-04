import { createApp, h } from "vue";
import modalMessage from "@/components/messageBox/modalMessage.vue";
import type { Props as ModalProps } from "@/components/messageBox/modalMessage.vue";

export interface ModalBoxOptions extends Omit<ModalProps, 'visible'> {
    // 扩展
    onConfirm?: () => void
    onCancel?: () => void
}

export function modalBox(options: ModalBoxOptions): Promise<boolean> {
    return new Promise((resolve) => {
        // 创建容器
        const container = document.createElement('div')
        document.body.appendChild(container)

        const app = createApp({
            render() {
                return h(modalMessage, {
                    visible: true,
                    ...options,
                    'onUpdate:visible': (v: boolean) => {
                        if (!v) {
                            setTimeout(() => {
                                app.unmount()
                                container.remove()
                            })
                        }
                    },
                    onConfirm: () => {
                        options.onConfirm?.()
                        resolve(true)
                    },
                    onCancel: () => {
                        options.onCancel?.()
                        resolve(false)
                    }
                })
            }
        })

        app.mount(container)
    })
}