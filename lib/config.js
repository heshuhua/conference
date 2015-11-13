




module.exports = {
	secretKey: 'heshuhua',
	server: {
		name: 'ComeNRead API',
		version: '1.0.0',
		port: process.env.PORT || 5000
	},
	database: {
		host: 'mongodb://localhost',
		dbname: 'comenread'
	}
}