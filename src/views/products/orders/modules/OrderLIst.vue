<!-- src/views/products/orders/OrderList.vue -->
<template>
    <div class="space-y-4">
        <!-- 🔹 加载状态 -->
        <div v-if="loading" class="flex justify-center py-10">
            <el-skeleton :rows="5" animated />
        </div>

        <!-- 🔹 空状态 -->
        <el-empty v-else-if="!list || list.length === 0" :description="emptyText" />

        <!-- 🔹 订单列表 -->
        <div v-else class="space-y-4">
            <div v-for="order in list" :key="order.id"
                class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">

                <!-- 顶部：订单号 + 状态 -->
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div class="text-sm text-gray-500 flex items-center gap-2">
                        <span>订单号：</span>
                        <span class="font-mono text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                            @click="$router.push(`/orders/${order.order_no || order.orderNo}`)">
                            {{ order.order_no || order.orderNo || '未知' }}
                        </span>
                    </div>
                    <el-tag :type="getStatusType(order.status)" size="small" round>
                        {{ getStatusText(order.status) }}
                    </el-tag>
                </div>

                <!-- 主体：商品信息 (点击商品区域也可跳转详情) -->
                <div class="flex gap-4 mb-4 cursor-pointer"
                    @click="$router.push(`/orders/${order.order_no || order.orderNo}`)">
                    <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <el-image :src="order.product_image || order.images?.[0]" fit="cover" class="w-full h-full">
                            <template #error>
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                    <el-icon>
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>
                    </div>
                    <div class="flex-1 flex flex-col justify-between">
                        <h3 class="text-gray-800 dark:text-gray-200 font-medium line-clamp-2">
                            {{ order.product_title || order.title }}
                        </h3>
                        <div class="flex justify-between items-end">
                            <span class="text-orange-500 font-bold">
                                ¥{{ formatPrice(order.price || order.payment_amount || 0) }}
                            </span>
                            <span class="text-xs text-gray-400">x{{ order.quantity || 1 }}</span>
                        </div>
                    </div>
                </div>

                <!-- 🔹 底部：操作按钮区 -->
                <div class="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">

                    <!-- 🔥 申诉相关逻辑（已完成订单专属） -->
                    <template v-if="order.status === 'completed'">
                        <!-- ✅ 未申诉：显示「去申诉」按钮 -->
                        <el-button v-if="!order.appeal_status || order.appeal_status === 'none'" size="small"
                            type="warning" plain @click.stop="handleAppeal(order)">
                            去申诉
                        </el-button>

                        <!-- 🕐 申诉中：显示状态标签（不可点击） -->
                        <el-tag v-else-if="order.appeal_status === 'pending'" size="small" type="warning"
                            effect="plain">
                            申诉审核中
                        </el-tag>

                        <!-- ✅ 申诉通过：显示成功标签 + 可点击重新申诉 + Tooltip 显示备注 -->
                        <el-tooltip v-else-if="order.appeal_status === 'approved'"
                            :content="order.admin_remark || '申诉已通过，点击可再次申诉'" placement="top">
                            <el-tag size="small" type="success" effect="plain"
                                class="cursor-pointer hover:opacity-80 transition" @click.stop="handleAppeal(order)">
                                ✓ 申诉通过
                            </el-tag>
                        </el-tooltip>

                        <!-- ❌ 申诉驳回：显示信息标签 + 可点击重新申诉 + Tooltip 显示备注 -->
                        <el-tooltip v-else-if="order.appeal_status === 'rejected'"
                            :content="order.admin_remark || '申诉已驳回，点击可重新申诉'" placement="top">
                            <el-tag size="small" type="info" effect="plain"
                                class="cursor-pointer hover:opacity-80 transition" @click.stop="handleAppeal(order)">
                                ✗ 申诉驳回
                            </el-tag>
                        </el-tooltip>
                    </template>

                    <!-- 🔹 原有动态操作按钮 (保持不变) -->

                    <!-- 1. 待付款：取消 + 支付 -->
                    <template v-if="order.status === 'pending'">
                        <el-button size="small" type="danger" plain @click.stop="handleCancel(order)">
                            取消订单
                        </el-button>
                        <el-button size="small" type="primary"
                            @click.stop="$router.push(`/pay/${order.order_no || order.orderNo}`)">
                            去支付
                        </el-button>
                    </template>

                    <!-- 2. 待发货 (paid)：取消订单 + 等待提示 -->
                    <template v-else-if="order.status === 'paid'">
                        <el-button size="small" type="danger" plain @click.stop="handleCancel(order)">
                            取消订单
                        </el-button>
                        <span class="text-xs text-gray-400 mr-2">等待卖家发货</span>
                    </template>

                    <!-- 3. 待收货 (trading)：确认收货 -->
                    <template v-else-if="order.status === 'trading'">
                        <el-button size="small" type="success" @click.stop="handleConfirm(order)">
                            确认收货
                        </el-button>
                    </template>

                    <!-- 4. 已完成/已取消/已退款：无特殊操作 -->
                    <template v-else-if="['completed', 'cancelled', 'refunded'].includes(order.status)">
                        <span class="text-xs text-gray-400 mr-2">交易已结束</span>
                    </template>

                    <!-- 🔥 公共按钮：查看详情 (所有状态都显示) -->
                    <el-button size="small" plain
                        @click.stop="$router.push(`/orders/${order.order_no || order.orderNo}`)">
                        查看详情
                    </el-button>
                </div>
            </div>

            <!-- 🔹 分页 -->
            <div v-if="pagination.total > pagination.limit" class="flex justify-center mt-6">
                <el-pagination v-model:current-page="currentPage" :page-size="pagination.limit"
                    :total="pagination.total" layout="prev, pager, next" @current-change="handlePageChangeInternal" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { modalBox } from "@/components/messageBox/modalBox";

