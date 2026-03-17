// src/api/admin/user.ts
import request from '@/utils/request'

export interface UserInfo {
    id: number
    studentId: string
    nickname: string
    realName: string | null
    phone: string | null
    avatarUrl: string | null
    role: 'student' | 'admin'
    isVerified: boolean
    verificationStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected'
    rejectedReason: string | null
    studentCardUrl: string | null
    creditScore: number
    enabled: boolean
    createdAt: string
    lastLoginAt: string | null
}

export interface UserForm {
    id?: number
    studentId: string
    password?: string
    nickname: string
    realName?: string
    phone?: string
    role: 'student' | 'admin'
    creditScore?: number
    enabled?: boolean
}

export default {
    getUserList(params: {
        page?: number
        limit?: number
        studentId?: string
        keyword?: string
        verificationStatus?: string
        role?: string
    }) {
        return request({
            url: '/api/admin/users',
            method: 'get',
            params: { page: 1, limit: 20, ...params }
        })
    },

    createUser(data: UserForm): Promise<{ id: number }> {
        return request({ url: '/api/admin/users', method: 'post', data })
    },

    updateUser(id: number, data: Partial<UserForm>): Promise<null> {
        return request({ url: `/api/admin/users/${id}`, method: 'put', data })
    },

    deleteUser(id: number): Promise<null> {
        return request({ url: `/api/admin/users/${id}`, method: 'delete' })
    },

    updateUserStatus(id: number, enabled: boolean): Promise<null> {
        return request({
            url: `/api/admin/users/status/${id}`,
            method: 'patch',
            data: { enabled }
        })
    },

    batchUpdateStatus(ids: number[], enabled: boolean): Promise<null> {
        return request({
            url: '/api/admin/users/batch/status',
            method: 'patch',
            data: { ids, enabled }
        })
    },

    resetPassword(id: number, newPassword: string): Promise<null> {
        return request({
            url: `/api/admin/users/${id}/reset-password`,
            method: 'post',
            data: { newPassword }
        })
    },

    getUserDetail(id: number): Promise<UserInfo> {
        return request({ url: `/api/admin/users/${id}`, method: 'get' })
    }
}