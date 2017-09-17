const path = require('path');
const jwt = require('express-jwt');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const Company = require('./models/acquibase');
const User = require('./models/users');

let auth = jwt({
  secret: process.env.CONFIG_SR,
  requestProperty: 'payload'
});

module.exports = function(app , passport) {
	function profileCheck(req , res , next) {
		if(!req.payload._id) {
			res.status(401).json({
		      "message" : "UnauthorizedError: private profile"
		    });
		} else {
			User.findById(req.payload._id)
      			.exec(function(err, user) {
        			res.status(200).json(user);
      			});
		}
	}
	app.post('/api/login' , function(req, res) {
		passport.authenticate('local' , function(err, user, info) {
			if(err) {
				res.json({
					'message': err
				});
			} 
			if(user) {
				var token;
				token = user.generateJwt();
			    res.status(200);
			    res.json({
			    	"token" : token
			    });
			} else if(info.message === 'Incorrect Password') {
				res.json({
					'message': 'Incorrect Password'
				});
			} else if(info.message === 'User not Found') {
				res.json({
					'message': 'User not found'
				});
			}
		})(req, res);
	});
	app.get('/login/twitter', passport.authenticate('twitter'));
	app.get('/login/twitter/callback', function(req, res) {
		passport.authenticate('twitter' , {session: false} , function(err, user) {
			if(err) {
				console.log(err);
			}
			var token;
			token = user.generateTwitterJwt();
		    res.cookie('jwt' , token);
		    res.render('social-login.jade');
		})(req, res);
	});
	app.get('/login/google' , passport.authenticate('google' , { scope : ['profile', 'email'] }));
	app.get('/login/google/callback' , function(req, res) {
		passport.authenticate('google' , {session: false} ,function(err, user) {
			if(err) {
				console.log(err);
			}
			var token;
			token = user.generateGoogleJwt();
			res.cookie('jwt' , token);
			res.render('social-login.jade');
		})(req, res);
	});
	app.get('/login/facebook' , passport.authenticate('facebook' , { scope : 'email' }));
	app.get('/login/facebook/callback' , function(req, res) {
		passport.authenticate('facebook' , {session: false} ,function(err, user) {
			if(err) {
				console.log(err);
			}
			var token;
			token = user.generateFacebookJwt();
			res.cookie('jwt' , token);
			res.render('social-login.jade');
		})(req, res);
	});
	app.post('/api/register' , function(req, res) {
		User.findOne({'local.email': req.body.email}, function(err, user) {
			if(err) {
				return res.json({
					'message': err
				});
			}
			if(user) {
				return res.json({
					'message': 'User already exists'
				});
			} else {
				var newUser = new User();

				newUser.local.email = req.body.email;
				newUser.local.name = req.body.name;
				newUser.local.password = newUser.setPassword(req.body.password);
				newUser.local.registerDate = Date.now();
				newUser.save(function(err) {
					var token;
					token = newUser.generateJwt();
					res.status(200);
					res.json({
						'token': token
					});
				});
			}
		});
	});
	app.get('/api/profile', auth, profileCheck);
	app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/compare', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/contact', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/about', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/login', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/login/forgot', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/register', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.post('/api/forgot', function(req, res, next) {
		let resetToken;
		crypto.randomBytes(20, function(err, buf) {
			resetToken = buf.toString('hex');
		});
		console.log(req.body.email);
		User.findOne({ 'local.email': req.body.email}, function(err, user) {
			if(!user) {
				return res.json({
					'message': 'User not found'
				});
			}
			user.local.passwordReset.resetPasswordToken = resetToken;
			user.local.passwordReset.resetPasswordExpires = Date.now() + 3600000;
			user.save(function(err) {
				console.log(user);
				if(err) {
					res.json({
						'message': err
					});
				}
				let smtpConfig = nodemailer.createTransport({
					host: 'mail.privateemail.com',
				    port: 465,
				    secure: true,
					auth: {
						user: 'forgot@acquibase.com',
						pass: 'NewTest'
					}
				});
				let mailOptions = {
					to: req.body.email,
					from: 'forgot@acquibase.com',
					subject: 'Password Reset For AcquiBase',
					text: 'Visit the link below to reset your password. This link will expire in 1 hour. If you do not recognize this email, please ignore it and your password will not change.' + 'http://127.0.0.1:3000/login/reset/' + resetToken
				};
				smtpConfig.sendMail(mailOptions, function(err, info) {
					if (err) {
			            return console.log(err);
			        }
			        console.log('Message sent: %s', info.messageId);
			        res.json({
			        	'message': 'Check your email for password reset link'
			        });
				});
			});
		});
	});
	app.get('/login/reset/:resetToken', function(req, res) {
		User.findOne({'local.passwordReset.resetPasswordToken': req.params.resetToken, 'local.passwordReset.resetPasswordExpires': { $gt: Date.now() }}, function(err, user) {
			if(!user) {
				res.render('expired.jade');
			} else {
				res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
			}
		});
	});
	app.post('/api/reset/:resetToken', function(req, res) {
		passport.authenticate('local' , function(err, user, info) {
			User.findOne({'local.passwordReset.resetPasswordToken': req.params.resetToken, 'local.passwordReset.resetPasswordExpires': { $gt: Date.now() }}, function(err, user) {
				if(err) {
					res.json({
						'message': err
					});
				}
				if(!user) {
					res.json({
						'message': 'Password reset token is invalid or has expired.'
					});
				}
				user.local.passwordReset.resetPasswordToken = undefined;
				user.local.passwordReset.resetPasswordExpires = undefined;
				user.local.password = user.setPassword(req.body.password);
				user.save(function(err) {
					if(err) {
						res.json({
							'message': err
						});
					}
					var token;
					token = user.generateJwt();
				    res.status(200);
				    res.json({
				    	"token" : token
				    });
				});
			});
		})(req, res);
	});
	app.get('/profile', function(req, res) {
		res.sendFile(path.join(__dirname , '../public' , 'dashboard.html'));
	});
	app.get('/company/:name' , function(req , res) {
		Company.findOne({'company.name' : req.params.name})
			.then(function(company) {
				// if(company === company.charAt(0).toUpperCase() + company.slice(1)) {
				// 	company = company[0].toUpperCase() + company.slice(1);
				// }
				if (company) {
					res.render('company.jade');
					return;
				} else {
					res.render('404.jade');
					return;
				}
			})
			.catch(function(err) {
				if (err) {
					res.send({sucess: false, error: err});
				}
			});
	});
	app.get('/api/companies', function(req , res) {
        Company.find(function(err , companys) {
	        if(err) {
	            res.send(err);
	        } else {
	        	res.json(companys);
	    	}
	    });
	});
	app.get('*' , function(req, res) {
		res.render('404.jade');
	});
};