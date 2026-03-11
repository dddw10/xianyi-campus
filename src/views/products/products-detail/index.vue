<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">

        <!-- 🔹 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
            <el-skeleton :rows="10" animated />
        </div>

        <!-- 🔹 商品详情 -->
        <div v-else-if="product" class="max-w-5xl mx-auto px-4 py-6">

            <!-- 🔸 顶部：返回 + 卖家信息 -->
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <el-button @click="router.back()" class="!rounded-full !px-4">
                    ← 返回
                </el-button>

                <div class="flex items-center gap-3">
                    <el-avatar :size="36" :src="product.seller_avatar" class="!bg-blue-100">
                        {{ product.seller_name?.[0] || 'U' }}
                    </el-avatar>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-800 dark:text-gray-100 text-sm">
                                {{ product.seller_name || '匿名卖家' }}
                            </span>
                            <el-tag size="small" type="success" class="!rounded-full !h-5 !text-xs">
                                ✓ 实名
                            </el-tag>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-gray-400">
                            <span>📍 {{ product.seller_location || '未知' }}</span>
                            <span>•</span>
                            <span>{{ formatRelativeTime(product.created_at) }}</span>
                        </div>
                    </div>
                    <!-- <el-button size="small" class="!rounded-full !ml-2">关注</el-button> -->
                </div>
            </div>

            <!-- 🔸 主体内容：左右布局 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <!-- 🔹 左侧：图片 -->
                <div class="space-y-3">
                    <!-- 主图 -->
                    <div class="rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                        <el-image :src="currentImage || product.images?.[0]" class="w-full aspect-square" fit="contain"
                            :preview-src-list="product.images" preview-teleported>
                            <template #error>
                                <div
                                    class="w-full aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <el-icon class="text-gray-400 text-5xl">
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>
                    </div>

                    <!-- 缩略图 -->
                    <div v-if="product.images?.length > 1" class="flex gap-2 overflow-x-auto pb-1">
                        <div v-for="(img, idx) in product.images" :key="idx" @click="currentImage = img"
                            class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                            :class="currentImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'">
                            <el-image :src="img" class="w-full h-full" fit="cover" />
                        </div>
                    </div>
                </div>

                <!-- 🔹 右侧：信息 + 操作 -->
                <div class="space-y-0 bg-gray-100 p-4 rounded-2xl">

                    <!-- 价格 + 状态 -->
                    <div class="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-baseline gap-3 mb-2">
                            <span class="text-3xl font-bold text-orange-500">¥{{ formatPrice(product.price) }}</span>
                            <span v-if="product.original_price" class="text-gray-400 line-through">
                                ¥{{ formatPrice(product.original_price) }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <el-tag :type="product.status === 'available' ? 'success' : 'info'" size="small"
                                class="!rounded-full">
                                {{ product.status === 'available' ? '在售' : product.status === 'sold' ? '已售出' : '已下架' }}
                            </el-tag>
                            <span v-if="product.condition" class="text-sm text-gray-500">{{ product.condition }}</span>
                            <span class="text-sm text-gray-400 ml-auto">浏览 {{ product.view_count || 0 }}</span>
                        </div>
                    </div>

                    <!-- 标题 + 分类 -->
                    <div class="py-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug">
                            {{ product.title }}
                        </h1>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <el-icon class="text-gray-400">
                                <Collection />
                            </el-icon>
                            <span>{{ getCategoryName(product.category) }}</span>
                            <span class="mx-1">|</span>
                            <span>{{ formatDate(product.created_at) }} 发布</span>
                        </div>
                    </div>

                    <!-- 规格参数（如果有） -->
                    <!-- <div v-if="product.specs" class="py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="grid grid-cols-2 gap-y-2 text-sm">
                            <div v-for="(value, key) in product.specs" :key="key" class="flex justify-between">
                                <span class="text-gray-500">{{ formatSpecKey(key) }}</span>
                                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ value }}</span>
                            </div>
                        </div>
                    </div> -->

                    <!-- 商品描述 -->
                    <div class="py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="font-medium text-gray-800 dark:text-gray-100 mb-3">商品描述</h3>
                        <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                            {{ product.description || '暂无描述' }}
                        </p>
                    </div>

                    <!-- 交易信息 -->
                    <div class="py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-gray-500">发货地</span>
                                <p class="text-gray-800 dark:text-gray-200 mt-1">{{ product.seller_location || '未知' }}
                                </p>
                            </div>
                            <div>
                                <span class="text-gray-500">运费</span>
                                <p class="text-gray-800 dark:text-gray-200 mt-1">{{ product.shipping_fee ?
                                    `¥${product.shipping_fee}` :
                                    '面议' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮区（买家） -->
                    <div v-if="!isSeller"
                        class="pt-4 sticky bottom-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm -mx-4 px-4 py-3">
                        <div class="flex gap-3">
                            <el-button v-if="product.status === 'available'" type="warning" size="large"
                                class="!rounded-full !px-6 flex-1 font-medium" @click="handleContact">
                                💬 聊一聊
                            </el-button>
                            <el-button v-if="product.status === 'available'" type="primary" size="large"
                                class="!rounded-full !px-6 flex-1 font-medium !bg-gray-900 !border-gray-900 hover:!bg-gray-800"
                                @click="handleBuy">
                                🛒 立即购买
                            </el-button>
                            <el-button v-if="product.status === 'sold'" size="large" disabled
                                class="!rounded-full !px-6 flex-1">
                                ✅ 已售出
                            </el-button>
                            <el-button size="large" class="!rounded-full !w-12 !p-0" @click="handleFavorite">
                                ⭐
                            </el-button>
                        </div>
                    </div>

                    <!-- 卖家操作按钮 -->
                    <div v-if="isSeller" class="pt-4">
                        <div class="flex gap-3">
                            <el-button v-if="canEdit" @click="handleEdit" class="!rounded-full flex-1">
                                ✏️ 编辑
                            </el-button>
                            <el-button v-if="canDelete" type="danger" @click="handleDelete"
                                class="!rounded-full flex-1">
                                🗑️ 删除
                            </el-button>
                            <el-button v-if="canRepublish" type="success" @click="handleRepublish"
                                class="!rounded-full flex-1">
                                🔄 重新上架
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🔸 底部保障 -->
            <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">
                <span class="flex items-center justify-center gap-4">
                    <span class="flex items-center gap-1">
                        <span>🛡️</span> 担保交易
                    </span>
                    <span>|</span>
                    <span class="cursor-pointer hover:text-gray-600" @click="handleReport">举报</span>
                    <span>|</span>
                    <span>© 2024 XianYI</span>
                </span>
            </div>
        </div>

        <!-- 🔹 404 状态 -->
        <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="text-5xl mb-4">🔍</div>
            <h3 class="text-base font-medium text-gray-700 dark:text-gray-200 mb-3">
                商品不存在或不可见
            </h3>
            <el-button @click="router.push('/')" class="!rounded-full">
                🛍️ 浏览其他商品
            </el-button>
        </div>

        <!-- 🔹 编辑弹窗 -->
        <EditProductModal v-if="showEditModal" :product="product" @close="showEditModal = false"
            @success="handleEditSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { useUserStore } from "@/stores/modules/user"
import { Picture, Collection } from "@element-plus/icons-vue"
import EditProductModal from "@/components/products/EditProductModal.vue"
import adminCategoryApi from "@/api/admin/category"
import productApi from "@/api/product";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 🔹 状态
const loading = ref(true)
const product = ref<any>(null)
const currentImage = ref('')
const showEditModal = ref(false)
const typeOptions = ref<any[]>([])

// 🔹 计算属性
const isSeller = computed(() => {
    return userStore.isLoggedIn && product.value?.seller_id === userStore.userInfo?.id
})

const canEdit = computed(() => {
    if (!product.value) return false
    return (
        (product.value.review_status === 'approved' && product.value.status === 'available') ||
        product.value.review_status === 'pending' ||
        product.value.review_status === 'rejected'
    )
})

const canDelete = computed(() => {
    if (!product.value) return false
    return product.value.status === 'deleted' || product.value.review_status === 'rejected'
})

const canRepublish = computed(() => {
    if (!product.value) return false
    return product.value.status === 'deleted' && product.value.review_status === 'approved'
})

// 🔹 获取商品详情
const fetchProductDetail = async () => {
    loading.value = true
    try {
        const productId = route.params.id
        productApi.getProduct(productId).then((res: any) => {
            if (res?.code === 200) {
                product.value = res.data
                currentImage.value = res.data.images?.[0]
            }
        })
    } catch (error: any) {
        console.error('❌ 获取商品详情失败:', error)
        if (error?.response?.status === 404) {
            product.value = null
        } else {
            ElMessage.error(error?.response?.data?.msg || '加载失败')
        }
    } finally {
        loading.value = false
    }
}

// 🔹 获取分类列表
const getEnabledCategories = async () => {
    try {
        adminCategoryApi.getCategoriesEnabled().then((res: any) => {
            if (res?.code === 200) {
                typeOptions.value = res.data.list || []
            }
        })

    } catch (error) {
        console.error('获取分类失败:', error)
    }
}

// 🔹 工具函数
const getCategoryName = (categoryValue?: string) => {
    const category = typeOptions.value.find((cat) =>
        cat.value === categoryValue ||
        cat.id === categoryValue ||
        cat.name?.includes(categoryValue || '')
    )
    if (category) return category.name || categoryValue

    const map: Record<string, string> = {
        books: '📚 书籍教材',
        electronics: '💻 数码电子',
        clothing: '👕 服饰鞋包',
        daily: '🏠 生活用品',
        hobby: '🎨 兴趣爱好',
        other: '🎁 其他'
    }
    return map[categoryValue || ''] || categoryValue || '未分类'
}

// const formatSpecKey = (key: string) => {
//     const map: Record<string, string> = {
//         brand: '品牌',
//         condition: '成色',
//         size: '尺寸',
//         color: '颜色',
//         model: '型号',
//         warranty: '保修'
//     }
//     return map[key] || key
// }

const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (date: string) => {
    if (!date) return ''
    return date.slice(0, 10)
}

const formatRelativeTime = (date: string) => {
    if (!date) return ''
    const now = new Date()
    const past = new Date(date)
    const diff = now.getTime() - past.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return formatDate(date)
}

// 🔹 操作处理
const handleEdit = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }
    showEditModal.value = true
}

