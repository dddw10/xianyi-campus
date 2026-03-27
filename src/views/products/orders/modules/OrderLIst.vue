<!-- src/views/products/orders/OrderList.vue -->
<template>
    <div class="space-y-4">
        <!--  加载状态 -->
        <div v-if="loading" class="flex justify-center py-10">
            <el-skeleton :rows="5" animated />
        </div>

        <!--  空状态 -->
        <el-empty v-else-if="!list || list.length === 0" :description="emptyText" />

        <!--  订单列表 -->
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

                <!-- 主体：商品信息 -->
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

                <!--  底部：操作按钮区 -->
                <div class="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">

                    <!--  申诉相关逻辑（已完成订单专属，买家/卖家都能看到） -->
                    <template v-if="order.status === 'completed'">
                        <!-- ✅ 未申诉：显示「去申诉」按钮（双方都能点） -->
                        <el-button v-if="!order.appeal_status || order.appeal_status === 'none'" size="small"
                            type="warning" plain @click.stop="handleAppeal(order)">
                            {{ isBuyerOrder(order) ? '发起申诉' : '对买家申诉' }}
                        </el-button>

                        <!-- 🕐 申诉中：显示状态标签（区分我的/对方的） -->
                        <el-tag v-else-if="order.appeal_status === 'pending'" size="small" type="warning"
                            effect="plain">
                            {{ isAppealFromMe(order) ? '我的申诉审核中' : '对方申诉审核中' }}
                        </el-tag>

                        <!-- ✅ 申诉通过：显示标签 + Tooltip -->
                        <el-tooltip v-else-if="order.appeal_status === 'approved'"
                            :content="order.admin_remark || '申诉已通过'" placement="top">
                            <el-tag size="small" type="success" effect="plain" class="cursor-pointer"
                                @click.stop="handleAppeal(order)">
                                {{ isAppealFromMe(order) ? '✓ 我的申诉通过' : '✓ 对方申诉通过' }}
                            </el-tag>
                        </el-tooltip>

                        <!-- ❌ 申诉驳回：显示标签 + Tooltip -->
                        <el-tooltip v-else-if="order.appeal_status === 'rejected'"
                            :content="isAppealFromMe(order) ? (order.admin_remark || '申诉已驳回') : '申诉已驳回'"
                            placement="top">
                            <el-tag size="small" type="info" effect="plain" class="cursor-pointer"
                                @click.stop="handleAppeal(order)">
                                {{ isAppealFromMe(order) ? '✗ 我的申诉驳回' : '✗ 对方申诉驳回' }}
                            </el-tag>
                        </el-tooltip>
                    </template>

                    <!--  动态操作按钮（根据状态和角色显示） -->

                    <!-- 1. 待付款 (pending)：买家可取消 + 支付 -->
                    <template v-if="order.status === 'pending' && isBuyerOrder(order)">
                        <el-button size="small" type="danger" plain @click.stop="handleCancel(order)">
                            取消订单
                        </el-button>
                        <el-button size="small" type="primary"
                            @click.stop="$router.push(`/pay/${order.order_no || order.orderNo}`)">
                            去支付
                        </el-button>
                    </template>

                    <!-- 2. 待发货 (paid)：买家可取消 / 卖家可取消或发货 -->
                    <template v-else-if="order.status === 'paid'">
                        <!--  买家：显示取消订单 -->
                        <template v-if="isBuyerOrder(order)">
                            <el-button size="small" type="danger" plain @click.stop="handleCancel(order)">
                                取消订单
                            </el-button>
                            <span class="text-xs text-gray-400 mr-2">等待卖家发货</span>
                        </template>

                        <!--  卖家：显示取消订单 + 等待提示 -->
                        <template v-else-if="isSellerOrder(order)">
                            <el-button size="small" type="danger" plain @click.stop="handleCancel(order)">
                                取消订单（卖家）
                            </el-button>
                            <!-- <span class="text-xs text-gray-400 mr-2">等待买家付款确认</span> -->
                        </template>
                    </template>

                    <!-- 3. 待收货 (trading)：买家确认收货 -->
                    <template v-else-if="order.status === 'trading' && isBuyerOrder(order)">
                        <el-button size="small" type="success" @click.stop="handleConfirm(order)">
                            确认收货
                        </el-button>
                    </template>

                    <!--  4. 已完成：显示「去评价」按钮（仅买家可评价） -->
                    <template v-if="order.status === 'completed' && isBuyerOrder(order)">
                        <div v-if="isOrderReviewed(order)" class="flex items-center gap-2 mr-1">
                            <el-tag size="small" type="success" effect="plain">已评价</el-tag>
                            <el-rate class="review-rate" :model-value="getOrderReviewRating(order)" disabled
                                allow-half />
                        </div>
                        <el-button v-else-if="!isReviewStatusLoading(order)" size="small" type="primary" plain
                            @click.stop="openReviewDialog(order)">
                            去评价
                        </el-button>
                        <el-tag v-else size="small" type="info" effect="plain">评价信息加载中</el-tag>
                    </template>

                    <!-- 5. 已取消/已退款：显示状态提示 -->
                    <template v-else-if="['cancelled', 'refunded'].includes(order.status)">
                        <span class="text-xs text-gray-400 mr-2">交易已结束</span>
                    </template>

                    <!--  公共按钮：查看详情（所有状态都显示） -->
                    <el-button size="small" plain
                        @click.stop="$router.push(`/orders/${order.order_no || order.orderNo}`)">
                        查看详情
                    </el-button>
                </div>
            </div>

            <!--  分页 -->
            <div v-if="pagination.total > pagination.limit" class="flex justify-center mt-6">
                <el-pagination v-model:current-page="currentPage" :page-size="pagination.limit"
                    :total="pagination.total" layout="prev, pager, next" @current-change="handlePageChangeInternal" />
            </div>
        </div>

        <!--  评价订单弹窗（新增） -->
        <OrderReview v-model:visible="showReviewDialog" :order-no="currentReviewOrderNo"
            @submitted="handleReviewSubmitted" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { modalBox } from '@/components/messageBox/modalBox'
