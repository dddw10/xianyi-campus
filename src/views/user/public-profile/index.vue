<template>
    <div class="w-90% md:w-60% my-4 md:my-12 mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">
        <div class="max-w-5xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between mb-6">
                <el-button @click="router.back()" class="!rounded-full !px-4">← 返回</el-button>
                <el-button v-if="isSelf" type="primary" plain @click="router.push('/main/profile')" class="!rounded-full">
                    进入我的主页
                </el-button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div class="flex items-center gap-4">
                    <el-avatar :size="64" :src="profile.avatar || getDefaultAvatar()">
                        {{ profile.nickname?.[0] || 'U' }}
                    </el-avatar>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
                                {{ profile.nickname || '用户' }}
                            </h2>
                            <el-tag size="small" type="warning">信用分 {{ profile.creditScore }}</el-tag>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">学号：{{ profile.studentId || '-' }}</p>
                    </div>
                    <el-button v-if="canChat" type="primary" class="!rounded-full" @click="handleContact">
                        联系TA
                    </el-button>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">TA发布的商品</h3>
                    <span class="text-sm text-gray-500">共 {{ products.length }} 件</span>
                </div>

                <div v-if="loadingProducts" class="py-8">
                    <el-skeleton :rows="5" animated />
                </div>

                <el-empty v-else-if="products.length === 0" description="暂无公开商品" />

                <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-for="item in products" :key="item.id"
                        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                        @click="goProductDetail(item.id)">
                        <div class="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <el-image :src="item.image" fit="cover" class="w-full h-full">
                                <template #error>
                                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                                        <el-icon>
                                            <Picture />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-image>
                        </div>
                        <div class="p-3">
                            <h4 class="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{{ item.title }}</h4>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-orange-500 font-bold">¥{{ formatPrice(item.price) }}</span>
                                <el-tag size="small" :type="getStatusType(item.status)">{{ getStatusText(item.status) }}</el-tag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import productApi from '@/api/product'
import { useUserStore } from '@/stores/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loadingProducts = ref(false)
const products = ref<any[]>([])
const profile = ref({
    id: '',
    nickname: '',
    avatar: '',
    studentId: '',
    creditScore: '--'
})

const userId = computed(() => String(route.params.id || '').trim())
const isSelf = computed(() => {
    const currentId = String(userStore.userInfo?.id || '').trim()
    return !!currentId && currentId === userId.value
})
const canChat = computed(() => !isSelf.value && !!userId.value)

const normalizeCreditScore = (raw: unknown): string => {
    const num = Number(raw)
    if (!Number.isFinite(num)) return '--'
    return String(Math.max(0, Math.min(100, Math.round(num))))
}

const buildProfileFromRoute = () => {
    profile.value = {
        id: userId.value,
        nickname: String(route.query.nickname || ''),
        avatar: String(route.query.avatar || ''),
        studentId: String(route.query.studentId || ''),
        creditScore: normalizeCreditScore(route.query.creditScore)
    }
}

const mapProduct = (item: any) => ({
    id: item.id,
    title: item.title || item.name || '未命名商品',
    image: item.images?.[0] || item.image_url || '',
    price: item.price ?? 0,
    status: item.status || item.product_status || 'available',
    sellerId: String(item.seller_id || item.sellerId || '')
})

const filterBySeller = (list: any[]) => {
    const targetId = userId.value
    return list.filter((item) => {
        const sid = String(item.seller_id || item.sellerId || '').trim()
        return !!sid && sid === targetId
    })
}

const tryHydrateProfileByProducts = (list: any[]) => {
    if (!list.length) return
    const first = list[0]
    profile.value.nickname = profile.value.nickname || String(first.seller_nickname || first.sellerNickname || '')
    profile.value.avatar = profile.value.avatar || String(first.seller_avatar || first.sellerAvatar || '')
    profile.value.studentId = profile.value.studentId || String(first.seller_student_id || first.sellerStudentId || '')
    if (profile.value.creditScore === '--') {
        const score = first.seller_credit_score ?? first.sellerCreditScore ?? first.creditScore
        profile.value.creditScore = normalizeCreditScore(score)
    }
}

const fetchProducts = async () => {
    if (!userId.value) {
        products.value = []
        return
    }

    loadingProducts.value = true
    try {
        const bySellerRes: any = await productApi.listProducts({
            page: 1,
            limit: 60,
            seller_id: userId.value
        })
        const bySellerListRaw = bySellerRes?.data?.list || bySellerRes?.data || []
        const bySellerFiltered = filterBySeller(bySellerListRaw).map(mapProduct)

        if (bySellerFiltered.length > 0) {
            products.value = bySellerFiltered
            tryHydrateProfileByProducts(bySellerListRaw)
            return
        }

        const allRes: any = await productApi.listProducts({ page: 1, limit: 100 })
        const allListRaw = allRes?.data?.list || allRes?.data || []
        const filtered = filterBySeller(allListRaw).map(mapProduct)
        products.value = filtered
        tryHydrateProfileByProducts(allListRaw)
    } catch (error) {
        console.error('❌ 获取用户商品失败:', error)
        products.value = []
        ElMessage.warning('获取用户主页商品失败')
    } finally {
        loadingProducts.value = false
    }
}

const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : Number(price)
    return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        available: '在售',
        sold: '已售出',
        deleted: '已下架'
    }
    return map[status] || '在售'
}

const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
        available: 'success',
        sold: 'warning',
        deleted: 'info'
    }
    return map[status] || 'success'
}

const getDefaultAvatar = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.value.nickname || '用户')}&background=random`
}

const goProductDetail = (id: number) => {
    router.push(`/products/detail/${id}`)
}

const handleContact = () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }

    if (!userId.value) return

    router.push({
        path: '/main/chat',
        query: {
            targetId: userId.value,
            targetName: profile.value.id || '用户'
        }
    })
}

watch(
    () => [route.params.id, route.query.nickname, route.query.avatar, route.query.creditScore, route.query.studentId],
    () => {
        buildProfileFromRoute()
        fetchProducts()
    },
    { immediate: true }
)
</script>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
