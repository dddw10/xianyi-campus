<!-- src/views/products/orders/index.vue -->
<template>
    <div
        class="flex flex-col md:flex-row p-4 md:p-6 pt-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50">

        <!-- 🔹 标签切换：区分审核状态 + 商品状态 -->
        <el-tabs v-model="tabPosition" @tab-change="handleTabChange" :tab-position="width > 768 ? 'left' : 'top'"
            class="mb-4 order-tabs flex-shrink-0">

            <!-- 🔸 审核状态标签（卖家看审核流程） -->
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="⏳ 待审核" name="pending-review" /> <!-- 🔥 review_status=pending -->
            <el-tab-pane label="❌ 被拒绝" name="rejected" /> <!-- 🔥 review_status=rejected -->

            <!-- 🔸 商品状态标签（卖家看商品展示状态） -->
            <el-tab-pane label="🟢 在售" name="available" /> <!-- 🔥 status=available -->
            <el-tab-pane label="🟡 已售出" name="sold" /> <!-- 🔥 status=sold -->
            <el-tab-pane label="🔴 已下架" name="deleted" /> <!-- 🔥 status=deleted -->
        </el-tabs>

        <ProductList :list="productList" :loading="loading" :pagination="pagination"
            :empty-text="getEmptyText(tabPosition)" @page-change="handlePageChange" list-type="published"
            class="flex-1 ml-0 md:ml-4" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage } from "element-plus"
import orderApi from "@/api/order"
import ProductList from "../../../../../components/products/ProductList.vue"
import { useWindowSize } from "@vueuse/core"

// 🔹 标签类型（区分审核状态和商品状态）
type TabType =
    | 'all'
    | 'pending-review'  // 🔥 审核状态：待审核
    | 'rejected'        // 🔥 审核状态：被拒绝
    | 'available'       // 🔥 商品状态：在售
    | 'sold'            // 🔥 商品状态：已售出
    | 'deleted'         // 🔥 商品状态：已下架

const tabPosition = ref<TabType>('all')
const loading = ref(false)
const productList = ref<any[]>([])
const { width } = useWindowSize()
const pagination = reactive({ page: 1, limit: 20, total: 0 })

// 🔹 获取数据：区分 review_status 和 status 传参
const fetchProducts = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            page: pagination.page,
            limit: pagination.limit
        }

        const tab = tabPosition.value

        // 🔥 审核状态筛选（传 review_status）
        if (tab === 'pending-review') {
            params.review_status = 'pending'
        } else if (tab === 'rejected') {
            params.review_status = 'rejected'
        }
        // 🔥 商品状态筛选（传 status = product_status）
        else if (tab === 'available' || tab === 'sold' || tab === 'deleted') {
            params.status = tab
        }
        // 🔥 'all' 时不传任何筛选

        if (import.meta.env.DEV) {
            console.log('📡 我的商品请求参数:', { tab, ...params })
        }

        const res = await orderApi.getPublishGoods(params).then((res: any) => {
            if (res?.code === 200) {
                productList.value = res.data.list || []
                pagination.total = res.data.pagination?.total || 0
            } else {
                ElMessage.warning(res?.msg || '获取数据失败')
            }
        })


    } catch (error: any) {
        console.error('❌ 获取我的商品失败:', error)
        ElMessage.error(error?.response?.data?.msg || '加载失败')
        productList.value = []
    } finally {
        loading.value = false
    }
}

const handleTabChange = () => { pagination.page = 1; fetchProducts() }
const handlePageChange = (page: number) => { pagination.page = page; fetchProducts() }

const getEmptyText = (tab: TabType) => {
    const map: Record<TabType, string> = {
        all: '暂无商品',
        'pending-review': '暂无待审核商品',
        rejected: '暂无被拒绝商品',
        available: '暂无在售商品',
        sold: '暂无已售商品',
        deleted: '暂无已下架商品'
    }
    return map[tab] || '暂无数据'
}

onMounted(() => { fetchProducts() })
</script>