<!-- src/views/admin/category/CategoryModal.vue -->
<template>
    <el-dialog v-model="categoryVisible" title="🗂️ 分类管理" :close-on-click-modal="false" width="900px"
        class="category-dialog w-90% md:w-60%" @closed="handleDialogClosed">
        <!-- 🔹 顶部搜索栏 -->
        <div class="filter-bar mb-4">
            <el-form :inline="true" :model="filters" class="demo-form-inline">
                <el-row :gutter="12">
                    <el-col :xs="24" :sm="12" :md="12" :lg="10">
                        <el-form-item label="关键词:" class="w-full">
                            <el-input v-model="filters.keyword" placeholder="搜索分类名称/描述" clearable
                                @keyup.enter="handleSearch" />
                        </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="12" :md="12" :lg="6">
                        <el-form-item label="状态:" class="w-full">
                            <el-select v-model="filters.status" placeholder="全部状态" clearable>
                                <el-option label="启用" value="enabled" />
                                <el-option label="禁用" value="disabled" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="12" :md="12" :lg="8">
                        <el-form-item>
                            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
        </div>

        <!-- 🔹 操作按钮 -->
        <div class="mb-4 flex justify-between items-center">
            <el-button type="success" :icon="Plus" @click="handleAdd">
                新增分类
            </el-button>
            <span class="text-sm text-gray-500">
                共 <span class="font-semibold text-blue-600">{{ total }}</span> 条分类
            </span>
        </div>

        <!-- 🔹 分类表格 -->
        <el-table v-loading="loading" :data="categoryList" border stripe class="category-table"
            :header-cell-style="{ background: '#f5f7fa', fontWeight: '600' }" max-width="100%">
            <!-- 序号 -->
            <el-table-column type="index" label="序号" width="70" align="center" />

            <!-- 分类名称 + 图标 -->
            <el-table-column label="分类" min-width="200">
                <template #default="{ row }">
                    <div class="flex items-center gap-3">
                        <!-- 分类图标 -->
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                       flex items-center justify-center text-white text-lg shadow-sm">
                            {{ row.icon || '📦' }}
                        </div>
                        <!-- 分类信息 -->
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-800">{{ row.name }}</span>
                            <span class="text-xs text-gray-500 line-clamp-1">{{ row.description || '无描述' }}</span>
                        </div>
                    </div>
                </template>
            </el-table-column>

            <!-- 排序 -->
            <el-table-column label="排序" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.sort >= 10 ? 'success' : 'info'" size="small">
                        {{ row.sort }}
                    </el-tag>
                </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.status" :active-value="'enabled'" :inactive-value="'disabled'"
                        :loading="statusLoadingMap[row.id]" @change="handleStatusChange(row)" />
                </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column label="创建时间" width="160" align="center">
                <template #default="{ row }">
                    <span class="text-sm text-gray-600">{{ formatDate(row.created_at) }}</span>
                </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" :width="width > 768 ? 200 : 80" fixed="right" align="center">
                <template #default="{ row }">
                    <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
                        编辑
                    </el-button>
                    <el-button link :type="row.status === 'enabled' ? 'danger' : 'success'" size="small"
                        :icon="row.status === 'enabled' ? Delete : Check" @click="handleToggleStatus(row)">
                        {{ row.status === 'enabled' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>

            <!-- 空状态 -->
            <template #empty>
                <el-empty description="暂无分类数据" :image-size="80">
                    <el-button type="primary" @click="handleAdd">新增分类</el-button>
                </el-empty>
            </template>
        </el-table>

        <!-- 🔹 分页 -->
        <div class="mt-4 flex justify-end">
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :total="total"
                :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>

        <!-- 🔹 新增/编辑表单对话框 -->
        <el-dialog v-model="formVisible" :title="isEdit ? '✏️ 编辑分类' : '➕ 新增分类'" width="500px"
            :close-on-click-modal="false" append-to-body>
            <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="mt-2">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入分类名称（2-20 字符）" maxlength="20" show-word-limit />
                </el-form-item>

                <el-form-item label="分类图标" prop="icon">
                    <el-input v-model="formData.icon" placeholder="输入 Emoji 或图标名称，如：📱、iPhone、Book" maxlength="50">
                        <template #prefix>
                            <span class="text-xl">{{ formData.icon || '📦' }}</span>
                        </template>
                    </el-input>
                    <div class="text-xs text-gray-500 mt-1">
                        推荐使用 Emoji：📱 📚 🏠 👕 🎁 🎮 ⚽ 🎵
                    </div>
                </el-form-item>

                <el-form-item label="分类描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分类描述（可选）"
                        maxlength="200" show-word-limit />
                </el-form-item>

                <el-form-item label="排序权重" prop="sort">
                    <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right"
                        class="w-32" />
                    <span class="text-xs text-gray-500 ml-2">值越大排序越靠前</span>
                </el-form-item>

                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="formData.status">
                        <el-radio value="enabled">✅ 启用</el-radio>
                        <el-radio value="disabled">⏸️ 禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    {{ submitting ? '提交中...' : '确认' }}
                </el-button>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Check } from '@element-plus/icons-vue'
import adminCategoryApi, { type Category } from '@/api/admin/category'
import { useWindowSize } from "@vueuse/core";

// 🔹 弹窗控制
const categoryVisible = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const submitting = ref(false)

// 宽度检测
const { width } = useWindowSize()

// 🔹 表单引用
const formRef = ref<FormInstance>()

// 🔹 筛选条件
const filters = reactive({
    keyword: '',
    status: '' as 'enabled' | 'disabled' | '',
    page: 1,
    limit: 20
})

// 🔹 分页
const pagination = reactive({
    page: 1,
    limit: 20
})

// 🔹 数据
const categoryList = ref<Category[]>([])
const total = ref(0)

// 临时存储每行的 loading 状态（用于 switch / 操作按钮）
const statusLoadingMap = reactive<Record<number, boolean>>({})

// 🔹 表单数据
const formData = reactive<Category>({
    id: 0,
    name: '',
    description: '',
    icon: '',
    sort: 0,
    status: 'enabled',
    created_at: '',
    updated_at: ''
})

// 🔹 表单验证规则
const formRules: Record<string, any> = {
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '分类名称长度 2-20 个字符', trigger: 'blur' }
    ],
    icon: [
        { max: 50, message: '图标名称不能超过 50 个字符', trigger: 'blur' }
    ],
    description: [
        { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
    ],
    sort: [
        { type: 'number', min: 0, max: 999, message: '排序值 0-999', trigger: 'change' }
    ]
}

