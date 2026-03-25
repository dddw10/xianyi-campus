<!-- src/views/user/verification/Index.vue -->
<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">

        <!-- 🔹 页面标题 -->
        <div class="max-w-2xl mx-auto px-4 py-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                🎓 身份认证
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
                完成学生身份认证，解锁发布商品等更多功能
            </p>
        </div>

        <!-- 🔹 认证状态卡片 -->
        <div class="max-w-2xl mx-auto px-4 space-y-4">

            <!-- 🟢 已认证 -->
            <el-alert v-if="status?.isVerified" title="✅ 已完成身份认证" type="success" :closable="false" show-icon>
                <template #default>
                    <div class="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>恭喜！您已完成学生身份认证，现在可以：</p>
                        <ul class="list-disc list-inside space-y-1">
                            <li>📦 发布闲置商品</li>
                            <li>💬 与其他用户交易</li>
                            <li>🎁 享受学生专属权益</li>
                        </ul>
                    </div>
                </template>
            </el-alert>

            <!-- 🟡 审核中 -->
            <el-alert v-else-if="status?.verificationStatus === 'pending'" title="⏳ 审核中" type="warning"
                :closable="false" show-icon>
                <template #default>
                    <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>您的认证申请已提交，管理员将在 <strong>1-3 个工作日</strong> 内完成审核。</p>
                        <p v-if="status?.submittedAt" class="text-xs text-gray-400 mt-1">
                            提交时间：{{ formatDate(status.submittedAt) }}
                        </p>
                        <el-button size="small" class="mt-3" @click="fetchStatus">
                            🔄 刷新状态
                        </el-button>
                    </div>
                </template>
            </el-alert>

            <!-- 🔴 被拒绝 -->
            <el-alert v-else-if="status?.verificationStatus === 'rejected'" title="❌ 认证未通过" type="error"
                :closable="false" show-icon>
                <template #default>
                    <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><span class="font-medium">拒绝原因：</span></p>
                        <p class="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
                            {{ status?.rejectedReason || '图片不清晰或信息不完整，请重新上传' }}
                        </p>
                        <el-button type="primary" size="small" class="mt-3" @click="openUploadDialog">
                            📸 重新上传
                        </el-button>
                    </div>
                </template>
            </el-alert>

            <!-- ⚪ 未认证 - 显示上传入口 -->
            <div v-else
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                <el-icon class="text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    <Document />
                </el-icon>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    上传学生证完成认证
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    请确保学生证照片清晰，姓名、学号、学校公章可见
                </p>

                <el-button type="primary" size="large" class="!rounded-full !px-8" @click="openUploadDialog">
                    📸 开始认证
                </el-button>
            </div>

            <!-- 🔹 认证说明 -->
            <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">

                <h4 class="font-medium text-gray-800 dark:text-gray-100 mb-3">📋 认证说明</h4>
                <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li class="flex items-start gap-2">
                        <div>
                            <el-icon class="text-green-500 mt-0.5">
                                <Check />
                            </el-icon>
                            照片参考
                        </div>
                    </li>
                    <li class="flex items-start gap-2">
                        <div>
                            <img class="h-150px " src="../../../assets/img/poster1.png" alt="">
                        </div>
                    </li>
                    <li class="flex items-start gap-2">
                        <el-icon class="text-green-500 mt-0.5">
                            <Check />
                        </el-icon>
                        <span>支持 JPG/PNG 格式，文件大小不超过 5MB</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <el-icon class="text-green-500 mt-0.5">
                            <Check />
                        </el-icon>
                        <span>确保学生证照片清晰，关键信息完整可见</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <el-icon class="text-green-500 mt-0.5">
                            <Check />
                        </el-icon>
                        <span>认证信息仅用于身份验证，不会公开显示</span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 🔹 上传对话框 -->
        <el-dialog v-model="showUploadDialog" title="上传学生证" :close-on-click-modal="false"
            class="w-90% md:w-25% mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">
            <div class="space-y-4">
                <!-- 真实姓名 -->
                <el-form-item label="真实姓名">
                    <el-input v-model="form.realName" placeholder="请输入学生证上的真实姓名" :disabled="!!status?.realName" />
                    <p v-if="status?.realName" class="text-xs text-gray-400 mt-1">
                        已认证姓名不可修改
                    </p>
                </el-form-item>

                <!-- 学号 -->
                <el-form-item label="学号">
                    <el-input v-model.number="form.studentId" placeholder="请输入 10-13 位学号"
                        :disabled="!!status?.studentId" maxlength="13" />
                    <p v-if="status?.studentId" class="text-xs text-gray-400 mt-1">
                        已认证学号不可修改
                    </p>
                </el-form-item>

                <!-- 学生证上传 -->
                <el-form-item label="学生证照片">
                    <OssUploader ref="uploaderRef" :disabled="!!status?.studentCardUrl" :limit="1" :width="100"
                        v-model="form.studentCardUrl" />

                    <!-- 预览：只有 previewUrl 有值时才显示 -->
                    <div v-if="previewUrl" class="mt-3">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">已上传：</p>
                        <el-image :src="previewUrl"
                            class="w-full max-h-48 rounded-lg object-contain bg-gray-100 dark:bg-gray-700" fit="contain"
                            :preview-src-list="[previewUrl]" />
                    </div>
                </el-form-item>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="showUploadDialog = false">取消</el-button>
                    <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleSubmit">
                        {{ submitting ? '提交中...' : '提交认证' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Check } from '@element-plus/icons-vue'
import verifyApi, { type VerificationStatus } from '@/api/verify'

// 🔥 替换为你的实际上传组件路径
import OssUploader from '@/components/AdvanceImageUpload.vue'

// 🔹 表单数据类型
interface FormState {
    realName: string
    studentId: number
    studentCardUrl: string[]
}

// 🔹 状态
const status = ref<VerificationStatus | null>(null)
const showUploadDialog = ref(false)
const submitting = ref(false)

// 🔹 表单数据 - 🔥 明确初始值，避免 undefined
const form = ref<FormState>({
    realName: '',
    studentId: 0,
    studentCardUrl: []
})

// 🔹 计算属性：预览 URL（🔥 核心修复：确保永远是 string）
const previewUrl = computed((): string => {
    // 优先级：表单新值 > 已有认证值 > 空字符串
    return form.value.studentCardUrl[0] || status.value?.studentCardUrl || ''
})

// 🔹 计算属性：是否可以提交
const canSubmit = computed((): boolean => {
    return (
        form.value.realName.trim().length >= 2 &&  // 姓名至少 2 字
        form.value.studentId >= 1000000000 &&       // 学号至少 10 位
        form.value.studentId <= 9999999999999 &&    // 学号最多 13 位
        !!previewUrl.value                          // 必须有图片
    )
})

// 🔹 获取认证状态
const fetchStatus = async (): Promise<void> => {
    try {
        const res: any = await verifyApi.checkVerifyStatus()
        if (res.code === 200 && res.data) {
            status.value = res.data
            // 🔥 填充表单（用于重新提交）
            if (res.data.realName) {
                form.value.realName = res.data.realName
            }
            if (res.data.studentId) {
                form.value.studentId = Number(res.data.studentId)
            }
            if (res.data.studentCardUrl) {
                form.value.studentCardUrl = [res.data.studentCardUrl]
            }
        }

    } catch (error) {
        console.error('❌ 获取认证状态失败:', error)
        ElMessage.error('获取认证状态失败')
    }
}

// 🔹 格式化日期
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 🔹 打开上传对话框
const openUploadDialog = (): void => {
    // 🔥 如果已有认证信息，填充表单
    if (status.value) {
        if (status.value.realName) {
            form.value.realName = status.value.realName
        }
        if (status.value.studentId) {
            form.value.studentId = Number(status.value.studentId)
        }
        if (status.value.studentCardUrl) {
            form.value.studentCardUrl = [status.value.studentCardUrl]
        }
    }
    showUploadDialog.value = true
}

// 🔹 提交认证 - 🔥 修复：统一使用 async/await
const handleSubmit = async (): Promise<void> => {
    // 🔥 二次校验
    if (!canSubmit.value) {
        ElMessage.warning('请填写完整的认证信息')
        return
    }

    submitting.value = true

    try {
        // 🔥 准备提交数据 - 🔥 确保所有字段都有值
        const submitData = {
            realName: form.value.realName.trim(),
            studentId: form.value.studentId,
            studentCardUrl: previewUrl.value  // 🔥 使用 previewUrl，确保是 string
        }

        // 🔥 根据当前状态选择接口
        const apiFn = status.value?.verificationStatus === 'rejected'
            ? verifyApi.resubmitVerification
            : verifyApi.submitVerification

        // 🔥 调用 API（统一用 await）
        const res: any = await apiFn(submitData)
        if (res.code === 200 || res.code === 201) {
            ElMessage.success(res.msg || '提交成功')
            showUploadDialog.value = false
            await fetchStatus()  // 🔥 刷新状态
        }

    } catch (error: any) {
        console.error('❌ 提交认证失败:', error)
        const msg = error?.response?.data?.msg || error?.message || '提交失败，请重试'
        ElMessage.error(msg)
    } finally {
        submitting.value = false
    }
}

// 🔹 初始化
onMounted(() => {
    fetchStatus()
})
</script>

<style scoped>
/* 🔥 移动端优化 */
@media (max-width: 640px) {
    .verification-page {
        @apply px-2;
    }

    :deep(.el-dialog) {
        @apply mx-2;
    }
}

/* 🔥 深色模式适配 */
:global(.dark) .el-alert--success.is-light {
    @apply bg-green-900/20 border-green-800 text-green-300;
}

:global(.dark) .el-alert--warning.is-light {
    @apply bg-yellow-900/20 border-yellow-800 text-yellow-300;
}

:global(.dark) .el-alert--error.is-light {
    @apply bg-red-900/20 border-red-800 text-red-300;
}

/* 🔥 表单优化 */
:deep(.el-form-item__label) {
    @apply font-medium text-gray-700 dark:text-gray-200;
}

:deep(.el-input__wrapper) {
    @apply dark:bg-gray-700/50 dark:border-gray-600;
}
</style>
