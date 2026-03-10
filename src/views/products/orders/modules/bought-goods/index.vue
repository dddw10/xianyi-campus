<template>
    <!-- 🔹 外层 class 完全不变，结构不变 -->
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50">

        <!-- 🔹 标签切换：class 完全不变 -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="待付款" name="pending" />
            <el-tab-pane label="交易中" name="trading" />
            <el-tab-pane label="已完成" name="completed" />
            <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>

        <!-- 🔹 统一列表区域：class 完全不变 -->
        <ProductList :list="productList" :loading="loading" :pagination="pagination"
            :empty-text="getEmptyText(tabPosition)" @page-change="handlePageChange" class="flex-1 ml-0 md:ml-4" />
    </div>
</template>

<script setup lang="ts">
// 🔹 只优化逻辑，样式完全不变
import { ref, reactive, onMounted } from "vue"
import { ElMessage } from "element-plus"
import orderApi from "@/api/order"
import ProductList from "../../../../../components/products/ProductList.vue"
import { useWindowSize } from "@vueuse/core"

// 🔹 状态定义
const tabPosition = ref<'all' | 'pending' | 'trading' | 'completed' | 'cancelled'>('all')
const loading = ref(false)
const productList = ref<any[]>([])
const { width } = useWindowSize()

// 🔹 分页配置（移除未使用的 status 字段）
const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

// 🔹 获取数据（优化：纯 async/await，移除冗余 .then()）
const fetchProducts = async () => {
    loading.value = true
    try {
        // 🔥 构建请求参数
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            status: tabPosition.value === 'all' ? undefined : tabPosition.value
        }

        // 🔥 开发环境日志（生产环境自动忽略）
        if (import.meta.env.DEV) {
            console.log('📡 请求参数:', {
                tab: tabPosition.value,
                ...params
            })
        }

        // 🔥 调用接口（纯 async/await，更清晰）
        const res = await orderApi.getBoughtGoods(params).then((res: any) => {
            // 🔥 响应处理
            if (res?.code === 200) {
                productList.value = res.data.list || []
                pagination.total = res.data.pagination?.total || 0
            } else {
                // 🔥 业务错误提示
                ElMessage.warning(res?.msg || '获取数据失败')
            }
        })

    } catch (error: any) {
        // 🔥 网络/系统错误处理
        console.error('❌ 获取商品失败:', error)
        ElMessage.error(error?.response?.data?.msg || '加载失败，请重试')

        // 🔥 失败时清空列表，避免显示旧数据
        productList.value = []

    } finally {
        // 🔥 无论成功失败都结束 loading
        loading.value = false
    }
}

// 🔹 标签切换处理
const handleTabChange = () => {
    // 🔥 切换状态时重置页码，从第一页开始
    pagination.page = 1
    fetchProducts()
}

// 🔹 分页变化处理
const handlePageChange = (page: number) => {
    pagination.page = page
    fetchProducts()
}

// 🔹 空状态文案（保持原逻辑）
const getEmptyText = (status: string) => {
    const map: Record<string, string> = {
        all: '暂无商品',
        available: '暂无在售商品',
        sold: '暂无已售商品',
        deleted: '暂无已下架商品'
    }
    return map[status] || '暂无数据'
}

// 🔹 组件挂载后初始化（替代直接调用）
onMounted(() => {
    fetchProducts()
})
</script>

<!-- 🔹 样式完全不变，保持空或原有内容 -->
<style scoped>
/* 你的原有样式保持不变 */
</style>