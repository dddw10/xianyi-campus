<template>
    <!-- 🔹 只修改外层 class，结构不变 -->
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50 ">

        <!-- 🔹 标签切换：添加美化 class -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="在售" name="available" />
            <el-tab-pane label="已售" name="sold" />
            <el-tab-pane label="已下架" name="deleted" />
        </el-tabs>

        <!-- 🔹 统一列表区域：添加美化 class -->
        <ProductList :list="productList" :loading="loading" :pagination="pagination"
            :empty-text="getEmptyText(tabPosition)" @page-change="handlePageChange" class="flex-1 ml-0 md:ml-4" />
    </div>
</template>

<script setup lang="ts">
// 🔹 script 完全不变，只保留你的原有逻辑
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import orderApi from "@/api/order"
import ProductList from "./modules/ProductList.vue"
import { useWindowSize } from "@vueuse/core";

const tabPosition = ref<'all' | 'available' | 'sold' | 'deleted'>('all')
const loading = ref(false)
const productList = ref<any[]>([])
const { width } = useWindowSize()

const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
    status: undefined as string | undefined
})

const fetchProducts = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            status: tabPosition.value === 'all' ? undefined : tabPosition.value
        }

        console.log('dawdwada', tabPosition.value)

        const res = await orderApi.getPublishGoods(params).then((res: any) => {
            console.log('📡 前端请求参数:', {
                page: params?.page,
                limit: params?.limit,
                status: params?.status,
                statusType: typeof params?.status
            })
            if (res?.code === 200) {
                productList.value = res.data.list
                pagination.total = res.data.pagination.total
            }
        })

    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || '加载失败')
    } finally {
        loading.value = false
    }
}

const handleTabChange = () => {
    pagination.page = 1
    fetchProducts()
}

const handlePageChange = (page: number) => {
    pagination.page = page
    fetchProducts()
}

const getEmptyText = (status: string) => {
    const map: Record<string, string> = {
        all: '暂无商品',
        available: '暂无在售商品',
        sold: '暂无已售商品',
        deleted: '暂无已下架商品'
    }
    return map[status] || '暂无数据'
}

fetchProducts()
</script>
