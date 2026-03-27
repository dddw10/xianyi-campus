<!-- src/views/admin/appeals/Index.vue -->
<template>
    <div class="p-4 md:p-6 min-h-screen bg-[var(--el-fill-color-light)]">

        <!--  头部 -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-[var(--el-text-color-primary)]">📋 申诉审核</h1>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">
                    处理用户提交的订单申诉，维护平台交易公平
                </p>
            </div>
            <el-tag type="warning" effect="plain" size="large">
                待审核：{{ pendingCount }}
            </el-tag>
        </div>

        <!--  筛选栏 -->
        <div class="bg-[var(--el-bg-color)] rounded-xl p-4 mb-4 shadow-sm">
            <div class="flex flex-col md:flex-row gap-3">
                <!-- 状态筛选 -->
                <el-select v-model="filterStatus" placeholder="申诉状态" clearable class="!w-full md:!w-40"
                    @change="fetchList">
                    <el-option label="全部" value="" />
                    <el-option label="待审核" value="pending" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="已驳回" value="rejected" />
                </el-select>

                <!-- 搜索框 -->
                <el-input v-model="searchKeyword" placeholder="搜索订单号/申诉原因" class="!w-full md:!w-64" clearable
                    @keyup.enter="fetchList">
                    <template #append>
                        <el-button :icon="Search" @click="fetchList" />
                    </template>
                </el-input>

                <!-- 刷新按钮 -->
                <el-button :icon="Refresh" circle @click="fetchList" />
            </div>
        </div>

        <!--  表格 -->
        <el-card class="mb-4" shadow="never">
            <el-table v-loading="loading" :data="list" style="width: 100%"
                :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }">

                <!-- 订单信息 -->
                <el-table-column label="订单信息" min-width="180">
                    <template #default="{ row }">
                        <div class="space-y-1">
                            <div class="font-mono text-sm text-blue-600">
                                {{ row.order_no }}
                            </div>
                            <div class="text-xs text-gray-500 line-clamp-1">
                                {{ row.product_title }}
                            </div>
                            <div class="text-xs text-orange-500 font-medium">
                                ¥{{ formatPrice(row.price) }}
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <!-- 申诉原因 -->
                <el-table-column prop="appeal_reason" label="申诉原因" min-width="160" show-overflow-tooltip />

                <!-- 证据图片 -->
                <el-table-column label="证据" width="90" align="center">
                    <template #default="{ row }">
                        <el-image v-if="row.appeal_images?.[0]" :src="row.appeal_images[0]"
                            :preview-src-list="row.appeal_images" :preview-teleported="true"
                            class="w-10 h-10 rounded cursor-pointer hover:opacity-80 transition" fit="cover"
                            :zoom-rate="1.2" />
                        <span v-else class="text-xs text-gray-400">无</span>
                    </template>
                </el-table-column>

                <!-- 申诉状态 -->
                <el-table-column label="状态" width="90" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.appeal_status)" size="small" effect="plain">
                            {{ getStatusText(row.appeal_status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!--  审核回复（管理员备注） -->
                <el-table-column label="审核回复" min-width="150">
                    <template #default="{ row }">
                        <!-- 待审核：显示待处理 -->
                        <span v-if="row.appeal_status === 'pending'" class="text-xs text-gray-400">
                            待处理
                        </span>

                        <!-- 已处理：显示管理员备注 -->
                        <template v-else>
                            <!--  调试：打印行数据（开发时开启） -->
                            <!-- <div class="text-[10px] text-gray-300 mb-1">{{ JSON.stringify({ admin_remark: row.admin_remark }) }}</div> -->

                            <!-- 有备注：高亮显示 -->
                            <div v-if="row.admin_remark" class="space-y-1">
                                <div class="text-xs font-medium" :class="{
                                    'text-green-600': row.appeal_status === 'approved',
                                    'text-red-600': row.appeal_status === 'rejected'
                                }">
                                    {{ row.appeal_status === 'approved' ? '✓' : '✗' }} {{ row.admin_remark }}
                                </div>
                                <div class="text-[10px] text-gray-400">
                                    {{ formatDate(row.appeal_updated_at) }}
                                </div>
                            </div>

                            <!-- 无备注：显示默认提示 -->
                            <span v-else class="text-xs text-gray-400">
                                无备注
                            </span>
                        </template>
                    </template>
                </el-table-column>

                <!-- 提交时间 -->
                <el-table-column prop="appeal_updated_at" label="提交时间" width="150">
                    <template #default="{ row }">
                        {{ formatDate(row.appeal_updated_at) }}
                    </template>
                </el-table-column>

                <!-- 操作 -->
                <el-table-column label="操作" width="160" fixed="right" align="center">
                    <template #default="{ row }">
                        <!-- 待审核：显示审核按钮 -->
                        <template v-if="row.appeal_status === 'pending'">
                            <el-button size="small" type="success" plain @click="openAuditDialog(row, 'approve')">
                                通过
                            </el-button>
                            <el-button size="small" type="danger" plain @click="openAuditDialog(row, 'reject')">
                                驳回
                            </el-button>
                        </template>

                        <!-- 已处理：显示查看详情 -->
                        <template v-else>
                            <el-button size="small" plain @click="viewAuditDetail(row)">
                                查看
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--  分页 -->
        <div class="flex justify-end">
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
                :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
                @size-change="fetchList" @current-change="fetchList" />
        </div>

        <!--  审核弹窗 -->
        <el-dialog v-model="auditDialogVisible" :title="auditAction === 'approve' ? '✅ 通过申诉' : '❌ 驳回申诉'" width="480px"
            :close-on-click-modal="false">
            <div class="space-y-4">
                <!-- 订单信息预览 -->
                <div class="p-3 bg-[var(--el-fill-color-light)] rounded-lg">
                    <div class="text-sm font-medium mb-2">订单信息</div>
                    <div class="text-xs space-y-1 text-gray-600">
                        <div>订单号：{{ currentOrder?.order_no }}</div>
                        <div>商品：{{ currentOrder?.product_title }}</div>
                        <div>申诉原因：{{ currentOrder?.appeal_reason }}</div>
                    </div>
                </div>

                <!-- 审核备注 -->
                <el-form-item label="审核回复" :label-position="'top'">
                    <el-input v-model="auditRemark" type="textarea" :rows="3" :placeholder="auditAction === 'approve'
                        ? '可选：填写处理说明，如「同意部分退款 20 元」「已联系买家协商」'
                        : '必填：填写驳回原因，如「证据不足，商品描述属实」「买家未提供有效凭证」'" :required="auditAction === 'reject'" maxlength="200"
                        show-word-limit />
                    <p class="text-[10px] text-gray-400 mt-1">
                        💡 此回复将展示给用户，请保持专业友好
                    </p>
                </el-form-item>
            </div>

            <template #footer>
                <el-button @click="auditDialogVisible = false">取消</el-button>
                <el-button :type="auditAction === 'approve' ? 'success' : 'danger'" :loading="submitting"
                    @click="handleAuditSubmit">
                    确认{{ auditAction === 'approve' ? '通过' : '驳回' }}
                </el-button>
            </template>
        </el-dialog>

        <!--  审核详情弹窗 -->
        <el-dialog v-model="detailDialogVisible" title="📋 审核详情" width="420px" :close-on-click-modal="false">
            <div class="space-y-4">
                <!-- 订单信息 -->
                <div class="p-3 bg-[var(--el-fill-color-light)] rounded-lg">
                    <div class="text-sm font-medium mb-2">订单信息</div>
                    <div class="text-xs space-y-1 text-gray-600">
                        <div><span class="text-gray-400">订单号：</span>{{ currentOrder?.order_no }}</div>
                        <div><span class="text-gray-400">商品：</span>{{ currentOrder?.product_title }}</div>
                        <div><span class="text-gray-400">金额：</span>¥{{ formatPrice(currentOrder?.price) }}</div>
                    </div>
                </div>

                <!-- 申诉原因 -->
                <div>
                    <div class="text-sm font-medium mb-2">📝 申诉原因</div>
                    <div class="text-sm text-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {{ currentOrder?.appeal_reason || '无' }}
                    </div>
                </div>

                <!-- 审核回复 -->
                <div>
                    <div class="text-sm font-medium mb-2">
                        💬 审核回复
                        <el-tag size="small" :type="getStatusType(currentOrder?.appeal_status)" class="ml-2">
                            {{ getStatusText(currentOrder?.appeal_status) }}
                        </el-tag>
                    </div>
                    <div v-if="currentOrder?.admin_remark" class="text-sm p-3 rounded-lg border-l-4" :class="{
                        'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-300': currentOrder?.appeal_status === 'approved',
                        'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-300': currentOrder?.appeal_status === 'rejected'
                    }">
                        {{ currentOrder.admin_remark }}
                    </div>
                    <div v-else class="text-sm text-gray-400 italic">
                        管理员未填写备注
                    </div>
                    <div class="text-xs text-gray-400 mt-2">
                        审核时间：{{ formatDate(currentOrder?.appeal_updated_at) }}
                    </div>
                </div>

                <!-- 证据图片（如果有） -->
                <div v-if="currentOrder?.appeal_images?.length">
                    <div class="text-sm font-medium mb-2">🖼️ 证据图片</div>
                    <div class="flex gap-2 flex-wrap">
                        <el-image v-for="(img, idx) in currentOrder.appeal_images" :key="idx" :src="img"
                            :preview-src-list="currentOrder.appeal_images"
                            class="w-16 h-16 rounded cursor-pointer hover:opacity-80 transition" fit="cover" />
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="detailDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import orderApi from '@/api/order'

// ============================================================================
// 响应式数据
// ============================================================================
const loading = ref(false)
const list = ref<any[]>([])
const pendingCount = ref(0)
const filterStatus = ref('')
const searchKeyword = ref('')

const pagination = ref({
    page: 1,
    limit: 20,
    total: 0
})

//  审核弹窗相关
const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentOrder = ref<any>(null)
const auditAction = ref<'approve' | 'reject'>('approve')
const auditRemark = ref('')
const submitting = ref(false)

// ============================================================================
// 工具函数
// ============================================================================
const formatPrice = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

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

const getStatusText = (status?: string) => {
    const map: Record<string, string> = {
        none: '无申诉',
        pending: '待审核',
        approved: '已通过',
        rejected: '已驳回'
    }
    return map[status || 'none']
}

const getStatusType = (status?: string): 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, any> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    }
    return map[status || 'none'] || 'info'
}

