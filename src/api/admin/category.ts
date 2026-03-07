// src/api/admin/category.ts
import request, { type ApiResponse } from '@/utils/request'

// 分类类型定义
export interface Category {
    id: number
    name: string
    description: string
    icon: string
    sort: number
    status: 'enabled' | 'disabled'
    created_at: string
    updated_at: string
}

// 分页响应类型
export interface CategoryPageResponse {
    list: Category[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

const adminCategoryApi = {
    // 获取分类列表（分页 + 搜索）
    getCategoriesList(params?: {
        page?: number
        limit?: number
        keyword?: string
        status?: 'enabled' | 'disabled'
    }) {
        return request<ApiResponse<CategoryPageResponse>>({
            url: '/api/admin/categories',
            method: 'get',
            params
        })
    },

    //  获取启用分类（供下拉选择）
    getCategoriesEnabled() {
        return request<ApiResponse<Category[]>>({
            url: '/api/admin/categories/enabled',
            method: 'get'
        })
    },

    // 获取分类详情
    getCategoriesDetail(id: number) {
        return request<ApiResponse<Category>>({
            url: `/api/admin/categories/${id}`,
            method: 'get'
        })
    },

    // 创建分类
    createCategory(data: Partial<Category>) {
        return request<ApiResponse<Category>>({
            url: '/api/admin/categories',
            method: 'post',
            data
        })
    },

    // 更新分类
    updateCategory(id: number, data: Partial<Category>) {
        return request<ApiResponse<Category>>({
            url: `/api/admin/categories/${id}`,
            method: 'put',
            data
        })
    },

    // 删除分类（软删除）
    deleteCategory(id: number) {
        return request<ApiResponse<null>>({
            url: `/api/admin/categories/${id}`,
            method: 'delete'
        })
    }
}

export default adminCategoryApi