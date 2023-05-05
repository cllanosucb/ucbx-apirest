require('dotenv').config();
const db = require('../../db/mariadb');
const { consultaMoodle } = require('./query.moodle.controller');
const { consulta } = require('../querys.controller');
const { error, success } = require('./respuestas.moodle.controller');
const { formatoFecha, literalTipoParalelo } = require('../../tools/util.tools');

/** Definición de SQL */
const SQLInsertAsignaturas = `INSERT INTO Datos_asignaturas_moodle (
    semestre_descripcion,semestre_fecha_inicio,semestre_fecha_fin,semestre_resumido,id_semestre,id_paralelo,paralelo_num_creditos,numero_paralelo,
    id_materia, materia_sigla, materia_nombre, id_carrera, carrera_nombre, departamento_materia, num_alumnos_inscritos, id_regional, nombre_regional,
    tipo_paralelo, paralelo_nuevo, usuario_registro
    ) VALUES `;
const SQLInsertDocentes = `INSERT INTO Docentes_paralelos_moodle (
    id_paralelo, id_semestre, tipo_paralelo, id_docente, ap_paterno_docente, ap_materno_docente, nombres_docente, ci_docente, sexo_docente,
    fecha_nacimiento_docente, celular_docente, email_ucb_docente, id_regional, nombre_regional, departamento_docente,
    estado_asignacion, estado_registro, usuario_registro
    ) VALUES `;
const SQLUpdateDocentes = `UPDATE Docentes_paralelos_moodle SET 
    id_semestre = ?, ap_paterno_docente = ?, ap_materno_docente = ?, nombres_docente = ?, ci_docente = ?, sexo_docente = ?, fecha_nacimiento_docente = ?,
    celular_docente = ?, email_ucb_docente = ?, id_regional = ?, nombre_regional = ?, departamento_docente = ?, estado_asignacion = 1, estado_registro = 1
    WHERE id_paralelo = ? AND tipo_paralelo = ? AND id_docente = ?;`;
const SQLUpdateDocentesRetiros = `UPDATE Docentes_paralelos_moodle SET 
    estado_asignacion = 0, estado_registro = 1 
    WHERE id_paralelo = ? AND tipo_paralelo = ? AND id_docente = ?;`;
/** Definición de SQL */

