import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'  // ✅ 类型用 import type
import { useUserStore } from "@/stores/modules/user"
import { ElMessage } from 'element-plus'
import { modalBox } from "@/components/messageBox/modalBox";


// 公开路由（不需要登录）
const publicPaths = ['/auth', '/products', '/home']

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: { name: 'home' },
    meta: { requiresAuth: true },
    children: [
      { path: 'home', name: 'home', component: () => import('@/views/home/index.vue'), meta: { title: '首页' } }
    ] // 动态路由添加到这里
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/auth/loginPage.vue') },
      { path: 'register', name: 'register', component: () => import('@/views/auth/registerPage.vue') },
      // { path: 'verify', name: 'verify', component: () => import('@/views/auth/verifyPage.vue') }
    ]
  },
  {
    path: '/products',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'products', component: () => import('@/views/products/products-list/index.vue'), meta: { title: '商品列表' } },
      { path: 'detail/:id?', name: 'products-detail', component: () => import('@/views/products/products-detail/index.vue'), meta: { title: '商品详情' } }
    ]
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export function addDynamicRoutes(routes: RouteRecordRaw[]) {
  routes.forEach(route => {
    router.addRoute('main', route)
  })
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 公开路由放行
  if (publicPaths.some(path => to.path.startsWith(path))) {
    if (to.path.startsWith('/auth') && userStore.isLoggedIn) {
      ElMessage.warning({
        message: '您已经登录了',
        duration: 1500,
        onClose: () => next('/')
      })
      return
    } else {
      next()
      return
    }
  }

  // 保护路由：检查登录
  if (!userStore.isLoggedIn) {
    // 不是从/auth路由过来的才提示
    const showToast = !from.path.startsWith('/auth')

    if (showToast) {
      await modalBox({
        type: 'question',
        title: '温馨提示',
        message: '登录后即可使用此功能，是否前往登录？',
        cancel: '再逛逛',
        confirm: '去登录'
      }).then((result: boolean) => {
        if (result) {
          next({ path: '/auth/login', query: { redirect: to.fullPath } });
        } else {
          // 用户点击"再逛逛"，留在当前页
          next(false); // 取消导航
        }
        // 用户点击"去登录"
      }).catch(() => {
        next(false); // 取消导航
      });

    }
    return
  }

  // 管理员权限
  if (to.path.startsWith('/admin') && !userStore.isAdmin) {
    next('/dashboard')
    return
  }

  // 发布权限
  if (to.path === '/products/create' && !userStore.canPost) {
    next(userStore.requireVerification ? '/verify' : '/products')
    return
  }

  next()
})

export default router