<!-- src/views/products/orders/modules/sold-goods/index.vue -->
<template>
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-gray-900/50 dark:to-gray-800/50">

        <!-- 🔹 状态筛选标签 -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待发货" name="pending" />
            <el-tab-pane label="交易中" name="trading" />
            <el-tab-pane label="已完成" name="completed" />
            <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>

        <!-- 🔥 修复：传递所有必需的 props 给 OrderList -->
        <OrderList :list="orderList" :loading="loading" :pagination="pagination" :empty-text="getEmptyText(tabPosition)"
            :list-type="'sold'" @page-change="handlePageChange" @refresh-list="fetchOrders"
            @ship-order="handleShipOrder" class="flex-1 ml-0 md:ml-4" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useWindowSize } from "@vueuse/core"
import orderApi from "@/api/order"
import OrderList from "../OrderLIst.vue"

const tabPosition = ref<'all' | 'pending' | 'trading' | 'completed' | 'cancelled'>('all')
const loading = ref(false)
const orderList = ref<any[]>([])
const { width } = useWindowSize()

const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

const fetchOrders = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pagination.page,
            limit: pagination.limit
        }
        if (tabPosition.value !== 'all') {
            params.status = tabPosition.value
        }

        const res = await orderApi.getSoldOrders(params)

        if ((res as any)?.code === 200) {
            orderList.value = res.data.list || []
            pagination.total = res.data.pagination?.total || 0
        } else {
            ElMessage.warning((res as any)?.msg || '获取订单失败')
        }
    } catch (error: any) {
        console.error('❌ 获取订单失败:', error)
        ElMessage.error(error?.response?.data?.msg || '加载失败，请重试')
        orderList.value = []
    } finally {
        loading.value = false
    }
}

const handleTabChange = () => {
    pagination.page = 1
    fetchOrders()
}

const handlePageChange = (page: number) => {
    pagination.page = page
    fetchOrders()
}

const getEmptyText = (status: string) => {
    const map: Record<string, string> = {
        all: '暂无订单',
        pending: '暂无待发货订单',
        trading: '暂无交易中订单',
        completed: '暂无已完成订单',
        cancelled: '暂无已取消订单'
    }
    return map[status] || '暂无数据'
}

// 🔹 卖家发货操作
const handleShipOrder = async (orderNo: string) => {
    try {
        const { value: tracking } = await ElMessageBox.prompt('请输入物流单号（可选）', '发货', {
            confirmButtonText: '确认发货',
            cancelButtonText: '取消',
            inputPattern: /^[\w\-]*$/,
            inputErrorMessage: '物流单号格式不正确'
        })

        const res = await orderApi.updateOrderStatus(orderNo, 'trading')
        if ((res as any)?.code === 200) {
            ElMessage.success('✅ 发货成功')
            fetchOrders()
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || '发货失败')
        }
    }
}

onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
/* 样式保持不变 */
</style>