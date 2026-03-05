<!-- src/views/products/products-publish/index.vue -->
<template>
    <div class="w-90% md:w-60% my-4 md:m-auto ">

        <!-- 🔥 页面容器：居中 + 内边距 + 主题背景 -->
        <div class="bg-$el-bg-color p-6 sm:p-8 rounded-2xl shadow-lg border border-$el-border-color-light">


            <!-- <div class=" bg-$el-fill-color-blank py-8 px-4 rounded-2xl"> -->
            <div class="max-w-2xl mx-auto">

                <!-- 🔥 标题区域 -->
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-$el-text-color-primary">
                        发闲置
                    </h2>
                    <p class="mt-2 text-sm text-$el-text-color-secondary">
                        填写以下信息，让你的闲置快速找到新主人 ✨
                    </p>
                </div>

                <!-- 📦 区块 1：商品图片 -->
                <div class="mb-8">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="w-1 h-4 bg-$el-color-primary rounded-full"></span>
                        <h3 class="text-base font-semibold text-$el-text-color-primary">商品图片</h3>
                        <el-tag size="small" type="info" effect="plain" class="ml-auto">最多 3 张</el-tag>
                    </div>
                    <AdvancedImageUpload v-model="formData.images" :limit="3" />
                    <p class="mt-2 text-xs text-$el-text-color-secondary flex items-center gap-1">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                        第一张图片将作为主图展示
                    </p>
                </div>

                <!-- 📦 区块 2：基础信息 -->
                <div class="mb-8 pb-8 border-b border-$el-border-color-light">
                    <div class="flex items-center gap-2 mb-5">
                        <span class="w-1 h-4 bg-$el-color-primary rounded-full"></span>
                        <h3 class="text-base font-semibold text-$el-text-color-primary">基础信息</h3>
                    </div>

                    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" label-position="left"
                        class="space-y-5">
                        <!-- 商品名称 -->
                        <el-form-item label="商品名称" prop="title">
                            <el-input v-model="formData.title" placeholder="如：二手 华为 123123mate70 Pro 标准版" maxlength="50"
                                show-word-limit class="w-full" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
                        </el-form-item>

                        <!-- 价格 + 分类（并排布局） -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <el-form-item label="商品价格" prop="price" class="mb-0">
                                <div class="flex items-center">
                                    <el-input-number v-model="formData.price" :min="0" :precision="2" :step="0.01"
                                        placeholder="0.00" class="w-full" />
                                    <span class="ml-3 text-$el-text-color-secondary font-medium">元</span>
                                </div>
                            </el-form-item>

                            <el-form-item label="商品分类" prop="category" class="mb-0">
                                <el-select v-model="formData.category" placeholder="请选择" class="w-full">
                                    <el-option label="📱 数码产品" value="数码" />
                                    <el-option label="📚 图书教材" value="图书" />
                                    <el-option label="🏠 生活用品" value="生活" />
                                    <el-option label="👕 服饰鞋包" value="服饰" />
                                    <el-option label="🎁 其他" value="其他" />
                                </el-select>
                            </el-form-item>
                        </div>

                        <!-- 商品描述 -->
                        <el-form-item label="商品描述" prop="description">
                            <el-input v-model="formData.description" type="textarea" :rows="4"
                                placeholder="• 购买时间和渠道&#10;• 使用情况和新旧程度&#10;• 有无瑕疵或维修史&#10;• 包含的配件或赠品" maxlength="500"
                                show-word-limit class="w-full resize-none" />
                        </el-form-item>
                    </el-form>
                </div>

                <!-- 🔥 提交按钮区域 -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <el-button @click="handleReset" size="large"
                        class="px-10 py-6 rounded-xl font-medium border-$el-border-color text-$el-text-color-regular hover:bg-$el-fill-color-light hover:-translate-y-0.5 transition-all duration-200">
                        <el-icon class="mr-1">
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                    <el-button type="primary" :loading="submitting" @click="handleSubmit" size="large"
                        class="px-10 py-6 rounded-xl font-medium bg-$el-color-primary border-$el-color-primary hover:bg-$el-color-primary-dark-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <el-icon class="mr-1">
                            <UploadFilled />
                        </el-icon>
                        {{ submitting ? '发布中...' : '立即发布' }}
                    </el-button>
                </div>

            </div>

            <!-- 🔥 底部提示 -->
            <p class="text-center mt-6 text-sm text-$el-text-color-secondary">
                发布后请保持在线，方便买家联系您 🎯
            </p>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { usePublishStore } from '@/stores/modules/publish'
import AdvancedImageUpload from '@/components/AdvanceImageUpload.vue'
import { Refresh, UploadFilled } from "@element-plus/icons-vue";

const router = useRouter()
const userStore = useUserStore()
const publishStore = usePublishStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// formData 用 computed 绑定到 Pinia（双向同步）
const formData = computed({
    get: () => publishStore.formData,
    set: (val) => publishStore.updateForm(val)
})

// 表单验证规则
const rules: FormRules = {
    title: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ],
    images: [
        { required: true, type: 'array', min: 1, message: '请至少上传一张图片', trigger: 'change' }
    ]
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return
        submitting.value = true

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userStore.token}`
                },
                body: JSON.stringify({
                    title: formData.value.title,
                    price: formData.value.price,
                    category: formData.value.category,
                    description: formData.value.description,
                    images: formData.value.images
                })
            })

            const result = await response.json()

            if (result.code === 201) {
                ElMessage.success('发布成功')
                publishStore.resetForm()
                router.push('/products')
            } else {
                ElMessage.error(result.msg || '发布失败')
            }
        } catch (error) {
            console.error('发布失败:', error)
            ElMessage.error('发布失败，请稍后重试')
        } finally {
            submitting.value = false
        }
    })
}

// 重置表单
const handleReset = () => {
    formRef.value?.resetFields()
    publishStore.resetForm()
}
</script>

<!-- ✅ 可选：保留少量全局样式（用于 :deep 选择器） -->
<style>
/* Element Plus 表单标签加粗 */
.el-form-item__label {
    @apply font-medium;
}

/* 输入框宽度统一 */
.el-input-number {
    @apply w-[200px];
}
</style>