require('dotenv').config();
const db = require('../../db/mariadb');
const fs = require('fs');
const { request, response } = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionApiNeo } = require('../querys.controller');
const { error, success } = require('../respuestas.controller');
const {
    formatoFecha,
    transformarNomRegional,
    formatoFechaNeo,
    otroFormatoFecha,
    delay,
    capitalizar,
    guardarCsv
} = require('../../tools/util.tools');

/* Ejemplo
const nombreFuncion = async (req = request, res = response) => {
    res.json({msg: 'Respuesta'});
}
*/

module.exports = {
    //nombreFuncion
}