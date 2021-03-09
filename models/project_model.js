const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
	{
        user_id: { type: String, required: true },
        title: {type: String, required: true},
        description: {type: String, required: false},
        tasks: []
	},
	{ collection: 'projects' }
)
module.exports = mongoose.model('project', projectSchema);

