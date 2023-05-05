const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    subirExcelPregrado,
    excelPregradoInscripciones,
    excelPregradoInscripcionesPrueba,
    subirExcelPregradoAsignaturasPracticas,
    excelPregradoInscripcionesPracticas,
    subirExcelPostgrado,
    excelPostgradoInscripciones
} = require('../controllers/upload.controller');

const {
    subirExcelMoodle
} = require('../controllers/moodle/subirArchivo.controller')

const {} = require('../controllers/moodle/upload.moodle.controller');

app.put('/excelPregrado', verificarToken, subirExcelPregrado);

app.put('/excelPregradoInscripciones', verificarToken, excelPregradoInscripciones);

app.put('/excelPregradoInscripcionesPrueba', verificarToken, excelPregradoInscripcionesPrueba);

app.put('/excelPregradoPracticas', verificarToken, subirExcelPregradoAsignaturasPracticas);

app.put('/excelPregradoInscripcionesPracticas', verificarToken, excelPregradoInscripcionesPracticas);

// postgrado
app.put('/excelPostgrado', verificarToken, subirExcelPostgrado);

app.put('/excelPostgradoInscripciones', verificarToken, excelPostgradoInscripciones);

/** MOODLE */
//subir archivo de datos de materias
app.put('/moodle/subirExcelMoodle', verificarToken, subirExcelMoodle);
//subir archivo de datos de inscripción
//app.put('/moodle/excelPostgradoInscripciones', verificarToken, excelInscripcionesMoodle);
/** MOODLE */

module.exports = app;