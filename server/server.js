var express = require('express');
var mongoose = require('mongoose');

// Change between two databases for testing 
var dbc = process.env.NODE_ENV === 'test'? 'mongodb://localhost/Khitwa-test' : 'mongodb://localhost/Khitwa';
var mongoURI =  process.env.MONGODB_URI || dbc;

mongoose.connect(mongoURI);

var app = express();
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
	next();
});

// configure our server with all the middleware and routing
var port = process.env.PORT || 8000;

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);
// start listening to requests on port 8000

app.listen(port, function () {
  console.log('app listening on port ' + port);
});

// export our app for testing and flexibility, required by index.js
module.exports = app;