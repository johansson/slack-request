var express = require('express');
var router = express.Router();
var config = require('../config');

router.get('/', function (req, res) {
    res.render('success', { title: 'Success', slack_name: config.slack_name });
});

module.exports = router;
