require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const guardarCalificaciones = async(req = request, res = response) => {
    const cursosId = req.body;
    const userDatos = req.datos;
    let arrayCalificaciones = [];
    for (let i = 0; i < cursosId.length; i++) {
        let cursoCalificacion = {
            id_curso: cursosId[i],
            calificaciones: []
        };
        const resp = await peticionNeo('get_grades_for_class', `&class_id=${cursosId[i]}`);
        cursoCalificacion.calificaciones = (resp.ok ? resp.data : []);
        arrayCalificaciones.push(cursoCalificacion);
    }
    //res.json(success(arrayCalificaciones));
    const resultRegistro = await registrarCalificaciones(arrayCalificaciones, userDatos);
    if (resultRegistro.ok) {
        return res.json(success(resultRegistro.data));
    } else {
        return res.status(500).json(error(resultRegistro.error));
    }
}

const registrarCalificaciones = async(arr, userDatos) => {
    const sqlCalificacionesPorId = "SELECT * FROM NCalificaciones WHERE id_curso = ? AND id_usuario = ?";
    const sqlInsertCalificaciones = "INSERT INTO NCalificaciones (porcentaje, nota, id_curso, id_usuario, usuario_registro) VALUES";
    const sqlUpdateCalificaciones = "UPDATE NCalificaciones SET porcentaje=?, nota=? WHERE id_curso=? AND id_usuario=?";
    const sqlNotastareasPorId = "SELECT * FROM Notas_tareas WHERE id_tarea=? AND id_curso=? AND id_usuario=?";
    const sqlInsertNotasTareas = "INSERT INTO Notas_tareas (nombre_periodo_calificacion, porcentaje_periodo_calificacion, nota_periodo_calificacion, fecha_presentacion, porcentaje, nota, puntaje, id_tarea, id_curso, id_usuario, usuario_registro) VALUES";
    const sqlUpdateNotasTareas = "UPDATE Notas_tareas SET nombre_periodo_calificacion=UPPER(?), porcentaje_periodo_calificacion=?, nota_periodo_calificacion=?, fecha_presentacion=?, porcentaje=?, nota=?, puntaje=? WHERE id_tarea=? AND id_curso=? AND id_usuario=?";
    let contUpdateC = 0;
    let contUpdateN = 0;
    let valuesCalificaciones = "";
    let valuesNotasTareas = "";
    let respuesta = {
        msg: "Registros creados",
        data: {
            calificaciones: {
                insert: "Ya registrados",
                update: "Registros actualizados "
            },
            notas: {
                insert: "Ya registrados",
                update: "Registros actualizados "
            },
        }
    }
    try {
        for (let i = 0; i < arr.length; i++) {
            const id_curso = arr[i].id_curso;
            for (let j = 0; j < arr[i].calificaciones.length; j++) {
                const id_usuario = arr[i].calificaciones[j].user_id;
                const porcentajeCalificacion = arr[i].calificaciones[j].percent;
                const notaCalificacion = arr[i].calificaciones[j].grade;
                const resultCalificacion = await consulta(sqlCalificacionesPorId, [id_curso, id_usuario]);
                if (resultCalificacion.ok) {
                    if (resultCalificacion.data.length == 0) {
                        let valueCalificacion = `('${porcentajeCalificacion}', '${notaCalificacion}', ${id_curso}, ${id_usuario}, '${userDatos.usuario.split('@')[0]}'),`;
                        valuesCalificaciones = valuesCalificaciones + valueCalificacion;
                    } else {
                        const updatec = await consulta(sqlUpdateCalificaciones, [porcentajeCalificacion, notaCalificacion, id_curso, id_usuario]);
                        contUpdateC = updatec.ok ? contUpdateC + 1 : contUpdateC;
                    }
                }
                for (let k = 0; k < arr[i].calificaciones[j].grading_periods.length; k++) {
                    const nombre_periodo_calificacion = arr[i].calificaciones[j].grading_periods[k].name;
                    const porcentaje_periodo_calificacion = arr[i].calificaciones[j].grading_periods[k].percent;
                    const nota_periodo_calificacion = arr[i].calificaciones[j].grading_periods[k].grade;
                    for (let l = 0; l < arr[i].calificaciones[j].grading_periods[k].assignments.length; l++) {
                        const id_tarea = arr[i].calificaciones[j].grading_periods[k].assignments[l].id;
                        const fecha_presentacion = arr[i].calificaciones[j].grading_periods[k].assignments[l].submitted_at || "";
                        const porcentaje = arr[i].calificaciones[j].grading_periods[k].assignments[l].percent;
                        const nota = arr[i].calificaciones[j].grading_periods[k].assignments[l].grade;
                        const puntaje = arr[i].calificaciones[j].grading_periods[k].assignments[l].score;
                        const resultNotaTarea = await consulta(sqlNotastareasPorId, [id_tarea, id_curso, id_usuario]);
                        if (resultNotaTarea.ok) {
                            if (resultNotaTarea.data.length == 0) {
                                let valueNotaTarea = `(UPPER('${nombre_periodo_calificacion}'),'${porcentaje_periodo_calificacion}', '${nota_periodo_calificacion}', '${fecha_presentacion}', '${porcentaje}', '${nota}', '${puntaje}', ${id_tarea}, ${id_curso}, ${id_usuario}, '${userDatos.usuario.split('@')[0]}'),`;
                                valuesNotasTareas = valuesNotasTareas + valueNotaTarea;
                            } else {
                                const updaten = await consulta(sqlUpdateNotasTareas, [nombre_periodo_calificacion, porcentaje_periodo_calificacion, nota_periodo_calificacion, fecha_presentacion, porcentaje, nota, puntaje, id_tarea, id_curso, id_usuario]);
                                contUpdateN = updaten.ok ? contUpdateN + 1 : contUpdateN;
                            }
                        }
                    }
                }
            }
        }
        respuesta.data.calificaciones.update = "Registros actualizados " + contUpdateC;
        respuesta.data.notas.update = "Registros actualizados " + contUpdateN;
        if (valuesCalificaciones.length > 0) {
            const sql = sqlInsertCalificaciones + valuesCalificaciones.substring(0, valuesCalificaciones.length - 1) + ";";
            const insertc = await consulta(sql, []);
            if (insertc.ok) {
                respuesta.data.calificaciones.insert = JSON.stringify(insertc.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                );
                respuesta.data.calificaciones.update = "Registros actualizados " + contUpdateC;
            } else {
                return error({
                    msg: "Error interno del servidor",
                    error: JSON.stringify(insertc.error, (key, value) =>
                        typeof value === "bigint" ? value.toString() + "" : value
                    )
                })
            }
        }
        if (valuesNotasTareas.length > 0) {
            const sql = sqlInsertNotasTareas + valuesNotasTareas.substring(0, valuesNotasTareas.length - 1) + ";";
            const insertn = await consulta(sql, []);
            if (insertn.ok) {
                respuesta.data.notas.insert = JSON.stringify(insertn.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                );
                respuesta.data.notas.update = "Registros actualizados " + contUpdateN;
            } else {
                return error({
                    msg: "Error interno del servidor",
                    error: JSON.stringify(insertn.error, (key, value) =>
                        typeof value === "bigint" ? value.toString() + "" : value
                    )
                })
            }
        }
        return success(respuesta);
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

module.exports = {
    guardarCalificaciones
}