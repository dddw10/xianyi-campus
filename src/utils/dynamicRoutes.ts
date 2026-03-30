type DynamicRoute = {
    path: string
    name: string
    component: string
    meta?: Record<string, any>
}

function buildBaseUserRoutes(): DynamicRoute[] {
    return [
        {
            path: '/profile',
            name: 'Profile',
            component: 'Profile',
            meta: { title: 'Profile' }
        },
        {
            path: '/favorites',
            name: 'Favorites',
            component: 'Favorites',
            meta: { title: 'Favorites' }
        },
        {
            path: '/chat',
            name: 'Chat',
            component: 'Chat',
            meta: { title: 'Chat' }
        },
        {
            path: '/products/orders',
            name: 'Orders',
            component: 'Orders',
            meta: { title: 'Orders' }
        }
    ]
}

function buildAdminRoutes(): DynamicRoute[] {
    return [
        {
            path: '/admin/dashboard',
            name: 'AdminDashboard',
            component: 'AdminDashboard',
            meta: { title: 'Dashboard', requiresAdmin: true }
        },
        {
            path: '/admin/user-review',
            name: 'AdminUserReview',
            component: 'AdminUserReview',
            meta: { title: 'User Review', requiresAdmin: true }
        },
        {
            path: '/admin/user-management',
            name: 'AdminUserManagement',
            component: 'AdminUserManagement',
            meta: { title: 'User Management', requiresAdmin: true }
        },
        {
            path: '/admin/product-review',
            name: 'AdminProductReview',
            component: 'AdminProductReview',
            meta: { title: 'Product Review', requiresAdmin: true }
        },
        {
            path: '/admin/order-management',
            name: 'AdminOrderManagement',
            component: 'AdminOrderManagement',
            meta: { title: 'Order Management', requiresAdmin: true }
        },
        {
            path: '/admin/report-management',
            name: 'AdminReportManagement',
            component: 'AdminReportManagement',
            meta: { title: 'Report Management', requiresAdmin: true }
        },
        {
            path: '/admin/home/posters',
            name: 'AdminHomePosters',
            component: 'AdminHomePosters',
            meta: { title: 'Poster Management', requiresAdmin: true }
        },
        {
            path: '/admin/home/faqs',
            name: 'AdminHomeFaqs',
            component: 'AdminHomeFaqs',
            meta: { title: 'FAQ Management', requiresAdmin: true }
        }
    ]
}

export function buildUserRoutes(role: string, isVerified: boolean): DynamicRoute[] {
    const baseRoutes = buildBaseUserRoutes()

    if (role === 'admin') {
        return [...baseRoutes, ...buildAdminRoutes()]
    }

    const userRoutes = [...baseRoutes]

    if (isVerified) {
        userRoutes.push({
            path: '/products/create',
            name: 'CreateProduct',
            component: 'CreateProduct',
            meta: { title: 'Create Product', requiresVerified: true }
        })
    } else {
        userRoutes.push({
            path: '/verify',
            name: 'Verification',
            component: 'Verification',
            meta: { title: 'Verification' }
        })
    }

    return userRoutes
}
