<template>
    <div class="flex flex-col p-4 sm:p-6 space-y-6 h-full">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-[var(--el-text-color-primary)]">订单管理</h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">订单总数：{{ pagination.total }}</p>
            </div>
            <el-button type="primary" @click="fetchOrders">刷新列表</el-button>
        </div>

        <div class="w-full">
            <el-row :gutter="20">
                <el-col :xs="24" :md="8" :lg="5">
                    <el-input v-model="filters.keyword" placeholder="搜索订单号/商品/买卖方学号" clearable
                        @keyup.enter="handleSearch" />
                </el-col>
                <el-col :xs="24" :md="8" :lg="4">
                    <el-select v-model="filters.status" placeholder="订单状态" clearable class="w-full"
                        @change="handleSearch">
                        <el-option label="全部状态" value="" />
                        <el-option label="待付款" value="pending" />
                        <el-option label="待发货" value="paid" />
                        <el-option label="待收货" value="trading" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                        <el-option label="已退款" value="refunded" />
                    </el-select>
                </el-col>
                <el-col :xs="24" :md="8" :lg="5">
                    <el-row class="w-full">
                        <el-col :span="11">
                            <el-button type="primary" class="w-full" @click="handleSearch">搜索</el-button>
                        </el-col>
                        <el-col :span="2" />
                        <el-col :span="11">
                            <el-button class="w-full" @click="handleReset">重置</el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>

        <div class="flex-1 flex flex-col">
            <el-table v-loading="loading" :data="orderList" class="flex-1">
                <el-table-column prop="orderNo" label="订单号" min-width="200">
                    <template #default="{ row }">
                        <span class="font-mono text-blue-600">{{ getOrderNo(row) }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="productTitle" label="商品" min-width="180">
                    <template #default="{ row }">
                        <span class="line-clamp-1">{{ getProductTitle(row) }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="买方学号" min-width="120">
                    <template #default="{ row }">
                        {{ getBuyerStudentId(row) }}
                    </template>
                </el-table-column>

                <el-table-column label="卖方学号" min-width="120">
                    <template #default="{ row }">
                        {{ getSellerStudentId(row) }}
                    </template>
                </el-table-column>

                <el-table-column label="金额" width="110" align="center">
                    <template #default="{ row }">
                        ¥{{ formatPrice(row.payment_amount ?? row.amount) }}
                    </template>
                </el-table-column>

                <el-table-column label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" width="170" align="center">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at || row.createdAt) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="100" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openDetail(row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
                :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                @current-change="handleCurrentChange" @size-change="handleSizeChange" class="mt-4" />
        </div>

        <el-dialog v-model="showDetailDialog" title="订单详情"
            class="w-90% md:w-40%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" :close-on-click-modal="false">
            <div v-if="detailLoading" class="py-8">
                <el-skeleton :rows="8" animated />
            </div>
            <div v-else-if="currentOrder" class="space-y-3 text-sm">
                <div class="grid grid-cols-2 gap-3">
                    <div><span class="text-gray-500">订单号：</span>{{ getOrderNo(currentOrder) }}</div>
                    <div><span class="text-gray-500">状态：</span>{{ getStatusText(currentOrder.status) }}</div>
                    <div><span class="text-gray-500">商品：</span>{{ getProductTitle(currentOrder) }}</div>
                    <div><span class="text-gray-500">金额：</span>¥{{ formatPrice(currentOrder.payment_amount ??
                        currentOrder.amount) }}</div>
                    <div><span class="text-gray-500">买方学号：</span>{{ getBuyerStudentId(currentOrder) }}</div>
                    <div><span class="text-gray-500">卖方学号：</span>{{ getSellerStudentId(currentOrder) }}</div>
                    <div><span class="text-gray-500">创建时间：</span>{{ formatDate(currentOrder.created_at ||
                        currentOrder.createdAt) }}</div>
                    <div><span class="text-gray-500">支付时间：</span>{{ formatDate(currentOrder.payment_time ||
                        currentOrder.paymentTime) }}</div>
                </div>
                <div v-if="currentOrder.delivery_address || currentOrder.deliveryAddress">
                    <span class="text-gray-500">收货信息：</span>
                    <p class="mt-1 p-2 bg-gray-50 rounded break-all">
                        {{ currentOrder.delivery_address || currentOrder.deliveryAddress }}
                    </p>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import adminOrderApi from '@/api/admin/order'

const loading = ref(false)
const detailLoading = ref(false)
const showDetailDialog = ref(false)
const orderList = ref<any[]>([])
const currentOrder = ref<any>(null)

const filters = reactive({
    keyword: '',
    status: ''
})

const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

const getOrderNo = (row: any) => row?.order_no || row?.orderNo || '-'
const getProductTitle = (row: any) => row?.product_title || row?.productTitle || '-'
const normalizeStudentId = (value: unknown) => {
    const studentId = String(value ?? '').trim()
    return studentId || '-'
}
const getBuyerStudentId = (row: any) => normalizeStudentId(
    row?.buyer_student_id ??
    row?.buyerStudentId ??
    row?.buyer_id ??
    row?.buyerId ??
    row?.buyer?.student_id ??
    row?.buyer?.studentId
)
const getSellerStudentId = (row: any) => normalizeStudentId(
    row?.seller_student_id ??
    row?.sellerStudentId ??
    row?.seller_id ??
    row?.sellerId ??
    row?.seller?.student_id ??
    row?.seller?.studentId
)

const formatPrice = (price: string | number | undefined) => {
    const num = Number(price)
    return Number.isFinite(num) ? num.toFixed(2) : '0.00'
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
        pending: '待付款',
        paid: '待发货',
        trading: '待收货',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款'
    }
    return map[status || ''] || (status || '-')
}

const getStatusType = (status?: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
        pending: 'warning',
        paid: 'primary',
        trading: 'primary',
        completed: 'success',
        cancelled: 'info',
        refunded: 'info'
    }
    return map[status || ''] || 'info'
}

const fetchOrders = async () => {
    loading.value = true
    try {
        const res: any = await adminOrderApi.getOrderList({
            page: pagination.page,
            limit: pagination.limit,
            status: filters.status || undefined,
            keyword: filters.keyword.trim() || undefined
        })

        if (res?.code === 200) {
            orderList.value = res.data?.list || []
            pagination.total = res.data?.pagination?.total || 0
        } else {
            ElMessage.warning(res?.msg || '获取订单列表失败')
        }
    } catch (error: any) {
        console.error('❌ 获取订单列表失败:', error)
        ElMessage.error(error?.response?.data?.msg || '获取订单列表失败')
    } finally {
        loading.value = false
    }
}

const openDetail = async (row: any) => {
    currentOrder.value = row
    showDetailDialog.value = true

    const orderNo = String(getOrderNo(row)).trim()
    if (!orderNo || orderNo === '-') return

    detailLoading.value = true
    try {
        const res: any = await adminOrderApi.getOrderDetail(orderNo)
        if (res?.code === 200 && res?.data) {
            currentOrder.value = {
                ...row,
                ...res.data
            }
        }
    } catch (error) {
        console.warn('⚠️ 获取订单详情失败，使用列表数据兜底', error)
    } finally {
        detailLoading.value = false
    }
}

const handleSearch = () => {
    pagination.page = 1
    fetchOrders()
}

const handleReset = () => {
    filters.keyword = ''
    filters.status = ''
    pagination.page = 1
    fetchOrders()
}

const handleCurrentChange = (page: number) => {
    pagination.page = page
    fetchOrders()
}

const handleSizeChange = (limit: number) => {
    pagination.limit = limit
    pagination.page = 1
    fetchOrders()
}

onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
