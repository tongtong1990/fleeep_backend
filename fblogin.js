const mysql = require('mysql');
const request = require('request-promise');
var mysqlUtils = require('./mysqlUtils');
var constants = require('./constants');

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
    var fbUserName, fbUserPhoto;
    request(fbUserOptions)
        .then(function(result) {
            var fbId = result.id;
            if (fbId != userId) {
                isResSent = true;
                return res.status(400).send({
                    result: null,
                    status: constants.fbInvalidUserIdStatusCode,
                    message: 'Fail to log in. Please try again.'
                });
            }
            fbUserName = result.name;
            fbUserPhoto = result.picture.data.url;
            return mysqlUtils.queryPromise(
                conn,
                "SELECT id FROM user WHERE fbid = ?",
                [userId]);
        })
        .then(function(result) {
            if (isResSent) return;
            if (result.length == 0) {
                return mysqlUtils.queryPromise(
                    conn,
                    'INSERT INTO user SET ?',
                    {
                        fbid: userId,
                        imageid: fbUserPhoto,
                        username: fbUserName
                    });
            } else {
                isResSent = true;
                return res.send({
                    result: result[0].id,
                    status: constants.okStatusCode,
                    message: 'FB login completed.'
                });
            }
        })
        .then(function(result) {
            if (isResSent) return;
            return res.send({
                result: result.insertId,
                status: constants.okStatusCode,
                message: 'FB login completed.'
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
        .finally(function() {
            conn.end();
        });
};

module.exports = fbLoginFlow;


