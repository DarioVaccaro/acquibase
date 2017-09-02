const express 				= require('express');
const app 					= express();
const path 					= require('path');
const favicon 				= require('serve-favicon');
const bodyParser 			= require('body-parser');
const methodOverride 		= require('method-override');
const mongoose 				= require('mongoose');
const passport 				= require('passport');
const session     			= require('express-session');

const db = require('./config/db.js');

let port = process.env.PORT || 3000;

mongoose.connect(db.url);
require('./config/passport.js')(passport);

app.set('view engine' , 'jade');

app.use(favicon(path.join(__dirname, 'public', 'img/favicon.png')));

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended : true }));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(session({ secret: db.secret }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static( __dirname + '/public' ));

require('./app/routes.js')(app , passport);

app.listen(port);
console.log('Magic happens on ' + port);
exports = module.exports = app;