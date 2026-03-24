<!-- src/views/admin/dashboard/Index.vue -->
<template>
    <div
        class="p-4 md:p-6 min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900/50 dark:to-gray-800/50">
        <!-- 🔹 头部 -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-[var(--el-text-color-primary)]">📊 数据看板</h1>
            <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">
                平台运营数据概览 · 最后更新：{{ lastUpdateTime }}
            </p>
        </div>

        <!-- 🔹 核心指标卡片 -->
        <el-row :gutter="16" class="mb-6">
            <!-- 👥 用户数据 -->
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card shadow="hover" class="stats-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">用户总数</p>
                            <p class="text-2xl font-bold text-blue-600 mt-1">
                                {{ stats.users?.total ?? 0 }}
                            </p>
                            <p class="text-xs text-green-500 mt-1">
                                +{{ stats.users?.todayNew ?? 0 }} 今日新增
                            </p>
                        </div>
                        <el-icon class="text-4xl text-blue-200">
                            <User />
                        </el-icon>
                    </div>
                </el-card>
            </el-col>

            <!-- 📦 商品数据 -->
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card shadow="hover" class="stats-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">商品总数</p>
                            <p class="text-2xl font-bold text-orange-600 mt-1">
                                {{ stats.products?.total ?? 0 }}
                            </p>
                            <p class="text-xs text-green-500 mt-1">
                                +{{ stats.products?.todayNew ?? 0 }} 今日上架
                            </p>
                        </div>
                        <el-icon class="text-4xl text-orange-200">
                            <Goods />
                        </el-icon>
                    </div>
                </el-card>
            </el-col>

            <!-- 💰 订单数据 -->
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card shadow="hover" class="stats-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">订单总数</p>
                            <p class="text-2xl font-bold text-purple-600 mt-1">
                                {{ stats.orders?.total ?? 0 }}
                            </p>
                            <p class="text-xs text-green-500 mt-1">
                                ¥{{ stats.orders?.todayAmount ?? 0 }} 今日成交
                            </p>
                        </div>
                        <el-icon class="text-4xl text-purple-200">
                            <ShoppingCart />
                        </el-icon>
                    </div>
                </el-card>
            </el-col>

            <!-- ⚠️ 待处理事项 -->
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card shadow="hover" class="stats-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">待处理申诉</p>
                            <p class="text-2xl font-bold text-red-600 mt-1">
                                {{ stats.appeals?.pending ?? 0 }}
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                {{ stats.reports?.pending ?? 0 }} 待处理举报
                            </p>
                        </div>
                        <el-icon class="text-4xl text-red-200">
                            <Warning />
                        </el-icon>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 🔹 快捷操作 -->
        <el-card class="mb-6" shadow="never">
            <template #header>
                <div class="flex items-center gap-2">
                    <el-icon>
                        <Operation />
                    </el-icon>
                    <span class="font-medium">快捷操作</span>
                </div>
            </template>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <el-button v-for="item in quickActions" :key="item.path" :type="item.type" plain class="h-auto py-3"
                    @click="$router.push(item.path)">
                    <el-icon class="mr-1">
                        <component :is="item.icon" />
                    </el-icon>
                    <div>
                        <div class="font-medium">{{ item.label }}</div>
                        <div class="text-xs text-gray-400">{{ item.desc }}</div>
                    </div>
                </el-button>
            </div>
        </el-card>

        <!-- 🔹 图表区域 -->
        <el-row :gutter="16" class="mb-6">
            <!-- 📈 趋势折线图（✅ 同时显示订单+用户，移除切换按钮） -->
            <el-col :xs="24" :lg="16">
                <el-card shadow="never">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                            <span class="font-medium">近 7 天数据趋势</span>
                        </div>
                    </template>
                    <div ref="trendChartRef" class="h-64"></div>
                </el-card>
            </el-col>

            <!-- 🥧 分类饼图 -->
            <el-col :xs="24" :lg="8">
                <el-card shadow="never">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <PieChart />
                            </el-icon>
                            <span class="font-medium">商品分类占比</span>
                        </div>
                    </template>
                    <div ref="categoryChartRef" class="h-64"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 🔹 最新动态 -->
        <el-row :gutter="16">
            <!-- 📋 最新订单 -->
            <el-col :xs="24" :lg="12">
                <el-card shadow="never">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">📋 最新订单</span>
                            <el-button link type="primary" size="small" @click="$router.push('/admin/orders')">
                                查看更多
                            </el-button>
                        </div>
                    </template>
                    <el-table :data="stats.recent?.orders || []" size="small" :show-header="false">
                        <el-table-column>
                            <template #default="{ row }">
                                <div class="flex justify-between items-center py-2">
                                    <div>
                                        <p class="text-sm font-medium">{{ row.product }}</p>
                                        <p class="text-xs text-gray-400">
                                            {{ row.buyer }} · {{ row.orderNo }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-bold text-orange-500">
                                            ¥{{ row.amount }}
                                        </p>
                                        <el-tag size="small" :type="getStatusType(row.status)">
                                            {{ getStatusText(row.status) }}
                                        </el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>

            <!-- ⚠️ 最新申诉 -->
            <el-col :xs="24" :lg="12">
                <el-card shadow="never">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">⚠️ 最新申诉</span>
                            <el-button link type="primary" size="small" @click="$router.push('/admin/appeals')">
                                查看更多
                            </el-button>
                        </div>
                    </template>
                    <el-table :data="stats.recent?.appeals || []" size="small" :show-header="false">
                        <el-table-column>
                            <template #default="{ row }">
                                <div class="flex justify-between items-center py-2">
                                    <div>
                                        <p class="text-sm font-medium line-clamp-1">
                                            {{ row.reason }}
                                        </p>
                                        <p class="text-xs text-gray-400">
                                            {{ row.buyer }} · {{ row.orderNo }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <el-tag size="small" :type="getAppealStatusType(row.status)">
                                            {{ getAppealStatusText(row.status) }}
                                        </el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import {
    User,
    Goods,
    ShoppingCart,
    Warning,
    Operation,
    TrendCharts,
    PieChart,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import adminApi from '@/api/admin'

// ============================================================================
// 🔥 响应式数据
// ============================================================================
const stats = ref<any>({})
const lastUpdateTime = ref('')
const trendChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

// ============================================================================
// 🔥 快捷操作配置（✅ computed 自动响应式更新）
// ============================================================================
const quickActions = computed(() => [
    {
        label: '待审核申诉',
        desc: `${stats.value?.appeals?.pending ?? 0} 条待处理`,
        path: '/admin/appeals',
        type: 'warning' as const,
        icon: 'Warning' as const,
    },
    {
        label: '待审核用户',
        desc: '身份认证审核',
        path: '/admin/user-review',
        type: 'primary' as const,
        icon: 'User' as const,
    },
    {
        label: '待审核商品',
        desc: `${stats.value?.products?.pendingReview ?? 0} 件待上架`,
        path: '/admin/product-review',
        type: 'success' as const,
        icon: 'Goods' as const,
    },
    {
        label: '待处理举报',
        desc: `${stats.value?.reports?.pending ?? 0} 条待处理`,
        path: '/admin/reports',
        type: 'danger' as const,
        icon: 'Warning' as const,
    },
])

// ============================================================================
// 🔥 工具函数
// ============================================================================
const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: '待付款',
        paid: '待发货',
        trading: '待收货',
        completed: '已完成',
        cancelled: '已取消',
    }
    return map[status] || status
}

const getStatusType = (
    status: string
): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    const map: Record<string, any> = {
        pending: 'warning',
        paid: 'primary',
        trading: 'primary',
        completed: 'success',
        cancelled: 'info',
    }
    return map[status] || 'info'
}

