const mysql = require('mysql');
const Q = require('q');
var mysqlUtils = require('./mysqlUtils');

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
                    message: 'Not a valid user. Please register first.'
                });
            } else if (result[0].pwd != pwd) {
                return res.status(400).send({
                    result: null,
                    message: 'Password not matched. Please try again.'
                });
            } else {
                return res.send({
                    result: 'ok',
                    message: 'Successfully login.'
                });
            }
        })
        .catch(function(err) {
            console.log(err.toString());
            res.status(500).send({
                result: null,
                message: 'Internal error: ' + err.toString()
            });
        })
        .done();
};

module.exports = loginFlow;