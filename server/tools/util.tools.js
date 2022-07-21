const moment = require('moment');

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

module.exports = {
    formatoFecha,
    transformarNomRegional,
    formatoFechaNeo,
    otroFormatoFecha
}