var tools = require('../tools')
var mongoose = require('mongoose')

var materialSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

materialSchema.pre('save', function(next) {
	this.type = 'material'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Material', materialSchema)