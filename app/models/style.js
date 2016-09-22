var tools = require('../tools')
var mongoose = require('mongoose')

var styleSchema = mongoose.Schema({
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

styleSchema.pre('save', function(next) {
	this.type = 'style'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Style', styleSchema)