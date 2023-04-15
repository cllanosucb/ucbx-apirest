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

app.put('/excelPregrado', verificarToken, subirExcelPregrado);

app.put('/excelPregradoInscripciones', verificarToken, excelPregradoInscripciones);

app.put('/excelPregradoInscripcionesPrueba', verificarToken, excelPregradoInscripcionesPrueba);

app.put('/excelPregradoPracticas', verificarToken, subirExcelPregradoAsignaturasPracticas);

app.put('/excelPregradoInscripcionesPracticas', verificarToken, excelPregradoInscripcionesPracticas);

// postgrado
app.put('/excelPostgrado', verificarToken, subirExcelPostgrado);

app.put('/excelPostgradoInscripciones', verificarToken, excelPostgradoInscripciones);

module.exports = app;