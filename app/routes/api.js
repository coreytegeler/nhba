var Async = require('async')
var tools = require('../tools')
var Building = tools.getModel('building')
var Tour = tools.getModel('tour')
var Neighborhood = tools.getModel('neighborhood')
var Style = tools.getModel('style')
querystring = require('querystring');
module.exports = function(app) {

	app.get('/api/*', function(req, res) {
    var type = req.query.type
    var id = req.query.id
    var format = req.query.format
    var model = tools.getModel(type)
    var query = {}
    if(type == 'tour' && format == 'html')
      getTourSection(id, format, res) 
    else if(type == 'building' && format == 'html')
      getBuildingSection(id, format, res)  
    else
      model.find(query, function(err, response) {
        if(err)
          callback(err)
        return res.json(response)
    })
  })

  var getBuildingSection = function(id, format, res)  {
    Async.waterfall([
      function(callback) {
        Building.findOne({_id:id}, function(err, building) {
          return callback(null, building)
        })
      },
      function(building, callback) {
        if(!building || !building.tour)
          return callback(null, building, null)
        Building.find({'tour.id': building.tour.id}, function(err, tourBuildings) {
          for(var i = 0; i < tourBuildings.length; i++) {
            if(tourBuildings[i]._id == building.id) {
              tourBuildings.splice(i, 1)
              break
            }
          }
          return callback(null, building, tourBuildings)
        })
      }
    ], function (err, building, tourBuildings) {
      if(err)
        return err
      data = {
        object: building,
        tourBuildings: tourBuildings
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('building.pug', data)
      }
    })
  }

  var getTourSection = function(id, format, res)  {
    Async.parallel([
      function(callback) {
        Tour.findOne({_id:id}, function(err, tour) {
          if(err)
            callback(err)
          callback(null, tour);
        })
      },
      function(callback) {
        Building.find({'tour.id': id}, function(err, buildings) {
          if(err)
            callback(err)
          callback(null, buildings);
        })
      }
    ], function (err, results) {
      data = {
        tour: results[0],
        buildings: results[1]
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('tour.pug', data)
      }
    })
  }
}