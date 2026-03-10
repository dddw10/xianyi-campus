<!-- src/views/products/products-detail/index.vue -->
<template>
    <div
        class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">

        <!-- 🔹 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
            <el-skeleton :rows="10" animated />
        </div>

        <!-- 🔹 商品详情 -->
        <div v-else-if="product" class="max-w-5xl mx-auto px-4 py-6">

            <!-- 🔸 返回按钮 + 卖家操作按钮 -->
            <div class="flex items-center justify-between mb-6">
                <el-button @click="router.back()" class="!rounded-full">
                    ← 返回
                </el-button>

                <!-- 🔹 卖家操作按钮（根据状态动态显示） -->
                <div v-if="isSeller" class="flex items-center gap-2">

                    <!-- 🔸 在售：编辑 + 下架 -->
                    <template v-if="product.review_status === 'approved' && product.status === 'available'">
                        <el-button @click="handleEdit" class="!rounded-full">
                            ✏️ 编辑
                        </el-button>
                        <el-button type="danger" @click="handleAction('delete')" class="!rounded-full">
                            🗑️ 下架
                        </el-button>
                    </template>

                    <!-- 🔸 已售出：只读 -->
                    <template v-else-if="product.review_status === 'approved' && product.status === 'sold'">
                        <el-tag type="warning" class="!rounded-full">🟡 已售出</el-tag>
                    </template>

                    <!-- 🔸 被拒绝：修改重提 -->
                    <template v-else-if="product.review_status === 'rejected'">
                        <el-button type="primary" @click="handleEdit" class="!rounded-full">
                            ✏️ 修改重提
                        </el-button>
                    </template>

                    <!-- 🔸 审核中：修改 + 取消审核 -->
                    <template v-else-if="product.review_status === 'pending'">
                        <el-button @click="handleEdit" class="!rounded-full">
                            ✏️ 修改
                        </el-button>
                        <el-button type="warning" @click="handleAction('cancel_review')" class="!rounded-full">
                            ⏹️ 取消审核
                        </el-button>
                    </template>

                    <!-- 🔸 已下架：重新上架 + 删除 -->
                    <template v-else-if="product.status === 'deleted'">
                        <el-button @click="handleAction('republish')" class="!rounded-full">
                            🔄 重新上架
                        </el-button>
                        <el-button type="danger" @click="handleDelete" class="!rounded-full">
                            🗑️ 删除
                        </el-button>
                    </template>
                </div>
            </div>

            <!-- 🔸 状态提示栏（卖家可见） -->
            <el-alert v-if="isSeller && product.review_status !== 'approved'" :title="getStatusAlertTitle()"
                :type="getStatusAlertType()" :closable="false" class="mb-6" show-icon>
                <template #default>
                    <p v-if="product.review_status === 'rejected' && product.review_reason" class="mt-1 text-sm">
                        <span class="font-medium">拒绝理由：</span>{{ product.review_reason }}
                    </p>
                    <p v-if="product.review_status === 'pending'" class="mt-1 text-sm">
                        商品正在审核中，审核通过后将展示在公共列表
                    </p>
                </template>
            </el-alert>

            <!-- 🔸 商品主图 + 信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                <!-- 🔹 图片区域 -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <el-image :src="product.images?.[0]" class="w-full aspect-square rounded-xl object-cover"
                        fit="cover" :preview-src-list="product.images" preview-teleported>
                        <template #error>
                            <div
                                class="w-full aspect-square rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <el-icon class="text-gray-400 text-6xl">
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>

                    <!-- 🔹 缩略图列表 -->
                    <div v-if="product.images?.length > 1" class="flex gap-2 mt-4 overflow-x-auto pb-2">
                        <el-image v-for="(img, idx) in product.images" :key="idx" :src="img"
                            class="w-16 h-16 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-blue-400 transition-colors"
                            fit="cover" @click="currentImage = img" />
                    </div>
                </div>

                <!-- 🔹 商品信息 -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        {{ product.title }}
                    </h1>

                    <!-- 🔹 状态标签 -->
                    <el-tag :type="getStatusTagType()" size="large" class="mb-4 !rounded-full !px-4 !py-1">
                        {{ getStatusText() }}
                    </el-tag>

                    <!-- 🔹 价格 -->
                    <div class="flex items-baseline gap-3 mb-4">
                        <span class="text-3xl font-bold text-red-500">¥{{ formatPrice(product.price) }}</span>
                    </div>

                    <!-- 🔹 分类 -->
                    <div class="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                        <el-icon>
                            <Collection />
                        </el-icon>
                        <span>分类：{{ getCategoryName(product.category) }}</span>
                    </div>

                    <!-- 🔹 卖家信息 -->
                    <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                        <el-avatar :size="40" :src="product.seller_avatar" class="!bg-blue-100">
                            {{ product.seller_name?.[0] || 'U' }}
                        </el-avatar>
                        <div>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ product.seller_name || '匿名卖家' }}
                            </p>
                            <p class="text-xs text-gray-400">
                                发布于 {{ formatDate(product.created_at) }}
                            </p>
                        </div>
                    </div>

                    <!-- 🔹 买家操作按钮（非卖家） -->
                    <div v-if="!isSeller" class="flex gap-3">
                        <el-button v-if="product.status === 'available'" type="primary" size="large"
                            class="!rounded-full !px-8 !py-3 flex-1" @click="handleBuy">
                            🛒 立即购买
                        </el-button>
                        <el-button v-if="product.status === 'available'" size="large" class="!rounded-full !px-4 !py-3"
                            @click="handleContact">
                            💬
                        </el-button>
                        <el-button v-if="product.status === 'sold'" size="large" disabled
                            class="!rounded-full !px-8 !py-3 flex-1">
                            ✅ 已售出
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 🔸 商品描述 -->
            <div
                class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    📝 商品描述
                </h3>
                <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {{ product.description || '暂无描述' }}
                </p>
            </div>

            <!-- 🔸 审核时间（卖家可见） -->
            <div v-if="isSeller && product.reviewed_at" class="text-center text-sm text-gray-400">
                最后审核：{{ formatDateTime(product.reviewed_at) }}
            </div>
        </div>

        <!-- 🔹 404 状态 -->
        <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                商品不存在或不可见
            </h3>
            <el-button @click="router.push('/products')" class="!rounded-full">
                🛍️ 浏览其他商品
            </el-button>
        </div>
    </div>

    <!-- 🔹 编辑弹窗 -->
    <EditProductModal v-if="showEditModal" :product="product" @close="showEditModal = false"
        @success="handleEditSuccess" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Picture, Collection, Warning } from "@element-plus/icons-vue"
