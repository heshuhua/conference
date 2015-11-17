var BaseController = require("./basecontroller"),
	_ = require("underscore"),
  	swagger = require("swagger-node-restify")



function Users() {
}

Users.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new Users();

  controller.addAction({
  	'path': '/users',
  	'method': 'GET',
  	'summary': 'Returns the list of rooms ordered by name',
  	'responsClass':'User',
  	'nickname': 'getUsers'
  }, function(req, res, next) {
  	lib.db.model('User').find().sort('name').exec(function(err, rooms) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, rooms)
  	})
  })

  controller.addAction({
  	'path': '/users',
  	'method': 'POST',
  	'params': [swagger.bodyParam('user', 'The JSON representation of the user', 'string')],
  	'summary': 'Adds a new room to the database',
  	'responsClass': 'User',
  	'nickname': 'addUser'
  }, function(req, res, next) {
  	var newUser = req.body

  	var newUserModel = lib.db.model('User')(newUser)
  	newUserModel.save(function(err, user) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, user)
  	})
  })

  controller.addAction({
  	'path': '/users/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id', 'The id of the user', 'string')],
  	'summary': 'Returns the data of one user',
  	'responsClass': 'User',
  	'nickname': 'getUser'
  }, function (req, res, next) {
  	var id = req.params.id
  	if(id != null) {
  		lib.db.model('User').findOne({_id: id}).exec(function(err, user) {
  			if(err) return next(controller.RESTError('InternalServerError',err))
        if(!user) return next(controller.RESTError('ResourceNotFoundError', 'The user id cannot be found'))
          controller.writeHAL(res, user)
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError','Invalid room id'))
  	}
  })

  controller.addAction({
  	'path': '/users/{id}',
  	'method': 'PUT',
  	'params': [swagger.pathParam('id', 'The id of the user', 'string'), swagger.bodyParam('user', 'The content to overwrite', 'string')],
  	'summary': 'Updates the data of one user',
  	'responsClass': 'User',
  	'nickname': 'updateUser'
  }, function (req, res, next) {
  	var id = req.params.id
  	if(!id) {
  		return next(controller.RESTError('InvalidArgumentError','Invalid id'))
  	} else {
  		var model = lib.db.model('User')
  		model.findOne({_id: id})
  			.exec(function(err, user) {
  				if(err) return next(controller.RESTError('InternalServerError', err))
  				user = _.extend(user, req.body)
  				user.save(function(err, newUser) {
  					if(err) return next(controller.RESTError('InternalServerError', err))
            controller.writeHAL(res, newUser)
  				})
  			})
  	}
  		
  })

  return controller
}

