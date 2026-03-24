<!-- src/components/ImagePreviewList.vue -->
<template>
    <div class="flex gap-2 flex-wrap">
        <img v-for="img in images" :key="img" :src="img"
            class="w-12 h-12 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition"
            @click="handleClick(img)" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    images: string[]
}>()

const emit = defineEmits<{
    (e: 'click', img: string): void
}>()

const handleClick = (img: string) => {
    emit('click', img)
}
</script>