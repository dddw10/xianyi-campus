<!-- src/views/admin/home/poster-management/Index.vue -->
<template>
    <div class="p-4 space-y-4">

        <!-- 🔹 页面头部 -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-[var(--el-text-color-primary)]">🖼️ 海报管理</h2>
                <p class="text-sm text-[var(--el-text-color-secondary)] mt-1">共 {{ total }} 张海报</p>
            </div>
            <el-button type="primary" @click="openModal()">➕ 新增</el-button>
        </div>

        <!-- 🔹 海报列表 -->
        <el-table v-loading="loading" :data="list" stripe class="w-full">
            <el-table-column prop="id" label="ID" width="60" align="center" />

            <el-table-column label="预览" width="100" align="center">
                <template #default="{ row }">
                    <el-image :src="getImageUrl(row.imageUrl)" class="w-16 h-10 rounded cursor-pointer" fit="cover"
                        :preview-src-list="[getImageUrl(row.imageUrl)]" @error="handleImageError">
                        <template #error>
                            <div
                                class="w-16 h-10 bg-[var(--el-fill-color-light)] rounded flex items-center justify-center">
                                <el-icon class="text-[var(--el-text-color-secondary)]">
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                </template>
            </el-table-column>

            <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />

            <el-table-column label="跳转链接" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                    <el-link v-if="row.linkUrl" :href="row.linkUrl" target="_blank" type="primary"
                        class="truncate block">
                        {{ row.linkUrl }}
                    </el-link>
                    <span v-else class="text-[var(--el-text-color-secondary)]">-</span>
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
                <el-empty description="暂无海报数据" :image-size="100">
                    <el-button type="primary" @click="fetchList">刷新试试</el-button>
                </el-empty>
            </template>
        </el-table>

        <!-- 🔹 分页 -->
        <el-pagination v-model:current-page="page" v-model:page-size="limit" :total="total"
            :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @current-change="fetchList"
            @size-change="handleSizeChange" class="flex justify-end" />

        <!-- 🔹 新增/编辑弹窗 -->
        <el-dialog v-model="showModal" :title="isEdit ? '✏️ 编辑海报' : '➕ 新增海报'"
            class="w-90% md:w-60%  mx-auto bg-[--bg-elevated] rounded-2xl shadow-2xl" :close-on-click-modal="false"
            :close-on-press-escape="false" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="space-y-3">

                <!-- 标题 -->
                <el-form-item label="海报标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入海报标题" maxlength="50" show-word-limit clearable />
                </el-form-item>

                <!-- 🔥 图片上传 - 关键修复 -->
                <el-form-item label="海报图片" prop="imageUrl">
                    <!-- 🔥 上传组件用数组，v-model 绑定 form.imageUrl（数组） -->
                    <OssUploader v-model="form.imageUrl" folder="posters" :limit="1" @success="handleUploadSuccess"
                        :width="120" @error="handleUploadError" />

                    <!-- 🔥 预览：取数组第一项 -->
                    <div v-if="form.imageUrl?.[0]" class="mt-3">
                        <el-image :src="form.imageUrl[0]"
                            class="w-full h-40 rounded-lg border border-[var(--el-border-color)]" fit="cover"
                            :preview-src-list="[form.imageUrl[0]]" @error="handleImageError">
                            <template #error>
                                <div
                                    class="w-full h-40 bg-[var(--el-fill-color-light)] rounded-lg flex items-center justify-center">
                                    <el-icon class="text-[var(--el-text-color-secondary)] text-2xl">
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>
                        <el-button link type="danger" size="small" class="mt-2" @click="handleRemoveImage">
                            🗑️ 移除图片
                        </el-button>
                    </div>
                </el-form-item>

                <!-- 跳转链接 -->
                <el-form-item label="跳转链接（可选）" prop="linkUrl">
                    <el-input v-model="form.linkUrl" placeholder="https://... 或 /products" maxlength="200" clearable />
                    <p class="text-xs text-[var(--el-text-color-secondary)] mt-1">
                        留空则点击海报不跳转
                    </p>
                </el-form-item>

                <!-- 排序权重 -->
                <el-form-item label="排序权重" prop="sortOrder">
                    <el-input-number v-model="form.sortOrder" :min="0" :max="9999" :step="10" class="w-full" />
                </el-form-item>

                <!-- 启用状态 -->
                <el-form-item label="启用状态" prop="isEnabled">
                    <el-switch v-model="form.isEnabled" active-text="启用" inactive-text="禁用" />
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
import { Picture } from '@element-plus/icons-vue'
import OssUploader from '@/components/AdvanceImageUpload.vue'
import adminHomeApi from '@/api/admin/home'
import { modalBox } from "@/components/messageBox/modalBox";

// 🔹 状态
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 🔹 分页
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const list = ref<any[]>([])

// 🔥 表单数据 - 🔥 imageUrl 是数组！适配上传组件
const form = reactive({
    id: 0,
    title: '',
    imageUrl: [] as string[],  // 🔥 数组，适配 OssUploader
    linkUrl: '',
    sortOrder: 0,
    isEnabled: true
})

// 🔹 表单校验规则
const rules: FormRules = {
    title: [
        { required: true, message: '请输入海报标题', trigger: 'blur' },
        { min: 2, max: 50, message: '标题长度 2-50 位', trigger: 'blur' }
    ],
    imageUrl: [
        {
            required: true,
            message: '请上传海报图片',
            trigger: 'change',
            // 🔥 自定义校验：检查数组是否有值
            validator: (_rule: any, value: string[], callback: (error?: Error) => void) => {
                if (!value || !Array.isArray(value) || value.length === 0 || !value[0]) {
                    callback(new Error('请上传海报图片'))
                } else {
                    callback()
                }
            }
        }
    ],
    sortOrder: [
        { type: 'number', message: '排序必须为数字', trigger: 'blur' }
    ]
}

