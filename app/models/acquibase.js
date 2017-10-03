const mongoose = require('mongoose');
let companySchema = new mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
	company: {
		name: String,
		location: String,
		foundedOn: Date,
		industry: String,
		incorporated: Boolean,
		stock: {
			marketCap: Number,
			symbol: String,
			allTimeHigh: {
				quote: Number,
				date: Date
			},
			historicalPrice: [
				{
					date: Date,
					close: Number
				}
			]
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