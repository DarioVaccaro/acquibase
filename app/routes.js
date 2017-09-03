const path = require('path');
const Company = require('./models/acquibase');
const User = require('./models/users');
const jwt = require('express-jwt');
let auth = jwt({
  secret: process.env.CONFIG_SR,
  userProperty: 'payload'
});

module.exports = function(app , passport) {
	app.get('/' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'index.html'));
	});
	app.get('/login' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'login.html'));
	});
	app.post('/login' , passport.authenticate('local' , {
		successRedirect : '/profile',
        failureRedirect : '/login'
	}));
	app.get('/register' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'register.html'));
	});
	app.post('/register' , passport.authenticate('local-register' , {
		successRedirect : '/profile',
        failureRedirect : '/register'
	}));
	app.get('/profile', isLoggedIn,  function(req , res) {
		res.render('profile.jade' , {
			user: req.user
		});
	});
	app.get('/logout' , function(req , res) {
		req.logout();
		res.redirect('/');
	});
	app.get('/compare' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'compare.html'));
	});
	app.get('/about' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'about.html'));
	});
	app.get('/contact' , function(req , res) {
		res.sendFile(path.join(__dirname , '../public' , 'contact.html'));
	});
	app.get('/:name' , function(req , res) {
		Company.findOne({'company.name' : req.params.name})
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
	function isLoggedIn(req , res , next) {
		// if(!req.payload._id) {
		// 	res.status(401).json({
		//       "message" : "UnauthorizedError: private profile"
		//     });
		// } else {
		// 	User.findById(req.payload._id)
  //     			.exec(function(err, user) {
  //       			res.status(200).json(user);
  //     			});
  //     		if(req.isAuthenticated()) {
		// 		return next();
		// 	} else {
		// 		res.redirect('/');
		// 	}
		// }
		if(req.isAuthenticated()) {
				return next();
			} else {
				res.redirect('/');
			}
	}
};