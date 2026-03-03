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