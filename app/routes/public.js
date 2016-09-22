var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Neighborhood = require('../models/neighborhood')
var tools = require('../tools')
var slugify = require('slug')

module.exports = function(app) {

  app.get('/:type/:slug', function(req, res) {
    tools.async(function(results, err, models) {
      var slug = req.params.slug
      var type = req.params.type
      var data = {}
      res.render('index.pug', {
        errors: err,
        models: models,
        eras: tools.eras,
        user: req.user,
        loadedSlug: slug,
        loadedType: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        }
      })
    }, req, res)
  })

  app.get('/*', function(req, res) {
    tools.async(function(results, err, models) {
      var data = {}
      res.render('index.pug', {
        errors: err,
        models: models,
        eras: tools.eras,
        user: req.user
      })
    }, req, res)
  })
}