const LocalStorageName = 'userStorage'
const username = JSON.parse(localStorage.getItem(LocalStorageName)).username
const socket = io(location.origin)


const heartbeat = () => {
	clearTimeout(this.pingTimeout)
	this.pingTimeout = setTimeout(() => {
		this.terminate()
	}, 30000 + 1000)
}

const outMessage = (message) => {
	chat = document.getElementById('chat_messages')
	elMsg = document.createElement('li')
	elMsg.textContent = message
	chat.appendChild(elMsg)
	window.scrollTo(0, document.body.scrollHeight);
}

socket.on('chat_message', (message) => {
	outMessage(message)
})

socket.on("connect_error", (err) => {
	console.log(`connect_error due to ${err.message}`);
  });

socket.emit('userJoin', username)

document.getElementById('logout').addEventListener('click', async () => {

	socket.emit('disconnected', username)
	socket.removeAllListeners()
	localStorage.removeItem(LocalStorageName)
	location.replace(location.origin)
})

document.getElementById('messages').addEventListener('submit', async (event) => {

	event.preventDefault()

	const elMsg = document.getElementById('msg')
	let msg = elMsg.value.trim()

	if (!msg) {
		return false
	}

	socket.emit('chat_message', JSON.stringify({ username, msg }))

	elMsg.value = ''
	elMsg.focus()

})