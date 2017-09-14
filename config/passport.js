const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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
	passport.use(new TwitterStrategy({consumerKey: auth.twitterAuth.consumerKey, consumerSecret: auth.twitterAuth.consumerSecret, callbackURL: auth.twitterAuth.callbackURL}, function(key, profile, done) {
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
							return done(err);
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
            		return done(err);
            	}
			    return done(null, newUser);
            });
		});
	}));
	passport.use(new GoogleStrategy({clientID: auth.googleAuth.clientID , clientSecret: auth.googleAuth.clientSecret, callbackURL: auth.googleAuth.callbackURL} , function(accessToken, refreshToken, profile, done) {
		User.findOne({'google.id': profile.id}, function(err, user) {
			if(err) {
				return done(err);
			}
			if(user) {
				if(!user.google.accessToken) {
					user.google.accessToken = accessToken;
	                user.google.name = profile.displayName;
					user.google.email = profile.emails[0].value;

					user.save(function(err) {
						if(err) {
							return done(err);
						}
					    return done(null, user);
					});
				}
				return done(null, user);
			}
			let newUser = new User();
			//Storing access token bad?
			//Always keep user logged in
			newUser.google.id = profile.id;
			newUser.google.accessToken = accessToken;
			newUser.google.name = profile.displayName;
			newUser.google.email = profile.emails[0].value;
			newUser.google.registerDate = Date.now();

			newUser.save(function(err) {
				if(err) {
					return done(err);
				}
				return done(null, newUser);
			});
		});
	}));
	passport.use(new FacebookStrategy({clientID: auth.facebookAuth.clientID, clientSecret: auth.facebookAuth.clientSecret, callbackURL: auth.facebookAuth.callbackURL}, function(accessToken, refreshToken, profile, done) {
		User.findOne({'facebook.id' : profile.id}, function(err, user) {
			if(err) {
				return done(err);
			}
			if(user) {
				if(!user.twitter.token) {
		            newUser.facebook.token = accessToken;
		            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
		            newUser.facebook.email = profile.email;

					user.save(function(err) {
						if(err) {
							return done(err);
						}
					    return done(null, user);
					});
				}
				return done(null, user);
			}
			let newUser = new User();

			newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.email;
            newUser.facebook.registerDate = Date.now();

            newUser.save(function(err) {
            	if(err) {
            		return done(err);
            	}
			    return done(null, newUser);
            });
		});
	}));
};