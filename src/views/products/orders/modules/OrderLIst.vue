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
                        <!-- 🔥 点击订单号也可以跳转详情 -->
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

                <!-- 底部：操作按钮区 -->
                <div class="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <!-- 🔹 动态操作按钮 (根据状态显示) -->

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

                    <!-- 2. 待发货 (paid)：🔥 新增取消订单 + 等待提示 -->
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
                    <!-- 使用 .stop 防止冒泡触发上层的点击跳转 -->
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
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
    [key: string]: any
}

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
}>()

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

const handlePageChangeInternal = (page: number) => {
    emit('page-change', page)
}

// 🔥 确认收货
const handleConfirm = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo) {
        ElMessage.error('订单数据异常')
        return
    }
    emit('confirm-receive', orderNo)
}

// 🔥 取消订单（支持 pending 和 paid 状态）
const handleCancel = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        console.error('❌ [Cancel Error] 非法订单号:', orderNo)
        return
    }
    console.log('🚀 [Cancel Action] 准备取消订单:', {
        orderNo,
        status: order.status
    })
    emit('cancel-order', orderNo)
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 🔹 按钮悬停微交互（配合你的浅蓝主题） */
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
</style>