import orderApi from '@/api/order'

//  导入评价组件
import OrderReview from '@/components/OrderReview.vue'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()

// ============================================================================
//  类型定义
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

    //  申诉相关字段
    appeal_status?: 'none' | 'pending' | 'approved' | 'rejected'
    appeal_reason?: string
    appeal_images?: string[]
    appeal_updated_at?: string
    admin_remark?: string
    appeal_user_id?: string | number
    appealUserId?: string | number
    appeal_by_user_id?: string | number
    appealByUserId?: string | number
    appeal_initiator_id?: string | number
    appealInitiatorId?: string | number
    appeal_uid?: string | number
    appeal_role?: string
    appealRole?: string
    appeal_from_role?: string
    appealFromRole?: string
    appeal_from?: string
    appealFrom?: string

    [key: string]: any
}

// ============================================================================
//  Props & Emits
// ============================================================================
const props = defineProps<{
    list: OrderItem[]
    loading: boolean
    pagination: { page: number; limit: number; total: number }
    emptyText: string
    listType: string  // 'bought' | 'sold' | 'published' 等
    appealOwnerHints?: Record<string, 'me' | 'other'>
}>()

const emit = defineEmits<{
    (e: 'page-change', page: number): void
    (e: 'refresh-list'): void
    (e: 'confirm-receive', orderNo: string): void
    (e: 'cancel-order', orderNo: string): void
    (e: 'appeal-order', orderNo: string | undefined): void
}>()

// ============================================================================
//  响应式数据（评价相关）
// ============================================================================
const showReviewDialog = ref(false)
const currentReviewOrderNo = ref<string>('')
type ReviewStatus = { reviewed: boolean; rating: number | null }
const reviewStatusMap = ref<Record<string, ReviewStatus>>({})
const reviewLoadingMap = ref<Record<string, boolean>>({})
let reviewSyncVersion = 0

// ============================================================================
//  计算属性 & 工具函数
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
//  角色判断函数（关键修复：根据 listType 推断角色）
// ============================================================================

//  判断当前订单是否是"我买的"
const isBuyerOrder = (order: OrderItem) => {
    //  如果当前页面是「我买到的」，直接认为当前用户是买家
    if (props.listType === 'bought') {
        return true
    }

    //  否则从订单数据判断
    const uid = userStore.userInfo?.id
    if (!uid) return false

    const userIdStr = String(uid).trim()

    //  尝试获取买家 ID（兼容多种字段名）
    const buyerFields = ['buyer_id', 'buyerId', 'buyer', 'buyerID']
    for (const field of buyerFields) {
        const value = (order as any)[field]
        if (value != null && String(value).trim() === userIdStr) {
            return true
        }
    }

    return false
}

