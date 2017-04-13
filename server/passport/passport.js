var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
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
	    			"active"   : profile._json.verified,
	    			"picture"  : 'http://graph.facebook.com/' + profile._json.id + '/picture?type=large&w‌​idth=480&height=480'
	    		});
	    		// save new user
	    		user.save(function (error, saved) {
	    			return done(null, saved);
	    		});
	    	}
	    })
	  }
	));

	passport.use(new TwitterStrategy({
	    consumerKey: API.TWITTER.CONSUMER_KEY,
	    consumerSecret: API.TWITTER.CONSUMER_SECRET,
	    callbackURL: API.TWITTER.LINK + '/auth/twitter/callback',
	    userProfileURL : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true'
	  },
	  function(token, tokenSecret, profile, done) {
	    User.findOne({email: profile.emails[0].value.toLowerCase()}).exec(function (error, user) {
	    	if (user && user != null) {
	    		//login
	    		return done(null, user);
	    	}else{
	    		// create new user
	    		var password = crypto.randomBytes(5).toString('hex');
	    		var name = profile.displayName.split(" ");
	    		var user = new User({
	    			"username" : profile.id,
	    			"password" : password,
	    			"email"    : profile.emails[0].value,
	    			"firstName": name[0],
	    			"lastName" : name[1],
	    			"active"   : true,
	    			"picture"  : 'http://www.twitter.com/'+ profile.username + '/profile_image?size=original'
	    		});
	    		// save new user
	    		user.save(function (error, saved) {
	    			return done(null, saved);
	    		});
	    	}
	    })
	  }
	));
	// Facebook routes
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/#/login' }), function (req, res) {
		res.redirect('/#/facebook/'+ token)
	});
	// Twitter Routes
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/#/login' }), function (req, res) {
		res.redirect('/#/twitter/' + token)
	});
}
