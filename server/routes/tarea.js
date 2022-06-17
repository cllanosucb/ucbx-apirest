const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    guardarTareas
} = require('../controllers/tarea.controller');
const {
    validarCamposListCursos
} = require('../middlewares/validar.campos.middleware');

app.post('/guardar', verificarToken, validarCamposListCursos, guardarTareas);

module.exports = app;