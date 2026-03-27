<!-- src/views/orders/OrderDetail.vue -->
<template>
    <div class="min-h-screen bg-[--bg-color] py-8">
        <div class="max-w-4xl mx-auto px-4">
            <!--  顶部导航 -->
            <div class="mb-6 flex items-center gap-3">
                <el-button @click="router.back()" circle class="!w-8 !h-8 !p-0">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">订单详情</h1>
                <el-tag v-if="order" :type="getStatusType(order.status)" class="ml-auto">
                    {{ getStatusText(order.status) }}
                </el-tag>
            </div>

            <!--  加载状态 -->
            <div v-if="loading" class="flex justify-center py-20">
                <el-skeleton :rows="10" animated />
            </div>

            <!--  主要内容 -->
            <div v-else-if="order" class="space-y-6">
                <!-- 1. 状态进度条 -->
                <div class="bg-[--bg-elevated] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <el-steps :active="getStepActive(order.status)" align-center finish-status="success">
                        <el-step title="下单" :description="formatDate(order.created_at || order.createdAt)" />
                        <el-step title="支付"
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
                                        <p class="text-xs text-gray-500">分类：{{ order.product_category || order.category
                                            || '未知' }}</p>
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
                                    <p class="text-gray-800 dark:text-gray-200 font-mono mt-1 break-all truncate">
                                        {{
                                            order.order_no ||
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

                        <!--  展示交易凭证（如果有） -->
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
                                    <p class="text-xs text-gray-500 mb-2">📥 收货凭证</p>
                                    <el-image :src="order.receive_proof" :preview-src-list="[order.receive_proof]"
                                        class="w-full h-32 rounded-lg border object-cover" />
                                </div>
                            </div>
                        </div>

                        <!--  申诉信息展示（已完成订单 + 有申诉记录时显示） -->
                        <div v-if="order.status === 'completed' && order.appeal_status && order.appeal_status !== 'none'"
                            class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <el-icon>
                                    <Warning />
                                </el-icon>
                                {{ isAppealFromMe ? '我的申诉' : '对方申诉' }}
                                <el-tag :type="getAppealStatusType(order.appeal_status)" size="small" round>
                                    {{ getAppealStatusText(order.appeal_status) }}
                                </el-tag>
                            </h2>

                            <div class="space-y-3 text-sm">
                                <div class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">申诉方：</span>
                                    <span class="text-gray-800 dark:text-gray-200">
                                        {{ isAppealFromMe ? '我' : (isBuyer ? '卖家' : '买家') }}
                                    </span>
                                </div>

                                <div class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">申诉原因：</span>
                                    <span class="text-gray-800 dark:text-gray-200">{{ order.appeal_reason }}</span>
                                </div>

                                <div v-if="order.appeal_images?.length" class="flex gap-2">
                                    <span class="text-gray-500 w-16 flex-shrink-0">证据图片：</span>
                                    <div class="flex gap-2">
                                        <el-image v-for="(img, idx) in order.appeal_images" :key="idx" :src="img"
                                            :preview-src-list="order.appeal_images"
                                            class="w-16 h-16 rounded border object-cover cursor-pointer" />
                                    </div>
                                </div>

                                <div v-if="order.appeal_status === 'approved' && order.admin_remark"
                                    class="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span class="text-gray-500 block mb-1">处理结果：</span>
                                    <p
                                        class="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                                        {{ order.admin_remark }}
                                    </p>
                                </div>

                                <div v-if="order.appeal_status === 'rejected' && isAppealFromMe && order.admin_remark"
                                    class="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span class="text-gray-500 block mb-1">驳回原因：</span>
                                    <p
                                        class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">
                                        {{ order.admin_remark }}
                                    </p>
                                </div>

                                <div class="text-xs text-gray-400 mt-2">
                                    申诉时间：{{ formatDate(order.appeal_updated_at) }}
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
                                    <span>{{ order.shipping_fee ? `¥${order.shipping_fee}` : '免费' }}</span>
                                </div>
                                <div class="flex justify-between items-center pt-3">
                                    <span class="text-gray-800 dark:text-gray-200 font-medium">实付金额</span>
                                    <span class="text-orange-500 font-bold text-2xl">¥{{
                                        formatPrice(order.payment_amount || order.price)
                                        }}</span>
                                </div>
                            </div>

                            <!--  动态操作按钮 -->
                            <div class="space-y-3">
                                <!-- 1. 待付款（买家） -->
                                <template v-if="order.status === 'pending' && isBuyer">
                                    <el-button type="primary" size="large" class="w-full !rounded-full"
                                        @click="handlePay">
                                        💳 立即支付
                                    </el-button>
                                    <span></span>
                                    <el-button type="danger" plain size="default" class="w-full !rounded-full"
                                        @click="handleCancel">
                                        取消订单
                                    </el-button>
                                </template>

                                <!-- 2. 待发货（卖家） -->
                                <template v-else-if="order.status === 'paid' && isSeller">
                                    <el-button type="success" size="large" class="w-full !rounded-full"
                                        @click="showDeliverDialog = true">
                                        🚚 确认发货
                                    </el-button>
                                    <span></span>
                                    <!--  新增：卖家取消订单按钮 -->
                                    <el-button type="danger" plain size="default" class="w-full !rounded-full mt-2"
                                        @click="handleCancelBySeller">
                                        🗑️ 取消订单（卖家）
                                    </el-button>
                                    <div class="text-xs text-center text-gray-400 mt-2">
                                        ⚠️ 取消后库存归还，买家会收到通知
                                    </div>
                                </template>

                                <!-- 2.1 待发货（买家） -->
                                <template v-else-if="order.status === 'paid' && isBuyer">
                                    <el-button type="danger" plain size="default" class="w-full !rounded-full"
                                        @click="handleCancelPaid">
                                        🗑️ 取消订单
                                    </el-button>
                                    <div class="text-xs text-center text-gray-400 mt-2">⚠️ 卖家未发货，取消后款项将原路退回</div>
                                </template>

                                <!-- 3. 待收货（买家） -->
                                <template v-else-if="order.status === 'trading' && isBuyer">
                                    <el-button type="success" size="large" class="w-full !rounded-full"
                                        @click="showReceiveDialog = true">
                                        ✅ 确认收货
                                    </el-button>
                                    <span></span>
                                    <!-- <el-button type="danger" plain size="default" class="w-full !rounded-full"
                                        @click="handleCancelTrading">
                                        🗑️ 取消订单
                                    </el-button>
                                    <div class="text-xs text-center text-gray-400 mt-2">⚠️ 取消后款项将原路退回</div> -->
                                </template>

                                <!--  申诉相关逻辑（已完成订单专属，买家或卖家都能发起） -->
                                <template v-if="order.status === 'completed'">
                                    <!-- ✅ 未申诉：显示「去申诉」按钮（双方都能点） -->
                                    <el-button v-if="!order.appeal_status || order.appeal_status === 'none'"
                                        size="small" type="warning" plain @click.stop="handleAppeal(order)">
                                        {{ isBuyer ? '发起申诉' : '对买家申诉' }}
                                    </el-button>

                                    <!-- 🕐 申诉中：显示状态标签（不可点击） -->
                                    <el-tag v-else-if="order.appeal_status === 'pending'" size="small" type="warning"
                                        effect="plain">
                                        {{ isAppealFromMe ? '我的申诉审核中' : '对方申诉审核中' }}
                                    </el-tag>

                                    <!-- ✅ 申诉通过：显示成功标签 + Tooltip 显示备注 -->
                                    <el-tooltip v-else-if="order.appeal_status === 'approved'"
                                        :content="order.admin_remark || '申诉已通过'" placement="top">
                                        <el-tag size="small" type="success" effect="plain" class="cursor-pointer">
                                            {{ isAppealFromMe ? '✅ 我的申诉通过' : '✅ 对方申诉通过' }}
                                        </el-tag>
                                    </el-tooltip>

                                    <!-- ℹ️ 申诉驳回：显示信息标签 + Tooltip 显示备注（仅申诉方能看到备注） -->
                                    <el-tooltip v-else-if="order.appeal_status === 'rejected'"
                                        :content="isAppealFromMe ? (order.admin_remark || '申诉已驳回') : '申诉已驳回'"
                                        placement="top">
                                        <el-tag size="small" type="info" effect="plain" class="cursor-pointer">
                                            {{ isAppealFromMe ? 'ℹ️ 我的申诉驳回' : 'ℹ️ 对方申诉驳回' }}
                                        </el-tag>
                                    </el-tooltip>
                                </template>

                                <!-- 4. 已结束 -->
                                <template v-else-if="['completed', 'cancelled', 'refunded'].includes(order.status)">
                                    <el-button type="info" plain size="default" class="w-full !rounded-full" disabled>
                                        交易已结束
                                    </el-button>
                                </template>

                                <!-- 5. 其他 -->
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

            <!--  404 状态 -->
            <div v-else-if="!loading && !order" class="text-center py-20">
                <el-empty description="订单不存在或无权查看" />
                <el-button @click="router.back()" type="primary" round>返回订单列表</el-button>
            </div>

            <!--  发货凭证上传弹窗 -->
            <el-dialog v-model="showDeliverDialog" title="确认发货"
                class="w-90% md:w-30%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" :close-on-click-modal="false">
                <div class="space-y-4">
                    <el-alert title="请上传打包或交易照片作为凭证" type="warning" :closable="false" show-icon />
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

            <!--  收货凭证上传弹窗 -->
            <el-dialog v-model="showReceiveDialog" title="确认收货"
                class="w-90% md:w-30%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" :close-on-click-modal="false">
                <div class="space-y-4">
                    <el-alert title="请上传收到商品的实拍照片作为凭证" type="success" :closable="false" show-icon />
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
import { ArrowLeft, ShoppingCart, Location, Picture, Warning } from '@element-plus/icons-vue'
import orderApi from '@/api/order'
import { useUserStore } from '@/stores/modules/user'
import AdvancedImageUpload from '@/components/AdvanceImageUpload.vue'
import { modalBox } from "@/components/messageBox/modalBox";

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const order = ref<any>(null)
const submitting = ref(false)

//  弹窗控制
const showDeliverDialog = ref(false)
const showReceiveDialog = ref(false)
const deliverImageList = ref<string[]>([])
const receiveImageList = ref<string[]>([])
const AUTO_OPEN_RECEIVE_QUERY_KEY = 'openReceiveDialog'

// ============================================================================
//  计算属性：判断角色 + 申诉相关
// ============================================================================

//  是否是买家
const isBuyer = computed(() => {
    if (!order.value || !userStore.userInfo?.id) return false
    const uid = String(userStore.userInfo.id)
    return String(order.value.buyer_id) === uid || String(order.value.buyerId) === uid
})

//  是否是卖家
const isSeller = computed(() => {
    if (!order.value || !userStore.userInfo?.id) return false
    const uid = String(userStore.userInfo.id)
    return String(order.value.seller_id) === uid || String(order.value.sellerId) === uid
})

//  判断申诉是否由当前用户发起
const isAppealFromMe = computed(() => {
    if (!order.value || !userStore.userInfo?.id) return false
    // 申诉由买家发起，判断当前用户是否是买家
    return order.value.buyer_id === userStore.userInfo?.id ||
        order.value.buyerId === userStore.userInfo?.id
})

// ============================================================================
//  工具函数
// ============================================================================
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

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
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

//  申诉状态中文标签
const getAppealStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: '审核中',
        approved: '已通过',
        rejected: '已驳回'
    }
    return map[status] || status
}

