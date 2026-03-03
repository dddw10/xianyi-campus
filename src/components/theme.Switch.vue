<template>
    <el-switch v-model="isDark" inline-prompt active-text="🌙" inactive-text="☀️" @change="changeTheme" />
</template>

<script setup lang="ts">
import { ref, watchEffect, isRef } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { current, setTheme } = useTheme()

// 初始化 isDark，兼容 current 是 Ref 或 普通字符串
const isDark = ref(isRef(current) ? current.value === 'dark' : current === 'dark')

// 使用 watchEffect 来正确响应 current 的变化（如果 current 是 ref）
watchEffect(() => {
    isDark.value = isRef(current) ? current.value === 'dark' : current === 'dark'
})

// Element Plus switch 可能传入 boolean | string | number
const changeTheme = (val: boolean | string | number) => {
    const isDarkMode = Boolean(val)
    setTheme(isDarkMode ? 'dark' : 'light')
}
</script>