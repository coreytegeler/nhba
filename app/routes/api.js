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
    if(type == 'building' && format == 'html')
      getBuildingSection(id, format, type, res)  
    else if(type == 'tour' && format == 'html')
      getTourSection(id, format, type, res) 
    else if(type == 'buildingTour' && format == 'html')
      getTourSection(id, format, type, res)  
    else if(model)
      model.find(query, function(err, response) {
        if(err)
          callback(err)
        return res.json(response)
    })
  })

  var getBuildingSection = function(id, format, type, res)  {
    Building.findOne({_id:id}, function(err, building) {
      if(err) {
        console.log('Failed to get building')
        return console.log(err)
      }
      data = {
        object: building,
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('building.pug', data)
      }
    })
  }

  var getTourSection = function(id, format, type, res)  {
    Async.parallel([
      function(callback) {
        Tour.findOne({_id: id}, function(err, tour) {
          if(err)
            callback(err)
          callback(null, tour);
        }).sort({'name':1})
      },
      function(callback) {
        Building.find({'tour.id': id}, function(err, buildings) {
          if(err)
            callback(err)
          callback(null, buildings);
        }).sort({'number':1})
      }
    ], function (err, results) {
      if(err) {
        console.log(err)
        return res.json(err)
      }
      data = {
        tour: results[0],
        buildings: results[1]
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render(type+'.pug', data)
      }
    })
  }
}