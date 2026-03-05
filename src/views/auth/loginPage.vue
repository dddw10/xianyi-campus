<!-- src/views/auth/loginPage.vue -->
<template>
    <!-- 🔥 页面内容（AuthLayout 已提供背景，这里只需表单） -->
    <div class="w-full">

        <!-- 🔥 表单标题（如果 AuthLayout 未使用 slot，这里显示） -->
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                用户登录
            </h2>
            <p class="mt-2 text-sm text-gray-500">
                欢迎回到校园闲置交易平台 👋
            </p>
        </div>

        <!-- 🔥 登录表单 -->
        <el-form ref="formRef" :model="countData" :rules="rules" class="space-y-5">

            <!-- 学号输入 -->
            <el-form-item prop="studentId">
                <el-input v-model="countData.studentId" clearable placeholder="请输入您的学号" class="w-full">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 密码输入 -->
            <el-form-item prop="password">
                <el-input v-model="countData.password" type="password" clearable placeholder="请输入您的密码" show-password
                    class="w-full" @keyup.enter="login">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 注册链接 -->
            <div class="text-right">
                <span class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors font-medium"
                    @click="toRegister()">
                    还没有账号？去注册
                </span>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
                <el-button type="primary" class="
            w-full 
            py-6 
            rounded-xl 
            font-medium 
            bg-gradient-to-r from-blue-500 to-blue-600 
            border-0 
            shadow-lg shadow-blue-200/50 
            hover:shadow-xl hover:shadow-blue-300/50 
            hover:-translate-y-0.5 
            active:translate-y-0 
            transition-all duration-200
          " :loading="loading" @click="login">
                    {{ loading ? '登录中...' : '立即登录' }}
                </el-button>
            </el-form-item>

            <!-- 管理员登录入口 -->
            <div class="text-center pt-4 border-t border-gray-100">
                <span class="text-sm text-gray-500">管理员入口？</span>
                <el-button link class="text-blue-600 hover:text-blue-700 font-medium ml-1" @click="goToAdminLogin">
                    点击跳转
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from 'element-plus'
import authApi from "@/api/auth"
import { useUserStore } from "@/stores/modules/user"

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

interface countDataType {
    studentId: string | null
    password: string | null
}

const countData = ref<countDataType>({
    studentId: null,
    password: null
})

const rules: FormRules = {
    studentId: [
        { required: true, message: '请输入学号', trigger: 'blur' },
        { pattern: /^\d{10,13}$/, message: '学号格式不正确', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ]
}

// 跳转到注册页
const toRegister = () => {
    router.push('/auth/register')
}

// 跳转到管理员登录
const goToAdminLogin = () => {
    router.push('/admin/login')
}

// 登录
const login = async () => {
    if (!formRef.value) return

    try {
        // 验证表单
        await formRef.value.validate()

        // 防止重复提交
        if (loading.value) return
        loading.value = true

        // 调用接口
        const res = await authApi.login(countData.value)

        if ('code' in res && res.code === 200) {
            ElMessage.success('🎉 登录成功')
            await useUserStore().setUserInfo(res.data)
            router.push('/')
        } else {
            ElMessage.error('登录失败')
        }
    } catch (error: any) {
        console.error('登录异常:', error)
        if (error?.response?.data?.message) {
            ElMessage.error(error.response.data.message)
        } else {
            ElMessage.error('登录失败，请稍后重试')
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* 🔥 可选：添加输入框聚焦时的额外效果 */
:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

/* 🔥 按钮点击缩放反馈 */
:deep(.el-button:active) {
    transform: scale(0.98);
}
</style>