//  判断当前订单是否是"我卖的"
const isSellerOrder = (order: OrderItem) => {
    //  如果当前页面是「我卖出的」，直接认为当前用户是卖家
    if (props.listType === 'sold') {
        return true
    }

    //  否则从订单数据判断
    const uid = userStore.userInfo?.id
    if (!uid) return false

    const userIdStr = String(uid).trim()

    //  尝试获取卖家 ID（兼容多种字段名）
    const sellerFields = ['seller_id', 'sellerId', 'seller', 'sellerID']
    for (const field of sellerFields) {
        const value = (order as any)[field]
        if (value != null && String(value).trim() === userIdStr) {
            return true
        }
    }

    return false
}

//  判断申诉是否由当前用户发起（申诉由买家发起）
const getAppealInitiatorUserId = (order: OrderItem): string => {
    const idFields = [
        'appeal_user_id',
        'appealUserId',
        'appeal_by_user_id',
        'appealByUserId',
        'appeal_initiator_id',
        'appealInitiatorId',
        'appeal_uid'
    ]


    for (const field of idFields) {
        const value = (order as any)[field]
        if (value != null && String(value).trim()) {
            return String(value).trim()
        }
    }

    return ''
}

const normalizeAppealRole = (value: unknown): 'buyer' | 'seller' | '' => {
    if (value == null) return ''

    const role = String(value).trim().toLowerCase()
    if (!role) return ''

    if (role === 'buyer' || role === 'buy' || role === 'purchaser' || role === '\u4e70\u5bb6') return 'buyer'
    if (role === 'seller' || role === 'sell' || role === 'merchant' || role === 'vendor' || role === '\u5356\u5bb6') return 'seller'
    if (role.includes('buyer') || role.includes('\u4e70\u5bb6')) return 'buyer'
    if (role.includes('seller') || role.includes('\u5356\u5bb6')) return 'seller'

    return ''
}

const getAppealInitiatorRole = (order: OrderItem): 'buyer' | 'seller' | '' => {
    const roleFields = [
        'appeal_role',
        'appealRole',
        'appeal_from_role',
        'appealFromRole',
        'appeal_from',
        'appealFrom'
    ]

    for (const field of roleFields) {
        const normalizedRole = normalizeAppealRole((order as any)[field])
        if (normalizedRole) {
            return normalizedRole
        }
    }

    return ''
}

type AppealOwnerDetected = 'me' | 'other' | 'unknown'

const getAppealScopeObjects = (order: OrderItem): any[] => {
    const scopes: any[] = [order]
    const nestedFields = ['appeal', 'appeal_info', 'appealInfo', 'appeal_detail', 'appealDetail']
    for (const field of nestedFields) {
        const value = (order as any)[field]
        if (value && typeof value === 'object') {
            scopes.push(value)
        }
    }
    return scopes
}

const getFieldValueByNames = (target: any, fieldNames: string[]): string => {
    if (!target || typeof target !== 'object') return ''
    for (const field of fieldNames) {
        const value = target[field]
        if (value != null && String(value).trim()) {
            return String(value).trim()
        }
    }
    return ''
}

const getFieldValueByKeyPattern = (target: any, pattern: RegExp): string => {
    if (!target || typeof target !== 'object') return ''
    for (const key of Object.keys(target)) {
        if (!pattern.test(key)) continue
        const value = target[key]
        if (value != null && String(value).trim()) {
            return String(value).trim()
        }
    }
    return ''
}

const getResolvedAppealInitiatorUserId = (order: OrderItem): string => {
    const scopes = getAppealScopeObjects(order)
    for (const scope of scopes) {
        const isRoot = scope === order
        const exactFields = isRoot
            ? [
                'appeal_user_id',
                'appealUserId',
                'appeal_by_user_id',
                'appealByUserId',
                'appeal_initiator_id',
                'appealInitiatorId',
                'appeal_uid'
            ]
            : [
                'user_id',
                'userId',
                'uid',
                'from_user_id',
                'fromUserId',
                'initiator_id',
                'initiatorId',
                'creator_id',
                'creatorId',
                'appellant_id',
                'appellantId',
                'appealer_id',
                'appealerId',
                'apply_user_id',
                'applyUserId',
                'appeal_user_id',
                'appealUserId'
            ]

        const exact = getFieldValueByNames(scope, exactFields)
        if (exact) return exact

        const fuzzy = isRoot
            ? getFieldValueByKeyPattern(scope, /(appeal|initiator|appellant|appealer|creator).*(user|uid|member).*(id)?$/i)
            : (
                getFieldValueByKeyPattern(scope, /^(from_)?(user|uid|member)_?id$/i) ||
                getFieldValueByKeyPattern(scope, /^(initiator|creator|appellant|appealer)_?id$/i) ||
                getFieldValueByKeyPattern(scope, /(appeal).*(user|uid|member).*(id)?$/i)
            )

        if (fuzzy) return fuzzy
    }
    return ''
}