//  申诉状态标签类型
const getAppealStatusType = (status: string): 'warning' | 'success' | 'danger' | 'info' => {
    const map: Record<string, any> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    }
    return map[status] || 'info'
}

const hasAutoOpenReceiveDialogFlag = () => {
    const flag = route.query[AUTO_OPEN_RECEIVE_QUERY_KEY]
    if (Array.isArray(flag)) {
        return flag.includes('1') || flag.includes('true')
    }
    return flag === '1' || flag === 'true'
}

const clearAutoOpenReceiveDialogFlag = async () => {
    if (!(AUTO_OPEN_RECEIVE_QUERY_KEY in route.query)) return

    const nextQuery = { ...route.query }
    delete nextQuery[AUTO_OPEN_RECEIVE_QUERY_KEY]

    try {
        await router.replace({
            path: route.path,
            query: nextQuery
        })
    } catch (error) {
        console.warn('⚠️ 清理自动弹窗参数失败:', error)
    }
}

const tryAutoOpenReceiveDialog = async () => {
    if (!hasAutoOpenReceiveDialogFlag()) return

    if (order.value?.status === 'trading' && isBuyer.value) {
        showReceiveDialog.value = true
    } else if (order.value?.status !== 'trading') {
        ElMessage.warning('当前订单状态不支持确认收货')
    } else {
        ElMessage.warning('仅买家可确认收货')
    }

    await clearAutoOpenReceiveDialogFlag()
}

