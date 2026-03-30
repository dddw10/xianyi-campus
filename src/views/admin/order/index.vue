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
                    <el-input
                        v-model="filters.keyword"
                        placeholder="搜索订单号/商品/买卖方学号"
                        clearable
                        @keyup.enter="handleSearch"
                    />
                </el-col>
                <el-col :xs="24" :md="8" :lg="4">
                    <el-select
                        v-model="filters.status"
                        placeholder="订单状态"
                        clearable
                        class="w-full"
                        @change="handleSearch"
                    >
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

        <div class="flex-1 flex flex-col min-h-0">
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
                        ¥{{ formatPrice(getPaidAmount(row)) }}
                    </template>
                </el-table-column>

                <el-table-column label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="申诉状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getAppealStatusType(getAppealStatus(row))" size="small" effect="plain">
                            {{ getAppealStatusText(getAppealStatus(row)) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" width="170" align="center">
                    <template #default="{ row }">
                        {{ getCreatedTime(row) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="100" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openDetail(row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.limit"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                class="mt-4"
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
            />
        </div>

        <el-dialog
            v-model="showDetailDialog"
            title="订单详情"
            class="w-90% md:w-55% mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl"
            :close-on-click-modal="false"
        >
            <div v-if="detailLoading" class="py-8">
                <el-skeleton :rows="8" animated />
            </div>

            <div v-else-if="currentOrder" class="space-y-4 text-sm">
                <el-card shadow="never">
                    <template #header>
                        <div class="font-medium">订单信息</div>
                    </template>
                    <div class="detail-grid">
                        <div><span class="detail-label">订单号：</span>{{ getOrderNo(currentOrder) }}</div>
                        <div>
                            <span class="detail-label">订单状态：</span>
                            <el-tag :type="getStatusType(currentOrder.status)" size="small" effect="plain">
                                {{ getStatusText(currentOrder.status) }}
                            </el-tag>
                        </div>
                        <div><span class="detail-label">商品：</span>{{ getProductTitle(currentOrder) }}</div>
                        <div><span class="detail-label">金额：</span>¥{{ formatPrice(getPaidAmount(currentOrder)) }}</div>
                        <div><span class="detail-label">买方学号：</span>{{ getBuyerStudentId(currentOrder) }}</div>
                        <div><span class="detail-label">卖方学号：</span>{{ getSellerStudentId(currentOrder) }}</div>
                        <div><span class="detail-label">创建时间：</span>{{ getCreatedTime(currentOrder) }}</div>
                        <div><span class="detail-label">支付时间：</span>{{ getPaymentTime(currentOrder) }}</div>
                        <div>
                            <span class="detail-label">申诉状态：</span>
                            <el-tag :type="getAppealStatusType(getAppealStatus(currentOrder))" size="small" effect="plain">
                                {{ getAppealStatusText(getAppealStatus(currentOrder)) }}
                            </el-tag>
                        </div>
                    </div>
                </el-card>

                <el-card v-if="currentDeliveryInfo" shadow="never">
                    <template #header>
                        <div class="font-medium">收货信息</div>
                    </template>
                    <div class="detail-grid">
                        <div><span class="detail-label">收货人：</span>{{ currentDeliveryInfo.name }}</div>
                        <div><span class="detail-label">电话：</span>{{ currentDeliveryInfo.phone }}</div>
                        <div class="detail-full"><span class="detail-label">地址：</span>{{ currentDeliveryInfo.address }}</div>
                    </div>
                </el-card>

                <el-card v-if="deliveryProofList.length || receiveProofList.length" shadow="never">
                    <template #header>
                        <div class="font-medium">交易凭证</div>
                    </template>

                    <div class="space-y-4">
                        <div>
                            <div class="detail-label mb-2">卖家发货凭证：</div>
                            <div v-if="deliveryProofList.length" class="proof-list">
                                <el-image
                                    v-for="(img, idx) in deliveryProofList"
                                    :key="`delivery-${idx}`"
                                    :src="img"
                                    :preview-src-list="deliveryProofList"
                                    class="proof-image"
                                    fit="cover"
                                />
                            </div>
                            <div v-else class="text-[var(--el-text-color-secondary)]">无</div>
                        </div>

                        <div>
                            <div class="detail-label mb-2">买家收货凭证：</div>
                            <div v-if="receiveProofList.length" class="proof-list">
                                <el-image
                                    v-for="(img, idx) in receiveProofList"
                                    :key="`receive-${idx}`"
                                    :src="img"
                                    :preview-src-list="receiveProofList"
                                    class="proof-image"
                                    fit="cover"
                                />
                            </div>
                            <div v-else class="text-[var(--el-text-color-secondary)]">无</div>
                        </div>
                    </div>
                </el-card>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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

const pickFirst = (row: any, keys: string[]) => {
    if (!row || typeof row !== 'object') return undefined
    for (const key of keys) {
        const value = key.split('.').reduce((acc: any, cur) => acc?.[cur], row)
        if (value === undefined || value === null) continue
        if (typeof value === 'string' && value.trim() === '') continue
        return value
    }
    return undefined
}

const normalizeText = (value: unknown, fallback = '-') => {
    if (value === undefined || value === null) return fallback
    const text = String(value).trim()
    return text || fallback
}

const normalizeStudentId = (value: unknown) => {
    const studentId = String(value ?? '').trim()
    return studentId || '-'
}

const getOrderNo = (row: any) => normalizeText(pickFirst(row, ['order_no', 'orderNo']))
const getProductTitle = (row: any) => normalizeText(pickFirst(row, ['product_title', 'productTitle', 'product.title']))

const getBuyerStudentId = (row: any) => normalizeStudentId(
    pickFirst(row, ['buyer_student_id', 'buyerStudentId', 'buyer_id', 'buyerId', 'buyer.student_id', 'buyer.studentId'])
)
const getSellerStudentId = (row: any) => normalizeStudentId(
    pickFirst(row, ['seller_student_id', 'sellerStudentId', 'seller_id', 'sellerId', 'seller.student_id', 'seller.studentId'])
)

const getPaidAmount = (row: any) => pickFirst(row, ['payment_amount', 'paymentAmount', 'amount', 'price'])

const formatPrice = (price: string | number | undefined) => {
    const num = Number(price)
    return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN', {
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

const getAppealStatus = (row: any) =>
    normalizeText(
        pickFirst(row, ['appeal_status', 'appealStatus', 'appeal.status']),
        'none'
    ).toLowerCase()

const getAppealStatusText = (status?: string) => {
    const map: Record<string, string> = {
        none: '无申诉',
        pending: '审核中',
        approved: '已通过',
        rejected: '已驳回'
    }
    return map[status || 'none'] || (status || '-')
}

const getAppealStatusType = (status?: string): 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
        none: 'info',
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    }
    return map[status || 'none'] || 'info'
}

const getCreatedTime = (row: any) => formatDate(pickFirst(row, ['created_at', 'createdAt']))
const getPaymentTime = (row: any) => formatDate(pickFirst(row, ['payment_time', 'paymentTime']))

const parseDeliveryFromText = (text: string) => {
    const rawText = text.trim()
    if (!rawText) return null

    // 兼容“收货人:xxx 电话:xxx 地址:xxx”文本
    const nameLabelMatch = rawText.match(/(?:收货人|联系人|姓名)[:：]\s*([^\s,，;；\n]+)/)
    const phoneLabelMatch = rawText.match(/(?:电话|手机号|手机|联系方式)[:：]\s*([0-9\-+() ]{6,20})/)
    const addressLabelMatch = rawText.match(/(?:地址|收货地址)[:：]\s*([\s\S]+)/)
    if (nameLabelMatch || phoneLabelMatch || addressLabelMatch) {
        const name = normalizeText(nameLabelMatch?.[1], '-')
        const phone = normalizeText(phoneLabelMatch?.[1], '-')
        const address = normalizeText(addressLabelMatch?.[1], '-')
        return { name, phone, address }
    }

    // 兼容“张三 13800138000 广东省深圳市...”文本
    const parts = rawText
        .split(/[\s,\uFF0C|\uFF5C]+/)
        .map(item => item.trim())
        .filter(Boolean)

    const phoneLike = (val: string) => /^(?:\+?\d[\d\-() ]{5,})$/.test(val)
    if (parts.length >= 3 && phoneLike(parts[1] ?? '')) {
        return {
            name: normalizeText(parts[0] ?? '', '-'),
            phone: normalizeText(parts[1] ?? '', '-'),
            address: normalizeText(parts.slice(2).join(' '), '-')
        }
    }
    if (parts.length === 2 && phoneLike(parts[1] ?? '')) {
        return {
            name: normalizeText(parts[0] ?? '', '-'),
            phone: normalizeText(parts[1] ?? '', '-'),
            address: '未填写详细地址'
        }
    }

    return { name: '-', phone: '-', address: rawText }
}

const parseDeliveryAddress = (value: unknown) => {
    if (value === undefined || value === null) return null

    if (typeof value === 'string') {
        const text = value.trim()
        if (!text) return null
        if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
            try {
                return parseDeliveryAddress(JSON.parse(text))
            } catch {
                return parseDeliveryFromText(text)
            }
        }
        return parseDeliveryFromText(text)
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
        return parseDeliveryFromText(String(value))
    }

    const raw = value as Record<string, any>
    const name = normalizeText(
        pickFirst(raw, [
            'name',
            'receiver',
            'receiverName',
            'consignee',
            'contact',
            'contactName',
            'realName'
        ]),
        '-'
    )
    const phone = normalizeText(
        pickFirst(raw, [
            'phone',
            'mobile',
            'receiverPhone',
            'tel',
            'telephone',
            'contactPhone'
        ]),
        '-'
    )

    const province = normalizeText(pickFirst(raw, ['province', 'state']), '')
    const city = normalizeText(pickFirst(raw, ['city']), '')
    const district = normalizeText(pickFirst(raw, ['district', 'area']), '')
    const street = normalizeText(
        pickFirst(raw, [
            'address',
            'detail',
            'detailAddress',
            'fullAddress',
            'receiverAddress',
            'street'
        ]),
        ''
    )
    const mergedAddress = [province, city, district, street].filter(Boolean).join(' ')
    const address = normalizeText(mergedAddress || pickFirst(raw, ['addressText']), '-')

    if (name === '-' && phone === '-' && address === '-') {
        return parseDeliveryFromText(JSON.stringify(raw))
    }
    return { name, phone, address }
}

const normalizeImageList = (value: unknown): string[] => {
    if (value === undefined || value === null) return []
    if (Array.isArray(value)) {
        return value
            .map(item => String(item ?? '').trim())
            .filter(Boolean)
    }

    if (typeof value === 'string') {
        const text = value.trim()
        if (!text) return []
        if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
            try {
                return normalizeImageList(JSON.parse(text))
            } catch {
                return [text]
            }
        }
        return [text]
    }

    if (typeof value === 'object') {
        const raw = value as Record<string, any>
        if (raw.url) return normalizeImageList(raw.url)
        if (raw.image) return normalizeImageList(raw.image)
        if (raw.images) return normalizeImageList(raw.images)
    }

    return []
}

const currentDeliveryInfo = computed(() =>
    parseDeliveryAddress(pickFirst(currentOrder.value, ['delivery_address', 'deliveryAddress']))
)

const deliveryProofList = computed(() =>
    normalizeImageList(pickFirst(currentOrder.value, ['delivery_proof', 'deliveryProof']))
)

const receiveProofList = computed(() =>
    normalizeImageList(pickFirst(currentOrder.value, ['receive_proof', 'receiveProof']))
)

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
            pagination.total = Number(res.data?.pagination?.total ?? 0)
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

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 20px;
}

.detail-full {
    grid-column: 1 / -1;
}

.detail-label {
    color: var(--el-text-color-secondary);
}

.proof-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.proof-image {
    width: 96px;
    height: 96px;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .detail-full {
        grid-column: auto;
    }
}
</style>
