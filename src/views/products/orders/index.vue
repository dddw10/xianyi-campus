<template>
    <div class="w-90% my-4 md:w-60% md:my-12 mx-auto bg-[--card] rounded-2xl shadow-2xl ">
        <!-- 页面标题 -->
        <div class="max-w-5xl mx-auto px-4 py-6">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                📦 我的订单
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
                管理您发布和交易的商品
            </p>
        </div>

        <!-- 商品列表 -->
        <div>
            <el-tabs v-model="activeTab" class="order-tabs" :stretch="true">
                <!-- 我发布的 -->
                <el-tab-pane label="📤 我发布的" name="published">
                    <div class="mt-4 overflow-auto">
                        <publish></publish>
                    </div>
                </el-tab-pane>

                <!-- 我买到的 -->
                <el-tab-pane label="🛒 我买到的" name="bought">
                    <div class="mt-4">
                        <goods></goods>
                    </div>
                </el-tab-pane>

                <!-- 我卖出的 -->
                <el-tab-pane label="💰 我卖出的" name="sold">
                    <div class="mt-4">
                        <sold></sold>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import publish from './modules/publish-goods/index.vue'
import goods from './modules/bought-goods/index.vue'
import sold from './modules/sold-goods/index.vue'

const activeTab = ref<'published' | 'bought' | 'sold'>('published')
</script>

<style scoped></style>