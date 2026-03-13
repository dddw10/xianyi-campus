import request from "@/utils/request";

export const favoriteApi = {
    toggle(productId: number) {
        return request({
            url: '/api/favorites/toggle',
            method: 'post',
            data: { productId }
        })
    },

    /**
     * 🔹 添加收藏
     */
    add(productId: number) {
        return request({
            url: '/api/favorites/add',
            method: 'post',
            data: { productId }
        })
    },

    /**
     * 🔹 取消收藏
     */
    remove(productId: number) {
        return request({
            url: '/api/favorites/remove',
            method: 'post',
            data: { productId }
        })
    },

    /**
     * 🔹 获取收藏列表（带分页）
     */
    getList(params = { page: 1, limit: 20 }) {
        return request({
            url: '/api/favorites/list',
            method: 'get',
            params
        })
    },

    /**
     * 🔹 检查单个商品收藏状态
     */
    check(productId: number) {
        return request({
            url: `/api/favorites/check/${productId}`,
            method: 'get'
        })
    },

    /**
     * 🔹 批量检查收藏状态（用于商品列表页）
     */
    batchCheck(productIds: number[]) {
        return request({
            url: '/api/favorites/batch-check',
            method: 'post',
            data: { productIds }
        })
    }
}

export default favoriteApi