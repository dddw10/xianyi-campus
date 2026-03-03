<template>
    <div class="h-[var(--height)] overflow-y-auto position-relative border border-#dcdfe6 rounded-4px bg-#fff"
        :style="{ '--height': containerHeight + 'px' }" ref="containerRef" @scroll="onScroll">
        <!-- 占位元素：撑开滚动条高度 -->
        <div class="spacer" :style="{ 'height': totalHeight + 'px' }"></div>
        <!-- 可视列表：绝对定位 + 偏移 -->
        <div class="visible-list" :style="{ transform: `translateY(${offsetTop}px)` }">
            <div v-for="item in visibleData" :key="item.id" class="list-item" :style="{ height: itemHeight + 'px' }">
                <div class="item-content">
                    <span class="item-index">{{ item.id + 1 }}</span>
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-email">{{ item.email }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
    data: Array<{ id: number; name: string; email: string }>
    itemHeight?: number
    buffer?: number
    containerHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
    itemHeight: 50,
    buffer: 5,
    containerHeight: 500
})

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

// 1.总高度（撑开滚动条）
const totalHeight = computed(() => {
    return props.data.length * props.itemHeight
})

// 2.可视区域能够容纳下几条
const visibleCount = computed(() => {
    return Math.ceil(props.containerHeight / props.itemHeight)
})

// 3.起始索引
const startIndex = computed(() => {
    return Math.max(Math.floor(scrollTop.value / props.itemHeight) - props.buffer, 0)
})

// 4.结束索引
const endIndex = computed(() => {
    const rawEnd = Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight)
    return Math.min(rawEnd + props.buffer, props.data.length)
})

// 5.可视数据（切片）
const visibleData = computed(() => {
    return props.data.slice(startIndex.value, endIndex.value)
})

// 6.偏移量（让内容出现在正确的位置）
const offsetTop = computed(() => {
    return startIndex.value * props.itemHeight
})

// 7.滚动事件
let rafId: number | null = null
const onScroll = (e: Event) => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
        scrollTop.value = (e.target as HTMLElement).scrollTop
        rafId = null
    })
}
const containerHeight = 300
</script>

<style scoped>
.spacer {
    visibility: hidden;
    pointer-events: none;
}

.visible-list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    will-change: transform;
}

.list-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    box-sizing: border-box;
    background: #fff;
}

.list-item:hover {
    background: #f5f7fa;
}

.item-content {
    display: flex;
    align-items: center;
    padding: 0 16px;
    width: 100%;
    gap: 16px;
}

.item-index {
    width: 40px;
    color: #909399;
    font-size: 14px;
}

.item-name {
    flex: 1;
    color: #303133;
    font-size: 14px;
    font-weight: 500;
}

.item-email {
    width: 200px;
    color: #909399;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>