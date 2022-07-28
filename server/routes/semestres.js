const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    semestresActivos
} = require('../controllers/semestres.controller');

app.get('/activos', verificarToken, semestresActivos);

module.exports = app;