const refreshCurrentUserSafely = async () => {
    try {
        await userStore.refreshCurrentUser()
    } catch (error) {
        console.warn('[OrderDetail] refreshCurrentUser failed:', error)
    }
}

// ============================================================================
//  获取订单详情
// ============================================================================
const fetchOrderDetail = async () => {
    loading.value = true
    const orderNo = route.params.orderNo as string

    if (!orderNo) {
        ElMessage.error('缺少订单号')
        loading.value = false
        return
    }

    try {
        const res = await orderApi.getOrderDetail(orderNo)
        if ((res as any)?.code === 200) {
            order.value = res.data
            await tryAutoOpenReceiveDialog()
        } else {
            ElMessage.error((res as any)?.msg || '订单不存在')
            order.value = null
        }
    } catch (error: any) {
        console.error('❌ 获取订单详情失败:', error)
        if (error?.response?.status === 404) {
            ElMessage.warning('订单不存在或无权查看')
        } else if (error?.response?.status === 403) {
            ElMessage.warning('无权查看此订单')
        } else {
            ElMessage.error(error?.response?.data?.msg || '加载失败')
        }
        order.value = null
    } finally {
        loading.value = false
    }
}

// ============================================================================
//  操作处理
// ============================================================================
const handlePay = () => {
    if (!order.value) return
    router.push(`/pay/${order.value.order_no || order.value.orderNo}`)
}

