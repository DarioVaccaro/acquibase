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
				return res.json({
					'message': err
				});
			} if(user) {
				var token;
				token = user.generateJwt();
				if(token === undefined) {
					res.status(500);
					res.redirect('/login');
				}
			    res.status(200);
			    res.json({
			    	"token" : token
			    });
			} else {
				return res.json({
					'message': 'User not found'
				});
			}
		})(req, res);
	});
	app.get('/login/twitter', passport.authenticate('twitter'));
	app.get('/login/twitter/callback', function(req, res) {
		passport.authenticate('twitter' , function(err, user, info) {
			console.log(user);
			if(err) {
				res.json({
					'message': err
				});
			}
			var token;
			token = user.generateTwitterJwt();
			user.twitter.genToken = token;
			user.save(function(err) {
				if(err) {
					res.json({
						'message': err
					});
				}
				res.redirect('/login/twitter/' + token);
			});
		})(req, res);
	});
	app.get('/login/twitter/:jwtToken', function(req, res) {
		User.findOne({'twitter.genToken': req.params.jwtToken}, function(err, user) {
			if(user.twitter.genToken === undefined) {
				res.json({
					'message': err
				});
			}
			user.twitter.genToken = undefined;
			user.save(function(err) {
				if(err) {
					res.json({
						'message': err
					});
				}
				res.render('login.jade');
			});
		});
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
					// passport.authenticate('local',{ session: false }, function(req, res) {});
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
		async.waterfall([
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
					resetToken = buf.toString('hex');
					done(err, resetToken);
				});
			},
			function(resetToken, done) {
				User.findOne({ 'local.email': req.body.email}, function(err, user) {
					if(!user) {
						return res.json({
							'message': 'User not found'
						});
					}
					user.resetPasswordToken = resetToken;
					user.resetPasswordExpires = Date.now() + 3600000;

					user.save(function(err) {
						done(err, resetToken, user);
					});
				});
			},
			function(resetToken, user, done) {
				let smtpConfig = nodemailer.createTransport({
					host: 'mail.privateemail.com',
				    port: 587,
				    secure: false,
					auth: {
						user: 'forgot@acquibase.com',
						pass: '5CyKZJbGZgzehyLCv76p'
					}
				});
				let mailOptions = {
					to: user.email,
					from: 'forgot@acquibase.com',
					subject: 'Password Reset For AcquiBase',
					text: 'Reset this shit'
				};
				smtpConfig.sendMail(mailOptions, function(err, info) {
					if(err) {
						res.json({
							'message': err,
							'info': info
						});
					}
					res.json({
						'message': 'Click the link in the email we just sent to reset your password'
					});
				});
			}
		]);
	});
	app.get('/login/forgot/:resetToken', function(req, res) {
		User.findOne({resetPasswordToken: req.params.resetToken, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
			if(!user) {
				return res.json({
					'message': 'Password reset token is invalid or has expired.'
				});
			}
		});
	});
	app.post('/login/forgot/:resetToken', function(req, res) {
		User.findOne({resetPasswordToken: req.params.resetToken, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			user.save(function(err) {
				passport.authenticate('local' , function(err, user, info) {
					if(err) {
						return res.json({
							'message': err
						});
					} if(user) {
						var token;
						token = user.generateJwt();
					    res.status(200);
					    res.json({
					    	"token" : token
					    });
					} else {
						return res.json({
							'message': 'User not found'
						});
					}
				})(req, res);
			});
		});
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
};