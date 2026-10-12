const express = require('express');
const router = express.Router();
const Url = require('../models/url');   
const {createShortUrl, getAnalytics} = require('../controllers/url');

router.get('/:shortID/analytics', getAnalytics);
router.post('/', createShortUrl);


module.exports = router;