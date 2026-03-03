<template>
    <div>
        <el-switch v-model="isDark" inline-prompt active-text="☀️" inactive-text="🌙" @change="changeTheme">
            <!-- Element Plus 2.2+ 已废弃 action 插槽，直接用 text -->
        </el-switch>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { current, setTheme } = useTheme()
// current 是 ref，使用 .value 初始化 isDark
const isDark = ref(current === 'dark')

// 监听 current 的 value 变化
watch(() => current, (newTheme) => {
    isDark.value = newTheme === 'dark'
})

// 接收 Element Plus switch 可能传入的 string | number | boolean
const changeTheme = (val: string | number | boolean) => {
    const isDarkMode = Boolean(val)
    setTheme(isDarkMode ? 'dark' : 'light')
}
</script>