const handleDelete = async () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }

    try {
        await ElMessageBox.confirm('确定要删除此商品吗？', '删除商品', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await productApi.deleteProduct(product.value.id)
        ElMessage.success('商品已删除')
        router.push('/products/orders?tab=published')
    } catch {
        // 取消
    }
}

const handleRepublish = async () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }

    try {
        await ElMessageBox.confirm('重新上架后需要重新审核，确认吗？', '重新上架', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'success'
        })

        await productApi.updateProduct(product.value.id, {
            title: product.value.title,
            description: product.value.description,
            price: product.value.price,
            category: product.value.category,
            images: product.value.images,
            action: 'republish'
        })

        ElMessage.success('已重新提交审核')
        fetchProductDetail()
    } catch {
        // 取消
    }
}

const handleBuy = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }
    if (product.value?.status !== 'available') {
        ElMessage.warning('该商品暂不可购买')
        return
    }
    router.push(`/orders/confirm?product_id=${product.value.id}`)
}

const handleContact = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }
    ElMessage.info(`正在联系卖家 "${product.value?.seller_name}"...`)
}

const handleFavorite = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }
    ElMessage.success('已加入收藏')
}

const handleReport = () => {
    ElMessageBox.prompt('请输入举报原因', '举报商品', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入举报原因'
    }).then(({ value }) => {
        ElMessage.success('举报已提交，我们会尽快处理')
    }).catch(() => { })
}

const handleEditSuccess = () => {
    showEditModal.value = false
    ElMessage.success('商品已更新')
    fetchProductDetail()
}

// 🔹 初始化
onMounted(() => {
    fetchProductDetail()
    getEnabledCategories()
})
</script>

<style scoped>
/* 图片预览 */
:deep(.el-image-viewer__wrapper) {
    @apply z-50;
}

/* 缩略图滚动条隐藏 */
.overflow-x-auto {
    scrollbar-width: none;
}

.overflow-x-auto::-webkit-scrollbar {
    @apply hidden;
}

/* 骨架屏 */
:deep(.el-skeleton__item) {
    @apply rounded-xl;
}
</style>