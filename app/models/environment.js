var tools = require('../tools')
var mongoose = require('mongoose')

var environmentSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	definition: String,
	type: String
}, { 
	timestamps: true
});

environmentSchema.pre('save', function(next) {
	this.type = 'environment'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Environment', environmentSchema)