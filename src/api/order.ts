import request from '@/utils/request'

const orderApi = {
    // 获取发布的商品
    getPublishGoods(params?: {
        page: number,
        limit: number,
        status: 'available' | 'sold' | 'deleted' | undefined
    }) {
        return request({
            url: '/api/user/orders/published',
            method: 'get',
            params
        })
    },

    // 获取我买到的商品
    getBoughtGoods(params?: {
        page: number,
        limit: number,
        status: 'pending' | 'trading' | 'completed' | 'cancelled'
    }) {
        return request({
            url: '/api/user/orders/getBought',
            method: 'get',
            params
        })
    },

    // 获取我卖出的商品
    getSoldGoods(params?: {
        page: number,
        limit: number,
        status: 'pending' | 'trading' | 'completed' | 'cancelled'
    }) {
        return request({
            url: '/api/user/orders/getBought',
            method: 'get',
            params
        })
    },

    // 订单详情
    getOrderDetail(orderNo: number) {
        return request({
            url: `/api/user/orders/${orderNo}`,
            method: 'get'
        })
    },

    // 更新状态
    updateOrderStatus(orderNo: number, status: 'pending' | 'trading' | 'completed' | 'cancelled') {
        return request({
            url: `/api/user/orders/${orderNo}/${status}`,
            method: 'put'
        })
    }
}

export default orderApi