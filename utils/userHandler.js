const mongoose = require('mongoose');
const User = require('../models/user_model');
const Project = require('../models/project_model');
const Task = require('../models/task_model');

const upsertUser = async (query, update, options) => {
    //function to upsert the user
    return User.findOneAndUpdate(query, update, options);
}

const findUser = async (userId) => {
    return User.findOne(userId);   
}



module.exports = {upsertUser}