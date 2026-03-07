import request from "@/utils/request";

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
    }

}

export default adminApi