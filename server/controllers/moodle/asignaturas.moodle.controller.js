require('dotenv').config();
const { request, response } = require('express');
const { consultaMoodle, peticionApiMoodle } = require('./query.moodle.controller');
const { llavesPorUsuario } = require('./moodle.controller');
const { error, success } = require('./respuestas.moodle.controller');
const { capitalizar, otroFormatoFecha } = require('../../tools/util.tools');

/** Definición SQL */
const SQLParalelosPorSemestre = `SELECT *
    FROM (
    SELECT CONCAT_WS('',da.id_paralelo,da.tipo_paralelo) id, da.*, c.id idcoursemoodle
    FROM Datos_asignaturas_moodle da
    LEFT JOIN virtual_course c ON c.idnumber = CONCAT_WS('',da.id_paralelo,da.tipo_paralelo)
    WHERE da.id_semestre = ? and da.id_regional = ?
    ) cda
    WHERE cda.idcoursemoodle is null`;
/** Definición SQL */

const crearParalelosMoodle = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(4, id_usuario); //4=id_instancia MOODLE
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const listaParalelos = await listaParalelosPorSemestre(id_semestre, id_regional);
    console.log('listaParalelos', listaParalelos.length);
    const params = await generarListaParalelosACrear(listaParalelos);
    console.log(params.length);

    const respCrear = await crearCursos(params, llaves.data[0].url_instancia, llaves.data[0].api_key, user)
    if (!respCrear.ok) {
        res.status(500).json(respCrear);
    }
    res.json(respCrear);
}

const listaParalelosPorSemestre = async(id_semestre, id_regional) => {
    const resultParalelos = await consultaMoodle(SQLParalelosPorSemestre, [id_semestre, id_regional]);
    return resultParalelos.ok ? resultParalelos.data : [];
}

const generarListaParalelosACrear = async(paralelos) => {
    let listParams = [];
    let params = '';
    for (let i = 0; i < paralelos.length; i=i+5) {
        for (let j = i; j < i + 5; j++) {
            const p = paralelos[j];
            if(p != undefined) {
                fullname = `${p.materia_sigla} ${p.materia_nombre} [Par. ${p.numero_paralelo}] - [${p.semestre_resumido}]`;
                shortname = `${p.materia_sigla} [Par. ${p.numero_paralelo}]`;
                categoryid = 3;
                idnumber = `${p.id}`;
                startdate = new Date(p.semestre_fecha_inicio).getTime() / 1000;
                enddate = new Date(p.semestre_fecha_fin).getTime() / 1000;
                id_paralelo = p.id_paralelo;
                materia_sigla = p.materia_sigla;
                numero_paralelo = p.numero_paralelo;
                paralelo_num_creditos = p.paralelo_num_creditos;
                carrera_nombre = capitalizar(p.carrera_nombre);
                departamento_materia = capitalizar(p.departamento_materia);
                id_semestre = p.id_semestre;
                semestre_resumido = p.semestre_resumido;
                nombre_regional = capitalizar(p.nombre_regional);
                tipo_paralelo = p.tipo_paralelo;
                
                params = params + generarParamsValueParalelo(j, fullname, shortname, categoryid, idnumber, startdate, enddate, id_paralelo, materia_sigla, numero_paralelo, paralelo_num_creditos, carrera_nombre, departamento_materia, id_semestre, semestre_resumido, nombre_regional, tipo_paralelo)
            }
        }
        listParams.push(params);
        params = '';        
    }
    
    return listParams
}

