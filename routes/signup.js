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

router.get('/', function (req, res) {
  res.render('signup', { errors: {}, fields: {}, title: 'Sign up for '.concat(config.slack_name), signup_description:config.signup_description, conditional:config.conditional, code_of_conduct:config.code_of_conduct });
});

router.post('/', function (req, res) {
    req.checkBody('firstName', 'First name is required').notEmpty();
    req.checkBody('lastName', 'Last name is required').notEmpty();
    req.checkBody('email', 'A valid e-mail is required').notEmpty().isEmail();
    req.checkBody('handle', 'A handle is required').notEmpty();
    req.checkBody('description', 'Please describe yourself').notEmpty();
    req.checkBody('conditional', config.conditional_error).notEmpty();
    req.checkBody('codeOfConduct', 'You must agree to the Code of Conduct').notEmpty();
    
    /* in case we call next() in the future */
    req.body.firstName = xssFilters.inHTMLData(req.sanitizeBody('firstName').toString().trim());
    req.body.lastName = xssFilters.inHTMLData(req.sanitizeBody('lastName').toString().trim());
    req.body.email = req.sanitizeBody('email').normalizeEmail();
    req.body.handle = xssFilters.inHTMLData(req.sanitizeBody('handle').toString().trim());
    req.body.description = xssFilters.inHTMLData(req.sanitizeBody('description').toString());
    req.body.conditional = req.sanitizeBody('conditional').toBoolean();
    req.body.codeOfConduct = req.sanitizeBody('codeOfConduct').toBoolean();
    
    var errors = req.validationErrors();
    
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var handle = req.body.handle;
    var description = req.body.description;
    var conditional = req.body.conditional;
    var codeOfConduct = req.body.codeOfConduct;
    
    if (!errors) {
        var db = req.db;
        var signups = db.get('signups');
        signups.insert({ "firstName": firstName, "lastName": lastName, "email": email, "handle": handle, "description": description, "conditional": conditional, "codeOfConduct": codeOfConduct, "date": new Date() }, function (err, doc) {
            if (err) {
                /* TODO: Render the signup page, but with the values pre-filled so the person can press sign up again. */
                res.status(500).send("There was a problem, please try again. ".concat(err));
            } else {
                res.redirect(303, '/success');
            }
        });
    } else {
        /* TODO: Render the signup page, but with the values pre-filled so the person can press sign up again. */
        res.render('signup', { fields: { "firstName": firstName, "lastName": lastName, "email": email, "handle": handle, "description": description, "conditional": conditional, "codeOfConduct": codeOfConduct }, errors: to_error_dict(errors), title: 'Sign up for '.concat(config.slack_name), signup_description: config.signup_description, conditional: config.conditional, code_of_conduct: config.code_of_conduct });
    }
});

module.exports = router;
