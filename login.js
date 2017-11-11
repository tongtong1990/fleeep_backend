const mysql = require('mysql');
var mysqlUtils = require('./mysqlUtils');
var constants = require('./constants');

var loginFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var email = req.params.email;
    var pwd = req.params.pwd;
    mysqlUtils.queryPromise(
        conn,
        "SELECT * FROM user WHERE email = ?",
        [email])
        .then(function(result) {
            if (result.length == 0) {
                return res.status(400).send({
                    result: null,
                    status: constants.invalidUserStatusCode,
                    message: 'Not a valid user. Please register first.'
                });
            } else if (result[0].pwd != pwd) {
                return res.status(400).send({
                    result: null,
                    status: constants.invalidPasswordStatusCode,
                    message: 'Password not matched. Please try again.'
                });
            } else if (result[0]['is_verified'] == 0) {
                return res.status(400).send({
                    result: null,
                    status: constants.inactivatedUserStatusCode,
                    message: 'User not activated yet.'
                });
            } else {
                return res.send({
                    result: 'ok',
                    status: constants.okStatusCode,
                    message: 'Successfully login.'
                });
            }
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