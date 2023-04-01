export const faultyPosts = {
	create() {
		return Promise.reject(new Error('404'))
	},
	create_500() {
		return Promise.reject(new Error('500'))
	},
}
