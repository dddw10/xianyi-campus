<!-- src/views/home/Index.vue -->
<template>
    <div class="min-h-screen w-full bg-[var(--page-bg)]">
        <!--  轮播图 -->
        <div class="w-full max-w-7xl mx-auto mt-6 px-4">
            <el-carousel :type="carouselWay" :height="height" v-if="!loading.posters && posters.length > 0"
                :interval="3000" class="rounded-2xl shadow-[var(--shadow)] overflow-hidden bg-[var(--card)]">
                <el-carousel-item v-for="item in posters" :key="item.id">
                    <div class="w-full h-full  cursor-pointer" @click="handlePosterClick(item)">
                        <img :src="item.imageUrl" :alt="item.title" class="w-full h-full rounded-2xl bg-[var(--bg)]" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <el-skeleton v-else-if="loading.posters" :rows="5" animated class="rounded-2xl" />
            <el-empty v-else description="暂无海报" />
        </div>

        <!--  推荐商品 -->
        <div class="w-full max-w-6xl mx-auto mt-12 px-4">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-[var(--text)]"> 推荐商品</h2>
                <p class="text-[var(--text-secondary)] text-sm mt-2">精选好物，品质保证</p>
            </div>

            <el-row :gutter="20" v-if="!loading.products && products.length > 0">
                <el-col :xs="12" :sm="8" :md="6" :lg="6" v-for="item in products" :key="item.id" class="mb-6">
                    <div class="bg-[var(--card)] rounded-xl overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all"
                        @click="goToProduct(item.id)">
                        <div class="aspect-square overflow-hidden bg-[var(--bg)]">
                            <img :src="item.imageUrl" :alt="item.title"
                                class="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                        <div class="p-3">
                            <h3 class="text-sm font-medium text-[var(--text)] truncate">{{ item.title }}</h3>
                            <p class="text-[var(--primary)] font-bold mt-1">¥{{ item.price }}</p>
                            <p class="text-xs text-[var(--text-tertiary)] mt-1">{{ item.sellerNickname }}</p>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <el-skeleton v-else-if="loading.products" :rows="3" animated />
            <el-empty v-else description="暂无推荐商品" />
        </div>

        <!--  常见问题 -->
        <div class="w-full max-w-4xl mx-auto mt-12 px-4 mb-12">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-[var(--text)]">❓ 常见问题</h2>
                <p class="text-[var(--text-secondary)] text-sm mt-2">遇到问题？看看这里有没有答案</p>
            </div>

            <!--  常见问题区域 -->
            <el-collapse v-if="!loading.faqs && faqs.length > 0" v-model="activeNames" accordion
                class="!bg-transparent !border-none">
                <el-collapse-item v-for="(item, index) in faqs" :key="item.id" :name="item.id"
                    class="faq-item mb-2 last:mb-0 overflow-hidden rounded-lg transition-all duration-300">
                    <!--  标题区域 - 简洁设计 & 交互反馈 -->
                    <template #title>
                        <div class="flex items-center gap-3 w-full py-3.5 px-4 
                   hover:bg-[var(--el-fill-color-light)] 
                   active:bg-[var(--el-fill-color)] 
                   transition-colors duration-200 
                   cursor-pointer select-none">
                            <!-- 简约序号 - 浅蓝色调呼应 -->
                            <span class="faq-number w-6 h-6 rounded-full 
                     bg-[var(--el-color-primary-light-9)] 
                     text-[var(--el-color-primary)] 
                     flex items-center justify-center 
                     text-xs font-bold flex-shrink-0">
                                {{ index + 1 }}
                            </span>

                            <!-- 问题文字 -->
                            <span class="flex-1 text-[var(--el-text-color-primary)] 
                     font-medium text-sm md:text-base">
                                {{ item.question }}
                            </span>

                            <!-- 简约箭头 - 旋转动画 -->
                            <el-icon class="faq-arrow text-[var(--el-text-color-secondary)] 
                     transition-transform duration-300 ease-in-out"
                                :class="activeNames === item.id ? 'rotate-90 text-[var(--el-color-primary)]' : ''">
                                <ArrowRight />
                            </el-icon>
                        </div>
                    </template>

                    <!--  答案区域 - 简洁分隔 & 左侧引导线 -->
                    <div class="pr-4  pt-2">
                        <div class="ml-9 pl-4 border-l-2 border-[var(--el-color-primary-light-5)] 
                   animate-fade-in">
                            <p class="text-[var(--el-text-color-regular)] 
                     leading-7 text-sm md:text-base 
                     text-justify">
                                {{ item.answer }}
                            </p>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <el-skeleton v-else-if="loading.faqs" :rows="3" animated />
            <el-empty v-else description="暂无常见问题" />
        </div>

        <!--  底部 -->
        <footer class="w-full bg-[var(--bg-elevated)] border-t border-[var(--border)] py-6 mt-12 rounded-t-2xl">
            <div class="max-w-6xl mx-auto px-4 text-center text-[var(--text-tertiary)] text-sm">
                <p>© 2026 闲易校园 - 校园闲置交易平台</p>
                <p class="mt-1">联系方式：135-3014-7144</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import homeApi, { type PosterItem, type ProductItem, type FaqItem } from '@/api/home'
import { useWindowSize } from "@vueuse/core";

const router = useRouter()
const activeNames = ref<number>(0)

const loading = ref({ posters: true, products: true, faqs: true })
const posters = ref<PosterItem[]>([])
const products = ref<ProductItem[]>([])
const faqs = ref<FaqItem[]>([])
const { width } = useWindowSize()

// 当width宽度小于768时，就更改轮播图方式
const carouselWay = computed(() => {
    return width.value >= 768 ? 'card' : ''
})

const height = computed(() => {
    return width.value >= 768 ? '350px' : '180px'
})

const fetchAll = async () => {
    try {
        const [p1, p2, p3] = await Promise.all([
            homeApi.getPosters(),
            homeApi.getRecommendedProducts(8),
            homeApi.getFaqs()
        ])
        if ((p1 as any).code === 200) posters.value = (p1 as any).data || []
        if ((p2 as any).code === 200) products.value = (p2 as any).data || []
        if ((p3 as any).code === 200) faqs.value = (p3 as any).data || []
    } catch (error) {
        console.error('❌ 加载首页数据失败:', error)
    } finally {
        loading.value.posters = false
        loading.value.products = false
        loading.value.faqs = false
    }
}

const handlePosterClick = (item: PosterItem) => {
    if (item.linkUrl) {
        if (item.linkUrl.startsWith('/')) router.push(item.linkUrl)
        else window.open(item.linkUrl, '_blank')
    }
}

const goToProduct = (id: number) => {
    router.push(`/products/detail/${id}`)
}

onMounted(() => { fetchAll() })
</script>

<style scoped>
:deep(.el-carousel__item) {
    background: var(--card);
}

:deep(.el-collapse-item__header) {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    color: var(--text);
}

:deep(.el-collapse-item__wrap) {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0 0 0.5rem 0.5rem;
}
</style>