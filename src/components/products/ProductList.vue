<!-- src/views/products/orders/modules/ProductList.vue -->
<template>
    <div v-loading="props.loading" element-loading-text="加载中..." class="min-h-[300px]">

        <!-- 🔸 空状态 -->
        <div v-if="props.list.length === 0 && !props.loading" class="text-center py-16">
            <div class="text-6xl mb-4 animate-bounce">📦</div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {{ props.emptyText || '暂无数据' }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {{ getEmptySubtext(props.listType) }}
            </p>
            <el-button v-if="props.listType === 'published'" type="primary" @click="emit('navigate-create')"
                class="!rounded-full !px-6 !py-2.5 shadow-md hover:shadow-lg transition-shadow">
                🚀 发布商品
            </el-button>
            <el-button v-else @click="emit('navigate-products')" class="!rounded-full !px-6 !py-2.5">
                🛍️ 浏览商品
            </el-button>
        </div>

        <!-- 🔸 商品列表 -->
        <div v-else class="space-y-4">
            <div v-for="item in props.list" :key="item.id"
                class="product-card relative flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <!-- 🔹 商品图片区域（添加 relative 确保绝对定位子元素正确） -->
                <div class="relative flex-shrink-0 overflow-visible">
                    <el-image :src="item.images?.[0] || getDefaultImage(getDisplayStatus(item))"
                        class="product-image w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                        fit="cover">
                        <template #error>
                            <div
                                class="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                <el-icon class="text-gray-400 text-2xl">
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>

                    <!-- 🔹 状态角标：添加 !z-20 确保层级，调整位置避免裁剪 -->
                    <el-tag :type="getStatusType(item)" size="small"
                        class="absolute -top-2.5 -right-2.5 !rounded-full shadow-sm !z-20 !text-xs !px-2 !py-0.5">
                        {{ getStatusText(item) }}
                    </el-tag>

                    <!-- 🔹 拒绝理由提示图标：调整位置 + 层级
                    <el-tooltip v-if="item.review_status === 'rejected' && item.review_reason"
                        :content="item.review_reason" placement="top" effect="dark"
                        :popper-options="{ placement: 'top' }">
                        <el-icon
                            class="absolute -bottom-2 -right-2 text-red-500 bg-white dark:bg-gray-800 rounded-full p-1 shadow cursor-help !z-20 hover:scale-110 transition-transform">
                            <Warning />
                        </el-icon>
                    </el-tooltip> -->
                </div>

                <!-- 🔹 商品信息 -->
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h4
                            class="font-semibold text-gray-800 dark:text-gray-100 text-base md:text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {{ item.title }}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                            {{ item.description || '暂无描述' }}
                        </p>

                        <!-- 🔹 审核拒绝理由：优化样式 -->
                        <div v-if="item.review_status === 'rejected' && item.review_reason"
                            class="mt-2 p-2 bg-red-50/80 dark:bg-red-900/30 rounded-lg border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                            <p class="text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
                                <el-icon class="!w-3.5 !h-3.5">
                                    <Warning />
                                </el-icon>
                                <span class="font-medium">拒绝理由：</span>
                                <span class="opacity-90">{{ item.review_reason }}</span>
                            </p>
                        </div>
                    </div>

                    <!-- 🔹 底部信息 -->
                    <!-- 🔹 底部信息区域（替换原代码） -->
                    <div
                        class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3">
                            <span class="text-red-500 font-bold text-lg md:text-xl">¥{{ formatPrice(item.price)
                                }}</span>
                            <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(item.created_at)
                                }}</span>
                        </div>

                        <!-- 🔹 操作按钮：始终显示，移除悬停逻辑 -->
                        <div class="flex items-center gap-1.5">

                            <!-- 🔸 审核拒绝：显示"修改重提"（最高优先级） -->
                            <el-button v-if="props.listType === 'published' && item.review_status === 'rejected'"
                                size="small" type="primary" @click.stop="emit('resubmit', item)"
                                class="!rounded-full !px-3 !py-1 !text-xs !h-7">
                                ✏️ 重提
                            </el-button>

                            <!-- 🔸 在售商品（审核通过 + 状态为 available）：显示"编辑" + "下架" -->
                            <template
                                v-if="props.listType === 'published' && item.review_status === 'approved' && item.status === 'available'">
                                <el-button size="small" @click.stop="emit('edit', item)"
                                    class="!rounded-full !px-3 !py-1 !text-xs !h-7" title="编辑商品">
                                    ✏️
                                </el-button>
                                <el-button size="small" type="danger" @click.stop="emit('delete', item)"
                                    class="!rounded-full !px-3 !py-1 !text-xs !h-7" title="下架商品">
                                    🗑️
                                </el-button>
                            </template>

                            <!-- 🔸 已售出/已下架：只显示"详情" -->

                            <!-- 🔸 通用：详情按钮（始终显示） -->
                            <el-button size="small" @click.stop="emit('view-detail', item)"
                                class="!rounded-full !px-3 !py-1 !text-xs !h-7" title="查看详情">
                                👁️
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🔸 分页 -->
        <div v-if="(props.pagination?.total ?? 0) > 0"
            class="flex justify-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :total="props.pagination?.total ?? 0" :page-sizes="[10, 20, 50]" layout="prev, pager, next, total"
                @current-change="handlePageChange" class="!text-sm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Picture, Warning } from "@element-plus/icons-vue"

