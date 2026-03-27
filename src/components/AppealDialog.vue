<!-- src/components/AppealDialog.vue -->
<template>
    <el-dialog v-model="visible" :title="dialogTitle"
        class="w-90% md:w-30%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" :close-on-click-modal="false"
        @closed="handleClosed">
        <div class="space-y-4">
            <!--  顶部状态提示 -->
            <el-alert :title="alertTitle" :type="alertType" :closable="false" show-icon />

            <!--  信息展示区域（申诉已处理时显示） -->
            <div v-show="showInfo" class="space-y-3 text-sm bg-gray-50 rounded-lg p-3">
                <!-- 申诉原因（用户提交的） -->
                <div class="flex gap-2">
                    <span class="w-16 font-medium text-gray-500 flex-shrink-0">申诉原因</span>
                    <span class="flex-1 text-gray-700">{{ appealResult?.reason || '无' }}</span>
                </div>

                <!--  审核结果：优先显示管理员备注，否则显示默认文案 -->
                <div class="flex gap-2">
                    <span class="w-16 font-medium text-gray-500 flex-shrink-0">
                        {{ appealResult?.status === 'approved' ? '通过理由' : '驳回理由' }}
                    </span>
                    <span class="flex-1" :class="hasRemark ? 'text-gray-700' : 'text-gray-400 italic'">
                        {{ getAppealResultText(appealResult?.status, appealResult?.admin_remark) }}
                    </span>
                </div>

                <!-- 提交时间 -->
                <div class="flex gap-2">
                    <span class="w-16 font-medium text-gray-500 flex-shrink-0">提交时间</span>
                    <span class="flex-1 text-gray-700">{{ formatDate(appealResult?.updated_at) }}</span>
                </div>
            </div>

            <!--  表单区域（未申诉时显示） -->
            <el-form v-show="!showInfo" ref="formRef" :model="form" :rules="rules" label-position="top"
                class="space-y-3">
                <el-form-item label="问题描述 *" prop="reason">
                    <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请简单说明问题，如：商品破损、功能异常、与描述不符等"
                        maxlength="300" show-word-limit />
                </el-form-item>

                <el-form-item label="证据图片（可选）">
                    <AdvancedImageUpload v-model="form.images" :limit="3" :width="80" />
                    <div class="text-xs text-gray-400 mt-1">
                        支持 jpg/png，单张≤5MB
                    </div>
                </el-form-item>
            </el-form>
        </div>

        <!--  底部按钮 -->
        <template #footer>
            <el-button @click="visible = false">
                {{ showInfo ? '关闭' : '取消' }}
            </el-button>

            <el-button v-show="!showInfo" type="primary" :loading="submitting" @click="handleSubmit">
                提交申诉
            </el-button>

            <el-button v-show="showInfo && appealResult?.status !== 'pending'" type="primary" @click="handleReAppeal">
                {{ appealResult?.status === 'approved' ? '再次申诉' : '重新申诉' }}
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
//  确认文件名：根据你的实际文件调整（AdvanceImageUpload 或 AdvancedImageUpload）
import AdvancedImageUpload from '@/components/AdvanceImageUpload.vue'
import orderApi from '@/api/order'
import { modalBox } from "@/components/messageBox/modalBox";

// ============================================================================
// Props & Emits
// ============================================================================
const props = defineProps<{
    orderNo: string
}>()

const visible = defineModel<boolean>('visible')
const emit = defineEmits<{
    (e: 'submitted', orderNo: string): void
    (e: 'closed'): void
}>()

// ============================================================================
// 响应式数据
// ============================================================================
const formRef = ref()
const form = ref({
    reason: '',
    images: [] as string[]
})
const submitting = ref(false)

//  申诉结果（兼容后端可能返回 admin_remark）
const appealResult = ref<{
    status: 'none' | 'pending' | 'approved' | 'rejected'
    reason: string | null
    updated_at: string | undefined
    admin_remark?: string | null  //  可选：后端可能动态返回
} | null>(null)

// ============================================================================
// 校验规则
// ============================================================================
const rules = {
    reason: [
        { required: true, message: '请填写问题描述', trigger: 'blur' },
        { min: 5, message: '描述至少 5 个字', trigger: 'blur' }
    ]
}

// ============================================================================
//  计算属性（所有逻辑预处理，避免模板复杂表达式）
// ============================================================================

// 是否显示已处理信息
const showInfo = computed(() => {
    return appealResult.value?.status && appealResult.value.status !== 'none'
})

