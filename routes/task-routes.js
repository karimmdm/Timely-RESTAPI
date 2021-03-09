const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../models/task_model');
const Project = require('../models/project_model');
const User = require('../models/user_model');


router.post("/add", async (req, res) => {
    // const userId = req.params.user_id;
    const userId = req.body.userId;
    const projectId = req.body.projectId;

    if(userId && mongoose.isValidObjectId(userId) && projectId && mongoose.isValidObjectId(projectId)){
        const title = req.body.title;
        const description = req.body.description;
        const dueDate = req.body.dueDate;

        //TODO: validate task inputs inputs
        const pquery = Project.findOne({ _id: projectId, user_id: userId});
        const uquery = User.findOne({_id: userId});
        const foundProject = await pquery;
        const foundUser = await uquery;

        if(!foundProject || !foundUser){
            res.status(404);
            res.json({message: "unable to find project or user"})
            return;
        }

        const task = new Task();
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.project_id = projectId;
        task.user_id = userId;

        //update proect and user
        foundProject.tasks.push( {_id: task._id, title: task.title, dueDate: task.dueDate} );
        foundUser.tasks.push( {_id: task._id, project_id: foundProject._id, title: task.title, dueDate: task.dueDate} );
        await task.save(function (err){
            if(err){
                res.status(500);
                res.send(err);
                return;
            }
        });

        await foundProject.save(function (err){
            if(err){
                res.status(500);
                res.send(err);
                return;
            }
        });

        await foundUser.save(function (err){
            if(err){
                res.status(500);
                res.send(err);
                return;
            }
        });
        // console.log(foundProject, foundUser);
        res.status(201);
        res.json(foundUser);
        return;
    }
    res.status(404);
    res.json({message:'invalid user Id or project Id'});
    return;
});

router.get('/get/:taskId', async(req, res) => {
    const taskId = req.params.taskId;

    if(taskId && mongoose.isValidObjectId(taskId)){
        const query = Task.findOne( {_id: taskId});
        const foundTask = await query;
        if(!foundTask){
            res.status(404);
            res.json({message: "task does not exist"})
            return;
        }
        res.status(200);
        res.json(foundTask);
        return;
    }
    res.status(404);
    res.json({message:'invalid task id'});
    return;
});

router.get('/getByProject/:projectId', async(req, res) => {
    const projectId = req.params.projectId;

    if(projectId && mongoose.isValidObjectId(projectId)){
        const query = Task.find( {project_id: projectId}).sort({dueDate: 1});
        const docs = await query;
        res.status(200);
        res.json(docs);
        return;
    }
    res.status(404);
    res.json({message:'invalid project id'});
    return;
});

router.get('/getByUser/:userId', async(req, res) => {
    const userId = req.params.userId;

    if(userId && mongoose.isValidObjectId(userId)){
        const query = Task.find( {user_id: userId}).sort({dueDate: 1});
        const docs = await query;
        res.status(200);
        res.json(docs);
        return;
    }
    res.status(404);
    res.json({message:'invalid user id'});
    return;
});

router.delete('/delete/:taskId', async(req, res) => {
    const taskId = req.params.taskId;
    if(taskId && mongoose.isValidObjectId(taskId)){
        const query = Task.findByIdAndDelete(taskId);
        const foundTask = await query;
        console.log(foundTask)
        // delete from users projects list if task exists
        if(!foundTask){
            res.status(404);
            res.json({message: 'task not found'});
            return;
        }

        const projectQuery = Project.findOneAndUpdate( 
            {_id: foundTask.project_id}, 
            {$pull: {tasks: {_id: foundTask._id}} },
            {multi: true},
            function(err, status) {
                if(err) console.log(err);
            }
        );

        const foundProject = await projectQuery;
        foundProject.save();
        
        const userQuery = User.findOneAndUpdate( 
            {_id: foundTask.user_id}, 
            {$pull: {tasks: {_id: foundTask._id}} },
            {multi: true},
            function(err, status) {
                if(err) console.log(err);
            }
        );

        const foundUser = await userQuery;
        foundUser.save();

        res.status(200);
        res.json(foundUser);
        return;
    }
    res.status(404);
    res.json({message:'invalid task id'});
    return;
});

module.exports = router;