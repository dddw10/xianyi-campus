<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <!-- 头部导航 -->
        <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="h-16 flex items-center justify-between">

                    <!-- Logo / 平台名称 -->
                    <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                        <div
                            class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <el-icon class="text-[var(--bg)]" :size="18">
                                <ShoppingBag />
                            </el-icon>
                        </div>
                        <span
                            class="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            闲易校园
                        </span>
                    </div>

                    <!-- 桌面端菜单 -->
                    <el-menu v-if="changeMode" :default-active="activeIndex" mode="horizontal" :ellipsis="false"
                        @select="handleSelect" class="flex-1 mx-8 border-none bg-transparent">
                        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index" class="menu-item">
                            <el-icon class="mr-1">
                                <component :is="item.icon" />
                            </el-icon>
                            {{ item.label }}
                        </el-menu-item>
                    </el-menu>

                    <!-- 右侧用户区域 -->
                    <div class="flex items-center gap-3">

                        <!-- 主题切换 -->
                        <themeSwitch></themeSwitch>

                        <!-- 用户登录状态 -->
                        <div class="flex items-center gap-2">
                            <!-- 未登录 -->
                            <template v-if="!isLogin">
                                <el-button type="text" class="text-slate-600 hover:text-blue-600 font-medium"
                                    @click="router.push('/auth/login')">
                                    登录
                                </el-button>
                                <el-button
                                    class="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-[var(--bg)] border-none shadow-md hover:shadow-lg transition-all"
                                    size="small" @click="router.push('/auth/register')">
                                    注册
                                </el-button>
                            </template>

                            <!-- 已登录 -->
                            <template v-else>
                                <el-dropdown trigger="hover" @command="handleUserCommand">
                                    <div
                                        class="flex items-center gap-2 cursor-pointer hover:bg-slate-100 rounded-full px-2 py-1 transition">
                                        <el-avatar :size="28" class="bg-gradient-to-br from-blue-400 to-cyan-300">
                                            {{ userName?.slice(-2)?.toUpperCase() }}
                                        </el-avatar>
                                        <span class="text-sm font-medium text-slate-700 hidden sm:inline">{{
                                            userName
                                            }}</span>
                                        <el-icon class="text-slate-400">
                                            <ArrowDown />
                                        </el-icon>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu class="shadow-lg border-slate-200">
                                            <el-dropdown-item command="profile" class="py-2">
                                                <el-icon class="mr-2">
                                                    <User />
                                                </el-icon>个人中心
                                            </el-dropdown-item>
                                            <el-dropdown-item command="orders" class="py-2">
                                                <el-icon class="mr-2">
                                                    <List />
                                                </el-icon>我的订单
                                            </el-dropdown-item>
                                            <el-dropdown-item command="favorites" class="py-2">
                                                <el-icon class="mr-2">
                                                    <Star />
                                                </el-icon>我的收藏
                                            </el-dropdown-item>
                                            <el-dropdown-item divided command="logout" class="py-2 text-red-500">
                                                <el-icon class="mr-2">
                                                    <SwitchButton />
                                                </el-icon>退出登录
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                        </div>

                        <!-- 移动端菜单按钮 -->
                        <el-icon v-if="!changeMode" :size="24"
                            class="text-slate-600 cursor-pointer hover:text-blue-600 transition p-1"
                            @click="mobileMenuVisible = true">
                            <Menu />
                        </el-icon>
                    </div>
                </div>
            </div>
        </header>

        <!-- 移动端下拉菜单 -->
        <el-drawer v-model="mobileMenuVisible" direction="ltr" size="280px" class="mobile-menu" :with-header="false">
            <div class="p-4">
                <div class="flex items-center justify-between mb-6">
                    <span class="text-lg font-bold text-slate-700">菜单</span>
                    <el-icon :size="20" class="cursor-pointer text-slate-400 hover:text-slate-600"
                        @click="mobileMenuVisible = false">
                        <Close />
                    </el-icon>
                </div>

                <!-- 移动端搜索 -->
                <!-- <div class="flex items-center bg-slate-100 rounded-full px-4 py-2 mb-6">
                    <el-icon class="text-slate-400">
                        <Search />
                    </el-icon>
                    <input type="text" placeholder="搜索商品..."
                        class="bg-transparent border-none outline-none px-2 text-sm flex-1 placeholder-slate-400">
                </div> -->

                <!-- 移动端菜单项 -->
                <nav class="space-y-1">
                    <a v-for="item in menuItems" :key="item.index" @click="handleMobileSelect(item.index)"
                        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                        :class="activeIndex === item.index ? 'bg-blue-100 text-blue-600 font-medium' : 'text-slate-600'">
                        <component :is="item.icon" class="w-5 h-5" />
                        <span>{{ item.label }}</span>
                    </a>
                </nav>

                <!-- 移动端用户区域 -->
                <div class="mt-8 pt-6 border-t border-slate-200">
                    <template v-if="!isLogin">
                        <div class="flex gap-3">
                            <el-button class="flex-1" @click="router.push('/auth/login')">登录</el-button>
                            <el-button class="flex-1" type="primary"
                                @click="router.push('/auth/register')">注册</el-button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex items-center gap-3 px-2">
                            <el-avatar :size="40" class="bg-gradient-to-br from-blue-400 to-cyan-300">
                                {{ userName?.[0]?.toUpperCase() }}
                            </el-avatar>
                            <div>
                                <div class="font-medium text-slate-700">{{ userName }}</div>
                                <el-button type="text" size="small" class="text-red-500"
                                    @click="handleLogout">退出登录</el-button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </el-drawer>

        <!-- 主内容区域 -->
        <main class="flex-1 flex justify-center">
            <router-view></router-view>
            <el-backtop :right="40" :bottom="40" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import themeSwitch from "@/components/theme.Switch.vue";

