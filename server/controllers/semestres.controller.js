require('dotenv').config();
const { request, response } = require('express');
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const semestresActivos = async(req = request, res = response) => {
    const sqlSemestresActivos = "select * from Periodos_academicos where estado = 1 order by id_regional, id_periodo_academico";
    const respSemestres = await consulta(sqlSemestresActivos, []);
    if (!respSemestres.ok) {
        return res.status(500).json(error({
            msg: 'Error al recuperar los datos',
            error: JSON.stringify(respSemestres.error, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
        }));
    }
    return res.json(success(respSemestres.data));
}

module.exports = {
    semestresActivos
}