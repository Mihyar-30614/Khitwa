var express = require('express');
var mongoose = require('mongoose');

var dbc = process.env.NODE_ENV === 'test'? 'mongodb://localhost/Khitwa-test' : 'mongodb://localhost/Khitwa';
var mongoURI =  process.env.MONGODB_URI || dbc;
mongoose.connect(mongoURI);
db = mongoose.connection;

db.once('open',function () {
	console.log('mongoDB is open', dbc);
});

// start listening to requests on port 8080

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

//Kills server connection if it crashes or killed
//this is important so not to keep the 8000 port busy
//If the app crashes
app.on('uncaughtException', function(){
	//Close connection
	server.close();
})
// On kill
app.on('SIGTERM', function(){
	server.close();
})
//On exit
app.on('exit', function(){
	server.close();
})

// export our app for testing and flexibility, required by index.js
module.exports = app;