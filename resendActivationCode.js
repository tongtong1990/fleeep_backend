const mysql = require('mysql');
const randomstring = require('randomstring');
const request = require('request-promise');
const _ = require('underscore-node');

var mysqlUtils = require('./mysqlUtils');
var emailUtils = require('./emailUtils');
var constants = require('./constants');

var resendActivationCodeFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var activationCode = randomstring.generate({
        length: 8,
        charset: 'numeric'
    });
    var activationCodeExpireTime = Date.now() + 24 * 3600 * 1000;
    mysqlUtils.queryPromise(
        conn,
        "UPDATE user SET activation_code = ?, activation_expire_time = ? WHERE email = ?",
        [activationCode, activationCodeExpireTime, email])
        .then(function(result) {
            var postBody = emailUtils.createActivationEmail(email, activationCode);
            var postOptions = emailUtils.createPostOptions(postBody);
            return request(postOptions);
        })
        .then(function(result) {
            return res.send({
                result: 'ok',
                status: constants.okStatusCode,
                message: 'Resend activation code.'
            });
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

module.exports = resendActivationCodeFlow;