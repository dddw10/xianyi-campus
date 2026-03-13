<!-- src/views/products/orders/modules/ProductList.vue -->
<template>
    <div v-loading="props.loading" element-loading-text="加载中..." class="w-full ">

        <!-- 🔸 空状态：绝对定位 + 完美居中 -->
        <div v-if="props.list.length === 0 && !props.loading" class=" text-center p-4 z-10">

            <!-- 图标 -->
            <div class="text-6xl mb-4 animate-bounce">📦</div>

            <!-- 标题 -->
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {{ props.emptyText || '暂无数据' }}
            </h3>

            <!-- 副文案 -->
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 ">
                {{ getEmptySubtext(props.listType) }}
            </p>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-center gap-3">
                <el-button v-if="props.listType === 'published'" type="primary" @click="router.push('/products/create')"
                    class="!rounded-full !px-6 !py-2.5 shadow-md hover:shadow-lg transition-shadow">
                    🚀 发布商品
                </el-button>
                <el-button v-else @click="router.push('/products')" class="!rounded-full !px-6 !py-2.5">
                    🛍️ 浏览商品
                </el-button>
            </div>
        </div>

        <!-- 🔸 商品列表 -->
        <div v-else class="space-y-4">
            <div v-for="item in props.list" :key="item.id" @click="handleCardClick(item)"
                class="product-card relative flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">

                <!-- 🔹 商品图片区域 -->
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

                    <!-- 🔹 状态角标 -->
                    <el-tag :type="getStatusType(item)" size="small"
                        class="absolute -top-2.5 -right-2.5 !rounded-full shadow-sm !z-20 !text-xs !px-2 !py-0.5">
                        {{ getStatusText(item) }}
                    </el-tag>
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

                        <!-- 🔹 审核拒绝理由 -->
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

                    <!-- 🔹 底部信息 + 简化后的操作按钮 -->
                    <div
                        class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3">
                            <span class="text-red-500 font-bold text-lg md:text-xl">¥{{ formatPrice(item.price)
                            }}</span>
                            <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(item.created_at)
                            }}</span>
                        </div>

                        <!-- 🔥 简化：只保留编辑 + 下架两个按钮 -->
                        <div class="flex items-center gap-1.5" @click.stop>
                            <!-- ✅ 通用编辑按钮：重提/修改都显示「✏️ 编辑」 -->
                            <el-button v-if="canEdit(item)" size="small" @click="handleEdit(item)"
                                class="!rounded-full !px-3 !py-1 !text-xs !h-7" title="编辑商品">
                                ✏️ 编辑
                            </el-button>

                            <!-- ✅ 下架按钮：仅在售商品显示 -->
                            <el-button v-if="canDelete(item)" size="small" type="danger" @click="handleDelete(item)"
                                class="!rounded-full !px-3 !py-1 !text-xs !h-7" title="下架商品">
                                🗑️ 下架
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🔸 分页（保持不变） -->
        <div v-if="(props.pagination?.total ?? 0) > 0"
            class="flex justify-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :total="props.pagination?.total ?? 0" :page-sizes="[10, 20, 50]" layout="prev, pager, next, total"
                @current-change="handlePageChange" class="!text-sm" />
        </div>
    </div>

    <!-- 🔹 编辑弹窗（统一入口，根据 mode 显示不同状态） -->
    <EditProductModal v-if="showEditModal" :product="editingProduct" :mode="editMode" @close="showEditModal = false"
        @success="handleEditSuccess" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { Picture, Warning } from "@element-plus/icons-vue"
import EditProductModal from "@/components/products/EditProductModal.vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import productApi from "@/api/product"  // 🔥 用于下架接口
import { modalBox } from "@/components/messageBox/modalBox";

const router = useRouter()
const showEditModal = ref(false)
const editingProduct = ref<any>(null)
const editMode = ref<'edit' | 'resubmit' | 'view'>('edit')  // 🔥 弹窗模式

const props = defineProps<{
    list: any[]
    loading: boolean
    pagination?: { page: number; limit: number; total: number }
    emptyText?: string
    listType?: 'published' | 'bought' | 'sold'
}>()

const emit = defineEmits<{
    (e: 'page-change', page: number): void;
    (e: 'refresh-list'): void;
    (e: 'navigate-create'): void;
    (e: 'navigate-products'): void;
}>()

// 🔹 分页双向绑定（保持不变）
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

// 🔥 准备商品数据（确保弹窗能正常显示）
const prepareProductData = (item: any) => {
    const data = { ...item }

    // 价格转数字
    if (data.price) data.price = parseFloat(data.price)

    // 图片转数组
    if (data.images) {
        if (typeof data.images === 'string') {
            try { data.images = JSON.parse(data.images) }
            catch { data.images = [data.images] }
        }
        if (!Array.isArray(data.images)) data.images = [data.images]
    } else {
        data.images = []
    }

    return data
}

// 🔥 统一编辑入口：内部自动判断是「重提」还是「修改」
const handleEdit = (item: any) => {
    // 🔥 自动判断模式：审核拒绝 → 重提，其他 → 编辑
    const mode = item.review_status === 'rejected' ? 'resubmit' : 'edit'
    openEditModal(item, mode)
}

// 🔥 弹窗标题/按钮文案根据 mode 自动变化（在 EditProductModal 中处理）
const openEditModal = (item: any, mode: 'edit' | 'resubmit' | 'view') => {
    editingProduct.value = prepareProductData(item)
    editMode.value = mode
    showEditModal.value = true
}

