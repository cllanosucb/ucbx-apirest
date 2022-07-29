require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const { formatoFecha } = require('../tools/util.tools');

registrarAsignaturasPregrado = async(datos, user) => {
    let insert = {};
    let contErrorInsert = 0;
    let contUpdate = 0;
    let contErroUpdate = 0;
    const sqlParalelosPorId = "SELECT * FROM Datos_asignaturas WHERE id_paralelo = ?";
    const sqlInsertAsignaturas = `INSERT INTO Datos_asignaturas (semestre_descripcion,semestre_fecha_inicio,semestre_fecha_fin,semestre_resumido,id_semestre,id_paralelo,paralelo_num_creditos,numero_paralelo,id_materia,materia_sigla,materia_nombre,id_carrera,carrera_nombre,departamento_materia,num_alumnos_inscritos,id_docente,ap_paterno_docente,ap_materno_docente,nombres_docente,ci_docente,sexo_docente,fecha_nacimiento_docente,celular_docente,email_ucb_docente,id_regional,nombre_regional,departamento_docente,codigo_curso_plantilla,codigo_curso_paralelo,usuario_registro) 
    VALUES `;
    const sqlUpdateAsignaturas = `UPDATE Datos_asignaturas SET id_docente=?, ap_paterno_docente=?, ap_materno_docente=?, nombres_docente=?, ci_docente=?,
    sexo_docente=?, fecha_nacimiento_docente=?, celular_docente=?, email_ucb_docente=?, id_regional=?, nombre_regional=?, departamento_docente=?, docente_nuevo=?, usuario_registro=? WHERE id_paralelo = ?`;
    let valuesIsert = "";
    const listAnt = await listDatosAnt(datos);
    for (let i = 0; i < datos.length; i++) {
        existeDato = listAnt.find(a => a.id_paralelo == datos[i].id_paralelo);
        if (existeDato === undefined) {
            valuesIsert = valuesIsert + valoresAsignatura(datos[i], user);
        } else {
            if (datos[i].id_docente != existeDato.id_docente) {
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
        }
    }
    const valuesi = valuesIsert.substring(0, valuesIsert.length - 1) + ";";
    if (valuesi.length > 1) {
        const valuesInsert = sqlInsertAsignaturas + valuesi;
        insert = await consulta(valuesInsert, []);
    }
    return success({
        insert: insert,
        contUpdate,
        contErroUpdate
    });
}

registrarInscripcionesPregrado = async(datos, user) => {
    let contInsert = datos.length;
    const sqlInsertInscripciones = "INSERT INTO Datos_inscripciones (fecha_registro_est, estado_movimiento, movimiento, id_regional, nombre_regional, id_semestre, id_paralelo, id_materia, sigla_materia, nombre_materia, numero_paralelo, id_carrera, carrera, doc_identidad_est, nombres_est, ap_paterno_est, ap_materno_est, fecha_nacimiento_est, sexo_est, celular_est, id_persona_est, email_ucb_est, codigo_curso_paralelo, usuario_registro) VALUES ";
    let valuesInscripciones = "";
    for (let i = 0; i < datos.length; i++) {
        let value = transformarDatosInscripcion(datos[i], user);
        valuesInscripciones = valuesInscripciones + value;
    }
    if (valuesInscripciones.length > 0) {
        const sql = sqlInsertInscripciones + valuesInscripciones.substring(0, valuesInscripciones.length - 1) + ";";
        const respInsert = await consulta(sql, []);
        if (respInsert.ok) {
            return success({
                msg: "Registros creados",
                data: {
                    insert: respInsert.data,
                    msg: `Datos registrados ${contInsert}`
                }
            });
        } else {
            return error({
                msg: "Error interno del servidor",
                error: respInsert.error
            });
        }
    } else {
        return success({
            msg: "Registros creados",
            data: {
                insert: "Registros creados 0",
                msg: `Datos registrados ${contInsert}`
            }
        });
    }
}

const listDatosAnt = async(lista) => {
    let paralelos = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";

    });
    const datos = paralelos.substring(0, paralelos.length - 1);
    const sqlDatos = `SELECT * FROM Datos_asignaturas WHERE id_paralelo in (${datos})`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : [];
}

transformarDatosAsignatura = (a, user) => {
    return [
        a.semestre_descripcion.toLowerCase() === 'null' ? JSON.parse(a.semestre_descripcion) : a.semestre_descripcion,
        formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD'),
        formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD'),
        a.semestre_resumido,
        a.id_semestre.toString().toLowerCase() === 'null' ? JSON.parse(a.id_semestre) : a.id_semestre,
        a.id_paralelo,
        a.paralelo_num_creditos.toString().toLowerCase() === 'null' ? JSON.parse(a.paralelo_num_creditos) : a.paralelo_num_creditos,
        a.numero_paralelo,
        a.id_materia,
        a.materia_sigla,
        a.materia_nombre,
        a.id_carrera.toString().toLowerCase() === 'null' ? JSON.parse(a.id_carrera) : a.id_carrera,
        a.carrera_nombre.toLowerCase() === 'null' ? JSON.parse(a.carrera_nombre) : a.carrera_nombre,
        a.departamento_materia.toLowerCase() === 'null' ? JSON.parse(a.departamento_materia) : a.departamento_materia,
        a.num_alumnos_inscritos.toString().toString().toLowerCase() === 'null' ? JSON.parse(a.num_alumnos_inscritos) : a.num_alumnos_inscritos,
        a.id_docente,
        a.ap_paterno_docente.toString().toLowerCase() === 'null' ? JSON.parse(a.ap_paterno_docente) : a.ap_paterno_docente,
        a.ap_materno_docente.toString().toLowerCase() === 'null' ? JSON.parse(a.ap_materno_docente) : a.ap_materno_docente,
        a.nombres_docente,
        a.ci_docente,
        a.sexo_docente.toString().toLowerCase() === 'null' ? JSON.parse(a.sexo_docente) : a.sexo_docente,
        a.fecha_nacimiento_docente.toString().toLowerCase() === 'null' ? JSON.parse(a.fecha_nacimiento_docente) : a.fecha_nacimiento_docente,
        a.celular_docente.toString().toLowerCase() === 'null' ? JSON.parse(a.celular_docente) : a.celular_docente,
        a.email_ucb_docente.toLowerCase() === 'null' ? JSON.parse(a.email_ucb_docente) : a.email_ucb_docente,
        a.id_regional.toString().toLowerCase() === 'null' ? JSON.parse(a.id_regional) : a.id_regional,
        a.nombre_regional,
        a.departamento_docente.toLowerCase() === 'null' ? JSON.parse(a.departamento_docente) : a.departamento_docente,
        `'${a.id_regional}.${a.id_materia}.${a.id_docente}'`,
        `'${a.id_regional}.${a.id_paralelo}'`,
        user,
    ];
}

