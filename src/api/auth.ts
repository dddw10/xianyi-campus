import request from "@/utils/request";

const authApi = {
    // 用户注册
    register(data: any) {
        return request.post('/api/auth/register', data)
    },

    // 用户登录
    login(data: any) {
        return request.post('/api/auth/login', data)
    },

    // 🔥 新增：管理员登录
    adminLogin(data: { username: string; password: string }) {
        return request({
            url: '/api/admin/login',  // 🔥 管理员登录接口路径
            method: 'post',
            data
        })
    },

    // 提交身份验证
    submitVerification(data: any) {
        return request.post('/api/auth/verify', data)
    },

    // 获取当前用户信息
    getCurrentUser(data: any) {
        return request.get('/api/auth/me')
    },

    // 检查用户认证状态
    checkVerificationStatus(data: any) {
        return request.get('/api/auth/verify-status')
    }
}

export default authApi