const mongoose = require('mongoose');
mongoose.set('debug', true);
let companySchema = new mongoose.Schema({
	id: Number,
	company: {
		name: String,
		location: String,
		foundedOn: Date,
		industry: String,
		incorporated: Boolean,
		stock: {
			marketCap: Number,
			historicalPrice: [{
				date: Date,
				price: Number
			}]
		},
		acquisition: [{
			name: String,
			date: Date,
			acquisitionPrice: Number,
			infoLink: String,
			industry: [String]
		}]
	}
});
module.exports = mongoose.model('Company' , companySchema);