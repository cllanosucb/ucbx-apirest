const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    guardarCalificaciones
} = require('../controllers/calificacion.controller');
const {
    validarCamposListCursos
} = require('../middlewares/validar.campos.middleware');

app.post('/guardar', verificarToken, validarCamposListCursos, guardarCalificaciones);

module.exports = app;