// src/utils/dynamicRoutes.ts

// 🔹 构建用户路由（返回带字符串 component 的配置）
export function buildUserRoutes(role: string, isVerified: boolean) {
    const baseRoutes: any[] = [
        {
            path: '/profile',  // ✅ 绝对路径
            name: 'Profile',
            component: 'Profile',  // ✅ 字符串，由 router/index.ts 转换
            meta: { title: '个人资料' }
        }
    ]

    if (role === 'admin') {
        return [
            ...baseRoutes,
            {
                path: '/admin/user-review',
                name: 'AdminUserReview',
                component: 'AdminUserReview',
                meta: { title: '用户审核', requiresAdmin: true }
            },
            {
                path: '/admin/user-management',
                name: 'AdminUserManagement',
                component: 'AdminUserManagement',
                meta: { title: '用户管理', requiresAdmin: true }
            }
        ]
    } else {
        const userRoutes = [...baseRoutes]

        if (isVerified) {
            userRoutes.push(
                {
                    path: '/products/create',
                    name: 'CreateProduct',
                    component: 'CreateProduct',  // ✅ 字符串
                    meta: { title: '发布商品', requiresVerified: true }
                },
                {
                    path: '/products/my',
                    name: 'MyProducts',
                    component: 'MyProducts',  // ✅ 字符串
                    meta: { title: '我的商品', requiresVerified: true }
                }
            )
        }

        if (!isVerified) {
            userRoutes.push({
                path: '/verify',
                name: 'Verification',
                component: 'Verification',
                meta: { title: '身份认证' }
            })
        }

        return userRoutes
    }
}
