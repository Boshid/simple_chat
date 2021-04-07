const http = require('http')
const express = require('express')
const ws = require('socket.io')
const serverRoutes = require('../routes/auth.routes.js')
const config = require('../config.js')
const path = require('path')
const mockdb = require('../server/mockdb.js')
const helmet = require('helmet')


const PORT = config.port
const dirname = path.resolve()

const app = express()
const serverHttp = http.createServer(app)

const socketServer = ws(serverHttp)

app.disable('x-powered-by')

app.use(helmet.referrerPolicy({policy: 'origin'}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.text())

app.use(express.static(path.resolve(dirname, 'src', 'public')))

app.use(serverRoutes)


socketServer.on('connection', socket => {

	socket.on('userJoin', username => {
		mockdb.userJoin(socket.id, username);
		socket.broadcast.emit('chat_message', `${username} has joined the chat`)
	})

	socket.on('chat_message', data => {

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

} catch (err) {
	console.log(err.toString())
}
