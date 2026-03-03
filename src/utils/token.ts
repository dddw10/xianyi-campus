const TOKEN_KEY = 'campus_trade'

// 获取token
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
}

// 设置token
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
}

// 移除token
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY)
}

// 监听多标签也登出时间
export const setupTokenSync = (): void => {
    // 监听全局的storage事件
    window.addEventListener('storage', (e) => {
        if (e.key === TOKEN_KEY && e.newValue === null) {
            window.dispatchEvent(new CustomEvent('token:removed'))
        }
    })
}
