<!-- src/views/admin/login.vue -->
<template>
    <!-- 🔥 页面内容（AuthLayout 已提供背景，这里只需表单） -->
    <div class="w-full">

        <!-- 🔥 表单标题 -->
        <div class="text-center mb-8">
            <!-- 管理员专属 Logo -->
            <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                管理后台
            </h2>
            <p class="mt-2 text-sm text-gray-500">
                请输入管理员账号登录 🔐
            </p>
        </div>

        <!-- 🔥 登录表单 -->
        <el-form ref="formRef" :model="formData" :rules="rules" class="space-y-5">

            <!-- 用户名输入 -->
            <el-form-item prop="username">
                <el-input v-model="formData.username" placeholder="请输入管理员账号" class="w-full">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 密码输入 -->
            <el-form-item prop="password">
                <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password class="w-full"
                    @keyup.enter="handleLogin">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 返回普通登录 -->
            <div class="text-right">
                <span class="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors font-medium"
                    @click="goToUserLogin">
                    ← 返回普通用户登录
                </span>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
                <el-button type="primary" class="
            w-full 
            py-6 
            rounded-xl 
            font-medium 
            bg-gradient-to-r from-indigo-500 to-purple-600 
            border-0 
            shadow-lg shadow-indigo-200/50 
            hover:shadow-xl hover:shadow-indigo-300/50 
            hover:-translate-y-0.5 
            active:translate-y-0 
            transition-all duration-200
          " :loading="loading" @click="handleLogin">
                    {{ loading ? '登录中...' : '立即登录' }}
                </el-button>
            </el-form-item>

            <!-- 安全提示 -->
            <div class="text-center pt-4 border-t border-gray-100">
                <p class="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <el-icon>
                        <WarnTriangleFilled />
                    </el-icon>
                    管理员操作将被记录，请妥善保管账号
                </p>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Management, WarnTriangleFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import authApi from '@/api/auth'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
    username: '',
    password: ''
})

const rules: FormRules = {
    username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ]
}

// 登录处理
const handleLogin = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true

        try {
            const res = await authApi.adminLogin(formData)

            if ('code' in res && res.code === 200) {
                ElMessage.success('🎉 管理员登录成功')

                // 🔥 关键：调用 setUserInfo 处理管理员响应（包含 routes + permissions）
                await userStore.setUserInfo(res.data)

                // 🔥 跳转到管理员数据看板（路由已动态添加）
                router.push('/admin/dashboard')
            } else {
                ElMessage.error('登录失败')
            }
        } catch (error: any) {
            console.error('管理员登录异常:', error)
            ElMessage.error(error?.response?.data?.msg || '登录失败，请稍后重试')
        } finally {
            loading.value = false
        }
    })
}

// 返回普通用户登录
const goToUserLogin = () => {
    router.push('/auth/login')
}
</script>

<style scoped>
/* 🔥 输入框聚焦时的额外效果 */
:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

/* 🔥 按钮点击缩放反馈 */
:deep(.el-button:active) {
    transform: scale(0.98);
}
</style>