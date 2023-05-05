require('dotenv').config();
const { request, response } = require('express');
const { consulta, peticionApiMoodle } = require('./query.moodle.controller');
const { llavesPorUsuario } = require('./moodle.controller');
const { error, success } = require('./respuestas.moodle.controller');
const { capitalizar, otroFormatoFecha } = require('../../tools/util.tools');

const crearParalelosMoodle = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(4, id_usuario); //4=id_instancia MOODLE
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