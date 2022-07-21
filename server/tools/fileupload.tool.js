require('dotenv').config();
const {} = require('express-fileupload');
const { error, success } = require('../controllers/respuestas.controller');

const subirArchivo = (archivo = fileUpload.UploadedFile, ruta) => {
    return new Promise((resolve, reject) => {
        archivo.mv(ruta, (err) => {
            if (err) {
                reject(error({
                    msg: "Error al subir el archivo",
                    error: err
                }));
            }
            resolve(success({
                msg: "Archivo subido con exito",
                data: null
            }));
        });
    });
}

module.exports = {
    subirArchivo
}