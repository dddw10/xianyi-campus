<!-- src/layouts/AdminLayout.vue -->
<template>
    <div class="min-h-screen bg-$el-fill-color-blank flex">

        <!-- 🔹 小屏遮罩层（抽屉打开时显示） -->
        <div v-if="isMobile && drawerVisible" class="fixed inset-0 bg-black/50 z-30 transition-opacity"
            @click="drawerVisible = false"></div>

        <!-- 🔹 侧边栏（大屏固定 / 小屏抽屉） -->
        <aside :class="[
            'bg-$el-bg-color border-r border-$el-border-color-light flex flex-col transition-all duration-300 z-40',
            isMobile
                ? 'fixed left-0 top-0 h-full w-64 transform ' + (drawerVisible ? 'translate-x-0' : '-translate-x-full')
                : 'w-64 fixed left-0 top-0 h-full'
        ]">
            <!-- Logo 区 -->
            <div class="p-5 border-b border-$el-border-color-light flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <el-icon class="text-white text-lg">
                            <Management />
                        </el-icon>
                    </div>
                    <div v-if="!isMobile">
                        <h3 class="font-bold text-$el-text-color-primary">管理后台</h3>
                        <p class="text-xs text-$el-text-color-secondary">Campus Market</p>
                    </div>
                </div>

                <!-- 🔥 小屏关闭按钮 -->
                <el-button v-if="isMobile" link :icon="Close" class="text-$el-text-color-secondary"
                    @click="drawerVisible = false" />
            </div>

            <!-- 管理员信息（大屏显示） -->
            <div v-if="!isMobile" class="p-4 border-b border-$el-border-color-light bg-$el-fill-color-light/50">
                <div class="flex items-center gap-3">
                    <el-avatar :size="40" class="bg-indigo-500">
                        <el-icon>
                            <User />
                        </el-icon>
                    </el-avatar>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-$el-text-color-primary truncate">
                            {{ userStore.userInfo?.studentId || '管理员' }}
                        </p>
                        <p class="text-xs text-$el-text-color-secondary">超级管理员</p>
                    </div>
                </div>
            </div>

            <!-- 导航菜单 -->
            <el-menu :default-active="activeMenu" class="flex-1 border-none overflow-y-auto" :collapse="false"
                :collapse-transition="false" @select="handleMenuSelect">
                <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path" class="border-none">
                    <el-icon class="text-$el-text-color-regular mr-2">
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>

                    <!-- 待办角标 -->
                    <!-- <el-badge v-if="item.badge !== undefined" :value="item.badge" :max="99" class="ml-auto"
                        type="danger" :hidden="item.badge === 0" /> -->
                </el-menu-item>
            </el-menu>

            <!-- 底部操作（大屏显示） -->
            <div v-if="!isMobile" class="p-4 border-t border-$el-border-color-light">
                <el-button type="danger" link class="w-full justify-start" @click="handleLogout">
                    <el-icon class="mr-2">
                        <SwitchButton />
                    </el-icon>
                    退出登录
                </el-button>
            </div>
        </aside>

        <!-- 🔹 主内容区 -->
        <main :class="['flex-1 flex flex-col min-w-0 transition-all duration-300', !isMobile ? 'ml-64' : 'ml-0']">
            <!-- 顶部栏 -->
            <header class="
          h-16 
          bg-$el-bg-color 
          border-b border-$el-border-color-light 
          px-4 sm:px-6
          flex items-center justify-between
          sticky top-0 z-20
        ">
                <!-- 🔥 左侧：汉堡按钮（小屏）+ 页面标题 -->
                <div class="flex items-center gap-4">
                    <!-- 汉堡菜单按钮（仅小屏显示） -->
                    <el-button v-if="isMobile" link :icon="Expand" class="text-$el-text-color-primary text-xl"
                        @click="drawerVisible = true" />

                    <h2 class="text-lg font-semibold text-$el-text-color-primary">
                        {{ currentMenu?.title || '管理后台' }}
                    </h2>

                </div>

                <!-- 右侧操作 -->
                <div class="flex items-center gap-3">
                    <!-- 小屏：管理员信息 + 退出（下拉菜单） -->
                    <el-dropdown v-if="isMobile">
                        <div class="flex items-center gap-2 cursor-pointer">
                            <themeSwitch class="mr-4"></themeSwitch>
                            <el-avatar :size="32" class="bg-indigo-500">
                                <el-icon>
                                    <User />
                                </el-icon>
                            </el-avatar>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <span class="text-sm font-medium">{{ userStore.userInfo?.studentId }}</span>
                                </el-dropdown-item>
                                <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">
                                    退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>


                    <!-- 大屏：完整用户信息 + 退出 -->
                    <el-dropdown v-else>
                        <div class="flex items-center gap-2 cursor-pointer">
                            <themeSwitch class="mr-4"></themeSwitch>
                            <el-avatar :size="32" class="bg-indigo-500">
                                <el-icon>
                                    <User />
                                </el-icon>
                            </el-avatar>
                            <span class="text-sm text-$el-text-color-primary hidden sm:block">
                                {{ userStore.userInfo?.studentId }}
                            </span>
                            <el-icon class="text-$el-text-color-secondary">
                                <ArrowDown />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item :icon="User">个人中心</el-dropdown-item>
                                <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">
                                    退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </header>

            <!-- 内容区域 -->
            <div class="flex-1 p-4 sm:p-6 overflow-auto">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" :key="$route.fullPath" />
                    </transition>
                </router-view>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Management, User, Close, Expand,
    Odometer, Checked, Goods, Warning,
    SwitchButton, ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { modalBox } from "@/components/messageBox/modalBox"
