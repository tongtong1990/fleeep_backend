const mysql = require('mysql');
var mysqlUtils = require('./mysqlUtils');

var registerFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    Q.fcall(conn.connect())
        .then(function(err) {
            if (err) throw err;
            return Q.fcall("SELECT COUNT(*) FROM user");
        })
        .then(function(err, result) {
            if (err) throw err;
            if (result.length > 0) {
                conn.end();
                res.sendStatus(500).send({
                    result: null,
                    message: 'Email already exists.'
                });
            } else {
                conn.end();
                res.send("OK");
            }
        })
        .catch(function(err) {
            conn.end();
            res.sendStatus(500).send({
                result: null,
                message: err.toString()
            })
        }).done();
};

module.exports = registerFlow;