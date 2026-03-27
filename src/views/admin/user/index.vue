<!-- src/views/admin/user-management/Index.vue -->
<template>
    <div class="flex flex-col p-4 sm:p-6 space-y-6 h-full">

        <!--  页面头部 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-[var(--el-text-color-primary)]">
                    👥 用户管理
                </h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">
                    管理所有注册用户 · 共 {{ pagination.total }} 人
                </p>
            </div>
            <el-button type="primary" @click="openCreateModal">
                ➕ 新增用户
            </el-button>
        </div>

        <!--  搜索筛选栏 -->
        <div class="w-full">
            <div class="flex flex-col ">
                <el-row :gutter="20">
                    <!-- 学号搜索 -->
                    <el-col :xs="24" :sm="12" :md="8" :lg="4" class="mb-2">
                        <el-input v-model="filters.studentId" placeholder="搜索学号" clearable prefix-icon="Search"
                            @keyup.enter="handleSearch" />
                    </el-col>

                    <!-- 姓名/昵称搜索 -->
                    <el-col :xs="24" :sm="12" :md="8" :lg="4" class="mb-2">
                        <el-input v-model="filters.keyword" placeholder="搜索姓名/昵称" clearable prefix-icon="User"
                            @keyup.enter="handleSearch" />
                    </el-col>

                    <!-- 认证状态筛选 -->
                    <el-col :xs="24" :sm="12" :md="8" :lg="4" class="mb-2">
                        <el-select v-model="filters.verificationStatus" placeholder="认证状态" clearable class="w-full"
                            @change="handleSearch">
                            <el-option label="全部" value="" />
                            <el-option label="✅ 已认证" value="approved" />
                            <el-option label="⏳ 审核中" value="pending" />
                            <el-option label="❌ 已拒绝" value="rejected" />
                            <el-option label="⚪ 未提交" value="unsubmitted" />
                        </el-select>
                    </el-col>

                    <!-- 角色筛选 -->
                    <el-col :xs="24" :sm="12" :md="8" :lg="4" class="mb-2">
                        <el-select v-model="filters.role" placeholder="用户角色" clearable class="w-full"
                            @change="handleSearch">
                            <el-option label="全部" value="" />
                            <el-option label="👨‍🎓 学生" value="student" />
                            <el-option label="👮 管理员" value="admin" />
                        </el-select>
                    </el-col>

                    <!-- 按钮组 -->
                    <el-col :xs="24" :sm="12" :md="8" :lg="4">
                        <el-row class="w-full">
                            <el-col :span="11">
                                <el-button type="primary" class="w-full" @click="handleSearch">
                                    搜索
                                </el-button>
                            </el-col>
                            <el-col :span="2" />
                            <el-col :span="11">
                                <el-button class="w-full" @click="handleReset">
                                    重置
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!--  批量操作栏（选中时显示） -->
        <!-- <div v-if="selectedRows.length > 0"
            class="flex items-center gap-3 p-3 bg-[var(--el-fill-color-light)] rounded-lg">
            <span class="text-sm text-[var(--el-text-color-secondary)]">
                已选择 {{ selectedRows.length }} 项
            </span>
            <el-button size="small" type="danger" @click="handleBatchDisable">
                🚫 批量禁用
            </el-button>
            <el-button size="small" type="success" @click="handleBatchEnable">
                ✅ 批量启用
            </el-button>
            <el-button size="small" link type="danger" @click="selectedRows = []">
                取消选择
            </el-button>
        </div> -->

        <!--  用户列表表格 -->
        <div class="flex-1 flex flex-col">
            <el-table v-loading="loading" :data="userList" class="flex-1" :header-cell-class-name="darkHeaderClass">
                <!-- @selection-change="handleSelectionChange" -->

                <!-- 多选 -->
                <!-- <el-table-column type="selection" width="50" align="center" /> -->

                <!-- ID -->
                <el-table-column prop="id" label="ID" width="80" align="center" />

                <!-- 头像 -->
                <el-table-column label="头像" width="80" align="center">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatarUrl || getDefaultAvatar(row.nickname)" :size="40"
                            class="cursor-pointer" @click="openUserDetail(row)">
                            <el-icon>
                                <User />
                            </el-icon>
                        </el-avatar>
                    </template>
                </el-table-column>

                <!-- 用户信息 -->
                <el-table-column label="用户信息" min-width="180">
                    <template #default="{ row }">
                        <div class="flex flex-col gap-1">
                            <span class="font-medium text-[var(--el-text-color-primary)]">
                                {{ row.nickname || '未设置' }}
                            </span>
                            <span class="text-xs text-[var(--el-text-color-secondary)]">
                                {{ row.studentId || '-' }}
                            </span>
                            <span v-if="row.realName" class="text-xs text-[var(--el-text-color-secondary)]">
                                {{ row.realName }}
                            </span>
                        </div>
                    </template>
                </el-table-column>

                <!-- 联系方式 -->
                <el-table-column prop="phone" label="手机号" width="120" align="center">
                    <template #default="{ row }">
                        <span v-if="row.phone" class="text-sm">{{ maskPhone(row.phone) }}</span>
                        <span v-else class="text-sm text-[var(--el-text-color-secondary)]">-</span>
                    </template>
                </el-table-column>

                <!-- 认证状态 -->
                <el-table-column label="认证" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getVerificationTagType(row.verificationStatus)" size="small" effect="light">
                            {{ getVerificationLabel(row.verificationStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 角色 -->
                <el-table-column label="角色" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                            {{ row.role === 'admin' ? '管理员' : '学生' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 信用分 -->
                <el-table-column prop="creditScore" label="信用分" width="80" align="center">
                    <template #default="{ row }">
                        <span :class="getCreditScoreClass(row.creditScore)">
                            {{ row.creditScore }}
                        </span>
                    </template>
                </el-table-column>

                <!-- 注册时间 -->
                <el-table-column label="注册时间" width="160" align="center">
                    <template #default="{ row }">
                        <span class="text-sm">{{ formatDate(row.createdAt) }}</span>
                    </template>
                </el-table-column>

                <!-- 状态 -->
                <!-- <el-table-column label="是否禁用" width="80" align="center">
                    <template #default="{ row }">
                        <el-switch v-model="row.enabled" :active-value="true" :inactive-value="false"
                            :loading="row.loading" @change="handleStatusChange(row)" />
                    </template>
                </el-table-column> -->

                <!-- 操作 -->
                <el-table-column fixed="right" label="操作" align="center">
                    <template #default="{ row }">
                        <div class="flex flex-col items-center justify-center gap-1">
                            <el-button link type="primary" size="small" @click="openUserDetail(row)">
                                查看
                            </el-button>
                            <span></span>
                            <el-button link type="warning" size="small" @click="openEditModal(row)">
                                编辑
                            </el-button>
                            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
                                <el-button link size="small">更多</el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item command="resetPassword" :disabled="row.role === 'admin'">
                                            🔑 重置密码
                                        </el-dropdown-item>
                                        <!-- <el-dropdown-item command="disable" :disabled="!row.enabled" divided>
                                            🚫 禁用账号
                                        </el-dropdown-item> -->
                                        <el-dropdown-item command="delete" type="danger" divided>
                                            🗑️ 删除用户
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </template>
                </el-table-column>

                <!-- 空状态 -->
                <template #empty>
                    <el-empty description="暂无用户数据" :image-size="100">
                        <el-button type="primary" @click="fetchUserList">刷新试试</el-button>
                    </el-empty>
                </template>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
                :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                @current-change="handlePageChange" @size-change="handlePageSizeChange" class="mt-4" />
        </div>

        <!--  用户详情弹窗 -->
        <el-dialog v-model="showDetailModal" title="👤 用户详情" width="600px" :close-on-click-modal="false"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" append-to-body>
            <div v-if="currentUser" class="space-y-4">
                <!-- 基本信息 -->
                <div class="bg-[var(--el-fill-color-light)] rounded-lg p-4">
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">基本信息</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">用户 ID：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentUser.id }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">学号：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentUser.studentId || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">昵称：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentUser.nickname || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">真实姓名：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ currentUser.realName || '-' }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">手机号：</span>
                            <span class="text-[var(--el-text-color-primary)]">{{ maskPhone(currentUser.phone) || '-'
                                }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">角色：</span>
                            <el-tag size="small" :type="currentUser.role === 'admin' ? 'danger' : 'info'">
                                {{ currentUser.role === 'admin' ? '管理员' : '学生' }}
                            </el-tag>
                        </div>
                    </div>
                </div>

                <!-- 认证信息 -->
                <div class="bg-[var(--el-fill-color-light)] rounded-lg p-4">
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">认证信息</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-[var(--el-text-color-secondary)]">认证状态：</span>
                            <el-tag :type="getVerificationTagType(currentUser.verificationStatus)">
                                {{ getVerificationLabel(currentUser.verificationStatus) }}
                            </el-tag>
                        </div>
                        <div v-if="currentUser.verificationStatus === 'rejected' && currentUser.rejectedReason">
                            <span class="text-sm text-[var(--el-text-color-secondary)]">拒绝原因：</span>
                            <p class="text-sm text-red-500 mt-1">{{ currentUser.rejectedReason }}</p>
                        </div>
                        <div v-if="currentUser.studentCardUrl">
                            <span class="text-sm text-[var(--el-text-color-secondary)]">学生证：</span>
                            <el-image :src="currentUser.studentCardUrl" class="w-32 h-20 mt-2 rounded-lg cursor-pointer"
                                fit="cover" :preview-src-list="[currentUser.studentCardUrl]" />
                        </div>
                    </div>
                </div>

                <!-- 账号信息 -->
                <div class="bg-[var(--el-fill-color-light)] rounded-lg p-4">
                    <h3 class="font-semibold text-[var(--el-text-color-primary)] mb-3">账号信息</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">信用分：</span>
                            <span :class="getCreditScoreClass(currentUser.creditScore)">
                                {{ currentUser.creditScore }}
                            </span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">账号状态：</span>
                            <el-tag :type="currentUser.enabled ? 'success' : 'danger'" size="small">
                                {{ currentUser.enabled ? '正常' : '禁用' }}
                            </el-tag>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">注册时间：</span>
                            <span>{{ formatDate(currentUser.createdAt) }}</span>
                        </div>
                        <div>
                            <span class="text-[var(--el-text-color-secondary)]">最后登录：</span>
                            <span>{{ formatDate(currentUser.lastLoginAt) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="showDetailModal = false">关闭</el-button>
                    <el-button type="primary" @click="openEditModal(currentUser); showDetailModal = false">
                        编辑信息
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!--  编辑用户弹窗 -->
        <el-dialog v-model="showEditModal" :title="isCreateMode ? '➕ 新增用户' : '✏️ 编辑用户'" :close-on-click-modal="false"
            class="w-90% md:w-60%  mx-auto bg-[--card] rounded-2xl shadow-2xl" append-to-body>
            <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top" class="space-y-4">
                <!-- 学号 -->
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="editForm.studentId" placeholder="请输入 10-13 位学号" :disabled="!isCreateMode"
                        maxlength="13" />
                </el-form-item>

                <!-- 密码（仅创建时） -->
                <el-form-item v-if="isCreateMode" label="初始密码" prop="password">
                    <el-input v-model="editForm.password" type="password" placeholder="至少 7 位字符" show-password />
                    <!-- <p class="text-xs text-[var(--el-text-color-secondary)] mt-1">
                        用户首次登录需修改密码
                    </p> -->
                </el-form-item>

                <!-- 昵称 -->
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="editForm.nickname" placeholder="请输入用户昵称" maxlength="20" />
                </el-form-item>

                <!-- 真实姓名 -->
                <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="editForm.realName" placeholder="请输入真实姓名" maxlength="20" />
                </el-form-item>

                <!-- 手机号 -->
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="editForm.phone" placeholder="请输入 11 位手机号" maxlength="11" />
                </el-form-item>

                <!-- 角色 -->
                <el-form-item label="角色" prop="role">
                    <el-radio-group v-model="editForm.role">
                        <el-radio value="student">👨‍🎓 学生</el-radio>
                        <el-radio value="admin">👮 管理员</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 信用分 -->
                <el-form-item label="信用分" prop="creditScore">
                    <el-input-number v-model="editForm.creditScore" :min="0" :max="100" :step="10" class="w-full" />
                </el-form-item>

                <!-- 账号状态 -->
                <el-form-item label="账号状态" prop="enabled">
                    <el-switch v-model="editForm.enabled" :active-value="true" :inactive-value="false" active-text="正常"
                        inactive-text="禁用" />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="showEditModal = false">取消</el-button>
                    <el-button type="primary" :loading="submitting" @click="handleSubmit">
                        {{ submitting ? '提交中...' : '确认提交' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!--  重置密码弹窗 -->
        <el-dialog v-model="showResetModal" title="🔑 重置密码" width="400px" :close-on-click-modal="false"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" append-to-body>
            <el-alert title="重置后用户需使用新密码登录，首次登录需修改密码" type="warning" :closable="false" class="mb-4" />
            <el-form label-position="top">
                <el-form-item label="新密码" required>
                    <el-input v-model="resetPassword" type="password" placeholder="至少 7 位字符" show-password
                        maxlength="20" />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="showResetModal = false">取消</el-button>
                    <el-button type="primary" :loading="submitting"
                        :disabled="!resetPassword || resetPassword.length < 6" @click="handleResetPassword">
                        {{ submitting ? '重置中...' : '确认重置' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { User, Search } from '@element-plus/icons-vue'
import adminUserApi from '@/api/admin/user'
import { modalBox } from "@/components/messageBox/modalBox";

//  状态
const loading = ref(false)
const submitting = ref(false)
// const selectedRows = ref<any[]>([])
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showResetModal = ref(false)
const isCreateMode = ref(false)
const currentUser = ref<any>(null)
const editFormRef = ref<FormInstance>()

//  筛选条件
const filters = reactive({
    studentId: '',
    keyword: '',
    verificationStatus: '',
    role: ''
})

//  分页
const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

//  用户列表
const userList = ref<any[]>([])

//  编辑表单
const editForm = reactive({
    id: undefined as number | undefined,
    studentId: '',
    password: '',
    nickname: '',
    realName: '',
    phone: '',
    role: 'student' as 'student' | 'admin',
    creditScore: 100,
    enabled: true
})

//  表单校验规则
const editRules: FormRules = {
    studentId: [
        { required: true, message: '请输入学号', trigger: 'blur' },
        { pattern: /^\d{10,13}$/, message: '学号应为 10-13 位数字', trigger: 'blur' }
    ],
    password: [

    ], // 动态设置
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度 2-20 位', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ]
}

//  重置密码
const resetPassword = ref('')
const resetTargetId = ref<number | undefined>()

//  获取用户列表
const fetchUserList = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            ...filters
        }

        const res: any = await adminUserApi.getUserList(params)
        if (res.code === 200 && res.data) {
            userList.value = res.data.list || []
            pagination.total = res.data.pagination?.total || 0
        }

    } catch (error) {
        console.error('❌ 获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
    } finally {
        loading.value = false
    }
}

//  搜索
const handleSearch = () => {
    pagination.page = 1
    fetchUserList()
}

//  重置筛选
const handleReset = () => {
    Object.assign(filters, {
        studentId: '',
        keyword: '',
        verificationStatus: '',
        role: ''
    })
    pagination.page = 1
    fetchUserList()
}

//  分页变化
const handlePageChange = (page: number) => {
    pagination.page = page
    fetchUserList()
}

const handlePageSizeChange = (limit: number) => {
    pagination.limit = limit
    pagination.page = 1
    fetchUserList()
}

//  多选
// const handleSelectionChange = (rows: any[]) => {
//     selectedRows.value = rows
// }

// //  批量禁用
// const handleBatchDisable = async () => {
//     if (selectedRows.value.length === 0) return

//     try {
//         await ElMessageBox.confirm(
//             `确定要禁用选中的 ${selectedRows.value.length} 个账号吗？`,
//             '批量禁用',
//             { type: 'warning' }
//         )

//         const ids = selectedRows.value.map((r: any) => r.id)
//         adminUserApi.batchUpdateStatus(ids, false).then((res: any) => {
//             if (res.code === 200) {
//                 ElMessage.success('✅ 批量禁用成功')
//                 selectedRows.value = []
//                 fetchUserList()
//             }
//         })


//     } catch (error: any) {
//         if (error !== 'cancel') {
//             ElMessage.error(error?.response?.data?.msg || '批量禁用失败')
//         }
//     }
// }

// //  批量启用
// const handleBatchEnable = async () => {
//     if (selectedRows.value.length === 0) return

//     try {
//         await ElMessageBox.confirm(
//             `确定要启用选中的 ${selectedRows.value.length} 个账号吗？`,
//             '批量启用',
//             { type: 'success' }
//         )

//         const ids = selectedRows.value.map((r: any) => r.id)
//         adminUserApi.batchUpdateStatus(ids, true).then((res: any) => {
//             if (res.code === 200) {
//                 ElMessage.success('✅ 批量启用成功')
//                 selectedRows.value = []
//                 fetchUserList()
//             }
//         })


//     } catch (error: any) {
//         if (error !== 'cancel') {
//             ElMessage.error(error?.response?.data?.msg || '批量启用失败')
//         }
//     }
// }

//  单个状态切换
// const handleStatusChange = async (row: any) => {
//     row.loading = true
//     try {
//         adminUserApi.updateUserStatus(row.id, row.enabled).then((res: any) => {
//             if (res.code !== 200) {
//                 row.enabled = !row.enabled
//                 ElMessage.error('状态更新失败')
//             }
//         })


//     } catch (error) {
//         row.enabled = !row.enabled
//         ElMessage.error('状态更新失败')
//     } finally {
//         row.loading = false
//     }
// }

//  更多操作
const handleCommand = async (command: string, row: any) => {
    switch (command) {
        case 'resetPassword':
            resetTargetId.value = row.id
            resetPassword.value = ''
            showResetModal.value = true
            break

        case 'disable':
            try {
                await ElMessageBox.confirm('确定要禁用该账号吗？', '禁用账号', { type: 'warning' })
                const res: any = await adminUserApi.updateUserStatus(row.id, false)
                if (res.code === 200) {
                    ElMessage.success('✅ 账号已禁用')
                    row.enabled = false
                }

            } catch (error: any) {
                if (error !== 'cancel') {
                    ElMessage.error(error?.response?.data?.msg || '禁用失败')
                }
            }
            break

        case 'delete':
            try {
                await modalBox({
                    type: 'info',
                    title: '删除用户',
                    message: '删除后无法恢复，确定要删除该用户吗？'
                })

                const res: any = await adminUserApi.deleteUser(row.id)
                if (res.code === 200) {
                    ElMessage.success('✅ 用户已删除')
                    fetchUserList()
                }

            } catch (error: any) {
                if (error !== 'cancel') {
                    ElMessage.error(error?.response?.data?.msg || '删除失败')
                }
            }
            break
    }
}

//  打开详情
const openUserDetail = (row: any) => {
    currentUser.value = row
    showDetailModal.value = true
}

//  打开编辑/创建
const openEditModal = (row?: any) => {
    isCreateMode.value = !row
    resetEditForm()

    if (row) {
        Object.assign(editForm, {
            id: row.id,
            studentId: row.studentId,
            nickname: row.nickname,
            realName: row.realName,
            phone: row.phone,
            role: row.role,
            creditScore: row.creditScore,
            enabled: row.enabled
        })
    }

    //  动态设置密码校验规则
    editRules.password = isCreateMode.value
        ? [
            { required: true, message: '请输入密码', trigger: 'blur' },
            {
                pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{7,}$/,
                message: '密码必须包含数字和字母，且长度至少 7 位',
                trigger: 'blur'
            }
        ]
        : []

    showEditModal.value = true
}

//  打开创建
const openCreateModal = () => {
    openEditModal()
}

//  重置编辑表单
const resetEditForm = () => {
    Object.assign(editForm, {
        id: undefined,
        studentId: '',
        password: '',
        nickname: '',
        realName: '',
        phone: '',
        role: 'student',
        creditScore: 100,
        enabled: true
    })
    editFormRef.value?.clearValidate()
}

//  提交编辑/创建
const handleSubmit = async () => {
    if (!editFormRef.value) return

    try {
        await editFormRef.value.validate()
        submitting.value = true

        //  修复：用解构分离 password，保持类型正确
        const { password, ...submitData } = editForm

        //  创建时包含密码，编辑时排除密码
        const res = isCreateMode.value
            ? await adminUserApi.createUser({
                studentId: submitData.studentId,
                nickname: submitData.nickname,
                role: submitData.role,
                realName: submitData.realName,
                phone: submitData.phone,
                creditScore: submitData.creditScore,
                enabled: submitData.enabled,
                password: password || undefined  //  空密码转为 undefined
            })
            : await adminUserApi.updateUser(editForm.id!, {
                nickname: submitData.nickname,
                realName: submitData.realName,
                phone: submitData.phone,
                role: submitData.role,
                creditScore: submitData.creditScore,
                enabled: submitData.enabled
                //  编辑时不包含 password
            })

        if ((res as any).code === 200) {
            ElMessage.success(isCreateMode.value ? '✅ 用户创建成功' : '✅ 用户信息已更新')
            showEditModal.value = false
            fetchUserList()
        }
    } catch (error: any) {
        console.error('❌ 提交失败:', error)
        ElMessage.error(error?.response?.data?.msg || '提交失败')
    } finally {
        submitting.value = false
    }
}

//  重置密码
const handleResetPassword = async () => {
    if (!resetTargetId.value || resetPassword.value.length < 7) {
        ElMessage.warning('请输入有效的新密码')
        return
    }

    try {
        submitting.value = true
        const res: any = await adminUserApi.resetPassword(resetTargetId.value, resetPassword.value)
        if (res.code === 200) {
            ElMessage.success('✅ 密码重置成功')
            showResetModal.value = false
        }


    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || '重置失败')
    } finally {
        submitting.value = false
    }
}

//  辅助函数
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

const maskPhone = (phone: string): string => {
    if (!phone || phone.length !== 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getDefaultAvatar = (nickname?: string): string => {
    const name = nickname || '用户'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

const getVerificationTagType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, any> = {
        approved: 'success',
        pending: 'warning',
        rejected: 'danger',
        unsubmitted: 'info'
    }
    return map[status] || 'info'
}

const getVerificationLabel = (status: string): string => {
    const map: Record<string, string> = {
        approved: '✅ 已认证',
        pending: '⏳ 审核中',
        rejected: '❌ 已拒绝',
        unsubmitted: '⚪ 未提交'
    }
    return map[status] || '未知'
}

const getCreditScoreClass = (score: number): string => {
    if (score >= 80) return 'text-green-600 font-medium'
    if (score >= 60) return 'text-yellow-600 font-medium'
    return 'text-red-600 font-medium'
}

const darkHeaderClass = (): string => {
    return 'dark:bg-[var(--el-fill-color-dark)] dark:text-[var(--el-text-color-primary)]'
}

//  初始化
onMounted(() => {
    fetchUserList()
})
</script>

<style scoped></style>
