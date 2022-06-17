require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const buscarCurso = async(req = request, res = response) => {
    const { archivado, nombre } = req.query;
    try {
        const respAPI = await fetch(`${process.env.URL}/get_classes_that_match?api_key=${process.env.API_KEY}&name=${nombre}&archived=${archivado}`);
        const resp = await respAPI.json();
        res.json(success(resp));
    } catch (err) {
        return res.status(500).json(error({
            msg: "Error interno del servidor",
            error: err
        }));
    }

}

const listaCursos = async(req = request, res = response) => {
    let page = 1;
    let lista = [];
    try {
        do {
            const respAPI = await fetch(`${process.env.URL}/get_all_classes?api_key=${process.env.API_KEY}&page=${page}`);
            const data = await respAPI.json();
            if (data.length > 0) {
                page += 1;
                //lista = lista.concat(data);
                lista = [...lista, ...data];
            } else {
                page = 0;
            }
        } while (page != 0)
    } catch (err) {
        return res.status(500).json(error({
            msg: "Error interno del servidor",
            error: err
        }));
    }
    res.json(success(lista));
}

const guardarCurso = async(req = request, res = response) => {
    const data = req.body;
    const userDatos = req.datos;
    const result = await insertCursos(data, userDatos);
    if (result.ok) {
        return res.json(success({
            msg: 'Registros creados',
            data: JSON.stringify(result.data, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
        }));
    } else {
        return res.status(500).json(error({
            msg: "Error interno del servidor",
            error: JSON.stringify(result.error, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
        }));
    }
}

const insertCursos = async(arr, userDatos) => {
        const selectCurso = "SELECT * FROM Cursos WHERE id_curso = ?;";
        const insertsql = `INSERT INTO Cursos (id_curso, nombre, descripcion, creditos, organizacion, semestre, fecha_inicio, fecha_fin, usuario_registro) VALUES\n`;
        let values = "";
        for (let i = 0; i < arr.length; i++) {
            const cursoDB = await consulta(selectCurso, [arr[i].id_curso]);
            if (cursoDB.ok) {
                if (cursoDB.data.length == 0) {
                    if (i == (arr.length - 1)) {
                        let value = `(${arr[i].id_curso},UPPER('${arr[i].nombre}'),'${arr[i].descripcion.replace(/'/gi,"")}',${arr[i].creditos},UPPER('${arr[i].organizacion}'),${arr[i].semestre != null ? `'${arr[i].semestre}'` : null},'${arr[i].fecha_inicio}','${arr[i].fecha_fin}','${userDatos.usuario.split('@')[0]}');`;
                    values = values + value;
                } else {
                    let value = `(${arr[i].id_curso},UPPER('${arr[i].nombre}'),'${arr[i].descripcion.replace(/'/gi,"")}',${arr[i].creditos},UPPER('${arr[i].organizacion}'),${arr[i].semestre != null ? `'${arr[i].semestre}'` : null},'${arr[i].fecha_inicio}','${arr[i].fecha_fin}','${userDatos.usuario.split('@')[0]}'),\n`;
                    values = values + value;
                }
            }
        }
    }
    let insert = success({
        msg: "Registros ya creados",
        data: null
    });
    if (values.length > 0) {
        insert = await consulta(insertsql + values, []);
    }
    return insert;
}

module.exports = {
    buscarCurso,
    listaCursos,
    guardarCurso
}