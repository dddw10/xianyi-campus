<template>
    <div class="flex flex-col w-full items-center">
        <div class="flex w-90% md:w-80% flex-col gap-6 mt-8">

            <!-- 轮播图位置 -->
            <el-carousel :type="carouselWay" :height="height" :interval="3000"
                class="rounded-2xl shadow-lg overflow-hidden">
                <el-carousel-item v-for="(item, index) in posterData" :key="index">
                    <div class="w-full h-full overflow-hidden">
                        <img :src="item.img" alt=""
                            class="w-full h-full rounded-2xl bg-slate-100 transition-transform duration-500 hover:scale-105">
                    </div>
                </el-carousel-item>
            </el-carousel>

            <!-- 商品推荐列表位置 -->
            <div class="flex flex-col items-center">

                <!-- 标题区域 -->
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                        推荐商品
                        <span class="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    </h2>
                    <p class="text-slate-500 text-sm mt-2">精选好物，品质保证</p>
                </div>

                <el-row :gutter="20">
                    <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="4" v-for="(item, index) in products" :key="index"
                        class="mb-6">
                        <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">

                            <!-- 商品照片 -->
                            <div class="aspect-square overflow-hidden bg-slate-100">
                                <img :src="item.img" :alt="`商品${item.name}`"
                                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                            </div>

                            <!-- 商品信息 -->
                            <div class="p-3">
                                <h3 class="text-sm font-medium text-slate-700 truncate">
                                    {{ products[index - 1]?.name || `商品${index}` }}
                                </h3>
                                <p class="text-red-500 font-bold mt-1">
                                    ¥{{ products[index - 1]?.price || '99.00' }}
                                </p>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <!-- 常见问题 -->
            <div class="flex flex-col items-center">

                <!-- 标题区域 -->
                <div class="text-center mb-8 flex flex-col items-center">
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span class="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                        常见问题
                        <span class="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    </h2>
                    <p class="text-slate-500 text-sm mt-3">遇到问题？看看这里有没有你想要的答案</p>
                </div>

                <!-- 折叠列表 -->
                <div class="w-full">

                </div>
                <el-collapse v-model="activeNames" accordion class="border-none w-100% md:w-80% lg:w-60%">
                    <el-collapse-item v-for="(item, index) in questionList" :key="index" :name="index"
                        class="mb-3 rounded-xl overflow-hidden bg-#f1f5f9">
                        <template #title>
                            <div class="flex items-center gap-3 w-full">
                                <div
                                    class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                                    <span class="text-white text-sm font-bold">{{ index + 1 }}</span>
                                </div>
                                <span class="text-slate-700 font-medium flex-1 text-left">{{ item.title }}</span>
                                <el-icon class="text-slate-400 group-hover:text-blue-500 transition-colors">
                                    <ArrowRight v-if="activeNames !== index" />
                                    <ArrowDown v-else />
                                </el-icon>
                            </div>
                        </template>
                        <div class="pl-11 pr-4 py-2">
                            <p class="text-slate-600 leading-relaxed text-sm">{{ item.content }}</p>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </div>

        <!-- 底部栏 -->
        <div class="w-full flex justify-evenly p-10 mt-6 bg-#1f1f1f">

            <!-- logo -->
            <div class="flex gap-3 cursor-pointer group" @click="router.push('/')">
                <span
                    class="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    闲易校园
                </span>
            </div>

            <!-- 路由链接 -->
            <div class="flex flex-col items-center ">
                <el-link @click="router.push('/')">首页</el-link>
                <el-link @click="router.push('/products')">商品</el-link>
                <el-link @click="router.push('/auth/register')">注册</el-link>
            </div>

            <!-- 信息 -->
            <div class="flex flex-col text-zinc-600 text-3">
                <span>联系方式：</span><span>135-3014-7144</span>
                <!-- 版权 -->
                <div class=" text-zinc-600">
                    © 2024 闲易校园
                </div>
            </div>
        </div>

    </div>

</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useRouter } from "vue-router";

const { width } = useWindowSize()
const router = useRouter()
const activeNames = ref(0)

// 当width宽度小于768时，就更改轮播图方式
const carouselWay = computed(() => {
    return width.value >= 768 ? 'card' : ''
})

const height = computed(() => {
    return width.value >= 768 ? '350px' : '180px'
})

const posterData = reactive([
    { img: new URL('@/assets/img/poster2.png', import.meta.url).href },
    { img: new URL('@/assets/img/poster3.png', import.meta.url).href },
    { img: new URL('@/assets/img/poster4.png', import.meta.url).href },
])

// 模拟商品数据
const products = reactive([
    { img: '/product1.jpg', name: '商品名称 1', price: '99.00' },
    { img: '/product2.jpg', name: '商品名称 2', price: '129.00' },
    { img: '/product3.jpg', name: '商品名称 3', price: '79.00' },
    { img: '/product4.jpg', name: '商品名称 4', price: '159.00' },
    { img: '/product5.jpg', name: '商品名称 5', price: '89.00' },
    { img: '/product6.jpg', name: '商品名称 6', price: '199.00' },
    { img: '/product7.jpg', name: '商品名称 7', price: '69.00' },
    { img: '/product8.jpg', name: '商品名称 8', price: '149.00' },
])

// 常见问题数据
const questionList = reactive([
    {
        title: '如何发布闲置物品？',
        content: '点击首页「+」或「发布」按钮，填写物品信息、上传清晰图片、设置价格和交易方式，提交后审核通过即可展示。建议描述详细，提高成交率~'
    },
    {
        title: '交易需要邮寄吗？',
        content: '闲易校园主打校内线下交易，建议双方约定食堂、图书馆等公共场所当面交接。如需邮寄，请自行协商运费并承担相应风险。'
    },
    {
        title: '如何完成学生认证？',
        content: '在「我的」-「身份认证」中上传学生证或校园卡照片，审核通过后即可享受学生专属权益。审核通常在工作日 24 小时内完成。'
    },
    {
        title: '收到商品不满意可以退款吗？',
        content: '线下交易建议当面验货确认。如遇商品与描述严重不符，请保留证据并联系平台客服协助处理。我们支持合理维权。'
    },
])
</script>

<style scoped>
:deep(.custom-collapse) {
    width: 60%;
    border: none;
}

/* 面板头部 */
:deep(.el-collapse-item__header) {
    background: #fff;
    border: 1px solid #e2e8f0 !important;
    border-radius: 0.75rem !important;
    padding: 16px 20px !important;
    font-size: 15px !important;
    font-weight: 500;
    color: #334155 !important;
    transition: all 0.3s ease;
}

:deep(.el-collapse-item__header:hover) {
    background: #f8fafc !important;
    border-color: #94a3b8 !important;
}

:deep(.el-collapse-item__header.is-active) {
    background: linear-gradient(to right, #eff6ff, #fff) !important;
    border-color: #3b82f6 !important;
}

/* 面板内容 */
:deep(.el-collapse-item__wrap) {
    background: #fafafa;
    border-radius: 0 0 0.75rem 0.75rem !important;
    border: 1px solid #e2e8f0 !important;
    border-top: none !important;
}

:deep(.el-collapse-item__content) {
    padding: 12px 20px 16px !important;
    color: #475569 !important;
    line-height: 1.7 !important;
    font-size: 14px !important;
}

/* 图标颜色 */
:deep(.el-collapse-item__arrow) {
    color: #94a3b8;
}

:deep(.el-collapse-item__header.is-active .el-collapse-item__arrow) {
    color: #3b82f6;
}
</style>