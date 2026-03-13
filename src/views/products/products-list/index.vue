<template>
    <div
        class="w-[95%] md:w-[75%] my-6 md:my-12 mx-auto bg-[var(--bg-body)] text-[var(--text)] font-sans rounded-3xl shadow-xl">

        <!-- 1. 顶部导航与搜索栏（保持不变） -->
        <header
            class="sticky top-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)] rounded-t-3xl">
            <div class="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
                <!-- Logo -->
                <div
                    class="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent whitespace-nowrap">
                    XianYI
                </div>

                <!-- 搜索框 -->
                <div class="flex-1 relative group">
                    <input v-model="searchQuery" @input="handleSearchInput" type="text" placeholder="搜索心仪好物..." class="w-full bg-[var(--bg)] border border-[var(--border)] rounded-full py-3 px-5 pl-11
                    focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]
                    transition-all duration-300 ease-out placeholder:text-gray-400" />
                    <svg class="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-[var(--primary)] transition-colors"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>

                <!-- 收藏按钮 -->
                <button @click="router.push('/main/favorites')"
                    class="p-2 rounded-full hover:bg-[var(--bg)] hover:scale-105 transition-all duration-300 relative cursor-pointer group">
                    <svg class="w-4 h-4 text-[var(--primary)] group-hover:text-red-500 transition-colors" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span
                        class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--card)]"></span>
                </button>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-5 py-6">

            <!-- 2. 分类筛选 (横向滚动) -->
            <div class="mb-8 overflow-x-auto pb-3 scrollbar-hide -mx-5 px-5">
                <div class="flex gap-2.5 min-w-max">
                    <button v-for="cat in categories" :key="cat.id"
                        @click="activeCategory = cat.name; handleFilterChange()" :class="[
                            'px-3 py-2 my-2 rounded-2xl text-sm font-medium transition-all duration-300 ease-out border-1',
                            activeCategory === cat.name
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/25scale-105'
                                : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
                        ]">
                        {{ cat.name }}
                    </button>
                </div>
            </div>

            <!-- 🔥 滚动容器（添加 ref 和 scroll 事件） -->
            <div ref="scrollContainerRef" class="min-h-[280px]" @scroll="handleScroll">
                <!-- 3. 商品列表网格 -->
                <div v-if="filteredProducts.length > 0"
                    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">

                    <div v-for="item in filteredProducts" :key="item.id" class="bg-[var(--card)] rounded-3xl shadow-[var(--shadow)] overflow-hidden 
                                    hover:shadow-[var(--shadow-xl)] hover:-translate-y-1
                                    transition-all duration-500 ease-out
                                    border border-[var(--border)] cursor-pointer group">
                        <!-- 商品照片 -->
                        <div class="aspect-square overflow-hidden bg-[var(--bg)] relative"
                            @click="handleDetail(item.id)">
                            <img :src="item.img" :alt="item.name"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />

                            <!-- 快速操作按钮 -->
                            <!-- <button v-if="width > 768" class="absolute bottom-3 right-3 bg-[var(--card)] text-[var(--primary)] p-2.5 rounded-full 
                                       shadow-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 
                                       hover:scale-110 hover:bg-[var(--primary)] hover:text-white
                                       transition-all duration-300 ease-out">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4v16m8-8H4"></path>
                                </svg>
                            </button> -->

                            <span class="absolute top-3 left-3 px-2.5 py-1 bg-[var(--card)]/90 backdrop-blur-sm 
                                       text-xs font-medium rounded-full border border-[var(--border)]">
                            </span>
                        </div>

                        <!-- 商品信息 -->
                        <div class="p-4">
                            <h3 class="text-sm font-medium text-[var(--text)] truncate mb-2" :title="item.name"
                                @click="handleDetail(item.id)">
                                {{ item.name }}
                            </h3>
                            <div class="flex items-center justify-between">
                                <p class="text-[var(--primary)] font-bold text-lg">¥{{ item.price }}</p>
                                <span v-if="width < 768">
                                    <button class="bg-[var(--card)] text-[var(--primary)] rounded-full 
                                       hover:scale-110 hover:bg-[var(--primary)] hover:text-white
                                       transition-all duration-300 ease-out">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4v16m8-8H4"></path>
                                        </svg>
                                    </button>
                                </span>
                                <FavoriteButton :product-id="item.id" size="small"
                                    @change="handleFavoriteChange(item.id, $event)" />
                            </div>

                        </div>
                    </div>
                </div>

                <!-- 🔥 加载状态提示 -->
                <div v-if="loading" class="py-4 text-center text-gray-400">
                    <div class="inline-flex items-center gap-2">
                        <div
                            class="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin">
                        </div>
                        加载中...
                    </div>
                </div>

                <!-- 🔥 没有更多提示 -->
                <div v-else-if="!hasMore && products.length > 0" class="py-4 text-center text-gray-400 text-sm">
                    ~ 没有更多了 ~
                </div>
            </div>

            <!-- 空状态提示 -->
            <div v-if="!loading && filteredProducts.length === 0" class="text-center py-16 text-gray-400">
                <div class="w-20 h-20 mx-auto mb-5 bg-[var(--bg)] rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                        </path>
                    </svg>
                </div>
                <p class="text-lg font-medium">没有找到相关商品</p>
                <p class="text-sm mt-1 opacity-70">试试换个关键词或分类吧～</p>
            </div>

        </main>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWindowSize } from "@vueuse/core";
