const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
        google_id: { type: Number, required: true },
        name: { type: String, required: true},
        email: {type: String, required: true},
        phone: {type: Number},
        projects: [],
        tasks: []
	},
	{ collection: 'users' }
)

module.exports = mongoose.model('user', userSchema);