// 🔹 格式化日期
const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return dateString.slice(0, 10)
}

// 🔹 加载分类列表
const loadCategories = async () => {
    loading.value = true
    try {
        await adminCategoryApi.getCategoriesList({
            page: filters.page,
            limit: filters.limit,
            keyword: filters.keyword || undefined,
            status: filters.status || undefined
        }).then((res: any) => {
            if (res?.code === 200) {
                categoryList.value = res.data.list
                total.value = res.data.pagination.total
                pagination.page = res.data.pagination.page
                pagination.limit = res.data.pagination.limit
            }
        })
    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || '加载失败')
    } finally {
        loading.value = false
    }
}

// 🔹 搜索
const handleSearch = () => {
    filters.page = 1
    loadCategories()
}

// 🔹 重置
const handleReset = () => {
    filters.keyword = ''
    filters.status = ''
    filters.page = 1
    loadCategories()
}

// 🔹 分页变化
const handleSizeChange = (val: number) => {
    filters.limit = val
    filters.page = 1
    loadCategories()
}

const handleCurrentChange = (val: number) => {
    filters.page = val
    loadCategories()
}

// 🔹 新增分类
const handleAdd = () => {
    isEdit.value = false
    resetForm()
    formVisible.value = true
}

// 🔹 编辑分类
const handleEdit = (row: Category) => {
    isEdit.value = true
    // 复制数据到表单（避免直接引用）
    Object.assign(formData, row)
    formVisible.value = true
}

