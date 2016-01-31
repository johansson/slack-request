var express = require('express');
var util = require('util');
var xssFilters = require('xss-filters');
var router = express.Router();
var config = require('../config');

function to_error_dict(obj) {
    var err_dict = {};
    for (i in obj) {
        err_dict[obj[i].param] = { msg: obj[i].msg, value: obj[i].value }
    }
    return err_dict;
}

function checkBody(req) {
  req.checkBody('firstName', ' (required)').notEmpty();
  req.checkBody('lastName', ' (required)').notEmpty();
  req.checkBody('email', ' (invalid e-mail)').notEmpty().isEmail();
  req.checkBody('handle', ' (required)').notEmpty();
  req.checkBody('desc', ' (required)').notEmpty();
  req.checkBody('conditional', config.conditional_error).notEmpty();
  req.checkBody('codeOfConduct', 'You must agree to the Code of Conduct').notEmpty();
  req.checkBody('g-recaptcha-response', 'You must pass reCAPTCHA').notEmpty();
}

function sanitizeBody(req) {
  req.body.firstName = xssFilters.inHTMLData(req.sanitizeBody('firstName').toString().trim());
  req.body.lastName = xssFilters.inHTMLData(req.sanitizeBody('lastName').toString().trim());
  req.body.email = req.sanitizeBody('email').normalizeEmail();
  req.body.handle = xssFilters.inHTMLData(req.sanitizeBody('handle').toString().trim());
  req.body.desc = xssFilters.inHTMLData(req.sanitizeBody('desc').toString());
  req.body.conditional = req.sanitizeBody('conditional').toBoolean();
  req.body.codeOfConduct = req.sanitizeBody('codeOfConduct').toBoolean();
}

function assembleInfo(req) {
  return {
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "email": req.body.email,
    "handle": req.body.handle,
    "desc": req.body.desc,
    "conditional": req.body.conditional,
    "codeOfConduct": req.body.codeOfConduct,
    "date": new Date()
  }
}

router.get('/', function (req, res) {
  var viewModel = {
    activePage: 'signup',
    errors: {},
    title: 'Sign up for '.concat(config.slack_name),
    signup_description: config.signup_description,
    conditional: config.conditional,
    code_of_conduct: config.code_of_conduct,
    slack_name: config.slack_name,
    recaptcha_sitekey: config.recaptcha_sitekey
  }
  res.render('signup', viewModel);
});

router.post('/', function (req, res) {
    checkBody(req);
    sanitizeBody(req);

    var recaptcha = xssFilters.inHTMLData(req.sanitizeBody('g-recaptcha-response').toString());
    var errors = req.validationErrors();
    var info = assembleInfo(req);

    require('request').post({
        url: 'https://www.google.com/recaptcha/api/siteverify',
        form: { secret: config.recaptcha_secret, response: recaptcha }}, function (r_err, r_res, r_body) {
            r_body = JSON.parse(r_body);

            if (!r_body.success) {
              errors['g-recaptcha-response'] = { msg: 'You must pass reCAPTCHA' };
            }
        });

    if (!errors) {
        var db = req.db;
        var signups = db.get('signups');
        signups.insert(info, function (err, doc) {
            if (err) {
                res.status(500).send("There was a problem, please try again (refresh or go back). ".concat(err));
            } else {
                res.redirect(303, '/success');
            }
        });
    } else {
      var viewModel = {
        activePage: "signup",
        errors: to_error_dict(errors),
        title: "Sign up for ".concat(config.slack_name),
        signup_description: config.signup_description,
        conditional: config.conditional,
        code_of_conduct: config.code_of_conduct,
        slack_name: config.slack_name,
        recaptcha_sitekey: config.recaptcha_sitekey,
        info: info
      }

      res.render('signup', viewModel);
    }
});

module.exports = router;
