<template>
    <!-- 🔥 模板部分完全保持不变 -->
    <div
        class="flex flex-col h-full w-full mx-auto bg-white rounded-xl shadow-lg border border-[var(--el-border-color-lighter)] overflow-hidden font-sans">

        <!-- 1. 头部区域 -->
        <div
            class="flex items-center justify-between px-5 py-3 border-b border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)]">
            <button @click="emit('black')"
                class="w-4 h-4 flex items-center justify-center rounded-none bg-[--bg-elevated] hover:bg-transparent active:scale-90 transition-transform text-[var(--el-text-color-primary)] -ml-2 border-none outline-none focus:outline-none">
                <ElIcon :size="24">
                    <ArrowLeft />
                </ElIcon>
            </button>
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full transition-colors duration-300"
                    :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
                <h3 class="font-bold text-[var(--el-text-color-primary)] text-sm">
                    {{ title || '在线咨询' }}
                </h3>
            </div>
            <span class="text-xs text-[var(--el-text-color-secondary)]">
                {{ isConnected ? '在线' : '连接中...' }}
            </span>
        </div>

        <!-- 2. 消息列表区域 -->
        <div class="chat-container flex-1 overflow-y-auto p-4 bg-[#f9fbfd] space-y-4 scroll-smooth">

            <!-- 空状态 -->
            <div v-if="messages.length === 0"
                class="flex flex-col items-center justify-center h-full text-[var(--el-text-color-secondary)]">
                <ElIcon :size="48" class="mb-2 opacity-50">
                    <ChatLineRound />
                </ElIcon>
                <span class="text-xs">暂无消息，开始对话吧～</span>
            </div>

            <!-- 消息气泡循环 -->
            <div v-for="msg in messages" :key="msg.id" class="flex w-full group"
                :class="isMyMessage(msg) ? 'justify-end' : 'justify-start'">
                <!-- 对方头像 (左侧) -->
                <div v-if="!isMyMessage(msg)"
                    class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 shadow-sm">
                    TA
                </div>

                <!-- 气泡容器 -->
                <div class="max-w-[75%] flex flex-col" :class="isMyMessage(msg) ? 'items-end' : 'items-start'">
                    <div class="px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words leading-relaxed transition-all duration-200 hover:shadow-md"
                        :class="isMyMessage(msg)
                            ? 'bg-[var(--el-color-primary)] text-white rounded-br-none'
                            : 'bg-white text-[var(--el-text-color-primary)] border border-[var(--el-border-color-lighter)] rounded-bl-none'">
                        {{ msg.content }}
                    </div>
                    <span class="text-[10px] text-[var(--el-text-color-secondary)] mt-1 px-1 opacity-80">
                        {{ formatTime(msg.created_at) }}
                    </span>
                </div>

                <!-- 我的头像 (右侧) -->
                <div v-if="isMyMessage(msg)"
                    class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 shadow-sm">
                    Me
                </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="text-center text-xs text-red-500 bg-red-50 py-1 rounded">
                {{ error }}
            </div>
        </div>

        <!-- 3. 输入区域 -->
        <div class="p-3 bg-white border-t border-[var(--el-border-color-lighter)]">
            <div class="flex gap-2 items-end">
                <textarea v-model="inputMsg" @keydown.enter.prevent="handleEnter" placeholder="输入消息..." rows="1"
                    class="flex-1 px-3 py-2 rounded-lg border border-[var(--el-border-color)] focus:border-[var(--el-color-primary)] focus:ring-1 focus:ring-[var(--el-color-primary-light-9)] outline-none transition-all text-sm resize-none max-h-24 bg-[var(--el-fill-color-blank)] text-[var(--el-text-color-primary)] placeholder-[var(--el-text-color-placeholder)]"
                    style="min-height: 36px;" :disabled="!isConnected"></textarea>

                <button @click="handleSend" :disabled="!inputMsg.trim() || isSending || !isConnected"
                    class="px-4 py-2 bg-[var(--el-color-primary)] hover:bg-[var(--el-color-primary-light-3)] disabled:bg-[var(--el-fill-color)] disabled:text-[var(--el-text-color-placeholder)] text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-sm shadow-sm active:scale-95">
                    <ElIcon v-if="isSending" class="is-loading">
                        <Loading />
                    </ElIcon>
                    <ElIcon v-else>
                        <ArrowUp />
                    </ElIcon>
                    <span>{{ isSending ? '发送中' : '发送' }}</span>
                </button>
            </div>
            <div v-if="!isConnected" class="text-center text-xs text-orange-500 mt-1">
                连接断开，正在重连...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
