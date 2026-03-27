<!-- src/views/pay/Result.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

            <!--  支付成功 -->
            <div v-if="status === 'success'">
                <el-icon class="text-6xl text-green-500 mb-4">
                    <CircleCheckFilled />
                </el-icon>
                <h2 class="text-2xl font-bold">支付成功</h2>
                <p class="text-gray-500 mt-2">订单号：{{ orderNo }}</p>
                <p class="text-blue-600 text-xl font-bold mt-4">¥{{ amount }}</p>

                <div class="flex gap-3 mt-8">
                    <el-button @click="goToOrder">查看订单</el-button>
                    <el-button type="primary" @click="goToHome">返回首页</el-button>
                </div>
            </div>

            <!--  支付失败 -->
            <div v-else-if="status === 'failed'">
                <el-icon class="text-6xl text-red-500 mb-4">
                    <CircleCloseFilled />
                </el-icon>
                <h2 class="text-2xl font-bold">支付失败</h2>
                <p class="text-gray-500 mt-2">{{ errorMsg || '请稍后重试' }}</p>

                <div class="flex gap-3 mt-8">
                    <el-button @click="retryPay">重新支付</el-button>
                    <el-button type="primary" @click="goToHome">返回首页</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const status = ref<'success' | 'failed' | 'loading'>(
    route.query.status as 'success' | 'failed' | 'loading' || 'loading'
)
const orderNo = ref(route.query.orderNo as string || '')
const amount = ref(route.query.amount as string || '0.00')
const errorMsg = ref('')

const goToOrder = () => {
    if (orderNo.value) router.push(`/orders/${orderNo.value}`)
    else router.push('/user/orders')
}

const goToHome = () => router.push('/')
const retryPay = () => {
    if (orderNo.value) router.push(`/pay/${orderNo.value}`)
    else router.push('/user/orders')
}
</script>