import request from "@/utils/request";

const productApi = {
    // 获取商品列表
    listProducts(params: any) {
        return request.get('/api/products', params)
    },

    // 获取商品详情
    getProduct(id: any) {
        return request.get(`/api/products/${id}`)
    },

    // 创建商品
    createProduct(data: any) {
        return request.post('/api/products', data)
    },

    // 更新商品
    updateProduct(id: any, data: any) {
        return request.put(`/api/products/${id}`, data)
    },

    //删除商品
    deleteProduct(id: any) {
        return request.delete(`/api/products/${id}`)
    }
}

export default productApi