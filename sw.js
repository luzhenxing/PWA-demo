// 主要是缓存内容
const CACHE_NAME = 'cache_v1'
self.addEventListener('install', async event => {
  console.log('install', event)
  // 开启一个cache，得到一个cache对象
  const cache = await caches.open(CACHE_NAME)
  // cache对象可以存储资源
  await cache.addAll([
    '/',
    '/index.css',
    '/qyer_logo_114.png',
    '/manifest.json',
    '/mock.json'
  ])

  // 会让 serviceWroker 跳过等待，直接进入activate状态
  await self.skipWaiting()
})

// 主要清除旧的缓存
self.addEventListener('activate', async event => {
  console.log('activate', event)
  // 清除掉旧的资源，获取到所有资源的key
  const keys = await caches.keys()
  keys.forEach(key => {
    if (key !== CACHE_NAME) {
      caches.delete(key)
    }
  })

  // serviceWroker 激活后，立刻获取控制权
  await self.clients.claim()
})

// fetch事件会在请求发送的时候触发
// 判断资源是否请求成功，如果能够请求成功，就响应成功的结果；如果请求失败，读取cache缓存
self.addEventListener('fetch', async event => {
  console.log('fetch', event.request.url)
  // 请求对象
  const req = event.request
  event.respondWith(networkFirst(req))
})

// 网络优先
async function networkFirst (req) {
  try {
    // 先从网络读取资源
    return await fetch(req)
  } catch (e) {
    // 去缓存中读取
    const cache = await caches.open(CACHE_NAME)
    return await cache.match(req)
  }
}

// 缓存优先
function cacheFirst (req) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(req)
  // 如果从缓存中得到了数据
  if (cached) {
    return cached
  } else {
    return await fetch(req)
  }
}