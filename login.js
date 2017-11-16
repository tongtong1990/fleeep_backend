const mysql = require('mysql');
const randomstring = require('randomstring');
const request = require('request-promise');

var mysqlUtils = require('./mysqlUtils');
var emailUtils = require('./emailUtils');
var constants = require('./constants');

var loginFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var code = req.body.code;
    var isResSent = false;
    var activationCode;
    mysqlUtils.queryPromise(
        conn,
        "SELECT * FROM user WHERE email = ?",
        [email])
        .then(function(result) {
            if (code) {
                isResSent = true;
                if (result.length == 0
                    || result[0].activation_code != code
                    || result[0].activation_expire_time < Date.now()) {
                    return res.status(400).send({
                        result: null,
                        status: constants.invalidActivationCodeStatusCode,
                        message: 'Code not valid.'
                    });
                } else {
                    return res.send({
                        result: result[0].id,
                        status: constants.okStatusCode,
                        message: 'ok'
                    });
                }
            } else {
                if (result.length == 0) {
                    isResSent = true;
                    return res.status(400).send({
                        result: null,
                        status: constants.invalidUserStatusCode,
                        message: 'Not a valid user. Please register first.'
                    });
                } else {
                    activationCode = randomstring.generate({
                        length: 8,
                        charset: 'numeric'
                    });
                    var currentTimestamp = Date.now();
                    return mysqlUtils.queryPromise(
                        conn,
                        'UPDATE user SET activation_code = ? WHERE email = ?',
                        [activationCode, email]);
                }
            }
        })
        .then(function(result) {
            if (isResSent) return result;
            var postBody = emailUtils.createActivationEmail(email, activationCode);
            var postOptions = emailUtils.createPostOptions(postBody);
            return request(postOptions);
        })
        .then(function(result) {
            if (isResSent) return;
            return res.send({
                result: 'ok',
                status: constants.okStatusCode,
                message: 'Code sent in registration flow.'
            });
        })
        .catch(function(err) {
            console.log(err.toString());
            res.status(500).send({
                result: null,
                stauts: constants.internalErrorStatusCode,
                message: 'Internal error: ' + err.toString()
            });
        })
        .fin(function() {
            conn.end();
        })
        .done();
};

module.exports = loginFlow;