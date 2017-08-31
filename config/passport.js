const LocalStrategy = require('passport-local').Strategy;
let User = require('../app/models/users');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
	passport.use('local-register' , new LocalStrategy({ usernameField: 'email', passwordField : 'password', passReqToCallback : true }, function(req, email, password, done) {
		process.nextTick(function() {
			User.findOne({'local.email': email}, function(err, user) {
				if(err) {
					return done(err); 
				}
				if(user) {
					return done(null, false, {
						message: 'Email already taken'
					})
				} else {
					let newUser = new User();
					newUser.local.email = email;
					newUser.local.name = req.body.name;
					newUser.local.password = newUser.setPassword(password);
					newUser.save(function(err) {
		                if (err) {
		                    throw err;
		                }
		                return done(null, newUser);
		            });
				}
			});
		});
	}));
	passport.use('local-login', new LocalStrategy({ usernameField: 'email', passwordField : 'password', passReqToCallback : true }, function(req, email, password, done) {
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