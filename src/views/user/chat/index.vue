<template>
    <!-- 
    🎯 布局策略：
    1. 桌面：Flex 行布局，左右并排。
    2. 移动：Flex 列布局（实际是绝对定位重叠），左侧列表占满，右侧聊天页默认隐藏在右边屏幕外。
       - 移动端：选中房间时，列表隐藏，聊天页全屏滑入。
       - 移动端：未选中时，只显示列表，聊天页隐藏。
    -->
    <div class="flex flex-col md:flex-row 
           h-[calc(100vh-140px)] md:h-[calc(100vh-170px)] 
           w-[90%] md:max-w-7xl md:mx-auto 
           bg-white rounded-2xl shadow-2xl border border-[var(--el-border-color-lighter)] 
           overflow-hidden my-6 
           md:my-12 
           relative">

        <!-- 🔹 左侧：会话列表 -->
        <!-- 
            移动端逻辑：
            - selectedRoom 为真 (已选中): 添加 'hidden' (彻底隐藏)
            - selectedRoom 为假 (未选中): 添加 'flex' (显示)
            桌面端逻辑：
            - 始终 'md:flex' (始终显示)
        -->
        <div class="w-full mt-4 md:w-80 flex-shrink-0 border-r border-[var(--el-border-color-lighter)] flex flex-col bg-[#fafafa] z-10 transition-all duration-300"
            :class="selectedRoom && isMobile ? 'hidden' : 'flex'">

            <!-- 头部 -->
            <div
                class="p-4 md:p-5 border-b border-[var(--el-border-color-lighter)] bg-white sticky top-0 z-20 safe-area-top">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg md:text-xl font-bold text-[var(--el-text-color-primary)]">消息</h2>
                    <span
                        class="text-xs text-[var(--el-text-color-secondary)] bg-[var(--el-fill-color-light)] px-2 py-1 rounded-full">
                        {{ rooms.length }}
                    </span>
                </div>

                <div class="relative">
                    <ElIcon class="absolute left-3 top-2.5 text-[var(--el-text-color-secondary)] z-10">
                        <Search />
                    </ElIcon>
                    <input v-model="searchQuery" type="text" placeholder="搜索联系人..."
                        class="w-full pl-9 pr-3 py-2 bg-[var(--el-fill-color-light)] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--el-color-primary)] focus:bg-white transition-all placeholder-[var(--el-text-color-placeholder)] text-[var(--el-text-color-primary)]" />
                </div>
            </div>

            <!-- 列表内容 -->
            <div class="flex-1 overflow-y-auto custom-scrollbar ">
                <ElSkeleton v-if="loading" :rows="8" animated class="p-4" />

                <div v-else-if="filteredRooms.length === 0"
                    class="flex flex-col items-center justify-center h-48 text-[var(--el-text-color-secondary)]">
                    <ElIcon :size="48" class="mb-3 opacity-40">
                        <ChatDotRound />
                    </ElIcon>
                    <span class="text-sm">暂无消息</span>
                </div>

                <div v-for="room in filteredRooms" :key="room.id" @click="selectRoom(room)"
                    class="group flex items-center gap-3 px-3 md:px-4 py-3 cursor-pointer transition-all duration-200 border-b border-transparent hover:bg-white active:bg-[var(--el-fill-color-light)]"
                    :class="selectedRoom?.id === room.id && !isMobile ? 'bg-white border-[var(--el-border-color-lighter)] shadow-sm z-10' : ''">
                    <!-- 头像 -->
                    <div class="relative flex-shrink-0">
                        <div
                            class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[var(--el-color-primary-light-7)] to-[var(--el-color-primary)] flex items-center justify-center text-white font-bold text-base md:text-lg shadow-sm overflow-hidden">
                            <span v-if="!room.partner_avatar">
                                {{ getDisplayName(room).charAt(0).toUpperCase() }}
                            </span>
                            <img v-else :src="room.partner_avatar" class="w-full h-full object-cover" />
                        </div>
                        <span
                            class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#fafafa] rounded-full"></span>
                        <span v-if="room.unread_count && room.unread_count > 0"
                            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 rounded-full border-2 border-white">
                            {{ room.unread_count > 9 ? '9+' : room.unread_count }}
                        </span>
                    </div>

                    <!-- 信息 -->
                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <div class="flex justify-between items-baseline mb-0.5">
                            <span
                                class="font-semibold text-sm text-[var(--el-text-color-primary)] truncate max-w-[110px] md:max-w-[120px]">
                                {{ getDisplayName(room) }}
                            </span>
                            <span
                                class="text-[10px] md:text-xs text-[var(--el-text-color-secondary)] flex-shrink-0 ml-2">
                                {{ formatTime(room.last_message_time) }}
                            </span>
                        </div>
                        <p class="text-xs text-[var(--el-text-color-secondary)] truncate leading-relaxed">
                            <span v-if="room.last_sender_id === currentUserId"
                                class="text-[var(--el-color-primary)] font-medium">你： </span>
                            <span v-if="room.last_msg_type === 'image'" class="inline-flex items-center gap-1">
                                <ElIcon :size="12">
                                    <Picture />
                                </ElIcon> [图片]
                            </span>
                            <span v-else>{{ room.last_message_content || '暂无消息内容' }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <Transition name="slide">
            <!-- 
                🔥 修改点：
                1. 使用 'absolute inset-0'：相对于父容器 (白色卡片) 全屏填充。
                2. 移除 'fixed' 和 'w-screen/h-screen'：防止覆盖 Header。
                3. 保留 'rounded-2xl' 的继承或显式设置：确保角落贴合。
                4. 'z-50'：确保在列表上方。
            -->
            <div v-if="selectedRoom || !isMobile"
                class="flex-1 flex flex-col bg-[#f9fbfd] md:static md:w-auto md:h-auto md:block" :class="[
                    isMobile && selectedRoom
                        ? 'absolute inset-0 z-50 w-full h-full rounded-2xl shadow-2xl'
                        : 'hidden md:flex'
                ]">

                <!-- 聊天内容 -->
                <div v-if="selectedRoom" class="h-full flex flex-col overflow-hidden bg-[--bg]">
                    <ChatWindow :business-type="selectedRoom.business_type" :business-id="selectedRoom.business_id"
                        :target-user-id="getTargetUserId(selectedRoom)" :title="getDisplayName(selectedRoom)"
                        :key="selectedRoom.id" @black="backToList" />
                </div>

                <!-- 空状态 (仅桌面端显示) -->
                <div v-else
                    class="flex-1 h-full flex flex-col items-center justify-center text-[var(--el-text-color-secondary)] bg-[#f9fbfd] hidden md:flex">
                    <div
                        class="w-24 h-24 bg-[var(--el-fill-color-light)] rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <ElIcon :size="48" class="opacity-50">
                            <ChatDotRound />
                        </ElIcon>
                    </div>
                    <h3 class="text-lg font-medium text-[var(--el-text-color-primary)] mb-2">欢迎使用消息中心</h3>
                    <p class="text-sm opacity-80">请在左侧选择一个会话开始聊天</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { Search, ChatDotRound, Picture } from '@element-plus/icons-vue';
