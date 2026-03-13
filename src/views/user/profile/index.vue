<!-- src/views/user/Profile.vue -->
<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">

        <!-- 🔹 头部：用户信息卡片 -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-t-2xl">
            <div class="max-w-4xl mx-auto px-4 py-6">
                <div class="flex items-center gap-4">
                    <!-- 头像 -->
                    <div class="relative">
                        <el-avatar :size="80" :src="userStore.userInfo?.avatar || getDefaultAvatar()"
                            class="border-4 border-white dark:border-gray-700 shadow-lg" />
                        <el-button v-if="userStore.userInfo?.isVerified" size="small"
                            class="absolute -bottom-1 -right-1 !w-6 !h-6 !rounded-full !p-0 bg-blue-500 hover:bg-blue-600"
                            title="已认证">
                            <el-icon class="text-white text-xs">
                                <Check />
                            </el-icon>
                        </el-button>
                    </div>

                    <!-- 用户信息 -->
                    <div class="flex-1 min-w-0">
                        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
                            {{ userStore.userInfo?.nickname || '同学' }}
                        </h1>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            学号：{{ userStore.userInfo?.studentId || '---' }}
                        </p>

                        <!-- 认证状态 -->
                        <div class="mt-2">
                            <el-tag :type="userStore.userInfo?.isVerified ? 'success' : 'warning'" size="small"
                                :effect="userStore.userInfo?.isVerified ? 'dark' : 'plain'">
                                {{ userStore.userInfo?.isVerified ? '✅ 已认证' : '⏳ 待认证' }}
                            </el-tag>

                            <el-button v-if="!userStore.userInfo?.isVerified" link size="small" class="ml-2"
                                @click="$router.push('/verify')">
                                去认证
                            </el-button>
                        </div>
                    </div>

                    <!-- 设置按钮 -->
                    <el-button link @click="showSettings = true" class="!p-2">
                        <el-icon class="text-xl text-gray-400">
                            <Setting />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 🔹 快捷入口 -->
        <div class="max-w-4xl mx-auto px-4 py-4">
            <div class="grid grid-cols-4 gap-3">
                <div v-for="item in quickActions" :key="item.path"
                    class="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                    @click="$router.push(item.path)">
                    <el-icon :size="24" :class="item.iconClass">
                        <component :is="item.icon" />
                    </el-icon>
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ item.label }}</span>
                    <span v-if="item.badge"
                        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {{ item.badge }}
                    </span>
                </div>
            </div>
        </div>

        <!-- 🔹 功能模块列表 -->
        <div class="max-w-4xl mx-auto px-4 py-2 space-y-3">

            <!-- 我的商品 -->
            <div
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold text-gray-800 dark:text-gray-100">📦 我的商品</h3>
                </div>
                <div class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                    <div v-for="tab in productTabs" :key="tab.key"
                        class="p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        @click="$router.push(`/products/orders?type=${tab.key}`)">
                        <div class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ tab.count ?? '-' }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ tab.label }}</div>
                    </div>
                </div>
            </div>

            <!-- 我的收藏 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                @click="$router.push('/main/favorites')">
                <div class="flex items-center gap-3">
                    <el-icon class="text-warning-500">
                        <StarFilled />
                    </el-icon>
                    <span class="font-medium text-gray-800 dark:text-gray-100">我的收藏</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">{{ favoriteStore.count }} 件</span>
                    <el-icon class="text-gray-400">
                        <ArrowRight />
                    </el-icon>
                </div>
            </div>

            <!-- ⭐ 信用评价（第二阶段预留） -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow opacity-60"
                @click="ElMessage.info('信用评价功能开发中~')">
                <div class="flex items-center gap-3">
                    <el-icon class="text-yellow-500">
                        <Trophy />
                    </el-icon>
                    <span class="font-medium text-gray-800 dark:text-gray-100">信用评价</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-400">敬请期待</span>
                    <el-tag size="small" type="info">开发中</el-tag>
                </div>
            </div>

            <!-- 账号设置 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                @click="showSettings = true">
                <div class="flex items-center gap-3">
                    <el-icon class="text-gray-500">
                        <Setting />
                    </el-icon>
                    <span class="font-medium text-gray-800 dark:text-gray-100">账号设置</span>
                </div>
                <el-icon class="text-gray-400">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 退出登录 -->
            <el-button type="danger" class="w-full !rounded-xl !py-3" @click="handleLogout">
                退出登录
            </el-button>
        </div>

        <!-- 🔹 设置弹窗 -->
        <el-dialog v-model="showSettings" title="账号设置" width="90%" :before-close="() => { showSettings = false }">
            <div class="space-y-4">
                <el-button class="w-full" @click="handleLogout">退出登录</el-button>
                <el-button class="w-full" @click="ElMessage.info('修改密码功能开发中')">修改密码</el-button>
                <el-button class="w-full" link type="danger" @click="showSettings = false">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    Check, Setting, StarFilled, Trophy, ArrowRight,
    Box, ShoppingBag, SoldOut, Collection
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useFavoriteStore } from '@/stores/modules/favorite'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const showSettings = ref(false)

// 🔹 默认头像
const getDefaultAvatar = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.userInfo?.nickname || '同学')}&background=random`
}

// 🔹 快捷入口配置
const quickActions = computed(() => [
    {
        label: '我发布的',
        path: '/products/orders?type=published',
        icon: Box,
        iconClass: 'text-blue-500',
        // badge: 3  // 可选：显示未读数
    },
    {
        label: '我买到的',
        path: '/products/orders?type=bought',
        icon: ShoppingBag,
        iconClass: 'text-green-500'
    },
    {
        label: '我卖出的',
        path: '/products/orders?type=sold',
        icon: SoldOut,
        iconClass: 'text-orange-500'
    },
    {
        label: '我的收藏',
        path: '/main/favorites',
        icon: Collection,
        iconClass: 'text-warning-500',
        badge: favoriteStore.count > 0 ? favoriteStore.count : undefined
    },
])

// 🔹 我的商品标签
const productTabs = computed(() => [
    { key: 'published', label: '我发布的', count: undefined },  // 后续可接 API 获取真实数量
    { key: 'bought', label: '我买到的', count: undefined },
    { key: 'sold', label: '我卖出的', count: undefined },
])

// 🔹 退出登录
const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        userStore.logout()  // 🔥 会自动清空收藏状态 + 跳转登录页
        router.replace({ path: '/auth/login' })
    })
}

// 🔹 初始化
onMounted(() => {
    // 🔥 确保用户信息已加载
    if (!userStore.userInfo?.id) {
        // 可选：重新获取用户信息
        // userStore.fetchUserInfo()
    }
})
</script>

<style scoped>
/* 🔥 移动端优化 */
@media (max-width: 640px) {
    .grid.grid-cols-4 {
        @apply grid-cols-4 gap-2;
    }

    .grid.grid-cols-3 {
        @apply grid-cols-3;
    }
}

/* 🔥 深色模式适配 */
:global(.dark) .divide-x> :not([hidden])~ :not([hidden]) {
    @apply border-gray-700;
}
</style>