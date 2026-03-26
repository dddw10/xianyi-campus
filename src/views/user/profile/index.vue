<!-- src/views/user/Profile.vue -->
<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">

        <!-- 🔹 头部：用户信息卡片（最终修复版） -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-t-2xl">
            <div class="max-w-4xl mx-auto px-4 py-6">
                <!-- 🔥 添加专属 class 并确保允许换行 -->
                <div class="flex items-center gap-4 flex-wrap profile-header-row">

                    <!-- 🔹 左侧：头像 + 用户信息 -->
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <!-- 头像 -->
                        <div class="relative flex-shrink-0">
                            <el-avatar :size="80" :src="userStore.userInfo?.avatarUrl || getDefaultAvatar()"
                                class="border-4 border-white dark:border-gray-700 shadow-lg" />
                            <el-button size="small"
                                class="absolute -top-1 -right-1 !w-6 !h-6 !rounded-full !p-0 bg-gray-600 hover:bg-gray-700"
                                title="编辑资料" @click="openProfileDialog">
                                <el-icon class="text-white text-xs">
                                    <Edit />
                                </el-icon>
                            </el-button>
                            <el-button v-if="isUserVerified" size="small"
                                class="absolute -bottom-1 -right-1 !w-6 !h-6 !rounded-full !p-0 bg-blue-500 hover:bg-blue-600"
                                title="已认证">
                                <el-icon class="text-white text-xs">
                                    <Check />
                                </el-icon>
                            </el-button>
                        </div>

                        <!-- 用户信息 -->
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
                                    {{ userStore.userInfo?.nickname || '同学' }}
                                </h1>
                                <el-button link size="small" @click="openProfileDialog">编辑资料</el-button>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                学号：{{ userStore.userInfo?.studentId || '---' }}
                            </p>

                            <!-- 认证状态 -->
                            <div class="mt-2">
                                <el-tag :type="verifyTagType" size="small" :effect="isUserVerified ? 'dark' : 'plain'">
                                    {{ verifyStatusText }}
                                </el-tag>
                                <el-button v-if="!isUserVerified" link size="small" class="ml-2"
                                    @click="$router.push('/main/verify')">
                                    去认证
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 🔹 右侧：信用分展示（添加专属 class） -->
                    <div class="credit-score-container flex flex-row md:flex-col text-right">
                        <div class="credit-score-content flex items-center justify-end gap-2">
                            <el-icon class="text-yellow-500">
                                <Trophy />
                            </el-icon>
                            <span class="font-bold text-gray-800 dark:text-gray-100">
                                {{ userStore.userInfo?.creditScore ?? 100 }}
                            </span>
                            <span class="text-xs text-gray-400">/100</span>
                        </div>
                        <el-tag size="small" :style="{
                            backgroundColor: creditLevel.color + '20',
                            color: creditLevel.color,
                            border: 'none'
                        }" class="credit-score-tag !rounded-full mt-1">
                            {{ creditLevel.label }}
                        </el-tag>
                        <p class="credit-score-desc text-xs text-gray-400 mt-1">
                            {{ creditLevel.desc }}
                        </p>
                    </div>

                    <!-- 🔹 最右侧：设置按钮 -->
                    <el-button link @click="showSettings = true" class="!p-2 flex-shrink-0 settings-btn">
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
            <!-- <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow opacity-60"
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
            </div> -->

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
        <el-dialog v-model="showSettings" title="账号设置" :before-close="() => { showSettings = false }"
            class="w-90% md:w-20%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">
            <div class="space-y-4">
                <el-button class="w-full" @click="openProfileDialog" type="primary">编辑资料</el-button>
                <span></span>
                <el-button class="w-full" @click="handleLogout">退出登录</el-button>
                <span></span>
                <el-button class="w-full" @click="showPasswordModal = true" type="primary">修改密码</el-button>
                <span></span>
                <el-button class="w-full" link type="danger" @click="showSettings = false">取消</el-button>
            </div>
        </el-dialog>

        <!-- 编辑资料弹窗 -->
        <el-dialog v-model="showProfileDialog" title="编辑资料" width="520px" :close-on-click-modal="false">
            <div class="space-y-4">
                <div>
                    <div class="mb-2 text-sm text-gray-500">头像</div>
                    <AdvanceImageUpload v-model="profileForm.avatarList" :limit="1" upload-url="/api/upload/avatar" />
                </div>
                <div>
                    <div class="mb-2 text-sm text-gray-500">昵称</div>
                    <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit placeholder="请输入昵称（2-20个字符）"
                        clearable />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <el-button @click="showProfileDialog = false">取消</el-button>
                    <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 修改密码弹窗 -->
        <ChangePasswordModal v-model:visible="showPasswordModal"></ChangePasswordModal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    Check, Setting, StarFilled, Trophy, ArrowRight,
    Box, ShoppingBag, SoldOut, Collection, Edit
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useFavoriteStore } from '@/stores/modules/favorite'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import orderApi from "@/api/order";
import authApi from '@/api/auth'
import ChangePasswordModal from "@/components/ChangePasswordModal.vue";
import AdvanceImageUpload from '@/components/AdvanceImageUpload.vue'
import { modalBox } from "@/components/messageBox/modalBox";

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const showSettings = ref(false)
const showPasswordModal = ref(false)
const showProfileDialog = ref(false)
const savingProfile = ref(false)
const profileForm = ref({
    nickname: '',
    avatarList: [] as string[]
})

