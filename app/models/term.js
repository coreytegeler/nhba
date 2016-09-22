var tools = require('../tools')
var mongoose = require('mongoose')

var termSchema = mongoose.Schema({
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

termSchema.pre('save', function(next) {
	this.type = 'term'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Term', termSchema)