<!-- src/layouts/AuthLayout.vue -->
<template>
    <!-- 🔥 页面容器：渐变背景 + 居中布局 + 主题适配 -->
    <div class="
      min-h-screen w-full 
      flex items-center justify-center 
      p-4 
      transition-colors duration-300
      relative 
      overflow-hidden
    " :style="{
        background: 'var(--auth-bg, linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e0f2fe 100%))'
    }">

        <!-- 🔥 装饰层：浮动光斑（纯 CSS 动画） -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-30 animate-float"
                :style="{ background: 'var(--auth-decoration-1, rgba(59, 130, 246, 0.2))' }"></div>
            <div class="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30 animate-float" :style="{
                background: 'var(--auth-decoration-2, rgba(99, 102, 241, 0.2))',
                animationDelay: '1.5s'
            }"></div>
        </div>

        <!-- 🔥 主卡片：毛玻璃效果 + 精致阴影 -->
        <div class="
        w-full max-w-md
        bg-[var(--card, rgba(255,255,255,0.95))]
        backdrop-blur-xl
        rounded-2xl 
        shadow-2xl
        border border-[var(--border, rgba(226,232,240,0.8))]
        overflow-hidden
        transition-all duration-300
        m-4
      ">

            <!-- 🔥 顶部品牌区：Logo + 标题（支持 slot 自定义） -->
            <div class="
          p-6 text-center 
          bg-[var(--bg-elevated, rgba(248,250,252,0.8))]
          border-b border-[var(--border)]
          relative
        ">
                <!-- 装饰线 -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full" :style="{
                    background: 'var(--auth-accent, linear-gradient(90deg, var(--el-color-primary, #3b82f6), var(--el-color-primary-dark, #2563eb)))'
                }"></div>

                <!-- 品牌 Logo + 标题（支持 slot 自定义） -->
                <div class="flex items-center justify-center gap-3 ">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" :style="{
                        background: 'var(--auth-accent, linear-gradient(135deg, var(--el-color-primary, #3b82f6), var(--el-color-primary-dark, #2563eb)))',
                        boxShadow: 'var(--shadow-primary, 0 4px 14px rgba(59, 130, 246, 0.4))'
                    }">
                        <el-icon class="text-white text-lg">
                            <ShoppingCart />
                        </el-icon>
                    </div>
                    <h1 class="text-[var(--text, #1e293b)] text-xl font-bold tracking-tight">
                        <slot name="title">校园二手</slot>
                    </h1>
                </div>
            </div>

            <!-- 🔥 内容区：router-view 渲染登录/注册表单 -->
            <div class="p-8 lt-sm:p-6 bg-[var(--card)]">
                <router-view />
            </div>

            <!-- 🔥 底部区：版权 + 链接 -->
            <div class="
          p-5 text-center 
          bg-[var(--bg-elevated)] 
          border-t border-[var(--border)]
          flex items-center justify-center gap-4 flex-wrap
        ">
                <p class="text-[var(--text-tertiary)] text-sm">
                    © 2026 校园二手平台
                </p>
                <!-- <span class="text-[var(--border)]">|</span>
                <a href="#" class="text-[var(--el-color-primary, #3b82f6)] text-sm hover:underline transition-colors"
                    @click.prevent>
                    用户协议
                </a>
                <a href="#" class="text-[var(--el-color-primary, #3b82f6)] text-sm hover:underline transition-colors"
                    @click.prevent>
                    隐私政策
                </a> -->
            </div>
        </div>

        <!-- 🔥 底部装饰：品牌色渐变条 -->
        <div class="absolute bottom-0 left-0 right-0 h-1" :style="{
            background: 'var(--auth-accent, linear-gradient(90deg, var(--el-color-primary, #3b82f6), var(--el-color-primary-dark, #2563eb)))'
        }"></div>
    </div>
</template>

<script setup lang="ts">
import { ShoppingCart } from '@element-plus/icons-vue'
</script>

<style scoped>
/* 🔥 浮动动画关键帧 */
@keyframes float {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    25% {
        transform: translate(2%, 2%) scale(1.02);
    }

    50% {
        transform: translate(0, 4%) scale(1);
    }

    75% {
        transform: translate(-2%, 2%) scale(0.98);
    }
}

.animate-float {
    animation: float 8s ease-in-out infinite;
}

/* 🔥 响应式优化 */
@media (max-width: 640px) {
    .max-w-md {
        max-width: 100%;
    }
}

/* 🔥 暗黑模式适配（如果 CSS 变量未定义，提供默认值） */
@media (prefers-color-scheme: dark) {
    :root {
        --auth-bg: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        --auth-decoration-1: rgba(59, 130, 246, 0.1);
        --auth-decoration-2: rgba(99, 102, 241, 0.1);
        --card: rgba(30, 41, 59, 0.95);
        --bg-elevated: rgba(51, 65, 85, 0.8);
        --border: rgba(71, 85, 105, 0.8);
        --text: #f1f5f9;
        --text-tertiary: #94a3b8;
    }
}
</style>