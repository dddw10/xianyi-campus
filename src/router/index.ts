// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
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
  'Orders': () => import('@/views/products/orders/index.vue'),

  // 👨‍💼 管理员相关
  'AdminDashboard': () => import('@/views/admin/dashboard/index.vue'),
  'AdminUserReview': () => import('@/views/admin/user/review.vue'),
  'AdminUserManagement': () => import('@/views/admin/user/index.vue'),
  'AdminProductReview': () => import('@/views/admin/product/review.vue'),
  'AdminReportManagement': () => import('@/views/admin/report/index.vue'),
}

// 🔹 公开路由（无需登录即可访问）
const publicPaths = ['/auth', '/home']

// 🔹 需要继承 MainLayout 的路径前缀（用于动态路由）
const mainLayoutPaths = ['/verify', '/chat', '/profile']

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
        path: 'login',
        name: 'adminLogin',
        component: () => import('@/views/admin/login.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: []
  },

  // ==================== 商品相关 ====================
  {
    path: '/products',
    name: 'products',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: { name: 'products-list' },
    meta: { title: '商品', public: true },
    children: [
      {
        path: '',
        name: 'products-list',
        component: () => import('@/views/products/products-list/index.vue'),
        meta: { title: '商品列表', public: true }
      },
      {
        path: 'detail/:id?',
        name: 'products-detail',
        component: () => import('@/views/products/products-detail/index.vue'),
        meta: { title: '商品详情', public: true }
      }
      // 🔥 动态路由（如 /products/create）会通过 addDynamicRoutes 添加到这里
    ]
  },

  // ==================== 受保护的主布局路由（动态路由父级）====================
  {
    path: '/main',
    name: 'main-protected',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, isLayoutWrapper: true },
    redirect: { name: 'home' },
    children: []
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