const getResolvedAppealInitiatorRole = (order: OrderItem): 'buyer' | 'seller' | '' => {
    const scopes = getAppealScopeObjects(order)
    for (const scope of scopes) {
        const isRoot = scope === order
        const exactFields = isRoot
            ? [
                'appeal_role',
                'appealRole',
                'appeal_from_role',
                'appealFromRole',
                'appeal_from',
                'appealFrom'
            ]
            : [
                'role',
                'from_role',
                'fromRole',
                'initiator_role',
                'initiatorRole',
                'appealer_role',
                'appealerRole',
                'appellant_role',
                'appellantRole',
                'user_role',
                'userRole',
                'appeal_role',
                'appealRole',
                'party',
                'side'
            ]

        for (const field of exactFields) {
            const normalized = normalizeAppealRole(scope[field])
            if (normalized) return normalized
        }

        const fuzzyRole = isRoot
            ? normalizeAppealRole(getFieldValueByKeyPattern(scope, /(appeal|initiator|appellant|appealer|creator).*(role|from|side|party)$/i))
            : normalizeAppealRole(getFieldValueByKeyPattern(scope, /(^role$|_role$|^from$|^from_role$|^side$|^party$)/i))

        if (fuzzyRole) return fuzzyRole
    }
    return ''
}

const getResolvedAppealOwner = (order: OrderItem): AppealOwnerDetected => {
    if (order.appeal_status == null || order.appeal_status === 'none') return 'unknown'

    const orderNo = String(order.order_no || order.orderNo || '').trim()
    const hintedOwner = orderNo ? props.appealOwnerHints?.[orderNo] : undefined
    if (hintedOwner === 'me' || hintedOwner === 'other') {
        return hintedOwner
    }

    const currentUserId = String(userStore.userInfo?.id ?? '').trim()
    if (!currentUserId) return 'unknown'

    const initiatorUserId = getResolvedAppealInitiatorUserId(order)
    if (initiatorUserId) {
        return initiatorUserId === currentUserId ? 'me' : 'other'
    }

    const initiatorRole = getResolvedAppealInitiatorRole(order)
    if (initiatorRole === 'buyer') return isBuyerOrder(order) ? 'me' : 'other'
    if (initiatorRole === 'seller') return isSellerOrder(order) ? 'me' : 'other'

    return 'unknown'
}

const isAppealFromMe = (order: OrderItem) => {
    const resolvedOwner = getResolvedAppealOwner(order)
    if (resolvedOwner === 'me') return true
    if (resolvedOwner === 'other') return false

    if (order.appeal_status && order.appeal_status !== 'none') {
        console.warn('⚠️ 申诉发起方字段缺失，可能存在历史脏数据', {
            orderNo: order.order_no || order.orderNo || order.id,
            appealStatus: order.appeal_status,
            appealKeys: Object.keys(order).filter((key) => key.toLowerCase().includes('appeal'))
        })
    }

    if (order.appeal_status == null || order.appeal_status === 'none') return false
    const currentUserId = String(userStore.userInfo?.id ?? '').trim()
    const initiatorUserId = getAppealInitiatorUserId(order)
    if (currentUserId && initiatorUserId) {
        return currentUserId === initiatorUserId
    }

    const initiatorRole = getAppealInitiatorRole(order)
    if (initiatorRole === 'buyer') {
        return isBuyerOrder(order)
    }
    if (initiatorRole === 'seller') {
        return isSellerOrder(order)
    }
    // fallback for old payload without initiator fields
    return isBuyerOrder(order)  // 申诉由买家发起，所以判断当前用户是否是买家
}

const normalizeOrderNo = (order: OrderItem) => String(order.order_no || order.orderNo || '').trim()

const normalizeRating = (value: any): number | null => {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) return null
    return Math.max(0, Math.min(5, num))
}

