require('dotenv').config();
const db = require('../db/mariadb');
const xlsx = require('xlsx');
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
const { subirArchivo } = require('../tools/fileupload.tool');

const excelEncuestas = async(req = request, res = response) => {
    if (!req.files) {
        return res.status(400).json(error({
            msg: "No se selecciono ningún archivo",
            error: null
        }));
    }
    const user = req.datos.usuario.split('@')[0];
    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];
    //EXTENSIONES
    let extensionesValidas = ['xlsx', 'xls'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json(error({
            msg: "Las extensiones validas son: " + extensionesValidas.join(', '),
            error: null
        }));
    }
    const fecha = new Date();
    let fileName = `encuestas-${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/encuestas/${fileName}.${extension}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        
        const workbook = xlsx.readFile(ruta);
        const [hoja1] = workbook.SheetNames;
        const datosExcel = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
        const respRegistro = await registrarDatos(datosExcel, user);

        return res.json(success({
            msg: 'Archivo subido con éxito',
            data: respRegistro
        }));
    } catch (err) {
        console.log(err);
        return res.status(500).json(error({
            error: {
                msg: "Error interno",
                error: err
            }
        }));
    }
}

registrarDatos = async (datosExcel, user) => {
    let insert = null;
    let contInsert = 0;
    let contUpdate = 0;
    let contErroUpdate = 0;
    const sqlDatos = "SELECT * FROM Encuestas_nova";
    const result = await consulta(sqlDatos, []);
    datosDB = result.ok ? result.data : [];
    sqlInsert = "INSERT INTO Encuestas_nova (lms_id_usuario, link_encuesta, email_ucb, estado_encuesta, fecha_llenado, estado, sede, usuario_registro) VALUES";
    sqlUpdate = "UPDATE Encuestas_nova SET estado_encuesta = ?, fecha_llenado = ?, estado = ? WHERE lms_id_usuario = ?;";
    let valuesInsert = "";
    for (let i = 0; i < datosExcel.length; i++) {
        const encuesta = datosDB.find(d => d.lms_id_usuario == datosExcel[i].lms_id_usuario);
        if (encuesta === undefined) {
            contInsert = contInsert + 1;
            valuesInsert = valuesInsert + encuestasInsert(datosExcel[i], user);
        } else {
            if(datosExcel[i].estado_encuesta != encuesta.estado_encuesta){
                const respUpdate = await consulta(sqlUpdate, encuestasUpdate(datosExcel[i], user));
                contUpdate = respUpdate.ok ? contUpdate + 1 : contErroUpdate + 1;
            }
        }
    }
    const values = valuesInsert.substring(0, valuesInsert.length - 1) + ";";
    if (values.length > 1) {
        const sql = sqlInsert + values;
        insert = await consulta(sql, []);
    }
    return {
        contInsert,
        contUpdate,
        contErroUpdate,
        insert: JSON.stringify(insert, (key, value) =>
            typeof value === "bigint" ? value.toString() + "" : value
        )
    }
}

encuestasUpdate = (d, user) => {
    return [
        d.estado_encuesta,
        d.fecha_llenado === 'N' ? d.fecha_llenado : formatoFecha(d.fecha_llenado, 'DD/MM/YYYY HH:mm:ss'),
        d.estado_encuesta == 0 ? 1 : 0,
        d.lms_id_usuario
    ];
}

encuestasInsert = (d, user) => {
    return `(
        ${d.lms_id_usuario},
        '${d.link_encuesta}',
        '${d.email_ucb}',
        ${d.estado_encuesta},
        ${d.fecha_llenado === 'N' ? null : `'${formatoFecha(d.fecha_llenado, 'DD/MM/YYYY HH:mm:ss')}'`},
        ${d.estado_encuesta == 0 ? 0 : 1},
        '${d.sede}',
        '${user}'
    ),`;
}

desactivarMaterias = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    let respSuccess = [];
    let respError = [];
    const sqlList = `SELECT en.lms_id_usuario, en.email_ucb, en.estado_encuesta, en.estado, me.materias
    FROM Encuestas_nova en, materias_est me
    WHERE en.lms_id_usuario = me.lms_id_est
    AND en.estado_encuesta = 1
    AND en.estado = 1;`;
    const sqlUpdate = "UPDATE Encuestas_nova SET estado = 0 WHERE lms_id_usuario = ?;";
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }

    const respDB = await consulta(sqlList, []);
    const lista = respDB.ok ? respDB.data : [];

    for (let i = 0; i < lista.length; i++) {
        const materias = JSON.parse(lista[i].materias);
        console.log(materias.length);
        for (let j = 0; j < materias.length; j++) {
            if(materias[j] != 3784887) {
                console.log(materias[j]);
                const params = `&class_id=${materias[j]}&user_ids=${lista[i].lms_id_usuario}`;
                const respApi = await apiNeo(llaves.data[0].url_instancia, 'deactivate_students_in_class', llaves.data[0].api_key, params);
                console.log(respApi);
                if(respApi.ok){
                    respSuccess.push({
                        respApi,
                        params
                    });
                    await consulta(sqlUpdate, [lista[i].lms_id_usuario])
                } else {
                    respError.push({
                        respApi,
                        params
                    });
                }
            }
        }
        
    }

    res.json(success({
        msg: 'Resultado de desactivar materias de estudiantes',
        data: {
            desactivarEstudiantes: respSuccess,
            errorDesactivarEstudiantes: respError
        }
    }));

}

activarMaterias = async(req = request, res = response) => {
    const { id_usuario, usuario } = req.datos;
    const user = usuario.split('@')[0];
    let respSuccess = [];
    let respError = [];
    const sqlList = `SELECT en.lms_id_usuario, en.email_ucb, en.estado_encuesta, en.estado, me.materias
    FROM Encuestas_nova en, materias_est me
    WHERE en.lms_id_usuario = me.lms_id_est
    AND en.estado_encuesta = 0
    AND en.estado = 1;`;
    const sqlUpdate = "UPDATE Encuestas_nova SET estado = 0 WHERE lms_id_usuario = ?;";
    const llaves = await llavesPorUsuario(id_usuario);
    if (!llaves.ok) {
        return res.status(500).json(llaves);
    }

    const respDB = await consulta(sqlList, []);
    const lista = respDB.ok ? respDB.data : [];

    for (let i = 0; i < lista.length; i++) {
        const materias = JSON.parse(lista[i].materias);
        console.log(materias.length);
        for (let j = 0; j < materias.length; j++) {
            if(materias[j] != 3784887) {
                console.log(materias[j]);
                const params = `&class_id=${materias[j]}&user_ids=${lista[i].lms_id_usuario}`;
                const respApi = await apiNeo(llaves.data[0].url_instancia, 'reactivate_students_in_class', llaves.data[0].api_key, params);
                console.log(respApi);
                if(respApi.ok){
                    respSuccess.push({
                        respApi,
                        params
                    });
                    await consulta(sqlUpdate, [lista[i].lms_id_usuario])
                } else {
                    respError.push({
                        respApi,
                        params
                    });
                }
            }
        }
        
    }

    res.json(success({
        msg: 'Resultado de activar materias de estudiantes',
        data: {
            desactivarEstudiantes: respSuccess,
            errorDesactivarEstudiantes: respError
        }
    }));

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

const apiNeo = async(url, metodo, api_key, parametros) => {
    try {
        const respAPI = await fetch(`${url}/${metodo}?api_key=${api_key}${parametros}`);
        if(respAPI.ok) {
            const data = await respAPI.json();
            return success(data);
        } else {
            const data = await respAPI.json();
            return error({
                msg: "Error al realizar la petición",
                error: data
            });    
        }
    } catch (err) {
        return error({
            msg: "Error interno del servidor",
            error: err
        });
    }
}

module.exports = {
    excelEncuestas,
    desactivarMaterias,
    activarMaterias
}