<!-- src/views/admin/verification-review/Index.vue -->
<template>
    <div class="flex flex-col p-4 sm:p-6 space-y-6 h-full">

        <!-- 🔹 页面头部 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-[var(--el-text-color-primary)]">
                    🎓 身份认证审核
                </h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">
                    待审核申请：{{ pagination.total }} 件 · 请及时处理
                </p>
            </div>
            <el-button @click="fetchPendingList" type="warning">
                🔄 刷新列表
            </el-button>
        </div>

        <!-- 🔹 搜索栏 -->
        <div class="w-full">
            <div class="flex flex-col">
                <el-row :gutter="20">
                    <el-col :xs="24" :md="12" :lg="4">
                        <div class="w-full mb-4">
                            <el-input v-model="searchKeyword" placeholder="搜索学号或姓名" clearable prefix-icon="Search"
                                @keyup.enter="handleSearch" />
                        </div>
                    </el-col>
                    <el-col :xs="0" :md="8" :lg="16"></el-col>
                    <el-col :xs="24" :md="12" :lg="4">
                        <div class="w-full">
                            <el-row class="w-full">
                                <!-- 🔹 搜索按钮 -->
                                <el-col :span="11">
                                    <el-button type="primary" class="w-full" @click="handleSearch">
                                        搜索
                                    </el-button>
                                </el-col>
                                <el-col :span="2"></el-col>
                                <!-- 🔹 重置按钮 -->
                                <el-col :span="11">
                                    <el-button class="w-full" @click="resetSearch">
                                        重置
                                    </el-button>
                                </el-col>
                            </el-row>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 🔹 表格区域 -->
        <div class="flex-1 flex flex-col">
            <el-table :data="pendingList" stripe v-loading="loading" class="flex-1"
                :header-cell-class-name="darkHeaderClass">
                <el-table-column prop="id" label="ID" />

                <!-- 🔹 学生证图片 -->
                <el-table-column label="学生证">
                    <template #default="{ row }">
                        <div class="flex items-center gap-2">
                            <el-image :src="row.studentCardUrl" class="w-16 h-16 rounded-lg cursor-pointer" fit="cover"
                                :preview-src-list="[row.studentCardUrl]" :zoom-rate="1.2" :max-scale="7"
                                :min-scale="0.2" preview-teleported />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="realName" label="真实姓名" />
                <el-table-column prop="studentId" label="学号" />
                <!-- <el-table-column prop="nickname" label="昵称" /> -->

                <el-table-column prop="verificationSubmittedAt" label="提交时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.verificationSubmittedAt) }}
                    </template>
                </el-table-column>

                <!-- 🔹 操作列 -->
                <el-table-column fixed="right" label="操作" min-width="120">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openReviewDialog(row)">
                            查看详情
                        </el-button>
                        <el-button link type="success" @click="handleApprove(row)">
                            ✅ 通过
                        </el-button>
                        <el-button link type="danger" @click="openRejectDialog(row)">
                            ❌ 拒绝
                        </el-button>
                    </template>
                </el-table-column>

                <!-- 🔹 空状态 -->
                <template #empty>
                    <el-empty description="暂无待审核申请" :image-size="100">
                        <el-button type="primary" @click="fetchPendingList">刷新试试</el-button>
                    </el-empty>
                </template>
            </el-table>

            <!-- 🔹 分页 -->
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
                :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                @current-change="handleCurrentChange" @size-change="handleSizeChange" class="mt-4" />
        </div>

        <!-- 🔹 审核详情对话框 -->
        <el-dialog v-model="showReviewDialog" title="认证申请详情" width="600px" :close-on-click-modal="false"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" append-to-body>
            <div v-if="currentRecord" class="space-y-4">
                <!-- 用户信息 -->
                <div class="bg-[var(--el-fill-color-light)] rounded-lg p-4">
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">用户信息</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">昵称：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.nickname || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">学号：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.studentId }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">真实姓名：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentRecord.realName || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">提交时间：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{
                                formatDate(currentRecord.verificationSubmittedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- 学生证图片 -->
                <div>
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">学生证照片</h3>
                    <el-image :src="currentRecord.studentCardUrl" class="w-full max-h-96 rounded-lg" fit="contain"
                        :preview-src-list="[currentRecord.studentCardUrl]" :zoom-rate="1.2" :max-scale="7"
                        :min-scale="0.2" preview-teleported />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3 ">
                    <el-button @click="showReviewDialog = false" class="w-24">关闭</el-button>
                    <el-button type="success" @click="handleApprove(currentRecord)" class="w-24">
                        ✅ 通过
                    </el-button>
                    <el-button type="danger" @click="openRejectDialog(currentRecord)" class="w-24">
                        ❌ 拒绝
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 🔹 拒绝原因对话框 -->
        <el-dialog v-model="showRejectDialog" title="❌ 拒绝认证申请" width="500px" :close-on-click-modal="false"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" append-to-body>
            <!-- 🔹 提示信息 -->
            <el-alert title="拒绝后用户将收到通知，可重新提交申请" type="warning" :closable="false" show-icon class="mb-4" />

            <el-form label-position="top">
                <el-form-item label="拒绝原因" required>
                    <el-input v-model="rejectForm.reason" type="textarea" :rows="4"
                        placeholder="请输入拒绝原因，例如：图片不清晰、信息不完整、学号有误等" maxlength="200" show-word-limit resize="none" />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showRejectDialog = false" class="w-24">取消</el-button>
                    <el-button type="danger" :loading="submitting" :disabled="!rejectForm.reason?.trim()"
                        @click="handleReject" class="w-24">
                        {{ submitting ? '提交中...' : '确认拒绝' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import verifyApi from '@/api/verify'
import { modalBox } from "@/components/messageBox/modalBox";

// 🔹 状态
const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const showReviewDialog = ref(false)
const showRejectDialog = ref(false)
const currentRecord = ref<any>(null)

// 🔹 分页参数
const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

// 🔹 拒绝表单
const rejectForm = reactive({
    reason: ''
})

// 🔹 待审核列表
const pendingList = ref<any[]>([])

// 🔹 获取待审核列表
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
        console.error('❌ 获取待审核列表失败:', error)
        ElMessage.error('获取列表失败')
    } finally {
        loading.value = false
    }
}

// 🔹 搜索
const handleSearch = (): void => {
    pagination.page = 1
    fetchPendingList()
}

// 🔹 重置搜索
const resetSearch = (): void => {
    searchKeyword.value = ''
    pagination.page = 1
    fetchPendingList()
}

// 🔹 分页变化
const handleSizeChange = (val: number): void => {
    pagination.limit = val
    pagination.page = 1
    fetchPendingList()
}

const handleCurrentChange = (val: number): void => {
    pagination.page = val
    fetchPendingList()
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

// 🔹 深色模式表格头
const darkHeaderClass = (): string => {
    return 'dark:bg-[var(--el-fill-color-dark)] dark:text-[var(--el-text-color-primary)]'
}

// 🔹 打开详情对话框
const openReviewDialog = (row: any): void => {
    currentRecord.value = row
    showReviewDialog.value = true
}

// 🔹 通过审核
const handleApprove = async (row: any): Promise<void> => {
    if (!row) return

    try {
        await modalBox({
            type: 'info',
            title: '确认通过',
            message: `确定要通过用户 "${row.realName || row.nickname}" (${row.studentId}) 的认证申请吗？`,
        })

        submitting.value = true
        const res: any = await verifyApi.reviewVerification(row.id, {
            status: 'approved'
        })
        if (res.code === 200) {
            ElMessage.success('✅ 审核通过')
            await fetchPendingList()
            showReviewDialog.value = false
        }

    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('❌ 审核失败:', error)
            ElMessage.error(error?.response?.data?.msg || '审核失败')
        }
    } finally {
        submitting.value = false
    }
}

// 🔹 打开拒绝对话框
const openRejectDialog = (row: any): void => {
    if (!row) return
    currentRecord.value = row
    rejectForm.reason = ''
    showRejectDialog.value = true
}

// 🔹 拒绝审核
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
            ElMessage.success('❌ 已拒绝申请')
            showRejectDialog.value = false
            await fetchPendingList()
        }


    } catch (error: any) {
        console.error('❌ 拒绝失败:', error)
        ElMessage.error(error?.response?.data?.msg || '拒绝失败')
    } finally {
        submitting.value = false
    }
}

// 🔹 初始化
onMounted(() => {
    fetchPendingList()
})
</script>

<style scoped></style>
