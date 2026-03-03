<template>
    <div>
        <el-dialog :model-value="visible" :close-on-click-modal="false" :append-to-body="true"
            class="w-200px sm:w-250px md:w-300px lg:w-400px rounded-xl">
            <!-- 头部 -->
            <template #header>
                <div class="flex items-center gap-3">
                    <component :is="IconMap[type]" :style="{ color: colorMap[type] }" class="w-6"></component>
                    <span class="font-bold">{{ title }}</span>
                </div>
            </template>
            <!-- 内容 -->
            <div class="">
                <p>{{ message }}</p>
            </div>
            <!-- 底部 -->
            <template #footer>
                <el-button @click="handleCancel" type="default">
                    {{ cancel }}
                </el-button>
                <el-button @click="handleConfirm" :style="{
                    backgroundColor: buttonColorMap[type],
                    color: '#ffffff',
                    borderColor: buttonColorMap[type],
                }">
                    {{ confirm }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'modalBox'
})
import { ref } from "vue";
import {
    CircleCloseFilled,
    WarningFilled,
    QuestionFilled,
} from '@element-plus/icons-vue'

// props
export interface Props {
    visible: boolean
    type?: 'info' | 'error' | 'question'
    title?: string
    message?: string
    cancel?: string
    confirm?: string
}

interface Emits {
    (e: 'update:visible', v: boolean): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}

//给传递的props一个默认值
const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    title: '提示',
    message: '内容',
    cancel: '取消',
    confirm: '确认'
})

const emits = defineEmits<Emits>()

//图标映射
const IconMap = {
    info: WarningFilled,
    error: CircleCloseFilled,
    question: QuestionFilled
}


// 颜色映射
const colorMap = {
    info: '#0652FB',
    error: '#FB434C',
    question: '#F8A300',
}

//按钮颜色映射
const buttonColorMap = {
    info: '#0652FB',
    error: '#FB434C',
    question: '#0652FB',
}

// 取消
const handleCancel = () => {
    emits('update:visible', false)
    emits('cancel')
}

// 确认
const handleConfirm = () => {
    emits('update:visible', false)
    emits('confirm')
}
</script>

<style scoped></style>