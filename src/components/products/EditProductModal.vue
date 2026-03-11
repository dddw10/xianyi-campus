<!-- src/views/products/products-detail/components/EditProductModal.vue -->
<template>
    <el-dialog v-model="dialogVisible" :title="props.product?.review_status === 'rejected' ? '✏️ 修改后重新提交' : '✏️ 编辑商品'"
        :close-on-click-modal="false" width="560px" class="edit-dialog !rounded-2xl" @closed="handleClose">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" class="space-y-5">

            <!-- 🔹 商品标题 -->
            <el-form-item label="商品标题" prop="title">
                <el-input v-model="formData.title" placeholder="例如：苹果 AirPods Pro 2 代，仅拆封" maxlength="100"
                    show-word-limit class="!rounded-xl" />
            </el-form-item>

            <!-- 🔹 商品描述 -->
            <el-form-item label="商品描述" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4"
                    placeholder="详细描述商品状况、使用情况、有无瑕疵等，越详细越容易卖出～" maxlength="500" show-word-limit class="!rounded-xl" />
            </el-form-item>

            <!-- 🔹 价格 + 分类（一行两列） -->
            <div class="grid grid-cols-2 gap-4">
                <el-form-item label="价格（元）" prop="price">
                    <el-input-number v-model="formData.price" :min="0.01" :precision="2" :step="0.1" class="!w-full"
                        controls-position="right" />
                </el-form-item>
                <el-form-item label="商品分类" prop="category">
                    <el-select v-model="formData.category" placeholder="请选择" class="!w-full" :teleported="false">
                        <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
                    </el-select>
                </el-form-item>
            </div>

            <!-- 🔹 图片上传（修复：确保数组格式 + 预览） -->
            <el-form-item label="商品图片" prop="images">
                <div class="space-y-2">
                    <!-- 已上传图片预览 -->
                    <div v-if="formData.images?.length" class="flex flex-wrap gap-2">
                        <div v-for="(img, idx) in formData.images" :key="idx"
                            class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                            <el-image :src="img" class="w-full h-full object-cover" fit="cover"
                                :preview-src-list="formData.images" :initial-index="idx" preview-teleported>
                                <template #error>
                                    <div
                                        class="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <el-icon class="text-gray-400">
                                            <Picture />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-image>
                            <!-- 删除按钮 -->
                            <button type="button" @click="removeImage(idx)"
                                class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                ×
                            </button>
                        </div>
                    </div>

                </div>
            </el-form-item>

            <!-- 🔹 拒绝理由提示（仅审核拒绝时显示） -->
            <el-alert v-if="props.product?.review_status === 'rejected' && props.product?.review_reason"
                :title="`上次拒绝理由：${props.product.review_reason}`" type="warning" :closable="false" class="!rounded-xl"
                show-icon />
        </el-form>

        <template #footer>
            <div class="flex justify-end gap-3 pt-2">
                <el-button @click="dialogVisible = false" class="!rounded-full">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit" class="!rounded-full !px-6">
                    {{ props.product?.review_status === 'rejected' ? '重新提交' : '保存更新' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"
import { ElMessage, ElUpload } from "element-plus"
import { Plus, Picture } from "@element-plus/icons-vue"
import type { FormInstance, FormRules, UploadFile, UploadRequestOptions } from 'element-plus'
import productApi from "@/api/product"

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
    images: [] as string[]  // ✅ 确保是字符串数组
})

// 🔹 上传文件列表（el-upload 专用）
const uploadFileList = ref<UploadFile[]>([])

// 🔹 分类选项

// 分类修改一下
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

// 🔥 关键修复：初始化表单时确保 images 是数组
watch(() => props.product, (newVal) => {
    if (newVal) {
        // 🔥 安全解析 images：兼容字符串/数组/空值
        const parseImages = (imgs: any): string[] => {
            if (!imgs) return []
            if (Array.isArray(imgs)) return imgs.filter((i: any) => i)
            if (typeof imgs === 'string') {
                try {
                    const parsed = JSON.parse(imgs)
                    return Array.isArray(parsed) ? parsed.filter((i: any) => i) : [imgs]
                } catch {
                    return imgs ? [imgs] : []
                }
            }
            return []
        }

        formData.value = {
            title: newVal.title || '',
            description: newVal.description || '',
            price: parseFloat(newVal.price) || 0,
            category: newVal.category || '',
            images: parseImages(newVal.images)  // ✅ 确保是字符串数组
        }

        // 🔥 同步上传列表（用于 el-upload 显示）
        nextTick(() => {
            uploadFileList.value = formData.value.images.map((url, idx) => ({
                uid: -idx,  // 负数避免与后端返回的 id 冲突
                name: `image-${idx}.jpg`,
                status: 'success',
                url
            }))
        })
    }
}, { immediate: true })

// 🔹 移除图片
const removeImage = (index: number) => {
    formData.value.images.splice(index, 1)
    uploadFileList.value.splice(index, 1)
}

// 🔹 上传前校验
const beforeUpload = (file: File) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size / 1024 / 1024 < 5  // 5MB

    if (!isValidType) {
        ElMessage.error('仅支持 jpg/png/webp 格式')
        return false
    }
    if (!isValidSize) {
        ElMessage.error('图片大小不能超过 5MB')
        return false
    }
    if (formData.value.images.length >= 5) {
        ElMessage.warning('最多上传 5 张图片')
        return false
    }
    return true
}

// 🔥 关键修复：自定义上传逻辑（模拟上传，实际应调用你的 OSS 接口）
const handleCustomUpload = async (options: UploadRequestOptions) => {
    const { file, onSuccess, onError } = options

    try {
        // 🔥 这里替换为你的实际上传接口
        // 示例：调用你的 OSS 上传接口
        // const res = await uploadToOSS(file)
        // const imageUrl = res.url

        // 🎯 模拟上传（实际使用时删除这段，替换为真实接口）
        const imageUrl = await mockUpload(file)

        // ✅ 更新表单数据
        formData.value.images.push(imageUrl)

        // ✅ 更新上传列表
        const uploadFile: UploadFile = {
            uid: Date.now(),
            name: file.name,
            status: 'success',
            url: imageUrl
        }
        uploadFileList.value.push(uploadFile)

        onSuccess?.(uploadFile)
        ElMessage.success('图片上传成功')
    } catch (error) {
        ElMessage.error('图片上传失败')
    }
}

// 🔥 模拟上传函数（实际使用时删除，替换为你的 OSS 上传逻辑）
const mockUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            // 实际应返回 OSS URL，这里用 base64 模拟
            resolve(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    })
}

// 🔹 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        submitting.value = true

        // 🔥 提交数据（确保 images 是数组）
        await productApi.updateProduct(props.product.id, {
            ...formData.value,
            images: formData.value.images  // ✅ 已经是数组，无需再处理
        })

        ElMessage.success('商品已更新，重新提交审核')
        emit('success')
        // 直接改为提交同时关闭弹窗跳到我的订单页面
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

<style scoped></style>