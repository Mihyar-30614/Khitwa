var express    = require('express');
var app        = express();
var mongoose   = require('mongoose');
var passport   = require('passport');
var dbc        = process.env.NODE_ENV === 'test'? 'mongodb://127.0.0.1/Khitwa-test' : 'mongodb://127.0.0.1/Khitwa';
var mongoURI   =  process.env.MONGODB_URI || dbc;
var port       = process.env.PORT || 8000;

mongoose.connect(mongoURI);
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
	next();
});

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);
require('./passport/passport.js')(app, passport);

app.listen(port, function () {
	console.log('Connecting to DataBase: '+dbc.substr(20));
  	console.log('app listening on port ' + port);
});
module.exports = app;