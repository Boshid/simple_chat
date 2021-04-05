const http = require('http')
const express = require('express')
const ws = require('socket.io')
const serverRoutes = require('../routes/auth.routes.js')
const config = require('../config.js')
const path = require('path')
const mockdb = require('../server/mockdb.js')


const PORT = process.env.PORT ?? config.port
const dirname = path.resolve()

const app = express()
const serverHttp = http.createServer(app)

const socketServer = ws(serverHttp)

const noop = () => { }

const heartbeat = () => {
	this.isAlive = true
}

// const interval = setInterval(() => {
// 	socketServer..forEach((socket) => {
// 		if (socket.isAlive === false) return socket.terminate()

// 		socket.isAlive = false
// 		socket.ping(noop)
// 	})
// }, 30000)

// app.use(helmet())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.text())

app.use(express.static(path.resolve(dirname, 'src', 'public')))

app.use(serverRoutes)


socketServer.on('connection', socket => {

	// socket.isAlive = true
	// socket.on('pong', heartbeat)

	socket.on('userJoin', (username) => {
		mockdb.userJoin(socket.id, username);
		socket.broadcast.emit('chat_message', `${username} has joined the chat`)
	})

	socket.on('chat_message', (data) => {

		if (data) {
			const { username, msg } = JSON.parse(data)
			socketServer.emit('chat_message', `${username}: ${msg}`)
		}
	})

	socket.on('disconnect', () => {

		const user = mockdb.userLeave(socket.id)

		if (user) {
			socket.broadcast.emit('chat_message', `${user.username} has left the chat`)
		}
	})
})

try {
	serverHttp.listen(PORT, () => {
		console.log(`waiting for connections on port ${PORT}...`)
	})

} catch (e) {
	console.log(e)
}
