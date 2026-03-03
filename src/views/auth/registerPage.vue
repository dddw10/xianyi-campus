<template>
    <div class="flex-col justify-center items-center justify-center h-full">
        <div>
            <div class="flex justify-center  text-xl font-bold mb-4">登录</div>
            <el-form ref="formRef" :model="countData" :rules="rules">

                <!-- 账号 -->
                <el-form-item prop="studentId">
                    <el-input v-model="countData.studentId" clearable placeholder="请输入您的学号">
                        <template #prepend>账号</template>
                    </el-input>
                </el-form-item>

                <!-- 密码 -->
                <el-form-item prop="password" class="">
                    <el-input v-model="countData.password" type="password" clearable placeholder="请输入您的密码"
                        show-password>
                        <template #prepend>密码</template>
                    </el-input>

                </el-form-item>

                <!-- 确认密码 -->
                <el-form-item prop="repeatPassword">
                    <el-input v-model="countData.repeatPassword" type="password" clearable placeholder="请再次输入您的密码"
                        show-password>
                        <template #prepend>确认密码</template>
                    </el-input>
                </el-form-item>

                <!-- 注册按钮 -->
                <div class="text-right mb-2">
                    <span class="text-sm text-primary hover:text-primary/80 cursor-pointer transition-colors"
                        @click="toRegister()">
                        去登录
                    </span>
                </div>

                <!-- 登录 -->
                <el-form-item>
                    <el-button type="primary" class="w-full !bg-[var(--primary)]" :loading="loading"
                        @click="register()">注册</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from 'element-plus';
import authApi from "@/api/auth";

const router = useRouter()
const formRef = ref<FormInstance>()
// loading 状态
const loading = ref(false)

interface countDataType {
    studentId: string | null
    password: string | null
    repeatPassword: string | null
}

// 提交的账号密码
const countData = ref<countDataType>({
    studentId: null,
    password: null,
    repeatPassword: null
})

// 规则校验
const rules = reactive<FormRules>({
    studentId: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 10, max: 13, message: '账号长度必须在 10-13 位之间', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{7,}$/,
            message: '密码必须包含数字和字母，且长度大于 6 位',
            trigger: 'blur'
        }
    ],
    repeatPassword: [{ required: true, message: '请再次输入您的密码', trigger: 'blur' }]
})

// 跳转到登录页
const toRegister = () => {
    router.push('/auth/login')
}

// 注册
const register = async () => {
    if (!formRef) return
    try {
        // 验证表单
        await formRef.value?.validate()

        if (countData.value.password !== countData.value.repeatPassword) {
            ElMessage.error('两次密码不一致')
            return
        }

        // 防止重复提交
        if (loading.value === true) return
        loading.value = true

        // 调用接口
        const res = await authApi.register(countData.value)

        if ('code' in res && res.code === 200) {
            ElMessage.success('注册成功')
            router.push('/auth/login')
        }
    } catch (error: any) {
        // 6. 处理验证失败或网络错误
        if (error?.response?.data?.message) {
            ElMessage.error(error.response.data.message)
        }
    } finally {
        // 7. 重置 loading
        loading.value = false
    }
}
</script>