const props = defineProps<{
    list: any[]
    loading: boolean
    pagination?: { page: number; limit: number; total: number }
    emptyText?: string
    listType?: 'published' | 'bought' | 'sold'
}>()

const emit = defineEmits<{
    (e: 'page-change', page: number): void
    (e: 'edit', item: any): void
    (e: 'delete', item: any): void
    (e: 'resubmit', item: any): void
    (e: 'view-detail', item: any): void
    (e: 'navigate-create'): void
    (e: 'navigate-products'): void
}>()

// 🔹 分页双向绑定
const currentPage = computed({
    get: () => props.pagination?.page || 1,
    set: (val) => emit('page-change', val)
})

const pageSize = computed({
    get: () => props.pagination?.limit || 20,
    set: () => { }
})

const handlePageChange = (page: number) => {
    emit('page-change', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}

const formatDate = (date: string) => {
    if (!date) return ''
    return date.slice(0, 10)
}

// 🔹 获取用于显示的状态（优先审核状态）
const getDisplayStatus = (item: any): string => {
    if (item.review_status === 'pending') return 'pending-review'
    if (item.review_status === 'rejected') return 'rejected'
    return item.status || 'unknown'
}

// 🔹 状态文案映射（双状态支持）
const getStatusText = (item: any): string => {
    const listType = props.listType || 'published'

    if (listType === 'published') {
        if (item.review_status === 'pending') return '⏳ 待审核'
        if (item.review_status === 'rejected') return '❌ 审核拒绝'

        const map: Record<string, string> = {
            available: '🟢 在售',
            sold: '🟡 已售出',
            deleted: '🔴 已下架',
            pending: '⏳ 审核中'
        }
        return map[item.status] || item.status || '未知'
    }

    const orderMap: Record<string, string> = {
        pending: listType === 'bought' ? '待付款' : '待确认',
        trading: listType === 'bought' ? '待收货' : '待发货',
        completed: '已完成',
        cancelled: '已取消'
    }
    return orderMap[item.status] || item.status || '未知'
}

// 🔹 状态标签颜色映射（双状态支持）
const getStatusType = (item: any): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const listType = props.listType || 'published'
    const validTypes = ['success', 'warning', 'danger', 'info', 'primary'] as const

    const getType = (map: Record<string, any>) => {
        const type = map[getDisplayStatus(item)] || 'info'
        return validTypes.includes(type) ? type : 'info'
    }

    if (listType === 'published') {
        return getType({
            'pending-review': 'info',
            'rejected': 'danger',
            'available': 'success',
            'sold': 'warning',
            'deleted': 'danger'
        })
    }

    return getType({
        pending: 'warning',
        trading: 'primary',
        completed: 'success',
        cancelled: 'danger'
    })
}

// 🔹 默认图片
const getDefaultImage = (displayStatus: string) => {
    const icons: Record<string, string> = {
        'pending-review': '⏳',
        'rejected': '❌',
        'available': '🟢',
        'sold': '🟡',
        'deleted': '🔴',
        'unknown': '📦'
    }
    const icon = icons[displayStatus] || '📦'
    return `image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle">${icon}</text></svg>`)}`
}

// 🔹 空状态副文案
const getEmptySubtext = (tab?: string) => {
    const map: Record<string, string> = {
        published: '发布闲置物品，开启你的校园交易之旅',
        bought: '成功购买后，订单记录会显示在这里',
        sold: '成功卖出后，订单记录会显示在这里'
    }
    return map[tab || ''] || '暂无相关数据'
}
</script>

<style scoped></style>