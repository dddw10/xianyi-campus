// src/api/admin/home.ts
import request from '@/utils/request'

export interface PosterForm {
    id?: number
    title: string
    imageUrl: string
    linkUrl?: string
    sortOrder: number
    isEnabled: boolean
}

export interface FaqForm {
    id?: number
    question: string
    answer: string
    category: string
    sortOrder: number
    isEnabled: boolean
}

export default {
    getPosters(params?: { page?: number; limit?: number }) {
        return request({ url: '/api/admin/home/posters', method: 'get', params: { page: 1, limit: 20, ...params } })
    },
    createPoster(data: any) {
        return request({ url: '/api/admin/home/posters', method: 'post', data })
    },
    updatePoster(id: number, data: any) {
        return request({ url: `/api/admin/home/posters/${id}`, method: 'put', data })
    },
    deletePoster(id: number) {
        return request({ url: `/api/admin/home/posters/${id}`, method: 'delete' })
    },

    getFaqs(params?: { page?: number; limit?: number }) {
        return request({ url: '/api/admin/home/faqs', method: 'get', params: { page: 1, limit: 20, ...params } })
    },
    createFaq(data: any) {
        return request({ url: '/api/admin/home/faqs', method: 'post', data })
    },
    updateFaq(id: number, data: any) {
        return request({ url: `/api/admin/home/faqs/${id}`, method: 'put', data })
    },
    deleteFaq(id: number) {
        return request({ url: `/api/admin/home/faqs/${id}`, method: 'delete' })
    }
}