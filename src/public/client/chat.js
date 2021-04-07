const LocalStorageName = 'userStorage'
const socket = io(location.origin)


const getUsername = () => {
	
	try {
		return JSON.parse(localStorage.getItem(LocalStorageName)).username
	} catch(err) {
		return ''
	}
}

const username = getUsername()


const outMessage = message => {
	chat = document.getElementById('chat_messages')
	elMsg = document.createElement('li')
	elMsg.textContent = message
	chat.appendChild(elMsg)
	chat.scrollTo(0, chat.scrollHeight);
}

socket.on('chat_message', async message => {
	outMessage(message)
})

socket.on("connect_error", async err => {
	console.log(`connect_error due to ${err.message}`);
});

socket.emit('userJoin', username)

document.getElementById('logout').addEventListener('click', async () => {

	socket.removeAllListeners()
	localStorage.removeItem(LocalStorageName)
	location.replace(location.origin)
})

document.getElementById('messages').addEventListener('submit', async event => {

	event.preventDefault()

	const elMsg = document.getElementById('msg')
	const msg = elMsg.value.trim()

	if (!msg) {
		return false
	}

	socket.emit('chat_message', JSON.stringify({ username, msg }))

	elMsg.value = ''
	elMsg.focus()

})

document.addEventListener('DOMContentLoaded', async () => {
	if (!username) {
		location.replace(location.origin)
	}
})