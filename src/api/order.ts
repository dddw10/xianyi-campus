// src/api/order.ts
import request from '@/utils/request'

export interface ProductItem {
    id: number
    title: string
    description: string
    price: number | string
    images: string[]
    status: string
    product_status?: string
    order_status?: string
    created_at: string
}

export interface PaginationResponse {
    page: number
    limit: number
    total: number
    pages: number
}

export interface OrderListResponse {
    list: ProductItem[]
    pagination: PaginationResponse
}

export interface PublishGoodsParams {
    page?: number
    limit?: number
    //  审核状态筛选（卖家专用）
    review_status?: 'pending' | 'approved' | 'rejected'
    //  商品状态筛选（卖家专用）
    status?: 'available' | 'sold' | 'deleted'
}

// src/api/product.ts - 公共商品（买家视角）
export interface PublicProductsParams {
    page?: number
    limit?: number
    category?: string
    keyword?: string
    //  买家只能看到 approved + (available | sold) 的商品
    //  不需要传状态筛选，后端自动过滤
}

export interface OrderItem {
    id: number
    orderNo: string
    buyerId: number
    sellerId: number
    productId: number
    productTitle: string
    productImage: string
    price: string
    paymentAmount: string | null
    status: 'pending' | 'paid' | 'trading' | 'completed' | 'cancelled' | 'refunded'
    paymentMethod: 'alipay' | 'wechat' | 'balance'
    paymentTime: string | null
    deliveryAddress: string | null
    buyerRemark: string | null
    createdAt: string
}

export interface CreateOrderParams {
    productId: number
    quantity?: number
    deliveryAddress?: string
    buyerRemark?: string
}

export interface PayOrderResponse {
    payUrl: string
    orderNo: string
    amount: string
    mock?: boolean  //  开发环境标记
}

export type AppealStatus = 'none' | 'pending' | 'approved' | 'rejected'

/**
 * 申诉信息对象（订单详情中返回）
 */
export interface AppealInfo {
    status: AppealStatus           // 申诉状态
    reason: string | null          // 申诉原因
    images: string[]               // 证据图片 URL 数组
    updated_at: string | null      // 申诉提交/更新时间
    admin_remark: string | null    // 管理员审核备注
}

/**
 * 扩展 OrderItem 接口，追加 appeal 字段
 */
export interface OrderItemWithAppeal extends OrderItem {
    appeal?: AppealInfo            // 可选：订单的申诉信息
    appeal_status?: AppealStatus   // 兼容：扁平字段（列表接口可能返回）
    appeal_reason?: string | null  // 兼容：扁平字段
}

/**
 * 提交申诉的请求参数
 */
export interface SubmitAppealParams {
    reason: string                 // 申诉原因（5-300 字）
    images: string[]               // 证据图片 URL 数组（0-3 张）
}

/**
 * 提交申诉的响应数据
 */
export interface SubmitAppealResponse {
    orderNo: string
    appeal_status: AppealStatus
    submitted_at: string
}

/**
 * 管理员审核申诉的请求参数
 */
export interface AuditAppealParams {
    action: 'approve' | 'reject'   // 审核动作
    remark?: string                // 审核备注（可选）
}

/**
 * 管理员审核申诉的响应数据
 */
export interface AuditAppealResponse {
    orderNo: string
    appeal_status: AppealStatus
    audited_at: string
}

/**
 * 申诉列表项（管理员视角）
 */
export interface AppealListItem {
    id: number
    order_no: string
    product_title: string
    product_image: string
    buyer_name: string
    seller_name: string
    amount: string
    appeal: AppealInfo
    created_at: string
}

/**
 * 申诉列表响应
 */
export interface AppealListResponse {
    list: AppealListItem[]
    pagination: PaginationResponse
    pending_count: number          // 待审核数量（用于顶部标签）
}

