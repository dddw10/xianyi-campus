<!-- src/components/AdvancedImageUpload.vue -->
<template>
    <div class="image-upload-container">

        <!-- 图片预览列表 -->
        <div class="image-list" v-if="imageList.length > 0">
            <div v-for="(img, index) in imageList" :key="img" class="image-item">
                <img :src="img" class="image-preview" @click="previewImage(img)" alt="preview" />
                <el-icon class="delete-btn" @click.stop="removeImage(index)">
                    <Close />
                </el-icon>
                <div v-if="index === 0" class="main-tag">主图</div>
            </div>
        </div>

        <!-- 上传区域 -->
        <el-upload v-if="imageList.length < limit" :action="uploadUrl" :headers="headers" :before-upload="beforeUpload"
            :on-success="handleSuccess" :on-error="handleError" :show-file-list="false" accept="image/*"
            class="upload-btn">
            <el-button type="primary" :disabled="imageList.length >= limit">
                <el-icon class="mr-1">
                    <Plus />
                </el-icon>
                上传图片
            </el-button>
        </el-upload>

        <!-- 预览对话框 -->
        <el-dialog v-model="previewVisible" :width="800">
            <img :src="previewUrl" class="preview-full" alt="preview" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { modalBox } from "@/components/messageBox/modalBox"

const props = defineProps({
    modelValue: {
        type: Array as () => string[],
        default: () => []
    },
    limit: {
        type: Number,
        default: 3
    }
})

const emit = defineEmits(['update:modelValue'])
const userStore = useUserStore()
const uploadUrl = '/api/upload/product'
const previewVisible = ref(false)
const previewUrl = ref('')

// 🔹 本地列表（用于 UI 渲染）
const imageList = ref<string[]>([...props.modelValue])

// 🔹 响应式 headers
const headers = computed(() => ({
    Authorization: `Bearer ${userStore.token}`
}))

// 🔹 监听 props 变化（父组件/Pinia 更新时同步）
watch(() => props.modelValue, (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(imageList.value)) {
        imageList.value = [...newVal]
    }
}, { deep: true })

// 🔹 上传校验
const beforeUpload = (file: File) => {
    const isValid = file.type.startsWith('image/')
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isValid) ElMessage.error('只能上传图片!')
    if (!isLt5M) ElMessage.error('图片大小不能超过 5MB!')
    return isValid && isLt5M
}

// 🔹 上传成功
const handleSuccess = (response: any) => {
    if (response?.code === 200) {
        const rawUrl = response?.data?.url || response?.url
        const imageUrl = typeof rawUrl === 'string' ? rawUrl.trim() : ''

        if (imageUrl) {
            imageList.value.push(imageUrl)
            // ✅ 关键：emit 给父组件（父组件会同步到 Pinia）
            emit('update:modelValue', [...imageList.value])
            ElMessage.success('上传成功')
        } else {
            ElMessage.warning('上传成功，但未返回图片地址')
        }
    } else {
        ElMessage.error(response?.msg || '上传失败')
    }
}

// 🔹 上传失败
const handleError = () => {
    ElMessage.error('上传失败，请检查网络')
}

// 🔹 删除图片
const removeImage = (index: number) => {
    modalBox({
        type: 'info',
        title: '提示',
        message: '确定要删除这张图片吗？',
        confirm: '确定',
        cancel: '取消'
    }).then((result: boolean) => {
        if (result) {
            imageList.value.splice(index, 1)
            // ✅ 关键：emit 给父组件
            emit('update:modelValue', [...imageList.value])
            ElMessage.success('删除成功')
        }
    })
}

// 🔹 预览大图
const previewImage = (url: string) => {
    previewUrl.value = url
    previewVisible.value = true
}
</script>

<style scoped>
/* 样式保持不变，略 */
.image-upload-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.image-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.image-item {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--el-border-color);
}

.image-item:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
}

.delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1;
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: scale(1.1);
}

.main-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--el-color-warning);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1;
}

.preview-full {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
}
</style>

<style scoped>
.image-upload-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.image-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.image-item {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--el-border-color);
    transition: all 0.3s;
}

.image-item:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
}

.delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 1;
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: scale(1.1);
}

.main-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--el-color-warning);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1;
}

.preview-full {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
}
</style>