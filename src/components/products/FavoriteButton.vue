<!-- src/components/products/FavoriteButton.vue -->
<template>
    <el-button :type="isFavorited ? 'warning' : 'default'" :icon="isFavorited ? StarFilled : Star" :loading="loading"
        :size="size" :circle="circle" @click="handleToggle" class="favorite-btn transition-all duration-200"
        :class="{ 'is-favorited': isFavorited }" :title="isFavorited ? '取消收藏' : '加入收藏'">
        <span v-if="!circle" class="ml-1 hidden sm:inline">
            {{ isFavorited ? '已收藏' : '收藏' }}
        </span>
    </el-button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { useFavoriteStore } from '@/stores/modules/favorite'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

interface Props {
    productId: number
    size?: 'large' | 'default' | 'small'
    circle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'default',
    circle: false
})

interface Emits {
    (e: 'change', favorited: boolean): void
}

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const loading = ref(false)

const isFavorited = computed(() =>
    favoriteStore.isFavorited(props.productId)
)

const handleToggle = async (): Promise<void> => {
    if (!userStore.token) {
        ElMessage.warning('请先登录')
        router.push({
            path: '/login',
            query: { redirect: route.fullPath }
        })
        return
    }

    loading.value = true
    try {
        // 🔥 关键修复：等待 toggle 完成，使用后端返回的真实状态
        favoriteStore.toggleWithResponse(props.productId).then((res: any) => {
            if (res.code === 200) {
                const newFavorited = res.data?.favorited ?? !isFavorited.value
                emit('change', newFavorited)
            }
        })
    } catch (error) {
        // 错误已在 store 中处理
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.favorite-btn {
    @apply flex items-center justify-center;
}

.favorite-btn.is-favorited {
    @apply border-warning-500 hover:border-warning-600;
}

.favorite-btn.is-favorited:hover {
    @apply bg-warning-50 dark:bg-warning-900/20;
}

@media (max-width: 640px) {
    .favorite-btn {
        @apply min-w-[44px] min-h-[44px];
    }
}
</style>