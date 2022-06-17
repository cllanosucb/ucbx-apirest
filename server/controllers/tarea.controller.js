require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const guardarTareas = async(req = request, res = response) => {
    const cursosId = req.body;
    const userDatos = req.datos;
    let arrayTareas = [];
    for (let i = 0; i < cursosId.length; i++) {
        let cursoTarea = {
            id_curso: cursosId[i],
            tareas: []
        };
        const resp = await peticionNeo('get_assignments_for_class', `&class_id=${cursosId[i]}`);
        cursoTarea.tareas = (resp.ok ? resp.data : []);
        arrayTareas.push(cursoTarea);
    }
    const resultRegistro = await registrarTareas(arrayTareas, userDatos)
    if (resultRegistro.ok) {
        return res.json(success(resultRegistro.data));
    } else {
        return res.status(500).json(error(resultRegistro.error));
    }
}

const registrarTareas = async(arr, userDatos) => {
        const sqlTareaPorId = "SELECT * FROM Tareas WHERE id_tarea = ?";
        const sqlInsertTareas = "INSERT INTO Tareas (id_tarea,nombre,tipo,puntos,categoria,id_modulo,fecha_inicio,fecha_fin,asignado,usuario_registro) VALUES";
        const sqlUpdateTareas = "UPDATE Tareas SET nombre=UPPER(?), tipo=UPPER(?), puntos=?, categoria=UPPER(?), id_modulo=?, fecha_inicio=?, fecha_fin=?, asignado=? WHERE id_tarea=?;";
        let contUpdate = 0;
        let valuesTareas = "";
        try {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].tareas.length; j++) {
                    const resultTareas = await consulta(sqlTareaPorId, [arr[i].tareas[j].id]);
                    if (resultTareas.ok) {
                        if (resultTareas.data.length == 0) {
                            let valuetarea = `(${arr[i].tareas[j].id},UPPER('${arr[i].tareas[j].name}'),UPPER('${arr[i].tareas[j].type}'),${arr[i].tareas[j].points},${arr[i].tareas[j].category == null ? null : `UPPER('${arr[i].tareas[j].category}')`},${arr[i].tareas[j].lesson},${arr[i].tareas[j].begin == null ? null : `'${arr[i].tareas[j].begin}'`},${arr[i].tareas[j].end == null ? null : `'${arr[i].tareas[j].end}'`},${arr[i].tareas[j].given},'${userDatos.usuario.split('@')[0]}'),`;
                        valuesTareas = valuesTareas + valuetarea;
                    } else {
                        const updatet = await consulta(sqlUpdateTareas, [arr[i].tareas[j].name, arr[i].tareas[j].type, arr[i].tareas[j].points, arr[i].tareas[j].category, arr[i].tareas[j].lesson, arr[i].tareas[j].begin, arr[i].tareas[j].end, arr[i].tareas[j].given, arr[i].tareas[j].id]);
                        contUpdate = updatet.ok ? contUpdate + 1 : contUpdate;
                    }
                }
            }
        }
        if (valuesTareas.length > 0) {
            const sql = sqlInsertTareas + valuesTareas.substring(0, valuesTareas.length - 1) + ";";
            const insertTareas = await consulta(sql, []);
            if (insertTareas.ok) {
                return success({
                    msg: "Registros creados",
                    data: {
                        insert: JSON.stringify(insertTareas.data, (key, value) =>
                            typeof value === "bigint" ? value.toString() + "" : value
                        ),
                        update: `Registros actualizados ${contUpdate}`
                    }
                })
            } else {
                return error({
                    msg: "Error interno del servidor",
                    error: JSON.stringify(insertTareas.error, (key, value) =>
                        typeof value === "bigint" ? value.toString() + "" : value
                    )
                });
            }
        } else {
            return success({
                msg: "Registros creados",
                data: {
                    insert: "Registros creados 0",
                    update: `Registros actualizados ${contUpdate}`
                }
            })
        }
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

module.exports = {
    guardarTareas
}