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

                <!-- 注册按钮 -->
                <div class="text-right mb-2">
                    <span class="text-sm text-primary hover:text-primary/80 cursor-pointer transition-colors"
                        @click="toRegister()">
                        还没有账号？去注册
                    </span>
                </div>

                <!-- 登录 -->
                <el-form-item>
                    <el-button type="primary" class="w-full !bg-[var(--primary)]" :loading="loading"
                        @click="login()">登录</el-button>
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
import { useUserStore } from "@/stores/modules/user";

const router = useRouter()
const formRef = ref<FormInstance>()
// loading 状态
const loading = ref(false)

interface countDataType {
    studentId: string | null
    password: string | null
}

// 提交的账号密码
const countData = ref<countDataType>({
    studentId: null,
    password: null
})

// 规则校验
const rules = reactive<FormRules>({
    studentId: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 跳转到注册页
const toRegister = () => {
    router.push('/auth/register')
}

// 登录
const login = async () => {
    if (!formRef) return
    try {
        // 验证表单
        await formRef.value?.validate()

        // 防止重复提交
        if (loading.value === true) return
        loading.value = true

        // 调用接口
        const res = await authApi.login(countData.value)

        if ('code' in res && res.code === 200) {
            ElMessage.success('登录成功')
            useUserStore().setUserInfo(res.data)
            router.push('/')
        }
    } catch (error: any) {
        // 6. 处理验证失败或网络错误
        if (error?.response?.data?.message) {
            ElMessage.error(error.response.data.message)
        } else {
            ElMessage.error('登录失败，请稍后重试')
        }
    } finally {
        // 7. 重置 loading
        loading.value = false
    }
}
</script>