// ============================================================================
// 🔥 信用分相关
// ============================================================================

// 信用等级计算（100 分制）
const creditLevel = computed(() => {
    const score = userStore.userInfo?.creditScore ?? 100
    if (score >= 90) return { label: '🟢 优秀', color: '#22c55e', desc: '可信用户' }
    if (score >= 70) return { label: '🔵 良好', color: '#3b82f6', desc: '正常用户' }
    if (score >= 50) return { label: '🟡 一般', color: '#f59e0b', desc: '注意行为' }
    if (score >= 30) return { label: '🟠 较低', color: '#ef4444', desc: '限制功能' }
    return { label: '🔴 极低', color: '#7f1d1d', desc: '禁止交易' }
})

const isUserVerified = computed(() => {
    const status = userStore.userInfo?.verificationStatus
    if (status === 'approved') return true
    if (status === 'pending' || status === 'rejected' || status === 'unsubmitted') return false
    return !!userStore.userInfo?.isVerified
})

const verifyTagType = computed<'success' | 'warning' | 'danger' | 'info'>(() => {
    const status = userStore.userInfo?.verificationStatus
    if (status === 'rejected') return 'danger'
    if (status === 'pending') return 'warning'
    if (status === 'unsubmitted') return 'info'
    if (isUserVerified.value) return 'success'
    return 'info'
})

const verifyStatusText = computed(() => {
    const status = userStore.userInfo?.verificationStatus
    if (status === 'rejected') return '❌ 认证被拒'
    if (status === 'pending') return '⏳ 审核中'
    if (status === 'unsubmitted') return '⚪ 去认证'
    return isUserVerified.value ? '✅ 已认证' : '⚪ 去认证'
})

// ============================================================================
// 🔥 其他逻辑
// ============================================================================

