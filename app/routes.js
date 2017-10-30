const path = require('path');
const jwt = require('express-jwt');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const ExpressBrute = require('express-brute');
const json2csv = require('json2csv');
const fs = require('fs');

const Company = require('./models/acquibase');
const User = require('./models/users');
const Profile = require('./models/profiles');

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
	function setProfile(user) {
		Profile.findOne({'userID': user._id} , function(err, profile) {
			if(!profile) {
				var newProfile = new Profile();
				newProfile.userID = user._id;
				newProfile.save(function(err) {
					if(err) {
						console.log(err);
					}
				});
			} else if(err) {
				console.log(err);
			}
		});
	}
	app.post('/api/login' , function(req, res) {
		passport.authenticate('local' , function(err, user, info) {
			let errorCases = {
				'Too Many Attempts': 'You have incorrectly entered your password too many times. Please reset your password <a href="/login/forgot">here</a>',
				'Incorrect Password': 'Incorrect Password',
				'User not Found': 'User not found'
			}
			if(err) {
				res.json({
					'message': err
				});
			}
			if(user) {
				user.local.passwordAttempts = undefined;
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
			} else {
				res.json({
					'message': errorCases[info.message]
				});
			}
		})(req, res);
	});
	app.get('/login/twitter', passport.authenticate('twitter'));
	app.get('/login/twitter/callback', function(req, res) {
		passport.authenticate('twitter' , {session: false} , function(err, user) {
			if(err) {
				res.json({
					'message': err
				});
			}
			setProfile(user);
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
				res.json({
					'message': err
				});
			}
			setProfile(user);
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
				res.json({
					'message': err
				});
			}
			setProfile(user);
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
					setProfile(newUser);
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
		User.findOne({ 'local.email': req.body.email}, function(err, user) {
			if(!user) {
				return res.json({
					'message': 'User not found'
				});
			}
			user.local.passwordReset.resetPasswordToken = resetToken;
			user.local.passwordReset.resetPasswordExpires = Date.now() + 3600000;
			user.save(function(err) {
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
			        // console.log('Message sent: %s', info.messageId);
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
				user.local.accountLocked = undefined;
				user.local.passwordAttempts = undefined;
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
		Company.findOne({'company.name' : req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1)})
			.then(function(company) {
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
	app.post('/api/companies', function(req , res) {
        Company.find(function(err , companys) {
	        if(err) {
	            res.send(err);
	        } else {
	        	res.json(companys);
	    	}
	    });
	});
	app.post('/api/profiles' , function(req , res) {
		User.findOne({'_id': req.body.userId} , function(err, user) {
			Profile.findOne({'userID': user._id} , function(err , profile) {
				if(err) {
					console.log(err);
				} else {
					res.json(profile);
				}
			});
		});
	});
	app.post('/api/profiles/trackCompany' , function(req , res) {
		Company.findOne({'company.name': req.body.companyName} , function(err, company) {
			Profile.findOne({'userID': req.body.userId} , function(err , profile) {
				var duplicates;
				for(i = 0; i < profile.savedCompanies.length; i++) {
					if(profile.savedCompanies[i].companyID === String(company._id)) {
						duplicates = true;
					}
				}
				if(duplicates !== true) {
					profile.savedCompanies.push({companyID: company._id});
					profile.save(function(err) {
						if(err) {
							console.log(err);
						}
						res.json({
							'company': company.company.name,
							'isTracked': true
						});
					});
				}
			});
		});
	});
	app.post('/api/profiles/isTracked' , function(req , res) {
		Profile.findOne({'userID': req.body.userId} , function(err , profile) {
			if(err) {
				console.log(err);
			}
			var companyFound = false;
			Company.findOne({'company.name': req.body.companyName} , function(err , company) {
				for(i = 0; i < profile.savedCompanies.length; i++) {
					if(String(company._id) === profile.savedCompanies[i].companyID) {
						companyFound = true;
					}
				}
				if(companyFound) {
					res.json({
						'company': company.company.name,
						'isTracked': true
					});
				} else {
					res.json({
						'isTracked': false
					});
				}
			});
		});
	});
	app.post('/api/profiles/untrackCompany' , function(req , res) {
		Company.findOne({'company.name': req.body.companyName} , function(err, company) {
			Profile.findOne({'userID': req.body.userId} , function(err , profile) {
				let removeCompany;
				for(i = 0; i < profile.savedCompanies.length; i++) {
					if(profile.savedCompanies[i].companyID === String(company._id)) {
						removeCompany = i;
					}
				}
				profile.savedCompanies.splice(removeCompany , 1);
				profile.save(function(err) {
					if(err) {
						console.log(err);
					}
					res.json({
						'isTracked': false
					});
				});
			});
		});
	});
	app.post('/api/profiles/download' , function(req , res) {
		User.findOne({'_id': req.body.download} , function(err, user) {
			if(err) {
				console.log(err);
			}
			Company.findOne({'company.name': req.body.companyName} , function(err, company) {
				if(err) {
					console.log(err);
				}
				let fieldNames = ['Company Name' , 'Valuation' , 'Location'];
				let fields = ['company.name' , 'company.stock.marketCap' , 'company.location'];
				let companyArray = [company]
				let csv = json2csv({data: companyArray , fields: fields , fieldNames: fieldNames});
				let pathName = req.url + '/' + company.company.name + '.csv';

				fs.writeFile(pathName , csv , function(err) {
					if(err) {
						console.log(err);
					}
					res.download(pathName);
				});
			});
		});
	});
	app.post('api/profiles/saveDownload' , function(req , res) {
		Company.findOne({'company.name': req.body.companyName} , function(err, company) {
			Profile.findOne({'userID': req.body.userId} , function(err , profile) {
				var duplicates;
				for(i = 0; i < profile.downloadedCompanies.length; i++) {
					if(profile.downloadedCompanies[i].companyID === String(company._id)) {
						duplicates = true;
					}
				}
				if(duplicates !== true) {
					profile.downloadedCompanies.push({companyID: company._id});
					profile.save(function(err) {
						if(err) {
							console.log(err);
						}
						res.json({
							'company': company.company.name,
							'isSaved': true
						});
					});
				}
			});
		});
	});
	app.post('/api/profiles/updateSettings' , function(req , res) {
		User.findOne({'_id': req.body.userId} , function(err, user) {
			if(req.body.email) {
				user.local.email = req.body.email;
				user.save(function(err) {
					if(err) {
						console.log(err);
					}
					var token;
					token = user.generateJwt();
				    res.status(200);
				    res.json({
				    	"token" : token
				    });
				});
			} else if(req.body.name) {
				user.local.name = req.body.name;
				user.save(function(err) {
					if(err) {
						console.log(err);
					}
					var token;
					token = user.generateJwt();
				    res.status(200);
				    res.json({
				    	"token" : token
				    });
				});
			} else if(req.body.password) {
				user.local.password = user.setPassword(req.body.password);
				user.save(function(err) {
					if(err) {
						console.log(err);
					}
					var token;
					token = user.generateJwt();
				    res.status(200);
				    res.json({
				    	"token" : token
				    });
				});
			} else {
				console.log(err);
			}
		});
	});
	app.get('*' , function(req, res) {
		res.render('404.jade');
	});
};