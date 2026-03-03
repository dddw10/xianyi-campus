import { defineStore } from "pinia";
import { getToken, setToken, removeToken } from "@/utils/token";

// 如何创建弹窗
export const useUserStore = defineStore('user', {
    state: () => ({
        token: getToken() || '',// 刷新后获取token
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),//用户基本信息
        routes: JSON.parse(localStorage.getItem('routes') || '[]'),//动态路由
        permissions: JSON.parse(localStorage.getItem('permissions') || '{}')//权限配置 
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,//是否已登陆
        isVerified: (state) => state.userInfo.isVerified || false,//是否已认证
        isAdmin: (state) => state.userInfo.role === 'admin', //是否管理员
        canPost: (state) => state.permissions.canPost || false, //能否发布商品
        requireVerification: (state) => state.permissions.requireVerification || false //是否需要认证
    },
    actions: {
        setUserInfo(data: any) {
            this.token = data.token
            this.userInfo = data.user
            this.routes = data.routes || []
            this.permissions = data.permissions || []

            // 保存到localStorage
            setToken(data.token)
            localStorage.setItem('userInfo', JSON.stringify(data.user))
            localStorage.setItem('routes', JSON.stringify(data.routes))
            localStorage.setItem('permissions', JSON.stringify(data.permissions))
        },

        logout() {
            this.token = ''
            this.userInfo = {}
            this.routes = []
            this.permissions = {}

            removeToken()
            localStorage.removeItem('userInfo')
            localStorage.removeItem('routes')
            localStorage.removeItem('permissions')
        },

        hasPermission(permission: any) {
            return this.permissions[permission] === true
        }
    }

})

