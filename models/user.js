var mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers"),
	_ = require("underscore")



module.exports = function(db) {
	var schema = require("../schemas/user.js")
	var modelDef = db.getModelFromSchema(schema)

	modelDef.schema.methods.toHAL = function() {
		var halObj = helpers.makeHAL(this.toJSON())
		return halObj
	}

	modelDef.schema.methods.comparePassword=function(password) {
		var user = this;

		return password==user.password;
	};

	return mongoose.model(modelDef.name, modelDef.schema)
}