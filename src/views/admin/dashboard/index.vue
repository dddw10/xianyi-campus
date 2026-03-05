<!-- src/views/admin/dashboard/index.vue -->
<template>
    <div class="space-y-6">

        <!-- 🔹 页面标题 -->
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-$el-text-color-primary">数据看板</h2>
            <el-button type="primary" :icon="Refresh" @click="refreshData">
                刷新数据
            </el-button>
        </div>

        <!-- 🔹 第一层：核心 KPI 卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <!-- 用户统计 -->
            <el-card class="stats-card" shadow="hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">总用户数</p>
                        <p class="text-2xl font-bold text-$el-text-color-primary mt-1">
                            {{ stats.totalUsers?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-$el-color-success mt-1 flex items-center gap-1">
                            <el-icon>
                                <Top />
                            </el-icon>
                            +{{ stats.newUsersToday }} 今日新增
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <el-icon class="text-blue-600 text-xl">
                            <User />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 已认证用户 -->
            <el-card class="stats-card" shadow="hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">已认证用户</p>
                        <p class="text-2xl font-bold text-$el-text-color-primary mt-1">
                            {{ stats.verifiedUsers?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-$el-text-color-secondary mt-1">
                            认证率 {{ stats.verificationRate }}%
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <el-icon class="text-green-600 text-xl">
                            <Checked />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 待审核用户 🔴 -->
            <el-card class="stats-card border-l-4 border-l-orange-500" shadow="hover"
                @click="router.push('/admin/user-review')">
                <div class="flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">待审核用户</p>
                        <p class="text-2xl font-bold text-orange-500 mt-1">
                            {{ stats.pendingUserReviews?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-orange-500 mt-1 flex items-center gap-1">
                            <el-icon>
                                <Bell />
                            </el-icon>
                            请及时处理
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <el-icon class="text-orange-600 text-xl">
                            <UserFilled />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 待处理举报 🔴 -->
            <el-card class="stats-card border-l-4 border-l-red-500" shadow="hover"
                @click="router.push('/admin/report-management')">
                <div class="flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">待处理举报</p>
                        <p class="text-2xl font-bold text-red-500 mt-1">
                            {{ stats.pendingReports?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <el-icon>
                                <Warning />
                            </el-icon>
                            高风险
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <el-icon class="text-red-600 text-xl">
                            <WarningFilled />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 商品统计 -->
            <el-card class="stats-card" shadow="hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">总商品数</p>
                        <p class="text-2xl font-bold text-$el-text-color-primary mt-1">
                            {{ stats.totalProducts?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-$el-color-success mt-1 flex items-center gap-1">
                            <el-icon>
                                <Top />
                            </el-icon>
                            +{{ stats.newProductsToday }} 今日新增
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <el-icon class="text-purple-600 text-xl">
                            <Goods />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 已上架商品 -->
            <el-card class="stats-card" shadow="hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">已上架商品</p>
                        <p class="text-2xl font-bold text-$el-text-color-primary mt-1">
                            {{ stats.approvedProducts?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-$el-text-color-secondary mt-1">
                            上架率 {{ stats.approvalRate }}%
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                        <el-icon class="text-cyan-600 text-xl">
                            <Sell />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 待审核商品 🔴 -->
            <el-card class="stats-card border-l-4 border-l-orange-500" shadow="hover"
                @click="router.push('/admin/product-review')">
                <div class="flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">待审核商品</p>
                        <p class="text-2xl font-bold text-orange-500 mt-1">
                            {{ stats.pendingProductReviews?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-orange-500 mt-1 flex items-center gap-1">
                            <el-icon>
                                <Clock />
                            </el-icon>
                            平均等待 {{ stats.avgReviewTime }}h
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <el-icon class="text-orange-600 text-xl">
                            <Document />
                        </el-icon>
                    </div>
                </div>
            </el-card>

            <!-- 今日交易（可选） -->
            <el-card class="stats-card" shadow="hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-$el-text-color-secondary">今日互动</p>
                        <p class="text-2xl font-bold text-$el-text-color-primary mt-1">
                            {{ stats.todayInteractions?.toLocaleString() || '--' }}
                        </p>
                        <p class="text-xs text-$el-text-color-secondary mt-1">
                            留言 + 收藏 + 举报
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <el-icon class="text-pink-600 text-xl">
                            <ChatDotRound />
                        </el-icon>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 🔹 第二层：趋势图表 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- 用户增长趋势 -->
            <el-card class="chart-card" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">用户增长趋势</span>
                        <el-radio-group v-model="userChartRange" size="small">
                            <el-radio-button label="7d">7 天</el-radio-button>
                            <el-radio-button label="30d">30 天</el-radio-button>
                        </el-radio-group>
                    </div>
                </template>
                <div ref="userChartRef" class="h-64"></div>
            </el-card>

            <!-- 商品分类分布 -->
            <el-card class="chart-card" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">商品分类分布</span>
                        <el-button link size="small" @click="refreshCategoryChart">刷新</el-button>
                    </div>
                </template>
                <div ref="categoryChartRef" class="h-64"></div>
            </el-card>
        </div>

        <!-- 🔹 第三层：待办事项 + 快捷操作 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- 待办事项 -->
            <el-card class="todo-card" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium flex items-center gap-2">
                            <el-icon class="text-orange-500">
                                <Bell />
                            </el-icon>
                            待办事项
                        </span>
                        <el-badge :value="totalPending" :max="99" type="danger" />
                    </div>
                </template>
                <div class="space-y-3">
                    <div v-for="item in pendingTasks" :key="item.type"
                        class="flex items-center justify-between p-3 rounded-lg bg-$el-fill-color-light hover:bg-$el-fill-color-darker transition-colors cursor-pointer"
                        @click="router.push(item.link)">
                        <div class="flex items-center gap-3">
                            <el-icon :class="item.iconClass">
                                <component :is="item.icon" />
                            </el-icon>
                            <div>
                                <p class="text-sm font-medium text-$el-text-color-primary">{{ item.title }}</p>
                                <p class="text-xs text-$el-text-color-secondary">{{ item.desc }}</p>
                            </div>
                        </div>
                        <el-tag size="small" :
                        
                        
                        ="item.tagType" effect="plain">
                            {{ item.count }}
                        </el-tag>
                    </div>
                </div>
            </el-card>

            <!-- 快捷操作 -->
            <el-card class="quick-actions-card" shadow="hover">
                <template #header>
                    <span class="font-medium">快捷操作</span>
                </template>
                <div class="grid grid-cols-2 gap-3">
                    <el-button v-for="action in quickActions" :key="action.label" class="justify-start"
                        @click="handleQuickAction(action)">
                        <el-icon class="mr-2">
                            <component :is="action.icon" />
                        </el-icon>
                        {{ action.label }}
                    </el-button>
                </div>
            </el-card>

            <!-- 最近动态 -->
            <el-card class="activities-card" shadow="hover">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="font-medium">最近动态</span>
                        <el-button link size="small">查看全部</el-button>
                    </div>
                </template>
                <div class="space-y-3 max-h-64 overflow-y-auto">
                    <div v-for="item in recentActivities" :key="item.id"
                        class="flex items-start gap-3 p-2 rounded-lg hover:bg-$el-fill-color-light transition-colors">
                        <el-avatar :size="28" :src="item.avatar" class="bg-$el-color-primary flex-shrink-0">
                            <el-icon>
                                <User />
                            </el-icon>
                        </el-avatar>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-$el-text-color-primary">
                                <span class="font-medium">{{ item.user }}</span>
                                {{ item.action }}
                            </p>
                            <p class="text-xs text-$el-text-color-secondary mt-0.5">
                                {{ item.time }}
                            </p>
                        </div>
                        <el-tag size="small" :type="item.type" effect="plain">
                            {{ item.label }}
                        </el-tag>
                    </div>
                </div>
            </el-card>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
    User, Checked, UserFilled, Warning, WarningFilled,
    Goods, Sell, ChatDotRound, Document, Bell, Clock,
    Refresh, Top, Search, Download, Setting, Edit, Delete
} from '@element-plus/icons-vue'
import adminApi from '@/api/admin'

const router = useRouter()

// 🔹 状态
const stats = ref({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingUserReviews: 0,
    verificationRate: 0,
    totalProducts: 0,
    approvedProducts: 0,
    pendingProductReviews: 0,
    approvalRate: 0,
    pendingReports: 0,
    newUsersToday: 0,
    newProductsToday: 0,
    todayInteractions: 0,
    avgReviewTime: 0
})

const userChartRange = ref('7d')
const userChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let userChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

// 🔹 待办事项配置
const pendingTasks = [
    {
        type: 'user-review',
        title: '待审核用户',
        desc: '身份认证申请',
        count: computed(() => stats.value.pendingUserReviews),
        icon: 'UserFilled',
        iconClass: 'text-orange-500',
        tagType: 'warning',
        link: '/admin/user-review'
    },
    {
        type: 'product-review',
        title: '待审核商品',
        desc: '新发布商品审核',
        count: computed(() => stats.value.pendingProductReviews),
        icon: 'Document',
        iconClass: 'text-orange-500',
        tagType: 'warning',
        link: '/admin/product-review'
    },
    {
        type: 'report',
        title: '待处理举报',
        desc: '用户举报投诉',
        count: computed(() => stats.value.pendingReports),
        icon: 'WarningFilled',
        iconClass: 'text-red-500',
        tagType: 'danger',
        link: '/admin/report-management'
    }
]

const totalPending = computed(() =>
    stats.value.pendingUserReviews +
    stats.value.pendingProductReviews +
    stats.value.pendingReports
)

// 🔹 快捷操作配置
const quickActions = [
    { label: '审核用户', icon: 'User', action: () => router.push('/admin/user-review') },
    { label: '审核商品', icon: 'Goods', action: () => router.push('/admin/product-review') },
    { label: '处理举报', icon: 'Warning', action: () => router.push('/admin/report-management') },
    { label: '搜索用户', icon: 'Search', action: () => ElMessage.info('搜索功能开发中') },
    { label: '导出数据', icon: 'Download', action: () => exportData() },
    { label: '系统设置', icon: 'Setting', action: () => ElMessage.info('设置功能开发中') }
]

// 🔹 最近动态（模拟数据，实际从 API 获取）
const recentActivities = ref([
    {
        id: 1,
        user: '张三',
        action: '提交了身份认证申请',
        time: '5 分钟前',
        type: 'warning',
        label: '待审核',
        avatar: ''
    },
    {
        id: 2,
        user: '李四',
        action: '发布了新商品：二手 MacBook Pro',
        time: '12 分钟前',
        type: 'success',
        label: '新商品',
        avatar: ''
    },
    {
        id: 3,
        user: '王五',
        action: '举报了商品：虚假宣传',
        time: '25 分钟前',
        type: 'danger',
        label: '举报',
        avatar: ''
    },
    {
        id: 4,
        user: '管理员',
        action: '审核通过了用户「赵六」',
        time: '1 小时前',
        type: 'success',
        label: '已通过',
        avatar: ''
    }
])

// 🔹 加载统计数据
const loadStats = async () => {
    try {
        const res = await adminApi.getDashboardStats()
        if (res.code === 200) {
            stats.value = res.data
            // 更新待办角标（同步到 Pinia）
            // useUserStore().updatePendingCounts(res.data)
        }
    } catch (error) {
        console.error('加载统计失败:', error)
        ElMessage.error('加载数据失败，请稍后重试')
    }
}

// 🔹 初始化图表
const initCharts = () => {
    initUserChart()
    initCategoryChart()
}

const initUserChart = () => {
    if (!userChartRef.value) return

    userChart = echarts.init(userChartRef.value)

    // 模拟数据（实际从 API 获取）
    const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const newData = [12, 18, 9, 24, 15, 30, 22]

    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '3%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: 'var(--el-border-color)' } }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'var(--el-border-color-light)' } }
        },
        series: [{
            data: newData,
            type: 'line',
            smooth: true,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                    { offset: 1, color: 'rgba(59, 130, 246, 0)' }
                ])
            },
            itemStyle: { color: '#3b82f6' },
            lineStyle: { width: 2 }
        }]
    }

    userChart.setOption(option)
}

const initCategoryChart = () => {
    if (!categoryChartRef.value) return

    categoryChart = echarts.init(categoryChartRef.value)

    const option = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold' }
            },
            data: [
                { value: 1048, name: '📱 数码', itemStyle: { color: '#3b82f6' } },
                { value: 735, name: '📚 图书', itemStyle: { color: '#10b981' } },
                { value: 580, name: '🏠 生活', itemStyle: { color: '#f59e0b' } },
                { value: 484, name: '👕 服饰', itemStyle: { color: '#ec4899' } },
                { value: 300, name: '🎁 其他', itemStyle: { color: '#6b7280' } }
            ]
        }]
    }

    categoryChart.setOption(option)
}

// 🔹 刷新数据
const refreshData = async () => {
    ElMessage.info('刷新中...')
    await loadStats()
    refreshCategoryChart()
    ElMessage.success('数据已更新')
}

const refreshCategoryChart = () => {
    if (categoryChart) {
        // 实际应从 API 获取最新分类数据
        categoryChart.setOption({
            series: [{
                data: categoryChart.getOption().series[0].data.map(item => ({
                    ...item,
                    value: Math.floor(Math.random() * 1500) + 200  // 模拟刷新
                }))
            }]
        })
    }
}

// 🔹 快捷操作处理
const handleQuickAction = (action: any) => {
    if (action.action) action.action()
}

// 🔹 导出数据
const exportData = () => {
    ElMessage.success('导出功能开发中，敬请期待~')
    // 实际实现：调用后端导出接口，下载 CSV/Excel
}

// 🔹 响应式处理
const handleResize = () => {
    userChart?.resize()
    categoryChart?.resize()
}

onMounted(() => {
    loadStats()
    initCharts()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    userChart?.dispose()
    categoryChart?.dispose()
})
</script>

<style scoped>
/* 🔹 统计卡片统一样式 */
.stats-card {
    @apply rounded-xl border border-$el-border-color-light;
}

.stats-card:hover {
    @apply shadow-lg -translate-y-0.5 transition-all duration-200;
}

/* 🔹 图表卡片 */
.chart-card {
    @apply rounded-xl border border-$el-border-color-light;
}

/* 🔹 待办/快捷卡片 */
.todo-card,
.quick-actions-card,
.activities-card {
    @apply rounded-xl border border-$el-border-color-light;
}

/* 🔹 图表容器 */
:deep(.echarts) {
    width: 100%;
    height: 100%;
}
</style>