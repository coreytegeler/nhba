var Async = require('async')
var Building = require('../models/building')
var Neighborhood = require('../models/neighborhood')
var Tour = require('../models/tour')
var Style = require('../models/style')
var Term = require('../models/term')
var tools = require('../tools')

module.exports = function(app) {
	app.get('/search/:query', function(req, res) {
    var query = req.params.query
    console.log('Search this! ' + query)
    return query

  })
}