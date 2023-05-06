const cachePrefix = 'gp-player-'
const cacheVersion = 'v9'
const cacheName = `${cachePrefix}${cacheVersion}`

const PATHNAME = '/gp-timelapse-player'
const BUNDLE_PATH = 'https://gpmod.github.io/pub'

const content = [
  `${PATHNAME}`,
  `${PATHNAME}/`,
  `${PATHNAME}/index.html`,
  `${PATHNAME}/styles/fonts.css`,
  `${PATHNAME}/styles/no-mod.css`,
  `${PATHNAME}/images/icons/app-192.png`,
  `${PATHNAME}/images/icons/app-512.png`,
  `${PATHNAME}/images/icons/gpimg-256.png`,
  `${PATHNAME}/images/screenshots/screenshot-p-1.png`,
  `${PATHNAME}/images/screenshots/screenshot-p-2.png`,
  `${PATHNAME}/manifest.json`,
  `${BUNDLE_PATH}/dist/tp.min.css`,
  `${BUNDLE_PATH}/dist/tp.min.js`,
  'https://fonts.gstatic.com/s/nunito/v16/XRXV3I6Li01BKofIMeaBXso.woff2',
  'https://fonts.gstatic.com/s/nunito/v16/XRXV3I6Li01BKofINeaB.woff2',
]

const noCorsContent = [
  'https://\u0067\u0061\u0072\u0074\u0069\u0063phone.com/images/textura.png',
]

function isRemoteSourceURL(url) {
  return url.search.startsWith('?url=')
}

self.addEventListener('install', (e) => {
  self.skipWaiting((async () => {
    const cache = await caches.open(cacheName)
    await cache.addAll(content)

    noCorsContent.forEach(async (url) => {
      const res = await fetch(url, {
        mode: 'no-cors', credentials: 'omit'
      })
      cache.put(url, res)
    })
  })())
})

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const res = await caches.match(e.request)
    if (res) return res

    try {
      const response = await fetch(e.request)
      const cache = await caches.open(cacheName)
      const reqURL = new URL(e.request.url)

      if (
        !isRemoteSourceURL(reqURL) &&
        reqURL.hostname !== 'localhost'
      ) {
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`)
        cache.put(e.request, response.clone())
      }

      return response
    } catch (error) {
      console.warn(error)
      return new Response('', { status: 200 })
    }
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheName.startsWith(cachePrefix) && cacheName !== key) {
          return caches.delete(key)
        }
      }))
    })
  )
})