const valoresAsignatura = (a, user) => {
        return `(${a.semestre_descripcion === undefined ? null : `'${a.semestre_descripcion}'`},'${formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD')}','${formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD')}','${a.semestre_resumido}',${a.id_semestre === undefined ? null : `'${a.id_semestre}'`},${a.id_paralelo},${a.paralelo_num_creditos === undefined ? null : a.paralelo_num_creditos},${a.numero_paralelo},${a.id_materia},'${a.materia_sigla}','${a.materia_nombre}',${a.id_carrera === undefined ? null : a.id_carrera},${a.carrera_nombre === undefined ? null : `'${a.carrera_nombre}'`},${a.departamento_materia === undefined ? null : `'${a.departamento_materia}'`},${a.num_alumnos_inscritos === undefined ? null : `'${a.num_alumnos_inscritos}'`},${a.id_docente},${a.ap_paterno_docente === undefined ? null : `'${a.ap_paterno_docente}'`},${a.ap_materno_docente === undefined ? null : `'${a.ap_materno_docente}'`},'${a.nombres_docente}','${a.ci_docente}',${a.sexo_docente === undefined ? null : a.sexo_docente},${a.fecha_nacimiento_docente === undefined ? null : `'${formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD')}'`},${a.celular_docente === undefined ? null : `'${a.celular_docente}'`},${a.email_ucb_docente === undefined ? null : `'${a.email_ucb_docente}'`},${a.id_regional === undefined ? null : a.id_regional},'${a.nombre_regional}',${a.departamento_docente === undefined ? null : `'${a.departamento_docente}'`},'${a.id_regional}.${a.id_materia}.${a.id_docente}','${a.id_regional}.${a.id_paralelo}','${user}'),`;
}

transformarDatosAsignaturaUpdate = (a, user) => {
    return [
        a.id_docente,
        a.ap_paterno_docente === undefined ? null : a.ap_paterno_docente,
        a.ap_materno_docente === undefined ? null : a.ap_materno_docente,
        a.nombres_docente,
        a.ci_docente,
        a.sexo_docente === undefined ? null : a.sexo_docente,
        a.fecha_nacimiento_docente === undefined ? null : formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD'),
        a.celular_docente === undefined ? null : a.celular_docente,
        a.email_ucb_docente === undefined ? null : a.email_ucb_docente,
        a.id_regional === undefined ? null : a.id_regional,
        a.nombre_regional,
        a.departamento_docente === undefined ? null : a.departamento_docente,
        1,
        user,
        a.id_paralelo
    ];
}

transformarDatosInscripcion = (i, user) => {
    return `(
        '${formatoFecha(i.fecha_registro_est, 'YYYY-MM-DD HH:mm:ss')}',
        ${i.estado_movimiento === undefined ? null : i.estado_movimiento},
        ${i.movimiento === undefined ? null : `'${i.movimiento}'`},
        ${i.id_regional === undefined ? null : i.id_regional},
        '${i.nombre_regional}',
        ${i.id_semestre},
        ${i.id_paralelo},
        ${i.id_materia === undefined ? null : i.id_materia},
        '${i.sigla_materia}',
        '${i.nombre_materia}',
        '${i.numero_paralelo}',
        ${i.id_carrera === undefined ? null : i.id_carrera},
        ${i.carrera === undefined ? null : `'${i.carrera}'`},
        '${i.doc_identidad_est === undefined ? null : i.doc_identidad_est}',
        '${i.nombres_est}',
        ${i.ap_paterno_est === undefined ? null : `'${i.ap_paterno_est}'`},
        ${i.ap_materno_est === undefined ? null : `'${i.ap_materno_est}'`},
        ${i.fecha_nacimiento_est === undefined ? null : `'${formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD')}'`},
        ${i.sexo_est === undefined ? null : i.sexo_est},
        ${i.celular_est === undefined ? null : `'${i.celular_est}'`},
        ${i.id_persona_est},
        ${i.email_ucb_est === undefined ? null : `'${i.email_ucb_est}'`},
        '${i.id_regional}.${i.id_paralelo}'
        '${user}'
    ),`;
}



module.exports = {
    registrarAsignaturasPregrado,
    registrarInscripcionesPregrado
}