const getAppealStatusText = (status: string) => {
    const map: Record<string, string> = {
        pending: '审核中',
        approved: '已通过',
        rejected: '已驳回',
    }
    return map[status] || status
}

const getAppealStatusType = (
    status: string
): 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, any> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
    }
    return map[status] || 'info'
}

// ============================================================================
// 🔥 API 调用
// ============================================================================
const fetchStats = async () => {
    try {
        const res = await adminApi.getDashboardStats()
        if ((res as any).code === 200) {
            stats.value = res.data
            lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
            renderCharts()
        }
    } catch (error: any) {
        console.error('❌ 获取数据面板失败:', error)
    }
}

// 🔥 获取趋势数据（✅ 只请求一次）
const fetchTrendData = async () => {
    try {
        const res = await adminApi.getDashboardTrend()
        if ((res as any).code === 200) {
            updateTrendChart(res.data)
        }
    } catch (error: any) {
        console.error('❌ 获取趋势数据失败:', error)
    }
}

// ============================================================================
// 🔥 图表渲染
// ============================================================================
const renderCharts = () => {
    renderTrendChart()
    renderCategoryChart()
}

// 🔥 渲染趋势折线图（✅ 同时显示订单+用户两条线）
const renderTrendChart = () => {
    if (!trendChartRef.value) return

    trendChart = echarts.init(trendChartRef.value)

    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['订单数', '用户新增'], bottom: 0 },
        grid: {
            left: '3%',
            right: '3%',
            top: '15%',
            bottom: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [] as string[],
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [
            {
                name: '订单数',
                type: 'line',
                smooth: true,
                data: [] as number[],
                itemStyle: { color: '#3b82f6' },
                areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
            },
            {
                name: '用户新增',
                type: 'line',
                smooth: true,
                data: [] as number[],
                itemStyle: { color: '#22c55e' },
                areaStyle: { color: 'rgba(34, 197, 94, 0.1)' },
            },
        ],
    }

    trendChart.setOption(option)
    fetchTrendData()
}

// 🔥 更新趋势图表数据（✅ 同时更新两条线）
const updateTrendChart = (data: {
    dates: string[]
    orders: number[]
    users: number[]
}) => {
    if (!trendChart) return

    trendChart.setOption({
        xAxis: { data: data.dates },
        series: [
            { name: '订单数', data: data.orders },
            { name: '用户新增', data: data.users },
        ],
    })
}

// 🔥 渲染分类饼图
const renderCategoryChart = () => {
    if (!categoryChartRef.value) return

    categoryChart = echarts.init(categoryChartRef.value)

    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            itemWidth: 10,
            itemHeight: 10,
        },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                data: stats.value.categories || [],
            },
        ],
    }

    categoryChart.setOption(option)
}

// ============================================================================
// 🔥 生命周期
// ============================================================================
onMounted(() => {
    fetchStats()

    // 🔥 每 5 分钟自动刷新
    const timer = setInterval(fetchStats, 5 * 60 * 1000)
    onBeforeUnmount(() => clearInterval(timer))
})

onBeforeUnmount(() => {
    trendChart?.dispose()
    categoryChart?.dispose()
})
</script>

<style scoped>
.stats-card {
    transition: transform 0.2s;
}

.stats-card:hover {
    transform: translateY(-2px);
}

:deep(.el-card__header) {
    padding: 12px 16px;
}

:deep(.el-table) {
    --el-table-border-color: transparent;
}

:deep(.el-table__row) {
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
}
</style>