module.exports = {
  port: {
  	production: 80,
  	development: 8080,
  	test: 80
  },
  db: {
	  production: 'mongodb://heroku_9lc8j8h8:3p9j6i3d186egmg131vfqrjgb7@ds029735.mlab.com:29735/heroku_9lc8j8h8',
	  development: 'localhost:27017/new-haven-building-archive',
	  test: 'localhost:27017/new-haven-building-archive'
	}
};