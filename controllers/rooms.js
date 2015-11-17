var BaseController = require("./basecontroller"),
	_ = require("underscore"),
  	swagger = require("swagger-node-restify")



function Rooms() {
}

Rooms.prototype = new BaseController()

module.exports = function(lib) {
  var controller = new Rooms();

  controller.addAction({
  	'path': '/rooms',
  	'method': 'GET',
  	'summary': 'Returns the list of rooms ordered by name',
  	'responsClass':'Room',
  	'nickname': 'getRooms'
  }, function(req, res, next) {
  	lib.db.model('Room').find().sort('name').exec(function(err, rooms) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, rooms)
  	})
  })

  controller.addAction({
  	'path': '/rooms',
  	'method': 'POST',
  	'params': [swagger.bodyParam('room', 'The JSON representation of the room', 'string')],
  	'summary': 'Adds a new room to the database',
  	'responsClass': 'Room',
  	'nickname': 'addRoom'
  }, function(req, res, next) {
  	var newRoom = req.body

  	var newRoomModel = lib.db.model('Room')(newRoom)
  	newRoomModel.save(function(err, room) {
  		if(err) return next(controller.RESTError('InternalServerError', err))
      controller.writeHAL(res, room)
  	})
  })

  controller.addAction({
  	'path': '/rooms/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id', 'The id of the room', 'string')],
  	'summary': 'Returns the data of one room',
  	'responsClass': 'Room',
  	'nickname': 'getRoom'
  }, function (req, res, next) {
  	var id = req.params.id
  	if(id != null) {
  		lib.db.model('Room').findOne({_id: id}).exec(function(err, room) {
  			if(err) return next(controller.RESTError('InternalServerError',err))
        if(!room) return next(controller.RESTError('ResourceNotFoundError', 'The room id cannot be found'))
          controller.writeHAL(res, room)
  		})
  	} else {
  		next(controller.RESTError('InvalidArgumentError','Invalid room id'))
  	}
  })

  controller.addAction({
  	'path': '/rooms/{id}',
  	'method': 'PUT',
  	'params': [swagger.pathParam('id', 'The id of the room', 'string'), swagger.bodyParam('room', 'The content to overwrite', 'string')],
  	'summary': 'Updates the data of one room',
  	'responsClass': 'Room',
  	'nickname': 'updateRoom'
  }, function (req, res, next) {
  	var id = req.params.id
  	if(!id) {
  		return next(controller.RESTError('InvalidArgumentError','Invalid id'))
  	} else {
  		var model = lib.db.model('Room')
  		model.findOne({_id: id})
  			.exec(function(err, room) {
  				if(err) return next(controller.RESTError('InternalServerError', err))
  				room = _.extend(room, req.body)
  				room.save(function(err, newRoom) {
  					if(err) return next(controller.RESTError('InternalServerError', err))
            controller.writeHAL(res, newRoom)
  				})
  			})
  	}
  		
  })

  return controller
}

