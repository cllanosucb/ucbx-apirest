const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    subirExcelPregrado
} = require('../controllers/upload.controller');

app.put('/excelPregrado', verificarToken, subirExcelPregrado);

module.exports = app;