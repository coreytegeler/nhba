var tools = require('../tools')
var mongoose = require('mongoose')

var roofTypeSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

roofTypeSchema.pre('save', function(next) {
	this.type = 'roofType'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('RoofType', roofTypeSchema)