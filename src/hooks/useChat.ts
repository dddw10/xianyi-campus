import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/modules/user'; // 确保你的 user store 已导出类型

// 🔹 类型定义

// 消息类型枚举映射
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'pending_audit';

// 聊天消息数据结构 (需与后端返回一致)
export interface ChatMessage {
    id: number;
    room_id: number;
    sender_id: number;
    content: string;
    msg_type: MessageType;
    status: MessageStatus;
    extra_data?: Record<string, any> | null; // JSON 字段
    created_at: string; // ISO 日期字符串
}

// 加入房间的参数
export interface JoinRoomParams {
    businessType: string;
    businessId: number | string;
    targetUserId: number;
}

// 发送消息的参数
export interface SendMessageParams {
    content: string;
    type?: MessageType;
    extraData?: Record<string, any> | null;
}

// Hook 返回值类型
export interface UseChatReturn {
    messages: Ref<ChatMessage[]>;
    isConnected: Ref<boolean>;
    sendMessage: (content: string, type?: MessageType, extraData?: Record<string, any>) => void;
    error: Ref<string | null>;
}

export function useChat(
    businessType: string,
    businessId: number | string,
    targetUserId: number
): UseChatReturn {
    const messages = ref<ChatMessage[]>([]);
    const isConnected = ref<boolean>(false);
    const error = ref<string | null>(null);
    const socket: Ref<Socket | null> = ref(null);

    const userStore = useUserStore();

    // 后端地址：优先使用环境变量，否则默认本地
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://192.168.8.49:3000';

    const connect = () => {
        if (socket.value) return; // 防止重复连接

        // 获取 Token (确保 userStore.token 是 string 类型)
        const token = userStore.token;

        if (!token) {
            error.value = '未登录，无法建立聊天连接';
            console.warn('⚠️ useChat: 未找到 Token');
            return;
        }

        socket.value = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000
        });

        // 1. 连接成功
        socket.value.on('connect', () => {
            isConnected.value = true;
            error.value = null;
            console.log('🟢 Socket 连接成功');

            // 主动加入房间
            socket.value?.emit('join_room', {
                businessType,
                businessId,
                targetUserId
            } as JoinRoomParams);
        });

        // 2. 接收历史消息
        socket.value.on('history_messages', (history: ChatMessage[]) => {
            messages.value = history;
            scrollToBottom();
        });

        // 3. 接收新消息
        socket.value.on('receive_message', (msg: ChatMessage) => {
            messages.value.push(msg);
            scrollToBottom();
        });

        // 4. 错误处理
        socket.value.on('error', (err: { message: string }) => {
            console.error('❌ Socket 错误:', err.message);
            error.value = err.message;
            // 可以选择在这里 toast 提示用户
        });

        // 5. 断开连接
        socket.value.on('disconnect', (reason: string) => {
            isConnected.value = false;
            console.log(`🔴 Socket 断开连接: ${reason}`);
            if (reason === 'io server disconnect') {
                // 服务器主动断开，尝试重连
                socket.value?.connect();
            }
        });

        // 6. 连接错误 (如认证失败)
        socket.value.on('connect_error', (err: Error) => {
            console.error('❌ 连接错误:', err.message);
            error.value = err.message === 'Invalid token' ? '登录已过期，请重新登录' : '连接服务器失败';
            isConnected.value = false;
        });
    };

    const sendMessage = (content: string, type: MessageType = 'text', extraData: Record<string, any> | null = null) => {
        if (!socket.value || !isConnected.value) {
            error.value = '连接已断开，请刷新页面';
            return;
        }

        socket.value.emit('send_message', {
            content,
            type,
            extraData
        } as SendMessageParams);
    };

    const scrollToBottom = () => {
        // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
        requestAnimationFrame(() => {
            setTimeout(() => {
                const container = document.querySelector('.chat-container');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 50);
        });
    };

    onMounted(() => {
        connect();
    });

    onUnmounted(() => {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
        }
    });

    return {
        messages,
        isConnected,
        sendMessage,
        error
    };
}