const registrarAsignaturasMoodle = async (datos, user) => {
    let resultInsertAsignaturas = {};
    let resultInsertDocente = {};
    let listUpdate = [];
    let listRetiros = [];
    let contUpdate = 0;
    let contErroUpdate = 0;
    let contUpdateRetirosDocentes = 0;
    let contErroUpdateRetirosDocentes = 0;
    let valuesInsertAsignaturas = "";
    let valuesInsertDocentes = "";

    /**Registrar paralelos */
    const listaAsignaturasAnteriores = await listaDatosAsignaturasRegistrados(datos);
    console.log('Asignaturas ',listaAsignaturasAnteriores.length);    
    for (let i = 0; i < datos.length; i++) {
        existeDato = listaAsignaturasAnteriores.find(a => a.id_paralelo == datos[i].id_paralelo && a.tipo_paralelo == datos[i].tipo_paralelo);
        if (existeDato === undefined) {
            //console.log(valoresAsignatura(datos[i], user));
            valuesInsertAsignaturas = valuesInsertAsignaturas + valoresAsignatura(datos[i], user);
        }
    }
    const valuesAsignaturas = valuesInsertAsignaturas.substring(0, valuesInsertAsignaturas.length - 1) + ";";
    if (valuesAsignaturas.length > 1) {
        const valuesInsert = SQLInsertAsignaturas + valuesAsignaturas;
        resultInsertAsignaturas = await consultaMoodle(valuesInsert, []);
    }
    /**Registrar paralelos */

    /**Registrar Docentes paralelos */
    const listDocentesParalelosAnteriores = await listaDatosDocentesParalelosRegistrados(datos);
    console.log('Docentes_paralelos', listDocentesParalelosAnteriores.length);
    for (let i = 0; i < datos.length; i++) {
        docentes = listDocentesParalelosAnteriores.filter(a => a.id_paralelo == datos[i].id_paralelo && a.tipo_paralelo == datos[i].tipo_paralelo);
        existeDato = docentes.find(a => a.id_docente == datos[i].id_docente);
        if (existeDato === undefined) {
            valuesInsertDocentes = valuesInsertDocentes + valoresDocente(datos[i], user);
        } else {
            if (datos[i].email_ucb_docente.toLowerCase() != existeDato.email_ucb_docente) {
                const respUpdate = await consultaMoodle(SQLUpdateDocentes, datosActualizarDocente(datos[i], user));
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
                listUpdate.push({
                    id_semestre: datos[i].id_semestre,
                    id_paralelo: datos[i].id_paralelo,
                    sigla_materia: datos[i].sigla_materia,
                    nombre_materia: datos[i].nombre_materia,
                    numero_paralelo: datos[i].numero_paralelo,
                    id_docente: datos[i].id_docente,
                    ci_docente: datos[i].ci_docente,
                    ap_paterno_docente: datos[i].ap_paterno_docente,
                    ap_materno_docente: datos[i].ap_materno_docente,
                    nombres_docente: datos[i].nombres_docente,
                    email_ucb_docente: datos[i].email_ucb_docente,
                    tipo_paralelo: literalTipoParalelo(datos[i].tipo_paralelo)
                })
            }
            if (existeDato.estado_asignacion === 0) {
                const respUpdate = await consultaMoodle(SQLUpdateDocentes, datosActualizarDocente(datos[i], user));
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
                listUpdate.push({
                    id_semestre: datos[i].id_semestre,
                    id_paralelo: datos[i].id_paralelo,
                    sigla_materia: datos[i].materia_sigla,
                    nombre_materia: datos[i].materia_nombre,
                    numero_paralelo: datos[i].numero_paralelo,
                    id_docente: datos[i].id_docente,
                    ci_docente: datos[i].ci_docente,
                    ap_paterno_docente: datos[i].ap_paterno_docente,
                    ap_materno_docente: datos[i].ap_materno_docente,
                    nombres_docente: datos[i].nombres_docente,
                    email_ucb_docente: datos[i].email_ucb_docente,
                    tipo_paralelo: literalTipoParalelo(datos[i].tipo_paralelo)
                })
            }

            const itemDocente = listDocentesParalelosAnteriores.find(item => item.id_paralelo == datos[i].id_paralelo && item.tipo_paralelo == datos[i].tipo_paralelo && item.id_docente == datos[i].id_docente);

            if (itemDocente) {
                itemDocente.estado = 0;
            }
        }
    }
    const valuesDocentes = valuesInsertDocentes.substring(0, valuesInsertDocentes.length - 1) + ";";
    if (valuesDocentes.length > 1) {
        const valuesInsert = SQLInsertDocentes + valuesDocentes;
        resultInsertDocente = await consultaMoodle(valuesInsert, []);
    }
    for (let i = 0; i < listDocentesParalelosAnteriores.length; i++) {
        if(listDocentesParalelosAnteriores[i].estado === 1) {
            const respUpdate = await consultaMoodle(SQLUpdateDocentesRetiros, [listDocentesParalelosAnteriores[i].id_paralelo, listDocentesParalelosAnteriores[i].tipo_paralelo, listDocentesParalelosAnteriores[i].id_docente]);
            contUpdateRetirosDocentes = respUpdate.ok ? contUpdateRetirosDocentes + 1 : contErroUpdateRetirosDocentes + 1;
            let paralelo = {};
            for (let index = 0; index < datos.length; index++) {
                if (datos[index].id_paralelo === listDocentesParalelosAnteriores[i].id_paralelo && datos[index].tipo_paralelo === listDocentesParalelosAnteriores[i].tipo_paralelo){
                    console.log('paralelo' + datos[index].id_paralelo);
                    paralelo = datos[index];
                }
            }
            listRetiros.push({
                id_semestre: listDocentesParalelosAnteriores[i].id_semestre,
                id_paralelo: listDocentesParalelosAnteriores[i].id_paralelo,
                sigla_materia: paralelo ? paralelo.materia_sigla : null,
                nombre_materia: paralelo ? paralelo.materia_nombre : null,
                numero_paralelo: paralelo ? paralelo.numero_paralelo : null,
                id_docente: listDocentesParalelosAnteriores[i].id_docente,
                ci_docente: listDocentesParalelosAnteriores[i].ci_docente,
                ap_paterno_docente: listDocentesParalelosAnteriores[i].ap_paterno_docente,
                ap_materno_docente: listDocentesParalelosAnteriores[i].ap_materno_docente,
                nombres_docente: listDocentesParalelosAnteriores[i].nombres_docente,
                email_ucb_docente: listDocentesParalelosAnteriores[i].email_ucb_docente,
                tipo_paralelo: literalTipoParalelo(datos[i].tipo_paralelo)
            })
        }
    }
    /**Registrar Docentes paralelos */

    
    return success({
        asignaturas: {
            resultInsertAsignaturas: JSON.stringify(resultInsertAsignaturas, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            ),
        },
        docentesParalelos: {
            resultInsertDocente: JSON.stringify(resultInsertDocente, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            ),
            contUpdate,
            contErroUpdate,
            contUpdateRetirosDocentes,
            contErroUpdateRetirosDocentes,
            listaActualizacionDocentes: listUpdate,
            listaRetiroDocente: listRetiros
        }
    });
}

