<!-- components/ChangePasswordModal.vue - 纯中文优化版 -->
<template>
    <el-dialog v-model="visible" title="🔐 修改密码" :width="isMobile ? '95vw' : '420px'" :close-on-click-modal="false"
        class="w-90% md:w-20%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="space-y-4"
            @submit.prevent="handleSubmit">
            <!-- 🔹 当前密码 -->
            <el-form-item label="当前密码" prop="oldPassword">
                <el-input v-model="form.oldPassword" type="password" placeholder="请输入当前登录密码" show-password
                    class="rounded-xl !bg-$el-fill-color-blank" :size="isMobile ? 'large' : 'default'"
                    @keyup.enter="handleSubmit" />
            </el-form-item>

            <!-- 🔹 新密码 + 强度条 -->
            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="form.newPassword" type="password" placeholder="6-20位字母/数字/符号组合" show-password
                    class="rounded-xl" :size="isMobile ? 'large' : 'default'" @keyup.enter="handleSubmit" />
                <!-- 密码强度可视化条 -->
                <div class="flex gap-1 mt-2" v-if="form.newPassword">
                    <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                        :class="getStrengthClass(i)" />
                </div>
                <el-text size="small" :type="strengthType" class="block mt-1">
                    密码强度：{{ passwordStrength }}
                </el-text>
            </el-form-item>

            <!-- 🔹 确认新密码 -->
            <el-form-item label="确认新密码" prop="confirmNewPassword">
                <el-input v-model="form.confirmNewPassword" type="password" placeholder="请再次输入新密码" show-password
                    class="rounded-xl" :size="isMobile ? 'large' : 'default'" @keyup.enter="handleSubmit" />
            </el-form-item>
        </el-form>

        <!-- 🔹 底部按钮 -->
        <template #footer>
            <div class="flex justify-end gap-3 pt-2">
                <el-button @click="visible = false" class="rounded-full">
                    取消
                </el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit" class="rounded-full px-6">
                    确认修改
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import authApi from "@/api/auth";
import { useUserStore } from "@/stores/modules/user";

// 🔹 Props & Emits
const visible = defineModel('visible', { type: Boolean, default: false })
const emit = defineEmits(['success'])
const userStore = useUserStore()

// 🔹 表单引用 & 状态
const formRef = ref()
const submitting = ref(false)
const form = ref({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
})

// 🔹 移动端检测（640px 为分界）
const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
})

// 🔹 表单校验规则
const rules = {
    oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{7,}$/,
            message: '密码必须包含数字和字母，且长度至少 7 位',
            trigger: 'blur'
        }
    ],
    confirmNewPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (_: any, value: string, callback: (e?: Error) => void) => {
                callback(value !== form.value.newPassword ? new Error('两次输入的密码不一致') : undefined)
            },
            trigger: 'blur'
        }
    ]
}

// 🔹 密码强度计算
const strengthType = computed(() => {
    const score = getStrengthScore()
    if (score <= 1) return 'danger'
    if (score <= 2) return 'warning'
    if (score >= 4) return 'success'
    return 'info'
})

const passwordStrength = computed(() => {
    const score = getStrengthScore()
    return ['弱', '中', '强', '很强'][Math.max(0, score - 1)] || '弱'
})

const getStrengthClass = (level: number) => {
    const score = getStrengthScore()
    const base = 'transition-all duration-300'
    if (score >= level) {
        if (score <= 1) return `${base} bg-red-400`
        if (score <= 2) return `${base} bg-orange-400`
        if (score <= 3) return `${base} bg-blue-400`
        return `${base} bg-green-400`
    }
    return `${base} bg-gray-200 dark:bg-gray-600`
}

const getStrengthScore = () => {
    const pwd = form.value.newPassword
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++
    return score
}

// 🔹 安全：错误次数限制（防暴力破解）
const errorCount = ref(0)
const MAX_ERRORS = 5
const LOCK_TIME = 15 * 60 * 1000  // 15分钟
const lastErrorTime = ref(0)

// 🔹 提交修改密码
const handleSubmit = async () => {
    const now = Date.now()

    // 检查是否被临时锁定
    if (errorCount.value >= MAX_ERRORS && now - lastErrorTime.value < LOCK_TIME) {
        const remainMin = Math.ceil((LOCK_TIME - (now - lastErrorTime.value)) / 60000)
        ElMessage.warning(`操作过于频繁，请 ${remainMin} 分钟后再试`)
        return
    }

    try {
        await formRef.value?.validate()
        submitting.value = true

        authApi.ChangePasswordModal({
            oldPassword: form.value.oldPassword,
            newPassword: form.value.newPassword,
        }).then((res: any) => {
            if (res.code === 200) {
                // ✅ 成功：重置错误计数
                errorCount.value = 0
                ElMessage.success('✅ 密码修改成功')
                emit('success')
                visible.value = false
                formRef.value?.resetFields()

                // 如果需要强制重新登录
                userStore.logout()
                setTimeout(() => {
                    ElMessage.info('请重新登录')
                }, 1500)
            }
        })

    } catch (error: any) {
        // ❌ 失败：记录错误次数
        errorCount.value++
        lastErrorTime.value = Date.now()

        const msg = error?.response?.data?.msg || '修改失败，请稍后重试'
        ElMessage.error(msg)

        // 提示剩余尝试次数
        if (errorCount.value < MAX_ERRORS) {
            const remain = MAX_ERRORS - errorCount.value
            ElMessage.warning(`剩余尝试次数：${remain}`)
        }
    } finally {
        submitting.value = false
    }
}

// 🔹 组件卸载时清理表单
onUnmounted(() => {
    formRef.value?.resetFields()
})
</script>

<style scoped>
/* 🔥 密码强度条动画优化 */
:deep(.el-input__wrapper) {
    transition: box-shadow 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2) !important;
}

/* 🔥 小屏输入框字体优化 */
@media (max-width: 640px) {

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
        font-size: 16px;
        /* 防止 iOS 自动缩放 */
    }
}
</style>