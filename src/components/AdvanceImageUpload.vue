<!-- src/components/AdvancedImageUpload.vue -->
<template>
    <div class="image-upload-container">

        <!-- 🔥 图片预览列表 -->
        <div class="image-list" v-if="imageList.length > 0">
            <div v-for="(img, index) in imageList" :key="img" class="image-item">
                <!-- 图片预览 -->
                <el-image :src="img" class="image-preview" fit="cover" :preview-src-list="imageList"
                    :initial-index="index" preview-teleported />

                <!-- 🖥️ 桌面端：hover 显示遮罩删除按钮 -->
                <div class="delete-overlay desktop-only" @click.stop="removeImage(index)">
                    <el-icon class="text-white text-lg">
                        <Close />
                    </el-icon>
                </div>

                <!-- 📱 移动端：右上角固定显示角标删除按钮 -->
                <div class="delete-badge mobile-only" @click.stop="removeImage(index)">
                    <el-icon class="text-white">
                        <CloseBold />
                    </el-icon>
                </div>

                <!-- 主图标记（仅大屏显示） -->
                <div v-if="index === 0 && props.width > 100" class="main-tag">
                    <el-icon class="mr-1">
                        <Star />
                    </el-icon>
                    首图
                </div>
            </div>
        </div>

        <!-- 🔥 上传区域（虚线框样式） -->
        <el-upload v-if="imageList.length < limit" :action="uploadUrl" :headers="headers" :before-upload="beforeUpload"
            :on-success="handleSuccess" :on-error="handleError" :show-file-list="false" accept="image/*"
            class="upload-area">
            <div class="upload-placeholder">
                <el-icon class="upload-icon">
                    <Plus />
                </el-icon>
                <span class="upload-text">添加</span>
                <span class="upload-count" v-if="imageList.length > 0">
                    {{ imageList.length }}/{{ limit }}
                </span>
            </div>
        </el-upload>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, CloseBold, Star } from '@element-plus/icons-vue'
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
    },
    width: {
        type: Number,
        default: 120
    }
})

const emit = defineEmits(['update:modelValue'])
const userStore = useUserStore()
const uploadUrl = '/api/upload/product'

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
</script>

<style scoped>
/* 🔥 容器 - 移动端优化 */
.image-upload-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
}

/* 🔥 图片列表 - 移动端允许换行 */
.image-list {
    display: contents;
    /* 让图片项直接参与容器布局 */
}

/* 🔥 图片项 - 基础样式 */
.image-item {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    background: var(--el-fill-color-blank);
    border: 2px solid var(--el-border-color);
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
    display: block;
    cursor: pointer;
}

/* 🔥 删除遮罩层 - 桌面端专用 */
.delete-overlay.desktop-only {
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

/* 桌面端：hover 时显示遮罩 */
@media (hover: hover) and (pointer: fine) {
    .image-item:hover .delete-overlay.desktop-only {
        opacity: 1;
    }

    .delete-overlay.desktop-only:hover {
        background: rgba(0, 0, 0, 0.7);
    }

    /* 桌面端隐藏移动端角标 */
    .delete-badge.mobile-only {
        display: none !important;
    }
}

/* 移动端：隐藏遮罩，显示角标 */
@media (hover: none) and (pointer: coarse),
(max-width: 767px) {
    .delete-overlay.desktop-only {
        display: none !important;
    }
}

/* 🔹 移动端删除角标 */
.delete-badge.mobile-only {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(245, 108, 108, 0.95);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s ease, background 0.2s ease;
    border: 2px solid white;
}

@media (hover: none) and (pointer: coarse),
(max-width: 767px) {
    .delete-badge.mobile-only {
        display: flex;
    }
}

.delete-badge:active {
    transform: scale(0.9);
    background: rgba(220, 53, 69, 0.95);
}

.delete-badge .el-icon {
    font-size: 13px;
}

/* 🔥 主图标记 */
.main-tag {
    position: absolute;
    top: 6px;
    left: 6px;
    background: linear-gradient(135deg, var(--el-color-warning) 0%, var(--el-color-warning-light-3) 100%);
    color: white;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 3;
    pointer-events: none;
}

.main-tag .el-icon {
    font-size: 11px;
    margin-right: 2px;
}

/* 🔥 上传区域 */
.upload-area {
    display: inline-block;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.upload-area :deep(.el-upload) {
    width: 100%;
    height: 100%;
    display: block;
}

.upload-placeholder {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--el-border-color);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--el-fill-color-blank);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.upload-placeholder:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
}

.upload-icon {
    font-size: 32px;
    color: var(--el-color-primary);
    transition: transform 0.3s ease;
}

.upload-placeholder:hover .upload-icon {
    transform: scale(1.1);
}

.upload-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
    text-align: center;
}

.upload-count {
    position: absolute;
    bottom: -8px;
    right: -8px;
    background: var(--el-color-primary);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 🔥 移动端优化（< 640px） */
@media (max-width: 639px) {
    .image-upload-container {
        gap: 10px;
    }

    .image-item {
        width: 100px !important;
        height: 100px !important;
        border-radius: 10px;
    }

    .image-item:active {
        border-color: var(--el-color-primary);
        transform: scale(0.98);
    }

    .upload-area {
        width: 100px !important;
        height: 100px !important;
    }

    .upload-placeholder {
        border-radius: 10px;
        border-width: 2px;
    }

    .upload-icon {
        font-size: 28px;
    }

    .upload-text {
        font-size: 12px;
    }

    .delete-badge.mobile-only {
        width: 20px;
        height: 20px;
        top: 4px;
        right: 4px;
    }

    .delete-badge .el-icon {
        font-size: 12px;
    }

    .main-tag {
        top: 4px;
        left: 4px;
        padding: 2px 6px;
        font-size: 10px;
    }

    .main-tag .el-icon {
        font-size: 10px;
    }
}

/* 🔥 平板端优化（640px - 767px） */
@media (min-width: 640px) and (max-width: 767px) {
    .image-item {
        width: 110px !important;
        height: 110px !important;
    }

    .upload-area {
        width: 110px !important;
        height: 110px !important;
    }
}

/* 🔥 桌面端优化（≥ 768px） */
@media (min-width: 768px) {
    .image-item {
        width: 120px;
        height: 120px;
        border-radius: 12px;
    }

    .upload-area {
        width: 120px;
        height: 120px;
    }

    .upload-icon {
        font-size: 32px;
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
    }

    .delete-badge {
        width: 22px;
        height: 22px;
        top: 6px;
        right: 6px;
    }

    .delete-badge .el-icon {
        font-size: 13px;
    }
}

/* 🔥 深色模式适配 */
:deep(.el-image__inner) {
    border-radius: inherit;
}

:deep(.el-image-viewer__wrapper) {
    z-index: 9999;
}
</style>