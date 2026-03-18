<!-- src/views/orders/OrderDetail.vue -->
<template>
    <div class="min-h-screen bg-[--bg-color] py-8">
        <div class="max-w-4xl mx-auto px-4">

            <!-- 🔹 顶部导航 -->
            <div class="mb-6 flex items-center gap-3">
                <el-button @click="$router.back()" circle class="!w-8 !h-8 !p-0">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">订单详情</h1>
                <el-tag v-if="order" :type="getStatusType(order.status)" class="ml-auto">
                    {{ getStatusText(order.status) }}
                </el-tag>
            </div>

            <!-- 🔹 加载状态 -->
            <div v-if="loading" class="flex justify-center py-20">
                <el-skeleton :rows="10" animated />
            </div>

            <!-- 🔹 主要内容 -->
            <div v-else-if="order" class="space-y-6">

                <!-- 1. 状态进度条 -->
                <div class="bg-[--bg-elevated] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <el-steps :active="getStepActive(order.status)" align-center finish-status="success">
                        <el-step title="下单" :description="formatDate(order.created_at || order.createdAt)" />
                        <el-step title="付款"
                            :description="order.payment_time || order.paymentTime ? formatDate(order.payment_time || order.paymentTime) : '待支付'" />
                        <el-step title="发货"
                            :description="['trading', 'completed'].includes(order.status) ? '已发货' : '待发货'" />
                        <el-step title="完成" :description="order.status === 'completed' ? '交易成功' : '进行中'" />
                    </el-steps>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <!-- 🔸 左侧：主要信息 -->
                    <div class="lg:col-span-2 space-y-6">

                        <!-- 2. 商品信息 -->
                        <div
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <el-icon>
                                    <ShoppingCart />
                                </el-icon> 商品信息
                            </h2>
                            <div class="flex gap-4">
                                <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <el-image :src="getProductImage()" fit="cover" class="w-full h-full">
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
                                    <div>
                                        <h3 class="text-gray-800 dark:text-gray-200 font-medium line-clamp-2 mb-1">
                                            {{ order.product_title || order.productTitle || '未知商品' }}
                                        </h3>
                                        <p class="text-xs text-gray-500">
                                            分类：{{ order.product_category || order.category || '未知' }}
                                        </p>
                                    </div>
                                    <div class="flex justify-between items-end">
                                        <span class="text-orange-500 font-bold text-lg">¥{{ formatPrice(order.price ||
                                            order.product_price) }}</span>
                                        <span class="text-xs text-gray-400">x{{ order.quantity || 1 }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. 收货地址 & 备注 -->
                        <div
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <el-icon>
                                    <Location />
                                </el-icon> 收货信息
                            </h2>

                            <div
                                class="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-400 break-all font-mono">
                                原始数据: {{ order.deliveryAddress || order.delivery_address || 'NULL' }}
                            </div>

                            <div v-if="order.deliveryAddress || order.delivery_address" class="space-y-3 text-sm">
                                <div class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">收货人：</span>
                                    <span class="text-gray-800 dark:text-gray-200">{{ parseAddress(order.deliveryAddress
                                        ||
                                        order.delivery_address).name }}</span>
                                </div>
                                <div class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">电话：</span>
                                    <span class="text-gray-800 dark:text-gray-200">{{ parseAddress(order.deliveryAddress
                                        ||
                                        order.delivery_address).phone }}</span>
                                </div>
                                <div class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">地址：</span>
                                    <span class="text-gray-800 dark:text-gray-200">{{ parseAddress(order.deliveryAddress
                                        ||
                                        order.delivery_address).address }}</span>
                                </div>

                                <div v-if="order.buyer_remark || order.buyerRemark"
                                    class="pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
                                    <span class="text-gray-500 block mb-1">买家留言：</span>
                                    <p
                                        class="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                                        {{ order.buyer_remark || order.buyerRemark }}
                                    </p>
                                </div>
                            </div>

                            <div v-else class="text-center py-6 text-gray-400">
                                <el-icon class="text-3xl mb-2">
                                    <Location />
                                </el-icon>
                                <p class="text-sm">暂无收货信息</p>
                            </div>
                        </div>

                        <!-- 4. 订单编号与时间 -->
                        <div
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-sm">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <span class="text-gray-500">订单编号</span>
                                    <p class="text-gray-800 dark:text-gray-200 font-mono mt-1">{{ order.order_no ||
                                        order.orderNo }}</p>
                                </div>
                                <div>
                                    <span class="text-gray-500">创建时间</span>
                                    <p class="text-gray-800 dark:text-gray-200 mt-1">{{ formatDate(order.created_at ||
                                        order.createdAt) }}</p>
                                </div>
                                <div v-if="order.payment_time || order.paymentTime">
                                    <span class="text-gray-500">支付时间</span>
                                    <p class="text-gray-800 dark:text-gray-200 mt-1">{{ formatDate(order.payment_time ||
                                        order.paymentTime) }}
                                    </p>
                                </div>
                                <div>
                                    <span class="text-gray-500">支付方式</span>
                                    <p class="text-gray-800 dark:text-gray-200 mt-1 capitalize">{{ order.payment_method
                                        || order.paymentMethod
                                        || '未支付' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- 🔥 新增：展示交易凭证 (如果有) -->
                        <div v-if="order.delivery_proof || order.receive_proof"
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <el-icon>
                                    <Picture />
                                </el-icon> 交易凭证
                            </h2>
                            <div class="grid grid-cols-2 gap-4">
                                <div v-if="order.delivery_proof">
                                    <p class="text-xs text-gray-500 mb-2">📦 发货凭证</p>
                                    <el-image :src="order.delivery_proof" :preview-src-list="[order.delivery_proof]"
                                        class="w-full h-32 rounded-lg border object-cover" />
                                </div>
                                <div v-if="order.receive_proof">
                                    <p class="text-xs text-gray-500 mb-2">✅ 收货凭证</p>
                                    <el-image :src="order.receive_proof" :preview-src-list="[order.receive_proof]"
                                        class="w-full h-32 rounded-lg border object-cover" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- 🔸 右侧：操作栏 -->
                    <div class="lg:col-span-1">
                        <div
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-6">

                            <!-- 金额汇总 -->
                            <div class="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>商品金额</span>
                                    <span>¥{{ formatPrice(order.price || order.product_price) }}</span>
                                </div>
                                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>运费</span>
                                    <span>{{ order.shipping_fee ? `¥${order.shipping_fee}` : '免运费' }}</span>
                                </div>
                                <div class="flex justify-between items-center pt-3">
                                    <span class="text-gray-800 dark:text-gray-200 font-medium">实付金额</span>
                                    <span class="text-orange-500 font-bold text-2xl">¥{{
                                        formatPrice(order.payment_amount || order.price)
                                        }}</span>
                                </div>
                            </div>

                            <!-- 动态操作按钮 -->
                            <div class="space-y-3">

                                <!-- 🔹 待付款 (买家) -->
                                <template v-if="order.status === 'pending' && isBuyer">
                                    <el-button type="primary" size="large" class="w-full !rounded-full"
                                        @click="handlePay">
                                        💳 立即支付
                                    </el-button>
                                    <el-button type="danger" plain size="default" class="w-full !rounded-full"
                                        @click="handleCancel">
                                        取消订单
                                    </el-button>
                                </template>

                                <!-- 🔹 待发货 (卖家) -> 🔥 修改为打开弹窗 -->
                                <template v-else-if="order.status === 'paid' && isSeller">
                                    <el-button type="success" size="large" class="w-full !rounded-full"
                                        @click="showDeliverDialog = true">
                                        🚚 确认发货
                                    </el-button>
                                    <div class="text-xs text-center text-gray-400 mt-2">
                                        ⚠️ 需上传打包/交易照片
                                    </div>
                                </template>

                                <!-- 🔹 待收货 (买家) -> 🔥 修改为打开弹窗 -->
                                <template v-else-if="order.status === 'trading' && isBuyer">
                                    <el-button type="success" size="large" class="w-full !rounded-full"
                                        @click="showReceiveDialog = true">
                                        ✅ 确认收货
                                    </el-button>
                                    <div class="text-xs text-center text-gray-400 mt-2">
                                        ⚠️ 需上传商品实拍照片
                                    </div>
                                </template>

                                <!-- 🔹 已结束 -->
                                <template v-else-if="['completed', 'cancelled', 'refunded'].includes(order.status)">
                                    <el-button type="info" plain size="default" class="w-full !rounded-full" disabled>
                                        交易已结束
                                    </el-button>
                                </template>

                                <!-- 🔹 其他 -->
                                <template v-else>
                                    <el-button type="info" plain size="default" class="w-full !rounded-full" disabled>
                                        暂无操作
                                    </el-button>
                                </template>

                            </div>

                            <!-- 联系客服 -->
                            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                                <el-button link type="primary" size="small" @click="handleContact">
                                    📞 联系{{ isBuyer ? '卖家' : '买家' }}
                                </el-button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <!-- 🔹 404 状态 -->
            <div v-else-if="!loading && !order" class="text-center py-20">
                <el-empty description="订单不存在或无权查看" />
                <el-button @click="$router.push('/orders')" type="primary" round>
                    返回订单列表
                </el-button>
            </div>

            <!-- 🔥🔥🔥 新增：发货凭证上传弹窗 -->
            <el-dialog v-model="showDeliverDialog" title="确认发货" width="500px" :close-on-click-modal="false">
                <div class="space-y-4">
                    <el-alert title="请上传打包或交易照片作为凭证" type="warning" :closable="false" show-icon />

                    <!-- ✅ 使用高级上传组件 -->
                    <AdvancedImageUpload v-model="deliverImageList" :limit="1" :width="200"
                        upload-url="/api/upload/trade-proof" />

                    <p class="text-xs text-gray-500 text-center">仅支持 JPG/PNG，大小不超过 5MB</p>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="closeDeliverDialog">取消</el-button>
                        <el-button type="success" :loading="submitting" @click="submitDeliver"
                            :disabled="deliverImageList.length === 0">
                            确认发货
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- 🔥🔥🔥 新增：收货凭证上传弹窗 -->
            <el-dialog v-model="showReceiveDialog" title="确认收货" width="500px" :close-on-click-modal="false">
                <div class="space-y-4">
                    <el-alert title="请上传收到商品的实拍照片作为凭证" type="success" :closable="false" show-icon />

                    <!-- ✅ 使用高级上传组件 -->
                    <AdvancedImageUpload v-model="receiveImageList" :limit="1" :width="200"
                        upload-url="/api/upload/trade-proof" />

                    <p class="text-xs text-gray-500 text-center">仅支持 JPG/PNG，大小不超过 5MB</p>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="closeReceiveDialog">取消</el-button>
                        <el-button type="success" :loading="submitting" @click="submitReceive"
                            :disabled="receiveImageList.length === 0">
                            确认收货
                        </el-button>
                    </span>
                </template>
            </el-dialog>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ShoppingCart, Location, Picture } from '@element-plus/icons-vue'
import orderApi from '@/api/order'
import { useUserStore } from '@/stores/modules/user'
// 🔥 引入高级上传组件
import AdvancedImageUpload from '@/components/AdvanceImageUpload.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const order = ref<any>(null)
const submitting = ref(false)

// 🔥 新增：弹窗控制与图片列表
const showDeliverDialog = ref(false)
const showReceiveDialog = ref(false)
const deliverImageList = ref<string[]>([])
const receiveImageList = ref<string[]>([])

// 🔹 计算属性：判断角色
const isBuyer = computed(() => {
    return order.value && (order.value.buyer_id === userStore.userInfo?.id || order.value.buyerId === userStore.userInfo?.id)
})
const isSeller = computed(() => {
    return order.value && (order.value.seller_id === userStore.userInfo?.id || order.value.sellerId === userStore.userInfo?.id)
})

// 🔹 获取订单详情
const fetchOrderDetail = async () => {
    loading.value = true
    const orderNo = route.params.orderNo as string
    if (!orderNo) { ElMessage.error('缺少订单号'); loading.value = false; return }

    try {
        const res = await orderApi.getOrderDetail(orderNo)
        if ((res as any)?.code === 200) {
            order.value = res.data
        } else {
            ElMessage.error((res as any)?.msg || '订单不存在')
            order.value = null
        }
    } catch (error: any) {
        console.error('❌ 获取订单详情失败:', error)
        if (error?.response?.status !== 404) {
            ElMessage.error(error?.response?.data?.msg || '加载失败')
        }
        order.value = null
    } finally {
        loading.value = false
    }
}

// 🔹 工具函数
const formatPrice = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '0.00'
    const num = typeof val === 'string' ? parseFloat(val) : val
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', { hour12: false })
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: '待付款', paid: '待发货', trading: '待收货',
        completed: '已完成', cancelled: '已取消', refunded: '已退款'
    }
    return map[status] || status
}

