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
    console.log("listAnt.length teoricas", listAnt.length);
    for (let i = 0; i < datos.length; i++) {
        existeDato = listAnt.find(a => a.id_paralelo == datos[i].id_paralelo);
        if (existeDato === undefined) {
            valuesIsert = valuesIsert + valoresAsignatura(datos[i], user);
        } else {
            if (datos[i].id_docente != existeDato.id_docente) {
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
            if (datos[i].id_docente == existeDato.id_docente && datos[i].email_ucb_docente != existeDato.email_ucb_docente) {
                console.log(datos[i].id_docente + '==' + existeDato.id_docente + '&&' + datos[i].email_ucb_docente + '!=' + existeDato.email_ucb_docente);
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
        }
    }
    const valuesi = valuesIsert.substring(0, valuesIsert.length - 1) + ";";
    if (valuesi.length > 1) {
        const valuesInsert = sqlInsertAsignaturas + valuesi;
        insert = await consulta(valuesInsert, []);
    }
    //cambiar estado de paralelo_nuevo a existentes
    const quitarEsistentes = await verificarCreacionAsignaturas(datos);
    console.log("quitarEsistentes", quitarEsistentes);
    return success({
        insert: insert,
        contUpdate,
        contErroUpdate
    });
}

registrarInscripcionesPregrado = async(datos, user) => {
    let contInsert = datos.length;
    const sqlInsertInscripciones = "INSERT INTO Datos_inscripciones (fecha_registro_est, estado_movimiento, movimiento, id_regional, nombre_regional, id_semestre, id_paralelo, id_materia, sigla_materia, nombre_materia, numero_paralelo, id_carrera, carrera, doc_identidad_est, nombres_est, ap_paterno_est, ap_materno_est, fecha_nacimiento_est, sexo_est, celular_est, id_persona_est, email_ucb_est, codigo_curso_paralelo, codigo_inscripcion_est, usuario_registro) VALUES ";
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
                msg: `Datos registrados ${contInsert}`,
                data: JSON.stringify(respInsert.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        } else {
            return error({
                msg: "Error interno del servidor",
                error: JSON.stringify(respInsert.error, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        }
    } else {
        return success({
            msg: "Registros creados",
            data: {
                msg: `Datos registrados ${contInsert}`,
                insert: "Registros creados 0"
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

const verificarCreacionAsignaturas = async(lista) => {
    let paralelos = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo + ",";

    });
    const datos = paralelos.length > 0 ? paralelos.substring(0, paralelos.length - 1) : '';
    const sqlDatos = `UPDATE Datos_asignaturas SET paralelo_nuevo = 0, docente_nuevo = 0 
    WHERE id_paralelo in (SELECT da.id_paralelo
        FROM Datos_asignaturas da, Cursos c
        WHERE da.codigo_curso_paralelo = c.codigo_curso
        and da.paralelo_nuevo = 1
        and da.id_paralelo in (${datos}))`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : result.error;
}

transformarDatosAsignatura = (a, user) => {
    return [
        a.semestre_descripcion === undefined ? null : a.semestre_descripcion,
        formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD'),
        formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD'),
        a.semestre_resumido,
        a.id_semestre === undefined ? null : a.id_semestre,
        a.id_paralelo,
        a.paralelo_num_creditos === undefined ? null : a.paralelo_num_creditos,
        a.numero_paralelo,
        a.id_materia,
        a.materia_sigla,
        a.materia_nombre,
        a.id_carrera === undefined ? null : a.id_carrera,
        a.carrera_nombre === undefined ? null : a.carrera_nombre,
        a.departamento_materia === undefined ? null : a.departamento_materia,
        a.num_alumnos_inscritos === undefined ? null : a.num_alumnos_inscritos,
        a.id_docente,
        a.ap_paterno_docente === undefined ? null : a.ap_paterno_docente,
        a.ap_materno_docente === undefined ? null : a.ap_materno_docente,
        a.nombres_docente,
        a.ci_docente,
        a.sexo_docente === undefined ? null : a.sexo_docente,
        a.fecha_nacimiento_docente === undefined ? null : a.fecha_nacimiento_docente,
        a.celular_docente === undefined ? null : a.celular_docente,
        a.email_ucb_docente === undefined ? null : a.email_ucb_docente.toLowerCase(),
        a.id_regional === undefined ? null : a.id_regional,
        a.nombre_regional,
        a.departamento_docente === undefined ? null : a.departamento_docente,
        `'${a.id_regional}.${a.id_materia}.${a.id_docente}'`,
        `'${a.id_regional}.${a.id_paralelo}'`,
        user,
    ];
}

const valoresAsignatura = (a, user) => {
        return `(${a.semestre_descripcion === undefined ? null : `'${a.semestre_descripcion}'`},'${formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD')}','${formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD')}','${a.semestre_resumido}',${a.id_semestre === undefined ? null : `'${a.id_semestre}'`},${a.id_paralelo},${a.paralelo_num_creditos === undefined ? null : a.paralelo_num_creditos},${a.numero_paralelo},${a.id_materia},'${a.materia_sigla}','${a.materia_nombre}',${a.id_carrera === undefined ? null : a.id_carrera},${a.carrera_nombre === undefined ? null : `'${a.carrera_nombre}'`},${a.departamento_materia === undefined ? null : `'${a.departamento_materia}'`},${a.num_alumnos_inscritos === undefined ? null : `'${a.num_alumnos_inscritos}'`},${a.id_docente},${a.ap_paterno_docente === undefined ? null : `'${a.ap_paterno_docente}'`},${a.ap_materno_docente === undefined ? null : `'${a.ap_materno_docente}'`},'${a.nombres_docente}','${a.ci_docente}',${a.sexo_docente === undefined ? null : a.sexo_docente},${a.fecha_nacimiento_docente === undefined ? null : `'${formatoFecha(a.fecha_nacimiento_docente, 'YYYY-MM-DD')}'`},${a.celular_docente === undefined ? null : `'${a.celular_docente}'`},${a.email_ucb_docente === undefined ? null : `'${a.email_ucb_docente.toLowerCase()}'`},${a.id_regional === undefined ? null : a.id_regional},'${a.nombre_regional}',${a.departamento_docente === undefined ? null : `'${a.departamento_docente}'`},'${a.id_regional}.${a.id_materia}.${a.id_docente}','${a.id_regional}.${a.id_paralelo}','${user}'),`;
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
        a.email_ucb_docente === undefined ? null : a.email_ucb_docente.toLowerCase(),
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
        '${formatoFecha(i.fecha_registro_est, 'DD/MM/YYYY HH:mm:ss')}',
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
        ${i.fecha_nacimiento_est === undefined ? null : formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD') === null ? null : `'${formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD')}'`},
        ${i.sexo_est === undefined ? null : i.sexo_est},
        ${i.celular_est === undefined ? null : `'${i.celular_est}'`},
        ${i.id_persona_est},
        ${i.email_ucb_est === undefined ? null : `'${i.email_ucb_est}'`},
        '${i.id_regional}.${i.id_paralelo}',
        '${i.id_regional}.${i.id_paralelo}.${i.id_persona_est}',
        '${user}'
    ),`;
}
//${i.fecha_nacimiento_est === undefined ? null : `'${formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD')}'`},

//pruebas
registrarInscripcionesPregradoPrueba = async (datos, user) => {
    let contInsert = 0;
    const id_semestre = datos[0].id_semestre;
    const id_regional = datos[0].id_regional;
    const sqlInsertInscripciones = "INSERT INTO Datos_inscripciones (fecha_registro_est, estado_movimiento, movimiento, id_regional, nombre_regional, id_semestre, id_paralelo, id_materia, sigla_materia, nombre_materia, numero_paralelo, id_carrera, carrera, doc_identidad_est, nombres_est, ap_paterno_est, ap_materno_est, fecha_nacimiento_est, sexo_est, celular_est, id_persona_est, email_ucb_est, codigo_curso_paralelo, codigo_inscripcion_est, usuario_registro) VALUES ";
    let valuesInscripciones = "";
    const listdb = await inscripcionListaDb(id_semestre, id_regional);
    if (!listdb.ok) {
        return error({
            msg: "No se pudo recuperar los datos",
            error: listdb.error
        });
    }
    const datosARegistrar = await obtenerRegistrosACrear(datos, listdb.data, user);
    console.log("datosARegistrar.length", datosARegistrar.length);
    for (let i = 0; i < datosARegistrar.length; i++) {
        let value = transformarDatosInscripcion(datosARegistrar[i], user);
        valuesInscripciones = valuesInscripciones + value;
    }
    if (valuesInscripciones.length > 0) {
        const sql = sqlInsertInscripciones + valuesInscripciones.substring(0, valuesInscripciones.length - 1) + ";";
        const respInsert = await consulta(sql, []);
        if (respInsert.ok) {
            return success({
                msg: "Datos registrados " + contInsert,
                data: JSON.stringify(respInsert.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        } else {
            return error({
                msg: "Error interno del servidor",
                error: JSON.stringify(respInsert.error, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        }
    } else {
        return success({
            msg: `Datos registrados ${contInsert}`,
            data: "Registros creados 0"
        });
    }
}

inscripcionListaDb = async (id_semestre, id_regional) => {
    const sql = `select id_inscripcion, id_regional, id_semestre, fecha_registro_est, id_paralelo, id_persona_est, email_ucb_est, estado_movimiento
    from Datos_inscripciones
    where id_regional = ?
    and id_semestre = ?`;
    const result = await consulta(sql, [id_regional, id_semestre]);
    return result;
}

obtenerRegistrosACrear = async (datos, listdb, user) => {
    let datosInsertar = [];
    let datosActualizar = [];
    datos.map(i => {
        const insc = listdb.find(li => {
            if (li.id_paralelo === i.id_paralelo && li.id_persona_est === i.id_persona_est && li.estado_movimiento === i.estado_movimiento) {
                if (!li.fecha_registro_est != formatoFecha(i.fecha_registro_est, 'DD/MM/YYYY HH:mm:ss') + "") {
                    return li;
                }
            }
        });
        if (insc === undefined) {
            datosInsertar.push(i);
        } else { //cambiar email de estudiante
            if (i.id_persona_est == insc.id_persona_est && i.email_ucb_est != insc.email_ucb_est) {
                datosActualizar.push({
                    doc_identidad_est: i.doc_identidad_est,
                    nombres_est: i.nombres_est,
                    ap_paterno_est: i.ap_paterno_est,
                    ap_materno_est: i.ap_materno_est != undefined ? i.ap_materno_est : null,
                    fecha_nacimiento_est: i.fecha_nacimiento_est != undefined ? formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD') : null,
                    sexo_est: i.sexo_est != undefined ? i.sexo_est : null,
                    celular_est: i.celular_est != undefined ? i.celular_est : null,
                    email_ucb_est: i.email_ucb_est,
                    id_inscripcion: insc.id_inscripcion
                });
            }
        }//cambiar email de estudiante
    });

    const sqlUpdate = `UPDATE Datos_inscripciones SET doc_identidad_est = ?, nombres_est = ?, ap_paterno_est = ?, ap_materno_est = ?, fecha_nacimiento_est = ?, sexo_est = ?, celular_est = ?, email_ucb_est = ?, inscripcion_nueva = 1, usuario_registro = ? WHERE id_inscripcion = ?;`;
    for (let i = 0; i < datosActualizar.length; i++) {
        const result = await consulta(sqlUpdate, [datosActualizar[i].doc_identidad_est, datosActualizar[i].nombres_est, datosActualizar[i].ap_paterno_est, datosActualizar[i].ap_materno_est, datosActualizar[i].fecha_nacimiento_est, datosActualizar[i].sexo_est, datosActualizar[i].celular_est, datosActualizar[i].email_ucb_est, user, datosActualizar[i].id_inscripcion]);
        console.log(result);
    }
    
    return datosInsertar;
}

//Asignaturas practicas
registrarAsignaturasPracticasPregrado = async (datos, user) => {
    let insert;
    let contUpdate = 0;
    let contErroUpdate = 0;
    const sqlInsertAsignaturas = `INSERT INTO Datos_asignaturas_practicas (semestre_descripcion, semestre_fecha_inicio, semestre_fecha_fin, semestre_resumido, id_semestre, id_paralelo_practica, numero_paralelo, id_materia, materia_sigla, materia_nombre, id_carrera, carrera_nombre, departamento_materia, num_alumnos_inscritos, id_docente, ap_paterno_docente, ap_materno_docente, nombres_docente, ci_docente, sexo_docente, fecha_nacimiento_docente, celular_docente, email_ucb_docente, id_regional, nombre_regional, departamento_docente, codigo_curso_plantilla, codigo_curso_paralelo, usuario_registro) VALUES `;
    const sqlUpdateAsignaturas = `UPDATE Datos_asignaturas_practicas SET id_docente=?, ap_paterno_docente=?, ap_materno_docente=?, nombres_docente=?, ci_docente=?,
    sexo_docente=?, fecha_nacimiento_docente=?, celular_docente=?, email_ucb_docente=?, id_regional=?, nombre_regional=?, departamento_docente=?, docente_nuevo=?, usuario_registro=? WHERE id_paralelo_practica = ?`;
    let valuesIsert = "";
    const listAnt = await listDatosAntPracticas(datos);
    console.log(listAnt);
    console.log("listAnt.length", listAnt.length);
    for (let i = 0; i < datos.length; i++) {
        existeDato = listAnt.find(a => a.id_paralelo == datos[i].id_paralelo);
        if (existeDato === undefined) {
            valuesIsert = valuesIsert + valoresAsignaturaPractica(datos[i], user);
        } else {
            if (datos[i].id_docente != existeDato.id_docente) {
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaPracticaUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
            if (datos[i].id_docente == existeDato.id_docente && datos[i].email_ucb_docente != existeDato.email_ucb_docente) {
                console.log(datos[i].id_docente +'=='+ existeDato.id_docente +'&&'+ datos[i].email_ucb_docente +'!='+ existeDato.email_ucb_docente);
                const respUpdate = await consulta(sqlUpdateAsignaturas, transformarDatosAsignaturaPracticaUpdate(datos[i], user))
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
            //cambio de email de docente
        }
    }
    const valuesi = valuesIsert.substring(0, valuesIsert.length - 1) + ";";
    if (valuesi.length > 1) {
        const valuesInsert = sqlInsertAsignaturas + valuesi;
        insert = await consulta(valuesInsert, []);
    }
    //cambiar estado de paralelo_nuevo a existentes
    const quitarEsistentes = await verificarCreacionAsignaturasPracticas(datos);
    return success({
        insert: insert,
        contUpdate,
        contErroUpdate
    });
}

const listDatosAntPracticas = async (lista) => {
    let paralelos = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo_practica + ",";

    });
    const datos = paralelos.substring(0, paralelos.length - 1);
    const sqlDatos = `SELECT * FROM Datos_asignaturas_practicas WHERE id_paralelo_practica in (${datos})`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : [];
}

const valoresAsignaturaPractica = (a, user) => {
    return `(
        ${a.semestre_descripcion === undefined ? null : `'${a.semestre_descripcion}'`},
        '${formatoFecha(a.semestre_fecha_inicio, 'YYYY-MM-DD')}',
        '${formatoFecha(a.semestre_fecha_fin, 'YYYY-MM-DD')}',
        '${a.semestre_resumido}',
        ${a.id_semestre === undefined ? null : `'${a.id_semestre}'`},
        ${a.id_paralelo_practica},
        '${a.numero_paralelo}',
        ${a.id_materia},
        '${a.materia_sigla}',
        '${a.materia_nombre}',
        ${a.id_carrera === undefined ? null : a.id_carrera},
        ${a.carrera_nombre === undefined ? null : `'${a.carrera_nombre}'`},
        ${a.departamento_materia === undefined ? null : `'${a.departamento_materia}'`},
        ${a.num_alumnos_inscritos === undefined ? null : `'${a.num_alumnos_inscritos}'`},
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
        '${a.id_regional}.${a.id_materia}.${a.id_docente}',
        '${a.id_regional}.${a.id_paralelo_practica}.P',
        '${user}'),`;
}

const verificarCreacionAsignaturasPracticas = async (lista) => {
    let paralelos = "";
    lista.map(a => {
        paralelos = paralelos + a.id_paralelo_practica + ",";
    });
    const datos = paralelos.length > 0 ? paralelos.substring(0, paralelos.length - 1) : '';
    const sqlDatos = `UPDATE Datos_asignaturas_practicas SET paralelo_nuevo = 0, docente_nuevo = 0 
    WHERE id_paralelo_practica in (SELECT da.id_paralelo_practica
        FROM Datos_asignaturas_practicas da, Cursos c
        WHERE da.codigo_curso_paralelo = c.codigo_curso
        and da.paralelo_nuevo = 1
        and da.id_paralelo_practica in (${datos}))`;
    const result = await consulta(sqlDatos, []);
    return result.ok ? result.data : result.error;
}

transformarDatosAsignaturaPracticaUpdate = (a, user) => {
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
        a.id_paralelo_practica
    ];
}
//Asignaturas practicas

//registrarInscripcionesPregradoPracticas
registrarInscripcionesPregradoPracticas = async (datos, user) => {
    let contInsert = 0;
    const id_semestre = datos[0].id_semestre;
    const id_regional = datos[0].id_regional;
    const sqlInsertInscripciones = "INSERT INTO Datos_inscripciones_practicas (fecha_registro_est, estado_movimiento, movimiento, id_regional, nombre_regional, id_semestre, id_paralelo_practica, id_materia, sigla_materia, nombre_materia, numero_paralelo, id_carrera, carrera, doc_identidad_est, nombres_est, ap_paterno_est, ap_materno_est, fecha_nacimiento_est, sexo_est, celular_est, id_persona_est, email_ucb_est, codigo_curso_paralelo, codigo_inscripcion_est, usuario_registro) VALUES ";
    let valuesInscripciones = "";
    const listdb = await inscripcionPracticasListaDb(id_semestre, id_regional);
    if (!listdb.ok) {
        return error({
            msg: "No se pudo recuperar los datos",
            error: listdb.error
        });
    }
    const datosARegistrar = await obtenerRegistrosPracticasACrear(datos, listdb.data, user);
    console.log("datosARegistrar.length", datosARegistrar);
    console.log("datosARegistrar.length", datosARegistrar.length);
    for (let i = 0; i < datosARegistrar.length; i++) {
        let value = transformarDatosInscripcionPractica(datosARegistrar[i], user);
        valuesInscripciones = valuesInscripciones + value;
    }
    if (valuesInscripciones.length > 0) {
        const sql = sqlInsertInscripciones + valuesInscripciones.substring(0, valuesInscripciones.length - 1) + ";";
        const respInsert = await consulta(sql, []);
        if (respInsert.ok) {
            return success({
                msg: "Datos registrados " + contInsert,
                data: JSON.stringify(respInsert.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        } else {
            return error({
                msg: "Error interno del servidor",
                error: JSON.stringify(respInsert.error, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                )
            });
        }
    } else {
        return success({
            msg: `Datos registrados ${contInsert}`,
            data: "Registros creados 0"
        });
    }
}

inscripcionPracticasListaDb = async (id_semestre, id_regional) => {
    const sql = `select id_inscripcion, id_regional, id_semestre, fecha_registro_est, id_paralelo_practica, id_persona_est, email_ucb_est, estado_movimiento
    from Datos_inscripciones_practicas
    where id_regional = ?
    and id_semestre = ?`;
    const result = await consulta(sql, [id_regional, id_semestre]);
    return result;
}

obtenerRegistrosPracticasACrear = async (datos, listdb, user) => {
    let datosInsertar = [];
    let datosActualizar = [];
    datos.map(i => {
        const insc = listdb.find(li => {
            if (li.id_paralelo_practica === i.id_paralelo_practica && li.id_persona_est === i.id_persona_est && li.estado_movimiento === i.estado_movimiento) {
                if (!li.fecha_registro_est != formatoFecha(i.fecha_registro_est, 'DD/MM/YYYY HH:mm:ss') + "") {
                    return li;
                }
            }
        });
        if (insc === undefined) {
            datosInsertar.push(i);
        } else {
            if (i.id_persona_est == insc.id_persona_est && i.email_ucb_est != insc.email_ucb_est) {
                datosActualizar.push({
                    doc_identidad_est: i.doc_identidad_est,
                    nombres_est: i.nombres_est,
                    ap_paterno_est: i.ap_paterno_est,
                    ap_materno_est: i.ap_materno_est != undefined ? i.ap_materno_est : null,
                    fecha_nacimiento_est: i.fecha_nacimiento_est != undefined ? formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD') : null,
                    sexo_est: i.sexo_est != undefined ? i.sexo_est : null,
                    celular_est: i.celular_est != undefined ? i.celular_est : null,
                    email_ucb_est: i.email_ucb_est,
                    id_inscripcion: insc.id_inscripcion
                });
            }
        }
    });

    const sqlUpdate = `UPDATE Datos_inscripciones_practicas SET doc_identidad_est = ?, nombres_est = ?, ap_paterno_est = ?, ap_materno_est = ?, fecha_nacimiento_est = ?, sexo_est = ?, celular_est = ?, email_ucb_est = ?, inscripcion_nueva = 1, usuario_registro = ? WHERE id_inscripcion = ?;`;
    for (let i = 0; i < datosActualizar.length; i++) {
        const result = await consulta(sqlUpdate, [datosActualizar[i].doc_identidad_est, datosActualizar[i].nombres_est, datosActualizar[i].ap_paterno_est, datosActualizar[i].ap_materno_est, datosActualizar[i].fecha_nacimiento_est, datosActualizar[i].sexo_est, datosActualizar[i].celular_est, datosActualizar[i].email_ucb_est, user, datosActualizar[i].id_inscripcion]);
        console.log(result);
    }

    return datosInsertar;
}

transformarDatosInscripcionPractica = (i, user) => {
    return `(
        '${formatoFecha(i.fecha_registro_est, 'DD/MM/YYYY HH:mm:ss')}',
        ${i.estado_movimiento === undefined ? null : i.estado_movimiento},
        ${i.movimiento === undefined ? null : `'${i.movimiento}'`},
        ${i.id_regional === undefined ? null : i.id_regional},
        '${i.nombre_regional}',
        ${i.id_semestre},
        ${i.id_paralelo_practica},
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
        ${i.fecha_nacimiento_est === undefined ? null : formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD') === null ? null : `'${formatoFecha(i.fecha_nacimiento_est, 'YYYY-MM-DD')}'`},
        ${i.sexo_est === undefined ? null : i.sexo_est},
        ${i.celular_est === undefined ? null : `'${i.celular_est}'`},
        ${i.id_persona_est},
        ${i.email_ucb_est === undefined ? null : `'${i.email_ucb_est}'`},
        '${i.id_regional}.${i.id_paralelo_practica}.P',
        '${i.id_regional}.${i.id_paralelo_practica}.${i.id_persona_est}.P',
        '${user}'
    ),`;
}
//registrarInscripcionesPregradoPracticas

module.exports = {
    registrarAsignaturasPregrado,
    registrarInscripcionesPregrado,
    registrarInscripcionesPregradoPrueba,
    registrarAsignaturasPracticasPregrado,
    registrarInscripcionesPregradoPracticas
}