import { ElIcon, ElEmpty, ElSkeleton, ElMessage } from 'element-plus';
import ChatWindow from '@/components/ChatWindow.vue';

// 🔹 类型定义
interface RoomItem {
    id: number;
    room_uuid: string;
    business_type: string;
    business_id: number | string;
    user_a_id: number;
    user_b_id: number;
    partner_username: string;
    partner_student_id?: string;
    partner_avatar?: string;
    last_message_content?: string;
    last_message_time?: string;
    last_sender_id?: number;
    last_msg_type?: string;
    unread_count?: number;
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const currentUserId = computed(() => userStore.userInfo?.id || 0);

// 🔹 状态数据
const rooms = ref<RoomItem[]>([]);
const loading = ref(true);
const selectedRoom = ref<RoomItem | null>(null);
const searchQuery = ref('');
const isMobile = ref(false);

// 🔹 辅助函数：获取显示名称
const getDisplayName = (room: RoomItem) => {
    return room.partner_username || room.partner_student_id || '未知用户';
};

// 🔹 监听屏幕宽度
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    // 切换到桌面端时，如果没选中且列表有数据，自动选中第一个
    if (!isMobile.value && rooms.value.length > 0 && !selectedRoom.value) {
        selectedRoom.value = rooms.value[0] ?? null;
    }
};

// 🔹 计算属性：搜索过滤
const filteredRooms = computed(() => {
    if (!searchQuery.value) return rooms.value;
    const query = searchQuery.value.toLowerCase();
    return rooms.value.filter(room => {
        const name = (room.partner_username || '').toLowerCase();
        const studentId = (room.partner_student_id || '').toLowerCase();
        return name.includes(query) || studentId.includes(query);
    });
});

