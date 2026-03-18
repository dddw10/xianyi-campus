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
    // 🔹 审核状态筛选（卖家专用）
    review_status?: 'pending' | 'approved' | 'rejected'
    // 🔹 商品状态筛选（卖家专用）
    status?: 'available' | 'sold' | 'deleted'
}

// src/api/product.ts - 公共商品（买家视角）
export interface PublicProductsParams {
    page?: number
    limit?: number
    category?: string
    keyword?: string
    // 🔹 买家只能看到 approved + (available | sold) 的商品
    // 🔹 不需要传状态筛选，后端自动过滤
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
    mock?: boolean  // 🔥 开发环境标记
}


export const orderApi = {
    // 🔹 我发布的（商品状态）
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

    // 🔹 我买到的（订单状态）
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

    // 🔹 我卖出的（订单状态）
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

    // 🔹 更新订单状态
    updateStatus(orderNo: string, status: string) {
        return request({
            url: `/api/user/orders/${orderNo}/status`,
            method: 'put',
            data: { status }
        })
    },

    // 🔹 获取订单详情
    getOrderDetail(orderNo: string) {
        return request({
            url: `/api/user/orders/${orderNo}`,
            method: 'get'
        })
    },

    // 🔹 创建订单
    createOrder(data: CreateOrderParams) {
        return request({ url: '/api/user/orders', method: 'post', data })
    },

    // 🔹 发起支付
    payOrder(orderNo: string, paymentMethod: string = 'alipay') {
        return request({ url: `/api/user/orders/${orderNo}/pay`, method: 'post', data: { paymentMethod } })
    },

    // 🔹 查询支付结果
    getPayResult(orderNo: string) {
        return request({ url: `/api/user/orders/${orderNo}/pay-result`, method: 'get' })
    },

    // 🔹 我的订单列表（买家视角）
    getBoughtOrders(params?: { page?: number; limit?: number; status?: string }) {
        return request({ url: '/api/user/orders/bought', method: 'get', params: { page: 1, limit: 20, ...params } })
    },

    // 🔹 我的订单列表（卖家视角 - 卖出的）
    getSoldOrders(params?: { page?: number; limit?: number; status?: string }) {
        return request({ url: '/api/user/orders/sold', method: 'get', params: { page: 1, limit: 20, ...params } })
    },

    // 🔹 订单详情
    // getOrderDetail(orderNo: string) {
    //     return request({ url: `/api/user/orders/${orderNo}`, method: 'get' })
    // },

    // 🔹 更新订单状态（确认收货/发货等）
    updateOrderStatus(orderNo: string, status: string) {
        return request({ url: `/api/user/orders/${orderNo}/status`, method: 'put', data: { status } })
    }
}

export default orderApi