<template>
    <div class="flex flex-col p-4 sm:p-6 space-y-6 h-full">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-[var(--el-text-color-primary)]">身份认证审核</h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">待审核申请：{{ pagination.total }} 份</p>
            </div>
            <el-button @click="fetchPendingList" type="warning">刷新列表</el-button>
        </div>

        <div class="w-full">
            <el-row :gutter="20">
                <el-col :xs="24" :md="12" :lg="4">
                    <div class="w-full mb-4">
                        <el-input
                            v-model="searchKeyword"
                            placeholder="搜索学号或姓名"
                            clearable
                            prefix-icon="Search"
                            @keyup.enter="handleSearch"
                        />
                    </div>
                </el-col>
                <el-col :xs="0" :md="8" :lg="16" />
                <el-col :xs="24" :md="12" :lg="4">
                    <el-row class="w-full">
                        <el-col :span="11">
                            <el-button type="primary" class="w-full" @click="handleSearch">搜索</el-button>
                        </el-col>
                        <el-col :span="2" />
                        <el-col :span="11">
                            <el-button class="w-full" @click="resetSearch">重置</el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>

        <div class="flex-1 flex flex-col">
            <el-table
                :data="pendingList"
                stripe
                v-loading="loading"
                class="flex-1"
                :header-cell-class-name="darkHeaderClass"
            >
                <el-table-column prop="id" label="编号" width="70" />

                <el-table-column label="学生证" width="90">
                    <template #default="{ row }">
                        <el-image
                            :src="row.studentCardUrl"
                            class="w-16 h-16 rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-700"
                            fit="contain"
                            :preview-src-list="[row.studentCardUrl]"
                            :zoom-rate="1.2"
                            :max-scale="7"
                            :min-scale="0.2"
                            preview-teleported
                        />
                    </template>
                </el-table-column>

                <el-table-column prop="realName" label="真实姓名" width="120" />
                <el-table-column prop="studentId" label="学号" min-width="120" />
                <el-table-column prop="phone" label="手机号" min-width="120">
                    <template #default="{ row }">
                        {{ row.phone || '-' }}
                    </template>
                </el-table-column>

                <el-table-column prop="verificationSubmittedAt" label="提交时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.verificationSubmittedAt) }}
                    </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" min-width="130">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openReviewDialog(row)">详情</el-button>
                        <el-button link type="success" @click="handleApprove(row)">通过</el-button>
                        <el-button link type="danger" @click="openRejectDialog(row)">拒绝</el-button>
                    </template>
                </el-table-column>

                <template #empty>
                    <el-empty description="暂无待审核申请" :image-size="100">
                        <el-button type="primary" @click="fetchPendingList">刷新试试</el-button>
                    </el-empty>
                </template>
            </el-table>

            <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.limit"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
                class="mt-4"
            />
        </div>

        <el-dialog
            v-model="showReviewDialog"
            title="认证申请详情"
            width="600px"
            :close-on-click-modal="false"
            class="w-90% md:w-30% mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl"
            append-to-body
        >
            <div v-if="currentRecord" class="space-y-4">
                <div class="bg-[var(--el-fill-color-light)] rounded-lg p-4">
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">用户信息</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">学号：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.studentId || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">真实姓名：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.realName || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">手机号：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.phone || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">提交时间：</span>
                            <span class="text-[var(--el-text-color-primary)]">
                                {{ formatDate(currentRecord.verificationSubmittedAt) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">学生证照片</h3>
                    <el-image
                        :src="currentRecord.studentCardUrl"
                        class="max-h-96 rounded-lg bg-gray-100 dark:bg-gray-700"
                        fit="contain"
                        :preview-src-list="[currentRecord.studentCardUrl]"
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        preview-teleported
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="showReviewDialog = false" class="w-24">关闭</el-button>
                    <el-button type="success" @click="handleApprove(currentRecord)" class="w-24">通过</el-button>
                    <el-button type="danger" @click="openRejectDialog(currentRecord)" class="w-24">拒绝</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
            v-model="showRejectDialog"
            title="拒绝认证申请"
            width="500px"
            :close-on-click-modal="false"
            class="w-90% md:w-30% mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl"
            append-to-body
        >
            <el-alert
                title="拒绝后用户可修改并重新提交申请"
                type="warning"
                :closable="false"
                show-icon
                class="mb-4"
            />

            <el-form label-position="top">
                <el-form-item label="拒绝原因" required>
                    <el-input
                        v-model="rejectForm.reason"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入清晰的拒绝原因"
                        maxlength="200"
                        show-word-limit
                        resize="none"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showRejectDialog = false" class="w-24">取消</el-button>
                    <el-button
                        type="danger"
                        :loading="submitting"
                        :disabled="!rejectForm.reason?.trim()"
                        @click="handleReject"
                        class="w-24"
                    >
                        {{ submitting ? '提交中...' : '确认拒绝' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import verifyApi from '@/api/verify'
import adminUserApi from '@/api/admin/user'
import { modalBox } from '@/components/messageBox/modalBox'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const showReviewDialog = ref(false)
const showRejectDialog = ref(false)
const currentRecord = ref<any>(null)
const pendingList = ref<any[]>([])

const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

const rejectForm = reactive({
    reason: ''
})

const fetchPendingList = async (): Promise<void> => {
    loading.value = true
    try {
        const res: any = await verifyApi.getPendingList({
            page: pagination.page,
            limit: pagination.limit,
            keyword: searchKeyword.value
        })
        if (res.code === 200 && res.data) {
            pendingList.value = res.data.list || []
            pagination.total = res.data.pagination?.total || 0
        }
    } catch (error) {
        console.error('获取待审核列表失败:', error)
        ElMessage.error('获取待审核列表失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = (): void => {
    pagination.page = 1
    fetchPendingList()
}

const resetSearch = (): void => {
    searchKeyword.value = ''
    pagination.page = 1
    fetchPendingList()
}

const handleSizeChange = (val: number): void => {
    pagination.limit = val
    pagination.page = 1
    fetchPendingList()
}

const handleCurrentChange = (val: number): void => {
    pagination.page = val
    fetchPendingList()
}

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

const darkHeaderClass = (): string => {
    return 'dark:bg-[var(--el-fill-color-dark)] dark:text-[var(--el-text-color-primary)]'
}

const normalizePhone = (phone: unknown): string => {
    if (typeof phone !== 'string') return ''
    return phone.trim()
}

const resolveUserId = (row: any): number | null => {
    const candidates = [row?.userId, row?.user_id, row?.uid, row?.id]
    for (const value of candidates) {
        const n = Number(value)
        if (Number.isFinite(n) && n > 0) return n
    }
    return null
}

const openReviewDialog = (row: any): void => {
    currentRecord.value = row
    showReviewDialog.value = true
}

const handleApprove = async (row: any): Promise<void> => {
    if (!row) return

    try {
        await modalBox({
            type: 'info',
            title: '确认通过',
            message: `确定通过用户 "${row.realName || '-'}" (${row.studentId}) 的认证申请吗？`
        })

        submitting.value = true
        const phone = normalizePhone(row.phone)
        const res: any = await verifyApi.reviewVerification(row.id, {
            status: 'approved',
            phone: phone || undefined
        })
        if (res.code === 200) {
            if (phone) {
                const userId = resolveUserId(row)
                if (userId) {
                    try {
                        await adminUserApi.updateUser(userId, { phone })
                    } catch (phoneError) {
                        console.warn('审核通过后同步手机号失败:', phoneError)
                    }
                }
            }

            ElMessage.success('审核通过')
            await fetchPendingList()
            showReviewDialog.value = false
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('审核失败:', error)
            ElMessage.error(error?.response?.data?.msg || '审核失败')
        }
    } finally {
        submitting.value = false
    }
}

const openRejectDialog = (row: any): void => {
    if (!row) return
    currentRecord.value = row
    rejectForm.reason = ''
    showRejectDialog.value = true
}

const handleReject = async (): Promise<void> => {
    if (!currentRecord.value) return
    if (!rejectForm.reason.trim()) {
        ElMessage.warning('请输入拒绝原因')
        return
    }

    try {
        submitting.value = true
        const res: any = await verifyApi.reviewVerification(currentRecord.value.id, {
            status: 'rejected',
            reason: rejectForm.reason
        })
        if (res.code === 200) {
            ElMessage.success('已拒绝申请')
            showRejectDialog.value = false
            await fetchPendingList()
        }
    } catch (error: any) {
        console.error('拒绝失败:', error)
        ElMessage.error(error?.response?.data?.msg || '拒绝失败')
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchPendingList()
})
</script>

<style scoped></style>
