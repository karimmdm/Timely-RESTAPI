const express = require('express');
const router = express.Router();
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const userHandler = require('../utils/userHandler');

router.post("/google", async (req, res) => {
    // get jwt payload from google
    const { token }  = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    // console.log(ticket);
    const payload = ticket.getPayload();  
    // console.log(payload);

    // upsert user to our database
    var query = { google_id: payload['sub'] },
        update = { name: payload['name'], email: payload['email']},
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const result  = await userHandler.upsertUser(query, update, options);
    
    if(!result){
        res.status(500);
        res.json({message: 'there was an error logging in the user'});
        return;
    }

    // create the All Tasks project
    




    res.status(201);
    res.json(result);
    result.save;
    return;

    // User.findOneAndUpdate(query, update, options, (error, result) => {
    //     if(error){
    //         res.json(error);
    //         return;
    //     }
    //     console.log(result)
    //     res.status(201);
    //     res.json(result);
    //     result.save();
    // });
});

//middleware to check if user is signed in

router.delete("/logout", async (req, res) => {
    res.status(200);
    res.json({
        message: "logged out successfully"
    });
});

module.exports = router;