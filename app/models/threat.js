var tools = require('../tools')
var mongoose = require('mongoose')

var threatSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

threatSchema.pre('save', function(next) {
	this.type = 'threat'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Threat', threatSchema)