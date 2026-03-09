<!-- src/views/NotFound.vue -->
<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div class="text-center px-6">

            <!--  404 数字 -->
            <div
                class="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
                404
            </div>

            <!--  图标 -->
            <div class="text-6xl mb-6">📦</div>

            <!--  文案 -->
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                页面走丢啦
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                你访问的页面可能已被移除或正在迷路中...
            </p>

            <!--  按钮组 -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <el-button type="primary" @click="goHome"
                    class="!rounded-full !px-8 !py-3 !text-base shadow-md hover:shadow-lg transition-all">
                    🏠 返回首页
                </el-button>
                <el-button @click="goBack"
                    class="!rounded-full !px-8 !py-3 !text-base border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all">
                    ← 返回上一页
                </el-button>
            </div>

            <!--  快捷链接 -->
            <div class="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <el-link type="primary" :underline="false" @click="navigateTo('/products')">
                    浏览商品
                </el-link>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <el-link type="primary" :underline="false" @click="navigateTo('/auth/login')">
                    登录账号
                </el-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const goHome = () => router.push({ name: 'home' })
const goBack = () => window.history.length > 1 ? router.back() : router.push({ name: 'home' })
const navigateTo = (path: string) => router.push(path).catch(() => ElMessage.warning('页面暂不可用'))
</script>