<!-- src/views/favorites/Index.vue -->
<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">

        <!-- 🔹 头部导航 -->
        <div
            class="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <el-icon class="text-2xl text-warning-500">
                            <StarFilled />
                        </el-icon>
                        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                            我的收藏
                        </h1>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        共 {{ favoriteStore.count }} 件
                    </span>
                </div>
            </div>
        </div>

        <!-- 🔹 内容区域 -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">

            <!-- 🔸 加载状态 - 🔥 用纯 CSS 替代 el-spinner -->
            <div v-if="favoriteStore.loading && favoriteStore.list.length === 0"
                class="flex flex-col items-center justify-center py-20">

                <!-- 🔥 纯 CSS Loading 动画 -->
                <div class="loading-spinner mb-4" aria-label="加载中"></div>

                <p class="text-gray-500">加载中...</p>
            </div>

            <!-- 🔸 空状态 -->
            <div v-else-if="favoriteStore.list.length === 0"
                class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <el-icon class="text-4xl text-gray-400">
                        <Star />
                    </el-icon>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    暂无收藏
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                    去逛逛喜欢的商品，点击收藏按钮即可添加到这里
                </p>
                <el-button type="primary" size="large" @click="$router.push('/products')" class="!rounded-full !px-8">
                    🛍️ 去逛逛
                </el-button>
            </div>

            <!-- 🔸 收藏列表 -->
            <div v-else class="space-y-4">
                <div v-for="item in favoriteStore.list" :key="item.id"
                    class="favorite-item flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    @click="handleCardClick(item)">

                    <!-- 🔹 商品图片 -->
                    <div class="relative flex-shrink-0">
                        <el-image :src="item.images?.[0] || getDefaultImage()"
                            class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-100 dark:bg-gray-700"
                            fit="cover" lazy>
                            <template #error>
                                <div
                                    class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <el-icon class="text-gray-400 text-xl">
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>

                        <!-- 商品状态角标 -->
                        <el-tag :type="getStatusType(item)" size="small"
                            class="absolute -top-2 -right-2 !rounded-full !text-xs !px-2">
                            {{ getStatusText(item) }}
                        </el-tag>
                    </div>

                    <!-- 🔹 商品信息 -->
                    <div class="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            <h3
                                class="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {{ item.title }}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {{ item.description || '暂无描述' }}
                            </p>

                            <!-- 卖家信息 -->
                            <div class="flex items-center gap-2 mt-2">
                                <el-icon class="text-gray-400 text-sm">
                                    <User />
                                </el-icon>
                                <span class="text-xs text-gray-400">
                                    ID: {{ item.seller_id || '未知' }}
                                </span>
                            </div>
                        </div>

                        <!-- 🔹 底部：价格 + 操作 -->
                        <div
                            class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div class="flex items-center gap-2">
                                <span class="text-red-500 font-bold text-lg">¥{{ formatPrice(item.price) }}</span>
                                <span class="text-xs text-gray-400 hidden sm:inline">
                                    {{ formatDate(item.favorited_at) }} 收藏
                                </span>
                            </div>

                            <div class="flex items-center gap-2" @click.stop>
                                <!-- 收藏按钮 -->
                                <FavoriteButton :product-id="item.id" size="small"
                                    @change="handleFavoriteChange(item.id, $event)" />

                                <!-- 查看详情按钮 -->
                                <el-button size="small" class="hidden sm:inline-flex"
                                    @click.stop="$router.push(`/products/detail/${item.id}`)">
                                    查看
                                </el-button>
                                <el-button size="small" circle class="sm:hidden"
                                    @click.stop="$router.push(`/products/detail/${item.id}`)">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🔸 分页 -->
            <div v-if="favoriteStore.pagination.total > favoriteStore.pagination.limit"
                class="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="favoriteStore.pagination.limit"
                    :total="favoriteStore.pagination.total" :page-sizes="[10, 20, 50]"
                    layout="prev, pager, next, total, sizes" @current-change="handlePageChange" class="!text-sm" />
            </div>
        </div>
    </div>
</template>

<!-- src/views/favorites/Index.vue - 只修改 script 部分 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Star, StarFilled, Picture, User, View } from '@element-plus/icons-vue'
import { useFavoriteStore } from '@/stores/modules/favorite'
import FavoriteButton from '@/components/products/FavoriteButton.vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const currentPage = ref(1)

const formatPrice = (price: string | number | undefined): string => {
    if (price === undefined || price === null) return '0.00'
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (date: string | undefined): string => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getDefaultImage = (): string => {
    return `image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle">📦</text></svg>`)}`
}

const getStatusText = (item: any): string => {
    if (item.review_status === 'pending') return '⏳ 审核中'
    if (item.review_status === 'rejected') return '❌ 已拒绝'
    const map: Record<string, string> = { available: '🟢 在售', sold: '🟡 已售', deleted: '🔴 下架' }
    return map[item.status] || item.status || '未知'
}

const getStatusType = (item: any): 'success' | 'warning' | 'danger' | 'info' => {
    if (item.review_status === 'pending') return 'info'
    if (item.review_status === 'rejected') return 'danger'
    const map: Record<string, 'success' | 'warning' | 'danger'> = { available: 'success', sold: 'warning', deleted: 'danger' }
    return map[item.status] || 'info'
}

const handleCardClick = (item: any): void => {
    router.push(`/products/detail/${item.id}`)
}

const loadFavorites = async (page: number): Promise<void> => {
    await favoriteStore.fetchList(page)
}

const handlePageChange = (page: number): void => {
    currentPage.value = page
    loadFavorites(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 🔥 修复：使用后端返回的真实状态，而不是取反
const handleFavoriteChange = (productId: number, favorited: boolean): void => {
    if (favorited) {
        // ✅ 刚收藏：确保商品在列表中（如果不在，重新加载列表）
        const exists = favoriteStore.list.some(item => String(item.id) === String(productId))
        if (!exists) {
            // 🔥 可选：重新加载列表确保数据一致
            loadFavorites(currentPage.value)
        }
    } else {
        // ❌ 刚取消：从列表中移除
        favoriteStore.removeFromList(productId)
        ElMessage.success('已从收藏中移除')
    }
}

onMounted((): void => {
    if (favoriteStore.favoritedIds.size === 0) {
        favoriteStore.initFavorites()
    }
    loadFavorites(1)
})
</script>

<style scoped>
/* 🔥 纯 CSS Loading 动画 - 替代 el-spinner */
.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    /* 浅蓝色外圈 */
    border-top-color: rgb(59, 130, 246);
    /* 深蓝色旋转部分 */
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* 深色模式适配 */
:global(.dark) .loading-spinner {
    border-color: rgba(96, 165, 250, 0.2);
    border-top-color: rgb(96, 165, 250);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 🔥 可选：添加脉冲效果增强视觉反馈 */
.loading-spinner::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    background: rgb(59, 130, 246);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
}

:global(.dark) .loading-spinner::after {
    background: rgb(96, 165, 250);
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(0.8);
    }
}

/* 🔥 移动端优化 */
@media (max-width: 640px) {
    .favorite-item {
        @apply p-3 gap-3;
    }

    .favorite-item:active {
        @apply bg-gray-50 dark:bg-gray-700/50;
    }
}

/* 🔥 深色模式适配分页 */
:deep(.el-pagination) {
    @apply dark:text-gray-300;
}

:deep(.el-pagination button),
:deep(.el-pagination span) {
    @apply dark:text-gray-300;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
    @apply dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300;
}

:deep(.el-pagination .el-pager li.active) {
    @apply dark:bg-blue-600 dark:text-white dark:border-blue-600;
}
</style>