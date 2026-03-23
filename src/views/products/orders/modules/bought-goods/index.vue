<!-- src/views/products/orders/modules/bought-goods/index.vue -->
<template>
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50 min-h-screen">

        <!-- 🔹 状态筛选标签 -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0 w-full md:w-auto">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待付款" name="pending" />

            <!-- 🔥 新增：如果有 paid 状态（待发货），可以加这个标签，否则可省略 -->
            <el-tab-pane label="待发货" name="paid" />

            <el-tab-pane label="待收货" name="trading" />
            <el-tab-pane label="已完成" name="completed" />
            <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>

        <!-- 🔹 订单列表组件 -->
        <OrderList :list="orderList" :loading="loading" :pagination="pagination" :empty-text="getEmptyText(tabPosition)"
            :list-type="'bought'" @page-change="handlePageChange" @refresh-list="fetchOrders"
            @confirm-receive="handleConfirmReceive" @cancel-order="handleCancelOrder"
            class="flex-1 ml-0 md:ml-4 w-full" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useWindowSize } from "@vueuse/core"
import orderApi from "@/api/order"
// ⚠️ 确保文件名大小写完全匹配 (OrderLIst.vue)
import OrderList from "../OrderLIst.vue"
import { modalBox } from "@/components/messageBox/modalBox";

const tabPosition = ref<'all' | 'pending' | 'trading' | 'completed' | 'cancelled' | 'paid'>('all')
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
        // 🔥 优化：如果是 'all' 就不传 status，让后端查所有；否则传具体状态
        if (tabPosition.value !== 'all') {
            params.status = tabPosition.value
        }

        const res = await orderApi.getBoughtOrders(params)

        if ((res as any)?.code === 200) {
            orderList.value = res.data.list || []
            pagination.total = res.data.pagination?.total || 0

            // 🔍 增强调试：打印关键信息
            if (orderList.value.length > 0) {
                const firstOrder = orderList.value[0]
                console.log('🔍 [Debug] 订单数据结构示例:', firstOrder)
                console.log('🔍 [Debug] status 值:', firstOrder.status)
                console.log('🔍 [Debug] order_no 值:', firstOrder.order_no)

                // 🔥 检查是否缺少 order_no
                if (!firstOrder.order_no) {
                    console.error('❌ 严重警告：后端返回的订单数据缺少 order_no 字段！请检查后端 getBought 接口。')
                }
            }
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
        pending: '暂无待付款订单',
        paid: '暂无待发货订单', // 对应新增的标签
        trading: '暂无待收货订单',
        completed: '暂无已完成订单',
        cancelled: '暂无已取消订单'
    }
    return map[status] || '暂无数据'
}

// 🔹 买家确认收货
const handleConfirmReceive = async (orderNo: string) => {
    if (!orderNo) {
        ElMessage.error('订单号缺失')
        return
    }
    try {
        modalBox({
            type: 'info',
            title: '确认收货',
            message: '确认已收到商品？确认后将无法退款'
        }).then(async () => {
            const res = await orderApi.updateOrderStatus(orderNo, 'completed')
            if ((res as any)?.code === 200) {
                ElMessage.success('✅ 确认收货成功')
                fetchOrders()
            } else {
                ElMessage.error((res as any)?.msg || '操作失败')
            }
        })

    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || '操作失败')
        }
    }
}

// 🔹 买家取消订单
const handleCancelOrder = async (orderNo: string) => {
    // 🔥 防御性检查
    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        console.error('❌ [Cancel Error] 接收到非法订单号:', orderNo)
        return
    }

    try {
        modalBox({
            type: 'error',
            title: '取消订单',
            message: '确定要取消该订单吗？取消后无法恢复'
        }).then(async () => {
            const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')

            if ((res as any)?.code === 200) {
                ElMessage.success('✅ 订单已取消')
                fetchOrders()
            } else {
                ElMessage.error((res as any)?.msg || '取消失败')
            }
        })


        
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
:deep(.el-tabs--left .el-tabs__header.is-left) {
    margin-right: 20px;
}
</style>