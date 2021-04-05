const LocalStorageName = 'userStorage'

const fetchData = async (url, requestOptions) => {

	try {
		let response = await fetch(url, requestOptions)
		if (response.ok) {
			return await response.json()
		}
		logEl = document.getElementById('log')
		const {message} = await response.json()
		logEl.firstChild.textContent = message
	} catch (error) {
		console.log(error.toString())

	}
}

const requestOptions = (method = 'GET', headers = {}, body = {}) => {
	return {
		method,
		headers,
		body: JSON.stringify(body)
	}
}

document.getElementById('login_form').addEventListener('submit', async (event) => {

	event.preventDefault()

	const formData = new FormData(event.currentTarget)

	let data = await fetchData('/auth',
		requestOptions(
			'POST',
			{
				'Content-Type': 'application/json;charset=utf-8'
			},
			{ username: formData.get('username') }
		))
	if (data) {
		localStorage.setItem(LocalStorageName, JSON.stringify(data))
		location.assign(location.href + 'chat')
	}

})

document.addEventListener('DOMContentLoaded', async () => {

	if (localStorage.key(LocalStorageName)) {
		const storageData = JSON.parse(localStorage.getItem(LocalStorageName))
		if (storageData.token) {
			const data = await fetchData('/',
				requestOptions(
					'POST',
					{
						'Content-Type': 'application/json;charset=utf-8'
					},
					{
						token: storageData.token,
						username: storageData.username
					}
				))
			if (data && data.token != storageData.token) {
				localStorage.setItem(LocalStorageName, JSON.stringify({token: data.token, username: data.username}))
			}
			location.assign(data.page)
		}
	}

})


