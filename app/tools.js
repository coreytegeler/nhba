var Async = require('async')
var User = require('./models/user')
var Building = require('./models/building')
var Neighborhood = require('./models/neighborhood')
var Tour = require('./models/tour')
var Style = require('./models/style')
var Use = require('./models/use')
var Term = require('./models/term')
var Image = require('./models/image')
var slugify = require('slug')
var moment = require('moment')
  
var async = function(func, req, res) {
  Async.parallel([
    function(callback) {
      Building.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Neighborhood.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Tour.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Style.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Use.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Term.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    }
  ],
  function(err, results) { 
    var glossary = alphaSort(results[3].concat(results[5]))
    var models = {
      'buildings': results[0],
      'neighborhood': results[1],
      'tour': results[2],
      'style': results[3],
      'use': results[4],
      'term': results[5],
      'glossary': glossary
    }
    func(results, err, models)
  });
}

var isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/admin/login');
}

var isAdmin = function(req, res, next) {
  if(req.isAuthenticated())
    if(req.user && req.user.admin) {
      return next()
    } else {
      return res.redirect('/admin/')
    }
  res.redirect('/admin/login')
}

var alphaSort = function(object) {
  object.sort(function(a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  })
  return object
}

var singularize = function(string) {
  if(string)
    return string.replace(/s$/, '');
  else
    return string
}

var pluralize = function(string) {
  if(string)
    return singularize(string) + 's';
  else
    return string
}

var getModel = function(type) {
  var type = singularize(type)
  switch(type) {
    case 'user':
      return User
    case 'building':
      return Building
    case 'tour':
      return Tour
    case 'era':
      return Era
    case 'neighborhood':
      return Neighborhood
    case 'style':
      return Style
    case 'use':
      return Use
    case 'term':
      return Term
    case 'image':
      return Image
  }
}

var getSideSection = function(type) {
  type = singularize(type)
  if(type == 'building') {
    return 'archive'
  } else if(type == 'tour' || type == 'neighborhood' || type == 'style') {
    return 'filter'
  } else if(type == 'term') {
    return 'glossary'
  }
}

var eras = ['1638-1860', '1860-1910', '1910-1950', '1950-1980', '1980-Today']

var preSave = function(item) {
  if(!item.slug)
    item.slug = slugify(item.name, {lower: true})
}
exports.slugify = slugify;
exports.isLoggedIn = isLoggedIn;
exports.isAdmin = isAdmin;
exports.alphaSort = alphaSort;
exports.singularize = singularize;
exports.pluralize = pluralize;
exports.getModel = getModel;
exports.getSideSection = getSideSection;
exports.preSave = preSave;
exports.eras = eras;
exports.async = async;