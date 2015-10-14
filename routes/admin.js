var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var config = require('../config');

/* GET admin page. */
router.get('/', function (req, res, next) {
    var db = req.db;
    var signups = db.get('signups');
    
    signups.find({}, {}, function (err, docs) {
        if (!err) {
            res.render('admin', { title: 'Administration', slack_name: config.slack_name, signups: docs });
        } else {
            res.status(500).send("error:".concat(err));
        }
    });
});

function process(data) {
    var defers = [];
    var approves = [];
    var rejects = [];

    for (var key in data) {
        if (data[key] === 'defer') {
            defers.push(key);
        } else if (data[key] === 'approve') {
            approves.push(key);
        } else if (data[key] === 'reject') {
            rejects.push(key);
        }
    }

    return { defers: defers, approves: approves, rejects: rejects}
}

function check(result) {
    if (result.writeConcernError) {
        throw result.writeConcernError.errmsg;
    }
}

router.post('/', function (req, res) {
    var db = req.db;
    var signups = db.get('signups');
    
    var processed = process(req.body);
    
    var defers = processed.defers.map(mongo.ObjectID);
    var approves = processed.approves.map(mongo.ObjectID);
    var rejects = processed.rejects.map(mongo.ObjectID);
    
    var removed_rejects = signups.remove({ _id: { $in: rejects } });

    signups.find({ _id: { $in: approves } }, {}, function (err, docs) {
        if (err) {
            res.status(500).send('something went wrong, try again'.concat(err));
        } else {
            docs.forEach(function (element, index, array) {
                console.log("approved " + element['email']);
                var errors = []
                var succeeded = []
                /* TODO: error handling and delete only succeeded */
                require('request').post({
                    url: 'https://' + config.slack_url + '/api/users.admin.invite',
                    form: { email: element['email'], first_name: element['firstName'], last_name: element['lastName'], token: config.slack_token, set_active: true }
                }, function (api_err, http_res, body) {
                    if (err) {
                        errors.push(err);
                    } else {
                        body = JSON.parse(body);

                        if (body.ok) {
                            succeeded.push(element['email']);
                        } else {
                            if (body.error == 'already_invited') {
                                errors.push(element['email'] + ' already invited');
                            } else if (body.error == 'invalid_email') {
                                errors.push(element['email'] + ' is an invalid email');
                            }
                        }
                    }
                });
            });
                
            // TODO: it won't necessarily be all checked. and if this fails,
            // have a better error to figure out which users were not removed
            var removed_approves = signups.remove({ _id: { $in: approves } });
            check(removed_rejects);
            check(removed_approves);
        }
    });

    res.redirect(303, '/admin');
});

module.exports = router;