// 🔥 导入图标
import {
    Avatar, Menu, Close, ArrowDown, Search,
    ShoppingBag, HomeFilled, Goods, ChatDotRound, Plus,
    User, List, Star, SwitchButton
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const UserStore = useUserStore()
const { width } = useWindowSize();
const router = useRouter();
const route = useRoute();
const isLogin = ref(UserStore.isLoggedIn);
const userName = ref(UserStore.userInfo.studentId); // 模拟用户名
const mobileMenuVisible = ref(false);


// 菜单配置（便于复用）
const menuItems = [
    { index: '/', label: '首页', icon: HomeFilled },
    { index: '/products', label: '商品', icon: Goods },
    { index: '/chat', label: '聊天', icon: ChatDotRound },
    { index: '/publish', label: '发布', icon: Plus },
];

const changeMode = computed(() => width.value > 768);

const activeIndex = ref('/')

watch(
    () => route.path,  // 监听目标
    (newPath) => {     // 新路径
        // 处理子路由：/products/detail/123 → 高亮 /products
        const segments = newPath.split('/').filter(Boolean)
        const mainPath = segments.length >= 2
            ? `/${segments[0]}/${segments[1]}`
            : newPath || '/'

        // 菜单配置（和之前一样）
        const menuPaths = ['/', '/products', '/chat', '/publish']

        // 如果当前主路径在菜单中，更新 activeIndex
        if (menuPaths.includes(mainPath)) {
            activeIndex.value = mainPath
        } else {
            // 否则返回首页（或保持上一个）
            activeIndex.value = '/'
        }
    },
    { immediate: true }  // 关键：页面初始化时也执行一次
)

// 桌面端菜单选择
const handleSelect = (key: string) => {
    router.push(key);
};

// 移动端菜单选择
const handleMobileSelect = (key: string) => {
    mobileMenuVisible.value = false;
    router.push(key);
};

// 用户下拉菜单命令
const handleUserCommand = (command: string) => {
    switch (command) {
        case 'profile':
            router.push('/profile');
            break;
        case 'orders':
            router.push('/orders');
            break;
        case 'favorites':
            router.push('/favorites');
            break;
        case 'logout':
            handleLogout();
            break;
    }
};

// 退出登录
const handleLogout = () => {
    UserStore.logout()
    router.push('/auth/login');
    ElMessage.error('退出登录')
};
</script>

<style scoped>
/* 修复自定义高度 */
.h-80px {
    height: 80px;
}

/* Element Plus 菜单样式优化 */
:deep(.el-menu--horizontal) {
    border-bottom: none !important;
}

:deep(.menu-item) {
    border: none !important;
    color: #475569 !important;
    /* slate-600 */
    font-weight: 500;
    transition: all 0.2s ease;
}

:deep(.menu-item:hover),
:deep(.menu-item.is-active) {
    background: transparent !important;
    color: #2563eb !important;
    /* blue-600 */
}

:deep(.el-menu-item [class^="el-icon"]) {
    margin-right: 4px;
    vertical-align: middle;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
    padding: 8px 16px !important;
    font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
    background: #f1f5f9 !important;
    /* slate-100 */
    color: #2563eb !important;
}

:deep(.el-dropdown-menu__item i) {
    font-size: 16px;
}

/* 移动端抽屉样式 */
:deep(.mobile-menu .el-drawer__body) {
    padding: 0;
    background: #fff;
}
</style>