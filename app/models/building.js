var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var buildingSchema = mongoose.Schema({
	address: {
		type: String,
		require: true
	},
	coords: Mixed,
	name: String,
	slug: String,
	description: String,
	researchBy: String,
	researchYear: String,
	dateConstructed: String,
	architect: String,
	client: String,
	currentTenant: String,
	era: String,
	neighborhood: Mixed,
	tour: Mixed,
	style: Mixed,
	use: Mixed,
	originalUse: String,
	research: String,
	citations: String,
	images: Mixed,
	type: String
}, { 
	timestamps: true
})

buildingSchema.pre('save', function(next) {
	if(!this.name)
		this.name = this.address
	this.type = 'building'
	tools.preSave(this)
  next()
})

module.exports = mongoose.model('Building', buildingSchema)