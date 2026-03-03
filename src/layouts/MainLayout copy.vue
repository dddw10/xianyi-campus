<template>
    <div>
        main
        <div>text
            <div>
                <div class="demo-container">
                    <h2>🚀 虚拟滚动列表示范（{{ dataList.length }} 条数据）</h2>

                    <div class="stats">
                        <div class="stat-item">
                            <span class="label">DOM 节点数：</span>
                            <span class="value">{{ visibleDomCount }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">渲染减少：</span>
                            <span class="value">{{ reductionRate }}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">起始索引：</span>
                            <span class="value">{{ startIndex }}</span>
                        </div>
                    </div>

                    <VirtualList :data="dataList" :item-height="50" :buffer="5" :container-height="500" />

                    <div class="controls">
                        <el-button @click="scrollTo(0)">滚动到顶部</el-button>
                        <el-button @click="scrollTo(5000)">滚动到中间</el-button>
                        <el-button @click="scrollTo(9999)">滚动到底部</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VirtualList from '@/components/virtualList.vue'
import { ElButton } from 'element-plus'

// 生成测试数据
const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `用户${i + 1}`,
        email: `user${i + 1}@example.com`
    }))
}

const dataList = ref(generateData(10000))

// 统计信息
const visibleDomCount = computed(() => {
    return Math.ceil(500 / 50) + 10 // 可视区域 + 缓冲區
})

const reductionRate = computed(() => {
    return ((1 - visibleDomCount.value / dataList.value.length) * 100).toFixed(2)
})

const startIndex = ref(0)

const scrollTo = (index: number) => {
    const container = document.querySelector('.virtual-list') as HTMLElement
    if (container) {
        container.scrollTop = index * 50
        startIndex.value = index
    }
}
</script>

<style scoped>
.demo-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 24px;
}

h2 {
    text-align: center;
    color: #303133;
    margin-bottom: 24px;
}

.stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
}

.stat-item {
    text-align: center;
}

.stat-item .label {
    color: #909399;
    font-size: 14px;
}

.stat-item .value {
    display: block;
    color: #409eff;
    font-size: 20px;
    font-weight: bold;
    margin-top: 4px;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin: 24px 0;
}
</style>