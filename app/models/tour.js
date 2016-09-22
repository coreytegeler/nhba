var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var tourSchema = mongoose.Schema({
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

tourSchema.pre('save', function(next) {
	this.type = 'tour'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Tour', tourSchema)