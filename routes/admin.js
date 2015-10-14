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

router.post('/', function (req, res) {
    var db = req.db;
    var signups = db.get('signups');
    var checked = (Array.isArray(req.body.checked) ? req.body.checked : [req.body.checked]).map(mongo.ObjectID);
    
    console.log(req);
    
    if (req.body.action === 'Approve') {
        signups.find({ _id: { $in: checked } }, {}, function (err, docs) {
            if (err) {
                res.status(500).send('something went wrong, try again'.concat(err));
            } else {
                docs.forEach(function (element, index, array) {
                    console.log("approved " + element['email']);
                    /* TODO: error handling and delete only succeeded
                    request.post({
                        url: 'https://' + config.slack_url + '/api/users.admin.invite',
                        form: { email: element['email'], token: config.slack_token, set_active: true }
                    }, function (api_err, http_res, body) {
                        if (err) {
                            // TODO: accumulate
                        } else {
                            body = JSON.parse(body);

                            if (body.ok) {
                                // TODO: accumualte
                            } else {
                                if (body.error == 'already_invited') {
                                    // TODO: accumulate
                                } else if (body.error == 'invalid_email') {
                                    // TODO: accumulate
                                }
                            }
                        }
                    }); */
                });
                
                // TODO: it won't necessarily be all checked. and if this fails,
                // have a better error to figure out which users were not removed
                var result = signups.remove({ _id: { $in: checked } });
                
                if (!result.writeConcernError) {
                    res.redirect(303, '/admin');
                } else {
                    res.status(500).send(result.writeConcernError.errmsg);
                }
            }
        });
    } else if (req.body.action === 'Reject') {
        var result = signups.remove({ _id: { $in: checked } });
        
        if (!result.writeConcernError) {
            res.redirect(303, '/admin');
        } else {
            res.status(500).send(result.writeConcernError.errmsg);
        }
    }
});

module.exports = router;
