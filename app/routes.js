const path = require('path');
const Company = require('./models/acquibase');
const User = require('./models/users');
const jwt = require('express-jwt');
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
	app.get('/:name' , function(req , res) {
		Company.findOne({'company.name' : req.params.name})
			.then(function(company) {
				if (company) {
					res.render('company.jade');
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
	    // use mongoose to get all documents in the database
        Company.find(function(err , companys) {
	        if(err) {
	            res.send(err);
	        } else {
	        	res.json(companys); // return all documents in JSON format
	    	}
	    });
	});
};