import { useUserStore } from "@/stores/modules/user"
import productApi from "@/api/product"
import EditProductModal from "@/components/products/EditProductModal.vue"
import adminCategoryApi from "@/api/admin/category"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 🔹 状态
const loading = ref(true)
const product = ref<any>(null)
const currentImage = ref('')
const showEditModal = ref(false)
const typeOptions = ref<any[]>([])  // 🔥 新增：存储后端返回的分类列表

// 🔹 计算属性：是否是卖家本人
const isSeller = computed(() => {
    return userStore.isLoggedIn && product.value?.seller_id === userStore.userInfo?.id
})

// 🔹 获取商品详情（修复：用 async/await）
const fetchProductDetail = () => {
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

// 🔹 获取启用的分类列表（修复版：async/await + 正确解析）
const getEnabledCategories = async () => {
    try {
        const res = await adminCategoryApi.getCategoriesEnabled().then((res: any) => {
            if (res?.code === 200) {
                // 🔥 后端返回的是 { list: [...], pagination: {...} }
                typeOptions.value = res.data.list || []
            }
        })

    } catch (error) {
        console.error('获取分类失败:', error)
        ElMessage.error('获取商品分类失败')
    }
}

// 🔹 分类名称映射（用后端动态数据 + 硬编码兜底）
const getCategoryName = (categoryValue?: string) => {
    // 🔥 优先从后端返回的分类列表中查找
    const category = typeOptions.value.find((cat: any) =>
        cat.value === categoryValue ||
        cat.id === categoryValue ||
        cat.name?.includes(categoryValue || '')
    )
    if (category) {
        return category.name || categoryValue  // 🔥 返回后端定义的名称（如 "📱 数码"）
    }

    // 🔥 兜底：硬编码映射（兼容旧数据）
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

// 🔹 状态文案（双状态支持）
const getStatusText = () => {
    if (!product.value) return ''
    if (product.value.review_status === 'pending') return '⏳ 待审核'
    if (product.value.review_status === 'rejected') return '❌ 审核拒绝'

    const map: Record<string, string> = {
        available: '🟢 在售',
        sold: '🟡 已售出',
        deleted: '🔴 已下架'
    }
    return map[product.value.status] || '未知'
}

// 🔹 状态标签颜色
const getStatusTagType = () => {
    if (!product.value) return 'info'
    if (product.value.review_status === 'pending') return 'info'
    if (product.value.review_status === 'rejected') return 'danger'

    const map: Record<string, 'success' | 'warning' | 'danger'> = {
        available: 'success',
        sold: 'warning',
        deleted: 'danger'
    }
    return map[product.value.status] || 'info'
}

// 🔹 状态提示栏标题
const getStatusAlertTitle = () => {
    if (!product.value) return ''
    if (product.value.review_status === 'pending') return '⏳ 商品正在审核中'
    if (product.value.review_status === 'rejected') return '❌ 审核未通过'
    return ''
}

// 🔹 状态提示栏类型
const getStatusAlertType = () => {
    if (!product.value) return 'info'
    if (product.value.review_status === 'pending') return 'info'
    if (product.value.review_status === 'rejected') return 'error'
    return 'info'
}

// 🔹 格式化函数
const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (date: string) => {
    if (!date) return ''
    return date.slice(0, 10)
}

const formatDateTime = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-CN')
}

// 🔹 操作处理：编辑商品
const handleEdit = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }
    showEditModal.value = true
}

