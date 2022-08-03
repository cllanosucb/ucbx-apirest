const moment = require('moment');
const fs = require('fs');
const { error, success } = require('../controllers/respuestas.controller');

const formatoFecha = (fechaUnix, formato) => {
    const fecha = new Date((fechaUnix - (25567 + 2)) * 86400 * 1000);
    const fechaISO = fecha.toISOString();
    //'YYYY-MM-DD HH:mm:ss'
    const fechaFormateada = moment(fechaISO).utc().format(formato);
    return fechaFormateada;
}

const formatoFechaNeo = (fecha) => {
    const fechaFormateada = moment(fecha).format('DD/MM/YYYY');
    return fechaFormateada;
}

const otroFormatoFecha = (fecha, formato) => {
    const fechaFormateada = moment(fecha).format(formato);
    return fechaFormateada;
}

const transformarNomRegional = (nomReginal) => {
    switch (nomReginal.toUpperCase()) {
        case "SEDE TARIJA":
            return "Regional Tarija"
            break;
        case "SEDE SANTA CRUZ":
            return "Regional Santa Cruz"
            break;
        case "SEDE COCHABAMBA":
            return "Regional Cochabamba"
            break;
        case "SEDE LA PAZ":
            return "Regional La Paz"
            break;
        default:
            return "";
            break;
    }
}

delay = (n) => {
    return new Promise(function(resolve) {
        setTimeout(resolve, n);
    });
}

capitalizar = (text) => {
    return text[0].toUpperCase() + text.toLowerCase().slice(1);
}

guardarCsv = (ruta, datos, host) => {
    try {
        fs.writeFileSync(`server/uploads/paralelos/${ruta}`, datos);
        const rutaArchivo = `${host}/${ruta}`;
        return success({
            msg: "Ruta del archivo CSV",
            ruta: rutaArchivo
        });
    } catch (error) {
        console.log("Cannot write file ", error);
        return error({
            msg: "Error al crear el archivo",
            error: error
        })
    }
}


module.exports = {
    formatoFecha,
    transformarNomRegional,
    formatoFechaNeo,
    otroFormatoFecha,
    delay,
    capitalizar,
    guardarCsv
}