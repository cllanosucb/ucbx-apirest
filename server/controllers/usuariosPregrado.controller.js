require('dotenv').config();
const db = require('../db/mariadb');
const fs = require('fs');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionApiNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const {
    formatoFecha,
    transformarNomRegional,
    formatoFechaNeo,
    otroFormatoFecha,
    delay,
    capitalizar,
    guardarCsv
} = require('../tools/util.tools');

const crearDocentesPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosDocentes = await listaDocentesPorSemeste(id_semestre, id_regional);
    if (!datosDocentes.ok) {
        return res.status(500).json(datosDocentes);
    }
    const listDocentesDb = await docenteslistaDb(datosDocentes.data);
    console.log("listDocentesDb.data.length", listDocentesDb.data.length);
    const listDocentes = await docentesPregrado(datosDocentes.data, listDocentesDb.data);
    console.log("cant docentes crear", listDocentes.length);
    const respCreacion = await crearDocentes(listDocentes, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const asignarParalelosDocentesPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosDocentes = await listaAsignacionDocentesPorSemeste(id_semestre, id_regional);
    if (!datosDocentes.ok) {
        return res.status(500).json(datosDocentes);
    }
    const listDocentes = await datosDocentesParalelosPregrado(datosDocentes.data);
    const respCreacion = await asignarDocentesParalelos(listDocentes, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const llavesPorUsuario = async(id_usuario) => {
    const sqlLlavePorUsuario = `select distinct l.url_instancia, l.api_key
    from rolusu ru, Llaves l, Roles r
    where ru.id_llave = l.id_llave and ru.id_rol = r.id_rol
    and r.id_instancia = 2 and ru.id_usuario = ?`;
    const resultLlaves = await consulta(sqlLlavePorUsuario, [id_usuario]);
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

const listaDocentesPorSemeste = async(id_semestre, id_regional) => {
    const sqlDocentesPorSemestre = `select da.*, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas da, Organizaciones o
    where da.id_regional = o.id_regional
	and da.docente_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultDocentes = await consulta(sqlDocentesPorSemestre, [id_semestre, id_regional]);
    return resultDocentes;
}

const listaAsignacionDocentesPorSemeste = async(id_semestre, id_regional) => {
    const sqlDocentesPorSemestre = `select da.id_paralelo, da.email_ucb_docente, da.codigo_curso_plantilla, da.codigo_curso_paralelo, p.id_plantilla, c.id_curso, u.id_usuario, u.email_institucional
    from Datos_asignaturas da, Organizaciones o, Cursos c, Plantillas p, Usuarios u
    where da.id_regional = o.id_regional
	and c.codigo_curso = da.codigo_curso_paralelo
    and p.codigo_curso = da.codigo_curso_plantilla
	and u.email_institucional = da.email_ucb_docente
    and da.docente_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultDocentes = await consulta(sqlDocentesPorSemestre, [id_semestre, id_regional]);
    return resultDocentes;
}

const usuarioPorEmail = async(email) => {
    const sqlDocentesPorEmail = `select u.*
    from Usuarios u, Organizaciones o
    where u.id_organizacion = o.id_organizacion
    and o.id_instancia = 2
    and u.email_institucional = ?`;
    const resultDocente = await consulta(sqlDocentesPorEmail, [email]);
    return resultDocente.ok ? resultDocente.data.length > 0 ? resultDocente.data[0] : null : null;
}

const insertUsuario = async(id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro) => {
    const sqlInsert = `INSERT INTO Usuarios (id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro]);
    return result;
}

const updateAsignaturasUsuario = async(paralelos) => {
    const sqlUpdate = `UPDATE Datos_asignaturas SET docente_nuevo = 0 WHERE id_paralelo in (${paralelos})`;
    const result = await consulta(sqlUpdate, []);
    return result;
}

const docenteslistaDb = async(list) => {
    let docentes = "";
    for (let i = 0; i < list.length; i++) {
        docentes = docentes + "'" + list[i].email_ucb_docente + "',";
    }
    const datos = docentes.substring(0, docentes.length - 1);
    const sql = `select * from Usuarios where email_institucional in (${datos})`;
    const result = await consulta(sql, []);
    return result;
}

const docentesPregrado = async(lista, lusu) => {
    let docentes = [];
    for (let i = 0; i < lista.length; i++) {
        const docUsu = lusu.find(u => u.email_institucional === lista[i].email_ucb_docente);
        if (docUsu === undefined) {
            const d = {
                nombre: capitalizar(lista[i].nombres_docente),
                primer_ap: `${lista[i].ap_paterno_docente != null ? capitalizar(lista[i].ap_paterno_docente) : ''} ${lista[i].ap_materno_docente != null ? capitalizar(lista[i].ap_materno_docente) : ''}`,
                userid: lista[i].email_ucb_docente.toLowerCase().split('@')[0],
                contrasenia: `${lista[i].email_ucb_docente.toLowerCase().split('@')[0]}@${lista[i].ci_docente}`,
                fecha_nac: lista[i].fecha_nacimiento_docente != null ? otroFormatoFecha(lista[i].fecha_nacimiento_docente, 'MM/DD/YYYY') : null,
                fecha_nac_or: lista[i].fecha_nacimiento_docente != null ? lista[i].fecha_nacimiento_docente : null,
                ci: `${lista[i].id_regional}${lista[i].ci_docente}`,
                sexo: lista[i].sexo_docente == 1 ? 'Male' : 'Female',
                carrera_usuario: lista[i].departamento_docente != null ? lista[i].departamento_docente : null,
                registro_ucb: `${lista[i].id_regional}${lista[i].id_docente}`,
                email_institucional: lista[i].email_ucb_docente.toLowerCase(),
                telefono: lista[i].celular_docente != null ? lista[i].celular_docente : null,
                pais: 'Bolivia',
                id_organizacion: lista[i].id_organizacion,
                tipo_cuenta: 'teacher',
                archivado: false,
                id_plantilla: lista[i].id_plantilla,
                id_curso: lista[i].id_curso,
                id_paralelo: lista[i].id_paralelo
            }
            docentes.push(d);
        }

    }
    let hash = {};
    docentes = docentes.filter(o => hash[o.registro_ucb] ? false : hash[o.registro_ucb] = true);
    return docentes;
}

const crearDocentes = async(plist, url, api_key, user) => {
    let datosRes = {
        msg: "Registro de docentes",
        totales: {
            usuarios_creadas_neo: 0,
            insert_usuarios_db: 0,
            error_usuarios_creadas_neo: 0,
            error_insert_usuarios_db: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&first_name=${plist[i].nombre}&last_name=${plist[i].primer_ap}&userid=${plist[i].userid}&password=${plist[i].contrasenia}&organization_id=${plist[i].id_organizacion}&birthdate=${plist[i].fecha_nac}&teacher_id=${plist[i].ci}&gender=${plist[i].sexo}&departamento=${plist[i].carrera_usuario}&registro ucb=${plist[i].registro_ucb}&email=${plist[i].email_institucional}&phone=${plist[i].telefono}&country=${plist[i].pais}&archived=${plist[i].archivado}&account_types=${plist[i].tipo_cuenta}`;
        const resUsuario = await peticionApiNeo(url, 'add_user', api_key, parametros);
        if (resUsuario.ok) {
            datosRes.totales.usuarios_creadas_neo = datosRes.totales.usuarios_creadas_neo + 1;
            const insertp = await insertUsuario(resUsuario.data.id, plist[i].nombre, plist[i].primer_ap, plist[i].userid, plist[i].fecha_nac_or, plist[i].ci, plist[i].sexo, plist[i].carrera_usuario, plist[i].registro_ucb, plist[i].email_institucional, plist[i].telefono, plist[i].id_organizacion, plist[i].tipo_cuenta, plist[i].archivado, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_usuarios_db = datosRes.totales.error_insert_usuarios_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resUsuario.data.id, plist[i].nombre, plist[i].primer_ap, plist[i].userid, plist[i].fecha_nac_or, plist[i].ci, plist[i].sexo, plist[i].carrera_usuario, plist[i].registro_ucb, plist[i].email_institucional, plist[i].telefono, plist[i].id_organizacion, plist[i].tipo_cuenta, plist[i].archivado, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_usuarios_db = datosRes.totales.insert_usuarios_db + 1;
            }
        } else {
            datosRes.totales.error_usuarios_creadas_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resUsuario
            });
        }
        await delay(100)
    }
    return datosRes;
}

