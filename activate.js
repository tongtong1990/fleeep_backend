const mysql = require('mysql');
var mysqlUtils = require('./mysqlUtils');

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
          return res.send('Sorry, account does not exist any more.');
        } else if (result[0]['is_verified']) {
          return res.send('Your account has already been activated.');
        } else if (result[0]['activation_code'] != activationCode) {
          return res.send('Sorry, the activation code is invalid.');
        } else if (result[0]['activation_expire_time'] < Date.now()) {
          return res.send('Sorry, the activation code already expired.');
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
        return res.send('Your account has been activated. Please log in from App.');
      })
      .catch(function(err) {
        console.log(err.toString());
        res.status(500).send('Internal error');
      })
      .fin(function() {
        conn.end();
      })
      .done();
};

module.exports = activateFlow;