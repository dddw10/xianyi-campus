// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from "@/stores/modules/user"
import { ElMessage } from 'element-plus'
import { modalBox } from "@/components/messageBox/modalBox"

// 🔹 组件映射表
const componentMap: Record<string, any> = {
  // 👤 用户相关
  'Profile': () => import('@/views/user/profile/index.vue'),
  'Verification': () => import('@/views/user/verification/index.vue'),

  // 🛍️ 商品相关
  'ProductList': () => import('@/views/products/products-list/index.vue'),
  'CreateProduct': () => import('@/views/products/products-publish/index.vue'),
  'MyProducts': () => import('@/views/products/my/index.vue'),

  // 👨‍💼 管理员相关
  'AdminDashboard': () => import('@/views/admin/dashboard/index.vue'),
  'AdminUserReview': () => import('@/views/admin/user/review.vue'),
  'AdminUserManagement': () => import('@/views/admin/user/index.vue'),
  'AdminProductReview': () => import('@/views/admin/product/review.vue'),
  'AdminReportManagement': () => import('@/views/admin/report/index.vue'),
}

// 🔹 公开路由（✅ 移除 /admin）
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

  // 管理员登录路由
  {
    path: '/admin',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',  // ✅ 完整路径：/admin/login
        name: 'adminLogin',
        component: () => import('@/views/admin/login.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/layouts/AdminLayout.vue'),  // ✅ 管理员专属布局
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    // children 留空，动态路由会添加到这里
    children: []
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
      // 🔥 catch-all 路由必须放在 children 最后
      {
        path: ':pathMatch(.*)*',
        name: 'products-protected',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: {
          requiresAuth: true,
          title: '加载中...',
          isDynamicPlaceholder: true
        }
      }
    ]
  },

  // ==================== 404（必须放在最后）====================
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

// 🔹 添加动态路由（✅ 修复：作为顶级路由添加）
// src/router/index.ts

export function addDynamicRoutes(dynamicRoutes: any[]) {
  console.log('🔍 addDynamicRoutes 开始处理，数量:', dynamicRoutes.length)

  let hasAdded = false

  dynamicRoutes.forEach((route: any) => {
    console.log(`\n🔄 处理路由: ${route.name}`)

    // 1. 转换 component 字符串
    if (typeof route.component === 'string') {
      const comp = componentMap[route.component]
      if (comp) {
        route.component = comp
        console.log('  ✅ component 转换成功')
      } else {
        console.warn('  ❌ component 映射失败:', route.component)
        route.component = () => import('@/views/NotFound.vue')
      }
    }

    // 2. 确保 meta
    if (!route.meta) route.meta = {}
    if (route.meta.requiresAuth === undefined) route.meta.requiresAuth = true

    // 🔥 3. 管理员路由：转换为相对路径，添加到 /admin 下
    if (route.path?.startsWith('/admin/')) {
      // /admin/dashboard → dashboard（相对路径）
      route.path = route.path.replace('/admin/', '')

      // 🔥 添加到 'admin' 父路由下
      try {
        router.addRoute('admin', route)  // ✅ 指定 parent: 'admin'
        console.log(`  ✅ 子路由添加: ${route.name} → /admin/${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
    // 🔥 普通用户路由：作为顶级路由添加
    else {
      if (!route.path?.startsWith('/')) {
        route.path = '/' + route.path
      }
      try {
        router.addRoute(route)  // ✅ 顶级路由
        console.log(`  ✅ 顶级路由添加: ${route.name} → ${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
  })

  // 4. 强制刷新
  if (hasAdded) {
    console.log('\n🔄 动态路由已添加，强制刷新...')
    setTimeout(() => {
      const currentPath = window.location.pathname + window.location.search
      router.replace({ path: currentPath }).catch(err => {
        if (err?.name !== 'NavigationDuplicated') {
          router.push({ path: currentPath }).catch(() => { })
        }
      })
    }, 100)
  }
}

// 6. 打印路由表（调试用）
console.log('\n📋 当前所有路由:')
router.getRoutes().forEach((r: any) => {
  if (r.meta?.title || ['AdminDashboard', 'AdminUserReview'].includes(r.name)) {
    console.log(`  - ${r.path} (${r.name})`)
  }
})


// 🔹 移除动态路由
export function removeDynamicRoutes(routeNames: string[]) {
  routeNames.forEach(name => {
    if (name && router.hasRoute(name)) {
      router.removeRoute(name)
      console.log(`🗑️ 路由移除: ${name}`)
    }
  })
}

// 🔹 前置守卫（✅ 修复：publicPaths 移除 /admin）
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const meta = to.meta as Record<string, any>

  // 🔥 管理员路由特殊处理（/admin/* 开头）
  if (to.name === 'adminLogin') {
    // 已登录管理员访问登录页，重定向到后台
    if (userStore.isLoggedIn && userStore.userInfo?.role === 'admin') {
      next({ name: 'AdminDashboard' })
      return
    }
    next()
    return
  }

  // 🔥 管理员后台路由（/admin/*）
  if (to.path.startsWith('/admin')) {
    // 1. 检查是否登录
    if (!userStore.isLoggedIn) {
      next({ name: 'adminLogin', query: { redirect: to.fullPath } })
      return
    }

    // 2. 检查是否是管理员
    if (userStore.userInfo?.role !== 'admin') {
      ElMessage.error('权限不足，需要管理员账号')
      next({ name: 'home' })
      return
    }

    // 3. 检查细粒度权限
    if (meta.permission) {
      const userPerms = userStore.permissions?.permissions || []
      if (!userPerms.includes(meta.permission)) {
        ElMessage.error('权限不足，无法访问此页面')
        next({ name: 'AdminDashboard' })
        return
      }
    }

    // 4. 管理员路由放行
    next()
    return
  }

  // 🔹 普通用户路由逻辑

  // ✅ 1. 公开路由直接放行（✅ publicPaths 已移除 /admin）
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

  // ✅ 3. 普通用户权限检查
  if (meta.requiresVerified && !userStore.isVerified) {
    ElMessage.warning('请先完成身份认证')
    next({ name: 'Verification' })
    return
  }

  // ✅ 4. 其他情况放行
  next()
})

export default router