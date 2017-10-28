const Q = require('q');

const username = 'fleeekio';
const pwd = 'fleeekio';
const host = 'fleeekio.cdcu5rcw6b67.us-east-2.rds.amazonaws.com';
const db = 'fleeekio';

var createConnection = function() {
    return {
        host: host,
        user: username,
        password: pwd,
        database: db
    };
};

module.exports.createConnection = createConnection;