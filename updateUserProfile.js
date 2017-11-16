const mysql = require('mysql');

var mysqlUtils = require('./mysqlUtils');
var constants = require('./constants');

var updateUserProfileFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var id = req.body.id;
    var username = req.body.username;
    mysqlUtils.queryPromise(
        conn,
        "UPDATE user SET username = ? WHERE id = ?",
        [username, id])
        .then(function(result) {
            return res.send({
                result: 'ok',
                status: constants.okStatusCode,
                message: 'User profile updated.'
            });
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

module.exports = updateUserProfileFlow;