const datosDocentesParalelosPregrado = async(lista) => {
    let datos = [];
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id_docente != 40194491) {
            const d = {
                id_paralelo: lista[i].id_paralelo,
                email_ucb_docente: lista[i].email_ucb_docente,
                codigo_curso_plantilla: lista[i].codigo_curso_plantilla,
                codigo_curso_paralelo: lista[i].codigo_curso_paralelo,
                id_plantilla: lista[i].id_plantilla,
                id_curso: lista[i].id_curso,
                id_usuario: lista[i].id_usuario,
                email_institucional: lista[i].email_institucional,
            }
            datos.push(d);
        }
    }
    return datos;
}

const updateParalelo = async(id_paralelo) => {
    const sqlUpdate = `UPDATE Datos_asignaturas SET docente_nuevo = 0 WHERE id_paralelo = ?`;
    const result = await consulta(sqlUpdate, [id_paralelo]);
    return result;
}

const asignarDocentesParalelos = async(plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            usuarios_asignados_neo: 0,
            error_usuarios_asignados_neo: 0,
        },
        datos_respuestas: []
    };
    let updateDocentes = "";
    for (let i = 0; i < plist.length; i++) {
        const parametrosParalelo = `&class_id=${plist[i].id_curso}&user_ids[]=${plist[i].id_usuario}`;
        const respa = await peticionApiNeo(url, 'add_teachers_to_class', api_key, parametrosParalelo);
        if (respa.ok) {
            datosRes.totales.usuarios_asignados_neo++;
            // const update = await updateParalelo(plist[i].id_paralelo)
            updateDocentes = updateDocentes + plist[i].id_paralelo + ","
        } else {
            datosRes.totales.error_usuarios_creadas_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametrosParalelo,
                respuesta: respa
            });
        }
        // await delay(200)
    }
    const datos = updateDocentes.substring(0, updateDocentes.length - 1);
    await updateAsignaturasUsuario(datos);
    return datosRes;
}

const crearEstudiantesPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const estSinCuenta = await listaEstSinCuentaNeo(id_semestre, id_regional);
    //console.log(estSinCuenta);
    if (!estSinCuenta.ok) {
        return res.status(500).json(estSinCuenta);
    }
    const listE = quitarDuplicadosEst(estSinCuenta.data);
    console.log("Estudiantes a crear", listE.length);

    const respCreacion = await crearEstudiantes(listE, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const listaEstSinCuentaNeo = async(id_semestre, id_regional) => {
    const sqlDocentesPorSemestre = `select di.*, o.id_organizacion, o.nombre
    FROM
    (
    select DISTINCT id_persona_est, email_ucb_est
    from Datos_inscripciones
    where id_regional = ?
    and id_semestre = ?
    and inscripcion_nueva = 1
    ) est
    LEFT JOIN Usuarios as u on u.email_institucional = est.email_ucb_est,
    Datos_inscripciones di, Organizaciones o
    where u.id_usuario is null
    and est.id_persona_est = di.id_persona_est
    and di.id_regional = o.id_regional`;
    const resultDocentes = await consulta(sqlDocentesPorSemestre, [id_regional, id_semestre]);
    return resultDocentes;
}

const quitarDuplicadosEst = (lista) => {
    let estudiantes = [];
    for (let i = 0; i < lista.length; i++) {
        const d = {
            nombre: capitalizar(lista[i].nombres_est),
            primer_ap: `${lista[i].ap_paterno_est != null ? capitalizar(lista[i].ap_paterno_est) : ''} ${lista[i].ap_materno_est != null ? capitalizar(lista[i].ap_materno_est) : ''}`,
            userid: lista[i].email_ucb_est.toLowerCase().split('@')[0],
            contrasenia: `${lista[i].email_ucb_est.toLowerCase().split('@')[0]}@${lista[i].doc_identidad_est}`,
            fecha_nac: lista[i].fecha_nacimiento_est != null ? otroFormatoFecha(lista[i].fecha_nacimiento_est, 'MM/DD/YYYY') : '',
            fecha_nac_or: lista[i].fecha_nacimiento_est != null ? lista[i].fecha_nacimiento_est : null,
            ci: `${lista[i].id_regional}${lista[i].doc_identidad_est}`,
            sexo: lista[i].sexo_est == 1 ? 'Male' : 'Female',
            carrera_usuario: lista[i].carrera != null ? lista[i].carrera : '',
            registro_ucb: `${lista[i].id_regional}${lista[i].id_persona_est}`,
            email_institucional: lista[i].email_ucb_est.toLowerCase(),
            telefono: lista[i].celular_est != null ? lista[i].celular_est : '',
            pais: 'Bolivia',
            id_organizacion: lista[i].id_organizacion,
            tipo_cuenta: 'student',
            archivado: false,
            id_persona_est: lista[i].id_persona_est,
        }
        estudiantes.push(d);
    }
    let hash = {};
    estudiantes = estudiantes.filter(e => hash[e.id_persona_est] ? false : hash[e.id_persona_est] = true);
    return estudiantes;
}

const crearEstudiantes = async(plist, url, api_key, user) => {
    let datosRes = {
        msg: "Registro de estudiantes",
        totales: {
            usuarios_creadas_neo: 0,
            insert_usuarios_db: 0,
            error_usuarios_creadas_neo: 0,
            error_insert_usuarios_db: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        //const parametros = `&first_name=${plist[i].nombre}&last_name=${plist[i].primer_ap}&userid=${plist[i].userid}&password=${plist[i].contrasenia}&organization_id=${plist[i].id_organizacion}&birthdate=${plist[i].fecha_nac}&teacher_id=${plist[i].ci}&gender=${plist[i].sexo}&departamento=${plist[i].carrera_usuario}&registro ucb=${plist[i].registro_ucb}&email=${plist[i].email_institucional}&phone=${plist[i].telefono}&country=${plist[i].pais}&archived=${plist[i].archivado}&account_types=${plist[i].tipo_cuenta}`;
        const parametros = `&first_name=${plist[i].nombre}&last_name=${plist[i].primer_ap}&userid=${plist[i].userid}&password=${plist[i].contrasenia}&organization_id=${plist[i].id_organizacion}&teacher_id=${plist[i].ci}&gender=${plist[i].sexo}&departamento=${plist[i].carrera_usuario}&registro ucb=${plist[i].registro_ucb}&email=${plist[i].email_institucional}&phone=${plist[i].telefono}&country=${plist[i].pais}&archived=${plist[i].archivado}&account_types=${plist[i].tipo_cuenta}`;
        const resUsuario = await peticionApiNeo(url, 'add_user', api_key, parametros);
        if (resUsuario.ok) {
            datosRes.totales.usuarios_creadas_neo = datosRes.totales.usuarios_creadas_neo + 1;
            const insertp = await insertUsuario(resUsuario.data.id, plist[i].nombre, plist[i].primer_ap, plist[i].userid, plist[i].fecha_nac_or, plist[i].ci, plist[i].sexo, plist[i].carrera_usuario, plist[i].registro_ucb, plist[i].email_institucional, plist[i].telefono, plist[i].id_organizacion, plist[i].tipo_cuenta, plist[i].archivado, user);
            if (!insertp.ok) {
                datosRes.totales.insert_usuarios_db = datosRes.totales.insert_usuarios_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resUsuario.data.id, plist[i].nombre, plist[i].primer_ap, plist[i].userid, plist[i].fecha_nac_or, plist[i].ci, plist[i].sexo, plist[i].carrera_usuario, plist[i].registro_ucb, plist[i].email_institucional, plist[i].telefono, plist[i].id_organizacion, plist[i].tipo_cuenta, plist[i].archivado, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.error_insert_usuarios_db = datosRes.totales.error_insert_usuarios_db + 1;
            }
        } else {
            datosRes.totales.error_usuarios_creadas_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resUsuario
            });
        }
        //await delay(100)
    }
    return datosRes;
}

const retirosEstudiantesPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const listRetiros = await listaEstRetiros(id_semestre, id_regional);
    if (!listRetiros.ok) {
        return res.status(500).json(JSON.parse(JSON.stringify(listRetiros, (key, value) =>
            typeof value === "bigint" ? value.toString() + "" : value
        )));
    }
    const cursos = listCursos(listRetiros.data);
    console.log(listRetiros.data.length);
    const retirosPorCursos = unirDatosRetiros(cursos, listRetiros.data);
    console.log("Cantidad de cursos de retiro", retirosPorCursos.length);
    const respRetiros = await procesarRetiros(retirosPorCursos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    //actializar tabla de datos_inscripciones
    const updateRetiros = await updateInscripciones(listRetiros.data);
    res.json(success(respRetiros));
    /* res.json(success(JSON.parse(JSON.stringify(retirosPorCursos, (key, value) =>
        typeof value === "bigint" ? value.toString() + "" : value
    )))) */
}

const listaEstRetiros = async(id_semestre, id_regional) => {
    const sqlRetirosPorSemestre = `SELECT r.*, u.id_usuario, c.id_curso, c.codigo_curso
    FROM 
    (SELECT di.id_inscripcion,di.fecha_registro_est,di.estado_movimiento,di.movimiento,di.id_paralelo,
    di.sigla_materia,di.nombre_materia,di.numero_paralelo,di.id_persona_est,di.email_ucb_est,
    di.inscripcion_nueva,di.codigo_curso_paralelo,di.codigo_inscripcion_est, count(di.codigo_inscripcion_est) cant_repetidos_retiros
    FROM Datos_inscripciones di
    WHERE di.estado_movimiento in (3,4,5)
    and di.inscripcion_nueva = 1
    and di.id_regional = ?
    and di.id_semestre = ?
    GROUP BY di.codigo_inscripcion_est
    ) r, Cursos c, Usuarios u
    where c.codigo_curso = r.codigo_curso_paralelo
    and u.email_institucional = r.email_ucb_est`;
    const resultRetiros = await consulta(sqlRetirosPorSemestre, [id_regional, id_semestre]);
    return resultRetiros;
}

