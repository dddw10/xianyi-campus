<template>
    <div class="min-h-screen flex flex-col bg-[var(--bg)]">
        <!-- 头部导航 -->
        <header class="sticky top-0 z-50 w-full backdrop-blur-xl 
                 bg-[var(--bg-elevated)]/80 
                 border-b border-[var(--border)] 
                 shadow-[var(--shadow)]
                 transition-colors duration-300">

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="h-16 flex items-center justify-between">

                    <!-- Logo 区域 -->
                    <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
                        <div class="w-8 h-8 rounded-lg 
                      bg-gradient-to-br from-[var(--primary)] to-cyan-400 
                      flex items-center justify-center 
                      shadow-md group-hover:shadow-lg transition-all">
                            <el-icon class="text-[var(--bg)]" :size="18">
                                <ShoppingBag />
                            </el-icon>
                        </div>
                        <span class="text-lg font-bold 
                       bg-gradient-to-r from-[var(--primary)] to-cyan-400 
                       bg-clip-text text-transparent">
                            闲易校园
                        </span>
                    </div>

                    <!-- 桌面端菜单 - 优化 Element Plus 菜单样式 -->
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
                                <el-button type="text"
                                    class="text-[var(--text-secondary)] hover:text-[var(--primary)] font-medium transition-colors"
                                    @click="router.push('/auth/login')">
                                    登录
                                </el-button>
                                <el-button class="bg-gradient-to-r from-[var(--primary)] to-cyan-400 
                       hover:from-[var(--primary-hover)] hover:to-cyan-500 
                       text-[var(--bg)] border-none shadow-md hover:shadow-lg 
                       transition-all" size="small" @click="router.push('/auth/register')">
                                    注册
                                </el-button>
                            </template>

                            <!-- 已登录 - 优化下拉触发区域 -->
                            <template v-else>
                                <el-dropdown trigger="hover" @command="handleUserCommand">
                                    <div class="flex items-center gap-2 cursor-pointer 
                            hover:bg-[var(--card-hover)] rounded-full px-2 py-1 
                            transition-colors">
                                        <el-avatar :size="28" class="bg-gradient-to-br from-blue-400 to-cyan-300">
                                            {{ userName?.slice(-2)?.toUpperCase() }}
                                        </el-avatar>
                                        <span class="text-sm font-medium text-[var(--text)] hidden sm:inline">
                                            {{ userName }}
                                        </span>
                                        <el-icon class="text-[var(--text-tertiary)]">
                                            <ArrowDown />
                                        </el-icon>
                                    </div>
                                    <template #dropdown>
                                        <!-- 下拉菜单 - 使用 CSS 变量适配暗黑 -->
                                        <el-dropdown-menu class="shadow-lg border-[var(--border)] bg-[var(--card)]">
                                            <el-dropdown-item command="profile" class="py-2 text-[var(--text)]">
                                                <el-icon class="mr-2 text-[var(--text-tertiary)]">
                                                    <User />
                                                </el-icon>个人中心
                                            </el-dropdown-item>
                                            <el-dropdown-item command="orders" class="py-2 text-[var(--text)]">
                                                <el-icon class="mr-2 text-[var(--text-tertiary)]">
                                                    <List />
                                                </el-icon>我的订单
                                            </el-dropdown-item>
                                            <el-dropdown-item command="favorites" class="py-2 text-[var(--text)]">
                                                <el-icon class="mr-2 text-[var(--text-tertiary)]">
                                                    <Star />
                                                </el-icon>我的收藏
                                            </el-dropdown-item>
                                            <el-dropdown-item divided command="logout"
                                                class="py-2 text-[var(--error)] hover:bg-[var(--card-hover)]">
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
                            class="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary)] transition p-1"
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
                                <div class="font-medium text-slate-400">{{ userName }}</div>
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
    { index: '/products/create', label: '发布', icon: Plus },
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
        const menuPaths = ['/', '/products', '/chat', '/products/create']

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
            router.push('/main/profile');
            break;
        case 'orders':
            router.push('/products/orders');
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
/* ✅ 添加 transition 让主题切换更平滑 */
* {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Element Plus 菜单 - 暗黑模式适配 */
:deep(.el-menu--horizontal) {
    border-bottom: none !important;
    background: transparent !important;
}

:deep(.menu-item) {
    border: none !important;
    color: var(--text-secondary) !important;
    font-weight: 500;
    transition: all 0.2s ease;
}

:deep(.menu-item:hover),
:deep(.menu-item.is-active) {
    background: transparent !important;
    color: var(--primary) !important;
}

:deep(.el-menu-item [class^="el-icon"]) {
    margin-right: 4px;
    vertical-align: middle;
    color: inherit;
}

/* 下拉菜单 - 关键：使用 CSS 变量 */
:deep(.el-dropdown-menu) {
    background: var(--card) !important;
    border-color: var(--border) !important;
}

:deep(.el-dropdown-menu__item) {
    padding: 8px 16px !important;
    font-size: 14px;
    color: var(--text) !important;
}

:deep(.el-dropdown-menu__item:hover) {
    background: var(--card-hover) !important;
    color: var(--primary) !important;
}

:deep(.el-dropdown-menu__item.is-disabled) {
    color: var(--text-tertiary) !important;
}

:deep(.el-dropdown-menu__item.divided) {
    border-color: var(--border) !important;
}

:deep(.el-dropdown-menu__item i) {
    font-size: 16px;
    color: var(--text-tertiary);
}

/* 移动端抽屉 - 暗黑适配 */
:deep(.mobile-menu .el-drawer) {
    background: var(--bg-elevated) !important;
    border-left: 1px solid var(--border);
}

:deep(.mobile-menu .el-drawer__body) {
    padding: 0;
    background: var(--bg-elevated);
    color: var(--text);
}

:deep(.mobile-menu .el-icon) {
    color: var(--text-secondary);
}

:deep(.mobile-menu .el-icon:hover) {
    color: var(--primary);
}

/* 按钮 - 统一暗黑样式 */
:deep(.el-button) {
    transition: all 0.2s ease;
}

:deep(.el-button--text) {
    color: var(--text-secondary);
}

:deep(.el-button--text:hover) {
    color: var(--primary);
}

/* 输入框/搜索框暗黑适配（如果后续添加） */
:deep(.el-input__wrapper) {
    background: var(--input-bg) !important;
    box-shadow: 0 0 0 1px var(--input-border) inset !important;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--input-focus) inset !important;
}

:deep(.el-input__inner) {
    color: var(--text) !important;
}

:deep(.el-input__inner::placeholder) {
    color: var(--text-tertiary) !important;
}

/* Avatar 文字颜色适配 */
:deep(.el-avatar) {
    color: var(--bg) !important;
    font-weight: 600;
}
</style>