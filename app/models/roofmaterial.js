var tools = require('../tools')
var mongoose = require('mongoose')

var roofMaterialSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	type: String
}, { 
	timestamps: true
});

roofMaterialSchema.pre('save', function(next) {
	this.type = 'roofMaterial'
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('RoofMaterial', roofMaterialSchema)