//  取消订单（买家 - 待付款状态）
const handleCancel = async () => {
    if (!order.value) {
        console.error('❌ [handleCancel] order.value is null')
        ElMessage.error('订单数据异常')
        return
    }

    const orderNo = order.value.order_no || order.value.orderNo
    console.log('🔍 [handleCancel] 准备取消订单:', { orderNo, status: order.value.status })

    try {
        modalBox({
            type: 'info',
            title: '提示',
            message: '确定取消订单吗？取消后库存将自动归还，款项将原路退回。'
        }).then(async () => {
            console.log('✅ [handleCancel] 用户确认取消')

            const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')

            if ((res as any)?.code === 200) {
                ElMessage.success('订单已取消')
                await refreshCurrentUserSafely()
                fetchOrderDetail()
            } else {
                ElMessage.error((res as any)?.msg || '取消失败')
            }
        })




    } catch (e: any) {
        console.error('❌ [handleCancel] 捕获异常:', e)
        if (e !== 'cancel' && e !== 'canceled') {
            ElMessage.error(e?.message || '取消失败，请重试')
        }
    }
}

//  待发货状态下的取消订单（买家）
const handleCancelPaid = async () => {
    if (!order.value) return

    const orderNo = order.value.order_no || order.value.orderNo
    console.log('🔍 [handleCancelPaid] 准备取消订单:', { orderNo })

    try {
        modalBox({
            type: 'error',
            title: '确认取消',
            message: '⚠️ 订单已支付但卖家未发货，取消后将：\n• 库存自动归还卖家\n• 款项原路退回您的账户\n• 交易记录保留在「已取消」\n\n确定要继续吗？'
        }).then(async () => {
            const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')

            if ((res as any)?.code === 200) {
                ElMessage.success('✅ 订单已取消，款项将在 1-3 个工作日内退回')
                await refreshCurrentUserSafely()
                fetchOrderDetail()
            } else {
                ElMessage.error((res as any)?.msg || '取消失败')
            }
        })



    } catch (e: any) {
        if (e !== 'cancel' && e !== 'canceled') {
            console.error('❌ [handleCancelPaid] 错误:', e)
            ElMessage.error(e?.message || '取消失败')
        }
    }
}

