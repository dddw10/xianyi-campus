import request from "@/utils/request";

export type studentMessage = {
    studentCardUrl: string
    realName: string
    studentId: number
    phone?: string
}

export type VerificationStatus = {
    isVerified: boolean
    verificationStatus: 'pending' | 'approved' | 'rejected' | null
    rejectedReason: string | null
    submittedAt: string | null
    realName: string | null
    studentCardUrl: string | null
    studentId: string | null
    phone?: string | null
}

const verifyApi = {
    // 获取当前用户的信息
    getCurrentUser() {
        return request({
            url: '/api/verify/current',
            method: 'get',
        })
    },

    // 检查用户认证状态
    checkVerifyStatus() {
        return request({
            url: '/api/verify/status',
            method: 'get'
        })
    },

    // 提交身份认证信息
    submitVerification(data: studentMessage) {
        return request({
            url: '/api/verify/submit',
            method: 'post',
            data
        })
    },

    // 提交身份认证信息
    resubmitVerification(data: studentMessage) {
        return request({
            url: '/api/verify/resubmit',
            method: 'put',
            data
        })
    },

    // -- 管理员接口 --

    // 查看认证的列表
    getPendingList(params: {
        page: number,
        limit: number,
        keyword?: string
    }) {
        return request({
            url: '/api/verify/admin/list',
            method: 'get',
            params
        })
    },

    // 审核申请
    reviewVerification(id: number, data: { status: 'approved' | 'rejected', reason?: string }) {
        return request({
            url: `/api/verify/admin/${id}/review`,
            method: 'post',
            data
        })
    }
}

export default verifyApi
