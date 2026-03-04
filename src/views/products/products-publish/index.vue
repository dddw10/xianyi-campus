<!-- src/views/products/products-publish/index.vue -->
<template>
    <div class="publish-container">
        <h2 class="page-title">发布商品</h2>

        <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" class="publish-form">
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="title">
                <el-input v-model="formData.title" placeholder="请输入商品名称" maxlength="50" show-word-limit />
            </el-form-item>

            <!-- 商品价格 -->
            <el-form-item label="商品价格" prop="price">
                <el-input-number v-model="formData.price" :min="0" :precision="2" :step="0.01" />
                <span class="price-unit">元</span>
            </el-form-item>

            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="category">
                <el-select v-model="formData.category" placeholder="请选择分类" style="width: 200px">
                    <el-option label="数码产品" value="数码" />
                    <el-option label="图书教材" value="图书" />
                    <el-option label="生活用品" value="生活" />
                    <el-option label="服饰鞋包" value="服饰" />
                    <el-option label="其他" value="其他" />
                </el-select>
            </el-form-item>

            <!-- 商品描述 -->
            <el-form-item label="商品描述" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请描述商品成色、使用情况等"
                    maxlength="500" show-word-limit />
            </el-form-item>

            <!-- 🔥 商品图片（v-model 绑定 Pinia 数据） -->
            <el-form-item label="商品图片" prop="images">
                <AdvancedImageUpload v-model="formData.images" :limit="3" />
                <div class="upload-tip">最多上传 3 张图片，第一张将作为主图展示</div>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
                <el-button type="primary" :loading="submitting" @click="handleSubmit" size="large">
                    立即发布
                </el-button>
                <el-button @click="handleReset" size="large">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { usePublishStore } from '@/stores/modules/publish'  // ✅ 导入 Pinia Store

import AdvancedImageUpload from '@/components/AdvanceImageUpload.vue'

const router = useRouter()
const userStore = useUserStore()
const publishStore = usePublishStore()  // ✅ 获取 Store 实例
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 🔥 关键：formData 用 computed 绑定到 Pinia（双向同步）
const formData = computed({
    get: () => publishStore.formData,
    set: (val) => publishStore.updateForm(val)
})

// 🔹 表单验证规则
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

// 🔹 提交表单
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
                    images: formData.value.images  // ✅ 从 Pinia 读取图片列表
                })
            })

            const result = await response.json()

            if (result.code === 201) {
                ElMessage.success('发布成功')
                publishStore.resetForm()  // ✅ 发布成功后重置 Pinia 数据
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

// 🔹 重置表单
const handleReset = () => {
    formRef.value?.resetFields()
    publishStore.resetForm()  // ✅ 重置 Pinia 数据
}
</script>

<style scoped>
.publish-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
}

.page-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    text-align: center;
    color: var(--el-text-color-primary);
}

.price-unit {
    margin-left: 10px;
    color: var(--el-text-color-secondary);
}

.upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.publish-form {
    background: var(--el-bg-color);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
    font-weight: 500;
}

:deep(.el-input-number) {
    width: 200px;
}
</style>