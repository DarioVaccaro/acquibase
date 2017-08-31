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
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
userSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}
//Generate a Secret before shipping
// userSchema.methods.generateJWT = function() {
// 	let expire = new Date();
// 	expire.setDate(expire.getDate() + 7);
// 	return jwt.sign({
// 		_id: this._id,
// 		email: this.email,
// 		name: this.name,
// 		exp: parseInt(expire.getTime() / 1000),
// 	}, process.env.CONFIG_SR);
// }
module.exports = mongoose.model('User' , userSchema);