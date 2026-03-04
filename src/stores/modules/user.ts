// src/stores/modules/user.ts
import { defineStore } from "pinia"
import { getToken, setToken, removeToken } from "@/utils/token"
import router from "@/router"
import { buildUserRoutes } from "@/utils/dynamicRoutes"
import { addDynamicRoutes, removeDynamicRoutes } from "@/router"  // ✅ 从 router/index.ts 导入

export const useUserStore = defineStore('user', {
    state: () => ({
        token: getToken() || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
        routes: JSON.parse(localStorage.getItem('routes') || '[]'),
        permissions: JSON.parse(localStorage.getItem('permissions') || '{}')
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isVerified: (state) => state.userInfo.isVerified || false,
        isAdmin: (state) => state.userInfo.role === 'admin',
        canPost: (state) => state.permissions.canPost || false,
        requireVerification: (state) => state.permissions.requireVerification || false
    },

    actions: {
        async init() {
            if (this.token && this.userInfo?.role) {
                console.log('🔄 检测到已登录，自动加载动态路由...')
                await this.loadDynamicRoutes()
            }
        },

        async setUserInfo(data: any) {
            this.token = data.token
            this.userInfo = data.user
            this.routes = data.routes || []
            this.permissions = data.permissions || {}

            setToken(data.token)
            localStorage.setItem('userInfo', JSON.stringify(data.user))
            localStorage.setItem('routes', JSON.stringify(data.routes))
            localStorage.setItem('permissions', JSON.stringify(data.permissions))

            await this.loadDynamicRoutes()
        },

        async loadDynamicRoutes() {
            try {
                console.log('🔄 开始加载动态路由...')

                if (this.routes?.length > 0) {
                    console.log('📦 使用后端返回的路由，数量:', this.routes.length)
                    addDynamicRoutes(this.routes)  // ✅ 调用 router/index.ts 的函数
                } else {
                    const role = this.userInfo.role || 'student'
                    const isVerified = this.userInfo.isVerified || false
                    console.log('🔨 前端生成路由')

                    const generatedRoutes = buildUserRoutes(role, isVerified)
                    addDynamicRoutes(generatedRoutes)
                }

                console.log('✅ 动态路由加载完成')
            } catch (error) {
                console.error('❌ 加载动态路由失败:', error)
            }
        },

        async logout() {
            const routeNames = (this.routes || [])
                .map((r: any) => r?.name)
                .filter((name: any): name is string => typeof name === 'string' && name.length > 0)

            if (routeNames.length > 0) {
                removeDynamicRoutes(routeNames)
            }

            this.token = ''
            this.userInfo = {}
            this.routes = []
            this.permissions = {}

            removeToken()
            localStorage.removeItem('userInfo')
            localStorage.removeItem('routes')
            localStorage.removeItem('permissions')

            router.push({ name: 'login' })
        },

        hasPermission(permission: string) {
            return this.permissions[permission] === true
        }
    }
})