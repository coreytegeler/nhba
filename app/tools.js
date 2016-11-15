var Async = require('async')
var Info = require('./models/info')
var User = require('./models/user')
var Building = require('./models/building')
var Neighborhood = require('./models/neighborhood')
var Tour = require('./models/tour')
var Style = require('./models/style')
var Use = require('./models/use')
var Material = require('./models/material')
var Structure = require('./models/structure')
var RoofType = require('./models/rooftype')
var RoofMaterial = require('./models/roofmaterial')
var Threat = require('./models/threat')
var Environment = require('./models/environment')
var Term = require('./models/term')
var Image = require('./models/image')
var slugify = require('slug')
var moment = require('moment')
  
var async = function(func, req, res) {
  Async.parallel([
    function(callback) {
      Building.find({}).sort({sortAlpha:1, sortNum:1}).exec(function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    },
    function(callback) {
      Use.find({}, function(err, data) {
        if(err)
          callback(err)
        uses = {}
        for(var i = 0; i < data.length; i++) {
          useType = data[i].useType
          if(useType && useType.length) {
            if(!uses[useType])
              uses[useType] = {
                name: useType,
                uses: {}
              }
            uses[useType].uses[data[i].slug] = data[i]
          } else {
            uses['z'+i] = data[i] 
          }
        }
        if(uses.length)
          uses = alphaSortObject(uses)
        callback(null, uses)
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
      Term.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      }).sort({'name':1})
    },
    function(callback) {
      Info.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    }
  ],
  function(err, results) { 
    var glossary = alphaSort(results[2].concat(results[5]))
    var models = {
      'buildings': results[0],
      'use': results[1],
      'style': results[2],
      'neighborhood': results[3],
      'tour': results[4],
      'term': results[5],
      'glossary': glossary,
      'info': results[6]
    }
    func(results, err, models)
  });
}

var isLoggedIn = function(req, res, next) {
  return next()
  if(req.isAuthenticated())
    return next();
  res.redirect('/admin/login');
}

var isAdmin = function(req, res, next) {
  return next()
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

var alphaSortObject = function(o) {
  var sorted = {},
  key, a = []
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key)
    }
  }
  a.sort()
  for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]]
  }
  return sorted
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
    case 'info':
      return Info
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
    case 'material':
      return Material
    case 'structure':
      return Structure
    case 'term':
      return Term
    case 'image':
      return Image
    case 'roofType':
      return RoofType
    case 'roofMaterial':
      return RoofMaterial
    case 'threat':
      return Threat
    case 'environment':
      return Environment
  }
}

var getSideSection = function(type) {
  type = singularize(type)
  if(type == 'building') {
    return 'archive'
  } else if(type == 'tour' || type == 'neighborhood' || type == 'style' || type == 'use' || type == 'material') {
    return 'filter'
  } else if(type == 'term') {
    return 'glossary'
  } else {
    return type
  }
}

var parse = function(data) {
  if(!data)
    return
  var parsed = []
  if(Array.isArray(data)) {
    for(var i = 0; i < data.length; i++) {
      try {
        parsed[i] = JSON.parse(data[i])
      } catch (e) {
        parsed[i] = data[i]
      }
    }
  } else {
    try {
      parsed[0] = JSON.parse(data)
    } catch (e) {
      parsed[0] = data;
    }
  }
  return parsed
}

var eras = ['1638-1860', '1860-1910', '1910-1950', '1950-1980', '1980-Today']

var preSave = function(item) {
  if(!item.slug)
    item.slug = slugify(item.name, {lower: true})
}

exports.slugify = slugify;
exports.parse = parse;
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