// 🔹 重置表单
const resetForm = () => {
    formData.id = 0
    formData.name = ''
    formData.description = ''
    formData.icon = ''
    formData.sort = 0
    formData.status = 'enabled'
    formRef.value?.clearValidate()
}

// 🔹 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
    } catch {
        return
    }

    submitting.value = true

    try {
        if (isEdit.value) {
            // 更新
            await adminCategoryApi.updateCategory(formData.id, {
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                sort: formData.sort,
                status: formData.status
            })
            ElMessage.success('分类更新成功')
        } else {
            // 创建
            await adminCategoryApi.createCategory({
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                sort: formData.sort,
                status: formData.status
            })
            ElMessage.success('分类创建成功')
        }

        formVisible.value = false
        loadCategories()
    } catch (error: any) {
        ElMessage.error(error?.response?.data?.msg || (isEdit.value ? '更新失败' : '创建失败'))
    } finally {
        submitting.value = false
    }
}

// 🔹 切换状态（启用/禁用）
const handleStatusChange = async (row: Category) => {
    try {
        statusLoadingMap[row.id] = true  // 添加临时 loading 状态
        await adminCategoryApi.updateCategory(row.id, {
            status: row.status
        })
        ElMessage.success(`分类已${row.status === 'enabled' ? '启用' : '禁用'}`)
    } catch (error: any) {
        // 回滚状态
        row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
        ElMessage.error(error?.response?.data?.msg || '操作失败')
    } finally {
        delete statusLoadingMap[row.id]  // 移除临时 loading 状态
    }
}

// 🔹 快捷切换状态按钮
const handleToggleStatus = (row: Category) => {
    const action = row.status === 'enabled' ? '禁用' : '启用'
    ElMessageBox.confirm(`确定要${action}「${row.name}」分类吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: row.status === 'enabled' ? 'warning' : 'success'
    })
        .then(() => {
            row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
            handleStatusChange(row)
        })
        .catch(() => { })
}

// 🔹 删除分类
const handleDelete = (row: Category) => {
    ElMessageBox.confirm(`确定要删除「${row.name}」分类吗？\n\n⚠️ 如果该分类下有商品，将无法删除。`, '确认删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
    })
        .then(async () => {
            try {
                await adminCategoryApi.deleteCategory(row.id)
                ElMessage.success('分类已删除')
                loadCategories()
            } catch (error: any) {
                // 处理"分类下有商品"的业务错误
                if (error?.response?.data?.msg?.includes('无法删除')) {
                    ElMessage.warning(error.response.data.msg)
                } else {
                    ElMessage.error(error?.response?.data?.msg || '删除失败')
                }
            }
        })
        .catch(() => { })
}

// 🔹 对话框关闭
const handleDialogClosed = () => {
    // 重置筛选条件（可选）
    // filters.keyword = ''
    // filters.status = ''
}

// 🔹 打开弹窗
const openCategoryModal = () => {
    categoryVisible.value = true
    loadCategories()
}

// 🔹 暴露方法
defineExpose({ openCategoryModal })

// 🔹 初始化
onMounted(() => {
    // 如果需要自动加载，取消下面注释
    // loadCategories()
})
</script>

<style scoped>
/* 🔹 对话框样式 */
.category-dialog {
    :deep(.el-dialog__header) {
        @apply py-4 px-6 border-b border-gray-100;

        .el-dialog__title {
            @apply text-lg font-semibold;
        }
    }

    :deep(.el-dialog__body) {
        @apply py-4 px-6;
    }

    :deep(.el-dialog__footer) {
        @apply py-4 px-6 border-t border-gray-100;
    }
}

/* 🔹 表格样式 */
.category-table {

    :deep(.el-table__row) {
        @apply transition-colors duration-150;

        &:hover {
            @apply bg-blue-50/30;
        }
    }

    :deep(.el-table__cell) {
        @apply py-3;
    }
}

/* 🔹 图标渐变背景 */
:deep(.bg-gradient-to-br) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 🔹 响应式适配 */
@media (max-width: 768px) {
    .category-dialog {
        :deep(.el-dialog) {
            @apply w-[95vw] mx-2;
        }
    }
}
</style>