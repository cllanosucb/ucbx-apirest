const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    guardarModulos
} = require('../controllers/modulo.controller');
const {
    validarCamposListCursos
} = require('../middlewares/validar.campos.middleware');

app.post('/guardar', verificarToken, validarCamposListCursos, guardarModulos);

module.exports = app;