require('dotenv').config();
const xlsx = require('xlsx');
const express = require('express');
const db = require('../db/mariadb');
const { request, response } = require('express');
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
const { consulta, peticionNeo } = require('./querys.controller');
const { error, success } = require('./respuestas.controller');
const { subirArchivo } = require('../tools/fileupload.tool');
const { formatoFecha } = require('../tools/util.tools');
const {
    registrarAsignaturasPregrado,
    registrarInscripcionesPregrado
} = require('./pregrado.controller');

const subirExcelPregrado = async(req = request, res = response) => {
    if (!req.files) {
        return res.status(400).json(error({
            msg: "No se selecciono ningun archivo",
            error: null
        }));
    }
    const user = req.datos.usuario.split('@')[0];
    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extencion = nombreArchivo[nombreArchivo.length - 1];
    //EXTENCIONES
    let extencionesValidas = ['xlsx', 'xls'];
    if (extencionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json(error({
            msg: "Las extenciones validas son: " + extencionesValidas.join(', '),
            error: null
        }));
    }
    const fecha = new Date();
    let fileName = `${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/pregrado/${fileName}.${extencion}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        const respCargaDatos = await cargarDatos(ruta, user);
        return res.json(respCargaDatos);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}

cargarDatos = async(ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    //const workbookSheet = workbook.SheetNames;
    const [hoja1, hoja2] = workbook.SheetNames;
    //console.log(workbook.SheetNames); //obtirne los nombres de las hojas
    //console.log(`${hoja1} - ${hoja2}`);
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    const datos1 = xlsx.utils.sheet_to_json(workbook.Sheets[hoja2]);
    const respInsertAsignaturas = await registrarAsignaturasPregrado(datos, user);
    const respInsertInscripciones = await registrarInscripcionesPregrado(datos1, user);
    return success({
        msg: "Resultado de la creacion de registros",
        data: {
            asignaturas: respInsertAsignaturas.data,
            inscripciones: respInsertInscripciones.ok ? respInsertInscripciones.data : respInsertInscripciones.error
        }
    });
}

module.exports = {
    subirExcelPregrado
}