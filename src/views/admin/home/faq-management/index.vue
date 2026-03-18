<!-- src/views/admin/home/faq-management/Index.vue -->
<template>
    <div class="p-4 space-y-4">

        <!-- 🔹 页面头部 -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-[var(--el-text-color-primary)]">❓ 常见问题管理</h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">共 {{ total }} 条问题</p>
            </div>
            <el-button type="primary" @click="openModal()">➕ 新增</el-button>
        </div>

        <!-- 🔹 筛选栏（可选扩展） -->
        <div class="flex flex-wrap gap-3">
            <el-select v-model="filters.category" placeholder="分类筛选" clearable class="w-32"
                @change="handleFilterChange">
                <el-option label="全部" value="" />
                <el-option label="🛒 交易" value="trade" />
                <el-option label="👤 账号" value="account" />
                <el-option label="🎓 认证" value="verification" />
                <el-option label="📦 其他" value="other" />
            </el-select>

            <el-select v-model="filters.enabled" placeholder="状态筛选" clearable class="w-24" @change="handleFilterChange">
                <el-option label="全部" value="" />
                <el-option label="✅ 启用" :value="true" />
                <el-option label="❌ 禁用" :value="false" />
            </el-select>

            <el-button @click="fetchList">🔄 刷新</el-button>
        </div>

        <!-- 🔹 常见问题列表 -->
        <el-table v-loading="loading" :data="list" stripe class="w-full" :empty-text="loading ? '' : '暂无常见问题数据'">
            <el-table-column prop="id" label="ID" width="60" align="center" />

            <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />

            <el-table-column label="答案" min-width="250" show-overflow-tooltip>
                <template #default="{ row }">
                    <span class="text-sm text-[var(--el-text-color-secondary)] line-clamp-2">
                        {{ row.answer }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column prop="category" label="分类" width="90" align="center">
                <template #default="{ row }">
                    <el-tag :type="getCategoryTagType(row.category)" size="small" effect="light">
                        {{ getCategoryLabel(row.category) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="sortOrder" label="排序" width="60" align="center" />

            <el-table-column label="状态" width="70" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.isEnabled" :active-value="true" :inactive-value="false"
                        :loading="row.switchLoading" @change="handleStatusChange(row)" active-color="#13ce66"
                        inactive-color="#ccc" />
                </template>
            </el-table-column>

            <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
                <template #default="{ row }">
                    <span class="text-sm text-[var(--el-text-color-secondary)]">
                        {{ formatDate(row.createdAt) }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="140" fixed="right" align="center">
                <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="openModal(row)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty description="暂无常见问题数据" :image-size="100">
                    <el-button type="primary" @click="fetchList">刷新试试</el-button>
                </el-empty>
            </template>
        </el-table>

        <!-- 🔹 分页 -->
        <el-pagination v-model:current-page="page" v-model:page-size="limit" :total="total"
            :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @current-change="fetchList"
            @size-change="handleSizeChange" class="flex justify-end" />

        <!-- 🔹 新增/编辑弹窗 -->
        <el-dialog v-model="showModal" :title="isEdit ? '✏️ 编辑问题' : '➕ 新增问题'" width="560px"
            :close-on-click-modal="false" :close-on-press-escape="false"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" append-to-body
            @closed="handleDialogClosed">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="space-y-3">
                <!-- 问题 -->
                <el-form-item label="问题标题" prop="question">
                    <el-input v-model="form.question" placeholder="请输入问题，如：如何发布商品？" maxlength="100" show-word-limit
                        clearable @input="handleQuestionInput" />
                </el-form-item>

                <!-- 答案 -->
                <el-form-item label="问题答案" prop="answer">
                    <el-input v-model="form.answer" type="textarea" :rows="5" placeholder="请输入详细答案，支持换行" maxlength="500"
                        show-word-limit clearable />
                    <p class="text-xs text-[var(--el-text-color-secondary)] mt-1">
                        答案将直接展示给用户，请确保内容准确、易懂
                    </p>
                </el-form-item>

                <!-- 分类 -->
                <el-form-item label="问题分类" prop="category">
                    <el-select v-model="form.category" class="w-full" placeholder="请选择分类">
                        <el-option label="🛒 交易相关" value="trade" />
                        <el-option label="👤 账号相关" value="account" />
                        <el-option label="🎓 认证相关" value="verification" />
                        <el-option label="📦 其他问题" value="other" />
                    </el-select>
                </el-form-item>

                <!-- 排序权重 -->
                <el-form-item label="排序权重" prop="sortOrder">
                    <el-input-number v-model="form.sortOrder" :min="0" :max="9999" :step="1" class="w-full" />
                    <p class="text-xs text-[var(--el-text-color-secondary)] mt-1">
                        数值越大排序越靠前，默认 0
                    </p>
                </el-form-item>

                <!-- 启用状态 -->
                <el-form-item label="启用状态" prop="isEnabled">
                    <el-switch v-model="form.isEnabled" active-text="启用" inactive-text="禁用" active-color="#13ce66"
                        inactive-color="#ccc" />
                    <p class="text-xs text-[var(--el-text-color-secondary)] mt-1">
                        禁用后该问题将不会在首页展示
                    </p>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="flex justify-end gap-3 pt-4">
                    <el-button @click="showModal = false">取消</el-button>
                    <el-button type="primary" :loading="submitting" @click="handleSubmit">
                        {{ submitting ? '提交中...' : '确认提交' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import adminHomeApi, { type FaqForm } from '@/api/admin/home'

// 🔹 状态
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 🔹 筛选条件
const filters = reactive({
    category: '',
    enabled: undefined as boolean | undefined
})

// 🔹 分页
const page = ref(1)
const limit = ref(20)
const total = ref(0)

// 🔹 数据列表
const list = ref<any[]>([])

// 🔹 表单数据
const form = reactive<FaqForm>({
    id: 0,
    question: '',
    answer: '',
    category: 'other',      // 🔥 默认分类
    sortOrder: 0,           // 🔥 默认排序
    isEnabled: true         // 🔥 默认启用
})

// 🔹 表单校验规则
const rules: FormRules = {
    question: [
        { required: true, message: '请输入问题标题', trigger: 'blur' },
        { min: 5, max: 100, message: '问题长度 5-100 位', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9？?！!，,。.]+$/.source, message: '问题只能包含中文、字母、数字和标点', trigger: 'blur' }
    ],
    answer: [
        { required: true, message: '请输入问题答案', trigger: 'blur' },
        { min: 10, max: 500, message: '答案长度 10-500 位', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择问题分类', trigger: 'change' }
    ],
    sortOrder: [
        { required: true, type: 'number', message: '排序必须为数字', trigger: 'change' },
    ]
}

// 🔹 获取常见问题列表
const fetchList = async () => {
    loading.value = true
    try {
        const params: any = {
            page: page.value,
            limit: limit.value
        }
        // 🔥 添加筛选条件
        if (filters.category) params.category = filters.category
        if (filters.enabled !== undefined) params.enabled = filters.enabled

        const res = await adminHomeApi.getFaqs(params)
        const data = (res as any).code === 200 ? res.data : res

        if (data?.list) {
            list.value = data.list.map((item: any) => ({
                ...item,
                isEnabled: item.isEnabled === 1 || item.isEnabled === true,
                switchLoading: false  // 🔥 添加开关加载状态
            }))
            total.value = data.pagination?.total || 0
        }
    } catch (error: any) {
        console.error('❌ 获取常见问题列表失败:', error)
        ElMessage.error(error?.response?.data?.msg || '获取列表失败')
    } finally {
        loading.value = false
    }
}

// 🔹 筛选条件变化
const handleFilterChange = () => {
    page.value = 1  // 🔥 重置到第一页
    fetchList()
}

// 🔹 分页大小变化
const handleSizeChange = (newLimit: number) => {
    limit.value = newLimit
    page.value = 1
    fetchList()
}

// 🔹 打开弹窗（新增/编辑）
const openModal = (row?: any) => {
    isEdit.value = !!row
    resetForm()

    if (row) {
        // 🔥 编辑模式：填充表单
        Object.assign(form, {
            id: row.id,
            question: row.question || '',
            answer: row.answer || '',
            category: row.category || 'other',
            sortOrder: row.sortOrder || 0,
            isEnabled: row.isEnabled === 1 || row.isEnabled === true
        })
    }

    showModal.value = true
}

// 🔹 重置表单
const resetForm = () => {
    Object.assign(form, {
        id: 0,
        question: '',
        answer: '',
        category: 'other',    // 🔥 重置为默认分类
        sortOrder: 0,         // 🔥 重置为默认排序
        isEnabled: true       // 🔥 重置为默认启用
    })
    formRef.value?.clearValidate()
}

// 🔹 弹窗关闭后的处理 - 🔥 创建成功后的关键逻辑
const handleDialogClosed = () => {
    // 🔥 只在非编辑模式（即新增）且提交成功后执行额外逻辑
    if (!isEdit.value && submitting.value === false) {
        // 🔥 可选：记录创建日志（前端）
        console.log('📝 [FAQ] 新增问题成功:', {
            question: form.question,
            category: form.category,
            time: new Date().toISOString()
        })

        // 🔥 可选：发送通知给其他管理员（需要 WebSocket 或轮询支持）
        // notifyAdmins('新常见问题已创建', form.question)
    }
}

// 🔥 问题输入时的实时处理（可选：自动分类建议）
const handleQuestionInput = (value: string) => {
    // 🔥 简单关键词匹配，自动建议分类
    const keywords: Record<string, string> = {
        '发布': 'trade',
        '交易': 'trade',
        '购买': 'trade',
        '账号': 'account',
        '登录': 'account',
        '密码': 'account',
        '认证': 'verification',
        '学生证': 'verification',
        '审核': 'verification'
    }

    for (const [key, category] of Object.entries(keywords)) {
        if (value.includes(key) && form.category === 'other') {
            form.category = category
            ElMessage.info(`🔍 检测到关键词"${key}"，已自动分类为"${getCategoryLabel(category)}"`)
            break
        }
    }
}

// 🔹 提交表单 - 🔥 完善创建成功后的逻辑
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        // 🔥 1. 表单校验
        await formRef.value.validate()

        // 🔥 2. 二次校验（兜底）
        if (!form.question?.trim()) {
            return ElMessage.warning('请输入问题标题')
        }
        if (!form.answer?.trim()) {
            return ElMessage.warning('请输入问题答案')
        }

        submitting.value = true

        // 🔥 3. 构建提交数据
        const submitData: FaqForm = {
            question: form.question.trim(),
            answer: form.answer.trim(),
            category: form.category,
            sortOrder: form.sortOrder || 0,
            isEnabled: form.isEnabled
        }

        // 🔥 4. 调用 API
        const res = isEdit.value
            ? await adminHomeApi.updateFaq(form.id!, submitData)
            : await adminHomeApi.createFaq(submitData)

        const code = (res as any).code
        if (code === 200 || code === 201) {
            // 🔥 ✅ 创建/更新成功后的完整逻辑

            // 4.1 提示用户
            const successMsg = isEdit.value ? '✅ 问题已更新' : '✅ 问题已创建'
            ElMessage.success(successMsg)

            // 4.2 关闭弹窗
            showModal.value = false

            // 4.3 刷新列表
            fetchList()

            // 4.4 🔥 新增：如果是创建成功，记录操作日志（可对接后端日志接口）
            if (!isEdit.value) {
                logOperation('create_faq', {
                    question: form.question,
                    category: form.category,
                    sortOrder: form.sortOrder
                })
            }

            // 4.5 🔥 新增：如果是编辑成功，可考虑刷新缓存（如果有）
            // if (isEdit.value) {
            //   clearFaqCache(form.id)
            // }

        } else {
            const msg = (res as any).msg || '操作失败'
            ElMessage.error(msg)
        }
    } catch (error: any) {
        console.error('❌ 提交失败:', error)
        // 🔥 表单校验失败时不显示错误提示（Element Plus 已处理）
        if (error?.response?.data?.msg) {
            ElMessage.error(error.response.data.msg)
        } else if (error?.message && !error?.errors) {
            // 🔥 非校验错误才提示
            ElMessage.error(error.message)
        }
    } finally {
        submitting.value = false
    }
}

// 🔥 辅助函数：记录操作日志（可扩展对接后端）
const logOperation = (action: string, data: any) => {
    // 🔸 前端记录（开发调试用）
    console.log(`🔐 [操作日志] ${action}:`, {
        ...data,
        operator: 'admin',  // 🔥 实际应从用户信息获取
        timestamp: new Date().toISOString()
    })

    // 🔸 可选：调用后端日志接口
    // adminApi.logOperation({ action, data }).catch(() => {})
}

// 🔹 状态切换（启用/禁用）
const handleStatusChange = async (row: any) => {
    row.switchLoading = true
    try {
        const res = await adminHomeApi.updateFaq(row.id, {
            isEnabled: row.isEnabled
        })

        const code = (res as any).code
        if (code !== 200) {
            // 🔥 回滚状态
            row.isEnabled = !row.isEnabled
            ElMessage.error((res as any).msg || '状态更新失败')
        } else {
            // 🔥 状态变更成功，可记录日志
            logOperation('toggle_faq_status', {
                id: row.id,
                question: row.question,
                newStatus: row.isEnabled ? 'enabled' : 'disabled'
            })
        }
    } catch (error: any) {
        // 🔥 回滚状态
        row.isEnabled = !row.isEnabled
        ElMessage.error(error?.response?.data?.msg || '状态更新失败')
    } finally {
        row.switchLoading = false
    }
}

// 🔹 删除常见问题
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除问题「${row.question}」吗？删除后无法恢复。`,
            '删除确认',
            {
                type: 'warning',
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                confirmButtonClass: 'el-button--danger'
            }
        )

        const res = await adminHomeApi.deleteFaq(row.id)
        const code = (res as any).code

        if (code === 200) {
            ElMessage.success('✅ 问题已删除')

            // 🔥 删除成功后的额外逻辑
            logOperation('delete_faq', {
                id: row.id,
                question: row.question,
                category: row.category
            })

            // 🔥 如果删除的是当前页最后一项，且不是第一页，则跳转到前一页
            if (list.value.length === 1 && page.value > 1) {
                page.value--
            }
            fetchList()
        } else {
            ElMessage.error((res as any).msg || '删除失败')
        }
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.response?.data?.msg || '删除失败')
        }
    }
}

// 🔹 辅助函数：获取分类标签类型
const getCategoryTagType = (category: string): 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, any> = {
        trade: 'success',
        account: 'info',
        verification: 'warning',
        other: 'danger'
    }
    return map[category] || 'info'
}

// 🔹 辅助函数：获取分类标签文字
const getCategoryLabel = (category: string): string => {
    const map: Record<string, string> = {
        trade: '🛒 交易',
        account: '👤 账号',
        verification: '🎓 认证',
        other: '📦 其他'
    }
    return map[category] || '其他'
}

// 🔹 格式化日期
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 🔹 初始化
onMounted(() => {
    fetchList()
})
</script>

<style scoped></style>