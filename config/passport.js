const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
let User = require('../app/models/users');
let auth = require('../config/auth.js');

module.exports = function(passport) {
	passport.use(new LocalStrategy({ usernameField: 'email', passwordField : 'password', passReqToCallback : true }, function(req, email, password, done) {
		User.findOne({'local.email': email}, function(err, user) {
			if(err) {
				return done(err); 
			} 
			if(!user) {
				return done(null, false, {
					message: 'User not Found'
				})
			}
			if(!user.validatePassword(password)) {
				return done(null, false, {
					message: 'Incorrect Password'
				})
			}
			return done(null, user);
		});
	}));
	passport.use(new TwitterStrategy({consumerKey: auth.twitterAuth.consumerKey, consumerSecret: auth.twitterAuth.consumerSecret, callbackURL: auth.twitterAuth.callbackURL}, function(req, key, keySecret, profile, done) {
		User.findOne({'twitter.id' : profile.id}, function(err, user) {
			if(err) {
				return done(err);
			}
			if(user) {
				if(!user.twitter.token) {
					user.twitter.token = key;
	                user.twitter.username = profile.username;
					user.twitter.displayName = profile.displayName;

					user.save(function(err) {
						if(err) {
							res.json({
								'message': err
							});
						}
					    return done(null, user);
					});
				}
				return done(null, user);
			}
			let newUser = new User();

			newUser.twitter.id = profile.id;
            newUser.twitter.token = key;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;
            newUser.twitter.registerDate = Date.now();

            newUser.save(function(err) {
            	if(err) {
            		res.json({
            			'message': err
            		});
            	}
			    return done(null, newUser);
            });
		});
	}));
};