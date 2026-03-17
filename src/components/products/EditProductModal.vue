<!-- src/components/products/EditProductModal.vue -->
<template>
    <Teleport to="body">
        <div
            class="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

            <div class="modal-container bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-fade-in"
                :class="{ 'h-full': isMobile }">
                <!-- 🔹 头部 -->
                <div
                    class="modal-header flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <el-icon class="text-yellow-500 text-xl flex-shrink-0">
                            <Edit />
                        </el-icon>
                        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
                            {{ getModalTitle() }}
                        </h3>
                    </div>
                    <el-button type="text" @click="handleClose"
                        class="!p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                        <el-icon class="text-xl">
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <!-- 🔹 表单内容 -->
                <div class="modal-body flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

                    <!-- 商品标题 -->
                    <div class="form-item space-y-2">
                        <label class="form-label block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <span class="text-red-500 mr-1">*</span>商品标题
                        </label>
                        <el-input v-model="formData.title" placeholder="请输入商品标题（建议10-30字）" maxlength="100"
                            show-word-limit class="!w-full" :input-class="isMobile ? 'text-base' : ''" size="large" />
                    </div>

                    <!-- 商品描述 -->
                    <div class="form-item space-y-2">
                        <label class="form-label block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <span class="text-red-500 mr-1">*</span>商品描述
                        </label>
                        <el-input v-model="formData.description" type="textarea" :rows="isMobile ? 5 : 4"
                            placeholder="请详细描述商品成色、使用情况、瑕疵等..." maxlength="500" show-word-limit class="!w-full"
                            :textarea-class="isMobile ? 'text-base' : ''" />
                    </div>

                    <!-- 价格 -->
                    <div class="form-item space-y-2">
                        <label class="form-label block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <span class="text-red-500 mr-1">*</span>价格（元）
                        </label>
                        <el-input-number v-model="formData.price" :min="0.01" :max="999999" :precision="2" :step="1"
                            controls-position="right" placeholder="请输入价格" class="!w-full"
                            :input-class="isMobile ? 'text-base' : ''" size="large" />
                        <p class="text-xs text-gray-500 mt-1">建议参考市场价合理定价</p>
                    </div>

                    <!-- 商品分类 -->
                    <div class="form-item space-y-2">
                        <label class="form-label block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <span class="text-red-500 mr-1">*</span>商品分类
                        </label>
                        <el-select v-model="formData.category" placeholder="请选择分类" class="!w-full"
                            :size="isMobile ? 'large' : 'default'">
                            <el-option v-for="item in categories" :label="item.name" :value="item.name" />
                        </el-select>
                    </div>

                    <!-- 🔥 商品图片 -->
                    <div class="form-item space-y-3">
                        <label class="form-label block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <span class="text-red-500 mr-1">*</span>商品图片
                            <span class="text-gray-400 font-normal ml-1">（至少1张，最多3张）</span>
                        </label>

                        <!-- 图片上传组件容器 -->
                        <div class="image-upload-container">
                            <AdvanceImageUpload v-model="formData.images" :limit="3" :width="isMobile ? 100 : 120" />
                        </div>

                        <!-- 图片上传提示 -->
                        <p class="text-xs text-gray-500 flex items-start gap-1.5">
                            <el-icon class="flex-shrink-0 mt-0.5">
                                <InfoFilled />
                            </el-icon>
                            <span>支持 JPG/PNG 格式，单张不超过 5MB，最多 3 张</span>
                        </p>
                    </div>

                    <!-- 审核拒绝理由 -->
                    <div v-if="mode === 'resubmit' && props.product?.review_reason" class="form-item">
                        <div
                            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
                            <div class="flex items-start gap-2">
                                <el-icon class="text-red-500 text-lg flex-shrink-0 mt-0.5">
                                    <WarningFilled />
                                </el-icon>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                                        上次审核未通过原因：
                                    </p>
                                    <p class="text-sm text-red-600 dark:text-red-400 break-words">
                                        {{ props.product.review_reason }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 🔹 底部操作按钮 -->
                <div
                    class="modal-footer px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <div class="flex gap-3" :class="isMobile ? 'flex-col' : 'flex-row justify-end'">
                        <el-button @click="handleClose" class="flex-1 sm:flex-none sm:min-w-[100px]"
                            :size="isMobile ? 'large' : 'default'">
                            取消
                        </el-button>
                        <span></span>
                        <el-button type="primary" @click="handleSubmit" :loading="submitting"
                            class="flex-1 sm:flex-none sm:min-w-[100px] " :size="isMobile ? 'large' : 'default'">
                            {{ getSubmitButtonText() }}
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Close, InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import productApi from '@/api/product'
import AdvanceImageUpload from "@/components/AdvanceImageUpload.vue"
import adminCategoryApi from "@/api/admin/category";

const props = defineProps<{
    product?: any
    mode?: 'edit' | 'resubmit' | 'view'
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'success', product: any): void
}>()

const isMobile = computed(() => {
    return window.innerWidth < 640
})