const getStatusType = (status: string) => {
    const map: Record<string, any> = {
        pending: 'warning', paid: 'primary', trading: 'primary',
        completed: 'success', cancelled: 'info', refunded: 'info'
    }
    return map[status] || 'info'
}

const getStepActive = (status: string) => {
    if (status === 'pending') return 0
    if (status === 'paid') return 1
    if (status === 'trading') return 2
    if (status === 'completed') return 3
    return 0
}

const getProductImage = () => {
    if (!order.value) return ''
    if (order.value.images && Array.isArray(order.value.images) && order.value.images.length > 0) {
        return order.value.images[0]
    }
    if (order.value.product_images) {
        try {
            const imgs = JSON.parse(order.value.product_images)
            return Array.isArray(imgs) ? imgs[0] : imgs
        } catch { return order.value.product_images }
    }
    return ''
}

const parseAddress = (addr?: string) => {
    if (!addr || addr.trim() === '') return { name: '-', phone: '-', address: '未填写' }
    const trimAddr = addr.trim()
    let parts = trimAddr.split(/\s+/)
    if (parts.length === 1) parts = trimAddr.split(/,|,|\|/)
    if (parts.length >= 3) return { name: parts[0], phone: parts[1], address: parts.slice(2).join(' ') }
    if (parts.length === 2) return { name: parts[0], phone: parts[1], address: '未填写详细地址' }
    return { name: '未知', phone: '未知', address: trimAddr }
}

