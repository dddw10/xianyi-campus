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

}

export default adminApi