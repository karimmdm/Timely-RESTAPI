const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
	{
        project_id: { type: String, required: true },
        user_id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: false } ,
        dueDate: { type: Date, required: true },
        complete: { type: Boolean, default: false }
	},
	{ collection: 'tasks' }
)
module.exports =  mongoose.model('task', taskSchema);
