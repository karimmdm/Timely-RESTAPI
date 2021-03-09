const express = require('express');
const router = express.Router();
const Project = require('../models/project_model');
const User = require('../models/user_model');
const Task = require('../models/task_model');
const mongoose = require('mongoose');

router.post("/add", async (req, res) => {
    const userId = req.body.userId;
    const title = req.body.title;
    const description = req.body.description;
 
    //TODO: validate project inputs
    const query = User.findOne({ _id: userId});
    const foundUser = await query; 
    if(!foundUser){
        res.status(404);
        res.json({message: "unable to find user"})
        return;
    }

    const project = new Project();
    project.user_id = userId;
    project.title = title;
    project.description = description;

    foundUser.projects.push({_id : project._id, title: project.title});

    await project.save(function (err){
        if(err){
            res.status(500);
            res.send(err);
            return;
        }
    });

    await foundUser.save(function (err){
        if(err){
            res.status(500)
            res.send(err);
            return;
        }
    })
   

    res.status(201);
    res.json(foundUser);
    return;
});


router.get('/get', async(req, res) => {
    const projectId = req.query.projectId;
    if(projectId != null){
        const query = Project.find( {_id: projectId});
        const docs = await query;
        if(docs.length === 0 || docs.length > 1){
            res.status(204);
            return;
        }
        const foundProject = docs[0];
        res.status(200);
        res.json(foundProject);
        return;
    }
});

router.delete('/delete/:projectId', async(req, res) => {
    const projectId = req.params.projectId;

    if(projectId && mongoose.isValidObjectId(projectId)){
        // const projectQuery = Project.findOneAndDelete( {_id: projectId});
        const projectQuery = Project.findOneAndDelete( {_id: projectId});
        const foundProject = await projectQuery;
        if(!foundProject){
            res.status(205);
            res.json({error: "project does not exist"})
            return;
        }

        // // delete from users projects list
        const userQuery = User.findOneAndUpdate( 
            {_id: foundProject.user_id}, 
            {
                $pull: {projects: {_id: foundProject._id}} 
            },
            {multi: true},
            function(err, status) {
                if(err) console.log(err);
            }
        );
        var foundUser = await userQuery;
        foundUser.save();

        const userQuery2 = User.findOneAndUpdate( 
            {_id: foundProject.user_id}, 
            {
                $pull: {tasks: {project_id: foundProject._id}} 
            },
            {multi: true},
            function(err, status) {
                if(err) console.log(err);
            }
        );

        foundUser = await userQuery2;
        foundUser.save();

        // delete the tasks of this project
        const taskQuery = Task.deleteMany({project_id: foundProject._id});
        const docs = await taskQuery;

        res.status(200);
        res.json(foundUser);
        return;
    }
    res.status(404);
    res.json({message:'invalid project id'});
    return;
});

router.delete('/syncprojects/:userId', async(req,res) => {
    const userId = req.params.userId;
    const query = User.findOne({ _id: userId});
    const foundUser = await query; 

    if(!foundUser){
        res.status(205);
        res.send({error: "could not find user"});
        return;
    }

    for(let i = 0; i < foundUser.projects.length; i++){
        let elem = foundUser.projects[i];
        const query2 = Project.findOne( {_id: elem.id} );
        const doc = await query2;
        if (!doc){
            foundUser.projects.splice(i);
        }
    }

    foundUser.save();
    res.status(200);
    res.json(foundUser);

});

router.delete('/deletall/:userId', async(req,res) => {
    const userId = req.params.userId;
    const query = User.findOne({ _id: userId});
    const foundUser = await query; 

    if(!foundUser){
        res.status(205);
        res.send({error: "could not find user"});
        return;
    }

    const query2 = Project.deleteMany( {user_id: foundUser._id} );
    const docs = await query2;
    // console.log(docs);

    foundUser.projects = [];
    foundUser.markModified('projects');

    foundUser.save();
    res.status(200);
    res.json(foundUser);

});




module.exports = router;