<!-- src/components/AdvancedImageUpload.vue -->
<template>
    <div class="image-upload-container">

        <!-- 🔥 图片预览列表（横向排列） -->
        <div class="image-list" v-if="imageList.length > 0">
            <div v-for="(img, index) in imageList" :key="img" class="image-item">
                <!-- 图片预览 -->
                <img :src="img" class="image-preview" @click="previewImage(img)" alt="preview" />

                <!-- 删除按钮（hover 显示） -->
                <div class="delete-overlay" @click.stop="removeImage(index)">
                    <el-icon class="text-white text-lg">
                        <Close />
                    </el-icon>
                </div>

                <!-- 主图标记 -->
                <div v-if="index === 0" class="main-tag">
                    <el-icon class="mr-1">
                        <Star />
                    </el-icon>
                    首图
                </div>
            </div>
        </div>

        <!-- 🔥 上传区域（虚线框样式，横向排列） -->
        <el-upload v-if="imageList.length < limit" :action="uploadUrl" :headers="headers" :before-upload="beforeUpload"
            :on-success="handleSuccess" :on-error="handleError" :show-file-list="false" accept="image/*"
            class="upload-area">
            <div class="upload-placeholder">
                <el-icon class="upload-icon">
                    <Plus />
                </el-icon>
                <span class="upload-text">添加首图</span>
            </div>
        </el-upload>

        <!-- 预览对话框 -->
        <el-dialog v-model="previewVisible" :width="800" class="image-preview-dialog">
            <img :src="previewUrl" class="preview-full" alt="preview" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Star } from '@element-plus/icons-vue'
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

// 🔹 监听 props 变化
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
/* 🔥 容器 */
.image-upload-container {
    display: flex;
    gap: 12px;
}

/* 🔥 图片列表（横向排列） */
.image-list {
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;
    /* 不换行 */
    overflow-x: auto;
    /* 超出可滚动 */
    padding-bottom: 4px;
}

/* 🔥 图片项 - 默认小屏 80px */
.image-item {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    /* 不收缩 */
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    transition: all 0.3s ease;
}

.image-item:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
    transform: translateY(-2px);
}

/* 🔥 图片预览 */
.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
}

/* 🔥 删除遮罩层 */
.delete-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;
    z-index: 2;
}

.image-item:hover .delete-overlay {
    opacity: 1;
}

.delete-overlay:hover {
    background: rgba(0, 0, 0, 0.7);
}

/* 🔥 主图标记（缩小版） */
.main-tag {
    position: absolute;
    top: 4px;
    left: 4px;
    background: linear-gradient(135deg, var(--el-color-warning) 0%, var(--el-color-warning-light-3) 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 3;
}

.main-tag .el-icon {
    font-size: 10px;
    margin-right: 2px;
}

/* 🔥 上传区域（虚线框）- 默认小屏 80px */
.upload-area {
    display: inline-block;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}

.upload-area :deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.upload-placeholder {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--el-border-color);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--el-fill-color-blank);
    cursor: pointer;
    transition: all 0.3s ease;
}

.upload-placeholder:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
}

.upload-icon {
    font-size: 20px;
    color: var(--el-color-primary);
    transition: transform 0.3s ease;
}

.upload-placeholder:hover .upload-icon {
    transform: scale(1.1);
}

.upload-text {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}

/* 🔥 预览对话框 */
.preview-full {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
}

/* 🔥 响应式：768px 以上改为 120px */
@media (min-width: 768px) {

    .image-item,
    .upload-area {
        width: 120px;
        height: 120px;
    }

    .upload-icon {
        font-size: 28px;
    }

    .upload-text {
        font-size: 13px;
    }

    .main-tag {
        top: 6px;
        left: 6px;
        padding: 3px 8px;
        font-size: 11px;
    }

    .main-tag .el-icon {
        font-size: 11px;
        margin-right: 3px;
    }
}
</style>

<!-- ✅ 对话框全局样式 -->
<style>
.image-preview-dialog .el-dialog__body {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.9);
}

.image-preview-dialog .el-dialog__header {
    display: none;
}
</style>