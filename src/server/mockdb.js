const Users = []


const includes = (username) => {
	const index = Users.findIndex(user => user.username === username)

	if (index !== -1) {
		return true
	}
	return false
}

const userJoin = (id, username) => {

	Users.push({ id, username })
}

const userLeave = (id) => {
	const index = Users.findIndex(user => user.id === id)

	if (index !== -1) {
		return Users.splice(index, 1)[0]
	}
}


module.exports = { includes, userJoin, userLeave }