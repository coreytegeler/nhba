var tools = require('../tools')
var mongoose = require('mongoose')

var structureSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

structureSchema.pre('save', function(next) {
	this.type = 'structure'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Structure', structureSchema)