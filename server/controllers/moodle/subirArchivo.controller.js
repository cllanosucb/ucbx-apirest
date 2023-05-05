require('dotenv').config();
const xlsx = require('xlsx');
const { request, response } = require('express');
const { error, success } = require('./respuestas.moodle.controller');
const { subirArchivo } = require('../../tools/fileupload.tool');
const {
    registrarAsignaturasMoodle

} = require('./moodle.controller');


const subirExcelMoodle = async (req = request, res = response) => {
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
    let fileName = `${user}-${fecha.getDate()}-${fecha.getMonth()}-${fecha.getFullYear()}-${fecha.getHours()}-${fecha.getMinutes()}-${fecha.getSeconds()}`;
    let ruta = `server/uploads/moodle/${fileName}.${extension}`;
    try {
        const respAr = await subirArchivo(archivo, ruta);
        //ruta= ruta del archivo - user=usuario que sube el archivo - tipo_archivo= 1:asignaturas 2:inscripciones
        const respCargaDatos = await cargarDatosExcel(ruta, user, 1);

        //console.log(respCargaDatos);
        return res.status(200).json(success({
            msg: "Resultado de la creación de registros",
            data: respCargaDatos
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

//ruta= ruta del archivo - user=usuario que sube el archivo - tipo_archivo= 1:asignaturas 2:inscripciones
cargarDatosExcel = async (ruta, user, tipo_archivo) => {
    const workbook = xlsx.readFile(ruta);
    //const workbookSheet = workbook.SheetNames;
    const [hoja1] = workbook.SheetNames;
    // const [hoja1, hoja2] = workbook.SheetNames;
    //console.log(workbook.SheetNames); //obtiene los nombres de las hojas
    //console.log(`${hoja1} - ${hoja2}`);
    const datos = xlsx.utils.sheet_to_json(workbook.Sheets[hoja1]);
    if( tipo_archivo = 1) {
        const respInsertAsignaturas = await registrarAsignaturasMoodle(datos, user);
        console.log("respInsertAsignaturas", respInsertAsignaturas);
        return respInsertAsignaturas.ok ? respInsertAsignaturas.data : respInsertAsignaturas.error;
    }
    if( tipo_archivo = 2) {

    }
}

module.exports = {
    subirExcelMoodle
}