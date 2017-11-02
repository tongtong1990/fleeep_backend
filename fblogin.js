const mysql = require('mysql');
const request = require('request-promise');
var mysqlUtils = require('./mysqlUtils');

const fbUserFields = 'picture,name';

var fbLoginFlow = function(req, res) {
    var conn = mysql.createConnection(mysqlUtils.createConnection());
    var userId = req.params.id;
    var token = req.params.token;
    var isResSent = false;
    var fbUserOptions = {
        uri: 'https://graph.facebook.com/me',
        qs: {
            access_token: token,
            fields: fbUserFields
        },
        json: true
    };
    request(fbUserOptions)
        .then(function(result) {
            var fbId = result.id;
            if (fbId != userId) {
                isResSent = true;
                return res.status(400).send({
                    result: null,
                    message: 'Fail to log in. Please try again.'
                });
            }
            return mysqlUtils.queryPromise(
                conn,
                "SELECT COUNT(*) as cnt FROM user WHERE email = ?",
                [userId]);
        })
        .then(function(result) {
            if (isResSent) return;
            if (result[0]['cnt'] == 0) {

            }
        });
};

module.exports = fbLoginFlow;