// 🔥 查看详情（只读模式）
const handleViewDetail = (item: any) => {
    openEditModal(item, 'view')
}

// 🔥 卡片点击：跳转到详情页（买家视角）
const handleCardClick = (item: any) => {
    router.push(`/products/detail/${item.id}`)
}

// 🔥 下架：本地更新状态 + 调用接口
const handleDelete = async (item: any) => {
    try {
        await modalBox({
            type: 'error',
            title: '下架商品',
            message: '确定要下架此商品吗？下架后将不在公共列表显示'
        }).then(async () => {
            // 🔥 调用接口下架
            await productApi.updateProduct(item.id, {
                title: item.title,  // 后端需要完整数据
                description: item.description,
                price: item.price,
                category: item.category,
                images: item.images,
                action: 'delete'  // 🔥 关键：告诉后端执行下架
            })
        })

        // 🔥 本地更新状态（避免重新请求列表，体验更流畅）
        const index = props.list.findIndex(p => p.id === item.id)
        if (index !== -1) {
            // 🔥 用展开运算符保持响应式
            props.list[index] = {
                ...props.list[index],
                status: 'deleted',
                review_status: 'approved'  // 下架后审核状态保持 approved
            }
        }

        ElMessage.success('商品已下架')
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('下架失败，请重试')
        }
    }
}

// 🔥 编辑成功回调
const handleEditSuccess = (updatedProduct?: any) => {
    showEditModal.value = false

    // 🔥 只通知父组件刷新，不操作 props.list
    emit('refresh-list')

    ElMessage.success(editMode.value === 'resubmit' ? '已重新提交审核' : '商品已更新')
    editMode.value = 'edit'
    // setTimeout(() => {
    //     window.location.reload()
    // }, 100)
}

// 🔹 判断是否可编辑（修复版）
const canEdit = (item: any): boolean => {
    if (props.listType !== 'published') return false

    // 🔥 安全获取状态值（处理大小写/空格/undefined）
    const reviewStatus = String(item.review_status ?? '').trim().toLowerCase()
    const status = String(item.status ?? '').trim().toLowerCase()

    // 审核拒绝 → 可重提
    if (reviewStatus === 'rejected') return true

    // 🔥 审核通过 + (在售 或 已下架) → 可编辑
    if (reviewStatus === 'approved' &&
        (status === 'available' || status === 'deleted')) {
        return true
    }

    // 审核中 → 可修改
    if (reviewStatus === 'pending') return true

    return false
}

// 🔹 判断是否可下架
const canDelete = (item: any) => {
    if (props.listType !== 'published') return false
    // 只有「审核通过 + 在售」的商品才能下架
    return item.review_status === 'approved' && item.status === 'available'
}

// 🔹 工具函数（保持不变）
const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return Number.isNaN(num) ? '0.00' : num.toFixed(2)
}
const formatDate = (date: string) => {
    if (!date) return ''
    return date.slice(0, 10)
}
const getDisplayStatus = (item: any): string => {
    if (item.review_status === 'pending') return 'pending-review'
    if (item.review_status === 'rejected') return 'rejected'
    return item.status || 'unknown'
}
const getStatusText = (item: any): string => {
    const listType = props.listType || 'published'
    if (listType === 'published') {
        if (item.review_status === 'pending') return '⏳ 待审核'
        if (item.review_status === 'rejected') return '❌ 审核拒绝'
        const map: Record<string, string> = {
            available: '🟢 在售', sold: '🟡 已售出', deleted: '🔴 已下架', pending: '⏳ 审核中'
        }
        return map[item.status] || item.status || '未知'
    }
    const orderMap: Record<string, string> = {
        pending: listType === 'bought' ? '待付款' : '待确认',
        trading: listType === 'bought' ? '待收货' : '待发货',
        completed: '已完成', cancelled: '已取消'
    }
    return orderMap[item.status] || item.status || '未知'
}
const getStatusType = (item: any): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const listType = props.listType || 'published'
    const validTypes = ['success', 'warning', 'danger', 'info', 'primary'] as const
    const getType = (map: Record<string, any>) => {
        const type = map[getDisplayStatus(item)] || 'info'
        return validTypes.includes(type) ? type : 'info'
    }
    if (listType === 'published') {
        return getType({ 'pending-review': 'info', 'rejected': 'danger', 'available': 'success', 'sold': 'warning', 'deleted': 'danger' })
    }
    return getType({ pending: 'warning', trading: 'primary', completed: 'success', cancelled: 'danger' })
}
const getDefaultImage = (displayStatus: string) => {
    const icons: Record<string, string> = {
        'pending-review': '⏳', 'rejected': '❌', 'available': '🟢', 'sold': '🟡', 'deleted': '🔴', 'unknown': '📦'
    }
    const icon = icons[displayStatus] || '📦'
    return `image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="middle">${icon}</text></svg>`)}`
}
const getEmptySubtext = (tab?: string) => {
    const map: Record<string, string> = {
        published: '发布闲置物品，开启你的校园交易之旅',
        bought: '成功购买后，订单记录会显示在这里',
        sold: '成功卖出后，订单记录会显示在这里'
    }
    return map[tab || ''] || '暂无相关数据'
}
</script>

<style scoped>
.product-card:active {
    @apply scale-[0.99] transition-transform;
}
</style>