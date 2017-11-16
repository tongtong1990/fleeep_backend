const mysql = require('mysql');

var mysqlUtils = require('./mysqlUtils');
var constants = require('./constants');

var registerFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var code = req.body.code;
    mysqlUtils.queryPromise(
        conn,
        "SELECT * FROM user WHERE email = ?",
        [email])
        .then(function(result) {
            if (result.length == 0) {
                return res.status(400).send({
                   result: null,
                   status: constants.invalidUserStatusCode,
                   message: 'Please try again.'
                });
            } else if (result.length > 0 && result.username) {
                return res.status(400).send({
                    result: null,
                    status: constants.userAlreadyExistStatusCode,
                    message: 'Email already exists.'
                });
            } else if (result[0].activation_code != code
                || result[0].activation_expire_time < Date.now()) {
                return res.status(400).send({
                   result: null,
                   status: constants.invalidActivationCodeStatusCode,
                   message: 'Code not valid, please request code again.'
                });
            } else {
                return res.send({
                    result: result[0].id,
                    status: constants.okStatusCode,
                    message: 'ok'
                });
            }
        })
        .catch(function(err) {
            console.log(err.toString());
            res.status(500).send({
                result: null,
                status: constants.internalErrorStatusCode,
                message: 'Internal error: ' + err.toString()
            });
        })
        .fin(function() {
            conn.end();
        })
        .done();
};

module.exports = registerFlow;