const listCursos = (arr) => {
    let hash = {};
    const array = arr.filter(o => hash[o.id_curso] ? false : hash[o.id_curso] = true);
    return array;
}

const unirDatosRetiros = (cursos, retirosEst) => {
    let datos = [];
    for (let i = 0; i < cursos.length; i++) {
        const estudiantes = retirosEst.filter(e => {
            if (e.cant_repetidos_retiros == 1 && e.id_curso == cursos[i].id_curso) {
                return e;
            }
        });
        const curso = {
            id_class: cursos[i].id_curso,
            cant: estudiantes.length,
            ests: estudiantes
        }
        datos.push(curso);
    }
    return datos;
}

const procesarRetiros = async(d, url, api_key, user) => {
    let cant_retiros = 0;
    d.map(r => {
        cant_retiros = cant_retiros + r.cant;
    })
    let respData = {
        msg: "Retiros realizados: " + cant_retiros,
        data: []
    };
    for (let i = 0; i < d.length; i++) {
        let params = `&class_id=${d[i].id_class}`;
        for (let j = 0; j < d[i].ests.length; j++) {
            params = params + "&user_ids[]=" + d[i].ests[j].id_usuario
        }
        const resp = await peticionApiNeo(url, 'remove_students_from_class', api_key, params);
        await delay(200);
        const result = {
            class_id: d[i].id_class,
            cantidad: d[i].ests.length,
            parametros: params,
            result: resp
        }
        respData.data.push(result);
    }
    return respData
}

const inscripcionesEstudiantesPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const listInsc = await listaEstInscritos(id_semestre, id_regional);
    if (!listInsc.ok) {
        return res.status(500).json(JSON.parse(JSON.stringify(listInsc, (key, value) =>
            typeof value === "bigint" ? value.toString() + "" : value
        )));
    }
    console.log("listInsc.data", listInsc.data.length);
    if (listInsc.data.length > 1000) {
        console.log("Cantidas de inscripciones", listInsc.data.length);
        const respinsc = await inscripcionesEstudiantesPorCsv(listInsc.data, user, req.get('host'));
        const updateInsc = await updateInscripciones(listInsc.data);
        return res.json(respinsc)
    } else {
        const cursos = listCursosInscr(listInsc.data);
        console.log("Cantidas de inscripciones a cursos", cursos.length);
        const inscPorCursos = unirDatosInsc(cursos, listInsc.data);
        const respInscripciones = await procesarInsc(inscPorCursos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
        //actualizar estado inscripcion
        const updateInsc = await updateInscripciones(listInsc.data)
        res.json(respInscripciones);
        //res.json(success(inscPorCursos))
    }
}