// 🔥 辅助函数：统一处理 imageUrl（字符串或数组）→ 返回字符串
const getImageUrl = (value: string | string[] | null | undefined): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (Array.isArray(value) && value[0]) return value[0]
    return ''
}

// 🔹 获取海报列表
const fetchList = async () => {
    loading.value = true
    try {
        const res = await adminHomeApi.getPosters({ page: page.value, limit: limit.value })
        const data = (res as any).code === 200 ? res.data : res

        if (data?.list) {
            list.value = data.list.map((item: any) => ({
                ...item,
                // 🔥 后端返回字符串，前端直接使用（列表显示不需要数组）
                imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
                isEnabled: item.isEnabled === 1 || item.isEnabled === true,
                switchLoading: false
            }))
            total.value = data.pagination?.total || 0
        }
    } catch (error: any) {
        console.error('❌ 获取海报列表失败:', error)
        ElMessage.error(error?.response?.data?.msg || '获取列表失败')
    } finally {
        loading.value = false
    }
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
        // 🔥 编辑模式：后端返回字符串 → 转为数组供上传组件使用
        const imageUrlStr = typeof row.imageUrl === 'string' ? row.imageUrl : ''
        Object.assign(form, {
            id: row.id,
            title: row.title || '',
            imageUrl: imageUrlStr ? [imageUrlStr] : [],  // 🔥 字符串 → 数组
            linkUrl: row.linkUrl || '',
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
        title: '',
        imageUrl: [],  // 🔥 重置为空数组
        linkUrl: '',
        sortOrder: 0,
        isEnabled: true
    })
    formRef.value?.clearValidate()
}

// 🔹 移除图片
const handleRemoveImage = () => {
    form.imageUrl = []
    // 🔥 移除后重新校验
    setTimeout(() => {
        formRef.value?.validateField('imageUrl').catch(() => { })
    }, 0)
}

// 🔹 上传成功回调 - 🔥 上传组件返回数组，直接使用
const handleUploadSuccess = (urls: string | string[]) => {
    // 🔥 兼容：可能是字符串或数组
    if (typeof urls === 'string') {
        form.imageUrl = [urls]
    } else if (Array.isArray(urls)) {
        form.imageUrl = urls
    } else {
        form.imageUrl = []
    }

    // 🔥 手动触发表单校验
    setTimeout(() => {
        formRef.value?.validateField('imageUrl').catch(() => { })
    }, 0)

    ElMessage.success('✅ 图片上传成功')
}

// 🔹 上传失败回调
const handleUploadError = (error: any) => {
    console.error('❌ 图片上传失败:', error)
    ElMessage.error(error?.message || '图片上传失败，请重试')
}

// 🔹 图片加载错误
const handleImageError = () => { }

// 🔹 提交表单 - 🔥 关键：数组转字符串
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()

        if (!form.title?.trim()) {
            return ElMessage.warning('请输入海报标题')
        }
        // 🔥 校验图片：数组第一项必须有值
        if (!form.imageUrl?.[0]?.trim()) {
            return ElMessage.warning('请上传海报图片')
        }

        submitting.value = true

        // 🔥 构建提交数据 - 🔥 数组 [url] → 取 [0] 转字符串
        const submitData = {
            title: form.title.trim(),
            imageUrl: form.imageUrl[0],  // 🔥 关键：取数组第一项作为字符串
            linkUrl: form.linkUrl?.trim() || undefined,
            sortOrder: form.sortOrder || 0,
            isEnabled: form.isEnabled
        }

        const res = isEdit.value
            ? await adminHomeApi.updatePoster(form.id, submitData)
            : await adminHomeApi.createPoster(submitData)

        const code = (res as any).code
        if (code === 200 || code === 201) {
            ElMessage.success(isEdit.value ? '✅ 海报已更新' : '✅ 海报已创建')
            showModal.value = false
            fetchList()
        } else {
            const msg = (res as any).msg || '操作失败'
            ElMessage.error(msg)
        }
    } catch (error: any) {
        console.error('❌ 提交失败:', error)
        if (error?.response?.data?.msg) {
            ElMessage.error(error.response.data.msg)
        } else if (error?.message && !error?.errors) {
            ElMessage.error(error.message)
        }
    } finally {
        submitting.value = false
    }
}

// 🔹 状态切换
const handleStatusChange = async (row: any) => {
    row.switchLoading = true
    try {
        const res = await adminHomeApi.updatePoster(row.id, { isEnabled: row.isEnabled })
        const code = (res as any).code
        if (code !== 200) {
            row.isEnabled = !row.isEnabled
            ElMessage.error((res as any).msg || '状态更新失败')
        }
    } catch (error: any) {
        row.isEnabled = !row.isEnabled
        ElMessage.error(error?.response?.data?.msg || '状态更新失败')
    } finally {
        row.switchLoading = false
    }
}

// 🔹 删除海报
const handleDelete = async (row: any) => {
    try {
        modalBox({
            type: 'error',
            title: '删除确认',
            message: `确定要删除海报「${row.title}」吗？`
        }).then(async () => {
            const res = await adminHomeApi.deletePoster(row.id)
            const code = (res as any).code

            if (code === 200) {
                ElMessage.success('✅ 海报已删除')
                if (list.value.length === 1 && page.value > 1) page.value--
                fetchList()
            } else {
                ElMessage.error((res as any).msg || '删除失败')
            }
        })



    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error?.response?.data?.msg || '删除失败')
        }
    }
}

// 🔹 格式化日期
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

// 🔹 初始化
onMounted(() => { fetchList() })
</script>

<style scoped></style>