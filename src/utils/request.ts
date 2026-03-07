import axios from "axios"
import { ElMessage } from "element-plus";
import { getToken } from "./token";

// 🔥 定义后端响应数据结构
export interface ApiResponse<T = any> {
    code: number
    msg: string
    data: T
}

// 创建axios实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: import.meta.env.API_TIMEOUT || 3000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        // 结构返回的内容
        const { data } = response
        // 判断返回的数据结构
        if (data && typeof data === 'object' && 'code' in data) {
            if (data.code === 201 || data.code === 200) {
                return data
            } else {
                ElMessage.error('操作失败')
                // 创建一个失败状态的异步函数
                return Promise.reject(new Error(data.msg || 'Request fail'))
            }
        }
        // 结构类型不符合报错
        else {
            ElMessage.error('服务出错了,请联系管理员')
            return Promise.reject(new Error('服务器返回异常'))
        }
    },
    // 请求失败
    (error) => {
        // 401表示 登录过期，通知全局登出
        if (error.response?.status === 401) {
            window.dispatchEvent(new CustomEvent('token:expired'))
        }

        // 显示的错误提示
        let message = error.response?.data?.msg

        if (!message && error.response) {
            switch (error.response.status) {
                case 400:
                    message = '请求参数错误'
                    break
                case 401:
                    message = '登录已过期，请重新登录'
                    break
                case 403:
                    message = '没有权限访问'
                    break
                case 404:
                    message = '接口不存在'
                    break
                case 500:
                    message = '服务器开小差了'
                    break
                default:
                    message = '请求失败'
            }
        }
        // 如果还是没有 message（比如网络错误）
        if (!message) {
            message = error.request
                ? '网络连接失败，请检查网络设置'
                : (error.message || '未知错误')
        }

        ElMessage.error({
            message,
            duration: 3000,
        })
        return Promise.reject(error)
    }
)

export default request