import themeSwitch from "@/components/theme.Switch.vue";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 🔥 响应式状态
const isMobile = ref(window.innerWidth < 768)
const drawerVisible = ref(false)

// 🔥 监听窗口大小变化
const handleResize = () => {
    isMobile.value = window.innerWidth < 768
    // 大屏时自动关闭抽屉
    if (!isMobile.value) {
        drawerVisible.value = false
    }
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

// 🔹 菜单配置（icon 用组件对象）
const menuItems = [
    { path: '/admin/dashboard', title: '数据看板', icon: markRaw(Odometer) },
    {
        path: '/admin/user-review',
        title: '用户审核',
        icon: markRaw(Checked),
        badge: computed(() => (userStore as any).pendingUserReviews ?? 0)
    },
    { path: '/admin/user-management', title: '用户管理', icon: markRaw(User) },
    {
        path: '/admin/product-review',
        title: '商品审核',
        icon: markRaw(Checked),
        badge: computed(() => (userStore as any).pendingProductReviews ?? 0)
    },
    {
        path: '/admin/report-management',
        title: '举报管理',
        icon: markRaw(Warning),
        badge: computed(() => (userStore as any).pendingReports ?? 0)
    }
]

// 🔹 当前激活菜单
const activeMenu = computed(() => route.path)
const currentMenu = computed(() =>
    menuItems.find(item => item.path === route.path)
)

// 🔹 菜单点击（小屏点击后自动关闭抽屉）
const handleMenuSelect = (path: string) => {
    router.push(path)
    if (isMobile.value) {
        drawerVisible.value = false
    }
}

// 🔹 退出登录
const handleLogout = () => {
    modalBox({
        type: 'info',
        title: '提示',
        message: '确定要退出管理后台吗？',
    }).then(() => {
        userStore.logout()
        router.push('/admin/login')
        ElMessage.success('已退出登录')
    }).catch(() => { })
}
</script>

<style scoped>
/* 🔹 菜单项样式 */
:deep(.el-menu-item) {
    @apply rounded-lg mx-2 my-1;
}

:deep(.el-menu-item:hover) {
    @apply bg-indigo-50 text-indigo-600;
}

:deep(.el-menu-item.is-active) {
    @apply bg-indigo-100 text-indigo-600 font-medium;
}

/* 🔹 图标颜色 */
:deep(.el-menu-item .el-icon) {
    @apply text-$el-text-color-regular mr-2;
}

:deep(.el-menu-item.is-active .el-icon) {
    @apply text-indigo-600;
}

/* 🔹 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 🔹 抽屉动画过渡 */
aside {
    @apply shadow-lg;
}

/* 🔹 小屏优化 */
@media (max-width: 768px) {

    /* 隐藏大屏专属内容 */
    aside .hidden-mobile {
        display: none;
    }

    /* 菜单项简化 */
    :deep(.el-menu-item) {
        @apply py-3;
    }

    /* 顶部栏内边距减小 */
    header {
        @apply px-4;
    }
}
</style>