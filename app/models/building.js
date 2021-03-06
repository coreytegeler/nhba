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
	historicName: String,
	slug: String,
	researchBy: String,
	researchYear: String,
	dateConstructed: String,
	architect: String,
	client: String,
	currentTenant: String,
	era: String,
	stories: String,
	owner: String,
	ownerStatus: String,
	dimensions: String,
	visibleExterior: String,
	accessibleInterior: String,
	explanation: String,
	neighborhood: Mixed,
	tour: Mixed,
	style: Mixed,
	use: Mixed,
	historicUse: Mixed,
	material: Mixed,
	structure: Mixed,
	structuralCondition: String,
	exteriorCondition: String,
	roofType: Mixed,
	roofMaterial: Mixed,
	relatedBuildings: Mixed,
	environment: Mixed,
	images: Mixed,
	structure: String,
	research: String,
	narrative: String,
	threat: String,
	fieldEvaluations: String,
	physical: String,
	streetscape: String,
	social: String,
	history: String,
	addlInfo: String,
	citations: String,
	links: String,
	type: String,
	number: String,
	sortNum: String,
	sortAlpha: String
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