const submitting = ref(false)
const formData = ref({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [] as string[]
})

// 获取商品分类
const categories = ref()
const getCategoryData = () => {
    adminCategoryApi.getCategoriesEnabled().then((res: any) => {
        if (res.code === 200) {
            categories.value = res.data
        }
    })
}

onMounted(() => {
    if (props.product) {
        getCategoryData()
        formData.value = {
            title: props.product.title || '',
            description: props.product.description || '',
            price: parseFloat(props.product.price) || 0,
            category: props.product.category || '',
            images: Array.isArray(props.product.images)
                ? [...props.product.images]
                : props.product.images
                    ? [props.product.images]
                    : []
        }
    }

    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
    window.dispatchEvent(new Event('resize'))
}

const getModalTitle = () => {
    if (props.mode === 'resubmit') return '重新提交审核'
    if (props.mode === 'view') return '商品详情'
    return '编辑商品'
}

const getSubmitButtonText = () => {
    if (submitting.value) return '提交中...'
    if (props.mode === 'resubmit') return '重新提交'
    if (props.mode === 'view') return '查看'
    return '保存修改'
}

const validateForm = () => {
    if (!formData.value.title?.trim()) {
        ElMessage.warning('请输入商品标题')
        return false
    }

    if (!formData.value.description?.trim()) {
        ElMessage.warning('请输入商品描述')
        return false
    }

    if (!formData.value.price || formData.value.price <= 0) {
        ElMessage.warning('请输入正确的价格')
        return false
    }

    if (!formData.value.category) {
        ElMessage.warning('请选择商品分类')
        return false
    }

    if (formData.value.images.length === 0) {
        ElMessage.warning('请至少上传1张商品图片')
        return false
    }

    if (formData.value.images.length > 3) {
        ElMessage.warning('最多只能上传3张图片')
        return false
    }

    return true
}

const handleSubmit = async () => {
    if (props.mode === 'view') {
        handleClose()
        return
    }

    if (!validateForm()) return

    submitting.value = true

    try {
        const payload = {
            title: formData.value.title.trim(),
            description: formData.value.description.trim(),
            price: formData.value.price,
            category: formData.value.category,
            images: formData.value.images,
            action: props.mode === 'resubmit' ? 'resubmit' : 'update'
        }

        const response = await productApi.updateProduct(props.product?.id, payload)

        ElMessage.success(
            props.mode === 'resubmit' ? '✅ 已重新提交审核' : '✅ 商品已更新'
        )
        emit('success', response.data?.product || response.data)
        handleClose()

    } catch (error: any) {
        console.error('提交失败:', error)
        ElMessage.error(error?.response?.data?.msg || '提交失败，请重试')
    } finally {
        submitting.value = false
    }
}

const handleClose = () => {
    emit('close')
}
</script>

<style scoped>
/* 🔥 动画 */
@keyframes slide-up {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-slide-up {
    animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
    animation: fade-in 0.2s ease-out;
}

/* 🔥 图片上传容器优化 */
.image-upload-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

/* 🔥 移动端优化 */
@media (max-width: 639px) {
    .modal-container {
        border-radius: 1rem 1rem 0 0;
        max-height: 95vh;
    }

    .modal-body {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .modal-body::-webkit-scrollbar {
        display: none;
    }

    .form-item {
        margin-bottom: 0.5rem;
    }

    /* 增大输入框触摸区域 */
    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
        min-height: 44px;
        padding-top: 12px;
        padding-bottom: 12px;
    }

    /* 优化按钮样式 */
    .modal-footer .el-button {
        min-height: 44px;
        padding: 12px 20px;
        font-size: 15px;
        font-weight: 500;
    }

    /* 取消按钮样式优化 */
    .modal-footer .el-button:not(.el-button--primary) {
        border: 1px solid var(--el-border-color);
        background-color: var(--el-fill-color-blank);
        color: var(--el-text-color-regular);
    }

    .modal-footer .el-button:not(.el-button--primary):hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
    }

    /* 优化选择器 */
    :deep(.el-select) {
        width: 100%;
    }

    /* 优化数字输入框 */
    :deep(.el-input-number) {
        width: 100%;
    }

    /* 优化图片上传区域 */
    :deep(.upload-area),
    :deep(.el-upload) {
        width: 100px !important;
        height: 100px !important;
    }

    :deep(.upload-placeholder) {
        width: 100px !important;
        height: 100px !important;
        border-width: 2px;
    }

    :deep(.upload-icon) {
        font-size: 28px;
    }

    :deep(.upload-text) {
        font-size: 12px;
    }
}

/* 🔥 桌面端优化 */
@media (min-width: 640px) {
    .modal-container {
        max-height: 85vh;
    }

    .modal-footer .el-button {
        min-height: 36px;
    }
}

/* 🔥 深色模式支持 */
:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
    @apply dark:bg-gray-700 dark:border-gray-600;
}

:deep(.el-select .el-input__wrapper) {
    @apply dark:bg-gray-700 dark:border-gray-600;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
    @apply dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300;
}
</style>