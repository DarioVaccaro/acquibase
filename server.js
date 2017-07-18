const express 				= require('express');
const app 					= express();
const bodyParser 			= require('body-parser');
const methodOverride 		= require('method-override');
const mongoose 				= require('mongoose');

const db = require('./config/db.js');
let port = process.env.PORT || 3000;

mongoose.connect(db.url);

app.set('view engine' , 'jade');

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended : true }));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static( __dirname + '/public' ));

require('./app/routes.js')(app);

app.listen(port);
console.log('Magic happens on ' + port);
exports = module.exports = app;