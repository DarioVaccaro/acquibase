const path = require('path');
//Change company to acquibase
const Company = require('./models/acquibase');

module.exports = function(app) {

	app.get('/api/companys', function(req, res) {
	    // use mongoose to get all nerds in the database
        Company.find(function(err, companys) {
            // if there is an error retrieving, send the error. Nothing after res.send(err) will execute
	        if(err) {
	            res.send(err);
	        } else {
	        	res.json(companys); // return all nerds in JSON format
	    	}
	    });
	});

	app.get('/' , function(req , res) {
		res.sendFile(path.join(__dirname , './public' , 'index.html'));
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
	app.get('/:name' , function(req, res) {
		Company.findOne({'company.name' : req.params.name})
			.then(function(company) {
				if (company) {
					res.render('company.jade');
					return;
				} else {
					// res.type('txt').send('Not Found');
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
};