const router = useRouter()

// ============================================================================
// 🔥 类型定义（✅ 包含申诉相关字段）
// ============================================================================
interface OrderItem {
    id: number | string
    order_no?: string
    orderNo?: string
    status: string
    product_title?: string
    title?: string
    product_image?: string
    images?: string[]
    price?: string | number
    payment_amount?: string | number
    quantity?: number

    // 🔥 申诉相关字段（关键！确保后端返回这些字段）
    appeal_status?: 'none' | 'pending' | 'approved' | 'rejected'
    appeal_reason?: string
    appeal_images?: string[]
    appeal_updated_at?: string
    admin_remark?: string

    [key: string]: any
}

// ============================================================================
// 🔥 Props & Emits
// ============================================================================
const props = defineProps<{
    list: OrderItem[]
    loading: boolean
    pagination: { page: number; limit: number; total: number }
    emptyText: string
    listType: string
}>()

const emit = defineEmits<{
    (e: 'page-change', page: number): void
    (e: 'refresh-list'): void
    (e: 'confirm-receive', orderNo: string): void
    (e: 'cancel-order', orderNo: string): void
    // 🔥 申诉事件：参数允许 undefined（兼容后端可能返回空订单号）
    (e: 'appeal-order', orderNo: string | undefined): void
}>()

// ============================================================================
// 🔥 计算属性 & 工具函数
// ============================================================================
const currentPage = computed({
    get: () => props.pagination.page,
    set: (val) => val
})

const formatPrice = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: '待付款',
        paid: '待发货',
        trading: '待收货',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款'
    }
    return map[status] || status
}

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
        pending: 'warning',
        paid: 'primary',
        trading: 'primary',
        completed: 'success',
        cancelled: 'info',
        refunded: 'info'
    }
    return map[status] || 'info'
}

// ============================================================================
// 🔥 事件处理函数
// ============================================================================
const handlePageChangeInternal = (page: number) => {
    emit('page-change', page)
}

// 🔹 确认收货
const handleConfirm = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo) {
        ElMessage.error('订单数据异常')
        return
    }
    emit('confirm-receive', orderNo)
}

// 🔹 取消订单（支持 pending 和 paid 状态）
const handleCancel = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        console.error('❌ [Cancel Error] 非法订单号:', orderNo)
        return
    }
    console.log('🚀 [Cancel Action] 准备取消订单:', { orderNo, status: order.status })
    emit('cancel-order', orderNo)
}

// 🔥 申诉处理（✅ 关键：提交后状态流转依赖父组件刷新列表）
const handleAppeal = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    const appealStatus = order.appeal_status

    // 🔹 防御性校验
    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        return
    }

    // 🔥 场景 1: 已申诉（通过/驳回）→ 直接打开弹窗查看结果，无需确认
    if (appealStatus && appealStatus !== 'none' && appealStatus !== 'pending') {
        emit('appeal-order', orderNo)  // 🔥 直接发射事件，打开结果弹窗
        return
    }

    // 🔥 场景 2: 申诉审核中 → 提示等待，无需确认
    if (appealStatus === 'pending') {
        ElMessage.info('🕐 申诉审核中，请耐心等待管理员处理')
        return
    }

    // 🔥 场景 3: 未申诉 → 二次确认后打开表单提交
    modalBox({
        type: 'info',
        title: '提交申诉',
        message: '提交申诉后，平台将在 48 小时内审核。请确保申诉理由真实有效，恶意申诉可能影响账号信用。',
    }).then(() => {
        emit('appeal-order', orderNo)  // 🔥 打开表单提交申诉
    }).catch((action) => {
        if (action === 'cancel') {
            ElMessage.info('已取消申诉')
        }
    })
}
</script>

<style scoped>
/* 🔹 文本截断 */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 🔹 按钮悬停微交互（配合浅蓝主题） */
:deep(.el-button--danger.is-plain:hover) {
    --el-button-hover-bg-color: #fef2f2;
    --el-button-hover-border-color: #fecaca;
}

:deep(.el-button--primary:hover) {
    --el-button-hover-bg-color: #2563eb;
}

:deep(.el-button--success:hover) {
    --el-button-hover-bg-color: #22c55e;
}

:deep(.el-button--warning.is-plain:hover) {
    --el-button-hover-bg-color: #fff7ed;
    --el-button-hover-border-color: #fdba74;
    --el-button-hover-text-color: #c2410c;
}

/* 🔹 状态标签微调 */
:deep(.el-tag--plain) {
    font-weight: 500;
}
</style>