// 🔹 默认头像
const getDefaultAvatar = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.userInfo?.nickname || '同学')}&background=random`
}

const openProfileDialog = () => {
    const currentAvatar = userStore.userInfo?.avatar || userStore.userInfo?.avatarUrl || ''
    profileForm.value.nickname = userStore.userInfo?.nickname || ''
    profileForm.value.avatarList = currentAvatar ? [currentAvatar] : []
    showSettings.value = false
    showProfileDialog.value = true
}

const handleSaveProfile = async () => {
    const nickname = profileForm.value.nickname.trim()
    if (nickname.length < 2 || nickname.length > 20) {
        ElMessage.warning('昵称长度需在 2-20 个字符之间')
        return
    }

    const avatar = profileForm.value.avatarList[0] || ''
    const currentNickname = (userStore.userInfo?.nickname || '').trim()
    const currentAvatar = userStore.userInfo?.avatar || userStore.userInfo?.avatarUrl || ''

    if (nickname === currentNickname && avatar === currentAvatar) {
        ElMessage.info('资料没有变化')
        return
    }

    savingProfile.value = true
    try {
        const res: any = await authApi.updateProfile({
            nickname,
            avatar,
            avatarUrl: avatar
        })

        if (res.code === 200 || res.code === 201) {
            userStore.updateUserProfile({
                nickname,
                avatar,
                avatarUrl: avatar
            })
            showProfileDialog.value = false
            ElMessage.success(res.msg || '资料更新成功')
        } else {
            ElMessage.error(res.msg || '资料更新失败')
        }
    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || '资料更新失败，请稍后重试')
    } finally {
        savingProfile.value = false
    }
}

// 🔹 快捷入口配置
const quickActions = computed(() => [
    {
        label: '我发布的',
        path: '/products/orders?type=published',
        icon: Box,
        iconClass: 'text-blue-500',
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
interface ProductTab {
    key: 'published' | 'bought' | 'sold'
    label: string
    count?: number
    loading?: boolean
}

const productTabs = ref<ProductTab[]>([
    { key: 'published', label: '我发布的', count: undefined, loading: false },
    { key: 'bought', label: '我买到的', count: undefined, loading: false },
    { key: 'sold', label: '我卖出的', count: undefined, loading: false },
])

// 获取单个的商品数量
const fetchTabCount = async (key: ProductTab['key'], apiFn: () => Promise<any>) => {
    const tab = productTabs.value.find(t => t.key === key)
    if (tab) tab.loading = true

    try {
        await apiFn().then((res: any) => {
            if (res.code === 200) {
                const count = res.data?.pagination?.total
                if (tab) tab.count = count
            }
        })
    } finally {
        if (tab) tab.loading = false
    }
}

// 获取商品的数据
const getProductData = async () => {
    try {
        await Promise.all([
            fetchTabCount('published', () => orderApi.getPublishGoods()),
            fetchTabCount('bought', () => orderApi.getBoughtGoods()),
            fetchTabCount('sold', () => orderApi.getSoldGoods()),
        ])
    } catch (error) {
        console.error('❌ 批量获取商品数量失败:', error)
    }
}

// 🔹 退出登录
const handleLogout = () => {
    modalBox({
        type: 'error',
        title: '提示',
        message: '确定要退出登录吗？'
    }).then(() => {
        userStore.logout()
        router.replace({ path: '/auth/login' })
    })
}

// 🔹 初始化
onMounted(async () => {
    if (userStore.token) {
        await favoriteStore.initFavorites()
    }
    getProductData()
})
</script>

<style scoped>
/* 🔥 移动端（≤767px）：换行 + 居中 + 调整顺序 */
@media (max-width: 767px) {

    /* 父容器允许换行 */
    .profile-header-row {
        flex-wrap: wrap !important;
        row-gap: 12px !important;
    }

    /* 信用分容器：全宽 + 居中 + 排到最后 */
    .credit-score-container {
        width: 100% !important;
        text-align: center !important;
        margin-top: 8px !important;
        order: 10 !important;
        /* 排到设置按钮后面 */
    }

    /* 信用分内容：居中 */
    .credit-score-content {
        justify-content: center !important;
    }

    /* 标签和描述：居中 */
    .credit-score-tag,
    .credit-score-desc {
        text-align: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    /* 设置按钮：排到信用分前面 */
    .settings-btn {
        order: 9 !important;
    }
}
</style>
