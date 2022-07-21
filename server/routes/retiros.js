require('dotenv').config();
const express = require('express');
const app = express();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta } = require('../controllers/querys.controller');
const { error, success } = require('../controllers/respuestas.controller');
const { array } = require('yup');

app.get('/estudiantesParalelos', async(req = request, res = response) => {
    const cursos = quitarDuplicados(req.body);
    const datos = unirDatos(cursos, req.body);
    const retiros = await procesarRetiros(datos);
    res.json(retiros);
});

const quitarDuplicados = (arr) => {
    let hash = {};
    const array = arr.filter(o => hash[o.id_class] ? false : hash[o.id_class] = true);
    return array;
}

const unirDatos = (cursos, estPorCurso) => {
    let datos = [];
    for (let i = 0; i < cursos.length; i++) {
        const estudiantes = estPorCurso.filter(e => e.id_class == cursos[i].id_class);
        const curso = {
            id_class: cursos[i].id_class,
            cant: estudiantes.length,
            ests: estudiantes
        }
        datos.push(curso);
    }
    return datos;
}

const procesarRetiros = async(d) => {
    let respData = [];
    for (let i = 0; i < d.length; i++) {
        let params = `&class_id=${d[i].id_class}`;
        for (let j = 0; j < d[i].ests.length; j++) {
            params = params + "&user_ids[]=" + d[i].ests[j].id_est
        }
        await delay(500);
        const resp = await peticionApiNeo(params);
        const result = {
            class_id: d[i].id_class,
            cantidad: d[i].ests.length,
            parametros: params,
            result: resp
        }
        respData.push(result);
    }
    return respData
}

const peticionApiNeo = async(parametros) => {
    const url = "https://neo.ucb.edu.bo/api";
    const metodo = "remove_students_from_class";
    const apikey = "55e3bdcb808f8d07f34003a38c8567a8454ecc47d1f3a1de1806";
    try {
        const respAPI = await fetch(`${url}/${metodo}?api_key=${apikey}${parametros}`);
        const data = await respAPI.json();
        return success(data);
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

function delay(n) {
    return new Promise(function(resolve) {
        setTimeout(resolve, n);
    });
}

module.exports = app;