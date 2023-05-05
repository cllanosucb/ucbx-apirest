const db = require('../../db/mariadbMoodle');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { error, success } = require('./respuestas.moodle.controller');

const consultaMoodle = async (query, values) => {
    let dbconn;
    try {
        dbconn = await db.mariaDbConnection();
        const result = await dbconn.query(query, values);
        dbconn.end();
        return success(result);
    } catch (err) {
        if (dbconn) {
            dbconn.release();
        }
        dbconn.end();
        return error(err);
    }
};

const peticionApiMoodle = async (url, nameFunction, api_key, params) => {
    try {
        const respAPI = await fetch(`${url}?wstoken=${api_key}&wsfunction=${nameFunction}&moodlewsrestformat=json${params}`);
        const data = await respAPI.json();
        return success(data);
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

module.exports = {
    consultaMoodle,
    peticionApiMoodle
};