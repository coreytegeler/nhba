var tools = require('../tools')
var mongoose = require('mongoose')

var imageSchema = mongoose.Schema({
	filename: String,
	path: String,
	caption: String
}, { 
	timestamps: true
});

imageSchema.pre('save', function(next) {
	this.type = 'image'
	next()
})

module.exports = mongoose.model('Image', imageSchema)