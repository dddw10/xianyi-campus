// src/stores/modules/publish.ts
import { defineStore } from 'pinia'

export interface PublishFormData {
    title: string
    price: number
    category: string
    description: string
    images: string[]
}

export const usePublishStore = defineStore('publish', {
    state: (): { formData: PublishFormData } => ({
        formData: {
            title: '',
            price: 0,
            category: '',
            description: '',
            images: []  // ✅ 图片列表存在这里，路由切换不丢失
        }
    }),

    actions: {
        // 更新整个表单
        updateForm(data: Partial<PublishFormData>) {
            this.formData = { ...this.formData, ...data }
        },

        // 添加图片
        addImage(url: string) {
            if (this.formData.images.length < 3) {
                this.formData.images.push(url)
            }
        },

        // 删除图片
        removeImage(index: number) {
            this.formData.images.splice(index, 1)
        },

        // 重置表单（发布成功后调用）
        resetForm() {
            this.formData = {
                title: '',
                price: 0,
                category: '',
                description: '',
                images: []
            }
        },

        // 手动设置图片列表（供子组件 v-model 使用）
        setImages(images: string[]) {
            this.formData.images = images
        }
    }
})