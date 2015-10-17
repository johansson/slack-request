var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET what is slack page. */
router.get('/', function (req, res, next) {
    res.render('whatisslack', { title: 'What is Slack?' });
});

module.exports = router;