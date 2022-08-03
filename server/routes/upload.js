const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    subirExcelPregrado,
    excelPregradoInscripciones
} = require('../controllers/upload.controller');

app.put('/excelPregrado', verificarToken, subirExcelPregrado);

app.put('/excelPregradoInscripciones', verificarToken, excelPregradoInscripciones);

module.exports = app;