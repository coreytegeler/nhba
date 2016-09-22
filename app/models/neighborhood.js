var tools = require('../tools')
var mongoose = require('mongoose')

var neighborhoodSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

neighborhoodSchema.pre('save', function(next) {
	this.type = 'neighborhood'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Neighborood', neighborhoodSchema)