<template>
    <!-- ✅ 使用 style 属性确保 100% 生效 -->
    <div class="min-h-screen flex items-center justify-center transition-colors duration-300"
        :style="{ background: 'var(--auth-bg)' }">

        <div class="w-full max-w-450px 
                    bg-[var(--card)] 
                    border border-[var(--border)]
                    rounded-xl overflow-hidden 
                    shadow-[var(--shadow-lg)]
                    m-10
                    transition-colors duration-300">

            <div class="p-6 text-center 
                        bg-[var(--bg-elevated)] 
                        border-b border-[var(--border)] 
                        lt-sm:p-5">
                <h1 class="m-0 text-[var(--text)] text-xl font-bold">
                    校园二手交易平台
                </h1>
            </div>

            <div class="p-8 lt-sm:p-4 bg-[var(--card)]">
                <router-view />
            </div>

            <div class="p-5 text-center 
                        bg-[var(--bg-elevated)] 
                        border-t border-[var(--border)]">
                <p class="text-[var(--text-tertiary)] text-sm">
                    © 2026 校园二手平台
                </p>
            </div>
        </div>
    </div>
</template>