const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
let User = require('../app/models/users');

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
};