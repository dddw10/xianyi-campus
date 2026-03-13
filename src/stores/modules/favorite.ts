// src/stores/modules/favorite.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import favoriteApi from '@/api/favorite'
import { ElMessage } from 'element-plus'

interface FavoriteItem {
    id: number
    title?: string
    description?: string
    price?: number | string
    category?: string
    images?: string[]
    status?: string
    review_status?: string
    seller_id?: string | number
    favorited_at?: string
    [key: string]: any
}

interface ToggleResponse {
    code: number
    msg: string
    data: { favorited: boolean }
}

export const useFavoriteStore = defineStore('favorite', () => {
    const favoritedIds = ref<Set<number>>(new Set())
    const list = ref<FavoriteItem[]>([])
    const pagination = ref({ page: 1, limit: 20, total: 0 })
    const loading = ref(false)

    const isFavorited = computed(() => {
        return (productId: number): boolean => {
            return favoritedIds.value.has(Number(productId))
        }
    })

    const count = computed(() => favoritedIds.value.size)

    const initFavorites = async (): Promise<void> => {
        try {
            const res = await favoriteApi.getList({ page: 1, limit: 100 })
            if (res.data?.list) {
                favoritedIds.value = new Set(
                    res.data.list.map((item: any) => Number(item.id))
                )
            }
        } catch (error) {
            console.error('❌ 初始化收藏失败:', error)
        }
    }

    // 🔥 新增：返回完整响应的 toggle 方法
    const toggleWithResponse = async (
        productId: number
    ): Promise<{ favorited: boolean }> => {  // 🔥 只返回 data 部分
        const numericId = Number(productId)
        const wasFavorited = favoritedIds.value.has(numericId)

        try {
            const res = await favoriteApi.toggle(productId)

            if (res.data?.favorited) {
                favoritedIds.value.add(numericId)
                ElMessage.success('✅ 收藏成功')
            } else {
                favoritedIds.value.delete(numericId)
                ElMessage.success('✅ 已取消收藏')
            }

            // 🔥 只返回 data 部分（符合声明的类型）
            return { favorited: res.data?.favorited ?? false }

        } catch (error: any) {
            if (wasFavorited) {
                favoritedIds.value.add(numericId)
            } else {
                favoritedIds.value.delete(numericId)
            }
            ElMessage.error(error.response?.data?.msg || '操作失败')
            throw error
        }
    }

    const fetchList = async (page: number = 1) => {
        loading.value = true
        try {
            const res = await favoriteApi.getList({
                page,
                limit: pagination.value.limit
            })
            if (res.data) {
                list.value = res.data.list || []
                pagination.value = res.data.pagination || pagination.value
            }
            return res.data?.list || []
        } catch (error: any) {
            console.error('❌ 加载收藏列表失败:', error)
            ElMessage.error('加载失败，请重试')
            throw error
        } finally {
            loading.value = false
        }
    }

    const batchUpdate = async (productIds: (string | number)[]): Promise<void> => {
        if (!productIds?.length) return
        try {
            const numericIds = productIds.map(id => Number(id))
            const res = await favoriteApi.batchCheck(numericIds)
            if (res.data?.favoritedIds) {
                res.data.favoritedIds.forEach((id: number) => {
                    favoritedIds.value.add(id)
                })
            }
        } catch (error) {
            console.error('❌ 批量检查收藏失败:', error)
        }
    }

    const clear = (): void => {
        favoritedIds.value.clear()
        list.value = []
        pagination.value = { page: 1, limit: 20, total: 0 }
    }

    const removeFromList = (productId: string | number): void => {
        const index = list.value.findIndex((item: FavoriteItem) =>
            String(item.id) === String(productId)
        )
        if (index !== -1) {
            list.value.splice(index, 1)
        }
    }

    return {
        favoritedIds,
        list,
        pagination,
        loading,
        isFavorited,
        count,
        initFavorites,
        ontoggle,
        toggleWithResponse,  // 🔥 暴露新方法
        fetchList,
        batchUpdate,
        clear,
        removeFromList
    }
})