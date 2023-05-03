require('dotenv').config();
const db = require('../../db/mariadb');
const fs = require('fs');
const { request, response } = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionApiNeo } = require('../querys.controller');
const { error, success } = require('../respuestas.controller');
const {
    formatoFecha,
    transformarNomRegional,
    formatoFechaNeo,
    otroFormatoFecha,
    delay
} = require('../../tools/util.tools');

/* Ejemplo
const nombreFuncion = async (req = request, res = response) => {
    res.json({msg: 'Respuesta'});
}
*/

const crearParalelosMoodle = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    //const datosAsignaturas = await listaAsignaturasPorSemestrePlantilla(id_semestre, id_regional);
    //if (!datosAsignaturas.ok) {
    //    return res.status(500).json(datosAsignaturas);
    //}
    //console.log("Paralelos", datosAsignaturas.data.length);
    const listParalelos = datosParalelosPregrado(datosAsignaturas.data);
    //const respCreacion = await crearParalelos(listParalelos, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    //res.json(success(respCreacion));
}

const llavesPorUsuario = async (id_usuario) => {
    const sqlLlavePorUsuario = `select distinct l.url_instancia, l.api_key
    from rolusu ru, Llaves l, Roles r
    where ru.id_llave = l.id_llave and ru.id_rol = r.id_rol
    and r.id_instancia = 4 and ru.id_usuario = ?`;
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

module.exports = {
    //nombreFuncion
    crearParalelosMoodle
}