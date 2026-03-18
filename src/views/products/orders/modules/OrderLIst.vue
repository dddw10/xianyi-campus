<!-- src/views/products/orders/modules/OrderList.vue -->
<template>
    <div v-loading="isLoading" element-loading-text="加载中..." class="w-full">

        <!-- 🔸 空状态 -->
        <div v-if="orderList.length === 0 && !isLoading" class="text-center p-4 z-10">
            <div class="text-6xl mb-4 animate-bounce">📦</div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {{ props.emptyText || '暂无订单' }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {{ getEmptySubtext(props.listType) }}
            </p>
            <el-button type="primary" @click="router.push('/products')" class="!rounded-full !px-6">
                🛍️ 去逛逛
            </el-button>
        </div>

        <!-- 🔸 订单列表 -->
        <div v-else class="space-y-4">
            <div v-for="item in orderList" :key="item.orderNo || item.id"
                class="order-card p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                @click="router.push(`/user/orders/${item.orderNo}`)">
                <!-- 🔹 订单头部：订单号 + 状态 + 时间 -->
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">订单号：</span>
                        <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ item.orderNo }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <el-tag :type="getStatusType(item.status)" size="small" effect="light">
                            {{ getStatusText(item.status, props.listType) }}
                        </el-tag>
                        <span class="text-xs text-gray-400">{{ formatDate(item.createdAt || item.created_at) }}</span>
                    </div>
                </div>

                <!-- 🔹 商品信息 -->
                <div class="flex gap-4 mb-3">
                    <el-image :src="item.productImage || item.images?.[0]"
                        class="w-20 h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" fit="cover" @click.stop>
                        <template #error>
                            <div
                                class="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <el-icon class="text-gray-400">
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 dark:text-gray-100 line-clamp-2" @click.stop>
                            {{ item.productTitle || item.title }}
                        </h4>
                        <p class="text-red-500 font-bold mt-1">¥{{ formatPrice(item.price || item.totalAmount) }}</p>
                    </div>
                </div>

                <!-- 🔹 交易双方信息 -->
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span v-if="props.listType === 'bought'">
                        卖家：{{ item.sellerName || '匿名' }}
                    </span>
                    <span v-else-if="props.listType === 'sold'">
                        买家：{{ item.buyerName || '匿名' }}
                    </span>
                    <span v-if="item.deliveryAddress" class="text-gray-300">|</span>
                    <span v-if="item.deliveryAddress" class="line-clamp-1">
                        📍 {{ item.deliveryAddress }}
                    </span>
                </div>

                <!-- 🔹 订单操作按钮 -->
                <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700"
                    @click.stop>
                    <!-- 🔸 买家操作 -->
                    <template v-if="props.listType === 'bought'">
                        <el-button v-if="item.status === 'pending'" size="small" type="primary"
                            @click.stop="router.push(`/pay/${item.orderNo}`)">
                            💳 去支付
                        </el-button>
                        <el-button v-if="item.status === 'trading'" size="small" type="success"
                            @click.stop="handleConfirmReceive(item.orderNo)">
                            ✅ 确认收货
                        </el-button>
                        <el-button v-if="['pending', 'trading'].includes(item.status)" size="small" type="danger" link
                            @click.stop="handleCancelOrder(item.orderNo)">
                            取消订单
                        </el-button>
                    </template>

                    <!-- 🔸 卖家操作 -->
                    <template v-else-if="props.listType === 'sold'">
                        <el-button v-if="item.status === 'pending'" size="small" type="success"
                            @click.stop="emit('ship-order', item.orderNo)">
                            🚚 发货
                        </el-button>
                    </template>

                    <!-- 🔸 通用操作 -->
                    <el-button size="small" type="info" link @click.stop="router.push(`/user/orders/${item.orderNo}`)">
                        详情
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 🔸 分页 -->
        <div v-if="pagination.total > 0"
            class="flex justify-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="pagination.total"
                :page-sizes="[10, 20, 50]" layout="prev, pager, next, total" @current-change="handlePageChange"
                class="!text-sm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Picture } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import orderApi from "@/api/order"

const router = useRouter()

// 🔥 修复：使用 withDefaults + 可选 props
const props = withDefaults(defineProps<{
    list?: any[]
    loading?: boolean
    pagination?: { page: number; limit: number; total: number }
    emptyText?: string
    listType?: 'bought' | 'sold'
}>(), {
    list: () => [],
    loading: false,
    pagination: () => ({ page: 1, limit: 20, total: 0 }),
    emptyText: '暂无订单',
    listType: 'bought'
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
    (e: 'refresh-list'): void
    (e: 'confirm-receive', orderNo: string): void
    (e: 'ship-order', orderNo: string, tracking?: string): void
}>()

// 🔥 使用 computed 包装，提供默认值
const orderList = computed(() => props.list || [])
const isLoading = computed(() => props.loading || false)
const pagination = computed(() => props.pagination || { page: 1, limit: 20, total: 0 })

// 🔹 分页双向绑定
const currentPage = computed({
    get: () => pagination.value.page || 1,
    set: (val) => emit('page-change', val)
})
const pageSize = computed({
    get: () => pagination.value.limit || 20,
    set: () => { }
})
const handlePageChange = (page: number) => {
    emit('page-change', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 🔹 工具函数
const formatPrice = (price: string | number | undefined) => {
    if (!price) return '0.00'
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (date: string | null | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusText = (status: string | undefined, listType?: string) => {
    if (!status) return '未知'
    const buyerMap: Record<string, string> = {
        pending: '待付款',
        paid: '待发货',
        trading: '待收货',
        completed: '已完成',
        cancelled: '已取消'
    }
    const sellerMap: Record<string, string> = {
        pending: '待发货',
        paid: '待发货',
        trading: '交易中',
        completed: '已完成',
        cancelled: '已取消'
    }
    const map = listType === 'sold' ? sellerMap : buyerMap
    return map[status] || status
}

const getStatusType = (status: string | undefined): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    if (!status) return 'info'
    const map: Record<string, any> = {
        pending: 'warning',
        paid: 'primary',
        trading: 'info',
        completed: 'success',
        cancelled: 'danger'
    }
    return map[status] || 'info'
}

const getEmptySubtext = (tab?: string) => {
    const map: Record<string, string> = {
        bought: '成功购买后，订单记录会显示在这里',
        sold: '成功卖出后，订单记录会显示在这里'
    }
    return map[tab || ''] || '暂无相关订单'
}

// 🔹 买家确认收货
const handleConfirmReceive = async (orderNo: string) => {
    try {
        await ElMessageBox.confirm('确认已收到商品？确认后将无法退款', '确认收货', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'success'
        })

        const res = await orderApi.updateOrderStatus(orderNo, 'completed')
        if ((res as any)?.code === 200) {
            ElMessage.success('✅ 确认收货成功')
            emit('refresh-list')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || '操作失败')
        }
    }
}

// 🔹 取消订单
const handleCancelOrder = async (orderNo: string) => {
    try {
        await ElMessageBox.confirm('确定要取消此订单吗？', '取消订单', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')
        if ((res as any)?.code === 200) {
            ElMessage.success('✅ 订单已取消')
            emit('refresh-list')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || '操作失败')
        }
    }
}
</script>

<style scoped>
.order-card:active {
    @apply scale-[0.99] transition-transform;
}
</style>