import adminCategoryApi from "@/api/admin/category";
import productApi from "@/api/product";
import { useRouter } from "vue-router";
import { useFavoriteStore } from "@/stores/modules/favorite";
import { useUserStore } from "@/stores/modules/user";  // 🔥 新增：检查登录状态
import FavoriteButton from "@/components/products/FavoriteButton.vue";  // 🔥 确保导入

const router = useRouter()
const { width } = useWindowSize()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()  // 🔥 新增

// ============ 类型定义 ============
interface categoriesType {
    id: number,
    name: string
}

interface ProductType {
    id: number;
    name: string;
    price: string;
    category: string;
    img: string;
    sold?: number;
    [key: string]: any;
}

// ============ 状态 ============
const categories = ref<categoriesType[]>([]);
const products = ref<ProductType[]>([]);
const searchQuery = ref('');
const activeCategory = ref('✨ 全部');
const page = ref(1);
const limit = ref(20);
const hasMore = ref(true);
const loading = ref(false);
const scrollContainerRef = ref<HTMLElement | null>(null);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// ============ 计算属性 ============
const filteredProducts = computed(() => {
    return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = activeCategory.value === '✨ 全部' || product.category === activeCategory.value;
        return matchesSearch && matchesCategory;
    });
});

// ============ 获取分类 ============
const getCategory = async () => {
    try {
        const res = await adminCategoryApi.getCategoriesEnabled().then((res: any) => {
            if (res.code === 200) {
                categories.value = [
                    { id: -1, name: '✨ 全部' },
                    ...res.data
                ];
            }
        })

    } catch (error) {
        console.error('获取分类失败:', error);
    }
};

// ============ 🔥 核心：加载商品 + 批量检查收藏 ============
const loadProducts = async (isReset = false) => {
    if (loading.value || (!isReset && !hasMore.value)) return;
    loading.value = true;

    if (isReset) {
        products.value = [];
        page.value = 1;
    }

    try {
        productApi.listProducts({
            page: page.value,
            limit: limit.value,
            category: activeCategory.value === '✨ 全部' ? '' : activeCategory.value,
            keyword: searchQuery.value.trim()
        }).then(async (res: any) => {
            if (res.code === 200) {
                const list = res.data.list || res.data || [];
                const formattedList = list.map((item: any) => ({
                    id: item.id,
                    name: item.title || item.name,
                    price: item.price,
                    category: item.category,
                    img: item.images?.[0] || item.img || item.image_url,
                    sold: item.sold,
                    ...item
                }));

                if (isReset) {
                    products.value = formattedList;
                } else {
                    products.value = [...products.value, ...formattedList];
                }

                hasMore.value = res.data.pagination?.hasMore ?? (list.length === limit.value);
                if (list.length > 0) {
                    page.value += 1;
                }

                // 🔥 新增：数据加载成功后，批量检查收藏状态
                await batchCheckFavorites(formattedList)
            }
        })


    } catch (error) {
        console.error('加载商品失败:', error);
    } finally {
        loading.value = false;
    }
};

// 🔥 新增：批量检查收藏状态（仅登录用户）
const batchCheckFavorites = async (productList: ProductType[]) => {
    // 🔥 未登录用户不需要检查收藏状态
    if (!userStore.token || !productList?.length) return

    try {
        // 🔥 提取商品 ID 数组
        const productIds = productList.map(p => p.id).filter(id => id != null)

        if (productIds.length > 0) {
            // 🔥 调用 Pinia store 的批量检查方法
            await favoriteStore.batchUpdate(productIds)
            console.log(`✅ 批量检查收藏完成: ${productIds.length} 个商品`)
        }
    } catch (error) {
        console.error('❌ 批量检查收藏失败:', error)
        // 🔥 失败不影响页面展示，静默处理
    }
}

// 🔹 监听登录状态变化，登录后重新检查收藏
watch(
    () => userStore.token,
    (newToken) => {
        if (newToken && products.value.length > 0) {
            // 🔥 登录后，重新检查当前页商品的收藏状态
            batchCheckFavorites(products.value)
        }
    },
    { immediate: false }
)

// ============ 其他函数保持不变 ============
const handleDetail = (id: number) => {
    router.push(`/products/detail/${id}`)
}

const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const reachBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
    if (reachBottom && !loading.value && hasMore.value) {
        loadProducts(false);
    }
};

const handleFavoriteChange = (productId: number, favorited: boolean): void => {
    if (!favorited) {
        favoriteStore.removeFromList(productId)
    }
}

const handleSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        handleFilterChange();
    }, 300);
};

const handleFilterChange = () => {
    loadProducts(true);
};

// ============ 生命周期 ============
onMounted(() => {
    getCategory();
    loadProducts(true);
});

onUnmounted(() => {
    if (searchTimer) clearTimeout(searchTimer);
});

defineExpose({
    refresh: () => loadProducts(true)
});
</script>

<style scoped>
/* 🔹 样式部分保持不变 */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

[ref="scrollContainerRef"] {
    overflow-y: auto;
    max-height: calc(100vh - 300px);
}

[ref="scrollContainerRef"]::-webkit-scrollbar {
    width: 6px;
}

[ref="scrollContainerRef"]::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
}

[ref="scrollContainerRef"]::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
}
</style>