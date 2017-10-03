const mongoose = require('mongoose');
let profileSchema = new mongoose.Schema({
	userID: mongoose.Schema.Types.ObjectId,
	savedCompanies: [{
		companyID: String
	}],
	downloadedCompanies: [{
		companyID: Number
	}]
});

module.exports = mongoose.model('Profile' , profileSchema);