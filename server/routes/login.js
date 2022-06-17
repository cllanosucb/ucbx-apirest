const express = require('express');
const app = express();
const {
    login,
    encriptar,
    revalidarToken
} = require('../controllers/login.controller');
const { validarCamposLogin } = require('../middlewares/validar.campos.middleware');
const { validarToken } = require('../middlewares/autenticacion.middleware');

app.post('/', validarCamposLogin, login);

app.post('/encriptar', encriptar);

app.get('/renovar', validarToken, revalidarToken);

module.exports = app;