// 🔹 操作处理：下架/取消审核/重新上架
const handleAction = async (action: 'delete' | 'cancel_review' | 'republish') => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }

    const confirmMap: Record<'delete' | 'cancel_review' | 'republish', { title: string; message: string; type: 'success' | 'warning' | 'error' }> = {
        delete: { title: '下架商品', message: '确定要下架此商品吗？下架后将不在公共列表显示', type: 'warning' },
        cancel_review: { title: '取消审核', message: '确定要取消审核并下架吗？', type: 'warning' },
        republish: { title: '重新上架', message: '重新上架后需要重新审核，确认吗？', type: 'success' }
    }

    const { title, message, type } = confirmMap[action]!

    try {
        await ElMessageBox.confirm(message, title, {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type
        })

        await productApi.updateProduct(product.value.id, {
            title: product.value.title,
            description: product.value.description,
            price: product.value.price,
            category: product.value.category,
            images: product.value.images,
            action
        })

        const successMap: Record<string, string> = {
            delete: '商品已下架',
            cancel_review: '已取消审核并下架',
            republish: '已重新提交审核'
        }
        ElMessage.success(successMap[action])
        fetchProductDetail()

    } catch {
        // 取消
    }
}

// 🔹 操作处理：永久删除商品
const handleDelete = async () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }

    try {
        await ElMessageBox.confirm('确定要永久删除此商品吗？删除后不可恢复', '删除商品', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'error',
            confirmButtonClass: '!bg-red-500'
        })

        await productApi.deleteProduct(product.value.id)
        ElMessage.success('商品已删除')
        router.push('/products/orders?tab=published')
    } catch {
        // 取消
    }
}

// 🔹 操作处理：购买
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

// 🔹 操作处理：联系卖家
const handleContact = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }
    ElMessage.info(`正在联系卖家 "${product.value?.seller_name}"...`)
}

// 🔹 编辑成功回调
const handleEditSuccess = () => {
    showEditModal.value = false
    ElMessage.success('商品已更新，重新提交审核')
    fetchProductDetail()
}

// 🔹 初始化
onMounted(() => {
    fetchProductDetail()      // 🔥 获取商品详情
    getEnabledCategories()    // 🔥 新增：获取分类列表
})
</script>

<style scoped>
/* 🔹 图片预览遮罩 */
:deep(.el-image-viewer__wrapper) {
    @apply z-50;
}

/* 🔹 缩略图滚动条隐藏 */
.overflow-x-auto {
    scrollbar-width: none;
}

.overflow-x-auto::-webkit-scrollbar {
    @apply hidden;
}

/* 🔹 骨架屏圆角 */
:deep(.el-skeleton__item) {
    @apply rounded-xl;
}
</style>