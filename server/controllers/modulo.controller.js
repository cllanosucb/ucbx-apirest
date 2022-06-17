require('dotenv').config();
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');

const guardarModulos = async(req = request, res = response) => {
    const cursosId = req.body;
    const userDatos = req.datos;
    let arrayModulos = [];
    for (let i = 0; i < cursosId.length; i++) {
        let cursoModulo = {
            id_curso: cursosId[i],
            modulos: []
        };
        const resp = await peticionNeo('get_lessons_for_class', `&class_id=${cursosId[i]}`);
        cursoModulo.modulos = (resp.ok ? resp.data : []);
        arrayModulos.push(cursoModulo);
    }
    const resultRegistro = await registrarModulos(arrayModulos, userDatos)
    if (resultRegistro.ok) {
        return res.json(success(resultRegistro.data));
    } else {
        return res.status(500).json(error(resultRegistro.error));
    }
}

const registrarModulos = async(arr, userDatos) => {
        const sqlModuloPorId = "SELECT * FROM Modulos WHERE id_modulo = ?";
        const sqlInsertModulos = "INSERT INTO Modulos (id_modulo,nombre,descripcion,id_curso,usuario_registro) VALUES";
        const sqlUpdateModulos = "UPDATE Modulos SET nombre=?, descripcion=? WHERE id_modulo=?";
        let contUpdate = 0;
        let valuesModulos = "";
        try {
            for (let i = 0; i < arr.length; i++) {
                const id_curso = arr[i].id_curso;
                for (let j = 0; j < arr[i].modulos.length; j++) {
                    const resultModulo = await consulta(sqlModuloPorId, [arr[i].modulos[j].id]);
                    if (resultModulo.ok) {
                        if (resultModulo.data.length == 0) {
                            let valuemodulo = `(${arr[i].modulos[j].id},UPPER('${arr[i].modulos[j].name}'),${arr[i].modulos[j].description == null ? null : `'${arr[i].modulos[j].description}'`},${id_curso},'${userDatos.usuario.split('@')[0]}'),`;
                        valuesModulos = valuesModulos + valuemodulo;
                    }else {
                        const updatem = await consulta(sqlUpdateModulos, [arr[i].modulos[j].name.toUpperCase(), arr[i].modulos[j].description, arr[i].modulos[j].id]);
                        contUpdate = updatem.ok ? contUpdate + 1 : contUpdate;
                    }
                }
            }
        }
        if(valuesModulos.length > 0) {
            const sql = sqlInsertModulos + valuesModulos.substring(0, valuesModulos.length - 1) + ";";
            const insertModulos = await consulta(sql, []);
            if(insertModulos.ok) {
                return success({
                    msg: "Registros creados",
                    data: {
                        insert: JSON.stringify(insertModulos.data, (key, value) =>
                            typeof value === "bigint" ? value.toString() + "" : value
                        ),
                        update: `Registros actualizados ${contUpdate}`
                    }
                })
            } else {
                return error({
                    msg: "Error interno del servidor",
                    error: JSON.stringify(insertModulos.error, (key, value) =>
                        typeof value === "bigint" ? value.toString() + "" : value
                    )
                });
            }
        } else {
            return success({
                msg: "Registros creados",
                data: {
                    insert: "Registros creados 0",
                    update: `Registros actualizados ${contUpdate}`
                }
            })
        }
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

module.exports = {
    guardarModulos
}