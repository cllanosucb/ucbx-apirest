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
    delay
} = require('../tools/util.tools');

const crearPlantillasPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPorSemeste(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    const datosPlantillas = await plantillaPorRegional(id_regional);
    if (!datosPlantillas.ok) {
        return res.status(500).json(datosPlantillas);
    }
    console.log("datosAsignaturas", datosAsignaturas.data.length);
    console.log("Plantillas", datosPlantillas.data.length);
    const sinDuplicados = datosPantillasPregrado(datosAsignaturas.data);
    console.log("sinDuplicados", sinDuplicados.length);
    const plantillasACrear = quitarPlantillasExistentes(sinDuplicados, datosPlantillas.data);
    console.log("plantillasACrear", plantillasACrear.length);
    const respCreacion = await crearPlantillas(plantillasACrear, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const crearParalelosPregrado = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPorSemestrePlantilla(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    console.log("Paralelos", datosAsignaturas.data.length);
    const listParalelos = datosParalelosPregrado(datosAsignaturas.data);
    const respCreacion = await crearParalelos(listParalelos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
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

const listaAsignaturasPorSemeste = async(id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, u.id_usuario, u.email_institucional, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas da, Organizaciones o, Usuarios u
    where da.id_regional = o.id_regional
		and u.email_institucional = da.email_ucb_docente
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const listaAsignaturasPorSemestrePlantilla = async(id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, p.id_plantilla, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas da, Organizaciones o, Plantillas p
    where da.id_regional = o.id_regional
	and p.codigo_curso = da.codigo_curso_plantilla
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const datosPantillasPregrado = (lista) => {
    let plantillas = [];
    for (let i = 0; i < lista.length; i++) {
        const p = {
            nombre: `Plantilla ${lista[i].materia_sigla} ${lista[i].materia_nombre}`,
            fecha_inicio: otroFormatoFecha(lista[i].semestre_fecha_inicio, 'MM/DD/YYYY'),
            fecha_fin: otroFormatoFecha(lista[i].semestre_fecha_fin, 'MM/DD/YYYY'),
            fecha_inicio_or: lista[i].semestre_fecha_inicio,
            fecha_fin_or: lista[i].semestre_fecha_fin,
            creditos: lista[i].paralelo_num_creditos || 0,
            semestre: lista[i].semestre_resumido,
            codigo_curso: `${lista[i].id_regional}.${lista[i].id_materia}.${lista[i].id_docente}`,
            lenguaje: 'Español',
            zona_horaria: 'La Paz',
            mostrar_catalogo: true,
            id_organizacion: lista[i].id_organizacion,
            organizacion: lista[i].nom_regional,
            id_usuario: lista[i].id_usuario,
            email_ucb_docente: lista[i].email_institucional
        }
        plantillas.push(p)
    }
    let hash = {};
    plantillas = plantillas.filter(o => hash[o.codigo_curso] ? false : hash[o.codigo_curso] = true);
    return plantillas;
}

const plantillaPorRegional = async(id_regional) => {
    const sqlPlantillasPorRegional = "select p.* from Plantillas p, Organizaciones o where p.id_organizacion = o.id_organizacion and o.id_regional = ?";
    const result = await consulta(sqlPlantillasPorRegional, [id_regional]);
    return result;
}

const quitarPlantillasExistentes = (list1, list2) => {
    plantillasFaltantes = []
    list1.map((p) => {
        const existe = list2.find(e => e.codigo_curso === p.codigo_curso);
        console.log("Plantilla ", existe);
        if (existe === undefined) plantillasFaltantes.push(p);
    });
    return plantillasFaltantes;
}

const crearPlantillas = async(plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            plantillas_creadas_neo: 0,
            insert_plantillas_db: 0,
            docente_plantilla_neo: 0,
            error_creacion_plantillas_neo: 0,
            error_insert_plantillas_db: 0,
            error_docente_plantilla_neo: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&name=${plist[i].nombre}&start_at=${plist[i].fecha_inicio}&finish_at=${plist[i].fecha_fin}&credits=${plist[i].creditos}&semester=${plist[i].semestre}&course_code=${plist[i].codigo_curso}&language=${plist[i].lenguaje}&time_zone=${plist[i].zona_horaria}&display_in_catalog=${plist[i].mostrar_catalogo}&organization_id=${plist[i].id_organizacion}`;
        const resPlantilla = await peticionApiNeo(url, 'add_class_template', api_key, parametros);
        console.log(">>>>>>", resPlantilla);
        if (resPlantilla.ok) {
            datosRes.totales.plantillas_creadas_neo = datosRes.totales.plantillas_creadas_neo + 1;
            const insertp = await insertPlantilla(resPlantilla.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_organizacion, plist[i].organizacion, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_plantillas_db = datosRes.totales.error_insert_plantillas_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resPlantilla.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_organizacion, plist[i].organizacion, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_plantillas_db = datosRes.totales.insert_plantillas_db + 1;
            }

            const parametrosPlantilla = `&class_id=${resPlantilla.data.id}&user_ids[]=${plist[i].id_usuario}`;
            const respDocP = await peticionApiNeo(url, 'add_teachers_to_class', api_key, parametrosPlantilla);
            if (respDocP.ok) {
                datosRes.totales.docente_plantilla_neo++;
            } else {
                datosRes.totales.error_docente_plantilla_neo++;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en NEO",
                    datos: parametrosPlantilla,
                    respuesta: respDocP
                });
            }

        } else {
            datosRes.totales.error_creacion_plantillas_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resPlantilla
            });
        }
        await delay(500);
    }
    return datosRes;
}

const insertPlantilla = async(id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, user) => {
    const sqlInsert = `INSERT INTO Plantillas (id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, user]);
    return result;
}

const insertParalelo = async(id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro) => {
    const sqlInsert = `INSERT INTO Cursos (id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro]);
    return result;
}

const updateParalelo = async(id_paralelo) => {
    const sqlUpdate = `UPDATE Datos_asignaturas SET paralelo_nuevo = 0 WHERE id_paralelo = ?`;
    const result = await consulta(sqlUpdate, [id_paralelo]);
    return result;
}

const datosParalelosPregrado = (lista) => {
    let paralelos = [];
    for (let i = 0; i < lista.length; i++) {
        const p = {
            nombre: `[${lista[i].semestre_resumido}] ${lista[i].materia_sigla} ${lista[i].materia_nombre} [Par.${lista[i].numero_paralelo}]`,
            fecha_inicio: otroFormatoFecha(lista[i].semestre_fecha_inicio, 'MM/DD/YYYY'),
            fecha_fin: otroFormatoFecha(lista[i].semestre_fecha_fin, 'MM/DD/YYYY'),
            fecha_inicio_or: lista[i].semestre_fecha_inicio,
            fecha_fin_or: lista[i].semestre_fecha_fin,
            creditos: lista[i].paralelo_num_creditos,
            semestre: lista[i].semestre_resumido,
            codigo_curso: `${lista[i].id_regional}.${lista[i].id_paralelo}`,
            lenguaje: 'Español',
            zona_horaria: 'La Paz',
            mostrar_catalogo: true,
            id_plantilla: lista[i].id_plantilla,
            id_organizacion: lista[i].id_organizacion,
            organizacion: lista[i].nom_regional,
            id_paralelo: lista[i].id_paralelo
        }
        paralelos.push(p)
    }
    return paralelos;
}

const crearParalelos = async(plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            paralelos_creados_neo: 0,
            insert_paralelos_db: 0,
            error_creacion_paralelos_neo: 0,
            error_insert_paralelos_db: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&name=${plist[i].nombre}&start_at=${plist[i].fecha_inicio}&finish_at=${plist[i].fecha_fin}&credits=${plist[i].creditos}&semester=${plist[i].semestre}&course_code=${plist[i].codigo_curso}&language=${plist[i].lenguaje}&time_zone=${plist[i].zona_horaria}&display_in_catalog=${plist[i].mostrar_catalogo}&parent_id=${plist[i].id_plantilla}&organization_id=${plist[i].id_organizacion}`;
        const resParalelos = await peticionApiNeo(url, 'add_class', api_key, parametros);
        console.log(resParalelos);
        if (resParalelos.ok) {
            datosRes.totales.paralelos_creados_neo = datosRes.totales.paralelos_creados_neo + 1;
            const update = await updateParalelo(plist[i].id_paralelo)
            const insertp = await insertParalelo(resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_paralelos_db = datosRes.totales.error_insert_paralelos_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_paralelos_db = datosRes.totales.insert_paralelos_db + 1;
            }
        } else {
            datosRes.totales.error_creacion_paralelos_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resParalelos
            });
        }
        await delay(500)
    }
    return datosRes;
}

/* asignaturas practicas */
const crearPlantillasPracticasPregrado = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPracticasPorSemeste(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    const datosPlantillas = await plantillaPorRegional(id_regional);
    if (!datosPlantillas.ok) {
        return res.status(500).json(datosPlantillas);
    }
    console.log("datosAsignaturas", datosAsignaturas.data.length);
    console.log("Plantillas", datosPlantillas.data.length);
    const sinDuplicados = datosPantillasPregrado(datosAsignaturas.data);
    console.log("sinDuplicados", sinDuplicados.length);
    const plantillasACrear = quitarPlantillasExistentes(sinDuplicados, datosPlantillas.data);
    console.log("plantillasACrear", plantillasACrear.length);
    const respCreacion = await crearPlantillas(plantillasACrear, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const listaAsignaturasPracticasPorSemeste = async (id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, u.id_usuario, u.email_institucional, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas_practicas da, Organizaciones o, Usuarios u
    where da.id_regional = o.id_regional
		and u.email_institucional = da.email_ucb_docente
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const crearParalelosPracticasPregrado = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPracticasPorSemestrePlantilla(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    console.log("Paralelos", datosAsignaturas.data.length);
    const listParalelos = datosParalelosPracticasPregrado(datosAsignaturas.data);
    const respCreacion = await crearParalelosPracticas(listParalelos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const listaAsignaturasPracticasPorSemestrePlantilla = async (id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, p.id_plantilla, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas_practicas da, Organizaciones o, Plantillas p
    where da.id_regional = o.id_regional
	and p.codigo_curso = da.codigo_curso_plantilla
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const datosParalelosPracticasPregrado = (lista) => {
    let paralelos = [];
    for (let i = 0; i < lista.length; i++) {
        const p = {
            nombre: `[${lista[i].semestre_resumido}] ${lista[i].materia_sigla} ${lista[i].materia_nombre} [Par.${lista[i].numero_paralelo}]`,
            fecha_inicio: otroFormatoFecha(lista[i].semestre_fecha_inicio, 'MM/DD/YYYY'),
            fecha_fin: otroFormatoFecha(lista[i].semestre_fecha_fin, 'MM/DD/YYYY'),
            fecha_inicio_or: lista[i].semestre_fecha_inicio,
            fecha_fin_or: lista[i].semestre_fecha_fin,
            creditos: lista[i].paralelo_num_creditos,
            semestre: lista[i].semestre_resumido,
            codigo_curso: `${lista[i].id_regional}.${lista[i].id_paralelo_practica}.P`,
            lenguaje: 'Español',
            zona_horaria: 'La Paz',
            mostrar_catalogo: true,
            id_plantilla: lista[i].id_plantilla,
            id_organizacion: lista[i].id_organizacion,
            organizacion: lista[i].nom_regional,
            id_paralelo_practica: lista[i].id_paralelo_practica
        }
        paralelos.push(p)
    }
    return paralelos;
}

const crearParalelosPracticas = async (plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            paralelos_creados_neo: 0,
            insert_paralelos_db: 0,
            error_creacion_paralelos_neo: 0,
            error_insert_paralelos_db: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&name=${plist[i].nombre}&start_at=${plist[i].fecha_inicio}&finish_at=${plist[i].fecha_fin}&credits=${plist[i].creditos}&semester=${plist[i].semestre}&course_code=${plist[i].codigo_curso}&language=${plist[i].lenguaje}&time_zone=${plist[i].zona_horaria}&display_in_catalog=${plist[i].mostrar_catalogo}&parent_id=${plist[i].id_plantilla}&organization_id=${plist[i].id_organizacion}`;
        const resParalelos = await peticionApiNeo(url, 'add_class', api_key, parametros);
        if (resParalelos.ok) {
            datosRes.totales.paralelos_creados_neo = datosRes.totales.paralelos_creados_neo + 1;
            const update = await updateParaleloPractica(plist[i].id_paralelo_practica)
            const insertp = await insertParalelo(resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_paralelos_db = datosRes.totales.error_insert_paralelos_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_paralelos_db = datosRes.totales.insert_paralelos_db + 1;
            }
        } else {
            datosRes.totales.error_creacion_paralelos_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resParalelos
            });
        }
        //await delay(100)
    }
    return datosRes;
}

const updateParaleloPractica = async (id_paralelo) => {
    const sqlUpdate = `UPDATE Datos_asignaturas_practicas SET paralelo_nuevo = 0 WHERE id_paralelo_practica = ?`;
    const result = await consulta(sqlUpdate, [id_paralelo]);
    return result;
}
/* asignaturas practicas */

/*
POSTGRADO
*/
const crearPlantillasPostgrado = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuarioPostgrado(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPostgradoPorSemeste(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    const datosPlantillas = await plantillaPostgradoPorRegional(id_regional);
    if (!datosPlantillas.ok) {
        return res.status(500).json(datosPlantillas);
    }
    console.log("datosAsignaturas", datosAsignaturas.data.length);
    console.log("Plantillas", datosPlantillas.data.length);
    const sinDuplicados = datosPantillasPostgrado(datosAsignaturas.data);
    console.log("sinDuplicados", sinDuplicados.length);
    const plantillasACrear = quitarPlantillasExistentes(sinDuplicados, datosPlantillas.data);
    console.log("plantillasACrear", plantillasACrear.length);
    const respCreacion = await crearPlantillasPorPostgrado(plantillasACrear, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const listaAsignaturasPostgradoPorSemeste = async (id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, u.id_usuario, u.email_institucional, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas_postgrado da, Organizaciones_postgrado o, Usuarios_postgrado u
    where da.id_regional = o.id_regional
		and u.email_institucional = da.email_ucb_docente
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const llavesPorUsuarioPostgrado = async (id_usuario) => {
    const sqlLlavePorUsuario = `select distinct l.url_instancia, l.api_key
    from rolusu ru, Llaves l, Roles r
    where ru.id_llave = l.id_llave and ru.id_rol = r.id_rol
    and r.id_instancia = 3 and ru.id_usuario = ?`;
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

const plantillaPostgradoPorRegional = async (id_regional) => {
    const sqlPlantillasPorRegional = "select p.* from Plantillas_postgrado p, Organizaciones_postgrado o where p.id_organizacion = o.id_organizacion and o.id_regional = ?";
    const result = await consulta(sqlPlantillasPorRegional, [id_regional]);
    return result;
}

const datosPantillasPostgrado = (lista) => {
    let plantillas = [];
    for (let i = 0; i < lista.length; i++) {
        const p = {
            nombre: `Plantilla ${lista[i].materia_sigla} ${lista[i].materia_nombre}`,
            fecha_inicio: otroFormatoFecha(lista[i].semestre_fecha_inicio, 'MM/DD/YYYY'),
            fecha_fin: otroFormatoFecha(lista[i].semestre_fecha_fin, 'MM/DD/YYYY'),
            fecha_inicio_or: lista[i].semestre_fecha_inicio,
            fecha_fin_or: lista[i].semestre_fecha_fin,
            creditos: lista[i].paralelo_num_creditos || 0,
            semestre: lista[i].semestre_resumido,
            codigo_curso: `${lista[i].id_regional}.${lista[i].id_materia}.${lista[i].id_docente}`,
            lenguaje: 'Español',
            zona_horaria: 'La Paz',
            mostrar_catalogo: true,
            id_organizacion: lista[i].id_organizacion,
            organizacion: lista[i].nom_regional,
            id_usuario: lista[i].id_usuario,
            email_ucb_docente: lista[i].email_institucional
        }
        plantillas.push(p)
    }
    let hash = {};
    plantillas = plantillas.filter(o => hash[o.codigo_curso] ? false : hash[o.codigo_curso] = true);
    return plantillas;
}

const crearPlantillasPorPostgrado = async (plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            plantillas_creadas_neo: 0,
            insert_plantillas_db: 0,
            docente_plantilla_neo: 0,
            error_creacion_plantillas_neo: 0,
            error_insert_plantillas_db: 0,
            error_docente_plantilla_neo: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&name=${plist[i].nombre}&start_at=${plist[i].fecha_inicio}&finish_at=${plist[i].fecha_fin}&credits=${plist[i].creditos}&semester=${plist[i].semestre}&course_code=${plist[i].codigo_curso}&language=${plist[i].lenguaje}&time_zone=${plist[i].zona_horaria}&display_in_catalog=${plist[i].mostrar_catalogo}&organization_id=${plist[i].id_organizacion}`;
        const resPlantilla = await peticionApiNeo(url, 'add_class_template', api_key, parametros);
        console.log(">>>>>>", resPlantilla);
        if (resPlantilla.ok) {
            datosRes.totales.plantillas_creadas_neo = datosRes.totales.plantillas_creadas_neo + 1;
            const insertp = await insertPlantillaPostgrado(resPlantilla.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_organizacion, plist[i].organizacion, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_plantillas_db = datosRes.totales.error_insert_plantillas_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resPlantilla.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_organizacion, plist[i].organizacion, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_plantillas_db = datosRes.totales.insert_plantillas_db + 1;
            }

            const parametrosPlantilla = `&class_id=${resPlantilla.data.id}&user_ids[]=${plist[i].id_usuario}`;
            const respDocP = await peticionApiNeo(url, 'add_teachers_to_class', api_key, parametrosPlantilla);
            if (respDocP.ok) {
                datosRes.totales.docente_plantilla_neo++;
            } else {
                datosRes.totales.error_docente_plantilla_neo++;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en NEO",
                    datos: parametrosPlantilla,
                    respuesta: respDocP
                });
            }

        } else {
            datosRes.totales.error_creacion_plantillas_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resPlantilla
            });
        }
        await delay(500);
    }
    return datosRes;
}

const crearParalelosPostgrado = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuarioPostgrado(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const datosAsignaturas = await listaAsignaturasPostgradoPorSemestrePlantilla(id_semestre, id_regional);
    if (!datosAsignaturas.ok) {
        return res.status(500).json(datosAsignaturas);
    }
    console.log("Paralelos", datosAsignaturas.data.length);
    const listParalelos = datosParalelosPostgrado(datosAsignaturas.data);
    const respCreacion = await crearParalelosPorPostgrado(listParalelos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    res.json(success(respCreacion));
}

const listaAsignaturasPostgradoPorSemestrePlantilla = async (id_semestre, id_regional) => {
    const sqlAsignaturasPorSemestre = `select da.*, p.id_plantilla, o.id_organizacion, o.nombre as nom_regional
    from Datos_asignaturas_postgrado da, Organizaciones_postgrado o, Plantillas_postgrado p
    where da.id_regional = o.id_regional
	and p.codigo_curso = da.codigo_curso_plantilla
    and da.paralelo_nuevo = 1
    and da.id_semestre = ?
    and da.id_regional = ?`;
    const resultAsignaturas = await consulta(sqlAsignaturasPorSemestre, [id_semestre, id_regional]);
    return resultAsignaturas;
}

const datosParalelosPostgrado = (lista) => {
    let paralelos = [];
    for (let i = 0; i < lista.length; i++) {
        const p = {
            nombre: `[${lista[i].semestre_resumido}] ${lista[i].materia_sigla} ${lista[i].materia_nombre} [Par.${lista[i].numero_paralelo}]`,
            descripcion: lista[i].carrera_nombre,
            codigo_seccion: lista[i].materia_sigla.split('-')[0],
            fecha_inicio: otroFormatoFecha(lista[i].semestre_fecha_inicio, 'MM/DD/YYYY'),
            fecha_fin: otroFormatoFecha(lista[i].semestre_fecha_fin, 'MM/DD/YYYY'),
            fecha_inicio_or: lista[i].semestre_fecha_inicio,
            fecha_fin_or: lista[i].semestre_fecha_fin,
            creditos: lista[i].paralelo_num_creditos,
            semestre: lista[i].semestre_resumido,
            codigo_curso: `${lista[i].id_regional}.${lista[i].id_paralelo}`,
            lenguaje: 'Español',
            zona_horaria: 'La Paz',
            mostrar_catalogo: true,
            id_plantilla: lista[i].id_plantilla,
            id_organizacion: lista[i].id_organizacion,
            organizacion: lista[i].nom_regional,
            id_paralelo: lista[i].id_paralelo
        }
        paralelos.push(p)
    }
    return paralelos;
}

const crearParalelosPorPostgrado = async (plist, url, api_key, user) => {
    let datosRes = {
        totales: {
            paralelos_creados_neo: 0,
            insert_paralelos_db: 0,
            error_creacion_paralelos_neo: 0,
            error_insert_paralelos_db: 0,
        },
        datos_respuestas: []
    };
    for (let i = 0; i < plist.length; i++) {
        const parametros = `&name=${plist[i].nombre}&description=${plist[i].descripcion}&section_code=${plist[i].codigo_seccion}&start_at=${plist[i].fecha_inicio}&finish_at=${plist[i].fecha_fin}&credits=${plist[i].creditos}&semester=${plist[i].semestre}&course_code=${plist[i].codigo_curso}&language=${plist[i].lenguaje}&time_zone=${plist[i].zona_horaria}&display_in_catalog=${plist[i].mostrar_catalogo}&parent_id=${plist[i].id_plantilla}&organization_id=${plist[i].id_organizacion}`;
        const resParalelos = await peticionApiNeo(url, 'add_class', api_key, parametros);
        console.log(resParalelos);
        if (resParalelos.ok) {
            datosRes.totales.paralelos_creados_neo = datosRes.totales.paralelos_creados_neo + 1;
            const update = await updateParaleloPostgrado(plist[i].id_paralelo)
            const insertp = await insertParaleloPostgrado(resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user);
            if (!insertp.ok) {
                datosRes.totales.error_insert_paralelos_db = datosRes.totales.error_insert_paralelos_db + 1;
                datosRes.datos_respuestas.push({
                    tipo: "Creacion en db auxiliar",
                    datos: [resParalelos.data.id, plist[i].nombre, plist[i].fecha_inicio_or, plist[i].fecha_fin_or, plist[i].creditos, plist[i].semestre, plist[i].codigo_curso, plist[i].id_plantilla, plist[i].id_organizacion, plist[i].organizacion, user].toString(),
                    respuesta: insertp
                });
            } else {
                datosRes.totales.insert_paralelos_db = datosRes.totales.insert_paralelos_db + 1;
            }
        } else {
            datosRes.totales.error_creacion_paralelos_neo++;
            datosRes.datos_respuestas.push({
                tipo: "Creacion en NEO",
                datos: parametros,
                respuesta: resParalelos
            });
        }
        await delay(500)
    }
    return datosRes;
}

const insertPlantillaPostgrado = async (id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, user) => {
    const sqlInsert = `INSERT INTO Plantillas_postgrado (id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_plantilla, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_organizacion, organizacion, user]);
    return result;
}

const insertParaleloPostgrado = async (id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro) => {
    const sqlInsert = `INSERT INTO Cursos_postgrado (id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_curso, nombre, fecha_inicio, fecha_fin, creditos, semestre, codigo_curso, id_plantilla, id_organizacion, organizacion, usuario_registro]);
    return result;
}

const updateParaleloPostgrado = async (id_paralelo) => {
    const sqlUpdate = `UPDATE Datos_asignaturas_postgrado SET paralelo_nuevo = 0 WHERE id_paralelo = ?`;
    const result = await consulta(sqlUpdate, [id_paralelo]);
    return result;
}

/*
POSTGRADO
*/

module.exports = {
    crearPlantillasPregrado,
    crearParalelosPregrado,
    crearPlantillasPracticasPregrado,
    crearParalelosPracticasPregrado,
    crearPlantillasPostgrado,
    crearParalelosPostgrado
}