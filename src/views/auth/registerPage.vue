<!-- src/views/auth/registerPage.vue -->
<template>
    <!-- 🔥 页面内容（AuthLayout 已提供背景，这里只需表单） -->
    <div class="w-full">

        <!-- 🔥 表单标题 -->
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                用户注册
            </h2>
            <p class="mt-2 text-sm text-gray-500">
                创建账号，开始发布闲置 🚀
            </p>
        </div>

        <!-- 🔥 注册表单 -->
        <el-form ref="formRef" :model="countData" :rules="rules" class="space-y-5">

            <!-- 学号输入 -->
            <el-form-item prop="studentId">
                <el-input v-model="countData.studentId" clearable placeholder="请输入 10-13 位学号" class="w-full">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 密码输入 -->
            <el-form-item prop="password">
                <el-input v-model="countData.password" type="password" clearable placeholder="请设置 6 位以上密码（含数字+字母）"
                    show-password class="w-full">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 确认密码 -->
            <el-form-item prop="repeatPassword">
                <el-input v-model="countData.repeatPassword" type="password" clearable placeholder="请再次输入密码"
                    show-password class="w-full" @keyup.enter="register">
                    <template #prepend>
                        <el-icon class="text-gray-400">
                            <Checked />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 密码强度提示 -->
            <div class="text-xs text-gray-400 -mt-3">
                💡 密码需包含数字和字母，长度至少 7 位
            </div>

            <!-- 登录链接 -->
            <div class="text-right">
                <span class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors font-medium"
                    @click="toLogin()">
                    已有账号？去登录
                </span>
            </div>

            <!-- 注册按钮 -->
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
          " :loading="loading" @click="register">
                    {{ loading ? '注册中...' : '立即注册' }}
                </el-button>
            </el-form-item>

            <!-- 管理员入口 -->
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
import { User, Lock, Checked } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from 'element-plus'
import authApi from "@/api/auth"

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

interface countDataType {
    studentId: string | null
    password: string | null
    repeatPassword: string | null
}

const countData = ref<countDataType>({
    studentId: null,
    password: null,
    repeatPassword: null
})

const rules: FormRules = {
    studentId: [
        { required: true, message: '请输入学号', trigger: 'blur' },
        { pattern: /^\d{10,13}$/, message: '学号格式不正确（10-13 位数字）', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{7,}$/,
            message: '密码必须包含数字和字母，且长度至少 7 位',
            trigger: 'blur'
        }
    ],
    repeatPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value !== countData.value.password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 跳转到登录页
const toLogin = () => {
    router.push('/auth/login')
}

// 跳转到管理员登录
const goToAdminLogin = () => {
    router.push('/admin/login')
}

// 注册
const register = async () => {
    if (!formRef.value) return

    try {
        // 验证表单
        await formRef.value.validate()

        // 二次确认密码一致（额外保险）
        if (countData.value.password !== countData.value.repeatPassword) {
            ElMessage.error('两次密码不一致')
            return
        }

        // 防止重复提交
        if (loading.value) return
        loading.value = true

        // 调用接口
        const res = await authApi.register({
            studentId: countData.value.studentId,
            password: countData.value.password
        })

        if ('code' in res && res.code === 200) {
            ElMessage.success('🎉 注册成功！请登录')
            router.push('/auth/login')
        } else {
            ElMessage.error('注册失败')
        }
    } catch (error: any) {
        console.error('注册异常:', error)
        if (error?.response?.data?.message) {
            ElMessage.error(error.response.data.message)
        } else {
            ElMessage.error('注册失败，请稍后重试')
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* 🔥 输入框聚焦时的额外效果 */
:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

/* 🔥 按钮点击缩放反馈 */
:deep(.el-button:active) {
    transform: scale(0.98);
}

/* 🔥 密码强度提示动画 */
.text-xs {
    transition: color 0.2s;
}
</style>