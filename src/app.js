const Hapi = require('@hapi/hapi')
const { predict, loadModel } = require('./inference')

const init = async () => {
	const model = await loadModel()
	console.log('model loaded')

	const server = Hapi.server(({
		host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
		port: 3000
	}))

	server.route({
		method: 'POST',
		path: '/predicts',
		options: {
			payload: {
				allow: 'multipart/form-data',
				multipart: true
			}
		},
		handler: async (request, _) => {
			const { image } = request.payload
			const predictions = await predict(model, image)
			const [paper, rock] = predictions

			if (paper) {
				return { result: 'paper' }
			}
			if (rock) {
				return { result: 'rock' }
			}
			return { result: 'scissors' }
		}
	})
	await server.start()
	console.log(`server start at ${server.info.uri}`)
}

init()
