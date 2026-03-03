<!-- src/layouts/AuthLayout.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
        <div class="w-full max-w-450px bg-white rounded-xl overflow-hidden shadow-2xl m-10">
            <div class="p-6 text-center bg-gray-100 border-b border-gray-200 lt-sm:p-5">
                <h1 class="m-0 text-gray-700 text-xl font-bold ">校园二手交易平台</h1>
            </div>
            <div class="p-8 lt-sm:p-4">
                <router-view />
            </div>
            <div class="p-5 text-center bg-gray-100 border-t border-gray-200">
                <p class="text-gray-500 text-sm">© 2026 校园二手平台</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>