// import { useChat, type ChatMessage } from '@/hooks/useChat'; // 👈 注释掉，改用手动管理 Socket
import { useUserStore } from '@/stores/modules/user';
import { ArrowUp, Loading, ChatLineRound, ArrowLeft } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
// 🔥 逻辑修改点 1: 引入 socket.io-client
import { io, Socket } from 'socket.io-client';

// 🔹 Props 定义
const props = defineProps<{
    businessType: string;
    businessId: number | string;
    targetUserId: number;
    title?: string;
}>();

// 🔥 逻辑修改点 2: 定义 emit，包含 receive-new-message
interface Emits {
    (e: 'black'): void;
    (e: 'receive-new-message', msg: any): void;
}
const emit = defineEmits<Emits>();

const userStore = useUserStore();
const currentUserId = computed(() => userStore.userInfo?.id || 0);

// 🔥 逻辑修改点 3: 本地状态管理 (替代 useChat)
const messages = ref<any[]>([]);
const isConnected = ref(false);
const error = ref('');
let socket: Socket | null = null;

const inputMsg = ref('');
const isSending = ref(false);

// 🔥 逻辑修改点 4: 初始化 Socket
const initSocket = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

    socket = io(apiUrl, {
        auth: { token: userStore.token },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('🟢 ChatWindow Socket 已连接');
        isConnected.value = true;
        error.value = '';

        // 加入房间
        socket?.emit('join_room', {
            businessType: props.businessType,
            businessId: props.businessId,
            targetUserId: props.targetUserId
        });
    });

    socket.on('disconnect', () => {
        console.log('🔴 ChatWindow Socket 断开');
        isConnected.value = false;
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket 连接错误:', err.message);
        error.value = '连接失败';
        isConnected.value = false;
    });

    // 👇 关键：监听服务器广播的新消息
    socket.on('receive_message', (msg: any) => {
        console.log('📩 ChatWindow 收到新消息:', msg);

        // 1. 更新本地消息列表
        messages.value.push(msg);
        scrollToBottom();

        // 2. 🔥 通知父组件更新左侧列表
        emit('receive-new-message', {
            roomId: msg.room_id,      // 确保字段名匹配后端
            content: msg.content,
            time: msg.created_at,
            senderId: msg.sender_id,
            type: msg.msg_type
        });
    });

    // 加载历史消息
    socket.on('history_messages', (history: any[]) => {
        messages.value = history;
        scrollToBottom();
    });
};

const scrollToBottom = () => {
    setTimeout(() => {
        const container = document.querySelector('.chat-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 100);
};

// 🔥 逻辑修改点 5: 发送消息
const sendMessage = (content: string, type: string) => {
    if (!socket || !isConnected.value) {
        error.value = '未连接服务器';
        return;
    }

    socket.emit('send_message', {
        content,
        type,
        extraData: null
    });
};

const handleSend = () => {
    const content = inputMsg.value.trim();
    if (!content) return;

    isSending.value = true;
    sendMessage(content, 'text');
    inputMsg.value = '';
    isSending.value = false;
};

const handleEnter = (e: KeyboardEvent) => {
    if (!e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};

const isMyMessage = (msg: any) => msg.sender_id === currentUserId.value;

const formatTime = (time: string) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
    initSocket();
});

onUnmounted(() => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
});
</script>

<style scoped>
/* 🔥 样式部分完全保持不变 */
.chat-container::-webkit-scrollbar {
    width: 6px;
}

.chat-container::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color);
    border-radius: 3px;
}

.chat-container::-webkit-scrollbar-track {
    background-color: transparent;
}
</style>