const listaEstInscritos = async(id_semestre, id_regional) => {
    const sqlRetirosPorSemestre = `SELECT r.*, u.id_usuario, c.id_curso, c.codigo_curso
    FROM 
    (SELECT di.id_inscripcion,di.fecha_registro_est,di.estado_movimiento,di.movimiento,di.id_paralelo,
    di.sigla_materia,di.nombre_materia,di.numero_paralelo,di.id_persona_est,di.email_ucb_est,
    di.inscripcion_nueva,di.codigo_curso_paralelo,di.codigo_inscripcion_est
    FROM Datos_inscripciones di
    WHERE di.estado_movimiento in (1,6,7)
    and di.inscripcion_nueva = 1
    and di.id_regional = ?
    and di.id_semestre = ?
    ) r, Cursos c, Usuarios u
    where c.codigo_curso = r.codigo_curso_paralelo
    and u.email_institucional = r.email_ucb_est`;
    const resultRetiros = await consulta(sqlRetirosPorSemestre, [id_regional, id_semestre]);
    return resultRetiros;
}

const listCursosInscr = (arr) => {
    let hash = {};
    const array = arr.filter(o => hash[o.id_curso] ? false : hash[o.id_curso] = true);
    return array;
}

const unirDatosInsc = (cursos, retirosEst) => {
    let datos = [];
    for (let i = 0; i < cursos.length; i++) {
        const estudiantes = retirosEst.filter(e => e.id_curso == cursos[i].id_curso);
        const curso = {
            id_class: cursos[i].id_curso,
            cant: estudiantes.length,
            ests: estudiantes
        }
        datos.push(curso);
    }
    return datos;
}

const procesarInsc = async(d, url, api_key, user) => {
    let cant_insc = 0;
    d.map(r => {
        cant_insc = cant_insc + r.cant;
    })
    let respData = {
        msg: "Inscripciones realizadas: " + cant_insc,
        data: []
    };
    for (let i = 0; i < d.length; i++) {
        let params = `&class_id=${d[i].id_class}`;
        for (let j = 0; j < d[i].ests.length; j++) {
            params = params + "&user_ids[]=" + d[i].ests[j].id_usuario
        }
        const resp = await peticionApiNeo(url, 'add_students_to_class', api_key, params);
        await delay(300);
        const result = {
            class_id: d[i].id_class,
            cantidad: d[i].ests.length,
            parametros: params,
            result: resp
        }
        respData.data.push(result);
    }
    return success(respData);
}

const updateInscripciones = async(list) => {
    let ids = "";
    list.map(i => {
        ids = ids + i.id_inscripcion + ",";
    });
    const idInsc = ids.substring(0, ids.length - 1);
    const sqlUpdate = `update Datos_inscripciones set inscripcion_nueva = 0 where id_inscripcion in (${idInsc})`;
    const result = await consulta(sqlUpdate, []);
    return result;
}

const inscripcionesEstudiantesPregradoCsv = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const listInsc = await listaEstInscritos(id_semestre, id_regional);
    if (!listInsc.ok) {
        return res.status(500).json(JSON.parse(JSON.stringify(listInsc, (key, value) =>
            typeof value === "bigint" ? value.toString() + "" : value
        )));
    }
    const encavezadoCsv = `id_inscripcion,fecha_registro_est,estado_movimiento,movimiento,id_paralelo,sigla_materia,nombre_materia,numero_paralelo,id_persona_est,email_ucb_est,inscripcion_nueva,codigo_curso_paralelo,codigo_inscripcion_est,id_usuario,id_curso,codigo_curso\n`;
    let datosCsv = "";
    for (let i = 0; i < listInsc.data.length; i++) {
        datosCsv = datosCsv + generarDatosInscCsv(listInsc.data[i]) + "\n";
    }
    if (datosCsv.length == 0) {
        return res.json(success({
            msg: "No hay datos de inscripcion",
            ruta: null
        }));
    }
    const date = new Date();
    const ruta = `csv/insc-${user}-${otroFormatoFecha(date, 'DD-MM-YYYY-HH-mm-ss')}.csv`;
    const respCsv = guardarCsv(ruta, encavezadoCsv + datosCsv, req.get('host'));

    //actualizar estado inscripcion
    const updateInsc = await updateInscripciones(listInsc.data)
    res.json(respCsv);
    //res.json(success(inscPorCursos))
}

