const express = require('express');
const app = express();
const {
    verificarToken
} = require('../middlewares/autenticacion.middleware');
const {
    buscarCurso,
    listaCursos,
    guardarCurso
} = require('../controllers/curso.controller');
const {
    validarCamposArrayCursos
} = require('../middlewares/validar.campos.middleware');

app.get('/buscar', verificarToken, buscarCurso);

app.get('/lista', verificarToken, listaCursos);

app.post('/guardar', verificarToken, validarCamposArrayCursos, guardarCurso);

module.exports = app;