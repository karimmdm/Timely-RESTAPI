const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'API is working',
        messege: 'Hello World with Express and Nodemon'
    });
});


module.exports = router;