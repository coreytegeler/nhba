var tools = require('../tools')
var mongoose = require('mongoose')

var infoSchema = mongoose.Schema({
	name: {
		type: String,
		unique: true
	},
	text: String,
	slug: String
}, { 
	timestamps: true
})

infoSchema.pre('save', function(next) {
	this.type = 'info'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Info', infoSchema)