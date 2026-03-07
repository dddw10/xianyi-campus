<!-- src/views/admin/product/review.vue -->
<template>
    <div class="flex flex-col p-4 sm:p-6 space-y-6 h-full">

        <!-- 🔹 页面头部 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-$el-text-color-primary">商品审核</h2>
                <p class="text-sm text-$el-text-color-secondary mt-1">
                    待审核商品：{{ total }} 件 · 请及时处理
                </p>
            </div>

            <el-button @click="openTypeListModal" type="warning">分类列表</el-button>
        </div>

        <!-- 搜索表头 -->
        <div class="w-full">
            <div inline class="flex flex-col ">
                <el-row :gutter="20">
                    <el-col :xs="24" :md="12" :lg="4">
                        <div class="w-full mb-4">
                            <el-select v-model="pagination.category" clearable placeholder="商品类型">
                                <el-option v-for="item in typeOptions" :key="item.id" :label="item.icon + item.name"
                                    :value="item.name">
                                </el-option>
                            </el-select>
                        </div>
                    </el-col>
                    <el-col :xs="0" :md="8" :lg="16"></el-col>
                    <el-col :xs="24" :md="12" :lg="4">
                        <div class="w-full">
                            <el-row class="w-full">
                                <!-- 🔹 搜索按钮（主按钮 + 图标） -->
                                <el-col :span="11">
                                    <el-button type="primary" class="w-full" @click="LoadPendingProducts">
                                        搜索
                                    </el-button>
                                </el-col>

                                <el-col :span="2"></el-col>

                                <!-- 🔹 重置按钮（次要按钮 + 图标） -->
                                <el-col :span="11">
                                    <el-button class="w-full" @click="handleCancel">
                                        重置
                                    </el-button>
                                </el-col>
                            </el-row>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 表格 -->
        <div class="flex-1  flex flex-col">
            <el-table :data="tableData.list" stripe v-loading="dataLoading" class="flex-1">
                <el-table-column prop="title" label="商品名"></el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column prop="images" label="照片">
                    <template #default="{ row }">
                        <div class="flex items-center gap-2">
                            <el-image :src="row.images[0]" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2"
                                :preview-src-list="row.images" show-progress preview-teleported></el-image>
                            <el-tag v-if="row.images.length > 1" type="danger" size="small" class="ml-2">
                                {{ row.images.length }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="category" label="分类"></el-table-column>
                <el-table-column prop="created_at" label="创建日期">
                    <template #default="{ row }">
                        {{ row.created_at.slice(0, 10) }}
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handlePass(row.id)">
                            通过
                        </el-button>
                        <el-button link type="danger" @click="handleOpenApprovalModal(row.id)">
                            拒绝
                        </el-button>
                    </template>
                </el-table-column>

                <!-- 🔹 空状态 -->
                <template #empty>
                    <el-empty description="暂无待审核商品" :image-size="100">
                        <el-button type="primary" @click="LoadPendingProducts()">刷新试试</el-button>
                    </el-empty>
                </template>
            </el-table>
            <el-pagination v-model:current-page="pagination.page" :total="tableData.pagination.total"
                v-model:page-size="pagination.limit" :page-sizes="[20, 50, 100, 200]"
                layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" class="mt-4" />
        </div>
    </div>

    <!-- 审批拒绝弹窗 -->
    <el-dialog v-model="approvalModal" append-to-body title="📋 审批拒绝" @close="handleCloseApprovalModal"
        :close-on-click-modal="false" width="500px" class="rounded-2xl p-6">
        <!-- 🔹 提示信息 -->
        <el-alert title="拒绝后商品将不会上架，用户会收到通知" type="warning" :closable="false" show-icon class="mb-4" />

        <!-- 🔹 输入方式选择 -->
        <el-form label-position="top">
            <el-form-item label="选择输入方式">
                <el-radio-group v-model="reasonType" @change="rejectionReason = ''" class="w-full">
                    <el-radio value="select" class="radio-option">
                        <el-icon class="mr-1">
                            <List />
                        </el-icon> 快捷回复
                    </el-radio>
                    <el-radio value="input" class="radio-option">
                        <el-icon class="mr-1">
                            <Edit />
                        </el-icon> 手动输入
                    </el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 🔹 快捷回复 -->
            <el-form-item v-show="reasonType === 'select'" label="常用拒绝理由" class="mt-4">
                <el-select v-model="rejectionReason" placeholder="请选择拒绝理由" class="w-full" filterable allow-create
                    default-first-option>
                    <el-option v-for="item in commonReasonsList" :key="item.id" :label="item.reason"
                        :value="item.reason">
                        <span class="option-label">{{ item.reason }}</span>
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- 🔹 手动输入 -->
            <el-form-item v-show="reasonType === 'input'" label="自定义拒绝原因" class="mt-4">
                <el-input v-model="rejectionReason" type="textarea" :rows="4"
                    placeholder="请输入拒绝原因，将反馈给用户（如：图片不清晰、描述不符、违规内容等）" maxlength="200" show-word-limit resize="none"
                    class="reason-textarea" />
            </el-form-item>
        </el-form>

        <!-- 🔹 底部按钮 -->
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCloseApprovalModal" class="w-24">
                    取消
                </el-button>
                <el-button @click="handleError" type="danger" :disabled="!rejectionReason" :loading="submitting"
                    class="w-24">
                    {{ submitting ? '提交中...' : '确认拒绝' }}
                </el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 商品列表弹窗 -->
    <categoryList ref="categoryListRef"></categoryList>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import adminCategoryApi from "@/api/admin/category";
import adminApi from "@/api/admin";
import { ElMessage } from "element-plus";
import { modalBox } from "@/components/messageBox/modalBox";
import categoryList from "./categoryList.vue";

const total = ref(0)
const approvalModal = ref<boolean>(false)
const reasonType = ref<'select' | 'input'>('select')
const submitting = ref(false)
const dataLoading = ref<boolean>(false)
const categoryListRef = ref()

const pagination = reactive({
    page: 1,
    limit: 20,
    category: ''
})

type OptionsType = {
    id: number
    name: string,
    icon: string
}

type tableListType = {
    id: number
    title: string
    description: string
    images: string[]
    review_status: 'pending' | 'approved' | 'rejected' | string
    price: string
    category: string
    status: string
    seller_id: number
    buyer_id: number | null
    image_url: string
    created_at: string
    updated_at: string
}

type tableDataType = {
    list: tableListType[]
    pagination: {
        page: number,
        limit: number,
        total: number,
        pages: number
    }
}

// 类型选择的options
const typeOptions = ref<OptionsType[]>([])
// 表格数据
const tableData = ref<tableDataType>({
    list: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    }
})


