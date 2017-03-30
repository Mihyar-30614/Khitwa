var FacebookStrategy = require('passport-facebook').Strategy;
var User             = require('../users/userModel');
var session          = require('express-session');
var crypto           = require('crypto');
var jwt              = require('jsonwebtoken');
var API              = require('../config/api');
var secret           = 'what lies beneath the sea';

module.exports = function (app, passport) {

	app.use(passport.initialize());
	app.use(passport.session());	
	app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

	passport.serializeUser(function(user, done) {
	    token = jwt.sign({ username : user.username, email: user.email, _id : user._id}, secret , {expiresIn : '4h'});
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

	passport.use(new FacebookStrategy({
	    clientID: API.FACEBOOK.CLIENTID,
	    clientSecret: API.FACEBOOK.CLIENTSECRET,
	    callbackURL: API.FACEBOOK.LINK + '/auth/facebook/callback',
	    enableProof: true,
	    profileFields: ['id', 'email', 'first_name', 'verified','last_name']
	},
	function(accessToken, refreshToken, profile, done) {
		// console.log(profile._json)
		//find the user based off of the facebook profile id
	    User.findOne({email: profile._json.email}).exec(function (error, user) {
	    	if (user && user != null) {
	    		//login
	    		return done(null, user);
	    	}else{
	    		// create new user
	    		var password = crypto.randomBytes(5).toString('hex');
	    		var user = new User({
	    			"username" : profile._json.id,
	    			"password" : password,
	    			"email"    : profile._json.email,
	    			"firstName": profile._json.first_name,
	    			"lastName" : profile._json.last_name,
	    			"active"   : profile._json.verified
	    		})
	    		// save new user
	    		user.save(function (error, saved) {
	    			return done(null, saved);
	    		});
	    	}
	    })
	  }
	));
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
	// app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/#/main', failureRedirect: '/login' }))
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
		console.log('redirect to facebook')
		res.redirect('/#/facebook/'+ token)
	});
}
