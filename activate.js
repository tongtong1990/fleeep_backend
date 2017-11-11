const mysql = require('mysql');
var mysqlUtils = require('./mysqlUtils');
var constants = require('./constants');

var activateFlow = function(req, res) {
  var conn = mysql.createConnection(mysqlUtils.createConnection());
  var activationCode = req.params.code;
  var email = req.params.email;
  var isResSent = false;
  mysqlUtils.queryPromise(
      conn,
      "SELECT * FROM user WHERE email = ?",
      [email])
      .then(function(result) {
        isResSent = true;
        if (result.length == 0) {
            return res.status(400).send({
                result: null,
                status: constants.invalidUserStatusCode,
                message: 'Sorry, account does not exist any more.'
            });
        } else if (result[0]['is_verified']) {
            return res.send({
                result: 'ok',
                status: constants.okStatusCode,
                message: 'Your account has already been activated.'
            });
        } else if (result[0]['activation_code'] != activationCode) {
            return res.status(400).send({
                result: null,
                status: constants.invalidActivationCodeStatusCode,
                message: 'Sorry, the activation code is invalid.'
            });
        } else if (result[0]['activation_expire_time'] < Date.now()) {
            return res.status(400).send({
                result: null,
                status: constants.activationCodeExpireStatusCode,
                message: 'Sorry, the activation code already expired.'
            });
        } else {
          isResSent = false;
          return mysqlUtils.queryPromise(
              conn,
              'UPDATE user SET is_verified = ? WHERE email = ?',
              [true, email]);
        }
      })
      .then(function(result) {
        if (isResSent) return result;
        isResSent = true;

        return res.send({
            result: 'ok',
            status: constants.okStatusCode,
            message: 'Your account has already been activated.'
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

module.exports = activateFlow;