export const orderApi = {
    //  我发布的（商品状态）
    getPublishGoods(params?: {
        page?: number
        limit?: number
        status?: 'available' | 'sold' | 'deleted' | 'pending'
    }) {
        return request({
            url: '/api/user/orders/published',
            method: 'get',
            params
        })
    },

    //  我买到的（订单状态）
    getBoughtGoods(params?: {
        page?: number
        limit?: number
        status?: 'pending' | 'trading' | 'completed' | 'cancelled'
    }) {
        return request<OrderListResponse>({
            url: '/api/user/orders/bought',
            method: 'get',
            params: {
                page: 1,
                limit: 20,
                ...params
            }
        })
    },

    //  我卖出的（订单状态）
    getSoldGoods(params?: {
        page?: number
        limit?: number
        status?: 'pending' | 'trading' | 'completed' | 'cancelled'
    }) {
        return request<OrderListResponse>({
            url: '/api/user/orders/sold',
            method: 'get',
            params: {
                page: 1,
                limit: 20,
                ...params
            }
        })
    },

    //  更新订单状态
    updateStatus(orderNo: string, status: string) {
        return request({
            url: `/api/user/orders/${orderNo}/status`,
            method: 'put',
            data: { status }
        })
    },

    //  获取订单详情
    getOrderDetail(orderNo: string) {
        return request({
            url: `/api/user/orders/${orderNo}`,
            method: 'get'
        })
    },

    //  创建订单
    createOrder(data: CreateOrderParams) {
        return request({ url: '/api/user/orders', method: 'post', data })
    },

    //  发起支付
    payOrder(orderNo: string, paymentMethod: string = 'alipay') {
        return request({ url: `/api/user/orders/${orderNo}/pay`, method: 'post', data: { paymentMethod } })
    },

    //  查询支付结果
    getPayResult(orderNo: string) {
        return request({ url: `/api/user/orders/${orderNo}/pay-result`, method: 'get' })
    },

    //  我的订单列表（买家视角）
    getBoughtOrders(params?: { page?: number; limit?: number; status?: string }) {
        return request({ url: '/api/user/orders/bought', method: 'get', params: { page: 1, limit: 20, ...params } })
    },

    //  我的订单列表（卖家视角 - 卖出的）
    getSoldOrders(params?: { page?: number; limit?: number; status?: string }) {
        return request({ url: '/api/user/orders/sold', method: 'get', params: { page: 1, limit: 20, ...params } })
    },

    //  订单详情
    // getOrderDetail(orderNo: string) {
    //     return request({ url: `/api/user/orders/${orderNo}`, method: 'get' })
    // },

    //  更新订单状态（确认收货/发货等）
    updateOrderStatus(orderNo: string, status: string, proofImage?: string) {
        return request({
            url: `/api/user/orders/${orderNo}/status`,
            method: 'put',
            data: {
                status,
                proofImage
            }
        })
    },

    /**
     * 用户提交订单申诉
     * @param orderNo 订单号
     * @param data 申诉内容 { reason, images }
     */
    submitAppeal(orderNo: string, data: SubmitAppealParams) {
        return request<SubmitAppealResponse>({
            // ✅ 用户申诉：/api/user/orders/:orderNo/appeal（这个原本就正确）
            url: `/api/user/orders/${orderNo}/appeal`,
            method: 'post',
            data
        })
    },

    /**
     * 管理员审核申诉
     * @param orderNo 订单号
     * @param data 审核动作 { action, remark? }
     */
    auditAppeal(orderNo: string, data: AuditAppealParams) {
        return request<AuditAppealResponse>({
            //  修复：/api/user/orders/admin/orders/:orderNo/appeal
            // ⚠️ 注意：路径中有两个 /orders，是因为：
            // 1. 挂载点：/api/user/orders
            // 2. 路由定义：/admin/orders/:orderNo/appeal
            // 组合后 = /api/user/orders/admin/orders/:orderNo/appeal
            url: `/api/user/orders/admin/orders/${orderNo}/appeal`,
            method: 'patch',
            data
        })
    },

    /**
     * 管理员获取申诉列表
     * @param params 筛选参数
     */
    getAppealList(params?: {
        page?: number
        limit?: number
        status?: string | undefined
        keyword?: string
    }) {
        return request<AppealListResponse>({
            //  修复：/api/user/orders/admin/appeals
            // ⚠️ 注意：挂载点 + 路由定义 = /api/user/orders + /admin/appeals
            url: '/api/user/orders/admin/appeals',
            method: 'get',
            params: {
                page: 1,
                limit: 20,
                ...params
            }
        })
    },

    createReview(orderNo: string, data: { rating: number }) {
        const normalizedOrderNo = String(orderNo || '').trim()
        if (!normalizedOrderNo) {
            return Promise.reject(new Error('订单号不能为空'))
        }

        const payload = {
            ...data,
            orderNo: normalizedOrderNo
        }

        const encodedOrderNo = encodeURIComponent(normalizedOrderNo)
        return request({
            url: `/api/reviews/orders/${encodedOrderNo}/reviews`,
            method: 'post',
            data: payload
        }).catch((error: any) => {
            const msg = String(
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                error?.message ||
                ''
            )

            // 兼容后端使用 body 接收 orderNo 的版本
            if (!msg.includes('订单号不能为空')) {
                throw error
            }

            return request({
                url: '/api/reviews/orders/reviews',
                method: 'post',
                data: payload
            })
        })
    },

    /**
     * 获取订单评价列表
     */
    getOrderReviews(orderNo: string) {
        const normalizedOrderNo = String(orderNo || '').trim()
        if (!normalizedOrderNo) {
            return Promise.reject(new Error('订单号不能为空'))
        }

        const encodedOrderNo = encodeURIComponent(normalizedOrderNo)
        return request({
            url: `/api/reviews/orders/${encodedOrderNo}/reviews`,
            method: 'get',
            params: { orderNo: normalizedOrderNo }
        })
    },

    /**
     * 获取用户平均评分
     */
    getUserRating(userId: string | number) {
        return request({
            url: `/api/reviews/users/${userId}/rating`,
            method: 'get'
        })
    }

}

export default orderApi
