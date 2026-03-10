<!-- src/views/products/products-detail/components/EditProductModal.vue -->
<template>
    <el-dialog v-model="dialogVisible" :title="props.product?.review_status === 'rejected' ? '✏️ 修改后重新提交' : '✏️ 编辑商品'"
        :close-on-click-modal="false" width="600px" class="!rounded-2xl" @closed="handleClose">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" class="space-y-4">
            <!-- 🔹 商品标题 -->
            <el-form-item label="商品标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入商品标题" maxlength="100" show-word-limit />
            </el-form-item>

            <!-- 🔹 商品描述 -->
            <el-form-item label="商品描述" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="详细描述商品状况、使用情况等"
                    maxlength="500" show-word-limit />
            </el-form-item>

            <!-- 🔹 价格 -->
            <el-form-item label="价格（元）" prop="price">
                <el-input-number v-model="formData.price" :min="0.01" :precision="2" :step="0.1" class="!w-full" />
            </el-form-item>

            <!-- 🔹 分类 -->
            <el-form-item label="商品分类" prop="category">
                <el-select v-model="formData.category" placeholder="请选择分类" class="!w-full">
                    <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
                </el-select>
            </el-form-item>

            <!-- 🔹 图片上传 -->
            <el-form-item label="商品图片" prop="images">
                <ImageUploader v-model:images="formData.images" :max-count="5" :tip="'最多上传 5 张图片，首张将作为封面'" />
            </el-form-item>

            <!-- 🔹 拒绝理由提示（仅审核拒绝时显示） -->
            <el-alert v-if="props.product?.review_status === 'rejected' && props.product?.review_reason"
                :title="`上次拒绝理由：${props.product.review_reason}`" type="warning" :closable="false" class="mb-2"
                show-icon />
        </el-form>

        <template #footer>
            <div class="flex justify-end gap-3">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    {{ props.product?.review_status === 'rejected' ? '重新提交' : '保存更新' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from 'element-plus'
import productApi from "@/api/product"
import ImageUploader from "@/components/AdvanceImageUpload.vue"

const props = defineProps<{
    product?: any
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'success'): void
}>()

// 🔹 弹窗控制
const dialogVisible = ref(true)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 🔹 表单数据
const formData = ref({
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [] as string[]
})

// 🔹 分类选项
const categories = [
    { label: '📚 书籍教材', value: 'books' },
    { label: '💻 数码电子', value: 'electronics' },
    { label: '👕 服饰鞋包', value: 'clothing' },
    { label: '🏠 生活用品', value: 'daily' },
    { label: '🎨 兴趣爱好', value: 'hobby' },
    { label: '🎁 其他', value: 'other' }
]

// 🔹 表单校验规则
const rules = computed<FormRules>(() => ({
    title: [
        { required: true, message: '请输入商品标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度 2-100 个字符', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入商品描述', trigger: 'blur' },
        { min: 10, message: '描述至少 10 个字符', trigger: 'blur' }
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '价格必须大于 0', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ],
    images: [
        { required: true, type: 'array', min: 1, message: '请至少上传 1 张图片', trigger: 'change' }
    ]
}))

// 🔹 初始化表单数据
watch(() => props.product, (newVal) => {
    if (newVal) {
        formData.value = {
            title: newVal.title || '',
            description: newVal.description || '',
            price: parseFloat(newVal.price) || 0,
            category: newVal.category || '',
            images: newVal.images || []
        }
    }
}, { immediate: true })

// 🔹 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        submitting.value = true

        // 🔥 调用更新接口（自动触发重新审核）
        await productApi.updateProduct(props.product.id, formData.value)

        ElMessage.success('商品已更新，重新提交审核')
        emit('success')
        dialogVisible.value = false
    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || '更新失败')
    } finally {
        submitting.value = false
    }
}

// 🔹 关闭弹窗
const handleClose = () => {
    emit('close')
}
</script>

<style scoped>
/* 🔹 弹窗圆角 */
:deep(.el-dialog) {
    @apply !rounded-2xl;
}

:deep(.el-dialog__header) {
    @apply !rounded-t-2xl !border-b !border-gray-100 dark: !border-gray-700;
}

:deep(.el-dialog__footer) {
    @apply !rounded-b-2xl !border-t !border-gray-100 dark: !border-gray-700 !pt-4;
}
</style>