// ============================================================================
// 核心方法
// ============================================================================

//  获取申诉列表
const fetchList = async () => {
    loading.value = true
    try {
        const res = await orderApi.getAppealList({
            page: pagination.value.page,
            limit: pagination.value.limit,
            status: filterStatus.value || undefined,
            keyword: searchKeyword.value || undefined
        })

        if ((res as any).code === 200) {
            list.value = res.data.list || []
            pagination.value.total = res.data.pagination?.total || 0
            pendingCount.value = res.data.pending_count || 0

            // 🔍 调试：打印第一条数据的 admin_remark（开发时开启）
            if (list.value.length > 0) {
                console.log('🔍 [Debug] 申诉列表第一条:', {
                    order_no: list.value[0].order_no,
                    appeal_status: list.value[0].appeal_status,
                    admin_remark: list.value[0].admin_remark  //  确认这个字段有值
                })
            }

            // 🔍 解析 appeal_images（如果后端返回的是字符串）
            list.value.forEach(item => {
                if (typeof item.appeal_images === 'string') {
                    try {
                        item.appeal_images = JSON.parse(item.appeal_images)
                    } catch {
                        item.appeal_images = []
                    }
                }
            })
        }
    } catch (error: any) {
        console.error('❌ 获取申诉列表失败:', error)
        ElMessage.error(error?.message || '加载失败')
    } finally {
        loading.value = false
    }
}

