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
    registrarInscripcionesPregrado,
    registrarInscripcionesPregradoPrueba,
    registrarAsignaturasPracticasPregrado,
    registrarInscripcionesPregradoPracticas
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

        //console.log(respCargaDatos);
        return res.status(200).json(success({
            msg: "Resultado de creacion",
            data: JSON.stringify(respCargaDatos.data, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
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

const excelPregradoInscripciones = async(req = request, res = response) => {
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
    let fileName = `i-${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/pregrado/${fileName}.${extencion}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        const respCargaDatos = await cargarDatosInscripciones(ruta, user);
        //console.log(respCargaDatos);
        /* return res.status(200).json(success({
            msg: "Resultado de creacion",
            data: JSON.stringify(respCargaDatos.data, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
        })); */
        return res.json(respCargaDatos);
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

cargarDatos = async(ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    //const workbookSheet = workbook.SheetNames;
    const [hoja1] = workbook.SheetNames;
    // const [hoja1, hoja2] = workbook.SheetNames;
    //console.log(workbook.SheetNames); //obtirne los nombres de las hojas
    //console.log(`${hoja1} - ${hoja2}`);
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    // const datos1 = xlsx.utils.sheet_to_json(workbook.Sheets[hoja2]);
    const respInsertAsignaturas = await registrarAsignaturasPregrado(datos, user);
    // const respInsertInscripciones = await registrarInscripcionesPregrado(datos1, user);
    console.log("respInsertAsignaturas", respInsertAsignaturas);
    // console.log("respInsertInscripciones", respInsertInscripciones);
    return success({
        msg: "Resultado de la creacion de registros",
        data: {
            asignaturas: respInsertAsignaturas.ok ? respInsertAsignaturas.data : respInsertAsignaturas.error,
            //inscripciones: respInsertInscripciones.ok ? respInsertInscripciones.data : respInsertInscripciones.error
        }
    });
}

cargarDatosInscripciones = async(ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    //const workbookSheet = workbook.SheetNames;
    const [hoja1] = workbook.SheetNames;
    //console.log(workbook.SheetNames); //obtirne los nombres de las hojas
    //console.log(`${hoja1} - ${hoja2}`);
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    const respInsertInscripciones = await registrarInscripcionesPregrado(datos, user);
    console.log("respInsertInscripciones", respInsertInscripciones);
    return success({
        msg: "Resultado de la creacion de registros",
        data: {
            inscripciones: respInsertInscripciones.ok ? respInsertInscripciones.data : respInsertInscripciones.error
        }
    });
}


const excelPregradoInscripcionesPrueba = async(req = request, res = response) => {
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
    let fileName = `i-${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/pregrado/${fileName}.${extencion}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        const respCargaDatos = await cargarDatosInscripcionesPrueba(ruta, user);
        if (!respCargaDatos.ok) {
            return res.status(400).json(respCargaDatos);
        }
        return res.json(respCargaDatos);
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


const cargarDatosInscripcionesPrueba = async(ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    //const workbookSheet = workbook.SheetNames;
    const [hoja1] = workbook.SheetNames;
    //console.log(workbook.SheetNames); //obtirne los nombres de las hojas
    //console.log(`${hoja1} - ${hoja2}`);
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    const respInsertInscripciones = await registrarInscripcionesPregradoPrueba(datos, user);
    return respInsertInscripciones;
}

//Asignaturas practicas
const subirExcelPregradoAsignaturasPracticas = async (req = request, res = response) => {
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
    //EXTENSIONES
    let extencionesValidas = ['xlsx', 'xls'];
    if (extencionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json(error({
            msg: "Las extenciones validas son: " + extencionesValidas.join(', '),
            error: null
        }));
    }
    const fecha = new Date();
    let fileName = `${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/pregrado/asgPra-${fileName}.${extencion}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        const respCargaDatos = await cargarDatosAsignaturasPracticas(ruta, user);
        return res.status(200).json(success({
            msg: "Resultado de creación",
            data: JSON.stringify(respCargaDatos.data, (key, value) =>
                typeof value === "bigint" ? value.toString() + "" : value
            )
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

cargarDatosAsignaturasPracticas = async (ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    const [hoja1] = workbook.SheetNames;
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    const respInsertAsignaturas = await registrarAsignaturasPracticasPregrado(datos, user);
    console.log("respInsertAsignaturas", respInsertAsignaturas);
    return success({
        msg: "Resultado de la creación de registros",
        data: {
            asignaturas: respInsertAsignaturas.ok ? respInsertAsignaturas.data : respInsertAsignaturas.error,
        }
    });
}
//Asignaturas practicas

//excelPregradoInscripcionesPracticas
const excelPregradoInscripcionesPracticas = async (req = request, res = response) => {
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
    //EXTENSIONES
    let extencionesValidas = ['xlsx', 'xls'];
    if (extencionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json(error({
            msg: "Las extenciones validas son: " + extencionesValidas.join(', '),
            error: null
        }));
    }
    const fecha = new Date();
    let fileName = `iPra-${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/pregrado/${fileName}.${extencion}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        const respCargaDatos = await cargarDatosInscripcionesPracticas(ruta, user);
        if (!respCargaDatos.ok) {
            return res.status(400).json(respCargaDatos);
        }
        return res.json(respCargaDatos);
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

const cargarDatosInscripcionesPracticas = async (ruta, user) => {
    const workbook = xlsx.readFile(ruta);
    const [hoja1] = workbook.SheetNames;
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    const respInsertInscripciones = await registrarInscripcionesPregradoPracticas(datos, user);
    return respInsertInscripciones;
}
//excelPregradoInscripcionesPracticas

module.exports = {
    subirExcelPregrado,
    excelPregradoInscripciones,
    excelPregradoInscripcionesPrueba,
    subirExcelPregradoAsignaturasPracticas,
    excelPregradoInscripcionesPracticas
}