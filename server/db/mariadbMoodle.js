const mariadb = require('mariadb');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE_MOODLE,
    connectionLimit: 5
}

const pool = mariadb.createPool(config);

mariaDbConnection = function () {
    return new Promise(function (resolve, reject) {
        pool.getConnection().then(function (connection) {
            resolve(connection);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports = {
    mariaDbConnection
};