const generarParamsValueParalelo = (index, fullname, shortname, categoryid, idnumber, startdate, enddate, id_paralelo, materia_sigla, numero_paralelo, paralelo_num_creditos, carrera_nombre, departamento_materia, id_semestre, semestre_resumido, nombre_regional, tipo_paralelo) => {
    valores = `&courses[${index}][fullname]=${fullname}&courses[${index}][shortname]=${shortname}&courses[${index}][categoryid]=${categoryid}&courses[${index}][idnumber]=${idnumber}&courses[${index}][format]=mosaic&courses[${index}][startdate]=${startdate}&courses[${index}][enddate]=${enddate}&courses[${index}][showreports]=1&courses[${index}][visible]=1&courses[${index}][enablecompletion]=1&courses[${index}][lang]=es&courses[${index}][customfields][0][shortname]=id_paralelo&courses[${index}][customfields][0][value]=${id_paralelo}&courses[${index}][customfields][1][shortname]=materia_sigla&courses[${index}][customfields][1][value]=${materia_sigla}&courses[${index}][customfields][2][shortname]=numero_paralelo&courses[${index}][customfields][2][value]=${numero_paralelo}&courses[${index}][customfields][3][shortname]=paralelo_num_creditos&courses[${index}][customfields][3][value]=${paralelo_num_creditos}&courses[${index}][customfields][4][shortname]=carrera_nombre&courses[${index}][customfields][4][value]=${carrera_nombre}&courses[${index}][customfields][5][shortname]=departamento_materia&courses[${index}][customfields][5][value]=${departamento_materia}&courses[${index}][customfields][6][shortname]=id_semestre&courses[${index}][customfields][6][value]=${id_semestre}&courses[${index}][customfields][7][shortname]=semestre_resumido&courses[${index}][customfields][7][value]=${semestre_resumido}&courses[${index}][customfields][8][shortname]=nombre_regional&courses[${index}][customfields][8][value]=${nombre_regional}&courses[${index}][customfields][9][shortname]=tipo_paralelo&courses[${index}][customfields][9][value]=${tipo_paralelo}`;
    /*valores = `
    &courses[${index}][fullname]=${fullname}
    &courses[${index}][shortname]=${shortname}
    &courses[${index}][categoryid]=${categoryid}
    &courses[${index}][idnumber]=${idnumber}
    &courses[${index}][format]=mosaic
    &courses[${index}][startdate]=${startdate}
    &courses[${index}][enddate]=${enddate}
    &courses[${index}][showreports]=1
    &courses[${index}][visible]=1
    &courses[${index}][enablecompletion]=1
    &courses[${index}][lang]=es
    &courses[${index}][customfields][0][shortname]=id_paralelo
    &courses[${index}][customfields][0][value]=${id_paralelo}
    &courses[${index}][customfields][1][shortname]=materia_sigla
    &courses[${index}][customfields][1][value]=${materia_sigla}
    &courses[${index}][customfields][2][shortname]=numero_paralelo
    &courses[${index}][customfields][2][value]=${numero_paralelo}
    &courses[${index}][customfields][3][shortname]=paralelo_num_creditos
    &courses[${index}][customfields][3][value]=${paralelo_num_creditos}
    &courses[${index}][customfields][4][shortname]=carrera_nombre
    &courses[${index}][customfields][4][value]=${carrera_nombre}
    &courses[${index}][customfields][5][shortname]=departamento_materia
    &courses[${index}][customfields][5][value]=${departamento_materia}
    &courses[${index}][customfields][6][shortname]=id_semestre
    &courses[${index}][customfields][6][value]=${id_semestre}
    &courses[${index}][customfields][7][shortname]=semestre_resumido
    &courses[${index}][customfields][7][value]=${semestre_resumido}
    &courses[${index}][customfields][8][shortname]=nombre_regional
    &courses[${index}][customfields][8][value]=${nombre_regional}
    &courses[${index}][customfields][9][shortname]=tipo_paralelo
    &courses[${index}][customfields][9][value]=${tipo_paralelo}
    `;*/
    return valores;
}

const crearCursos = async (listParams, url, api_key, user) => {
    let datosRes = {
        msg: "Registro de cursos",
        datos_respuestas: {
            total: 0,
            data: []
        },
        datos_Error: {
            total: 0,
            data: []
        },
    };

    if (listParams.length == 0) {
        return success(datosRes);
    }

    for (let i = 0; i < listParams.length; i++) {
        const params = listParams[i];
        //console.log(params);
        const respPeticion = await peticionApiMoodle(url, 'core_course_create_courses', api_key, params);
        
        if (!respPeticion.ok) {
            datosRes.datos_Error.total = datosRes.datos_Error.total + 1;
            datosRes.datos_Error.data.push(respPeticion.error);
            return error(datosRes);
        }

        datosRes.datos_respuestas.total = datosRes.datos_respuestas.total + respPeticion.data.length;
        datosRes.datos_respuestas.data.push(respPeticion.data);
    }

    return success(datosRes);
}

module.exports = {
    //nombreFuncion
    crearParalelosMoodle
}