const listaDatosAsignaturasRegistrados = async (lista) => {
    let paralelos = "";
    let tipo_paralelo = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";
        if (!tipo_paralelo.includes(a.tipo_paralelo)) {
            tipo_paralelo = tipo_paralelo +  a.tipo_paralelo + ",";
        }
    });
    const ids_paralelos = paralelos.substring(0, paralelos.length - 1);
    const tipo = tipo_paralelo.substring(0, tipo_paralelo.length - 1);
    const sqlDatos = `SELECT * FROM Datos_asignaturas_moodle WHERE id_paralelo in (${ids_paralelos}) and tipo_paralelo in (${tipo})`;
    const result = await consultaMoodle(sqlDatos, []);
    return result.ok ? result.data : [];
}

const valoresAsignatura = (a, user) => {
    return `(
        ${a.semestre_descripcion === undefined ? null : `'${a.semestre_descripcion}'`},
        '${formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD')}',
        '${formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD')}',
        '${a.semestre_resumido}',
        ${a.id_semestre},
        ${a.id_paralelo},
        ${a.paralelo_num_creditos === undefined ? null : a.paralelo_num_creditos},
        '${a.numero_paralelo}',
        ${a.id_materia},
        '${a.materia_sigla}',
        '${a.materia_nombre}',
        ${a.id_carrera === undefined ? null : a.id_carrera},
        ${a.carrera_nombre === undefined ? null : `'${a.carrera_nombre}'`},
        ${a.departamento_materia === undefined ? null : `'${a.departamento_materia}'`},
        ${a.num_alumnos_inscritos === undefined ? null : `'${a.num_alumnos_inscritos}'`},
        ${a.id_regional === undefined ? null : a.id_regional},
        '${a.nombre_regional}',
        ${a.tipo_paralelo},
        0,
        '${user}'
        ),`;
}

const listaDatosDocentesParalelosRegistrados = async (lista) => {
    let paralelos = "";
    let tipo_paralelo = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";
        if (!tipo_paralelo.includes(a.tipo_paralelo)) {
            tipo_paralelo = tipo_paralelo + a.tipo_paralelo + ",";
        }
    });
    const ids_paralelos = paralelos.substring(0, paralelos.length - 1);
    const tipo = tipo_paralelo.substring(0, tipo_paralelo.length - 1);    
    const sqlDatos = `SELECT * FROM Docentes_paralelos_moodle WHERE id_paralelo in (${ids_paralelos}) and tipo_paralelo in (${tipo})`;
    const result = await consultaMoodle(sqlDatos, []);
    if (result.ok /*|| result.data.length > 0*/) {

        const data = result.data.map(item => {
            return {...item, estado: 1}
        });
        return data

    }
    return [];
}

const valoresDocente = (a, user) => {
    return `(
        ${a.id_paralelo},
        ${a.id_semestre === undefined ? null : `'${a.id_semestre}'`},
        ${a.tipo_paralelo},
        ${a.id_docente},
        ${a.ap_paterno_docente === undefined ? null : `'${a.ap_paterno_docente}'`},
        ${a.ap_materno_docente === undefined ? null : `'${a.ap_materno_docente}'`},
        '${a.nombres_docente}',
        '${a.ci_docente}',
        ${a.sexo_docente === undefined ? null : a.sexo_docente},
        ${a.fecha_nacimiento_docente === undefined ? null : `'${formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD')}'`},
        ${a.celular_docente === undefined ? null : `'${a.celular_docente}'`},
        ${a.email_ucb_docente === undefined ? null : `'${a.email_ucb_docente.toLowerCase()}'`},
        ${a.id_regional === undefined ? null : a.id_regional},
        '${a.nombre_regional}',
        ${a.departamento_docente === undefined ? null : `'${a.departamento_docente}'`},
        1,
        1,
        '${user}'
        ),`;
}

const datosActualizarDocente = (a, user) => {
    return [
        a.id_semestre,
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
        a.id_paralelo,
        a.tipo_paralelo,
        a.id_docente
    ];
}

const llavesPorUsuario = async (id_instancia, id_usuario) => {
    const sqlLlavePorUsuario = `select distinct l.url_instancia, l.api_key
    from rolusu ru, Llaves l, Roles r
    where ru.id_llave = l.id_llave and ru.id_rol = r.id_rol
    and r.id_instancia = ? and ru.id_usuario = ?`;
    const resultLlaves = await consulta(sqlLlavePorUsuario, [id_instancia, id_usuario]);
    if (!resultLlaves.ok) {
        return error({
            msg: "Error interno del servidor",
            error: resultLlaves.error.error
        })
    }
    if (resultLlaves.data.length == 0) {
        return error({
            msg: "No tienes un apikey asignado para proceder",
            error: null
        })
    }
    return success(resultLlaves.data);
}

module.exports = {
    registrarAsignaturasMoodle,
    llavesPorUsuario
}