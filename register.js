const mysql = require('mysql');
const randomstring = require('randomstring');
const request = require('request-promise');
const _ = require('underscore-node');
var mysqlUtils = require('./mysqlUtils');

var registerFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var pwd = req.body.pwd;
    var isResSent = false;
    var activationCode;
    mysqlUtils.queryPromise(
        conn,
        "SELECT COUNT(*) as cnt FROM user WHERE email = ?",
        [email])
        .then(function(result) {
            if (result[0]['cnt'] > 0) {
                isResSent = true;
                return res.status(400).send({
                    result: null,
                    message: 'Email already exists.'
                });
            } else {
                activationCode = randomstring.generate({
                    length: 8,
                    charset: 'numeric'
                });
                var currentTimestamp = Date.now();
                return mysqlUtils.queryPromise(
                    conn,
                    'INSERT INTO user SET ?',
                    {
                        email: email,
                        pwd: pwd,
                        activation_code: activationCode,
                        activation_expire_time: currentTimestamp + 24*3600*1000
                    });
            }
        })
        .then(function(result) {
            if (isResSent) return result;
            var to = {};
            to[email] = 'to ' + email;
            var postBody = {
                to: to,
                from: ['fleeekio@gmail.com', 'fleeek io'],
                subject: 'Your activation code for fleeek io account',
                html: '<p>Dear user, your activation code is: </p><p><h1>'
                + activationCode + '</h1></p>'
            };
            var postOptions = {
                method: 'POST',
                uri: 'https://api.sendinblue.com/v2.0/email',
                headers: {
                    'api-key': 'UBTWCOYkNxb9E1Jz'
                },
                json: true,
                body: postBody
            };
            return request(postOptions);
            // isResSent = true;
            // return res.send({
            //     result: 'ok',
            //     message: 'Register completed.'
            // });
        })
        .then(function(result) {
            if (isResSent) return;
            return res.send({
                result: 'ok',
                message: 'Register completed.'
            });
        })
        .catch(function(err) {
            console.log(err.toString());
            res.status(500).send({
                result: null,
                message: 'Internal error: ' + err.toString()
            });
        })
        .fin(function() {
            conn.end();
        })
        .done();
};

module.exports = registerFlow;