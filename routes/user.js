const express = require('express');
const router = express.Router();
const { createUser, loginUser} = require('../controllers/user');

router.post('/', createUser);   
router.post('/login', loginUser); // Assuming you have a loginUser function in your controllers/user.js

module.exports = router;