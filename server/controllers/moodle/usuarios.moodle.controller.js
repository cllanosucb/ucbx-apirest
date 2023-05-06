require('dotenv').config();
const { request, response } = require('express');
const { consultaMoodle, peticionApiMoodle } = require('./query.moodle.controller');
const { llavesPorUsuario } = require('./moodle.controller');
const { error, success } = require('./respuestas.moodle.controller');
const { capitalizar, otroFormatoFecha } = require('../../tools/util.tools');

/** Definición de SQL */
const SQLDocentesPorSemestre = `SELECT dp.*, u.id id_usuario_moodle
    FROM Docentes_paralelos_moodle dp
    LEFT JOIN virtual_user u ON dp.email_ucb_docente = u.email
    WHERE dp.id_semestre = ? and dp.id_regional = ? and u.id is null`;
const SQLInsertUsuarios = `INSERT INTO ucbonline.Usuarios_moodle (id_persona, id_usuario_moodle, username, firstname, lastname, email, phone2, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario, estado, usuario_registro) VALUES`
/** Definición de SQL */

const crearDocentesMoodle = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(4, id_usuario); //4=id_instancia MOODLE
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const ListaDocentes = await listaDocentesPorSemestre(id_semestre, id_regional);
    console.log("listDocentes", ListaDocentes.length);

    const params = await generarListaDocentesACrear(ListaDocentes);
    console.log("params", params.length);
    //console.log("params", params);
    const respCrear = await crearUsuarios(params, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    if(!respCrear.ok) {
        res.status(500).json(respCrear);
    }
    res.json(respCrear);
}

const listaDocentesPorSemestre = async (id_semestre, id_regional) => {
    const resultDocentes = await consultaMoodle(SQLDocentesPorSemestre, [id_semestre, id_regional]);
    return resultDocentes.ok ? resultDocentes.data : [];
}

const generarListaDocentesACrear = async (listaDocentes) => {
    let listParams = [];
    let params = '';
    const docentesUnicos = [];
    const idsUnicos = {};
    listaDocentes.forEach(docente => {
        if (!idsUnicos[docente.id_docente]) {
            docentesUnicos.push(docente);
            idsUnicos[docente.id_docente] = true;
        }
    });
    for (let i = 0; i < docentesUnicos.length; i=i+7) {
        for (let j = i; j < i + 7; j++) {
            const u = docentesUnicos[j];
            if(u != undefined) {
                username = u.email_ucb_docente.toLowerCase().split('@')[0];
                firstname = capitalizar(u.nombres_docente);
                lastname = `${u.ap_paterno_docente != null ? capitalizar(u.ap_paterno_docente) : ''} ${u.ap_materno_docente != null ? capitalizar(u.ap_materno_docente) : ''}`.trim();
                email = u.email_ucb_docente.toLowerCase();
                phone2 = u.celular_docente != null ? u.celular_docente : ''
                id_persona = u.id_docente;
                documento_identidad = u.ci_docente;
                fecha_nacimiento = u.fecha_nacimiento_docente != null ? otroFormatoFecha(u.fecha_nacimiento_docente, 'YYYY/MM/DD') : '';
                genero = u.sexo_docente == 1 ? 'Hombre' : 'Mujer';
                carrera = u.departamento_docente != null ? capitalizar(u.departamento_docente) : '';
                id_sede = u.id_regional;
                sede = capitalizar(u.nombre_regional);
                tipo_usuario = 'Profesor';

                params = params + generarParamsValueUsuario(j, username, firstname, lastname, email, phone2, id_persona, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario);
            }
        }
        listParams.push(params);
        params = '';   
    }

    return listParams;
}

const generarParamsValueUsuario = (index, username, firstname, lastname, email, phone2, id_persona, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario) => {
    valores = `&users[${index}][username]=${username}&users[${index}][auth]=oauth2&users[${index}][firstname]=${firstname}&users[${index}][lastname]=${lastname}&users[${index}][email]=${email}&users[${index}][timezone]=America/La_Paz&users[${index}][idnumber]=${id_persona}&users[${index}][phone2]=${phone2}&users[${index}][customfields][0][type]=id_persona&users[${index}][customfields][0][value]=${id_persona}&users[${index}][customfields][1][type]=documento_identidad&users[${index}][customfields][1][value]=${documento_identidad}&users[${index}][customfields][2][type]=fecha_nacimiento&users[${index}][customfields][2][value]=${fecha_nacimiento}&users[${index}][customfields][3][type]=genero&users[${index}][customfields][3][value]=${genero}&users[${index}][customfields][4][type]=carrera&users[${index}][customfields][4][value]=${carrera}&users[${index}][customfields][5][type]=id_sede&users[${index}][customfields][5][value]=${id_sede}&users[${index}][customfields][6][type]=sede&users[${index}][customfields][6][value]=${sede}&users[${index}][customfields][7][type]=tipo_usuario&users[${index}][customfields][7][value]=${tipo_usuario}`;
    /*valores = `&users[${index}][username]=${username}
        &users[${index}][auth]=oauth2
        &users[${index}][firstname]=${firstname}
        &users[${index}][lastname]=${lastname}
        &users[${index}][email]=${email}
        &users[${index}][timezone]=America/La_Paz
        &users[${index}][idnumber]=${id_persona}
        &users[${index}][phone2]=${phone2}
        &users[${index}][customfields][0][type]=id_persona
        &users[${index}][customfields][0][value]=${id_persona}
        &users[${index}][customfields][1][type]=documento_identidad
        &users[${index}][customfields][1][value]=${documento_identidad}
        &users[${index}][customfields][2][type]=fecha_nacimiento
        &users[${index}][customfields][2][value]=${fecha_nacimiento}
        &users[${index}][customfields][3][type]=genero
        &users[${index}][customfields][3][value]=${genero}
        &users[${index}][customfields][4][type]=carrera
        &users[${index}][customfields][4][value]=${carrera}
        &users[${index}][customfields][5][type]=id_sede
        &users[${index}][customfields][5][value]=${id_sede}
        &users[${index}][customfields][6][type]=sede
        &users[${index}][customfields][6][value]=${sede}
        &users[${index}][customfields][7][type]=tipo_usuario
        &users[${index}][customfields][7][value]=${tipo_usuario}`;*/
    return valores;
}

const crearUsuarios = async (listParams, url, api_key, user) => {
    let datosRes = {
        msg: "Registro de usuarios",
        datos_respuestas: {
            total: 0,
            data: []
        },
        datos_Error: {
            total: 0,
            data: []
        },
    };

    if (listParams.length == 0){
        return success(datosRes);
    }

    for (let i = 0; i < listParams.length; i++) {
        const params = listParams[i];
        //console.log(params);
        const respPeticion = await peticionApiMoodle(url, 'core_user_create_users', api_key, params);

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
    crearDocentesMoodle
}