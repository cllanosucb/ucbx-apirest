const db = require('../db/mariadb');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { error, success } = require('./respuestas.controller');

const consulta = async(query, values) => {
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

const peticionNeo = async(metodo, parametros) => {
    try {
        const respAPI = await fetch(`${process.env.URL}/${metodo}?api_key=${process.env.API_KEY}${parametros}`);
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
    consulta,
    peticionNeo
};