var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var useSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	brief: String,
	buildings: Mixed,
	color: String,
	type: String
}, { 
	timestamps: true
});

useSchema.pre('save', function(next) {
	this.type = 'use'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Use', useSchema)