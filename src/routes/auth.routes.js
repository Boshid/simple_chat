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

	let { token, username } = req.body

	try {
		if (token && jwt.verify(token, config.jwtSecret)) {
			res.json({ page: `http://localhost:${PORT}/chat` })
			return true
		}
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			token = signToken(username)
			res.json({ token, username })
		} else {
			console.log(err.toString())
		}
	}
	return false
}


router.post('/', (req, res) => {
	if (!verifyToken(req, res)) {
		res.sendFile(path.resolve(dirname, 'src', 'public', 'index.html'))
	}
})


router.get('/chat', (req, res) => {

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


module.exports = router
