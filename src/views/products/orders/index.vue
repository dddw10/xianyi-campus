<!-- src/views/products/orders/index.vue -->
<template>
    <div class="w-90% my-4 md:w-60% md:my-12 mx-auto bg-[--card] rounded-2xl shadow-2xl">
        <!-- 页面标题 -->
        <div class="max-w-5xl mx-auto px-4 py-6">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                📦 我的订单
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
                管理您发布和交易的商品
            </p>
        </div>

        <!-- 订单列表 -->
        <div>
            <el-tabs v-model="activeTab" class="order-tabs" :stretch="true" @tab-change="handleTabChange">
                <el-tab-pane label="📤 我发布的" name="published">
                    <div class="mt-4 overflow-auto">
                        <PublishGoods ref="publishRef" />
                    </div>
                </el-tab-pane>

                <el-tab-pane label="🛒 我买到的" name="bought">
                    <div class="mt-4">
                        <BoughtOrders ref="boughtRef" />
                    </div>
                </el-tab-pane>

                <el-tab-pane label="💰 我卖出的" name="sold">
                    <div class="mt-4">
                        <SoldOrders ref="soldRef" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { TabPaneName } from 'element-plus'
import PublishGoods from './modules/publish-goods/index.vue'
import BoughtOrders from './modules/bought-goods/index.vue'
import SoldOrders from './modules/sold-goods/index.vue'

const route = useRoute()
const router = useRouter()

type OrderTab = 'published' | 'bought' | 'sold'
const activeTab = ref<OrderTab>('published')

const publishRef = ref<InstanceType<typeof PublishGoods>>()
const boughtRef = ref<InstanceType<typeof BoughtOrders>>()
const soldRef = ref<InstanceType<typeof SoldOrders>>()

// 🔥 类型守卫：校验 tab 名称是否合法
const isValidTab = (name: TabPaneName): name is OrderTab => {
    return ['published', 'bought', 'sold'].includes(name as OrderTab)
}

const syncTabFromRoute = () => {
    const type = route.query.type as TabPaneName
    if (isValidTab(type)) {
        activeTab.value = type
    }
}

watch(
    () => route.query.type,
    () => {
        syncTabFromRoute()
    }
)

// 🔥 修复：参数类型用 TabPaneName，内部校验后使用
const handleTabChange = (name: TabPaneName) => {
    if (!isValidTab(name)) {
        console.warn('⚠️ 非法的 tab 名称:', name)
        return
    }
    router.replace({
        query: { ...route.query, type: name }
    })
}

onMounted(() => {
    syncTabFromRoute()
})
</script>

<style scoped>
:deep(.order-tabs .el-tabs__nav-wrap::after) {
    @apply bg-gray-200 dark:bg-gray-700;
}

:deep(.order-tabs .el-tabs__item) {
    @apply font-medium text-gray-600 dark:text-gray-300;
}

:deep(.order-tabs .el-tabs__item.is-active) {
    @apply text-[--primary] font-semibold;
}
</style>