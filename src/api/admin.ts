import request from "@/utils/request";

export interface DashboardStats {
    users: { total: number; todayNew: number }
    products: { total: number; todayNew: number; pendingReview: number }
    orders: { total: number; todayNew: number; todayCompleted: number; todayAmount: string }
    appeals: { pending: number; approved: number; rejected: number }
    reports: { total: number; pending: number }
    recent: {
        orders: Array<{
            orderNo: string
            product: string
            buyer: string
            amount: string
            status: string
            time: string
        }>
        appeals: Array<{
            orderNo: string
            product: string
            buyer: string
            reason: string
            status: string
            time: string
        }>
    }
    categories: Array<{ name: string; value: number }>
}

export interface TrendStats {
    dates: string[]
    orders: number[]
    users: number[]
}

const adminApi = {
    // 获取用户列表
    getUserByStatus(params: any) {
        return request.get('/api/admin/users/pending', { params })
    },

    // 审核用户
    verifyUser(userId: any, action: any, reason = '') {
        return request.put(`/api/admin/users/${userId}/verify`, {
            action,
            reason
        })
    },

    // 获取用户详情
    getUserById(userId: any) {
        return request.get(`/api/admin/users/${userId}`)
    },

    // 获取审核列表
    getLoadPendingProducts(params: any) {
        return request({
            url: '/api/admin/products/pending',
            method: 'get',
            params
        })
    },

    // 审核单个商品
    reviewSingleProduct(productId: number, action: 'approve' | 'reject', reason?: string) {
        return request({
            url: `/api/admin/products/${productId}/review`,
            method: 'put',
            data: {
                action,
                reason: action === 'reject' ? reason : undefined
            }
        })
    },

    // 批量审批
    passBatchReview(ids: number[], action: 'approve' | 'reject', reason?: string) {
        return request({
            url: '/api/admin/products/batch-review',
            method: 'post',
            data: {
                ids,
                action,
                reason: action === 'reject' ? reason : undefined
            }
        })
    },
    // 获取数据面板统计信息
    getDashboardStats() {
        return request<DashboardStats>({
            url: '/api/admin/dashboard/stats',
            method: 'get'
        })
    },

    //  * 获取近 7 天趋势数据
    getDashboardTrend() {
        return request<TrendStats>({
            url: '/api/admin/dashboard/trend',
            method: 'get'
        })
    }

}

export default adminApi