const staticCacheName = 's-app-cache-v1'
const assetUrls = [
	'/index.html',
	'/chat.html',
	'/styles/index.css',
	'/styles/chat.css',
	'/client/main.js',
	'/client/chat.js'
]

const cacheFirst = async (req) => {
	return await caches.match(req) ?? await fetch(req)
}

self.addEventListener('install', async () => {

	const cache = await caches.open(staticCacheName)
	await cache.addAll(assetUrls)

})

self.addEventListener('activate', async () => {
	const cacheNames = await caches.keys()
	await Promise.all(
		cacheNames
			.filter(name => name === staticCacheName)
			.map(name => caches.delete(name))
	)
})

self.addEventListener('fetch', async (event) => {

	const { request } = event
	const url = new URL(request.url)

	if (url.origin === location.origin) {
		event.respondWith(cacheFirst(request))
	}

})