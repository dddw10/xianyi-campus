// src/stores/modules/user.ts
import { defineStore } from "pinia"
import { getToken, setToken, removeToken } from "@/utils/token"
import router from "@/router"
import { buildUserRoutes } from "@/utils/dynamicRoutes"
import { addDynamicRoutes, removeDynamicRoutes } from "@/router"  // ✅ 从 router/index.ts 导入
import { useFavoriteStore } from './favorite'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: getToken() || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
        routes: JSON.parse(localStorage.getItem('routes') || '[]'),
        permissions: JSON.parse(localStorage.getItem('permissions') || '{}'),
        role: localStorage.getItem('userRole') || 'user',  // 'user' | 'admin'
        userPermissions: JSON.parse(localStorage.getItem('userPermissions') || '[]')  // 细粒度权限数组
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isVerified: (state) => state.userInfo.isVerified || false,
        isAdmin: (state) => state.userInfo.role === 'admin',
        canPost: (state) => state.permissions.canPost || false,
        requireVerification: (state) => state.permissions.requireVerification || false,
        hasPermission: (state) => (perm: string) => state.userPermissions?.includes(perm)  // 新增：细粒度权限检查
    },

    actions: {
        async init() {
            if (this.token && this.userInfo?.role) {
                console.log('🔄 检测到已登录，自动加载动态路由...')
                await this.loadDynamicRoutes()
            }
        },

        async setUserInfo(data: any) {
            // 1. 保存基础数据
            this.token = data.token
            this.userInfo = data.user
            this.routes = data.routes || []
            this.permissions = data.permissions || {}

            // 🔥 2. 保存角色和细粒度权限（管理员专用）
            this.role = data.user?.role || 'user'
            this.userPermissions = data.permissions?.permissions || []

            // 3. 持久化到 localStorage
            setToken(data.token)
            localStorage.setItem('userInfo', JSON.stringify(data.user))
            localStorage.setItem('routes', JSON.stringify(data.routes))
            localStorage.setItem('permissions', JSON.stringify(data.permissions))
            localStorage.setItem('userRole', this.role)  // 🔥 新增
            localStorage.setItem('userPermissions', JSON.stringify(this.userPermissions))  // 🔥 新增

            // 4. 加载动态路由
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
            // 1. 清理动态路由
            const routeNames = (this.routes || [])
                .map((r: any) => r?.name)
                .filter((name: any): name is string => typeof name === 'string' && name.length > 0)

            if (routeNames.length > 0) {
                removeDynamicRoutes(routeNames)
            }

            // 2. 清空所有状态
            this.token = ''
            this.userInfo = {}
            this.routes = []
            this.permissions = {}
            this.role = 'user'  // 🔥 重置角色
            this.userPermissions = []  // 🔥 重置权限

            const favoriteStore = useFavoriteStore()
            favoriteStore.clear()
            console.log('✅ 已清空收藏数据')

            // 3. 清理存储
            removeToken()
            localStorage.removeItem('userInfo')
            localStorage.removeItem('routes')
            localStorage.removeItem('permissions')
            localStorage.removeItem('userRole')  // 🔥 新增
            localStorage.removeItem('userPermissions')  // 🔥 新增

            // 4. 根据角色跳转到对应登录页
            const redirectPath = this.role === 'admin' ? '/admin/login' : '/auth/login'
            router.push({ path: redirectPath })
        },

        hasPermission(permission: string) {
            return this.permissions[permission] === true
        }
    }
})