//  待收货状态下的取消订单（买家）
const handleCancelTrading = async () => {
    if (!order.value) return

    const orderNo = order.value.order_no || order.value.orderNo
    console.log('🔍 [handleCancelTrading] 准备取消订单:', { orderNo })

    try {
        modalBox({
            type: 'error',
            title: '确认取消',
            message: '⚠️ 订单已发货，取消后将：\n• 库存自动归还卖家\n• 款项原路退回您的账户\n• 交易记录保留在「已取消」\n\n确定要继续吗？'
        }).then(async () => {
            const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')

            if ((res as any)?.code === 200) {
                ElMessage.success('✅ 订单已取消，款项将在 1-3 个工作日内退回')
                await refreshCurrentUserSafely()
                fetchOrderDetail()
            } else {
                ElMessage.error((res as any)?.msg || '取消失败')
            }
        })



    } catch (e: any) {
        if (e !== 'cancel' && e !== 'canceled') {
            console.error('❌ [handleCancelTrading] 错误:', e)
            ElMessage.error(e?.message || '取消失败')
        }
    }
}

//  卖家取消订单（待发货状态）
const handleCancelBySeller = async () => {
    if (!order.value) {
        console.error('❌ [handleCancelBySeller] order.value is null')
        ElMessage.error('订单数据异常')
        return
    }

    const orderNo = order.value.order_no || order.value.orderNo
    console.log('🔍 [handleCancelBySeller] 卖家准备取消订单:', { orderNo })

    try {
        modalBox({
            type: 'error',
            title: '卖家取消订单',
            message: '⚠️ 卖家取消订单后将：\n• 库存自动归还商品\n• 订单状态变为「已取消」\n• 买家会收到取消通知\n\n确定要取消吗？'
        }).then(async () => {
            console.log('✅ [handleCancelBySeller] 卖家确认取消')

            const res = await orderApi.updateOrderStatus(orderNo, 'cancelled')

            if ((res as any)?.code === 200) {
                ElMessage.success('✅ 订单已取消')
                await refreshCurrentUserSafely()
                fetchOrderDetail()
            } else {
                ElMessage.error((res as any)?.msg || '取消失败')
            }
        })

    } catch (e: any) {
        console.error('❌ [handleCancelBySeller] 错误:', e)
        if (e !== 'cancel' && e !== 'canceled') {
            ElMessage.error(e?.message || '取消失败，请重试')
        }
    }
}

