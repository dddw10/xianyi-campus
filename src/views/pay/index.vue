<!-- src/views/pay/Index.vue -->
<template>
    <div class="min-h-screen bg-[var(--el-fill-color-light)] flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-[var(--el-bg-color)] rounded-2xl shadow-lg p-6">

            <!-- 🔹 支付信息 -->
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-[var(--el-text-color-primary)]">💳 订单支付</h2>
                <p class="text-[var(--el-text-color-secondary)] text-sm mt-2">
                    订单号：{{ orderNo }}
                </p>
            </div>

            <!-- 🔹 支付金额 -->
            <div class="text-center py-6 bg-[var(--el-fill-color-light)] rounded-xl mb-6">
                <p class="text-[var(--el-text-color-secondary)] text-sm">支付金额</p>
                <p class="text-4xl font-bold text-[var(--el-color-primary)] mt-2">¥{{ amount }}</p>
            </div>

            <!-- 🔹 支付方式 -->
            <div class="space-y-3 mb-6">
                <div class="flex items-center gap-3 p-4 border rounded-xl cursor-pointer"
                    :class="paymentMethod === 'alipay' ? 'border-[var(--el-color-primary)] bg-[var(--el-color-primary-light-9)]' : 'border-[var(--el-border-color-light)]'"
                    @click="paymentMethod = 'alipay'">
                    <el-radio v-model="paymentMethod" label="alipay" />
                    <span class="flex-1 font-medium">支付宝</span>
                </div>
            </div>

            <!-- 🔹 支付按钮 -->
            <el-button type="primary" size="large" class="w-full" :loading="paying" @click="handlePay">
                {{ paying ? '正在跳转...' : '立即支付' }}
            </el-button>

            <!-- 🔹 模拟支付提示 -->
            <div v-if="isMock" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-xs text-yellow-700">
                    🔸 开发环境：使用模拟支付，不会真实扣款
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import orderApi from '@/api/order'

const route = useRoute()
const router = useRouter()
const orderNo = ref(route.params.orderNo as string)
const paymentMethod = ref('alipay')
const paying = ref(false)
const amount = ref('0.00')
const isMock = import.meta.env.DEV

const handlePay = async () => {
    paying.value = true
    try {
        const res: any = await orderApi.payOrder(orderNo.value, paymentMethod.value)

        if (res.code === 200 || res.success) {
            const data = res.data
            amount.value = data.amount

            // 🔥 优先判断：开发环境 或 后端返回 mock 都走模拟
            const shouldMock = import.meta.env.DEV || data.mock

            if (shouldMock) {
                ElMessage.info('🔸 模拟支付模式，3 秒后自动完成')
                setTimeout(() => {
                    testMockCallback(orderNo.value, amount.value)
                }, 3000)
                return
            }

            // 正常支付流程...
            if (data.payHtml) {
                ElMessage.success('✅ 正在跳转支付宝...')
                submitForm(data.payHtml)
            } else if (data.payUrl) {
                window.location.href = data.payUrl
            } else {
                ElMessage.error('❌ 未获取到支付表单或链接')
            }
        }
    } catch (error: any) {
        console.error(error)
        const msg = error?.response?.data?.msg || error?.message || '发起支付失败'
        ElMessage.error(msg)
    } finally {
        paying.value = false
    }
}

// 🔥 核心函数：将 HTML 字符串转换为可提交的表单
const submitForm = (htmlString: string) => {
    // 方法 A: 直接写入当前窗口 (会覆盖当前页面，体验较好)
    // document.open()
    // document.write(htmlString)
    // document.close()

    // 方法 B: 打开新标签页 (推荐，防止用户误触后退丢失订单页)
    const win = window.open('', '_blank')
    if (win) {
        win.document.open()
        win.document.write(htmlString)
        win.document.close()
    } else {
        // 如果浏览器拦截了弹窗，降级处理：在当前页跳转
        ElMessage.warning('弹窗被拦截，将在当前页跳转')
        document.open()
        document.write(htmlString)
        document.close()
    }
}

// 🔥 模拟回调测试（开发环境用）
const testMockCallback = async (orderNo: string, amount: string) => {
    // ✅ 注释掉生产环境检查，允许线上模拟
    // if (!import.meta.env.DEV) { ... } 

    try {
        // 🔥 关键：使用动态 API 地址，不要用 localhost
        const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

        console.log('🔸 [模拟支付] 正在请求回调接口:', `${baseUrl}/api/payments/alipay/notify`);

        await fetch(`${baseUrl}/api/payments/alipay/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                out_trade_no: orderNo,
                trade_no: 'MOCK_' + Date.now(),
                total_amount: amount,
                trade_status: 'TRADE_SUCCESS'
            })
        });

        ElMessage.success('✅ 模拟支付成功');
        router.push(`/pay/result?orderNo=${orderNo}&status=success`);
    } catch (error) {
        console.error(error);
        ElMessage.error('模拟回调失败，请检查网络或后端服务');
    }
};

onMounted(() => {
    if (!orderNo.value) ElMessage.error('订单号不能为空')
})
</script>