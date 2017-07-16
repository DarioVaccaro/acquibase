const mongoose = require('mongoose');
let acquiSchema = new mongoose.Schema({
	id: Number,
	company: {
		location: String,
		establishment: Date,
		industry: String,
		valuation: Number,
		stock: {

		},
		acquisition: {
			name: String,
			date: Date,
			price: Number,
			info: String,
			industry: {
				name: String
			}
		}
	}
});
module.exports = mongoose.model('Acqui' , acquiSchema);