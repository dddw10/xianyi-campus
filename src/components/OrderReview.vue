<!-- src/components/OrderReview.vue -->
<template>
    <el-dialog v-model="visible" title="评价订单" class="w-90% md:w-30%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl">
        <div class="space-y-4">
            <!-- 订单信息 -->
            <div class="text-sm text-gray-500">
                订单号：{{ orderNo }}
            </div>

            <!-- 评分 -->
            <div>
                <p class="text-sm text-gray-500 mb-2">评分</p>
                <el-rate v-model="rating" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
            </div>

            <!-- 评分说明 -->
            <p class="text-xs text-gray-400">
                ⭐⭐⭐⭐⭐ 好评 (+3 分) | ⭐⭐⭐ 中评 | ⭐⭐ 差评 (-10 分)
            </p>
        </div>

        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
                提交评价
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import orderApi from '@/api/order'

const visible = defineModel<boolean>('visible')
const props = defineProps<{ orderNo: string }>()
const emit = defineEmits<{ (e: 'submitted'): void }>()

const rating = ref(5)
const submitting = ref(false)

const handleSubmit = async () => {
    submitting.value = true
    try {
        await orderApi.createReview(props.orderNo, { rating: rating.value })
        ElMessage.success('评价成功')
        visible.value = false
        emit('submitted')
    } catch (error: any) {
        ElMessage.error(error?.message || '评价失败')
    } finally {
        submitting.value = false
    }
}
</script>