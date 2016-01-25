var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { activePage: 'home', title: 'Sign up for '.concat(config.slack_name), slack_name: config.slack_name });
});

module.exports = router;