// 🔹 操作处理
const handlePay = () => {
    if (!order.value) return
    router.push(`/pay/${order.value.order_no || order.value.orderNo}`)
}

const handleCancel = async () => {
    if (!order.value) return
    try {
        await ElMessageBox.confirm('确定取消订单吗？', '提示', { type: 'warning' })
        const res = await orderApi.updateOrderStatus(order.value.order_no || order.value.orderNo, 'cancelled')
        if ((res as any)?.code === 200) { ElMessage.success('订单已取消'); fetchOrderDetail() }
    } catch (e: any) { if (e !== 'cancel') ElMessage.error(e.message || '取消失败') }
}

// 🔥 修改：打开/关闭发货弹窗
const showDeliverDialogOpen = () => { showDeliverDialog.value = true; deliverImageList.value = [] }
const closeDeliverDialog = () => { showDeliverDialog.value = false; deliverImageList.value = [] }

// 🔥 修改：打开/关闭收货弹窗
const showReceiveDialogOpen = () => { showReceiveDialog.value = true; receiveImageList.value = [] }
const closeReceiveDialog = () => { showReceiveDialog.value = false; receiveImageList.value = [] }

// 🔥 新增：提交发货 (带凭证)
const submitDeliver = async () => {
    const proofImage = deliverImageList.value[0]
    if (!proofImage) { ElMessage.warning('请先上传发货凭证'); return }

    submitting.value = true
    try {
        // 🔥 传入 proofImage 参数
        const res = await orderApi.updateOrderStatus(
            order.value.order_no || order.value.orderNo,
            'trading',
            proofImage
        )
        if ((res as any)?.code === 200) {
            ElMessage.success('发货成功')
            closeDeliverDialog()
            fetchOrderDetail()
        }
    } catch (e: any) {
        ElMessage.error(e.message || '发货失败')
    } finally {
        submitting.value = false
    }
}

// 🔥 新增：提交收货 (带凭证)
const submitReceive = async () => {
    const proofImage = receiveImageList.value[0]
    if (!proofImage) { ElMessage.warning('请先上传收货凭证'); return }

    submitting.value = true
    try {
        // 🔥 传入 proofImage 参数
        const res = await orderApi.updateOrderStatus(
            order.value.order_no || order.value.orderNo,
            'completed',
            proofImage
        )
        if ((res as any)?.code === 200) {
            ElMessage.success('收货成功，交易已完成')
            closeReceiveDialog()
            fetchOrderDetail()
        }
    } catch (e: any) {
        ElMessage.error(e.message || '操作失败')
    } finally {
        submitting.value = false
    }
}

// 🔥 绑定点击事件到打开函数
const handleDeliver = showDeliverDialogOpen
const handleConfirmReceive = showReceiveDialogOpen

const handleContact = () => { ElMessage.info('联系功能开发中...') }

onMounted(() => { fetchOrderDetail() })
</script>

<style scoped>
:deep(.el-step__title) {
    font-size: 14px;
    font-weight: 600;
}

:deep(.el-step__description) {
    font-size: 12px;
    margin-top: 4px;
}
</style>