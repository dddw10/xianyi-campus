// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from "@/stores/modules/user"
import { ElMessage } from 'element-plus'
import { modalBox } from "@/components/messageBox/modalBox"

// 🔹 组件映射表（必须在 router/index.ts 中定义，供 addDynamicRoutes 使用）
const componentMap: Record<string, any> = {
  // 👤 用户相关
  'Profile': () => import('@/views/user/profile/index.vue'),
  'Verification': () => import('@/views/user/verification/index.vue'),

  // 🛍️ 商品相关
  'ProductList': () => import('@/views/products/products-list/index.vue'),
  'CreateProduct': () => import('@/views/products/products-publish/index.vue'),
  'MyProducts': () => import('@/views/products/my/index.vue'),

  // 👨‍💼 管理员相关
  'AdminUserReview': () => import('@/views/admin/user-review/index.vue'),
  'AdminUserManagement': () => import('@/views/admin/user-management/index.vue'),
}

// 🔹 公开路由（不需要登录）
const publicPaths = ['/auth', '/products', '/home']

const routes: RouteRecordRaw[] = [
  // ==================== 主布局 ====================
  {
    path: '/',
    name: 'main',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: { name: 'home' },
    meta: { requiresAuth: false },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', public: true }
      }
    ]
  },

  // ==================== 认证布局 ====================
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/auth/loginPage.vue') },
      { path: 'register', name: 'register', component: () => import('@/views/auth/registerPage.vue') },
    ]
  },

  // ==================== 商品相关（公开）====================
  {
    path: '/products',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'products',
        component: () => import('@/views/products/products-list/index.vue'),
        meta: { title: '商品列表', public: true }
      },
      {
        path: 'detail/:id?',
        name: 'products-detail',
        component: () => import('@/views/products/products-detail/index.vue'),
        meta: { title: '商品详情', public: true }
      },
      {
        path: ':pathMatch(.*)*',  // 匹配 /products/xxx 任意子路径
        name: 'products-protected',
        component: () => import('@/layouts/MainLayout.vue'),  // 占位布局
        meta: {
          requiresAuth: true,  // ✅ 标记需要登录，进入守卫逻辑
          title: '加载中...',
          isDynamicPlaceholder: true  // ✅ 自定义标记，用于识别
        }
      }
    ]
  },

  // ==================== 404 ====================
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 🔹 添加动态路由（核心函数）
// src/router/index.ts
export function addDynamicRoutes(dynamicRoutes: any[]) {
  let hasAdded = false

  dynamicRoutes.forEach((route: any) => {
    // 转换 component
    if (typeof route.component === 'string') {
      const comp = componentMap[route.component]
      if (comp) route.component = comp
    }

    // 确保 meta
    if (!route.meta) route.meta = {}
    if (route.meta.requiresAuth === undefined) route.meta.requiresAuth = true

    // 转换为相对路径，作为 main 的子路由
    if (route.path?.startsWith('/')) {
      route.path = route.path.slice(1)
    }

    // 添加到 main 路由下
    try {
      router.addRoute('main', route)
      console.log(`✅ 路由添加: ${route.name} → /${route.path}`)
      hasAdded = true
    } catch (error) {
      console.error(`❌ 添加失败:`, error)
    }
  })

  // 强制刷新
  if (hasAdded) {
    setTimeout(() => {
      const currentPath = window.location.pathname + window.location.search
      router.replace({ path: currentPath }).catch(() => { })
    }, 100)
  }
}

// 🔹 移除动态路由（登出时清理）
export function removeDynamicRoutes(routeNames: string[]) {
  routeNames.forEach(name => {
    if (name && router.hasRoute(name)) {
      router.removeRoute(name)
      console.log(`🗑️ 路由移除: ${name}`)
    }
  })
}

// 🔹 前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const meta = to.meta as Record<string, any>

  // ✅ 1. 公开路由直接放行
  if (publicPaths.some(path => to.path.startsWith(path)) && !meta.requiresAuth) {
    if (to.path.startsWith('/auth') && userStore.isLoggedIn) {
      ElMessage.warning({ message: '您已经登录了', duration: 1500 })
      setTimeout(() => router.replace({ name: 'home' }), 1500)
      return
    }
    next()
    return
  }

  // ✅ 2. 需要登录的路由：检查登录状态
  if (!userStore.isLoggedIn) {
    const showToast = !from.path.startsWith('/auth')
    if (showToast) {
      try {
        const result = await modalBox({
          type: 'question',
          title: '温馨提示',
          message: '登录后即可使用此功能，是否前往登录？',
          cancel: '再逛逛',
          confirm: '去登录'
        })
        if (result) {
          next({ path: '/auth/login', query: { redirect: to.fullPath } })
        } else {
          next(false)
        }
      } catch {
        next(false)
      }
    } else {
      next(false)
    }
    return
  }

  // ✅ 3. 管理员权限检查
  if (meta.requiresAdmin && !userStore.isAdmin) {
    ElMessage.error('需要管理员权限')
    next({ name: 'home' })
    return
  }

  // ✅ 4. 认证用户权限检查
  if (meta.requiresVerified && !userStore.isVerified) {
    ElMessage.warning('请先完成身份认证')
    next({ name: 'Verification' })
    return
  }

  // ✅ 5. 其他情况放行
  next()
})

export default router