// 🔹 添加动态路由
export function addDynamicRoutes(dynamicRoutes: any[]) {
  // 🔥 在 addDynamicRoutes 开头添加
  console.log('📦 后端返回的动态路由配置:')
  console.log(JSON.stringify(dynamicRoutes.filter(r => r.name === 'user-profile'), null, 2))
  console.log('🔍 addDynamicRoutes 开始处理，数量:', dynamicRoutes.length)

  let hasAdded = false

  dynamicRoutes.forEach((route: any) => {
    console.log(`\n🔄 处理路由: ${route.name}, path: ${route.path}`)

    // 1. 转换 component 字符串
    if (typeof route.component === 'string') {
      const comp = componentMap[route.component]
      if (comp) {
        route.component = comp
        console.log('  ✅ component 转换成功')
      } else {
        // 🔥 模糊匹配提示
        const possibleKeys = Object.keys(componentMap).filter(k =>
          k.toLowerCase() === route.component.toLowerCase()
        )
        if (possibleKeys.length > 0) {
          console.warn(`  ⚠️ 大小写不匹配: "${route.component}"，建议后端返回: "${possibleKeys[0]}"`)
        } else {
          console.warn(`  ❌ component 映射失败: "${route.component}"，可用键:`, Object.keys(componentMap))
        }
        route.component = () => import('@/views/NotFound.vue')
      }
    }

    // 2. 确保 meta + 强制设置 requiresAuth
    if (!route.meta) route.meta = {}
    route.meta.requiresAuth = true  // 🔥 动态路由默认需要登录

    // 3. 管理员路由：添加到 /admin 父路由下
    if (route.path?.startsWith('/admin/')) {
      route.path = route.path.replace('/admin/', '')
      try {
        router.addRoute('admin', route)
        console.log(`  ✅ 子路由添加: ${route.name} → /admin/${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
    // 4. 商品相关路由：添加到 /products 父路由下
    else if (route.path?.startsWith('/products/') && route.path !== '/products') {
      route.path = route.path.replace('/products/', '')
      try {
        router.addRoute('products', route)
        console.log(`  ✅ 子路由添加: ${route.name} → /products/${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
    // 5. 需要 MainLayout 的顶级路由：添加到 main-protected 父路由下
    else if (mainLayoutPaths.some(prefix =>
      route.path === prefix || route.path?.startsWith(prefix + '/')
    )) {
      route.path = route.path.replace(/^\//, '')
      try {
        router.addRoute('main-protected', route)
        console.log(`  ✅ 子路由添加: ${route.name} → /main/${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
    // 6. 其他路由：作为顶级路由添加
    else {
      if (!route.path?.startsWith('/')) {
        route.path = '/' + route.path
      }
      try {
        router.addRoute(route)
        console.log(`  ✅ 顶级路由添加: ${route.name} → ${route.path}`)
        hasAdded = true
      } catch (error) {
        console.error(`  ❌ 添加失败 ${route.name}:`, error)
      }
    }
  })

  // 7. 强制刷新 + 验证
  if (hasAdded) {
    console.log('\n🔄 动态路由已添加，强制刷新...')
    setTimeout(() => {
      const currentPath = window.location.pathname + window.location.search
      router.replace({ path: currentPath })
        .catch(err => {
          if (err?.name === 'NavigationDuplicated') return
          return router.push({ path: currentPath })
        })
        .catch(err => {
          if (err?.name !== 'NavigationDuplicated') {
            console.warn('⚠️ 路由刷新失败:', err)
          }
        })
    }, 100)

    // 验证路由添加结果
    setTimeout(() => {
      console.log('\n📋 路由添加验证:')
      const verifyPaths = ['/products/create', '/verify', '/admin/dashboard']
      verifyPaths.forEach(path => {
        const matched = router.resolve(path)
        console.log(`  ${path.padEnd(25)} → ${matched.name?.toString() || '❌ 未匹配'}`)
      })
    }, 200)
  }
}

// 🔹 打印路由表（调试用）
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

// 🔹 前置守卫（✅ 修复：精确匹配公开路径 + 先检查登录）
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
  const userStore = useUserStore()
  const meta = to.meta as Record<string, any>

  // 🔥【关键修复】未登录时，先拦截可能的受保护路由
  if (!userStore.isLoggedIn) {
    // 排除：公开路由、登录注册页、首页
    const isAuthPage = to.path.startsWith('/auth')
    const isHome = to.path === '/' || to.path === '/home'

    // 🔥【核心修复】精确匹配 /products 下的公开路径（只放行列表和详情）
    const isPublicProduct =
      to.path === '/products' ||                    // ✅ 商品列表页
      to.path === '/products/detail' ||             // ✅ 商品详情（无参数）
      to.path.startsWith('/products/detail/')       // ✅ 商品详情（有参数）

    // 🔥 如果是可能的受保护路由（如 /products/create、/verify 等），提示登录
    if (!isAuthPage && !isHome && !isPublicProduct && !meta?.public) {
      console.log('🔐 未登录访问受保护路由，弹出提示:', to.path)

      try {
        const result = await modalBox({
          type: 'question',
          title: '温馨提示',
          message: '登录后即可使用此功能，是否前往登录？',
          cancel: '再逛逛',
          confirm: '去登录'
        })
        if (result === true) {
          console.log('🔐 用户选择登录，跳转:', `/auth/login?redirect=${to.fullPath}`)
          next({ path: '/auth/login', query: { redirect: to.fullPath } })
        } else {
          console.log('🔐 用户取消，停留在当前页')
          next(false)
        }
      } catch (error) {
        console.log('🔐 modalBox 异常:', error)
        next(false)
      }
      return  // 🔥 关键：返回，不再执行后续逻辑
    }
  }

  // 🔥 /main/* 路由的处理（继承 MainLayout 的保护路由）
  if (to.path.startsWith('/main')) {
    if (!userStore.isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath.replace('/main', '') } })
      return
    }
    if (meta.permission) {
      const userPerms = userStore.permissions?.permissions || []
      if (!userPerms.includes(meta.permission)) {
        ElMessage.error('权限不足')
        next({ name: 'home' })
        return
      }
    }
    next()
    return
  }

  // 🔥 管理员登录页特殊处理
  if (to.name === 'adminLogin') {
    if (userStore.isLoggedIn && userStore.userInfo?.role === 'admin') {
      next({ name: 'AdminDashboard' })
      return
    }
    next()
    return
  }

  // 🔥 管理员后台路由（/admin/*）
  if (to.path.startsWith('/admin')) {
    if (!userStore.isLoggedIn) {
      next({ name: 'adminLogin', query: { redirect: to.fullPath } })
      return
    }
    if (userStore.userInfo?.role !== 'admin') {
      ElMessage.error('权限不足，需要管理员账号')
      next({ name: 'home' })
      return
    }
    if (meta.permission) {
      const userPerms = userStore.permissions?.permissions || []
      if (!userPerms.includes(meta.permission)) {
        ElMessage.error('权限不足，无法访问此页面')
        next({ name: 'AdminDashboard' })
        return
      }
    }
    next()
    return
  }

  // 🔥 公开路由放行（放在登录检查之后）
  if (publicPaths.some(path => to.path.startsWith(path)) && !meta.requiresAuth) {
    if (to.path.startsWith('/auth') && userStore.isLoggedIn) {
      ElMessage.warning({ message: '您已经登录了', duration: 1500 })
      setTimeout(() => router.replace({ name: 'home' }), 1500)
      return
    }
    next()
    return
  }

  // 🔥 普通用户权限检查
  if (meta.requiresVerified && !userStore.isVerified) {
    ElMessage.warning('请先完成身份认证')
    next({ name: 'Verification' })
    return
  }

  // 🔥 其他情况放行
  next()
})

export default router