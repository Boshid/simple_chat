const { Router } = require('express')
const { body, validationResult } = require('express-validator')
const mockdb = require('../server/mockdb.js')
const jwt = require('jsonwebtoken')
const config = require('../config.js')
const path = require('path')


const PORT = process.env.PORT ?? config.port
const dirname = path.resolve()

const router = Router()

const signToken = (username) => {
	return jwt.sign(
		{ username },
		config.jwtSecret,
		{ expiresIn: '1h' })
}
const verifyToken = (req, res) => {

	const { username } = req.body
	let token = req.header('authorization')

	try {
		const token_info = jwt.verify(token, config.jwtSecret)
		if (token_info && !mockdb.includes(username)) {
			const data = { page: `http://localhost:${PORT}/chat` }
			if (token_info.username !== username) {
				token = signToken(username)
				data.token = token
				data.username = username
			}
			res.json(data)
		}
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			token = signToken(username)
			res.json({ token, username, page: `http://localhost:${PORT}/chat` })
		} else {
			console.log(err.toString())
			res.status(401).json({ message: 'authorization lost, please enter your name again' })
		}
	}
}

const basicAuth = (req, res, next) => {

	if (!req.header('authorization')) {
		res.redirect('/')
		return res.status(401).json({ message: 'no authorization, please enter your name' })
	}
	next()
}


router.post('/', async (req, res) => {
	verifyToken(req, res)
})


router.get('/chat', basicAuth, async (req, res) => {

	res.sendFile(path.resolve(dirname, 'src', 'public', 'chat.html'))
})


router.post('/auth',
	[
		body('username', 'Empty name').notEmpty().trim().escape()
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({
					errors: errors.array(),
					message: 'Wrong data'
				})
			}
			const { username } = req.body

			if (mockdb.includes(username)) {
				return res.status(400).json({
					message: 'User with the same name already in chat'
				})
			}

			const token = signToken(username)

			res.json({ token, username })

		} catch (err) {
			res.status(500).json({ message: err.toString() })
		}
	})


router.get('/service_worker.js', async (req, res) => {
	res.sendFile(path.resolve(dirname, 'src', 'public', 'client', 'service_worker.js'))
})

module.exports = router