//  打开审核弹窗
const openAuditDialog = (order: any, action: 'approve' | 'reject') => {
    currentOrder.value = order
    auditAction.value = action
    auditRemark.value = ''
    auditDialogVisible.value = true
}

//  提交审核
const handleAuditSubmit = async () => {
    //  驳回时必须填备注
    if (auditAction.value === 'reject' && !auditRemark.value.trim()) {
        return ElMessage.warning('驳回申诉必须填写原因')
    }

    submitting.value = true
    try {
        // 🔍 调试：打印提交的参数
        console.log('🔍 [Debug] 提交审核参数:', {
            orderNo: currentOrder.value?.order_no,
            action: auditAction.value,
            remark: auditRemark.value.trim()
        })

        await orderApi.auditAppeal(currentOrder.value.order_no, {
            action: auditAction.value,
            remark: auditRemark.value.trim()
        })

        ElMessage.success(`✅ 申诉已${auditAction.value === 'approve' ? '通过' : '驳回'}`)
        auditDialogVisible.value = false
        fetchList()  // 刷新列表
    } catch (error: any) {
        console.error('❌ 提交审核失败:', error)
        ElMessage.error(error?.message || '操作失败')
    } finally {
        submitting.value = false
    }
}

//  查看审核详情
const viewAuditDetail = (order: any) => {
    currentOrder.value = order
    // 🔍 调试：打印详情数据
    console.log('🔍 [Debug] 查看详情数据:', {
        admin_remark: order.admin_remark,
        appeal_status: order.appeal_status
    })
    detailDialogVisible.value = true
}

// ============================================================================
// 生命周期
// ============================================================================
onMounted(() => {
    fetchList()
})
</script>

<style scoped>
/*  表格行悬停效果 */
:deep(.el-table__row:hover) {
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
}

/*  图片预览遮罩 */
:deep(.el-image-viewer__wrapper) {
    z-index: 9999 !important;
}

/*  审核回复高亮样式（备用） */
:deep(.audit-remark-approved) {
    @apply text-green-600 dark:text-green-400 font-medium;
}

:deep(.audit-remark-rejected) {
    @apply text-red-600 dark:text-red-400 font-medium;
}
</style>