const inscripcionesEstudiantesPorCsv = async(listInsc, user, host) => {
    const encavezadoCsv = `id_inscripcion,fecha_registro_est,estado_movimiento,movimiento,id_paralelo,sigla_materia,nombre_materia,numero_paralelo,id_persona_est,email_ucb_est,inscripcion_nueva,codigo_curso_paralelo,codigo_inscripcion_est,id_usuario,id_curso,codigo_curso\n`;
    let datosCsv = "";
    for (let i = 0; i < listInsc.length; i++) {
        datosCsv = datosCsv + generarDatosInscCsv(listInsc[i]) + "\n";
    }
    if (datosCsv.length == 0) {
        return res.json(success({
            msg: "No hay datos de inscripcion",
            ruta: null
        }));
    }
    const date = new Date();
    const ruta = `csv/insc-${user}-${otroFormatoFecha(date, 'DD-MM-YYYY-HH-mm-ss')}.csv`;
    const respCsv = guardarCsv(ruta, encavezadoCsv + datosCsv, host);

    //actualizar estado inscripcion
    //const updateInsc = await updateInscripciones(listInsc.data)
    return respCsv;
    //res.json(success(inscPorCursos))
}

generarDatosInscCsv = (i) => {
    id_inscripcion = i.id_inscripcion;
    fecha_registro_est = i.fecha_registro_est;
    estado_movimiento = i.estado_movimiento;
    movimiento = i.movimiento;
    id_paralelo = i.id_paralelo;
    sigla_materia = i.sigla_materia;
    nombre_materia = i.nombre_materia.replace(/,/g, '');
    numero_paralelo = i.numero_paralelo;
    id_persona_est = i.id_persona_est;
    email_ucb_est = i.email_ucb_est;
    inscripcion_nueva = i.inscripcion_nueva;
    codigo_curso_paralelo = i.codigo_curso_paralelo;
    codigo_inscripcion_est = i.codigo_inscripcion_est;
    id_usuario = i.id_usuario;
    id_curso = i.id_curso;
    codigo_curso = i.codigo_curso;
    return `${id_inscripcion},${fecha_registro_est},${estado_movimiento},${movimiento},${id_paralelo},${sigla_materia},${nombre_materia},${numero_paralelo},${id_persona_est},${email_ucb_est},${inscripcion_nueva},${codigo_curso_paralelo},${codigo_inscripcion_est},${id_usuario},${id_curso},${codigo_curso}`;
}

//borrar 
datosPruebaCsv = async(id_semestre, id_regional) => {
    const sqlRetirosPorSemestre = `SELECT r.*, u.id_usuario, c.id_curso, c.codigo_curso
    FROM 
    (SELECT di.id_inscripcion,di.fecha_registro_est,di.estado_movimiento,di.movimiento,di.id_paralelo,
    di.sigla_materia,di.nombre_materia,di.numero_paralelo,di.id_persona_est,di.email_ucb_est,
    di.inscripcion_nueva,di.codigo_curso_paralelo,di.codigo_inscripcion_est
    FROM Datos_inscripciones di
    WHERE di.estado_movimiento in (1,6,7)
    and di.inscripcion_nueva = 0
    and di.id_regional = ?
    and di.id_semestre = ?
    ) r, Cursos c, Usuarios u
    where c.codigo_curso = r.codigo_curso_paralelo
    and u.email_institucional = r.email_ucb_est`;
    const resultRetiros = await consulta(sqlRetirosPorSemestre, [id_regional, id_semestre]);
    return resultRetiros;
}

module.exports = {
    crearDocentesPregrado,
    asignarParalelosDocentesPregrado,
    crearEstudiantesPregrado,
    retirosEstudiantesPregrado,
    inscripcionesEstudiantesPregrado,
    inscripcionesEstudiantesPregradoCsv
}