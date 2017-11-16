const mysql = require('mysql');
const randomstring = require('randomstring');
const request = require('request-promise');

var mysqlUtils = require('./mysqlUtils');
var emailUtils = require('./emailUtils');
var constants = require('./constants');

var checkUserStatusFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var responseToSend;
    var activationCode;
    mysqlUtils.queryPromise(
        conn,
        "SELECT * FROM user WHERE email = ?",
        [email]
    ).then(function(result) {
        if (result.length == 0 || !result[0].username) {
            responseToSend = {
                result: 'ok',
                status: constants.invalidUserStatusCode,
                message: 'User not registered yet.'
            };
        } else {
            responseToSend = {
                result: 'ok',
                status: constants.registeredUserStatusCode,
                message: 'User already registered.'
            };
        }
        activationCode = randomstring.generate({
            length: 8,
            charset: 'numeric'
        });
        var currentTimestamp = Date.now();
        return mysqlUtils.queryPromise(
            conn,
            'INSERT INTO user (email, activation_code, activation_expire_time) VALUES (?,?,?) ' +
            'ON DUPLICATE KEY UPDATE activation_code = VALUES(activation_code), ' +
            'activation_expire_time = VALUES(activation_expire_time)',
            [email, activationCode, currentTimestamp + 24*3600*1000]
        );
    }).then(function(result) {
        var postBody = emailUtils.createActivationEmail(email, activationCode);
        var postOptions = emailUtils.createPostOptions(postBody);
        return request(postOptions);
    }).then(function(result) {
        return res.send(responseToSend);
    }).catch(function(err) {
        console.log(err.toString());
        res.status(500).send({
            result: null,
            status: constants.internalErrorStatusCode,
            message: 'Internal error: ' + err.toString()
        });
    }).fin(function() {
        conn.end();
    }).done();
};

module.exports = checkUserStatusFlow;