import axios from 'axios'

function parseArgs(argv) {
    const result = {}
    for (let i = 2; i < argv.length; i += 1) {
        const item = argv[i]
        if (!item.startsWith('--')) continue
        const [rawKey, rawValue] = item.slice(2).split('=')
        if (!rawKey) continue
        result[rawKey] = rawValue === undefined ? true : rawValue
    }
    return result
}

function toNumber(value, fallback) {
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function buildEndpoint(base) {
    const normalized = String(base || 'http://localhost:3000').replace(/\/+$/, '')
    return normalized.endsWith('/api')
        ? `${normalized}/products`
        : `${normalized}/api/products`
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function buildPayload(index) {
    const categories = ['数码', '图书', '生活', '服饰', '其他']
    const prefixes = ['九成新', '闲置', '自用', '学习用', '搬家出']
    const nouns = ['蓝牙耳机', '机械键盘', '台灯', '运动外套', '专业教材', '收纳架', '平板支架', '鼠标']
    const suffixes = ['成色好', '可小刀', '同城优先', '功能正常', '急出']

    const seed = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`
    const title = `${randomFrom(prefixes)}${randomFrom(nouns)} ${randomFrom(suffixes)}`
    const category = randomFrom(categories)
    const price = (Math.random() * 300 + 20).toFixed(2)
    const description = `自动生成测试商品（审核用）：${title}，支持当面验货，编号 ${seed}。`
    const imageCount = 1 + Math.floor(Math.random() * 3)
    const images = Array.from({ length: imageCount }).map((_, i) =>
        `https://picsum.photos/seed/review-${seed}-${i}/900/700`
    )

    return {
        title,
        price: Number(price),
        category,
        description,
        images
    }
}

async function main() {
    const args = parseArgs(process.argv)
    const token = String(args.token || process.env.SEED_TOKEN || '').trim()
    const apiBase = String(
        args.base ||
        process.env.SEED_API_BASE_URL ||
        process.env.VITE_API_BASE_URL ||
        'http://localhost:3000'
    )
    const count = toNumber(args.count || process.env.SEED_COUNT, 8)
    const endpoint = buildEndpoint(apiBase)

    if (!token) {
        console.error('缺少 token。请通过 --token=xxx 或环境变量 SEED_TOKEN 传入。')
        process.exit(1)
    }

    console.log(`准备创建 ${count} 条待审核商品`)
    console.log(`请求地址: ${endpoint}`)

    let success = 0
    let fail = 0
    const errors = []

    for (let i = 1; i <= count; i += 1) {
        const payload = buildPayload(i)
        try {
            const res = await axios.post(endpoint, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 10000
            })

            const code = Number(res?.data?.code)
            if (code === 200 || code === 201) {
                success += 1
                console.log(`[${i}/${count}] 创建成功: ${payload.title}`)
            } else {
                fail += 1
                const msg = res?.data?.msg || `code=${res?.data?.code || 'unknown'}`
                errors.push(`[${i}] ${msg}`)
                console.log(`[${i}/${count}] 创建失败: ${msg}`)
            }
        } catch (error) {
            fail += 1
            const msg =
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                error?.message ||
                'unknown error'
            errors.push(`[${i}] ${msg}`)
            console.log(`[${i}/${count}] 创建失败: ${msg}`)
        }
    }

    console.log('\n执行完成')
    console.log(`成功: ${success}`)
    console.log(`失败: ${fail}`)

    if (errors.length) {
        console.log('\n失败明细:')
        errors.forEach((line) => console.log(`- ${line}`))
        process.exitCode = 1
    }
}

main()

