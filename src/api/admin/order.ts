import request from '@/utils/request'

export interface AdminOrderItem {
    id?: number
    orderNo?: string
    order_no?: string
    productTitle?: string
    product_title?: string
    buyerStudentId?: string
    buyer_student_id?: string
    sellerStudentId?: string
    seller_student_id?: string
    buyerName?: string
    buyer_name?: string
    sellerName?: string
    seller_name?: string
    amount?: string | number
    payment_amount?: string | number
    paymentTime?: string
    payment_time?: string
    appealStatus?: string
    appeal_status?: string
    deliveryProof?: string | string[]
    delivery_proof?: string | string[]
    receiveProof?: string | string[]
    receive_proof?: string | string[]
    deliveryAddress?: string | Record<string, any>
    delivery_address?: string | Record<string, any>
    status?: string
    createdAt?: string
    created_at?: string
    [key: string]: any
}

export interface AdminOrderListResponse {
    list: AdminOrderItem[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

const adminOrderApi = {
    getOrderList(params?: {
        page?: number
        limit?: number
        status?: string
        keyword?: string
    }) {
        return request<AdminOrderListResponse>({
            url: '/api/admin/orders',
            method: 'get',
            params: {
                page: 1,
                limit: 20,
                ...params
            }
        })
    },

    getOrderDetail(orderNo: string) {
        return request({
            url: `/api/admin/orders/${encodeURIComponent(orderNo)}`,
            method: 'get'
        })
    }
}

export default adminOrderApi
