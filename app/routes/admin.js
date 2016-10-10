var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Neighborhood = require('../models/neighborhood')
var Style = require('../models/style')
var Use = require('../models/use')
var Material = require('../models/material')
var Structure = require('../models/structure')
var RoofType = require('../models/rooftype')
var RoofMaterial = require('../models/roofmaterial')
var Threat = require('../models/threat')
var Environment = require('../models/environment')
var Term = require('../models/term')
var Image = require('../models/image')
var tools = require('../tools')
var slugify = require('slug')
var path  = require('path')
var fs  = require('fs')
var multer  = require('multer')
var gm  = require('gm')
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyBjRpM-uioJEx7ptDKiieLgyiFmXIXNoqs',
  formatter: null
})

module.exports = function(app) {
  app.get('/admin', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var data = {}
      res.render('admin/index.pug', {
        errors: err,
        loadedType: {s: 'home', p: 'home'},
        models: models,
        user: req.user,
        sideSection: 'filter'
      })
    }, req, res)
  })

  app.get('/admin/:type', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var type = req.params.type
      var model = tools.getModel(type)
      if(err) {
        console.log('Failed:')
        console.log(err)
        return res.redirect('/admin/')
      }
      if(tools.singularize(type) == 'user' && req.user.admin != 1) {
        return res.redirect('/admin/')
      }
      res.render('admin/model.pug', {
        errors: err,
        loadedType: {
          s: tools.pluralize(type),
          p: tools.pluralize(type)
        },
        models: models,
        user: req.user,
        sideSection: tools.getSideSection(type)
      })
    }, req, res)
  })

  app.get('/admin/:type/new', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var type = req.params.type
      if(type == 'user' || type == 'users')
        var model = User
      else
        var model = tools.getModel(type)
      res.render('admin/edit.pug', {
        loadedType: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        },
        models: models,
        action: 'create',
        user: req.user
      })
    }, req, res)
  })

  app.post('/admin/:type/create', tools.isLoggedIn, function(req, res) {
    var data = req.body
    var type = tools.singularize(req.params.type)
    var errors
    if(data.images) { data.images = JSON.parse(data.images) }
    if(data.tour) { data.tour = JSON.parse(data.tour) }
    if(data.neighborhood) { data.neighborhood = JSON.parse(data.neighborhood) }
    if(data.style) { data.style = JSON.parse(data.style) }
    if(data.use) { data.use = JSON.parse(data.use) }
    switch(type) {
      case 'user':
        var object = new User(data)
        break
      case 'building':
        var object = new Building(data)
        break
      case 'tour':
        var object = new Tour(data)
        break
      case 'neighborhood':
        var object = new Neighborhood(data)
        break
      case 'style':
        var object = new Style(data)
        break 
      case 'use':
        var object = new Use(data)
        break 
      case 'term':
        var object = new Term(data)
        break 
      case 'material':
        var object = new Material(data)
        break 
      case 'structure':
        var object = new Structure(data)
        break 
    }
    if(type == 'building') {
      geocoder.geocode(data.address+', New Haven, CT 06510', function(err, location) {
        if(err) {
          console.log('Failed:')
          console.log(err)
        } else {
          console.log('Geocoded address:')
          object.coords = { lat:location[0].latitude, lng: location[0].longitude }
          console.log(object)
          saveNewObject(object, type, res)
        }
      })
    } else {
      saveNewObject(object, type, res)
    }
  })

  var saveNewObject = function(object, type, res) {
    object.save(function(err) {
      if(err) {
        console.log('Failed:')
        console.log(err)
        res.render('admin/edit.pug', {
          errors: err,
          type: {
            s: tools.singularize(type),
            p: tools.pluralize(type)
          },
          action: 'create'
        })
      } else {
        console.log('Created:')
        console.log(object)
        res.redirect('/admin/'+type+'/edit/'+object.slug)
      }
    })
  }

  app.get('/admin/:type/edit/:slug', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var type = req.params.type
      var slug = req.params.slug
      var model = tools.getModel(type)
      if(!slug) {
        res.redirect('/admin/'+type+'/new')
      } else {
        model.findOne({slug: slug}, function(err, object) {
          if (err)
            throw err
          var data = {
            object: object,
            action: 'update',
            loadedType: {
              s: tools.singularize(type),
              p: tools.pluralize(type)
            },
            loadedSlug: slug,
            models: models,
            user: req.user,
            sideSection: tools.getSideSection(type)
          }
          if(tools.singularize(type) == 'building')
            data['eras'] = tools.eras
          res.render('admin/edit.pug', data)
        })
      }
    })
  })

  app.post('/admin/:type/update/:id', tools.isLoggedIn, function(req, res) {
    var data = req.body
    var type = req.params.type
    var id = req.params.id
    var errors
    var model = tools.getModel(type)
    if(data.name) {
      var slug = slugify(data.name, {lower: true})
      data.slug = slug
    }
    if(data.images) { data.images = JSON.parse(data.images) }
    if(data.tour) { data.tour = JSON.parse(data.tour) }
    if(data.neighborhood) { data.neighborhood = JSON.parse(data.neighborhood) }
    if(data.style) { data.style = JSON.parse(data.style) }
    if(data.use) { data.use = JSON.parse(data.use) }
    if(type == 'building') {
      geocoder.geocode(data.address+', New Haven, CT 06510', function(err, location) {
        if(err) {
          console.log('Failed:')
          console.log(err)
        } else {
          console.log('Geocoded address:')
          data.coords = {
            lat : location[0].latitude,
            lng : location[0].longitude
          }
          console.log(data.coords)
          updateObject(model, data, type, id, res)
        }
      })
    } else if(type == 'tour') {
      for(var i = 0; i < data.buildings.length; i++) {
        var buildingId = data.buildings[i]
        Building.findOneAndUpdate({_id: buildingId}, {$set: {number: i}}, {new: true, runValidators: true}, function(err, object) {
          if(err) {
            console.log('Error updaing number for building '+buildingId)
            console.log(err)
          }
        })
      }
      updateObject(model, data, type, id, res)
    } else {
      updateObject(model, data, type, id, res)
    }
  })

  var updateObject = function(model, data, type, id, res) {
    model.findOneAndUpdate({_id: id}, data, {new: true, runValidators: true}, function(err, object) {
      if(!err) {
        console.log('Updated:')
        console.log(object)
        res.redirect('/admin/'+type+'/edit/'+object.slug)
      } else {
        console.log('Failed:')
        console.log(err)
        res.render('admin/edit.pug', {
          errors: err,
          loadedType: {
            s: tools.singularize(type),
            p: tools.pluralize(type)
          },
          object: object,
          action: 'update'
        })
      }
    })
  }

  app.get('/admin/:type/remove/:id', tools.isLoggedIn, function(req, res) {
    var type = req.params.type
    var id = req.params.id
    var model = tools.getModel(type)
    model.findByIdAndRemove(id, function(err, object) {
      if(err)
        return console.log(err)
      console.log(type+' successfully deleted!')
      if(type == 'image' && object.path)
        fs.unlinkSync(appRoot+'/public'+object.path);
      else
        res.redirect('/admin/')
    })
  })

  app.get('/admin/:type/quicky', tools.isLoggedIn, function(req, res) {
    var type = req.params.type
    if(!type)
      return
    var form = 'quicky'
    if(type == 'image')
      form = 'image'
    if(form)
      res.render('admin/'+form+'.pug', {
        type: type
      })
    else
      return
  })

  app.post('/admin/:type/quicky', tools.isLoggedIn, function(req, res) {
    var data = req.body
    var type = tools.singularize(req.params.type)
    var errors    
    switch(type) {
      case 'neighborhood':
        var object = new Neighborhood(data)
        break
      case 'tour':
        var object = new Tour(data)
        break
      case 'style':
        var object = new Style(data)
        break
      case 'use':
        var object = new Use(data)
        break
      case 'material':
        var object = new Material(data)
        break
      case 'structure':
        var object = new Structure(data)
        break
      case 'roofType':
        var object = new RoofType(data)
        break
      case 'roofMaterial':
        var object = new RoofMaterial(data)
        break
      case 'threat':
        var object = new Threat(data)
        break
      case 'environment':
        var object = new Environment(data)
        break
      default:
        return
    }
    object.save(function(err) {
      if(!err) {
        console.log('Created:')
        console.log(object)
        return res.json(object)
      } else {
        console.log('Failed:')
        console.log(err)
        return res.json(err)
      }
    })
  })

  app.get('/admin/image/quicky/:id', tools.isLoggedIn, function(req, res) {
    var id = req.params.id
    Image.findById(id, function(err, image) {
      res.render('admin/image.pug', {
        object: image,
        type: 'image'
      })
    })
  })

  var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, appRoot+'/public/uploads/')
    },
    filename: function (req, file, callback) {
      var datetimestamp = Date.now();
      callback(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
  })

  var upload = multer({
    storage: storage
  }).single('image')

  app.post('/admin/image/quicky/', tools.isLoggedIn, function(req, res) {
    var data = req.body

    upload(req, res, function(err) {
      if(err) {
        console.log('Failed image upload:', err)
        return res.json(err)
      }

      var imageData = req.file
      var filename = imageData.filename
      data.filename = filename
      data.original = '/uploads/'+filename
      data.medium = '/uploads/medium/'+filename
      data.small = '/uploads/small/'+filename

      gm(appRoot+'/public'+data.original).resize(500, 500).write(appRoot+'/public/'+data.medium, function (err) {
        if(err) {
          console.log('Failed medium resize:', err)
          return res.json(err)
        } else {
          console.log('Medium resize:', this)
        }
      })

      gm(appRoot+'/public'+data.original).resize(250, 250).write(appRoot+'/public/'+data.small, function (err) {
        if(err) {
          console.log('Failed small resize:', err)
          return res.json(err)
        } else {
          console.log('Small resize:', this)
        }
      })

      var image = new Image(data)
      image.save(function(err) {
        if(!err) {
          console.log('Added:')
          console.log(image)
          return res.json(image)
        } else {
          console.log(err)
          return res.json(err)
        }
      })
    })
  })

  app.post('/admin/image/quicky/:id', tools.isLoggedIn, function(req, res) {
    var data = req.body
    var id = req.params.id
    Image.findOneAndUpdate({_id: id}, data, {new: true, runValidators: true}, function(err, image) {
       if(!err) {
        console.log('Updated:')
        console.log(image)
        res.json(image)
      } else {
        console.log('Failed:')
        console.log(err)
        return res.json(err)
      }
    })
  })
}