const parseReviewStatusFromOrder = (order: OrderItem): ReviewStatus => {
    const rating = normalizeRating(
        (order as any).review_rating ??
        (order as any).reviewRating ??
        (order as any).rating ??
        (order as any).score ??
        (order as any).stars
    )

    if (rating !== null) {
        return { reviewed: true, rating }
    }

    const reviewStatus = String((order as any).review_status ?? (order as any).reviewStatus ?? '').toLowerCase()
    if (['reviewed', 'done', 'submitted'].includes(reviewStatus)) {
        return { reviewed: true, rating: null }
    }

    const reviewFlagFields = ['isReviewed', 'is_reviewed', 'hasReview', 'has_review', 'reviewed']
    for (const field of reviewFlagFields) {
        const value = (order as any)[field]
        if (value === true || value === 1 || value === '1' || value === 'true') {
            return { reviewed: true, rating: null }
        }
    }

    return { reviewed: false, rating: null }
}

const extractReviewListFromResponse = (res: any): any[] => {
    const payload = res?.data
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.list)) return payload.list
    if (Array.isArray(payload?.reviews)) return payload.reviews
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const parseReviewStatusFromApiResponse = (res: any): ReviewStatus => {
    const reviews = extractReviewListFromResponse(res)
    if (!reviews.length) return { reviewed: false, rating: null }

    const currentUserId = String(userStore.userInfo?.id || '').trim()
    const mine = reviews.find((review: any) => {
        const reviewerId = String(
            review?.reviewer_id ??
            review?.reviewerId ??
            review?.user_id ??
            review?.userId ??
            review?.buyer_id ??
            review?.buyerId ??
            ''
        ).trim()
        return currentUserId && reviewerId === currentUserId
    }) || reviews[0]

    const rating = normalizeRating(mine?.rating ?? mine?.score ?? mine?.stars)
    return { reviewed: true, rating }
}

const getReviewStatus = (order: OrderItem): ReviewStatus => {
    const orderNo = normalizeOrderNo(order)
    if (orderNo && reviewStatusMap.value[orderNo]) {
        return reviewStatusMap.value[orderNo]
    }
    return parseReviewStatusFromOrder(order)
}

const isOrderReviewed = (order: OrderItem) => getReviewStatus(order).reviewed
const getOrderReviewRating = (order: OrderItem) => getReviewStatus(order).rating ?? 0
const isReviewStatusLoading = (order: OrderItem) => {
    const orderNo = normalizeOrderNo(order)
    return orderNo ? !!reviewLoadingMap.value[orderNo] : false
}

const syncCompletedOrderReviews = async () => {
    const completedBuyerOrders = props.list.filter((order) => order.status === 'completed' && isBuyerOrder(order))
    const orderNos = Array.from(new Set(
        completedBuyerOrders
            .map((order) => normalizeOrderNo(order))
            .filter((orderNo) => !!orderNo)
    ))

    const nextReviewStatusMap: Record<string, ReviewStatus> = {}
    const orderNoToFetch: string[] = []

    for (const orderNo of orderNos) {
        const order = completedBuyerOrders.find((item) => normalizeOrderNo(item) === orderNo)
        if (!order) continue

        const fromOrder = parseReviewStatusFromOrder(order)
        if (fromOrder.reviewed) {
            nextReviewStatusMap[orderNo] = fromOrder
        } else {
            orderNoToFetch.push(orderNo)
        }
    }

    if (!orderNoToFetch.length) {
        reviewStatusMap.value = nextReviewStatusMap
        reviewLoadingMap.value = {}
        return
    }

    const loadingMap = { ...reviewLoadingMap.value }
    for (const orderNo of orderNoToFetch) {
        loadingMap[orderNo] = true
    }
    reviewLoadingMap.value = loadingMap

    const currentVersion = ++reviewSyncVersion
    const responses = await Promise.all(
        orderNoToFetch.map(async (orderNo) => {
            try {
                const res = await orderApi.getOrderReviews(orderNo)
                return { orderNo, status: parseReviewStatusFromApiResponse(res) }
            } catch (error) {
                console.warn('⚠️ 获取订单评价失败:', { orderNo, error })
                return { orderNo, status: { reviewed: false, rating: null } as ReviewStatus }
            }
        })
    )

    if (currentVersion !== reviewSyncVersion) return

    const nextLoadingMap: Record<string, boolean> = {}
    for (const orderNo of orderNoToFetch) {
        nextLoadingMap[orderNo] = false
    }
    reviewLoadingMap.value = nextLoadingMap

    for (const item of responses) {
        nextReviewStatusMap[item.orderNo] = item.status
    }
    reviewStatusMap.value = nextReviewStatusMap
}

