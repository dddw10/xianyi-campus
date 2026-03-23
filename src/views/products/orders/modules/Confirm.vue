<template>
    <div class="min-h-screen bg-[--bg-color] py-8">
        <div class="max-w-4xl mx-auto px-4">

            <!-- 🔹 顶部标题 -->
            <div class="mb-6 flex items-center gap-3">
                <el-button @click="router.back()" circle class="!w-8 !h-8 !p-0">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">确认订单</h1>
            </div>

            <!-- 🔹 加载状态 -->
            <div v-if="loading" class="flex justify-center py-20">
                <el-skeleton :rows="8" animated />
            </div>

            <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- 🔸 左侧：主要操作区 (占 2 份) -->
                <div class="lg:col-span-2 space-y-6">

                    <!-- 1. 收货地址 -->
                    <div
                        class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <el-icon>
                                    <Location />
                                </el-icon> 收货地址
                            </h2>
                            <el-button link type="primary" size="small" @click="handleManageAddress">
                                管理地址
                            </el-button>
                        </div>

                        <!-- 模拟地址选择 -->
                        <div class="relative">
                            <el-input v-model="addressForm.address" type="textarea" :rows="3"
                                placeholder="请输入详细收货地址（学校/宿舍/街道...）" class="!w-full" />
                            <div class="mt-3 grid grid-cols-2 gap-4">
                                <el-input v-model="addressForm.name" placeholder="收货人姓名" size="default" />
                                <el-input v-model="addressForm.phone" placeholder="联系电话" size="default" />
                            </div>
                            <p class="text-xs text-gray-400 mt-2">
                                💡 提示：线下交易建议约定在学校食堂、图书馆等公共场所面交。
                            </p>
                        </div>
                    </div>

                    <!-- 2. 商品信息 -->
                    <div
                        class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-4">商品信息</h2>
                        <div class="flex gap-4">
                            <!-- 商品图 -->
                            <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <el-image :src="product.images?.[0]" fit="cover" class="w-full h-full">
                                    <template #error>
                                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                                            <el-icon>
                                                <Picture />
                                            </el-icon>
                                        </div>
                                    </template>
                                </el-image>
                            </div>

                            <!-- 商品详情 -->
                            <div class="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 class="text-gray-800 dark:text-gray-200 font-medium line-clamp-2 mb-1">
                                        {{ product.title }}
                                    </h3>
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <el-tag size="small" type="info">{{ getCategoryName(product.category)
                                        }}</el-tag>
                                        <span>{{ product.condition || '二手' }}</span>
                                    </div>
                                </div>

                                <div class="flex items-end justify-between">
                                    <div class="text-orange-500 font-bold text-lg">
                                        ¥{{ formatPrice(product.price) }}
                                    </div>
                                    <div class="text-xs text-gray-400">
                                        卖家：{{ product.seller_name || product.seller_student_id }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 买家留言 -->
                    <div
                        class="bg-[--bg-elevated] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 class="font-bold text-gray-800 dark:text-gray-100 mb-3">买家留言</h2>
                        <el-input v-model="buyerRemark" type="textarea" :rows="2" placeholder="选填：对卖家的留言，如约定见面时间、地点细节等"
                            maxlength="200" show-word-limit />
                    </div>

                </div>

                <!-- 🔸 右侧：结算栏 (占 1 份) -->
                <div class="lg:col-span-1">
                    <div
                        class="bg-[--bg-elevated] rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-6">
                        <h2
                            class="font-bold text-gray-800 dark:text-gray-100 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                            订单汇总
                        </h2>

                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>商品金额</span>
                                <span>¥{{ formatPrice(product.price) }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>运费</span>
                                <span>{{ product.shipping_fee ? `¥${product.shipping_fee}` : '面议/自提' }}</span>
                            </div>

                            <!-- 总计 -->
                            <div
                                class="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <span class="text-gray-800 dark:text-gray-200 font-medium">应付总额</span>
                                <span class="text-orange-500 font-bold text-xl">
                                    ¥{{ formatPrice(totalAmount) }}
                                </span>
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <el-button type="primary" size="large"
                            class="w-full mt-6 !rounded-full !h-12 text-base font-bold shadow-lg shadow-blue-500/30"
                            :loading="submitting" @click="handleSubmitOrder">
                            {{ submitting ? '创建中...' : '提交订单' }}
                        </el-button>

                        <p class="text-xs text-center text-gray-400 mt-3">
                            提交即代表同意《平台交易服务协议》
                        </p>
                    </div>
                </div>

            </div>

            <!-- 🔹 错误状态 -->
            <div v-else-if="!loading && !product" class="text-center py-20">
                <el-empty description="商品信息加载失败或已不存在" />
                <el-button @click="router.push('/products')" type="primary" round>
                    返回首页
                </el-button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Location, Picture } from '@element-plus/icons-vue'
import productApi from '@/api/product'
import orderApi from '@/api/order'
import { useUserStore } from '@/stores/modules/user'
import { modalBox } from "@/components/messageBox/modalBox";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 🔹 状态定义
const loading = ref(true)
const submitting = ref(false)
const product = ref<any>(null)

// 表单数据
const addressForm = ref({
    name: userStore.userInfo?.nickname || '', // 尝试从用户信息预填充
    phone: '',
    address: ''
})
const buyerRemark = ref('')

// 🔹 计算属性
const totalAmount = computed(() => {
    if (!product.value) return 0
    const price = parseFloat(product.value.price) || 0
    const shipping = parseFloat(product.value.shipping_fee) || 0
    return price + shipping
})

// 🔹 工具函数
const formatPrice = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const getCategoryName = (cat?: string) => {
    const map: Record<string, string> = {
        books: '书籍', electronics: '数码', clothing: '服饰', daily: '生活', other: '其他'
    }
    return map[cat || ''] || cat || '未知分类'
}

// 🔹 获取商品详情 (只读，用于确认)
const fetchProduct = async () => {
    const productId = route.query.product_id
    if (!productId) {
        ElMessage.error('缺少商品参数')
        loading.value = false
        return
    }

    try {
        const res = await productApi.getProduct(productId)
        if ((res as any).code === 200) {
            product.value = res.data
            // 简单校验：不能买自己的商品 (可选逻辑)
            if (product.value.seller_id === userStore.userInfo?.id) {
                // ElMessage.warning('不能购买自己发布的商品')
                // 这里可以选择拦截或者允许（防止误操作），通常建议拦截
            }
        } else {
            throw new Error((res as any).msg || '加载失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '商品不存在')
        product.value = null
    } finally {
        loading.value = false
    }
}

// 🔹 提交订单
const handleSubmitOrder = async () => {
    // 1. 基础校验
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }
    if (!addressForm.value.address || !addressForm.value.name || !addressForm.value.phone) {
        ElMessage.warning('请填写完整的收货信息')
        return
    }
    if (product.value?.status !== 'available') {
        ElMessage.warning('商品已售出或下架，无法购买')
        return
    }

    // 2. 二次确认
    try {
        modalBox({
            type: 'info',
            title: '提交订单',
            message: `确认以 ¥${formatPrice(totalAmount.value)} 的价格购买此商品吗？`,
        }).then(async () => {
            // 3. 调用 API
            submitting.value = true
            try {
                const payload = {
                    productId: product.value.id,
                    quantity: 1, // 闲置物品通常为 1
                    deliveryAddress: `${addressForm.value.name} ${addressForm.value.phone} ${addressForm.value.address}`,
                    buyerRemark: buyerRemark.value
                }

                const res = await orderApi.createOrder(payload)

                if ((res as any).code === 200) {
                    ElMessage.success('订单创建成功')
                    const orderNo = res.data.orderNo
                    // 4. 跳转支付页
                    router.push(`/pay/${orderNo}`)
                } else {
                    ElMessage.error((res as any).msg || '创建订单失败')
                }
            } catch (error: any) {
                console.error(error)
                ElMessage.error(error.response?.data?.msg || '网络异常，请稍后重试')
            } finally {
                submitting.value = false
            }
        })
    } catch {
        return // 用户取消
    }


}

const handleManageAddress = () => {
    ElMessage.info('地址管理功能开发中，请直接在此填写')
}

onMounted(() => {
    fetchProduct()
})
</script>

<style scoped>
/* 如果需要覆盖 element-plus 的某些默认样式，可以在这里添加 */
:deep(.el-textarea__inner) {
    @apply rounded-xl;
}

:deep(.el-input__wrapper) {
    @apply rounded-xl;
}
</style>