//  是否有管理员备注（用于样式区分）
const hasRemark = computed(() => {
    return !!appealResult.value?.admin_remark?.trim()
})

// 弹窗标题
const alertTitle = computed(() => {
    if (!appealResult.value) return '发起申诉'
    const map: Record<string, string> = {
        pending: '🕐 申诉审核中',
        approved: '✅ 申诉已通过',
        rejected: '❌ 申诉已驳回'
    }
    return map[appealResult.value.status] || '申诉'
})

// 提示类型
const alertType = computed(() => {
    if (!appealResult.value) return 'info'
    return appealResult.value.status === 'approved' ? 'success' :
        appealResult.value.status === 'pending' ? 'warning' : 'info'
})

// el-dialog 标题
const dialogTitle = computed(() => alertTitle.value)

// ============================================================================
//  工具函数
// ============================================================================

// 格式化日期
const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

//  核心：获取审核结果文案（优先显示管理员备注）
const getAppealResultText = (status?: string, remark?: string | null) => {
    //  优先显示管理员填写的备注
    if (remark && remark.trim()) {
        return remark.trim()
    }
    // 否则显示默认文案
    if (status === 'approved') {
        return '✅ 申诉材料符合要求，予以通过'
    }
    if (status === 'rejected') {
        return '❌ 证据不足或描述属实，申诉驳回'
    }
    return '审核中'
}

// ============================================================================
//  核心方法
// ============================================================================

// 加载申诉结果
const fetchAppealResult = async () => {
    try {
        const res = await orderApi.getOrderDetail(props.orderNo)
        const appeal = res.data.appeal

        // 🔍 调试：打印完整响应（开发时开启）
        console.log('🔍 [Debug] 申诉详情响应:', {
            status: appeal?.status,
            reason: appeal?.reason,
            admin_remark: appeal?.admin_remark,  //  确认这个字段有值
            updated_at: appeal?.updated_at
        })

        if (appeal?.status && appeal.status !== 'none') {
            appealResult.value = {
                status: appeal.status,
                reason: appeal.reason,
                updated_at: appeal.updated_at,
                //  兼容：如果后端返回了 admin_remark 就用，否则为 undefined
                admin_remark: appeal.admin_remark
            }
        } else {
            appealResult.value = null
        }
    } catch (error: any) {
        console.error('❌ 加载申诉信息失败:', error)
        appealResult.value = null
    }
}

// 提交申诉
const handleSubmit = async () => {
    try {
        await formRef.value?.validate()
    } catch {
        return ElMessage.warning('请完善表单信息')
    }

    if (form.value.images.length > 3) {
        return ElMessage.warning('最多上传 3 张图片')
    }

    submitting.value = true
    try {
        await orderApi.submitAppeal(props.orderNo, {
            reason: form.value.reason.trim(),
            images: form.value.images
        })

        ElMessage.success('✅ 申诉已提交，等待管理员审核')
        emit('submitted', props.orderNo)

        // 提交成功后立即刷新结果
        await fetchAppealResult()
    } catch (error: any) {
        ElMessage.error(error?.message || '提交失败，请重试')
    } finally {
        submitting.value = false
    }
}

// 重新申诉
const handleReAppeal = async () => {
    try {
        modalBox({
            type: 'info',
            title: '确认重新申诉',
            message: appealResult.value?.status === 'approved'
                ? '申诉已通过，确定要再次提交申诉吗？'
                : '确定要重新提交申诉吗？请确保已补充新证据',
        }).then(() => {
            // 切换回表单模式
            appealResult.value = null
            form.value = { reason: '', images: [] }
            formRef.value?.resetFields()
        }
        )

    } catch (error) {
        // 用户取消
    }
}

// 弹窗关闭回调
const handleClosed = () => {
    form.value = { reason: '', images: [] }
    appealResult.value = null
    formRef.value?.resetFields()
    emit('closed')
}

// ============================================================================
// 生命周期
// ============================================================================
watch(() => visible.value, async (val) => {
    if (val && props.orderNo) {
        await fetchAppealResult()
    }
})
</script>

<style scoped>
/*  表单标签样式 */
:deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-primary);
    padding: 0;
}

/*  信息区域排版 */
:deep(.flex.gap-2) {
    align-items: flex-start;
}

/*  提示文字样式 */
:deep(.el-alert__description) {
    font-size: 13px;
}

/*  无备注时的斜体提示 */
:deep(.text-gray-400.italic) {
    font-style: italic;
}
</style>