// 获取类型选择的options的方法
const getEnabledCategories = () => {
    try {
        adminCategoryApi.getCategoriesEnabled().then((res: any) => {
            if (res.code === 200) {
                typeOptions.value = res.data
            }
        })
    } catch {
        ElMessage.error('获取商品类型失败')
    }
}

// 获取待审核的商品信息
const LoadPendingProducts = () => {
    dataLoading.value = true
    try {
        adminApi.getLoadPendingProducts(pagination).then((res: any) => {
            if (res.code === 200) {
                tableData.value = res.data
                ElMessage.success('获取成功')
            }
        })
    } catch {
        ElMessage.error('获取待审核的商品信息失败')
    } finally {
        dataLoading.value = false
    }
}

// 分页的方法
const handleSizeChange = (val: number) => {
    pagination.limit = val
    LoadPendingProducts()
}

const handleCurrentChange = (val: number) => {
    pagination.page = val
    LoadPendingProducts()
}

// 重置
const handleCancel = () => {
    pagination.category = ''
    pagination.page = 1
    pagination.limit = 20
    nextTick().then(() => {
        LoadPendingProducts()
    })
}

// 审批通过
const handlePass = (productId: number) => {
    modalBox({
        type: 'info',
        title: '提示',
        message: '确认通过审批？'
    }).then(() => {
        adminApi.reviewSingleProduct(productId, 'approve').then((res: any) => {
            if (res.code === 200) {
                ElMessage.success('审批通过')
                init()
            }
        })
    })

}

// 审批拒绝理由
const rejectionReason = ref<string>()

// 审批拒绝的常用理由
const commonReasonsList = [
    { id: 1, reason: '图片不清晰/模糊，请重新上传高清图片' },
    { id: 2, reason: '图片与商品实物不符，请上传真实商品照片' },
    { id: 3, reason: '商品描述过于简单，请补充详细信息' },
    { id: 4, reason: '描述与图片/实物不符，请确保信息真实一致' },
    { id: 5, reason: '价格明显高于/低于市场价值，请合理定价' },
    { id: 6, reason: '商品属于禁售品类，请查看平台规则' },
    { id: 7, reason: '描述包含联系方式/外部链接，请移除后重新提交' },
    { id: 8, reason: '商品已损坏/无法正常使用，请确保功能完好' },
    { id: 9, reason: '卖家未完成实名认证，请先完成认证再发布' },
    { id: 10, reason: '其他原因：请根据审核意见修改后重新提交' }
]

// 商品id
const product_id = ref<number>()

// 打开拒绝弹窗
const handleOpenApprovalModal = (productId: number) => {
    approvalModal.value = true
    rejectionReason.value = ''
    product_id.value = productId
}

// 关闭拒绝弹窗
const handleCloseApprovalModal = () => {
    approvalModal.value = false
    rejectionReason.value = ''
    product_id.value = undefined
}

// 审批不通过
const handleError = () => {
    submitting.value = true
    try {
        if (rejectionReason.value && product_id.value) {
            adminApi.reviewSingleProduct(product_id.value, 'reject', rejectionReason.value)
        } else {
            ElMessage.error('请先选择理由')
        }
    } finally {
        submitting.value = false
        handleCloseApprovalModal()
        init()
    }
}

// 打开商品列表的弹窗
const openTypeListModal = () => {
    categoryListRef.value.openCategoryModal()
}


// 初始化
const init = () => {
    getEnabledCategories()// 获取类型选择的options的方法
    LoadPendingProducts()// 获取待审核的商品信息
}

onMounted(() => {
    init()
})

</script>
<style scoped></style>