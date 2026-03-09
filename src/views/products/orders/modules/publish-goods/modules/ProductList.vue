<!-- src/views/products/orders/components/ProductList.vue -->
<template>
    <!-- 🔥 直接用 props.loading -->
    <div v-loading="props.loading">

        <!-- 空状态：直接用 props.list -->
        <div v-if="props.list.length === 0 && !props.loading" class="text-center py-12">
            <div class="text-4xl mb-2">📦</div>
            <p class="text-gray-500">{{ props.emptyText || '暂无数据' }}</p>
        </div>

        <!-- 商品列表：直接用 props.list -->
        <div v-else class="space-y-4">
            <div v-for="item in props.list" :key="item.id"
                class="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <el-image :src="item.images?.[0]" class="w-20 h-20 rounded-lg object-cover bg-gray-100" fit="cover" />
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-gray-100 truncate">{{ item.title }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ item.description }}</p>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-red-500 font-bold">¥{{ item.price }}</span>
                        <el-tag size="small" :type="getStatusType(item.status)">
                            {{ getStatusText(item.status) }}
                        </el-tag>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页：用 props.pagination?.total -->
        <div v-if="props.pagination?.total > 0" class="flex justify-center mt-4">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :total="props.pagination.total" :page-sizes="[10, 20, 50]" layout="prev, pager, next"
                @current-change="handlePageChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
// 🔥 不需要解构，直接用 props
const props = withDefaults(defineProps<{
    list: any[]
    loading: boolean
    pagination?: { page: number; limit: number; total: number }
    emptyText?: string
}>(), {
    pagination: () => ({ page: 1, limit: 10, total: 0 })
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
}>()

// 🔥 分页用本地状态，避免双向绑定警告
const currentPage = computed({
    get: () => props.pagination?.page || 1,
    set: (val) => emit('page-change', val)
})

const pageSize = computed({
    get: () => props.pagination?.limit || 10,
    set: (val) => emit('page-change', currentPage.value)  // 简单处理
})

const handlePageChange = (page: number) => {
    emit('page-change', page)
}

// 🔥 状态映射函数（保持不变）
const getStatusType = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
        available: 'success',
        sold: 'warning',
        deleted: 'danger'
    }
    return map[status] || 'info'
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        available: '在售',
        sold: '已售出',
        deleted: '已下架'
    }
    return map[status] || status
}
</script>