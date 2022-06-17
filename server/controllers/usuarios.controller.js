require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const { array } = require('yup');

const registrarUsuariosPorCurso = async(req = request, res = response) => {
    const data = req.body;
    const userDatos = req.datos;
    let arrayData = [];
    for (let i = 0; i < data.length; i++) {
        let curso = {
            id_curso: data[i],
            estudiantes: []
        };
        const resp = await peticionNeo('get_students_for_class', `&class_id=${data[i]}`);
        curso.estudiantes = (resp.ok ? resp.data : []);
        arrayData.push(curso);
    }
    // console.log(data);
    const resultInsert = await registrarUsuarios(arrayData, userDatos);
    if (resultInsert.ok) {
        return res.json(resultInsert);
    } else {
        return res.status(500).json(resultInsert);
    }
}

const registrarUsuarios = async(arr, userDatos) => {
        const sqlUsuarioPorId = "SELECT * FROM Usuarios WHERE id_usuario = ?";
        const sqlUsuarioCursoPorId = "SELECT * FROM Usuarios_cursos WHERE id_curso = ? AND id_usuario = ?";
        const sqlInsertUsuarios = `INSERT INTO Usuarios (id_usuario, userid, nombre, primer_ap, email_institucional, telefono, fecha_nac, archivado, segundo_ap, sexo, ci, usuario_registro) VALUES\n`;
        const sqlInsertUsuariosCursos = `INSERT INTO Usuarios_cursos (id_curso, id_usuario, usuario_registro) VALUES\n`;
        let valueInsertUsuarios = "";
        let valueInsertUsuariosCursos = "";
        try {
            for (let i = 0; i < arr.length; i++) {
                const id_curso = arr[i].id_curso;
                for (let j = 0; j < arr[i].estudiantes.length; j++) {
                    const resultUsuario = await consulta(sqlUsuarioPorId, [arr[i].estudiantes[j].id]);
                    const resultUsuarioCurso = await consulta(sqlUsuarioCursoPorId, [id_curso, arr[i].estudiantes[j].id]);
                    if (resultUsuario.ok) {
                        if (resultUsuario.data.length == 0) {
                            let valueUsuario = `(${arr[i].estudiantes[j].id},'${arr[i].estudiantes[j].userid}',${arr[i].estudiantes[j].first_name == null ? null : `UPPER('${arr[i].estudiantes[j].first_name}')`},${arr[i].estudiantes[j].last_name == null ? null : `UPPER('${arr[i].estudiantes[j].last_name}')`},${arr[i].estudiantes[j].email == null ? null : `'${arr[i].estudiantes[j].email}'`},${arr[i].estudiantes[j].phone == null ? null : `'${arr[i].estudiantes[j].phone}'`},${arr[i].estudiantes[j]["fecha nacimiento"] == null ? null : `'${arr[i].estudiantes[j]["fecha nacimiento"]}'`},${arr[i].estudiantes[j].archived == false ? 0 : 1},${arr[i].estudiantes[j]["segundo apellido"] == null ? null : `UPPER('${arr[i].estudiantes[j]["segundo apellido"]}')`},${arr[i].estudiantes[j].sexo == null ? null : `UPPER('${arr[i].estudiantes[j].sexo}')`}, ${arr[i].estudiantes[j]["carnet de identidad"] == null ? null : `'${arr[i].estudiantes[j]["carnet de identidad"]}'`},'${userDatos.usuario.split('@')[0]}'),`;
                        if (!valueInsertUsuarios.includes(valueUsuario)) {
                            valueInsertUsuarios = valueInsertUsuarios + valueUsuario;
                        }
                    }
                }
                if (resultUsuarioCurso.ok) {
                    if (resultUsuarioCurso.data.length == 0) {
                        const valueUsuarioCurso = `(${id_curso},${arr[i].estudiantes[j].id},'${userDatos.usuario.split('@')[0]}'),`;
                        valueInsertUsuariosCursos = valueInsertUsuariosCursos + valueUsuarioCurso;
                    }
                }
            }
        }
        let respS = {
            msg: "Registros creados",
            data: {
                insert_usuarios: "Ya registrados",
                insert_usuarios_cursos: "Ya registrados"
            }
        };
        if (valueInsertUsuarios.length > 0) {
            const insertUsuarios = await consulta(sqlInsertUsuarios + valueInsertUsuarios.substring(0, valueInsertUsuarios.length - 1) + ";", []);
            if (insertUsuarios.ok) {
                respS.data.insert_usuarios = JSON.stringify(insertUsuarios.data, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "" : value
                );
            } else {
                return error({
                    msg: "Error interno del servidor",
                    error: JSON.stringify(insertUsuarios.error, (key, value) =>
                        typeof value === "bigint" ? value.toString() + "" : value
                    )
                });
            }
        }
        if (valueInsertUsuariosCursos.length > 0) {
            const insertUsuariosCursos = await consulta(sqlInsertUsuariosCursos + valueInsertUsuariosCursos.substring(0, valueInsertUsuariosCursos.length - 1) + ";", []);
            const resultInsert = insertUsuariosCursos.ok ? insertUsuariosCursos.data : insertUsuariosCursos.error;
            respS.data.insert_usuarios_cursos = JSON.stringify(resultInsert, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            );
        }
        return success(respS);
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

const usuarioPorToken = async (req = request, res = response) => {
    const sqlUsuarioPorId = "SELECT * FROM Usuarios WHERE id_usuario = ?";
    const resultUsuario = await consulta(sqlUsuarioPorId, [req.datos.id_usuario]);
    if (!resultUsuario.ok) {
        return res.status(500).json(resultUsuario);
    }
    res.json(success({
        usuario: resultUsuario.data[0]
    }))
}

const obtenerMenuPorUsuario = async (req = request, res = response) => {
    const sqlMenuPorId = "SELECT r.id_rol, r.nombre as rol, i.id_instancia, i.nombre as instancia, m.id_menu, m.nombre as menu, p.id_proceso, p.nombre as proceso, p.enlace " +
        "FROM rolusu ru, Roles r, Instancias i, MenuRol mr, Menus m, MenuPro mp, Procesos p " +
        "WHERE ru.id_rol = r.id_rol AND r.id_rol = mr.id_rol AND r.id_instancia = i.id_instancia AND mr.id_menu = m.id_menu AND m.id_menu = mp.id_menu AND mp.id_proceso = p.id_proceso AND r.estado = 1 AND m.estado = 1 AND p.estado = 1 AND ru.id_usuario = ?";
    const resultsql = await consulta(sqlMenuPorId, [req.datos.id_usuario]);
    // let hash = {};
    // const array = resultsql.data.filter(d => hash[d.id_instancia] ? false : hash[d.id_instancia] = true);
    transformarMenuDatos(resultsql.data)
    console.log(array);
    if (!resultsql.ok) {
        return res.status(500).json(resultsql);
    }
    res.json(success({
        // instancia: array,
        menu: resultsql.data
    }))
}

const transformarMenuDatos = (arr) => {
    let hash = {};
    let instancias = [
        {
            id_instancia: 1,
            instancia: "UCBONLINE",
            menus: []
        }
    ];
    /* const array = arr.filter(d => {
        const existe = hash[d.id_instancia] ? false : hash[d.id_instancia] = true
        console.log(datos);
        if (existe) {
            const instancia = {
                id_instancia: d.id_instancia,
                instancia: d.instancia,
                menus: []
            }
        }
    }); */

    for (let i = 0; i < arr.length; i++) {
        console.log(arr[i].id_instancia);
        const existeInstancia = instancias.find(e => e.id_instancia == arr[i].id_instancia ? true : false);
        console.log("existeInstancia", existeInstancia);
        /* if(existeInstancia) {
            
        }else {

        } */
    }
}

module.exports = {
    registrarUsuariosPorCurso,
    usuarioPorToken,
    obtenerMenuPorUsuario
}