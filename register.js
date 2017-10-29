const mysql = require('mysql');
const randomstring = require('randomstring');
var mysqlUtils = require('./mysqlUtils');

var registerFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.body.email;
    var pwd = req.body.pwd;
    var isResSent = false;
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
                var activationCode = randomstring.generate({
                    length: 32,
                    charset: 'alphabetic'
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
            isResSent = true;
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