// src/api/home.ts
import request from '@/utils/request'

export interface PosterItem {
    id: number
    title: string
    imageUrl: string
    linkUrl: string | null
    sortOrder: number
}

export interface ProductItem {
    id: number
    title: string
    price: string
    imageUrl: string
    sellerNickname: string
    category: string
}

export interface FaqItem {
    id: number
    question: string
    answer: string
    category: string
}

export default {
    getPosters(): Promise<PosterItem[]> {
        return request({ url: '/api/home/posters', method: 'get' })
    },

    getRecommendedProducts(limit: number = 8): Promise<ProductItem[]> {
        return request({ url: '/api/home/recommended-products', method: 'get', params: { limit } })
    },

    getFaqs(): Promise<FaqItem[]> {
        return request({ url: '/api/home/faqs', method: 'get' })
    }
}