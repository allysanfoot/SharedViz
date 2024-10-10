const express = require('express');
const router = express.Router();

// This is the route that will be used to check if the server is up and running
router.get('/', (req, res) => {
    res.send('The server is up and running!');
});

module.exports = router;