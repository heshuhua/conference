var restify = require("restify"),
	colors = require("colors"),
	lib = require("./lib"),
	swagger = require("swagger-node-restify"),
	config = lib.config
var jwt 	   = require('jsonwebtoken');
var server = restify.createServer(lib.config.server)
var secret="secret";

server.use(restify.queryParser())
server.use(restify.bodyParser())

restify.defaultResponseHeaders = function(data) {
  this.header('Access-Control-Allow-Origin', '*')
}

/*///Middleware to check for valid api key sent
server.use(function(req, res, next) {
	//We move forward if we're dealing with the swagger-ui or a valid key
	if(req.url.indexOf("swagger-ui") != -1 || lib.helpers.validateKey(req.headers.hmacdata || '', req.params.api_key, lib)) {
		next()
	} else {
		res.send(401, { error: true, msg: 'Invalid api key sent'})
	}
	//next();
})*/


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
server.post('/authenticate', function(req, res) {

	// find the user
	var model = lib.db.model('User')
	model.findOne({
		username: req.body.username
	}).select('name username password').exec(function(err, user) {

		if (err) throw err;

		// no user with that username was found
		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} else if (user) {

			// check if password matches
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			} else {

				// if user is found and password is right
				// create a token
				var token = jwt.sign({
					name: user.name,
					username: user.username
				}, secret, {
					expiresInMinutes: 1440 // expires in 24 hours
				});

				// return the information including token as JSON
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}

		}

	});
});

// route middleware to verify a token
server.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');

	// check header or url parameters or post parameters for token
	//var to= req.headers['x-access-token'];
	//var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token = req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next(); // make sure we go to the next routes and don't stop here
			}
		});

	} else {

		// if there is no token
		// return an HTTP response of 403 (access forbidden) and an error message

		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}
});

/**
Validate each request, as long as there is a schema for it
*/
server.use(function(req, res, next) {
	var results = lib.schemaValidator.validateRequest(req)
	if(results.valid) {
		next()
	} else {
		res.send(400, results)
	}
})

//the swagger-ui is inside the "swagger-ui" folder
server.get(/^\/swagger-ui(\/.*)?/, restify.serveStatic({
 	directory: __dirname + '/',
 	default: 'index.html'
 }))


swagger.addModels(lib.schemas)
swagger.setAppHandler(server)
lib.helpers.setupRoutes(server, swagger, lib)

swagger.configureSwaggerPaths("", "/api-docs", "") //we remove the {format} part of the paths, to
swagger.configure('http://localhost:5000', '0.1')


server.listen(config.server.port, function() {
	console.log("Server started succesfully...".green)
	lib.db.connect(function(err) {
		if(err) console.log("Error trying to connect to database: ".red, err.red)
		else console.log("Database service successfully started".green)
	})
})