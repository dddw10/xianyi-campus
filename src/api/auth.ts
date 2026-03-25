import request from "@/utils/request";

type AdminLoginPayload = {
    username: string
    password: string
}

type UpdateProfilePayload = {
    nickname?: string
    avatar?: string
    avatarUrl?: string
    phone?: string
}

const authApi = {
    // User register
    register(data: any) {
        return request.post('/api/auth/register', data)
    },

    // User login
    login(data: any) {
        return request.post('/api/auth/login', data)
    },

    // Admin login
    adminLogin(data: AdminLoginPayload) {
        return request({
            url: '/api/admin/login',
            method: 'post',
            data
        })
    },

    // Submit verification
    submitVerification(data: any) {
        return request.post('/api/auth/verify', data)
    },

    // Get current user info
    getCurrentUser(data?: any) {
        return request.get('/api/auth/me')
    },

    // Update current user profile
    updateProfile(data: UpdateProfilePayload) {
        return request({
            url: '/api/auth/me',
            method: 'put',
            data
        })
    },

    // Check verification status
    checkVerificationStatus(data?: any) {
        return request.get('/api/auth/verify-status')
    },

    // Change password
    ChangePasswordModal(data: { oldPassword: string, newPassword: string }) {
        return request({
            url: '/api/password/change',
            method: 'post',
            data
        })
    }
}

export default authApi
