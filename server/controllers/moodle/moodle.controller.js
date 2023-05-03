require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const { formatoFecha, otroFormatoFecha } = require('../tools/util.tools');

/** Definición de SQL */
const sqlParalelosPorId = "SELECT * FROM Datos_asignaturas_postgrado WHERE id_paralelo = ?";
const sqlInsertAsignaturas = `INSERT INTO Datos_asignaturas_postgrado (
    semestre_descripcion,semestre_fecha_inicio,semestre_fecha_fin,semestre_resumido,id_semestre,id_paralelo,paralelo_num_creditos,numero_paralelo,
    id_materia,materia_sigla,materia_nombre,id_carrera,carrera_nombre,departamento_materia,num_alumnos_inscritos,id_docente,ap_paterno_docente,
    ap_materno_docente,nombres_docente,ci_docente,sexo_docente,fecha_nacimiento_docente,celular_docente,email_ucb_docente,id_regional,nombre_regional,
    departamento_docente,codigo_curso_plantilla,codigo_curso_paralelo,usuario_registro
    ) VALUES `;
const sqlUpdateAsignaturas = `UPDATE Datos_asignaturas_postgrado SET 
    id_docente=?, ap_paterno_docente=?, ap_materno_docente=?, nombres_docente=?, ci_docente=?, sexo_docente=?, fecha_nacimiento_docente=?, celular_docente=?, 
    email_ucb_docente=?, id_regional=?, nombre_regional=?, departamento_docente=?, docente_nuevo=?, usuario_registro=? WHERE id_paralelo = ?`;
/** Definición de SQL */

registrarAsignaturasMoodle = async (datos, user) => {
    let insert = {};
    let contInsert = 0;
    let contErrorInsert = 0;
    let contUpdate = 0;
    let contErroUpdate = 0;
    
    let valuesInsert = "";
    const listAnt = await listDatosAnt(datos);
    console.log("listAnt.length teoricas", listAnt.length);
    for (let i = 0; i < datos.length; i++) {
        existeDato = listAnt.find(a => a.id_paralelo == datos[i].id_paralelo);
        if (existeDato === undefined) {
            valuesInsert = valuesInsert + valoresAsignaturaPostgrado(datos[i], user);
        } else {
            if (datos[i].id_docente != existeDato.id_docente) {
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaPostgradoUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
            if (datos[i].id_docente == existeDato.id_docente && datos[i].email_ucb_docente.toLowerCase() != existeDato.email_ucb_docente) {
                console.log(datos[i].id_docente + '==' + existeDato.id_docente + '&&' + datos[i].email_ucb_docente + '!=' + existeDato.email_ucb_docente);
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaPostgradoUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
        }
    }
    const valuesi = valuesInsert.substring(0, valuesInsert.length - 1) + ";";
    if (valuesi.length > 1) {
        const valuesInsert = sqlInsertAsignaturas + valuesi;
        insert = await consulta(valuesInsert, []);
    }
    //cambiar estado de paralelo_nuevo a existentes
    const quitarEsistentes = await verificarCreacionAsignaturasPostgrado(datos);
    console.log("quitarEsistentes", quitarEsistentes);
    return success({
        insert: insert,
        contUpdate,
        contErroUpdate
    });
}

const listaDatosRegistrados = async (lista) => {
    let paralelos = "";
    let tipo_paralelo = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";
        if (!tipo_paralelo.includes(a.id_paralelo)) {
            tipo_paralelo = tipo_paralelo + a.tipo_paralelo + ",";
        }
    });
    const ids_paralelos = paralelos.substring(0, paralelos.length - 1);
    const tipo = tipo_paralelo.substring(0, tipo_paralelo.length - 1);
    const sqlDatos = `SELECT * FROM Datos_asignaturas_moodle WHERE id_paralelo in (${ids_paralelos}) and tipo_paralelo in (${tipo})`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : [];
}

const valoresAsignatura = (a, user) => {
    return `(${a.semestre_descripcion === undefined ? null : `'${a.semestre_descripcion}'`},'${formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD')}','${formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD')}','${a.semestre_resumido}',${a.id_semestre === undefined ? null : `'${a.id_semestre}'`},${a.id_paralelo},${a.paralelo_num_creditos === undefined ? null : a.paralelo_num_creditos},${a.numero_paralelo},${a.id_materia},'${a.materia_sigla}','${a.materia_nombre}',${a.id_carrera === undefined ? null : a.id_carrera},${a.carrera_nombre === undefined ? null : `'${a.carrera_nombre}'`},${a.departamento_materia === undefined ? null : `'${a.departamento_materia}'`},${a.num_alumnos_inscritos === undefined ? null : `'${a.num_alumnos_inscritos}'`},${a.id_docente},${a.ap_paterno_docente === undefined ? null : `'${a.ap_paterno_docente}'`},${a.ap_materno_docente === undefined ? null : `'${a.ap_materno_docente}'`},'${a.nombres_docente}','${a.ci_docente}',${a.sexo_docente === undefined ? null : a.sexo_docente},${a.fecha_nacimiento_docente === undefined ? null : `'${formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD')}'`},${a.celular_docente === undefined ? null : `'${a.celular_docente}'`},${a.email_ucb_docente === undefined ? null : `'${a.email_ucb_docente.toLowerCase()}'`},${a.id_regional === undefined ? null : a.id_regional},'${a.nombre_regional}',${a.departamento_docente === undefined ? null : `'${a.departamento_docente}'`},'${a.id_regional}.${a.id_materia}.${a.id_docente}','${a.id_regional}.${a.id_paralelo}','${user}'),`;
}

transformarDatosAsignaturaPostgradoUpdate = (a, user) => {
    return [
        a.id_docente,
        a.ap_paterno_docente === undefined ? null : a.ap_paterno_docente,
        a.ap_materno_docente === undefined ? null : a.ap_materno_docente,
        a.nombres_docente,
        a.ci_docente,
        a.sexo_docente === undefined ? null : a.sexo_docente,
        a.fecha_nacimiento_docente === undefined ? null : formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD'),
        a.celular_docente === undefined ? null : a.celular_docente,
        a.email_ucb_docente === undefined ? null : a.email_ucb_docente.toLowerCase(),
        a.id_regional === undefined ? null : a.id_regional,
        a.nombre_regional,
        a.departamento_docente === undefined ? null : a.departamento_docente,
        1,
        user,
        a.id_paralelo
    ];
}

const verificarCreacionAsignaturasPostgrado = async (lista) => {
    let paralelos = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";

    });
    const datos = paralelos.length > 0 ? paralelos.substring(0, paralelos.length - 1) : '';
    const sqlDatos = `UPDATE Datos_asignaturas_postgrado SET paralelo_nuevo = 0, docente_nuevo = 0 
    WHERE id_paralelo in (SELECT da.id_paralelo
        FROM Datos_asignaturas_postgrado da, Cursos c
        WHERE da.codigo_curso_paralelo = c.codigo_curso
        and da.paralelo_nuevo = 1
        and da.id_paralelo in (${datos}))`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : result.error;
}

module.exports = {
    registrarAsignaturasMoodle
}