watch(
    () => props.list,
    () => {
        void syncCompletedOrderReviews()
    },
    { immediate: true, deep: true }
)

// ============================================================================
//  事件处理函数
// ============================================================================
const handlePageChangeInternal = (page: number) => {
    emit('page-change', page)
}

//  确认收货
const handleConfirm = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo) {
        ElMessage.error('订单数据异常')
        return
    }
    router.push({
        path: `/orders/${orderNo}`,
        query: {
            openReceiveDialog: '1'
        }
    })
}

//  取消订单（买家或卖家都能调用，后端会校验权限）
const handleCancel = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        console.error('❌ [Cancel Error] 非法订单号:', orderNo)
        return
    }

    //  根据角色显示不同提示
    const isBuyer = isBuyerOrder(order)
    const confirmMessage = isBuyer
        ? '确定取消订单吗？取消后库存将自动归还，款项将原路退回。'
        : '⚠️ 卖家取消订单后将：\n• 库存自动归还商品\n• 订单状态变为「已取消」\n• 买家会收到取消通知\n\n确定要取消吗？'

    modalBox({
        type: 'error',
        title: isBuyer ? '提示' : '卖家取消订单',
        message: confirmMessage
    }).then(() => {
        console.log('🚀 [Cancel Action] 准备取消订单:', { orderNo, status: order.status, role: isBuyer ? 'buyer' : 'seller' })
        emit('cancel-order', orderNo)
    }).catch((action) => {
        if (action === 'cancel') {
            ElMessage.info('已取消操作')
        }
    })
}

//  申诉处理（买家或卖家都能发起）
const handleAppeal = (order: OrderItem) => {
    const orderNo = order.order_no || order.orderNo
    const appealStatus = order.appeal_status

    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        return
    }

    // 场景 1: 已申诉（通过/驳回）→ 直接打开弹窗查看结果
    if (appealStatus && appealStatus !== 'none' && appealStatus !== 'pending') {
        emit('appeal-order', orderNo)
        return
    }

    // 场景 2: 申诉审核中 → 提示等待
    if (appealStatus === 'pending') {
        ElMessage.info('🕐 申诉审核中，请耐心等待管理员处理')
        return
    }

    // 场景 3: 未申诉 → 二次确认后打开表单提交
    const isBuyer = isBuyerOrder(order)
    const appealTitle = isBuyer ? '发起申诉' : '对买家申诉'
    const appealMessage = isBuyer
        ? '提交申诉后，平台将在 48 小时内审核。请确保申诉理由真实有效，恶意申诉可能影响账号信用。'
        : '您将对买家发起申诉，平台将在 48 小时内审核。请确保申诉理由真实有效。'

    modalBox({
        type: 'info',
        title: appealTitle,
        message: appealMessage,
    }).then(() => {
        emit('appeal-order', orderNo)
    }).catch((action) => {
        if (action === 'cancel') {
            ElMessage.info('已取消申诉')
        }
    })
}

// ============================================================================
//  评价相关函数
// ============================================================================

//  打开评价弹窗（仅买家可评价）
const openReviewDialog = (order: OrderItem) => {
    if (isOrderReviewed(order)) {
        ElMessage.info('该订单已评价')
        return
    }

    if (isReviewStatusLoading(order)) {
        ElMessage.info('正在加载评价信息，请稍后重试')
        return
    }

    const orderNo = order.order_no || order.orderNo
    if (!orderNo) {
        ElMessage.error('订单数据异常')
        return
    }
    currentReviewOrderNo.value = orderNo
    showReviewDialog.value = true
}

//  评价提交成功后的回调
const handleReviewSubmitted = (payload?: { orderNo: string; rating: number }) => {
    const orderNo = String(payload?.orderNo || '').trim()
    if (orderNo) {
        reviewStatusMap.value = {
            ...reviewStatusMap.value,
            [orderNo]: {
                reviewed: true,
                rating: normalizeRating(payload?.rating)
            }
        }
    }

    emit('refresh-list')
    ElMessage.success('感谢您的评价！')
}
</script>

<style scoped>
/*  文本截断 */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/*  按钮悬停微交互 */
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

/*  状态标签微调 */
:deep(.el-tag--plain) {
    font-weight: 500;
}

:deep(.review-rate .el-rate__icon) {
    margin-right: 2px;
    font-size: 14px;
}
</style>