//  申诉处理（买家或卖家都能发起）
const handleAppeal = (orderItem: any) => {
    const orderNo = orderItem.order_no || orderItem.orderNo
    const appealStatus = orderItem.appeal_status

    if (!orderNo || orderNo === 'undefined' || orderNo === 'null') {
        ElMessage.error('订单号异常，请刷新页面重试')
        return
    }

    // 场景 1: 已申诉（通过/驳回）→ 直接打开弹窗查看结果
    if (appealStatus && appealStatus !== 'none' && appealStatus !== 'pending') {
        //  发射事件，通知父组件打开申诉详情弹窗
        // 父组件需要监听 'appeal-order' 事件并处理申诉详情展示
        const emit = defineEmits<{ (e: 'appeal-order', orderNo: string): void }>()
        emit('appeal-order', orderNo)
        return
    }

    // 场景 2: 申诉审核中 -> 提示等待
    if (appealStatus === 'pending') {
        ElMessage.info('🕐 申诉审核中，请耐心等待管理员处理')
        return
    }

    // 场景 3: 未申诉 -> 二次确认后打开表单提交
    const appealTitle = isBuyer.value ? '发起申诉' : '对买家申诉'
    const appealMessage = isBuyer.value
        ? '提交申诉后，平台将在 48 小时内审核。请确保申诉理由真实有效，恶意申诉可能影响账号信用。'
        : '您将对买家发起申诉，平台将在 48 小时内审核。请确保申诉理由真实有效。'

    modalBox({
        type: 'info',
        title: appealTitle,
        message: appealMessage,
    }).then(() => {
        //  发射事件，通知父组件打开申诉表单
        const emit = defineEmits<{ (e: 'appeal-order', orderNo: string): void }>()
        emit('appeal-order', orderNo)
    }).catch((action) => {
        if (action === 'cancel') {
            ElMessage.info('已取消申诉')
        }
    })
}

//  发货弹窗
const closeDeliverDialog = () => {
    showDeliverDialog.value = false
    deliverImageList.value = []
}

const submitDeliver = async () => {
    const proofImage = deliverImageList.value[0]
    if (!proofImage) { ElMessage.warning('请先上传发货凭证'); return }

    submitting.value = true
    try {
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

//  收货弹窗
const closeReceiveDialog = () => {
    showReceiveDialog.value = false
    receiveImageList.value = []
}

const submitReceive = async () => {
    const proofImage = receiveImageList.value[0]
    if (!proofImage) { ElMessage.warning('请先上传收货凭证'); return }

    submitting.value = true
    try {
        const res = await orderApi.updateOrderStatus(
            order.value.order_no || order.value.orderNo,
            'completed',
            proofImage
        )
        if ((res as any)?.code === 200) {
            ElMessage.success('收货成功，交易已完成')
            await refreshCurrentUserSafely()
            closeReceiveDialog()
            fetchOrderDetail()
        }
    } catch (e: any) {
        ElMessage.error(e.message || '操作失败')
    } finally {
        submitting.value = false
    }
}

const handleContact = () => {
    //  1. 校验登录状态
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }

    //  2. 校验订单数据
    if (!order.value) {
        ElMessage.error('订单数据异常')
        return
    }

    //  3. 确定联系对象
    const currentUserId = userStore.userInfo?.id
    const isBuyer = order.value.buyer_id === currentUserId || order.value.buyerId === currentUserId

    const targetId = isBuyer
        ? (order.value.seller_id || order.value.sellerId)
        : (order.value.buyer_id || order.value.buyerId)

    const targetName = isBuyer
        ? (order.value.sellerName || order.value.seller_name || '卖家')
        : (order.value.buyerName || order.value.buyer_name || '买家')

    //  4. 校验目标用户 ID
    if (!targetId) {
        ElMessage.error('无法获取联系对象信息')
        return
    }

    //  5. 跳转到聊天页
    router.push({
        path: '/main/chat',
        query: {
            targetId: String(targetId),
            targetName,
            type: 'order',
            orderId: order.value.order_no || order.value.orderNo,
            bizId: order.value.id
        }
    })

    //  6. 可选提示
    ElMessage.info(`正在联系 ${targetName}...`)
}

// ============================================================================
//  生命周期
// ============================================================================
onMounted(() => {
    fetchOrderDetail()
})
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

:deep(.el-button--danger.is-plain:hover) {
    --el-button-hover-bg-color: #fef2f2;
    --el-button-hover-border-color: #fecaca;
}
</style>
