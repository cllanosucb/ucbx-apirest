require('dotenv').config();
const { request, response } = require('express');
const { consulta, peticionApiMoodle } = require('./query.moodle.controller');
const { llavesPorUsuario } = require('./moodle.controller');
const { error, success } = require('./respuestas.moodle.controller');
const { capitalizar, otroFormatoFecha } = require('../../tools/util.tools');

/** Definición de SQL */
const SQLDocentesPorSemestre = `SELECT dp.*, u.id_persona id_persona_u, u.id_usuario_moodle
    FROM Docentes_paralelos_moodle dp
    LEFT JOIN Usuarios_moodle u ON dp.id_docente = u.id_persona
    WHERE id_semestre = ? and id_regional = ?`;
const SQLInsertUsuarios = `INSERT INTO ucbonline.Usuarios_moodle (id_persona, id_usuario_moodle, username, firstname, lastname, email, phone2, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario, estado, usuario_registro) VALUES`
/** Definición de SQL */

const crearDocentesMoodle = async (req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    const { id_semestre, id_regional } = req.body;
    const llaves = await llavesPorUsuario(4, id_usuario); //4=id_instancia MOODLE
    console.log(llaves);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }
    const ListaDocentes = await listaDocentesPorSemestre(id_semestre, id_regional);
    console.log("listDocentes", ListaDocentes.length);

    const params = await generarListaDocentesACrear(ListaDocentes);
    console.log(params);
    //console.log("cant docentes crear", listDocentes.length);
    const respCrear = await crearDocentesPorPostgrado(ListaDocentes, params, llaves.data[0].url_instancia, llaves.data[0].api_key, user);
    //res.json(success(respCreacion));
}

const listaDocentesPorSemestre = async (id_semestre, id_regional) => {
    const resultDocentes = await consulta(SQLDocentesPorSemestre, [id_semestre, id_regional]);
    return resultDocentes.ok ? resultDocentes.data : [];
}

const generarListaDocentesACrear = async (listaDocentes) => {
    let params = '';
    const docentesUnicos = [];
    const idsUnicos = {};
    listaDocentes.forEach(docente => {
        if (!idsUnicos[docente.id_docente]) {
            docentesUnicos.push(docente);
            idsUnicos[docente.id_docente] = true;
        }
    });
    for (let i = 0; i < docentesUnicos.length; i++) {        
        if (docentesUnicos[i].id_usuario_moodle === null) {
            username = docentesUnicos[i].email_ucb_docente.toLowerCase().split('@')[0];
            firstname = capitalizar(docentesUnicos[i].nombres_docente);
            lastname = `${docentesUnicos[i].ap_paterno_docente != null ? capitalizar(docentesUnicos[i].ap_paterno_docente) : ''} ${docentesUnicos[i].ap_materno_docente != null ? capitalizar(docentesUnicos[i].ap_materno_docente) : ''}`.trim();
            email = docentesUnicos[i].email_ucb_docente.toLowerCase();
            phone2 = docentesUnicos[i].celular_docente != null ? docentesUnicos[i].celular_docente : ''
            id_persona = docentesUnicos[i].id_docente;
            documento_identidad = docentesUnicos[i].ci_docente;
            fecha_nacimiento = docentesUnicos[i].fecha_nacimiento_docente != null ? otroFormatoFecha(docentesUnicos[i].fecha_nacimiento_docente, 'YYYY/MM/DD') : '';
            genero = docentesUnicos[i].sexo_docente == 1 ? 'Hombre' : 'Mujer';
            carrera = docentesUnicos[i].departamento_docente != null ? capitalizar(docentesUnicos[i].departamento_docente) : '';
            id_sede = docentesUnicos[i].id_regional;
            sede = capitalizar(docentesUnicos[i].nombre_regional);
            tipo_usuario = 'Profesor';
            params = params + generarParamsValueUsuario(i, username, firstname, lastname, email, phone2, id_persona, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario);
        }        
    }
    return params;
}

const generarParamsValueUsuario = (index, username, firstname, lastname, email, phone2, id_persona, documento_identidad, fecha_nacimiento, genero, carrera, id_sede, sede, tipo_usuario) => {
    valores = `
        &users[${index}][username]=${username}
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
        &users[${index}][customfields][7][value]=${tipo_usuario}`;
    return valores;
}

const crearDocentesPorPostgrado = async (ListaDocentes, params, url, api_key, user) => {
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

    const respPeticion = await peticionApiMoodle(url, api_key, params);

    /* const docentesMoodle = ListaDocentes.map(d => {
        const userMoodle = respPeticion.data.find(rd => rd.username === d.username);
        return {
            id_paralelo:d.id_paralelo,
            id_semestre:d.id_semestre,
            tipo_paralelo:d.tipo_paralelo,
            id_docente:d.id_docente,
            ap_paterno_docente:d.ap_paterno_docente,
            ap_materno_docente:d.ap_materno_docente,
            nombres_docente:d.nombres_docente,
            ci_docente:d.ci_docente,
            sexo_docente:d.sexo_docente,
            fecha_nacimiento_docente:d.fecha_nacimiento_docente,
            celular_docente:d.celular_docente,
            email_ucb_docente:d.email_ucb_docente,
            id_regional:d.id_regional,
            nombre_regional:d.nombre_regional,
            departamento_docente:d.departamento_docente,
            estado_asignacion:d.estado_asignacion,
            estado_registro:d.estado_registro,
            usuario_registro:d.usuario_registro,
            fecha_registro:d.fecha_registro,
            id_persona_u: d.id_docente,
            id_usuario_moodle: userMoodle ? userMoodle.id : null,
        };
    }); */


    return datosRes;
}


const insertUsuarioPostgrado = async (id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro) => {
    const sqlInsert = `INSERT INTO Usuarios_postgrado (id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await consulta(sqlInsert, [id_usuario, nombre, primer_ap, userid, fecha_nac, ci, sexo, carrera_usuario, registro_ucb, email_institucional, telefono, id_organizacion, tipo_cuenta, archivado, usuario_registro]);
    return result;
}


module.exports = {
    crearDocentesMoodle
}