// 🔹 辅助：获取对方 ID
const getTargetUserId = (room: RoomItem) => {
    return room.user_a_id === currentUserId.value ? room.user_b_id : room.user_a_id;
};

// 🔹 方法：获取会话列表
const fetchRooms = async () => {
    loading.value = true;
    try {
        const token = userStore.token;
        if (!token) {
            ElMessage.warning('请先登录');
            router.push('/login');
            return;
        }

        const res = await fetch(`/api/chat/rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();

        if (result.success) {
            rooms.value = result.data || [];
            if (!isMobile.value && rooms.value.length > 0 && !selectedRoom.value) {
                selectedRoom.value = rooms.value[0] ?? null;
            }
        } else {
            ElMessage.error(result.message || '获取消息列表失败');
        }
    } catch (error) {
        console.error('Fetch rooms error:', error);
        ElMessage.error('网络错误，请稍后重试');
    } finally {
        loading.value = false;
    }
};

// 🔥 处理 URL 参数，自动打开聊天
const handleAutoOpen = async () => {
    const { targetId, type, bizId } = route.query;

    if (targetId && type && bizId) {
        const targetUserId = Number(targetId);
        const businessType = String(type);
        const businessId = Number(bizId);

        console.log('🚀 检测到自动打开参数:', { targetUserId, businessType, businessId });

        if (loading.value) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const existingRoom = rooms.value.find(r =>
            r.business_type === businessType &&
            r.business_id === businessId
        );

        if (existingRoom) {
            selectRoom(existingRoom);
            console.log('✅ 找到现有房间，已选中');
        } else {
            const tempRoom: RoomItem = {
                id: 0,
                room_uuid: '',
                business_type: businessType,
                business_id: businessId,
                user_a_id: Math.min(currentUserId.value, targetUserId),
                user_b_id: Math.max(currentUserId.value, targetUserId),
                partner_username: '正在加载...',
                last_message_content: '发起了一次会话',
                last_message_time: new Date().toISOString(),
                last_sender_id: currentUserId.value
            };

            selectRoom(tempRoom);
            console.log('⚠️ 未找到房间，已创建临时房间，Socket 将自动创建真实记录');
        }

        router.replace({ query: {} });
    }
};

// 🔹 方法：选择会话
const selectRoom = (room: RoomItem) => {
    selectedRoom.value = room;

    // 🔥 关键修复：如果是临时房间 (id 为 0)，延迟刷新列表以获取真实 ID
    if (room.id === 0) {
        console.log('⏳ 选中临时房间，准备同步真实数据...');
        setTimeout(async () => {
            await fetchRooms();

            const realRoom = rooms.value.find(r =>
                r.business_type === room.business_type &&
                String(r.business_id) === String(room.business_id) &&
                ((r.user_a_id === room.user_a_id && r.user_b_id === room.user_b_id) ||
                    (r.user_a_id === room.user_b_id && r.user_b_id === room.user_a_id))
            );

            if (realRoom) {
                selectedRoom.value = realRoom;
                console.log('✅ 成功同步到真实房间 ID:', realRoom.id);
            } else {
                console.error('❌ 刷新列表后仍未找到真实房间');
                ElMessage.warning('会话创建中，请稍后重试');
            }
        }, 200);
    }
};

// 🔹 方法：返回聊表列表
const backToList = () => {
    selectedRoom.value = null;
};

// 🔹 方法：格式化时间
const formatTime = (time?: string) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
        return '昨天';
    }
    return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    fetchRooms().then(() => {
        handleAutoOpen();
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
/* 📱 安全区域适配 */
.safe-area-top {
    padding-top: env(safe-area-inset-top, 0px);
}

/* 🌀 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-light);
    border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
}

/* 💡 移动端点击反馈 */
@media (max-width: 768px) {
    .group:active {
        background-color: var(--el-fill-color-light);
    }

    input,
    textarea {
        font-size: 16px;
    }
}

/* 🚀 关键：侧滑进入动画 (Slide Transition) */
.slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.slide-enter-to {
    transform: translateX(0);
    opacity: 1;
}

.slide-leave-from {
    transform: translateX(0);
    opacity: 1;
}

.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 桌面端禁用动画位移 */
@media (min-width: 768px) {

    .slide-enter-from,
    .slide-leave-to {
        transform: none;
        opacity: 1;
    }
}
</style>