<!-- src/views/products/orders/modules/bought-goods/index.vue -->
<template>
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50">

        <!-- 🔹 状态筛选标签 -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待付款" name="pending" />
            <el-tab-pane label="待收货" name="trading" />
            <el-tab-pane label="已完成" name="completed" />
            <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>

        <!-- 🔥 修复：传递所有必需的 props 给 OrderList -->
        <OrderList :list="orderList" :loading="loading" :pagination="pagination" :empty-text="getEmptyText(tabPosition)"
            :list-type="'bought'" @page-change="handlePageChange" @refresh-list="fetchOrders"
            @confirm-receive="handleConfirmReceive" class="flex-1 ml-0 md:ml-4" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useWindowSize } from "@vueuse/core"
import orderApi from "@/api/order"
import OrderList from "../OrderLIst.vue"  // 🔥 正确路径

// 🔹 状态定义（在 BoughtOrders 内部管理）
const tabPosition = ref<'all' | 'pending' | 'trading' | 'completed' | 'cancelled'>('all')
const loading = ref(false)
const orderList = ref<any[]>([])
const { width } = useWindowSize()

// 🔹 分页配置
const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

// 🔹 获取订单列表
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

        const res = await orderApi.getBoughtOrders(params)

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

// 🔹 标签切换
const handleTabChange = () => {
    pagination.page = 1
    fetchOrders()
}

// 🔹 分页变化
const handlePageChange = (page: number) => {
    pagination.page = page
    fetchOrders()
}

// 🔹 空状态文案
const getEmptyText = (status: string) => {
    const map: Record<string, string> = {
        all: '暂无订单',
        pending: '暂无待付款订单',
        trading: '暂无待收货订单',
        completed: '暂无已完成订单',
        cancelled: '暂无已取消订单'
    }
    return map[status] || '暂无数据'
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
            fetchOrders()
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || '操作失败')
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