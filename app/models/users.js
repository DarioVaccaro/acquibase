const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
	local: {
		email: String,
		name: String,
		password: String
	}
});
userSchema.methods.setPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
userSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}
module.exports = mongoose.model('User' , userSchema);